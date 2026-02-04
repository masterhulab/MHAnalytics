import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { trackerScript } from './tracker';
import { getDashboardHtml } from './dashboard';
import { Bindings, CollectPayload } from './types';
import { AnalyticsService } from './analytics';
import { isBot, checkOrigin, parseCommaSeparated, escapeHtml, isValidUrl, sanitizeUrl } from './utils';

const FAVICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>';

const app = new Hono<{ Bindings: Bindings }>();

// --- Security Headers Middleware ---
app.use('*', async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
});

// --- Global Error Handler ---
app.onError((err, c) => {
    console.error(`[Analytics Error] ${err.message}`, err);
    return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// --- Helpers ---

const validateApiKey = (c: Context, required: boolean = true): boolean => {
    if (!c.env.API_KEY) {
        return !required;
    }

    const apiKey = c.req.query('key') || c.req.header('Authorization')?.replace('Bearer ', '');
    return apiKey === c.env.API_KEY;
};

// --- Middlewares ---

// CORS: Handles Cross-Origin Resource Sharing
app.use('/*', async (c, next) => {
    const corsMiddleware = cors({
        origin: (origin) => {
            const allowed = c.env.ALLOWED_ORIGINS || '*';
            const allowedOrigins = parseCommaSeparated(allowed);
            if (allowed === '*') {
                return origin;
            }
            return checkOrigin(origin, allowedOrigins) ? origin : null;
        },
        credentials: true,
    });
    return corsMiddleware(c, next);
});

// Cache: Applies aggressive caching for GET requests
const cache = async (c: Context, next: Next) => {
    if (c.req.method !== 'GET') {
        return next();
    }
    await next();
    if (c.res.status === 200) {
        c.header('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    }
};

// --- Route Handlers ---

// Dashboard: Serves the HTML dashboard
app.get('/', cache, (c) => {
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
});

// Tracker Scripts: Serves client-side JS
const serveTracker = (c: Context) => {
    const origin = new URL(c.req.url).origin;
    const script = trackerScript.replace('{{AUTO_API_DOMAIN}}', origin);

    return c.body(script, 200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 mins cache
    });
};

app.get('/tracker.js', serveTracker);
app.get('/main.js', serveTracker);
app.get('/mha.main.js', serveTracker);

// Favicon: Serves SVG favicon
app.get('/favicon.ico', (c) => {
    return c.body(
        FAVICON_SVG,
        200,
        { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }
    );
});

// Setup: Initialize Database
app.get('/setup', async (c) => {
    if (!validateApiKey(c)) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const analytics = new AnalyticsService(c.env.DB);
    await analytics.initialize();
    return c.json({ status: 'ok', message: 'Database initialized' });
});

// Ingest Handler (GET)
const handleCollectGet = async (c: Context) => {
    // 1. Extract Data
    const rawUrl = c.req.query('u') || c.req.query('url');
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

    const rawReferrer = c.req.query('r') || c.req.query('referrer') || '';
    const referrer = rawReferrer ? sanitizeUrl(rawReferrer) : '';

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

    const rawSessionId = c.req.query('s') || c.req.query('sessionId');
    // Sanitize sessionId: alphanumeric only, max 64 chars
    const sessionId = rawSessionId 
        ? rawSessionId.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 64) 
        : Math.random().toString(36).substring(2, 15);

    // 2. Process
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

// Ingest Handler (POST)
const handleCollectPost = async (c: Context) => {
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
        // Fallback for text/plain (sendBeacon often sends as text/plain or empty content-type)
        try {
            const text = await c.req.text();
            payload = JSON.parse(text);
        } catch {
            return c.json({ error: 'Invalid JSON' }, 400);
        }
    }

    const { url: rawUrl, referrer: rawReferrer, sessionId: rawSessionId } = payload;
    if (!rawUrl) {
        return c.json({ error: 'Missing URL' }, 400);
    }

    // Validation & Sanitization
    if (!isValidUrl(rawUrl)) {
        return c.json({ error: 'Invalid URL' }, 400);
    }
    const url = sanitizeUrl(rawUrl);
    const referrer = rawReferrer ? sanitizeUrl(rawReferrer) : '';

    // Sanitize sessionId
    const sessionId = rawSessionId 
        ? rawSessionId.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 64) 
        : Math.random().toString(36).substring(2, 15);

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

// --- Ingest Routes (Data Collection) ---
// Endpoint: /api/event (Generic name to avoid ad blockers)
app.get('/api/event', handleCollectGet);
app.post('/api/event', handleCollectPost);


// --- Stats Routes (Data Consumption) ---
// Endpoint: /api/info (Generic name to avoid ad blockers)
app.get('/api/stats', async (c) => {
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
});

// Public Counts Handler
const handleCounts = async (c: Context) => {
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

// Public Counts: Returns PV/UV for a specific page/site
app.get('/api/info', handleCounts);


export default app;
