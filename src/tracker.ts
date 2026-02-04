export const trackerScript = `
(function() {
  'use strict';

  // --- Environment & Constants ---
  const WIN = window;
  const DOC = document;
  const LOC = WIN.location;
  const NAV = WIN.navigator;
  const STORAGE_KEY = '_mh_uid';
  const SESSION_DURATION = 30 * 60 * 1000;

  // --- Privacy Check ---
  if (NAV.doNotTrack === '1' || WIN.doNotTrack === '1') {
    return;
  }

  // --- Utils ---
  const SafeStorage = {
    get: function(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set: function(key, val) {
      try {
        localStorage.setItem(key, val);
      } catch (e) {}
    }
  };

  // --- Configuration ---
  // Auto-injected by server. If not replaced (e.g. dev), fallback to empty.
  let AUTO_API_DOMAIN = '{{AUTO_API_DOMAIN}}';
  if (AUTO_API_DOMAIN.indexOf('{{') === 0) {
    AUTO_API_DOMAIN = '';
  }

  // Use 'event' instead of 'collect' to avoid ad blockers
  let endpoint = AUTO_API_DOMAIN + '/api/event';
  const currentScript = DOC.currentScript;

  if (currentScript) {
    const attr = currentScript.getAttribute('data-endpoint');
    if (attr) {
      endpoint = attr;
    }
  } else {
    const configScript = DOC.querySelector('script[data-endpoint]');
    if (configScript) {
      endpoint = configScript.getAttribute('data-endpoint');
    }
  }

  // --- Session Management ---
  function getSessionId() {
    const stored = SafeStorage.get(STORAGE_KEY);
    const now = Date.now();
    let id = '';

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (now - parsed.lastActive < SESSION_DURATION) {
          id = parsed.id;
        }
      } catch (e) {}
    }

    if (!id) {
      id = Math.random().toString(36).substring(2) + now.toString(36);
    }
    SafeStorage.set(STORAGE_KEY, JSON.stringify({
      id: id,
      lastActive: now
    }));
    return id;
  }

  // --- Tracking Logic ---
  function collect() {
    const body = JSON.stringify({
      url: LOC.href,
      referrer: DOC.referrer,
      sessionId: getSessionId(),
      width: WIN.screen.width,
      language: NAV.language || NAV.userLanguage
    });

    if (WIN.fetch) {
      fetch(endpoint, {
        method: 'POST',
        body: body,
        keepalive: true
      }).catch(function() {});
    } else if (NAV.sendBeacon) {
      NAV.sendBeacon(endpoint, new Blob([body], {
        type: 'text/plain'
      }));
    }
  }

  // --- Stats Logic ---
  const ID_MAP = {
    'mh_page_pv': 'page-pv',
    'mh_page_uv': 'page-uv',
    'mh_page_today_pv': 'page-today-pv',
    'mh_page_today_uv': 'page-today-uv',
    'mh_site_pv': 'site-pv',
    'mh_site_uv': 'site-uv',
    'mh_site_today_pv': 'site-today-pv',
    'mh_site_today_uv': 'site-today-uv',
    'mh_today_pv': 'site-today-pv',
    'mh_today_uv': 'site-today-uv'
  };

  function fetchStats(callback) {
    const targets = [];
    const elements = DOC.querySelectorAll('[data-mh-stat]');

    for (let i = 0; i < elements.length; i++) {
      targets.push({
        el: elements[i],
        type: elements[i].getAttribute('data-mh-stat')
      });
    }

    for (const k in ID_MAP) {
      const el = DOC.getElementById(k);
      if (el) {
        targets.push({
          el: el,
          type: ID_MAP[k]
        });
      }
    }

    if (!targets.length) {
      return;
    }

    // /api/event -> /api/info
    // Use 'info' instead of 'counts' to avoid ad blockers
    const statsUrl = endpoint.replace(new RegExp('/[^/]+$'), '/info');
    const query = '?url=' + encodeURIComponent(LOC.href);

    function updateUI(data) {
      if (!data || data.error) {
        return;
      }
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        let type = t.type;
        let val = null;

        if (type === 'pv') {
          type = 'page-pv';
        }
        if (type === 'uv') {
          type = 'page-uv';
        }

        const group = type.indexOf('page-') === 0 ? 'page' : 'site';
        let key = type.replace(group + '-', '');

        // Normalize key names to match API response (today-pv -> todayPv)
        if (key.indexOf('today-') === 0) {
          key = 'today' + key.charAt(6).toUpperCase() + key.slice(7);
        }

        if (data[group]) {
          val = data[group][key];
        }
        if (val != null) {
          t.el.innerText = val;
        }
      }
      if (callback) {
        callback(true);
      }
    }

    if (WIN.fetch) {
      fetch(statsUrl + query)
        .then(function(r) {
          return r.json();
        })
        .then(updateUI)
        .catch(function() {
          if (callback) {
            callback(false);
          }
        });
    }
  }

  // --- Initialization ---
  try {
    collect();

    let retry = 0;

    function tryStats() {
      fetchStats(function(success) {
        if (!success && retry++ < 2) {
          setTimeout(tryStats, 1000 * (retry + 1));
        }
      });
    }

    if (DOC.readyState === 'loading') {
      DOC.addEventListener('DOMContentLoaded', tryStats);
    } else {
      tryStats();
    }

    // SPA Support (History API)
    const history = WIN.history;
    if (history && history.pushState) {
      const push = history.pushState;
      history.pushState = function() {
        const ret = push.apply(this, arguments);
        // Delay slightly to allow URL update
        setTimeout(function() {
          collect();
          tryStats();
        }, 0);
        return ret;
      };
      WIN.addEventListener('popstate', function() {
        collect();
        tryStats();
      });
    }
  } catch (e) {}
})();
`;
