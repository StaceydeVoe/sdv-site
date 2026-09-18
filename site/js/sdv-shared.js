/**
 * Shared helpers: path prefixes, preview query params, material icons.
 * Loaded before content-loader.js and app.js.
 *
 * rootPrefix/assetUrl infer the static site root from this script URL so assets
 * resolve correctly whether the site is served from a domain root or a subpath.
 */
(function () {
  'use strict';

  var cachedSiteRootFromScript = '';

  /**
   * Optional override when autodetection fails (e.g. unusual script URLs):
   *   window.SDV_SITE_ROOT = 'https://example.com/';
   */
  function configuredSiteRoot() {
    try {
      var w = window.SDV_SITE_ROOT;
      if (w == null || !String(w).trim()) return '';
      var u = String(w).trim().replace(/\/?$/, '/');
      if (/^https?:\/\//i.test(u)) return u;
      if (u.charAt(0) === '/') return window.location.origin + u.replace(/\/?$/, '/');
    } catch (e) { }
    return '';
  }

  /** Site root URL (with trailing slash) derived from where sdv-shared.js was loaded from. */
  function siteRootFromSharedScript() {
    if (cachedSiteRootFromScript) return cachedSiteRootFromScript;
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (!src || src.indexOf('sdv-shared.js') === -1) continue;
      try {
        var u = new URL(src);
        var p = u.pathname;
        var marker = '/js/sdv-shared.js';
        var idx = p.toLowerCase().lastIndexOf(marker);
        if (idx === -1) continue;
        var rootPath = p.slice(0, idx + 1);
        cachedSiteRootFromScript = u.origin + rootPath;
        return cachedSiteRootFromScript;
      } catch (err) { }
    }
    return '';
  }

  function effectiveSiteRoot() {
    return configuredSiteRoot() || siteRootFromSharedScript();
  }

  function pathnameDirname(pathname) {
    var p = String(pathname || '/').replace(/\/+$/, '') || '/';
    if (p === '/') return '/';
    var slash = p.lastIndexOf('/');
    if (slash <= 0) return '/';
    return p.slice(0, slash) || '/';
  }

  function getPathDepth() {
    var parts = (window.location.pathname || '').split('/').filter(Boolean);
    return parts.length;
  }

  /**
   * Relative prefix from this page's directory to the static site root (for prefix + 'images/...').
   * Falls back to ../ per URL segment when script-based root is unknown.
   */
  function rootPrefix() {
    var absRoot = effectiveSiteRoot();
    if (!absRoot) {
      return '../'.repeat(getPathDepth());
    }
    try {
      var rootUrl = new URL(absRoot);
      var rootPath = rootUrl.pathname.replace(/\/?$/, '') || '/';
      var curDir = pathnameDirname(window.location.pathname);
      var curParts = curDir === '/' ? [] : curDir.split('/').filter(Boolean);
      var rootParts = rootPath === '/' ? [] : rootPath.split('/').filter(Boolean);
      var i = 0;
      while (i < curParts.length && i < rootParts.length && curParts[i] === rootParts[i]) {
        i++;
      }
      var ups = curParts.length - i;
      var rest = rootParts.slice(i);
      var out = '../'.repeat(ups) + rest.join('/');
      if (out && !out.endsWith('/')) out += '/';
      return out;
    } catch (e2) {
      return '../'.repeat(getPathDepth());
    }
  }

  /** Resolve a site-relative asset path (works on GitHub Pages project sites, not only domain root). */
  function assetUrl(path) {
    var s = String(path || '');
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('/')) s = s.slice(1);
    var root = effectiveSiteRoot();
    if (root) {
      return root.replace(/\/?$/, '/') + s;
    }
    return rootPrefix() + s;
  }

  /** True when the iframe URL includes preview query params (Presentation / visual editing). */
  function isPreviewEnabled() {
    try {
      var qs = new URLSearchParams(window.location.search || '');
      if (qs.get('sdvPreview') === '1') return true;
      if (qs.has('sanity-preview-perspective')) return true;
    } catch (e) { }
    return false;
  }

  function withPreviewQuery(path) {
    if (!isPreviewEnabled()) return path;
    var s = String(path || '');
    var joiner = s.includes('?') ? '&' : '?';
    var out = s.indexOf('sdvPreview=1') === -1 ? s + joiner + 'sdvPreview=1' : s;
    joiner = '&';
    try {
      var cur = new URLSearchParams(window.location.search || '');
      var persp = cur.get('sanity-preview-perspective');
      if (persp && out.indexOf('sanity-preview-perspective=') === -1) {
        out += joiner + 'sanity-preview-perspective=' + encodeURIComponent(persp);
      }
    } catch (e) { }
    return out;
  }

  function slugifyKey(input) {
    return String(input || '')
      .trim()
      .toLowerCase()
      .replace(/[\u2019']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeProjectSlug(raw) {
    if (raw && typeof raw === 'object' && raw.current) return String(raw.current).trim();
    return String(raw || '').trim();
  }

  var MATERIAL_CATALOG = {};
  var MATERIAL_CATALOG_ORDER = [];

  /** Built-in SVG files under site/icons/ (used when Sanity has no uploaded icon). */
  var BUILTIN_MATERIAL_ICON_FILES = {
    glass: 'icons/glass.svg',
    textile: 'icons/textile.svg',
    metal: 'icons/metal.svg',
    performance: 'icons/performance.svg',
    objects: 'icons/objects.svg',
    sound: 'icons/sound.svg',
    printmaking: 'icons/printmaking.svg',
    lens: 'icons/lens.svg',
    'moving-image': 'icons/moving-image.svg',
  };

  var MATERIAL_LABELS = {
    glass: 'Glass',
    textile: 'Textile',
    metal: 'Metal',
    performance: 'Performance',
    objects: 'Objects',
    sound: 'Sound',
    printmaking: 'Printmaking',
    lens: 'Lens',
    'moving-image': 'Moving image',
  };

  function escapeAttr(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function applyMaterialCatalog(entries) {
    if (!Array.isArray(entries)) return;
    MATERIAL_CATALOG_ORDER = [];
    entries.forEach(function (e) {
      if (!e || !e.key) return;
      var k = String(e.key);
      MATERIAL_CATALOG[k] = {
        label: String(e.label || k),
        iconUrl: String(e.iconUrl || e.icon || '').trim(),
      };
      MATERIAL_LABELS[k] = MATERIAL_CATALOG[k].label;
      MATERIAL_CATALOG_ORDER.push(k);
    });
  }

  function isKnownMaterialKey(key) {
    var k = String(key || '');
    if (Object.prototype.hasOwnProperty.call(MATERIAL_CATALOG, k)) return true;
    return Object.prototype.hasOwnProperty.call(MATERIAL_LABELS, k);
  }

  function resolveMaterialKey(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (isKnownMaterialKey(s)) return s;
    var catalogKeys = Object.keys(MATERIAL_CATALOG);
    var i;
    var sl = s.toLowerCase();
    for (i = 0; i < catalogKeys.length; i++) {
      var ck = catalogKeys[i];
      if (String(MATERIAL_CATALOG[ck].label || '').toLowerCase() === sl) return ck;
    }
    var asKey = slugifyKey(s);
    if (isKnownMaterialKey(asKey)) return asKey;
    return canonicalMaterialKey(asKey, s);
  }

  function canonicalMaterialKey(rawKey, label) {
    var k = String(rawKey || '').toLowerCase();
    if (isKnownMaterialKey(k)) return k;
    var l = String(label || '').toLowerCase();
    var s = (k + ' ' + l).trim();

    if (/\bglass\b/.test(s)) return 'glass';
    if (/\btextile\b|\bfabric\b|\bduvetyne\b|\bmolton\b|\btartan\b|\byarn\b|\bthread\b/.test(s)) return 'textile';
    if (/\bmetal\b|\bsteel\b|\biron\b|\bhardware\b|\baluminum\b|\baluminium\b|\bbrass\b|\bcopper\b/.test(s)) return 'metal';
    if (/\bperformance\b|\bmovement\b|\bscore\b|\bdance\b/.test(s)) return 'performance';
    if (/\bsound\b|\baudio\b|\bvoice\b/.test(s)) return 'sound';
    if (/\bprintmaking\b|\bprint\b|\blithograph\b|\bscreenprint\b|\betching\b/.test(s)) return 'printmaking';
    if (/\blens\b|\bphotography\b|\bphoto\b|\bcamera\b/.test(s)) return 'lens';
    if (/\bmoving[\s-]?image\b|\bvideo\b|\bfilm\b|\bcinema\b|\ba-v\b|\ba\/v\b/.test(s)) return 'moving-image';
    if (/\bobjects?\b|\bdisplay\b|\bpackaging\b|\bpodium\b|\bshelving\b|\bmannequin\b|\bfound\b/.test(s)) return 'objects';
    return rawKey;
  }

  function canonicalMaterialLabel(key) {
    var k = String(key || '');
    if (MATERIAL_LABELS[k]) return MATERIAL_LABELS[k];
    return k.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function builtinMaterialIconUrl(key) {
    var rel = BUILTIN_MATERIAL_ICON_FILES[String(key || '')];
    if (!rel) return '';
    return assetUrl(rel);
  }

  function materialIconUrl(key) {
    var k = String(key || '');
    var entry = MATERIAL_CATALOG[k];
    if (entry && entry.iconUrl) return entry.iconUrl;
    return builtinMaterialIconUrl(k);
  }

  function materialIconSvg(key) {
    var url = materialIconUrl(key);
    if (!url) {
      return '<span class="home-material-icon home-material-icon--missing" aria-hidden="true"></span>';
    }
    return (
      '<img class="home-material-icon" src="' +
      escapeAttr(url) +
      '" alt="" width="18" height="18" decoding="async" />'
    );
  }

  function renderMaterialIcons(keys) {
    if (!Array.isArray(keys) || !keys.length) return '';
    var html = '';
    keys.forEach(function (k) {
      if (!k) return;
      html += materialIconSvg(String(k));
    });
    return html;
  }

  function isPublicationFall(fall) {
    if (!fall || typeof fall !== 'object') return false;
    if (fall.isPublication === true) return true;
    var label = String(fall.label || '')
      .trim()
      .toLowerCase();
    return label === 'publication';
  }

  function findPublicationPanel(falls) {
    var list = Array.isArray(falls) ? falls : [];
    var flagged = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].isPublication === true) {
        if (flagged !== -1) return null;
        flagged = i;
      }
    }
    if (flagged !== -1) {
      return { panel: list[flagged], index: flagged };
    }
    for (var j = 0; j < list.length; j++) {
      if (isPublicationFall(list[j])) {
        return { panel: list[j], index: j };
      }
    }
    return null;
  }

  function projectHasPublicationImmersive(falls) {
    var hit = findPublicationPanel(falls);
    if (!hit || !hit.panel) return false;
    var imgs = hit.panel.images;
    return Array.isArray(imgs) && imgs.length > 0;
  }

  function isSanityCdnImageUrl(url) {
    return /^https:\/\/cdn\.sanity\.io\/images\//i.test(String(url || ''));
  }

  /** Append Sanity image pipeline params (resize, WebP/AVIF, quality). */
  function sanityImageUrl(url, params) {
    var s = String(url || '');
    if (!isSanityCdnImageUrl(s)) return s;
    try {
      var u = new URL(s);
      var keys = Object.keys(params || {});
      for (var i = 0; i < keys.length; i++) {
        u.searchParams.set(keys[i], String(params[keys[i]]));
      }
      return u.toString();
    } catch (e) {
      return s;
    }
  }

  /** Immersive viewer: capped width, modern format — not full archival originals. */
  function immersiveImageDisplayUrl(url) {
    return sanityImageUrl(url, { w: '2560', auto: 'format', q: '80', fit: 'max' });
  }

  /** Fast blurred placeholder while display size downloads. */
  function immersiveImagePreviewUrl(url) {
    return sanityImageUrl(url, { w: '640', auto: 'format', q: '55', blur: '12' });
  }

  function getMaterialCatalogEntries() {
    return MATERIAL_CATALOG_ORDER.map(function (k) {
      return {
        key: k,
        label: MATERIAL_CATALOG[k].label,
        iconUrl: MATERIAL_CATALOG[k].iconUrl || '',
      };
    });
  }

  function siteRootHref() {
    var absRoot = effectiveSiteRoot();
    if (absRoot) {
      try {
        var u = new URL(absRoot);
        var p = u.pathname.replace(/\/+$/, '');
        return p ? p + '/' : '/';
      } catch (e) { }
    }
    var depth = getPathDepth();
    return depth ? '../'.repeat(depth) : './';
  }

  function whenFontsReady() {
    if (!document.fonts || !document.fonts.ready) {
      return Promise.resolve();
    }
    return Promise.race([
      document.fonts.ready,
      new Promise(function (resolve) {
        setTimeout(resolve, 1500);
      }),
    ]);
  }

  function revealPendingView(viewEl) {
    if (!viewEl || !viewEl.classList.contains('is-content-pending')) return;
    whenFontsReady().then(function () {
      requestAnimationFrame(function () {
        viewEl.classList.remove('is-content-pending');
      });
    });
  }

  window.SDV = {
    whenFontsReady: whenFontsReady,
    revealPendingView: revealPendingView,
    siteRootHref: siteRootHref,
    getPathDepth: getPathDepth,
    rootPrefix: rootPrefix,
    assetUrl: assetUrl,
    isPreviewEnabled: isPreviewEnabled,
    withPreviewQuery: withPreviewQuery,
    slugifyKey: slugifyKey,
    normalizeProjectSlug: normalizeProjectSlug,
    resolveMaterialKey: resolveMaterialKey,
    isKnownMaterialKey: isKnownMaterialKey,
    canonicalMaterialKey: canonicalMaterialKey,
    canonicalMaterialLabel: canonicalMaterialLabel,
    applyMaterialCatalog: applyMaterialCatalog,
    getMaterialCatalogEntries: getMaterialCatalogEntries,
    materialIconSvg: materialIconSvg,
    renderMaterialIcons: renderMaterialIcons,
    isPublicationFall: isPublicationFall,
    findPublicationPanel: findPublicationPanel,
    projectHasPublicationImmersive: projectHasPublicationImmersive,
    isSanityCdnImageUrl: isSanityCdnImageUrl,
    sanityImageUrl: sanityImageUrl,
    immersiveImageDisplayUrl: immersiveImageDisplayUrl,
    immersiveImagePreviewUrl: immersiveImagePreviewUrl,
  };
})();
