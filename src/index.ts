import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { Bindings } from './types';
import { checkOrigin, parseCommaSeparated } from './utils';
import {
    handleDashboard,
    serveTracker,
    serveFavicon,
    handleSetup,
    handleCollectGet,
    handleCollectPost,
    handleStats,
    handlePublicCounts
} from './controllers';

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
// Strategies:
// - Public: Cacheable by anyone
// - max-age=60: Fresh for 1 minute
// - stale-while-revalidate=300: Serve stale content for up to 5 mins while fetching new
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

// Dashboard
app.get('/', cache, handleDashboard);

// Tracker Scripts
app.get('/tracker.js', serveTracker);
app.get('/main.js', serveTracker);

// Favicon
app.get('/favicon.ico', serveFavicon);

// Setup
app.get('/setup', handleSetup);

// Ingest Routes (Data Collection)
// Endpoint: /api/event (Generic name to avoid ad blockers)
app.get('/api/event', handleCollectGet);
app.post('/api/event', handleCollectPost);

// Stats Routes (Data Consumption)
// Endpoint: /api/info (Generic name to avoid ad blockers)
app.get('/api/stats', handleStats);

// Public Counts: Returns PV/UV for a specific page/site
app.get('/api/info', handlePublicCounts);

export default app;
