/* Latihan bebas: pilih satu tabel perkalian (×2 .. ×10), lalu berlatih 5 soal per putaran tanpa bintang mesin.
   Tiap tombol tabel menampilkan 9 lampu fakta (n × 2 .. n × 10): hijau = sudah dikuasai. */
(function () {
  var gigo, t = 0, bar;

  Scenes.add('practice', {
    enter: function (root) {
      D.clear(); t = 0;
      gigo = Gigo(1180, 708, 190);
      root.appendChild(U.h('div', 'lv-title', STR.LT.title));
      root.appendChild(U.h('div', 'pr-sub', STR.LT.sub));
      var grid = U.h('div', 'pr-grid'), first = null;
      SOAL.LT.tables.forEach(function (n, i) {
        var lamps = '', k = 0;
        for (var a = 2; a <= 10; a++) { var on = Save.mastered(Math.min(a, n) + 'x' + Math.max(a, n)); if (on) k++; lamps += '<i class="flamp' + (on ? ' on' : '') + '"></i>'; }
        var b = Input.button('<span class="pt">×' + n + '</span><span class="pl">' + lamps + '</span>', i % 2 ? 'mint ptab' : 'brass ptab', function () { Scenes.go('play', { level: 'lt', table: n }); },
          { id: 'tab' + n, aria: U.fmt(STR.LT.table, { n: n }) + ', ' + U.fmt(STR.LT.mastered, { k: k, all: 9 }) });
        grid.appendChild(b);
        if (!first) first = b;
      });
      root.appendChild(grid);
      root.appendChild(Input.button(UI.icon('home', 38) + STR.LT.back, 'plum lv-back wide2', function () { Scenes.go('levels'); }, { id: 'back' }));
      root.appendChild(Input.button(UI.icon('table', 38) + STR.levels.table, 'mint lv-table pr-tbl', function () { Tabel.open(); }, { id: 'table' }));
      bar = UI.iconBar(root, 'settings');
      Array.prototype.forEach.call(grid.children, function (c, i) {
        if (D.reduce) return;
        c.style.opacity = 0;
        Tween.wait(50 * i).then(function () { return Tween.run(300, function (e) { c.style.opacity = Math.min(1, e * 2); c.style.transform = 'scale(' + (0.7 + 0.3 * e) + ')'; }, Ease.easeOutBack); })
          .then(function () { c.style.transform = ''; });
      });
      setTimeout(function () { if (Scenes.name === 'practice' && first) first.focus({ preventScroll: true }); }, 60);
      Aud.music(true, 'calm');
    },
    exit: function () { if (bar && bar._cleanup) bar._cleanup(); },
    update: function (dt) {
      t += dt; gigo.update(dt); D.updateFx(dt);
      D.begin();
      D.layer('lv-bg', function (c) { D.img('bg_factory', 0, 0, 1280, 720, null, c); c.fillStyle = 'rgba(46,35,80,0.35)'; c.fillRect(0, 0, 1280, 720); });
      D.img('gear_big', 1262, 470, 104, 104, { ax: 0.5, ay: 0.5, rot: t * 0.4 });
      if (Math.random() < 0.02) D.puff(40 + Math.random() * 1200, 52, { r: 8, vy: -20, life: 1.2 });
      gigo.draw();
      D.drawPuffs(); D.drawParts();
    }
  });
})();
