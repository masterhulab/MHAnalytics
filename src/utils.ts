/**
 * Checks if the user agent corresponds to a known bot or crawler.
 * Includes common search engines, social media crawlers, and HTTP libraries.
 *
 * @param userAgent The User-Agent string from the request header.
 * @returns true if the user agent matches a bot pattern, false otherwise.
 */
export const isBot = (userAgent: string): boolean => {
    // Regex covers common bots: Google, Bing, Yandex, Baidu, Social Media, and specialized crawlers
    const bots = /bot|spider|crawl|slurp|facebook|whatsapp|preview|curl|wget|googlebot|bingbot|yandex|baiduspider|sogou|360spider|bytespider|toutiao|sosospider|yisouspider|headlesschrome|phantomjs|archiver|php|python|perl|go-http-client/i;
    return bots.test(userAgent);
};

/**
 * Parses a comma-separated string into an array of trimmed strings.
 * Useful for parsing environment variables like ALLOWED_ORIGINS or IGNORE_IPS.
 *
 * @param str The comma-separated string (e.g. "a, b, c").
 * @returns An array of strings (e.g. ["a", "b", "c"]). Returns empty array if input is undefined.
 */
export const parseCommaSeparated = (str?: string): string[] => {
    if (!str) {
        return [];
    }
    return str.split(',').map(s => s.trim()).filter(Boolean);
};

/**
 * Validates if a given origin is allowed based on the allowed list.
 * Supports exact matches and wildcard subdomains (e.g., "*.example.com").
 *
 * @param origin The origin to check (e.g. "https://sub.example.com").
 * @param allowed The list of allowed origins or '*' for all.
 * @returns true if allowed, false otherwise.
 */
export const checkOrigin = (origin: string, allowed: string[] | '*'): boolean => {
    if (allowed === '*') {
        return true;
    }
    return allowed.some(o => {
        if (o === origin) {
            return true;
        }
        // Handle wildcard subdomains: *.example.com matches sub.example.com and example.com
        if (o.startsWith('*.')) {
            const domain = o.slice(2);
            try {
                const originUrl = new URL(origin);
                return originUrl.hostname.endsWith('.' + domain) || originUrl.hostname === domain;
            } catch {
                return false;
            }
        }
        return false;
    });
};

/**
 * Escapes HTML special characters to prevent Cross-Site Scripting (XSS).
 * Should be used whenever user-controlled data is rendered in HTML.
 *
 * @param str The string to escape.
 * @returns The escaped HTML string.
 */
export const escapeHtml = (str: string): string => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * Validates if a string is a properly formatted URL.
 *
 * @param urlString The string to check.
 * @returns true if valid URL, false otherwise.
 */
export const isValidUrl = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
};

/**
 * Sanitizes a URL by removing sensitive query parameters and truncating length.
 * Prevents PII leaks and database overflow.
 *
 * @param urlString The URL to sanitize.
 * @returns The sanitized URL string.
 */
export const sanitizeUrl = (urlString: string): string => {
    try {
        const url = new URL(urlString);

        // Remove sensitive parameters that might contain PII or secrets
        const sensitiveKeys = [
            'token', 'key', 'password', 'secret', 'access_token', 'auth',
            'authorization', 'session_id', 'sid', 'jwt'
        ];
        sensitiveKeys.forEach(key => url.searchParams.delete(key));

        // Truncate to 2048 characters (standard browser/CDN limit) to save DB space
        return url.toString().substring(0, 2048);
    } catch {
        // If invalid, just return truncated original to avoid errors
        return urlString.substring(0, 2048);
    }
};
