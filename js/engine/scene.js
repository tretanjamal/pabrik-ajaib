/* Scene: scaler 1280x720 (letterbox), loop rAF berbasis delta, manajer scene dengan transisi.
   Dari gim 221, ditambah: pendengar onFit (kanvas menyesuaikan resolusi) dan transisi 300 ms. */
(function (root) {
  var W = 1280, H = 720;
  var Stage = { el: null, scale: 1, fits: [], onFit: function (fn) { Stage.fits.push(fn); } };

  /* Scaler */
  function fit() {
    var vw = root.innerWidth, vh = root.innerHeight;
    var s = Math.min(vw / W, vh / H);
    Stage.scale = s;
    var x = (vw - W * s) / 2, y = (vh - H * s) / 2;
    Stage.el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    Stage.portrait = vh > vw;   // ajakan memutar menutupi layar: permainan dan timer ikut berhenti
    document.getElementById('rotate').style.display = vh > vw ? 'flex' : 'none';
    Stage.fits.forEach(function (fn) { fn(s); });
  }
  /* koordinat layar -> koordinat kanvas logis */
  Stage.toLocal = function (cx, cy) {
    var r = Stage.el.getBoundingClientRect();
    return { x: (cx - r.left) / Stage.scale, y: (cy - r.top) / Stage.scale };
  };

  /* Loop */
  var Loop = {
    fns: [], last: 0, paused: false,
    add: function (fn) { Loop.fns.push(fn); },
    remove: function (fn) { var i = Loop.fns.indexOf(fn); if (i >= 0) Loop.fns.splice(i, 1); },
    start: function () {
      function tick(ts) {
        var dt = Math.min(ts - Loop.last, 50) / 1000;
        Loop.last = ts;
        if (!Loop.paused && !Stage.portrait && dt > 0) {
          Tween.update(dt);
          for (var i = 0; i < Loop.fns.length; i++) Loop.fns[i](dt);
        }
        root.requestAnimationFrame(tick);
      }
      Loop.last = performance.now();
      root.requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', function () {
    var hid = document.hidden;
    Loop.paused = hid;
    if (!hid) Loop.last = performance.now();
    Aud.setHidden(hid);
    if (hid) Voice.stop();
  });

  /* Scenes */
  var Scenes = {
    reg: {}, cur: null, name: '', root: null, cover: null, busy: false,
    add: function (n, s) { Scenes.reg[n] = s; },
    go: function (name, params) {
      // transisi masih berjalan: simpan, jalankan setelahnya (mengetuk sangat cepat tidak boleh membuat macet)
      var key = name + JSON.stringify(params && { l: params.level, t: params.table });
      if (Scenes.busy) { if (key !== Scenes.target) { Scenes.pending = [name, params]; Scenes.target = key; } return Promise.resolve(); }   // klik ganda: abaikan
      Scenes.busy = true; Scenes.target = key;
      Tween.paused = false; UI.closeOverlays();   // panel tidak boleh tertinggal di layar lain
      var out = Scenes.cur ? Tween.run(150, function (e) { Scenes.cover.style.opacity = e; }, Ease.easeOutQuad) : Promise.resolve();
      return out.then(function () {
        if (Scenes.cur && Scenes.cur.exit) Scenes.cur.exit();
        Voice.stop();
        Tween.clear();
        Loop.fns.length = 0;
        Scenes.root.innerHTML = '';
        Scenes.name = name;
        Scenes.cur = Scenes.reg[name];
        Scenes.cur.enter(Scenes.root, params || {});
        if (Scenes.cur.update) Loop.add(Scenes.cur.update);
        return Tween.run(170, function (e) { Scenes.cover.style.opacity = 1 - e; }, Ease.easeOutQuad);
      }).then(function () {
        Scenes.busy = false;
        var p = Scenes.pending; Scenes.pending = null;
        if (p) return Scenes.go(p[0], p[1]);
      });
    }
  };

  function boot() {
    Stage.el = document.getElementById('stage');
    Scenes.root = document.getElementById('scene-root');
    Scenes.cover = document.getElementById('cover');
    root.addEventListener('resize', fit);
    root.addEventListener('orientationchange', fit);
    fit();
    Loop.start();
  }
  root.Stage = Stage; root.Loop = Loop; root.Scenes = Scenes; root.bootStage = boot;
})(window);
