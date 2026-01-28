import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { trackerScript } from './tracker';
import { dashboardHtml } from './dashboard';
import { Bindings, VisitRecord } from './types';
import { AnalyticsService } from './analytics';
import { isBot, checkOrigin, parseCommaSeparated, escapeHtml } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

// --- Global Error Handler ---
app.onError((err, c) => {
    console.error(`[Analytics Error] ${err.message}`, err);
    return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// --- Helpers ---

const validateApiKey = (c: Context, required: boolean = true): boolean => {
    if (!c.env.API_KEY && required) return false;
    if (!required && !c.env.API_KEY) return true; // Not configured, open access (warn user elsewhere)
    
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
const cache = async (c: any, next: any) => {
  if (c.req.method !== 'GET') return next();
  await next();
  if (c.res.status === 200) {
      c.header('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
  }
};

// --- Routes ---

// Dashboard: Serves the HTML dashboard
app.get('/', cache, (c) => {
  let html = dashboardHtml;
  const rawSiteName = c.env.SITE_NAME || 'Analytics';
  const siteName = escapeHtml(rawSiteName);
  const rawAuthorName = c.env.AUTHOR_NAME || 'Master Hu';
  const authorName = escapeHtml(rawAuthorName);
  
  html = html.replace(/<title>Analytics<\/title>/g, `<title>${siteName}</title>`)
             .replace(/data-i18n="title">Analytics<\/h1>/g, `data-i18n="title">${siteName}</h1>`)
             .replace(/>Master Hu<\/span>/g, `>${authorName}</span>`)
             .replace(/>MH Analytics<\/h1>/g, `>${siteName}</h1>`);
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
app.get('/lib/core.js', serveTracker); // Obfuscated alias

// Favicon: Serves SVG favicon
app.get('/favicon.ico', (c) => {
    return c.body(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>',
        200,
        { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }
    );
});

// Setup: Initialize Database
app.get('/setup', async (c) => {
    const url = new URL(c.req.url);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    if (!isLocal) {
        if (!c.env.API_KEY) return c.text('Setup requires API_KEY to be configured.', 403);
        if (!validateApiKey(c)) return c.text('Unauthorized', 401);
    }

    try {
        const analytics = new AnalyticsService(c.env.DB);
        await analytics.initialize();
        return c.text('Database initialized successfully.');
    } catch (e: any) {
        return c.text('Failed to initialize database: ' + e.message, 500);
    }
});

// Collect Handler: Unified logic for recording visits
async function handleCollect(c: any) {
  try {
    let body: any;
    const contentType = c.req.header('Content-Type');
    
    if (contentType && contentType.includes('application/json')) {
      body = await c.req.json();
    } else {
      const text = await c.req.text();
      try { body = JSON.parse(text); } catch (e) { return c.json({ error: 'Invalid JSON' }, 400); }
    }

    const { url, referrer, sessionId, u, r, s } = body;
    const finalUrl = url || u;
    const finalReferrer = referrer || r;
    const finalSessionId = sessionId || s;

    const userAgent = c.req.header('User-Agent') || '';
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const country = c.req.header('CF-IPCountry') || 'unknown';

    // 1. Bot Filtering
    if (isBot(userAgent)) {
        console.log(`[Analytics] Ignored Bot: ${userAgent}`);
        return c.json({ status: 'ignored', reason: 'bot' });
    }

    // 2. IP Filtering
    if (c.env.IGNORE_IPS) {
        const ignoreIps = parseCommaSeparated(c.env.IGNORE_IPS);
        if (ignoreIps.includes(ip)) {
            console.log(`[Analytics] Ignored IP: ${ip}`);
            return c.json({ status: 'ignored', reason: 'ip' });
        }
    }

    // 3. Path/URL Filtering
    if (!finalUrl) return c.json({ error: 'Missing URL' }, 400);
    
    if (c.env.IGNORE_PATHS) {
        const ignorePaths = parseCommaSeparated(c.env.IGNORE_PATHS);
        if (ignorePaths.some(p => finalUrl.includes(p))) {
            console.log(`[Analytics] Ignored Path: ${finalUrl}`);
            return c.json({ status: 'ignored', reason: 'path' });
        }
    }

    let domain = '';
    try { domain = new URL(finalUrl).hostname; } catch (e) { domain = 'unknown'; }

    const visitData: VisitRecord = {
        url: finalUrl,
        referrer: finalReferrer || '',
        user_agent: userAgent,
        ip,
        country,
        domain,
        session_id: finalSessionId || ''
    };

    const analytics = new AnalyticsService(c.env.DB);
    await analytics.recordVisit(visitData);

    console.log(`[Analytics] Recorded visit: ${finalUrl} (IP: ${ip})`);
    return c.json({ status: 'ok' });
  } catch (e: any) {
    console.error('[Analytics] Error recording visit:', e);
    // Don't expose internal details to client in production, but for now it's helpful
    return c.json({ error: 'Internal Server Error' }, 500); 
  }
}

// Data Collection Endpoints
app.post('/lib/ping', handleCollect);
app.post('/lib/pixel', handleCollect);
app.post('/lib/pixel.gif', handleCollect);
app.post('/api/collect', handleCollect);
app.post('/api/event', handleCollect); // Direct handling instead of internal redirect for efficiency

// Friendly GET messages
const friendlyMsg = (c: Context) => c.json({ message: 'This endpoint expects POST requests with analytics data.', status: 'ok' });
app.get('/api/event', friendlyMsg);
app.get('/api/collect', friendlyMsg);
app.get('/lib/ping', (c) => c.json({ message: 'Pong.', status: 'ok' }));

// Stats API: JSON data for dashboard
app.get('/api/stats', cache, async (c) => {
  if (c.env.API_KEY && !validateApiKey(c)) return c.json({ error: 'Unauthorized' }, 401);

  const range = c.req.query('range') || '24h';
  const domainFilter = c.req.query('domain');
  const tzOffset = parseFloat(c.env.TZ_OFFSET || '8');
  const analytics = new AnalyticsService(c.env.DB);

  try {
      const stats = await analytics.getStats(range, domainFilter, tzOffset);
      const domains = await analytics.getDomains();
      
      return c.json({ ...stats, domains });
  } catch (e: any) {
      // Auto-Initialize logic fallback
      const urlObj = new URL(c.req.url);
      const isLocal = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
      const isNoTableError = e.message && (e.message.includes('no such table') || e.message.includes('SQLITE_ERROR'));
      
      if (isNoTableError) {
          console.log('Missing table detected. Returning empty stats.');
          return c.json({
              summary: { pv: 0, uv: 0, bounceRate: 0, todayPv: 0, todayUv: 0 },
              domains: [],
              topPages: [],
              topReferrers: [],
              topCountries: [],
              topOS: [],
              topBrowsers: [],
              chartData: []
          });
      }
      throw e; // Let global error handler catch it
  }
});

// Public Status API: Lightweight summary
app.get('/api/status', cache, async (c) => {
    const domainFilter = c.req.query('domain');
    const url = c.req.query('url');
    const tzOffset = parseFloat(c.env.TZ_OFFSET || '0');
    const analytics = new AnalyticsService(c.env.DB);
    
    const data = await analytics.getPublicSummary(domainFilter, url, tzOffset);
    return c.json(data);
});

export default app;
