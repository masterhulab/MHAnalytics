/**
 * Checks if the user agent corresponds to a known bot or crawler.
 * Includes common search engines and social media crawlers.
 * @param userAgent The User-Agent string from the request header.
 * @returns true if the user agent matches a bot pattern, false otherwise.
 */
export const isBot = (userAgent: string): boolean => {
    const bots = /bot|spider|crawl|slurp|facebook|whatsapp|preview|curl|wget|googlebot|bingbot|yandex|baiduspider|sogou|360spider|bytespider|toutiao|sosospider|yisouspider|headlesschrome|phantomjs|archiver|php|python|perl|go-http-client/i;
    return bots.test(userAgent);
};

/**
 * Parses a comma-separated string into an array of trimmed strings.
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
 * Supports wildcard subdomains (e.g., "*.example.com").
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
        if (o.startsWith('*.')) {
            const domain = o.slice(2);
            try {
                const originUrl = new URL(origin);
                // Matches "sub.example.com" and "example.com" for pattern "*.example.com"
                return originUrl.hostname.endsWith('.' + domain) || originUrl.hostname === domain;
            } catch {
                return false;
            }
        }
        return false;
    });
};

/**
 * Escapes HTML special characters to prevent XSS.
 * @param str The string to escape.
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
 * Validates if a string is a valid URL.
 * @param urlString The string to check.
 * @returns true if valid, false otherwise.
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
 * @param urlString The URL to sanitize.
 * @returns The sanitized URL string.
 */
export const sanitizeUrl = (urlString: string): string => {
    try {
        const url = new URL(urlString);

        // Remove sensitive parameters
        const sensitiveKeys = ['token', 'key', 'password', 'secret', 'access_token', 'auth', 'authorization', 'session_id'];
        sensitiveKeys.forEach(key => url.searchParams.delete(key));

        // Truncate to 2048 characters (common browser limit)
        return url.toString().substring(0, 2048);
    } catch {
        // If invalid, just return truncated original
        return urlString.substring(0, 2048);
    }
};
