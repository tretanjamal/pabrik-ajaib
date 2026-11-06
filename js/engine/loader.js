/* Assets: daftar aset terpusat. Semua gambar gim diambil lewat sini: berkas dari js/data/assets.js (WebP),
   atau cadangan SVG dari js/engine/art.js bila berkas tidak ada / gagal dimuat. ?test=1&noimg=1 memaksa cadangan (uji). */
(function (root) {
  var store = {}, FILES = root.ASSET_FILES || {};
  var forceFallback = U.TEST && /[?&]noimg=1/.test(root.location.search);

  function fromFallback(key) {
    var fb = Art.fallback(key);
    if (!fb) return null;
    var img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fb.svg);
    return { key: key, img: img, src: img.src, w: fb.w, h: fb.h, m: fb.meta, fallback: true };
  }

  var Assets = {
    /* muat semua; cb dipanggil setelah semua selesai (berhasil atau jatuh ke cadangan) */
    load: function (cb) {
      var keys = {}, k;
      for (k in FILES) keys[k] = 1;
      Art.keys().forEach(function (x) { keys[x] = 1; });
      var list = Object.keys(keys), left = list.length;
      function done() { if (--left === 0) cb(); }
      list.forEach(function (key) {
        var f = FILES[key];
        if (!f || !f.file || forceFallback) {
          var fb = fromFallback(key);
          if (fb) { store[key] = fb; if (fb.img.complete) done(); else { fb.img.onload = fb.img.onerror = done; } } else done();
          return;
        }
        var img = new Image();
        img.onload = function () {
          var meta = {}, p;
          for (p in f) if (p !== 'file' && p !== 'w' && p !== 'h') meta[p] = f[p];
          store[key] = { key: key, img: img, src: f.file, w: f.w || img.naturalWidth, h: f.h || img.naturalHeight, m: meta, fallback: false };
          done();
        };
        img.onerror = function () {
          var fb = fromFallback(key);
          if (fb) { store[key] = fb; fb.img.onload = fb.img.onerror = done; } else done();
        };
        img.src = f.file;
      });
    },
    has: function (key) { return !!store[key]; },
    get: function (key) { return store[key] || null; },
    url: function (key) { return store[key] ? store[key].src : ''; },
    ratio: function (key) { var a = store[key]; return a ? a.w / a.h : 1; },
    /* ukuran tampil dari config/skala.js */
    box: function (key, M, kind) { return SKALA.box(key, Assets.ratio(key), M, kind); },
    /* <img> untuk DOM (mis. ikon produk di kartu pesanan), tetap lewat daftar aset */
    imgEl: function (key, cls) { var e = U.h('img', cls || ''); e.src = Assets.url(key); e.alt = ''; e.draggable = false; return e; },
    stats: function () { var s = { files: 0, fallback: 0 }; for (var k in store) s[store[k].fallback ? 'fallback' : 'files']++; return s; }
  };
  root.Assets = Assets;
})(window);
