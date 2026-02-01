export const trackerScript = `
(function() {
  'use strict';

  const WIN = window;
  const DOC = document;
  const LOC = WIN.location;
  const NAV = WIN.navigator;
  const STORAGE_KEY = '_mh_uid';
  const SESSION_DURATION = 30 * 60 * 1000;

  // Privacy Check
  if (NAV.doNotTrack === '1' || WIN.doNotTrack === '1') return;

  const SafeStorage = {
      get: function(key) {
          try {
              return localStorage.getItem(key);
          } catch(e) {
              return null;
          }
      },
      set: function(key, val) {
          try {
              localStorage.setItem(key, val);
          } catch(e) {}
      }
  };

  const currentScript = DOC.currentScript;
  
  // Auto-injected by server. If not replaced (e.g. dev), fallback to empty.
  // Use var for function scope to allow reassignment.
  var AUTO_API_DOMAIN = '{{AUTO_API_DOMAIN}}';
  if (AUTO_API_DOMAIN.indexOf('{{') === 0) AUTO_API_DOMAIN = '';
  
  let endpoint = AUTO_API_DOMAIN + '/api/event';

  if (currentScript) {
      const attr = currentScript.getAttribute('data-endpoint');
      if (attr) endpoint = attr;
  } else {
      const configScript = DOC.querySelector('script[data-endpoint]');
      if (configScript) {
          endpoint = configScript.getAttribute('data-endpoint');
      }
  }

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
          } catch(e) {}
      }

      if (!id) {
          id = Math.random().toString(36).substring(2) + now.toString(36);
      }
      SafeStorage.set(STORAGE_KEY, JSON.stringify({ id: id, lastActive: now }));
      return id;
  }

  function collect() {
      const body = JSON.stringify({
          url: LOC.href,
          referrer: DOC.referrer,
          sessionId: getSessionId(),
          width: WIN.screen.width,
          language: NAV.language || NAV.userLanguage
      });

      if (WIN.fetch) {
          fetch(endpoint, { method: 'POST', body: body, keepalive: true })
              .then(function(res) { if (!res.ok) throw res; })
              .catch(function() {
                  const STR_COLLECT = '/c' + 'ollect';
                  const fallback = endpoint.replace(/\\/event$/, STR_COLLECT);
                  if (fallback === endpoint) return;
                  fetch(fallback, { method: 'POST', body: body, keepalive: true }).catch(function(){});
              });
      } else if (NAV.sendBeacon) {
          NAV.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }));
      }
  }

  function fetchStats(callback) {
      const targets = [];
      const elements = DOC.querySelectorAll('[data-mh-stat]');
      for (let i = 0; i < elements.length; i++) {
          targets.push({ el: elements[i], type: elements[i].getAttribute('data-mh-stat') });
      }

      const idMap = {
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

      for (const k in idMap) {
          const el = DOC.getElementById(k);
          if (el) targets.push({ el: el, type: idMap[k] });
      }

      if (!targets.length) return;

      const statsUrl = endpoint.replace(new RegExp('/[^/]+$'), '/info');
      const query = '?url=' + encodeURIComponent(LOC.href);

      function updateUI(data) {
          if (!data || data.error) return;
          for (let i = 0; i < targets.length; i++) {
              const t = targets[i];
              let type = t.type;
              let val = null;
              
              if (type === 'pv') type = 'page-pv';
              if (type === 'uv') type = 'page-uv';

              const group = type.indexOf('page-') === 0 ? 'page' : 'site';
              let key = type.replace(group + '-', '');
              if (key === 'today-pv') key = 'todayPv';
              if (key === 'today-uv') key = 'todayUv';

              if (data[group]) val = data[group][key];
              if (val != null) t.el.innerText = val;
          }
          if (callback) callback(true);
      }

      try {
          fetch(statsUrl + query)
              .then(function(r){ return r.json(); })
              .then(updateUI)
              .catch(function() {
                  const STR_COUNTS = '/c' + 'ounts';
                  const alt = statsUrl.replace('/info', STR_COUNTS);
                  fetch(alt + query)
                      .then(function(r){ return r.json(); })
                      .then(updateUI)
                      .catch(function(){ if (callback) callback(false); });
              });
      } catch(e) {}
  }

  try {
      collect();
      let retry = 0;
      function tryStats() {
          fetchStats(function(success) {
              if (!success && retry++ < 2) setTimeout(tryStats, 1000 * (retry + 1));
          });
      }
      if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', tryStats);
      else tryStats();

      const history = WIN.history;
      if (history && history.pushState) {
          const push = history.pushState;
          history.pushState = function() {
              const ret = push.apply(this, arguments);
              collect();
              tryStats();
              return ret;
          };
          WIN.addEventListener('popstate', function() {
              collect();
              tryStats();
          });
      }
  } catch(e) {}
})();
`;
