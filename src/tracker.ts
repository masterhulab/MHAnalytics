export const trackerScript = `
(function() {
  'use strict';

  // --- Configuration & Utilities ---
  var WIN = window;
  var DOC = document;
  var LOC = WIN.location;
  var NAV = WIN.navigator;
  var STORAGE_KEY = '_mh_uid';
  var SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  // 1. Privacy Check (Do Not Track)
  // Respect user's privacy settings
  if (NAV.doNotTrack === '1' || WIN.doNotTrack === '1') {
      return;
  }

  // Safe LocalStorage Helper
  // Prevents crashes if cookies are disabled or storage is full
  var SafeStorage = {
      get: function(key) {
          try { return localStorage.getItem(key); } catch(e) { return null; }
      },
      set: function(key, val) {
          try { localStorage.setItem(key, val); } catch(e) {}
      }
  };

  // Determine API Endpoint
  // Supports data-endpoint attribute or auto-detection from script src
  var currentScript = DOC.currentScript;
  var endpoint = '/api/collect'; // Default fallback
  
  if (currentScript) {
      var attr = currentScript.getAttribute('data-endpoint');
      if (attr) {
          endpoint = attr;
      } else if (currentScript.src) {
          try {
              var url = new URL(currentScript.src);
              endpoint = url.origin + '/api/collect';
          } catch(e) {}
      }
  }

  // Generate or Retrieve Session ID
  // Uses a rotating ID based on activity to group visits into sessions
  function getSessionId() {
      var stored = SafeStorage.get(STORAGE_KEY);
      var now = Date.now();
      var id = '';

      if (stored) {
          try {
              var parsed = JSON.parse(stored);
              if (now - parsed.lastActive < SESSION_DURATION) {
                  id = parsed.id;
              }
          } catch(e) {}
      }

      if (!id) {
          id = Math.random().toString(36).substring(2) + now.toString(36);
      }

      SafeStorage.set(STORAGE_KEY, JSON.stringify({ id: id, lastActive: now }));
      return id;
  }

  // --- Core Functions ---

  // Collect Visit Data
  function collect() {
      var payload = {
          url: LOC.href,
          referrer: DOC.referrer,
          sessionId: getSessionId(),
          width: WIN.screen.width,
          language: NAV.language || NAV.userLanguage
      };
      
      var body = JSON.stringify(payload);
      var sent = false;

      // Prefer sendBeacon for reliability during navigation
      if (NAV.sendBeacon) {
          try {
            var blob = new Blob([body], { type: 'text/plain' });
            sent = NAV.sendBeacon(endpoint, blob);
          } catch(e) {}
      }

      // Fallback to fetch with keepalive
      if (!sent) {
          try {
            fetch(endpoint, { method: 'POST', body: body, keepalive: true }).catch(function(){});
          } catch(e) {}
      }
  }

  // Fetch and Display Public Stats
  function fetchStats() {
      var targets = [];

      // 1. Data Attributes (Recommended)
      var elements = DOC.querySelectorAll('[data-mh-stat]');
      for (var i = 0; i < elements.length; i++) {
          targets.push({ el: elements[i], type: elements[i].getAttribute('data-mh-stat') });
      }

      // 2. IDs (Legacy Support for mh_*)
      var idMap = {
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
      for (var id in idMap) {
          var el = DOC.getElementById(id);
          if (el) targets.push({ el: el, type: idMap[id] });
      }

      if (targets.length === 0) return;

      // Convert endpoint /api/collect -> /api/counts
      var statsEndpoint = endpoint.replace('/collect', '/counts') + '?url=' + encodeURIComponent(LOC.href);
      
      try {
          fetch(statsEndpoint)
              .then(function(res) { return res.json(); })
              .then(function(data) {
                  if (!data || data.error) return;
                  
                  for (var i = 0; i < targets.length; i++) {
                      var item = targets[i];
                      var type = item.type;
                      var value = null;
                      
                      // Normalize type (handle 'pv' as 'page-pv' for backward compat if needed, though usually explicit)
                      if (type === 'pv') type = 'page-pv';
                      if (type === 'uv') type = 'page-uv';

                      if (data.page && type.indexOf('page-') === 0) {
                          var key = type.replace('page-', ''); // pv, uv, today-pv, today-uv
                          if (key === 'today-pv') value = data.page.todayPv;
                          else if (key === 'today-uv') value = data.page.todayUv;
                          else value = data.page[key];
                      } else if (data.site && type.indexOf('site-') === 0) {
                          var key = type.replace('site-', ''); // pv, uv, today-pv, today-uv
                          if (key === 'today-pv') value = data.site.todayPv;
                          else if (key === 'today-uv') value = data.site.todayUv;
                          else value = data.site[key];
                      }
                      
                      if (value !== null && value !== undefined) {
                          item.el.innerText = value;
                          if (item.el.id && item.el.id.indexOf('mh_') === 0) {
                              item.el.style.display = 'inline';
                          }
                      }
                  }
              })
              .catch(function(e) {});
      } catch(e) {}
  }


  // --- Initialization ---
  
  try {
      // 1. Collect immediately (PV)
      collect();

      // 2. Stats - wait for DOM to ensure elements are present
      var retryCount = 0;
      function tryFetchStats() {
          fetchStats();
          if (retryCount++ < 3) {
              setTimeout(tryFetchStats, 1000 * retryCount);
          }
      }

      if (DOC.readyState === 'loading') {
          DOC.addEventListener('DOMContentLoaded', tryFetchStats);
      } else {
          tryFetchStats();
      }

      // 3. SPA Support (History API)
      var history = WIN.history;
      if (history && history.pushState) {
          var originalPush = history.pushState;
          history.pushState = function() {
              var ret = originalPush.apply(this, arguments);
              collect();
              fetchStats();
              return ret;
          };
          WIN.addEventListener('popstate', function() {
              collect();
              fetchStats();
          });
      }
  } catch(e) {
      console.warn('MH Analytics init failed', e);
  }

})();
`;
