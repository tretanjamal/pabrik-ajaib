/* Layar judul: papan nama berbohlam + tombol MULAI besar + Informasi, Referensi, Pengembang di kiri; mesin hidup, Gigo
   melambai, ban berjalan membawa peti berisi produk di kanan. Ikon suara, layar penuh, pengaturan di pojok kanan atas
   (Suara, Kurangi animasi, Mode Santai ada di panel Pengaturan). */
(function () {
  var L = SKALA.LAYOUT.title, rig, gigo, crates, beltOff, spawnT, bar, prods;

  Scenes.add('title', {
    enter: function (root) {
      D.clear();
      rig = Rig(L.M, L.mx, L.top);
      rig.screen = '×4'; rig.screenCol = Art.C.brass;
      gigo = Gigo(L.mx - 196, L.floor + 10, SKALA.FIXED.gigo_title.h);
      crates = []; beltOff = 0; spawnT = 0.4; prods = SOAL.L1.products.slice();

      var sign = U.h('div', 'sign');
      var inner = '<div class="in"><div class="t1">' + STR.titleTop + '</div><div class="t2">' + STR.titleBottom + '</div></div>';
      var bulbs = '';
      for (var i = 0; i < 14; i++) bulbs += '<i class="bulb' + (i % 2 ? ' b' : '') + '" style="left:' + (22 + i * 39) + 'px;top:-9px"></i><i class="bulb' + (i % 2 ? '' : ' b') + '" style="left:' + (22 + i * 39) + 'px;bottom:-9px"></i>';
      for (i = 0; i < 5; i++) bulbs += '<i class="bulb' + (i % 2 ? ' b' : '') + '" style="left:-9px;top:' + (34 + i * 40) + 'px"></i><i class="bulb' + (i % 2 ? '' : ' b') + '" style="right:-9px;top:' + (34 + i * 40) + 'px"></i>';
      sign.innerHTML = inner + bulbs;
      root.appendChild(sign);
      var rib = U.h('div', 'ribbon', STR.subtitle); root.appendChild(rib);
      var start = Input.button(UI.icon('play', 54) + STR.start, 'coral start pulse', function () {
        // pemain baru langsung ke Mesin 1 (hook 10 detik); selanjutnya ke Pilih Mesin
        start.disabled = true; Aud.sfx('boot'); Scenes.go(Save.data.onboarded ? 'levels' : 'play', { level: 1 });
      }, { id: 'start' });
      root.appendChild(start);
      var about = U.h('div', 'title-about');
      [['info', 'info'], ['ref', 'book'], ['dev', 'person']].forEach(function (a) {
        about.appendChild(Input.button(UI.icon(a[1], 32) + STR.about[a[0]].btn, 'plum', function () { About[a[0]](); }, { id: 'about-' + a[0] }));
      });
      root.appendChild(about);
      bar = UI.iconBar(root, 'settings');

      // masuk: papan nama jatuh memantul, tombol muncul
      if (!D.reduce) {
        sign.style.transform = 'translateY(-360px)'; rib.style.opacity = 0; start.style.opacity = 0; about.style.opacity = 0;
        Tween.run(520, function (e) { sign.style.transform = 'translateY(' + (-360 * (1 - e)) + 'px)'; }, Ease.easeOutBack)
          .then(function () { return Tween.run(260, function (e) { rib.style.opacity = e; }); })
          .then(function () { return Tween.run(320, function (e) { start.style.opacity = e; about.style.opacity = Math.min(1, e); start.style.transform = 'scale(' + (0.6 + 0.4 * e) + ')'; }, Ease.easeOutBack); })
          .then(function () { start.style.transform = ''; });
      }
      setTimeout(function () { if (Scenes.name === 'title') start.focus({ preventScroll: true }); }, 50);
      Aud.music(true, 'calm');
    },
    exit: function () { if (bar && bar._cleanup) bar._cleanup(); },
    update: function (dt) {
      rig.update(dt); gigo.update(dt); D.updateFx(dt);
      rig.lamps[0] = 0.6 + 0.4 * Math.sin(rig.t * 3);
      beltOff += dt * 70;
      spawnT -= dt;
      if (spawnT <= 0) {   // peti berisi produk keluar dari mesin secara berkala
        var kind = prods[crates.length % prods.length];
        prods.push(prods.shift());
        crates.push({ x: rig.outX - 10, y: rig.beltY, w: 104, n: 3 + Math.floor(Math.random() * 3), kind: kind, alpha: 0 });
        spawnT = 2.4;
      }
      crates.forEach(function (c) { c.x += dt * 70; c.alpha = Math.min(1, c.alpha + dt * 3); });
      while (crates.length && crates[0].x > 1360) crates.shift();
      draw();
    }
  });

  function draw() {
    D.begin();
    D.layer('title-bg', function (c) { D.img('bg_title', 0, 0, 1280, 720, null, c); });
    if (Dekor.has('flags')) Dekor.flags(0, 720, 6, 12, rig.t);   // hiasan pabrik yang sudah terbuka
    if (Dekor.has('lamps')) Dekor.lamp(696, 0, 70, rig.t, 0.6);
    D.conveyor(rig.outX - 20, 1290, rig.beltY, beltOff);
    crates.forEach(drawCrate);
    rig.draw();
    gigo.draw();
    D.drawPuffs(); D.drawParts();
    var t = rig.t;
    D.sparkle(700, 150 + Math.sin(t * 2) * 6, 9 + 4 * Math.sin(t * 4), Art.C.cream);
    D.sparkle(1180, 330, 7 + 4 * Math.sin(t * 3 + 1), Art.C.brass);
  }
})();
