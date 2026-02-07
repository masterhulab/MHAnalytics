import { Context } from 'hono';
import { trackerScript } from './tracker';
import { getDashboardHtml } from './dashboard';
import { Bindings, CollectPayload } from './types';
import { AnalyticsService } from './analytics';
import { isBot, checkOrigin, parseCommaSeparated, escapeHtml, isValidUrl, sanitizeUrl } from './utils';

const FAVICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>';

/**
 * Validates the API Key for protected routes.
 *
 * Logic:
 * 1. If API_KEY is NOT set in environment:
 *    - If required=true (e.g., /setup): Fails (returns false).
 *    - If required=false (e.g., /api/stats): Passes (returns true). Public mode.
 * 2. If API_KEY IS set:
 *    - Checks against query param 'key' or Bearer token.
 *
 * @param c The Hono context.
 * @param required Whether authentication is strictly required.
 * @returns true if authorized, false otherwise.
 */
export const validateApiKey = (c: Context<{ Bindings: Bindings }>, required: boolean = true): boolean => {
    // If no API Key is configured in the environment:
    if (!c.env.API_KEY) {
        // If auth is required (e.g. setup), fail.
        // If auth is optional (e.g. public dashboard), pass.
        return !required;
    }

    const apiKey = c.req.query('key') || c.req.header('Authorization')?.replace('Bearer ', '');
    return apiKey === c.env.API_KEY;
};

/**
 * Serves the HTML dashboard.
 */
export const handleDashboard = (c: Context<{ Bindings: Bindings }>) => {
    const siteName = escapeHtml(c.env.SITE_NAME || 'MHAnalytics');
    const authorName = escapeHtml(c.env.AUTHOR_NAME || 'masterhulab');

    const html = getDashboardHtml({
        appTitle: siteName,
        footerText: authorName,
        faviconSvg: FAVICON_SVG,
        startYear: 2026,
        requireAuth: !!c.env.API_KEY
    });

    return c.html(html);
};

/**
 * Serves the client-side tracker script.
 * Dynamically injects the API origin.
 */
export const serveTracker = (c: Context) => {
    const origin = new URL(c.req.url).origin;
    const script = trackerScript.replace('{{AUTO_API_DOMAIN}}', origin);

    return c.body(script, 200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 mins cache
    });
};

/**
 * Serves the SVG favicon.
 */
export const serveFavicon = (c: Context) => {
    return c.body(
        FAVICON_SVG,
        200,
        { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }
    );
};

/**
 * Initializes the database.
 */
export const handleSetup = async (c: Context<{ Bindings: Bindings }>) => {
    if (!validateApiKey(c)) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const analytics = new AnalyticsService(c.env.DB);
    await analytics.initialize();
    return c.json({ status: 'ok', message: 'Database initialized' });
};

/**
 * Core logic for processing a visit event.
 * Used by both GET and POST handlers.
 */
const processEvent = async (c: Context<{ Bindings: Bindings }>, data: {
    url: string;
    referrer?: string;
    sessionId?: string;
}): Promise<Response> => {
    const { url: rawUrl, referrer: rawReferrer, sessionId: rawSessionId } = data;

    if (!rawUrl) {
        return c.json({ error: 'Missing URL' }, 400);
    }

    // Validation & Sanitization
    if (!isValidUrl(rawUrl)) {
        return c.json({ error: 'Invalid URL' }, 400);
    }
    const url = sanitizeUrl(rawUrl);

    const userAgent = c.req.header('User-Agent') || 'Unknown';
    if (isBot(userAgent)) {
        return c.json({ status: 'ignored', reason: 'bot' });
    }

    const ip = c.req.header('CF-Connecting-IP') || '0.0.0.0';
    const country = c.req.header('CF-IPCountry') || 'XX';

    // Check Ignore List (IP)
    const ignoredIps = parseCommaSeparated(c.env.IGNORE_IPS || '');
    if (ignoredIps.includes(ip)) {
        return c.json({ status: 'ignored', reason: 'ip' });
    }

    let domain = '';
    try {
        const u = new URL(url);
        domain = u.hostname;

        // Check Ignore List (Path)
        const ignoredPaths = parseCommaSeparated(c.env.IGNORE_PATHS || '');
        if (ignoredPaths.some(p => u.pathname.startsWith(p))) {
            return c.json({ status: 'ignored', reason: 'path' });
        }
    } catch {
        domain = 'unknown';
    }

    // Sanitize sessionId: alphanumeric only, max 64 chars
    const sessionId = rawSessionId
        ? rawSessionId.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 64)
        : Math.random().toString(36).substring(2, 15);

    const referrer = rawReferrer ? sanitizeUrl(rawReferrer) : '';

    // Process
    const analytics = new AnalyticsService(c.env.DB);
    try {
        await analytics.recordVisit({
            url,
            referrer,
            user_agent: userAgent,
            ip,
            country,
            domain,
            session_id: sessionId
        });
        return c.json({ status: 'ok' }, 201);
    } catch (e: any) {
        console.error('Ingest Error:', e);
        return c.json({ error: 'Ingest Failed' }, 500);
    }
};

/**
 * Handles data collection via GET request.
 */
export const handleCollectGet = async (c: Context<{ Bindings: Bindings }>) => {
    return processEvent(c, {
        url: c.req.query('u') || c.req.query('url') || '',
        referrer: c.req.query('r') || c.req.query('referrer') || '',
        sessionId: c.req.query('s') || c.req.query('sessionId')
    });
};

/**
 * Handles data collection via POST request.
 */
export const handleCollectPost = async (c: Context<{ Bindings: Bindings }>) => {
    // Check Allowed Origins
    const allowedOrigins = parseCommaSeparated(c.env.ALLOWED_ORIGINS);
    if (allowedOrigins.length > 0) {
        const origin = c.req.header('Origin');
        const referer = c.req.header('Referer');
        let requestOrigin = origin;
        if (!requestOrigin && referer) {
            try {
                requestOrigin = new URL(referer).origin;
            } catch {}
        }

        if (requestOrigin && !checkOrigin(requestOrigin, allowedOrigins)) {
            return c.json({ status: 'ignored', reason: 'origin_mismatch' }, 403);
        }
    }

    let payload: CollectPayload;
    try {
        payload = await c.req.json();
    } catch {
        // Fallback for text/plain
        try {
            const text = await c.req.text();
            payload = JSON.parse(text);
        } catch {
            return c.json({ error: 'Invalid JSON' }, 400);
        }
    }

    return processEvent(c, {
        url: payload.url,
        referrer: payload.referrer,
        sessionId: payload.sessionId
    });
};

/**
 * Handles stats retrieval.
 */
export const handleStats = async (c: Context<{ Bindings: Bindings }>) => {
    if (!validateApiKey(c, false)) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const range = c.req.query('range') || '24h';
    const domain = c.req.query('domain');
    const tzOffset = parseInt(c.env.TZ_OFFSET || '8');
    const analytics = new AnalyticsService(c.env.DB);

    try {
        const data = await analytics.getDashboardStats(range, domain, tzOffset);
        return c.json(data);
    } catch (e: any) {
        console.error('Stats Error:', e);
        return c.json({ error: 'Stats Failed' }, 500);
    }
};

/**
 * Handles public visit counts retrieval.
 */
export const handlePublicCounts = async (c: Context<{ Bindings: Bindings }>) => {
    const rawUrl = c.req.query('url');
    if (!rawUrl) {
        return c.json({ error: 'Missing URL' }, 400);
    }

    if (!isValidUrl(rawUrl)) {
        return c.json({ error: 'Invalid URL' }, 400);
    }
    const url = sanitizeUrl(rawUrl);

    let domain = '';
    try {
        domain = new URL(url).hostname;
    } catch {
        return c.json({ error: 'Invalid URL' }, 400);
    }

    const analytics = new AnalyticsService(c.env.DB);
    const tzOffset = parseInt(c.env.TZ_OFFSET || '8');
    try {
        const counts = await analytics.getPublicCounts(domain, url, tzOffset);
        return c.json(counts);
    } catch (e: any) {
        console.error('Counts Error:', e);
        return c.json({ error: 'Counts Failed' }, 500);
    }
};
