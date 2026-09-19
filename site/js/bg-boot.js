/**
 * Apply last-known page background before CSS paints to reduce flash of default --bg.
 * content-loader.js updates sessionStorage when Sanity colors load.
 *
 * On the home shell, also decide whether to show the splash before first paint:
 * show on new tab / reload; skip when returning from in-tab site navigation.
 */
(function () {
  'use strict';
  var PREFIX = 'sdv.bg';
  var HOME_ENTERED_KEY = 'sdv.homeEntered';
  try {
    var path = String(window.location.pathname || '/');
    var storageKey = PREFIX;
    var projectMatch = path.match(/\/project\/([^/]+)/);
    var immersiveMatch = path.match(/\/immersive\/([^/]+)/);
    if (projectMatch) storageKey = PREFIX + '.project.' + projectMatch[1];
    else if (immersiveMatch) storageKey = PREFIX + '.immersive.' + immersiveMatch[1];

    var cached = sessionStorage.getItem(storageKey) || sessionStorage.getItem(PREFIX);
    if (cached && /^#[0-9a-fA-F]{6}$/.test(cached)) {
      document.documentElement.style.setProperty('--bg', cached);
    }

    if (!projectMatch && !immersiveMatch) {
      var showSplash = true;
      var nav =
        typeof performance !== 'undefined' &&
        performance.getEntriesByType &&
        performance.getEntriesByType('navigation')[0];
      var isReload = !!(nav && nav.type === 'reload');
      if (!isReload && sessionStorage.getItem(HOME_ENTERED_KEY) === '1') {
        showSplash = false;
      }
      document.documentElement.setAttribute(
        'data-sdv-splash',
        showSplash ? 'show' : 'skip',
      );
    }
  } catch (e) { }
})();
