import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { trackerScript } from './tracker';
import { getDashboardHtml } from './dashboard';
import { Bindings, CollectPayload } from './types';
import { AnalyticsService } from './analytics';
import { isBot, checkOrigin, parseCommaSeparated, escapeHtml } from './utils';

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
    if (!c.env.API_KEY) return !required;
    
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
            if (allowed === '*') return origin;
            return checkOrigin(origin, allowedOrigins) ? origin : null;
        },
        credentials: true,
    });
    return corsMiddleware(c, next);
});

// Cache: Applies aggressive caching for GET requests
const cache = async (c: Context, next: Next) => {
    if (c.req.method !== 'GET') return next();
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
    return c.body(trackerScript, 200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    });
};

app.get('/script.js', serveTracker);
app.get('/client.js', serveTracker);
app.get('/tracker.js', serveTracker);
app.get('/lib/core.js', serveTracker);

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
    if (!validateApiKey(c)) return c.json({ error: 'Unauthorized' }, 401);
    const analytics = new AnalyticsService(c.env.DB);
    await analytics.initialize();
    return c.json({ status: 'ok', message: 'Database initialized' });
});

// Ingest Handler (GET)
const handleCollectGet = async (c: Context) => {
    // 1. Extract Data
    const url = c.req.query('u');
    if (!url) return c.json({ error: 'Missing URL' }, 400);

    const userAgent = c.req.header('User-Agent') || 'Unknown';
    if (isBot(userAgent)) return c.json({ status: 'ignored', reason: 'bot' });

    const referrer = c.req.query('r') || '';
    const ip = c.req.header('CF-Connecting-IP') || '0.0.0.0';
    const country = c.req.header('CF-IPCountry') || 'XX';

    // Check Ignore List (IP)
    const ignoredIps = parseCommaSeparated(c.env.IGNORE_IPS || '');
    if (ignoredIps.includes(ip)) return c.json({ status: 'ignored', reason: 'ip' });

    let domain = '';
    try {
        const u = new URL(url);
        domain = u.hostname;
        
        // Check Ignore List (Path)
        const ignoredPaths = parseCommaSeparated(c.env.IGNORE_PATHS || '');
        if (ignoredPaths.some(p => u.pathname.startsWith(p))) return c.json({ status: 'ignored', reason: 'path' });
    } catch {
        domain = 'unknown';
    }

    const sessionId = c.req.query('s') || Math.random().toString(36).substring(2, 15);

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

    const { url, referrer, sessionId } = payload;
    if (!url) return c.json({ error: 'Missing URL' }, 400);

    const userAgent = c.req.header('User-Agent') || 'Unknown';
    if (isBot(userAgent)) return c.json({ status: 'ignored', reason: 'bot' });

    const ip = c.req.header('CF-Connecting-IP') || '0.0.0.0';
    const country = c.req.header('CF-IPCountry') || 'XX';

    // Check Ignore List (IP)
    const ignoredIps = parseCommaSeparated(c.env.IGNORE_IPS || '');
    if (ignoredIps.includes(ip)) return c.json({ status: 'ignored', reason: 'ip' });

    let domain = '';
    try {
        const u = new URL(url);
        domain = u.hostname;

        // Check Ignore List (Path)
        const ignoredPaths = parseCommaSeparated(c.env.IGNORE_PATHS || '');
        if (ignoredPaths.some(p => u.pathname.startsWith(p))) return c.json({ status: 'ignored', reason: 'path' });
    } catch {
        domain = 'unknown';
    }

    const analytics = new AnalyticsService(c.env.DB);
    try {
        await analytics.recordVisit({
            url,
            referrer: referrer || '',
            user_agent: userAgent,
            ip,
            country,
            domain,
            session_id: sessionId || Math.random().toString(36).substring(2, 15)
        });
        return c.json({ status: 'ok' }, 201);
    } catch (e: any) {
        console.error('Ingest Error:', e);
        return c.json({ error: 'Ingest Failed' }, 500);
    }
};

// Ingest: Collects analytics data (GET - Simple Pixel)
app.get('/api/collect', handleCollectGet);
app.get('/api/event', handleCollectGet); // Alias for ad-blocker evasion

// Ingest: Collects analytics data (POST - JSON/Beacon)
app.post('/api/collect', handleCollectPost);
app.post('/api/event', handleCollectPost); // Alias for ad-blocker evasion

// Stats: Returns aggregated data for dashboard
app.get('/api/stats', async (c) => {
    if (!validateApiKey(c, false)) return c.json({ error: 'Unauthorized' }, 401);

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

// Public Counts: Returns PV/UV for a specific page/site (Public API)
app.get('/api/counts', async (c) => {
    const url = c.req.query('url');
    if (!url) return c.json({ error: 'Missing URL' }, 400);

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
});

export default app;
