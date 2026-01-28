import { D1Database } from '@cloudflare/workers-types';
import { VisitRecord } from './types';

/**
 * Service to handle all analytics-related database operations.
 * Encapsulates D1 database interactions and statistical aggregations.
 */
export class AnalyticsService {
  constructor(private db: D1Database) {}

  /**
   * Initializes the database table and indexes.
   * Safe to call multiple times (uses IF NOT EXISTS).
   * Automatically attempts migration for new columns.
   */
  async initialize(): Promise<void> {
    // 1. Create Main Table
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        referrer TEXT,
        user_agent TEXT,
        ip TEXT,
        country TEXT,
        domain TEXT,
        session_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // 2. Create Performance Indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_visits_url ON visits(url)',
      'CREATE INDEX IF NOT EXISTS idx_visits_domain ON visits(domain)',
      'CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id)'
    ];

    // Execute index creation in parallel
    await Promise.all(indexes.map(idx => this.db.prepare(idx).run()));

    // 3. Schema Migration: Ensure 'domain' column exists (for updates from older versions)
    try {
      await this.db.prepare(`ALTER TABLE visits ADD COLUMN domain TEXT`).run();
    } catch (e) {
      // Column likely already exists, ignore error
    }
  }

  /**
   * Records a new visit in the database.
   * @param data The visit data to record.
   */
  async recordVisit(data: VisitRecord): Promise<void> {
    const insertQuery = `INSERT INTO visits (url, referrer, user_agent, ip, country, domain, session_id) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        data.url, 
        data.referrer, 
        data.user_agent, 
        data.ip, 
        data.country, 
        data.domain, 
        data.session_id
    ];

    try {
      await this.db.prepare(insertQuery).bind(...params).run();
    } catch (e: any) {
      // Auto-recovery: If table is missing, initialize and retry
      if (e.message && (e.message.includes('no such table') || e.message.includes('SQLITE_ERROR'))) {
        console.log('[Analytics] Table missing, attempting auto-initialization...');
        await this.initialize();
        await this.db.prepare(insertQuery).bind(...params).run();
      } else {
        throw e;
      }
    }
  }

  /**
   * Retrieves the list of domains that have had visits in the last N days.
   * Used for the domain filter dropdown in the dashboard.
   * @param days Number of days to look back (default: 30).
   * @returns Array of unique domain names.
   */
  async getDomains(days = 30): Promise<string[]> {
    const { results } = await this.db.prepare(
      `SELECT DISTINCT domain FROM visits WHERE timestamp > ? ORDER BY domain`
    ).bind(new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()).all<{ domain: string }>();
    
    return results.map(r => r.domain);
  }

  /**
   * Aggregates statistics for the dashboard.
   * Performs multiple queries to gather summary, charts, and top lists.
   * Optimized to run independent queries in parallel.
   * 
   * @param range The time range filter ('24h', '7d', '30d').
   * @param domainFilter Optional domain to filter by.
   * @param tzOffset Timezone offset in hours (e.g. 8 for UTC+8) for correct "Today" calculations.
   * @returns An object containing summary, charts, and top lists.
   */
  async getStats(range: string, domainFilter?: string, tzOffset: number = 0) {
    // Calculate SQLite offset string for timezone adjustment
    const offsetSql = tzOffset >= 0 ? `+${tzOffset} hours` : `${tzOffset} hours`;
    
    const now = new Date();
    let groupByFormat = '';

    // Determine time range and grouping format
    if (range === '24h') {
      now.setHours(now.getHours() - 24);
      groupByFormat = '%Y-%m-%d %H:00'; // Group by hour
    } else if (range === '7d') {
      now.setDate(now.getDate() - 7);
      groupByFormat = '%Y-%m-%d'; // Group by day
    } else if (range === '30d') {
      now.setDate(now.getDate() - 30);
      groupByFormat = '%Y-%m-%d'; // Group by day
    } else {
      // Default to 24h
      now.setHours(now.getHours() - 24);
      groupByFormat = '%Y-%m-%d %H:00';
    }
    
    const timeString = now.toISOString().replace('T', ' ').split('.')[0];

    // Helper to inject domain filter into queries
    const buildQuery = (base: string) => {
      let query = base;
      const params: any[] = [timeString];
      if (domainFilter) {
          query += ` AND domain = ?`;
          params.push(domainFilter);
      }
      return { query, params };
    };

    // Calculate "Today" start time in UTC
    const nowTz = new Date(Date.now() + tzOffset * 3600 * 1000);
    const todayStartTz = nowTz.toISOString().split('T')[0] + ' 00:00:00';
    const todayStartUtc = new Date(new Date(todayStartTz).getTime() - tzOffset * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0];

    // Prepare all queries
    const qSummary = buildQuery(`SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE timestamp > ?`);
    
    const qToday = buildQuery(`SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE timestamp >= ?`);
    qToday.params[0] = todayStartUtc; // Override time parameter

    const qTopPages = buildQuery(`SELECT url as key, COUNT(*) as count FROM visits WHERE timestamp > ?`);
    const qTopReferrers = buildQuery(`SELECT referrer as key, COUNT(*) as count FROM visits WHERE timestamp > ?`);
    
    const qTopCountries = buildQuery(`SELECT country as key, COUNT(*) as count FROM visits WHERE timestamp > ?`);
    
    // Chart Query
    let chartQuery = `SELECT strftime(?, timestamp, ?) as time, COUNT(*) as count FROM visits WHERE timestamp > ?`;
    const chartParams: any[] = [groupByFormat, offsetSql, timeString];
    if (domainFilter) {
        chartQuery += ` AND domain = ?`;
        chartParams.push(domainFilter);
    }

    // Bounce Rate Query Helper
    const qBounce = buildQuery(`SELECT session_id FROM visits WHERE timestamp > ?`);

    // Top Devices Query
    const qDevices = buildQuery(`SELECT user_agent, COUNT(*) as count FROM visits WHERE timestamp > ?`);

    // Execute queries in parallel
    const [
      summaryResult,
      todayResult,
      topPagesResult,
      topReferrersResult,
      topCountriesResult,
      chartResult,
      bounceResult,
      devicesResult
    ] = await Promise.all([
      this.db.prepare(qSummary.query).bind(...qSummary.params).first() as Promise<any>,
      this.db.prepare(qToday.query).bind(...qToday.params).first() as Promise<any>,
      this.db.prepare(`${qTopPages.query} GROUP BY url ORDER BY count DESC LIMIT 10`).bind(...qTopPages.params).all(),
      this.db.prepare(`${qTopReferrers.query} GROUP BY referrer ORDER BY count DESC LIMIT 10`).bind(...qTopReferrers.params).all(),
      this.db.prepare(`${qTopCountries.query} GROUP BY country ORDER BY count DESC LIMIT 10`).bind(...qTopCountries.params).all(),
      this.db.prepare(`${chartQuery} GROUP BY time ORDER BY time`).bind(...chartParams).all(),
      this.db.prepare(`${qBounce.query} GROUP BY session_id HAVING COUNT(*) = 1`).bind(...qBounce.params).all(),
      this.db.prepare(`${qDevices.query} GROUP BY user_agent ORDER BY count DESC LIMIT 100`).bind(...qDevices.params).all<{ user_agent: string; count: number }>()
    ]);

    // Process Results
    const summary = summaryResult || { pv: 0, uv: 0 };
    const todaySummary = todayResult || { pv: 0, uv: 0 };
    const singlePageSessions = bounceResult.results || [];
    const bounceRate = Math.round(((singlePageSessions.length || 0) / (summary.uv || 1)) * 100);

    // Process User Agents
    const topOS: Record<string, number> = {};
    const topBrowsers: Record<string, number> = {};
    
    // UA Parsers
    const parseOS = (ua: string) => {
        if (/Win/i.test(ua)) return 'Windows';
        if (/Mac/i.test(ua)) {
            if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
            return 'macOS';
        }
        if (/Android/i.test(ua)) return 'Android';
        if (/Linux/i.test(ua)) return 'Linux';
        return 'Other';
    };

    const parseBrowser = (ua: string) => {
        if (/Edg/i.test(ua)) return 'Edge';
        if (/Chrome/i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) return 'Chrome';
        if (/Firefox/i.test(ua)) return 'Firefox';
        if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
        if (/OPR/i.test(ua)) return 'Opera';
        return 'Other';
    };

    for (const row of devicesResult.results) {
        const ua = row.user_agent || '';
        const count = row.count;
        topOS[parseOS(ua)] = (topOS[parseOS(ua)] || 0) + count;
        topBrowsers[parseBrowser(ua)] = (topBrowsers[parseBrowser(ua)] || 0) + count;
    }

    const toSortedArray = (obj: Record<string, number>) => {
        return Object.entries(obj)
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    };
    
    return {
        summary: {
            pv: summary.pv,
            uv: summary.uv,
            bounceRate,
            todayPv: todaySummary.pv,
            todayUv: todaySummary.uv
        },
        topPages: topPagesResult.results,
        topReferrers: topReferrersResult.results,
        topCountries: topCountriesResult.results,
        topOS: toSortedArray(topOS),
        topBrowsers: toSortedArray(topBrowsers),
        chartData: chartResult.results
    };
  }

  /**
   * Retrieves public summary statistics for external display (e.g. blog badges).
   * Optimized to run queries in parallel.
   * 
   * @param domainFilter Optional domain to filter by.
   * @param url Optional specific URL to get page-level stats.
   * @param tzOffset Timezone offset.
   */
  async getPublicSummary(domainFilter?: string, url?: string, tzOffset: number = 0): Promise<any> {
    // 1. Total PV/UV (All time)
    let qTotal = `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits`;
    const pTotal: any[] = [];
    if (domainFilter) {
        qTotal += ` WHERE domain = ?`;
        pTotal.push(domainFilter);
    }
    
    // 2. Today PV/UV (Relative to Timezone)
    const nowTz = new Date(Date.now() + tzOffset * 3600 * 1000);
    const todayStartTz = nowTz.toISOString().split('T')[0] + ' 00:00:00';
    const todayStartUtc = new Date(new Date(todayStartTz).getTime() - tzOffset * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0];
    
    let qToday = `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE timestamp >= ?`;
    const pToday: any[] = [todayStartUtc];
    if (domainFilter) {
        qToday += ` AND domain = ?`;
        pToday.push(domainFilter);
    }

    // 3. Page PV/UV
    let qPage = '';
    const pPage: any[] = [];
    if (url) {
        qPage = `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE url = ?`;
        pPage.push(url);
    }

    // Execute in parallel
    const promises: Promise<any>[] = [
        this.db.prepare(qTotal).bind(...pTotal).first(),
        this.db.prepare(qToday).bind(...pToday).first()
    ];

    if (url) {
        promises.push(this.db.prepare(qPage).bind(...pPage).first());
    }

    const [totalResult, todayResult, pageResult] = await Promise.all(promises);

    return {
        total: totalResult || { pv: 0, uv: 0 },
        today: todayResult || { pv: 0, uv: 0 },
        page: pageResult || { pv: 0, uv: 0 }
    };
  }
}
