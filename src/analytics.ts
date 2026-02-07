import { D1Database } from '@cloudflare/workers-types';
import { VisitRecord, KeyValueStat, ChartData, DashboardStats } from './types';

// SQL Query Constants
const SQL = {
  CREATE_TABLE: `
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
  `,
  MIGRATE_ADD_DOMAIN: `ALTER TABLE visits ADD COLUMN domain TEXT`,
  INSERT_VISIT: `INSERT INTO visits (url, referrer, user_agent, ip, country, domain, session_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  GET_DOMAINS: `SELECT DISTINCT domain FROM visits WHERE timestamp > ? ORDER BY domain`,
  STATS: {
    SUMMARY: `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE timestamp > ?`,
    TODAY: `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE timestamp >= ?`,
    TOP_PAGES: `SELECT url as key, COUNT(*) as count FROM visits WHERE timestamp > ?`,
    TOP_REFERRERS: `SELECT referrer as key, COUNT(*) as count FROM visits WHERE timestamp > ?`,
    TOP_COUNTRIES: `SELECT country as key, COUNT(*) as count FROM visits WHERE timestamp > ?`,
    CHART: `SELECT strftime(?, timestamp, ?) as time, COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE timestamp > ?`,
    BOUNCE: `SELECT session_id FROM visits WHERE timestamp > ?`,
    DEVICES: `SELECT user_agent, COUNT(*) as count FROM visits WHERE timestamp > ?`
  },
  PUBLIC: {
    PAGE: `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE domain = ? AND url = ?`,
    SITE: `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE domain = ?`,
    PAGE_TODAY: `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE domain = ? AND url = ? AND timestamp >= ?`,
    SITE_TODAY: `SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv FROM visits WHERE domain = ? AND timestamp >= ?`
  }
} as const;

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
    await this.db.prepare(SQL.CREATE_TABLE).run();

    // 2. Schema Migration: Ensure 'domain' column exists (for updates from older versions)
    // MUST run before index creation to prevent "no such column" errors
    try {
      await this.db.prepare(SQL.MIGRATE_ADD_DOMAIN).run();
    } catch (e) {
      // Column likely already exists, ignore error
    }

    // 3. Create Performance Indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_visits_url ON visits(url)',
      'CREATE INDEX IF NOT EXISTS idx_visits_domain ON visits(domain)',
      'CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_visits_referrer ON visits(referrer)',
      'CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country)',
      'CREATE INDEX IF NOT EXISTS idx_visits_user_agent ON visits(user_agent)',
      'CREATE INDEX IF NOT EXISTS idx_visits_domain_timestamp ON visits(domain, timestamp)'
    ];

    // Execute index creation in parallel
    await Promise.all(indexes.map(idx => this.db.prepare(idx).run()));
  }

  /**
   * Records a new visit in the database.
   * Handles auto-initialization of the table if it doesn't exist.
   *
   * @param data The visit data to record.
   * @throws Error if insertion fails after recovery attempt.
   */
  async recordVisit(data: VisitRecord): Promise<void> {
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
      await this.db.prepare(SQL.INSERT_VISIT).bind(...params).run();
    } catch (e: any) {
      // Auto-recovery: If table is missing, initialize and retry
      // This makes the system self-healing for fresh deployments
      if (e.message && (e.message.includes('no such table') || e.message.includes('SQLITE_ERROR'))) {
        console.log('[Analytics] Table missing, attempting auto-initialization...');
        await this.initialize();
        await this.db.prepare(SQL.INSERT_VISIT).bind(...params).run();
      } else {
        throw e;
      }
    }
  }

  /**
   * Retrieves the list of domains that have had visits in the last N days.
   * Used for the domain filter dropdown in the dashboard.
   *
   * @param days Number of days to look back (default: 365).
   * @returns Array of unique domain names sorted alphabetically.
   */
  async getDomains(days = 365): Promise<string[]> {
    // Default to 1 year lookback to ensure most relevant domains are shown
    const { results } = await this.db.prepare(SQL.GET_DOMAINS)
      .bind(new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .all<{ domain: string }>();

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
  async getDashboardStats(range: string, domainFilter?: string, tzOffset: number = 0): Promise<DashboardStats> {
    const { timeString, groupByFormat } = this.getTimeRangeParams(range);
    const offsetSql = this.getOffsetSql(tzOffset);
    const todayStartUtc = this.getTodayStartUtc(tzOffset);

    // Helper to inject domain filter into queries
    const buildQuery = (base: string) => {
      let query = base;
      const params: unknown[] = [timeString];
      if (domainFilter) {
          query += ` AND domain = ?`;
          params.push(domainFilter);
      }
      return { query, params };
    };

    // Prepare all queries
    const qSummary = buildQuery(SQL.STATS.SUMMARY);

    const qToday = buildQuery(SQL.STATS.TODAY);
    qToday.params[0] = todayStartUtc; // Override time parameter

    const qTopPages = buildQuery(SQL.STATS.TOP_PAGES);
    const qTopReferrers = buildQuery(SQL.STATS.TOP_REFERRERS);
    const qTopCountries = buildQuery(SQL.STATS.TOP_COUNTRIES);
    const qBounce = buildQuery(SQL.STATS.BOUNCE);
    const qDevices = buildQuery(SQL.STATS.DEVICES);

    // Chart Query Logic
    let chartQuery = SQL.STATS.CHART;
    const chartParams: unknown[] = [groupByFormat, offsetSql, timeString];
    if (domainFilter) {
        chartQuery += ` AND domain = ?`;
        chartParams.push(domainFilter);
    }

    // Execute queries in parallel
    const [
      summaryResult,
      todayResult,
      topPagesResult,
      topReferrersResult,
      topCountriesResult,
      chartResult,
      bounceResult,
      devicesResult,
      domainsResult
    ] = await Promise.all([
      this.db.prepare(qSummary.query).bind(...qSummary.params).first<{ pv: number; uv: number }>(),
      this.db.prepare(qToday.query).bind(...qToday.params).first<{ pv: number; uv: number }>(),
      this.db.prepare(`${qTopPages.query} GROUP BY url ORDER BY count DESC LIMIT 10`).bind(...qTopPages.params).all<KeyValueStat>(),
      this.db.prepare(`${qTopReferrers.query} GROUP BY referrer ORDER BY count DESC LIMIT 10`).bind(...qTopReferrers.params).all<KeyValueStat>(),
      this.db.prepare(`${qTopCountries.query} GROUP BY country ORDER BY count DESC LIMIT 10`).bind(...qTopCountries.params).all<KeyValueStat>(),
      this.db.prepare(`${chartQuery} GROUP BY time ORDER BY time`).bind(...chartParams).all<ChartData>(),
      this.db.prepare(`${qBounce.query} GROUP BY session_id HAVING COUNT(*) = 1`).bind(...qBounce.params).all(),
      this.db.prepare(`${qDevices.query} GROUP BY user_agent ORDER BY count DESC LIMIT 100`).bind(...qDevices.params).all<{ user_agent: string; count: number }>(),
      this.getDomains()
    ]);

    // Process Results
    const summary = summaryResult || { pv: 0, uv: 0 };
    const todaySummary = todayResult || { pv: 0, uv: 0 };
    const singlePageSessions = bounceResult.results || [];
    const bounceRate = Math.round(((singlePageSessions.length || 0) / (summary.uv || 1)) * 100);

    const { topOS, topBrowsers } = this.processUserAgents(devicesResult.results);

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
        topOS,
        topBrowsers,
        chartData: chartResult.results,
        domains: domainsResult
    };
  }

  /**
   * Retrieves public visit counts for a specific URL and its domain.
   * Used for displaying stats on the client's website (e.g., "Views: 100").
   *
   * @param domain The domain name (e.g., "example.com").
   * @param url The specific page URL.
   * @param tzOffset Timezone offset in hours (e.g. 8 for UTC+8).
   */
  async getPublicCounts(domain: string, url: string, tzOffset: number = 0): Promise<{
      page: { pv: number, uv: number, todayPv: number, todayUv: number },
      site: { pv: number, uv: number, todayPv: number, todayUv: number }
  }> {
      const todayStartUtc = this.getTodayStartUtc(tzOffset);

      const [pageResult, siteResult, pageTodayResult, siteTodayResult] = await Promise.all([
          this.db.prepare(SQL.PUBLIC.PAGE).bind(domain, url).first<{ pv: number; uv: number }>(),
          this.db.prepare(SQL.PUBLIC.SITE).bind(domain).first<{ pv: number; uv: number }>(),
          this.db.prepare(SQL.PUBLIC.PAGE_TODAY).bind(domain, url, todayStartUtc).first<{ pv: number; uv: number }>(),
          this.db.prepare(SQL.PUBLIC.SITE_TODAY).bind(domain, todayStartUtc).first<{ pv: number; uv: number }>()
      ]);

      return {
          page: {
              pv: pageResult?.pv || 0,
              uv: pageResult?.uv || 0,
              todayPv: pageTodayResult?.pv || 0,
              todayUv: pageTodayResult?.uv || 0
          },
          site: {
              pv: siteResult?.pv || 0,
              uv: siteResult?.uv || 0,
              todayPv: siteTodayResult?.pv || 0,
              todayUv: siteTodayResult?.uv || 0
          }
      };
  }

  // --- Private Helpers ---

  /**
   * Calculates time range parameters based on the selected range filter.
   */
  private getTimeRangeParams(range: string): { timeString: string, groupByFormat: string } {
    let now = new Date();
    let groupByFormat = '';

    switch (range) {
      case '24h':
        now.setHours(now.getHours() - 24);
        groupByFormat = '%Y-%m-%d %H:00';
        break;
      case '7d':
        now.setDate(now.getDate() - 7);
        groupByFormat = '%Y-%m-%d';
        break;
      case '30d':
        now.setDate(now.getDate() - 30);
        groupByFormat = '%Y-%m-%d';
        break;
      case '3m':
        now.setMonth(now.getMonth() - 3);
        groupByFormat = '%Y-%m-%d';
        break;
      case '6m':
        now.setMonth(now.getMonth() - 6);
        groupByFormat = '%Y-%m-%d';
        break;
      case '1y':
        now.setFullYear(now.getFullYear() - 1);
        groupByFormat = '%Y-%m';
        break;
      case 'all':
        now = new Date(0);
        groupByFormat = '%Y-%m';
        break;
      default:
        now.setHours(now.getHours() - 24);
        groupByFormat = '%Y-%m-%d %H:00';
    }

    return {
      timeString: now.toISOString().replace('T', ' ').split('.')[0],
      groupByFormat
    };
  }

  /**
   * Calculates the UTC start time of the current day in the user's timezone.
   */
  private getTodayStartUtc(tzOffset: number): string {
    const nowTz = new Date(Date.now() + tzOffset * 3600 * 1000);
    const todayStartTz = nowTz.toISOString().split('T')[0] + ' 00:00:00';
    return new Date(new Date(todayStartTz).getTime() - tzOffset * 3600 * 1000).toISOString().replace('T', ' ').split('.')[0];
  }

  /**
   * Generates SQLite offset string for timezone adjustment.
   */
  private getOffsetSql(tzOffset: number): string {
    return tzOffset >= 0 ? `+${tzOffset} hours` : `${tzOffset} hours`;
  }

  /**
   * Processes raw user agent counts into sorted OS and Browser lists.
   */
  private processUserAgents(results: { user_agent: string; count: number }[]): { topOS: KeyValueStat[], topBrowsers: KeyValueStat[] } {
    const topOS: Record<string, number> = {};
    const topBrowsers: Record<string, number> = {};

    for (const row of results) {
        const ua = row.user_agent || '';
        const count = row.count;
        const os = this.parseOS(ua);
        const browser = this.parseBrowser(ua);

        topOS[os] = (topOS[os] || 0) + count;
        topBrowsers[browser] = (topBrowsers[browser] || 0) + count;
    }

    const toSortedArray = (obj: Record<string, number>): KeyValueStat[] => {
        return Object.entries(obj)
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    };

    return {
      topOS: toSortedArray(topOS),
      topBrowsers: toSortedArray(topBrowsers)
    };
  }

  /**
   * Parses the User-Agent string to determine the Operating System.
   * Simple regex-based detection for major platforms.
   *
   * @param ua The User-Agent string.
   * @returns The detected OS name (e.g., "Windows", "iOS", "Android") or "Other".
   */
  private parseOS(ua: string): string {
      if (/Win/i.test(ua)) {
          return 'Windows';
      }
      if (/Mac/i.test(ua)) {
          if (/iPhone|iPad|iPod/i.test(ua)) {
              return 'iOS';
          }
          return 'macOS';
      }
      if (/Android/i.test(ua)) {
          return 'Android';
      }
      if (/Linux/i.test(ua)) {
          return 'Linux';
      }
      return 'Other';
  }

  /**
   * Parses the User-Agent string to determine the Browser.
   * Order of checks matters (e.g., Chrome check excludes Edge/Opera).
   *
   * @param ua The User-Agent string.
   * @returns The detected Browser name or "Other".
   */
  private parseBrowser(ua: string): string {
      if (/Edg/i.test(ua)) {
          return 'Edge';
      }
      if (/Chrome/i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) {
          return 'Chrome';
      }
      if (/Firefox/i.test(ua)) {
          return 'Firefox';
      }
      if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
          return 'Safari';
      }
      if (/OPR/i.test(ua)) {
          return 'Opera';
      }
      return 'Other';
  }
}
