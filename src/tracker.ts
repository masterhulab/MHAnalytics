export const trackerScript = `
(function() {
  'use strict';
  var d = document;
  var w = window;
  var s = d.currentScript;
  // If data-endpoint is provided, use it. Otherwise, construct absolute URL based on script source.
  var endpoint = '/lib/pixel.gif';
  if (s) {
      var attr = s.getAttribute('data-endpoint');
      if (attr) {
          endpoint = attr;
      } else if (s.src) {
          try {
              var url = new URL(s.src);
              endpoint = url.origin + '/lib/pixel.gif';
          } catch (e) {}
      }
  }
  var k = '_usid';
  
  function g() {
    try {
        var v = localStorage.getItem(k);
        var t = Date.now();
        if (v) {
            var p = JSON.parse(v);
            if (t - p.t < 1800000) {
                localStorage.setItem(k, JSON.stringify({ i: p.i, t: t }));
                return p.i;
            }
        }
        var n = Math.random().toString(36).substring(2) + t.toString(36);
        localStorage.setItem(k, JSON.stringify({ i: n, t: t }));
        return n;
    } catch (e) {
        return 'u-' + Math.random().toString(36).substring(2);
    }
  }

  function c() {
    var payload = { 
        u: w.location.href, 
        r: d.referrer, 
        s: g() 
    };
    
    if (navigator.sendBeacon) {
        var b = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
        navigator.sendBeacon(endpoint, b);
    } else {
        fetch(endpoint, { 
            method: 'POST', 
            body: JSON.stringify(payload), 
            keepalive: true 
        }).catch(function(){});
    }
  }

  function f() {
    var ids = ['mh_today_pv', 'mh_today_uv', 'mh_site_pv', 'mh_site_uv', 'mh_page_pv', 'mh_page_uv'];
    var els = {};
    var has = false;
    for (var i = 0; i < ids.length; i++) {
        var el = d.getElementById(ids[i]);
        if (el) { els[ids[i]] = el; has = true; }
    }
    
    if (!has) return;
    
    var u = endpoint.replace('/lib/pixel.gif', '/api/status')
             .replace('/lib/ping', '/api/status')
             .replace('/lib/pixel', '/api/status')
             .replace('/api/event', '/api/status')
             .replace('/api/collect', '/api/status');
             
    if (u.indexOf('/api/status') === -1) {
        // If endpoint was custom and didn't match replacements, try to guess or use origin
         if (u.indexOf('http') === 0) {
            var urlObj = new URL(u);
            u = urlObj.origin + '/api/status';
         } else {
            u = '/api/status';
         }
    }

    var q = '?url=' + encodeURIComponent(w.location.href) + '&domain=' + encodeURIComponent(w.location.hostname);
    
    fetch(u + q).then(function(r) { return r.json(); }).then(function(data) {
        if (els['mh_today_pv']) els['mh_today_pv'].textContent = data.today.pv;
        if (els['mh_today_uv']) els['mh_today_uv'].textContent = data.today.uv;
        if (els['mh_site_pv']) els['mh_site_pv'].textContent = data.total.pv;
        if (els['mh_site_uv']) els['mh_site_uv'].textContent = data.total.uv;
        if (els['mh_page_pv']) els['mh_page_pv'].textContent = data.page.pv;
        if (els['mh_page_uv']) els['mh_page_uv'].textContent = data.page.uv;
    }).catch(function(err) { console.error(err); });
  }
  
  // Trigger immediately
  c();
  f();
  
  // Handle SPA (Single Page Application) navigation
  var h = history;
  var ps = h.pushState;
  h.pushState = function() {
      ps.apply(this, arguments);
      c();
      f();
  };
  w.addEventListener('popstate', function() {
      c();
      f();
  });
})();
`;
