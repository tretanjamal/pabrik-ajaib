/* Pilih Mesin: 5 pelat level, terkunci sampai mesin sebelumnya selesai (Save.unlocked). Tiap pelat: machine_mini dengan tanda di
   layarnya, nama level, 3 lampu bintang; mesin berikutnya yang disarankan berdenyut. Bawah: Beranda, Tabel, Latihan bebas.
   Kiri atas: panel "Pabrikku" (bintang + hiasan). Hiasan yang terbuka digambar di pabrik (bendera, lampu, mesin mini, ban, piala). */
(function () {
  var gigo, t = 0, bar, mini, crates, spawnT, belt, total;
  var MINI = { x: 800, M: 160, beltEnd: 1010 }, prods = SOAL.L1.products;

  Scenes.add('levels', {
    enter: function (root) {
      D.clear(); t = 0; crates = []; spawnT = 0.3; belt = 0; total = Dekor.total();
      gigo = Gigo(1180, 708, 190);
      mini = Dekor.has('mini', total) ? MiniRig(MINI.M, MINI.x, 712 - MINI.M * 0.8 * 0.98) : null;
      if (mini) { mini.screen = '×2'; mini.screenCol = Art.C.brass; }
      var h = U.h('div', 'lv-title', STR.levels.title); root.appendChild(h);
      root.appendChild(Dekor.panel());
      var row = U.h('div', 'lv-row'), first = null, next = 0;
      for (var n = 1; n <= 5; n++) if (!next && !(Save.data.levels[n] && Save.data.levels[n].stars)) next = n;
      for (n = 1; n <= 5; n++) (function (n) {
        var meta = STR.lv[n], stars = (Save.data.levels[n] && Save.data.levels[n].stars) || 0, open = Save.unlocked(n), hint = { n: n - 1 };
        var b = U.h('button', 'lvcard' + (n === next ? ' next' : '') + (open ? '' : ' locked'));
        b.type = 'button'; b.dataset.id = 'lv' + n;
        // terkunci tetap bisa diketuk/difokus (bukan disabled) agar anak mendapat balasan dan pembaca layar menyebut syaratnya
        b.setAttribute('aria-label', meta.hud + ' ' + meta.name + ', ' + (open ? U.fmt(STR.levels.stars, { n: stars }) : U.fmt(STR.levels.lockAria, hint)));
        if (!open) b.setAttribute('aria-disabled', 'true');
        var lamps = '';
        for (var i = 0; i < 3; i++) lamps += '<i class="slamp' + (i < stars ? ' on' : '') + '"></i>';
        b.innerHTML = '<span class="lh">' + meta.hud + '</span><span class="lm">' + Assets.imgEl('machine_mini').outerHTML + (open ? '<span class="lg">' + meta.icon + '</span>' : '<span class="lk">' + Dekor.svg('lock', 84) + '</span>') + '</span>' +
          '<span class="ln">' + meta.name + '</span>' + (open ? '<span class="lst">' + lamps + '</span>' : '<span class="lhint">' + U.fmt(STR.levels.lockHint, hint) + '</span>');
        b.addEventListener('click', function () {
          if (!open) {   // goyang lembut + bunyi lembut, pelat yang disarankan tetap berdenyut
            Aud.sfx('bad'); b.classList.remove('wob'); void b.offsetWidth; b.classList.add('wob');
            return;
          }
          Aud.sfx('click'); Aud.sfx('boot'); Scenes.go('play', { level: n });
        });
        b.addEventListener('pointerdown', function () { Aud.init(); });
        row.appendChild(b);
        if (n === (next || 1)) first = b;
      })(n);
      root.appendChild(row);
      // masuk: pelat muncul satu per satu (easeOutBack)
      Array.prototype.forEach.call(row.children, function (c, i) {
        if (D.reduce) return;
        c.style.opacity = 0; c.style.transform = 'translateY(60px) scale(.8)';
        Tween.wait(70 * i).then(function () { return Tween.run(340, function (e) { c.style.opacity = Math.min(1, e * 2); c.style.transform = 'translateY(' + (60 * (1 - e)) + 'px) scale(' + (0.8 + 0.2 * e) + ')'; }, Ease.easeOutBack); })
          .then(function () { c.style.transform = ''; });
      });
      root.appendChild(Input.button(UI.icon('home', 38) + STR.levels.back, 'plum lv-back', function () { Scenes.go('title'); }, { id: 'home' }));
      root.appendChild(Input.button(UI.icon('table', 38) + STR.levels.table, 'mint lv-table', function () { Tabel.open(); }, { id: 'table' }));
      root.appendChild(Input.button(UI.icon('play', 34) + STR.levels.practice, 'brass lv-practice', function () { Scenes.go('practice'); }, { id: 'practice' }));
      bar = UI.iconBar(root, 'settings');
      setTimeout(function () { if (Scenes.name === 'levels' && first) first.focus({ preventScroll: true }); }, 60);
      Aud.music(true, 'calm');
    },
    exit: function () { if (bar && bar._cleanup) bar._cleanup(); },
    update: function (dt) {
      t += dt; gigo.update(dt); D.updateFx(dt);
      if (mini) mini.update(dt);
      var C = Art.C, hasBelt = Dekor.has('belt', total), by = mini ? mini.beltY : 676, bx0 = mini ? mini.outX - 6 : MINI.x - 40;
      if (hasBelt) {   // ban produk: peti kecil berisi produk berjalan ke kanan
        belt += dt * 60; spawnT -= dt;
        if (spawnT <= 0) { crates.push({ x: bx0 + 10, y: by, w: 58, n: 2, kind: prods[crates.length % prods.length], alpha: 0 }); spawnT = 2.6; }
        crates.forEach(function (c) { c.x += dt * 60; c.alpha = Math.min(1, c.alpha + dt * 3, (MINI.beltEnd - c.x) / 40); });
        while (crates.length && crates[0].x > MINI.beltEnd) crates.shift();
      }
      D.begin();
      D.layer('lv-bg', function (c) { D.img('bg_factory', 0, 0, 1280, 720, null, c); c.fillStyle = 'rgba(46,35,80,0.35)'; c.fillRect(0, 0, 1280, 720); });
      D.img('gear_big', 1262, 470, 104, 104, { ax: 0.5, ay: 0.5, rot: t * 0.4 });
      if (Math.random() < 0.02) D.puff(40 + Math.random() * 1200, 52, { r: 8, vy: -20, life: 1.2 });
      if (Dekor.has('lamps', total)) { Dekor.lamp(400, 0, 58, t, 0); Dekor.lamp(880, 0, 58, t, 1.7); }
      if (Dekor.has('flags', total)) Dekor.flags(30, 1250, 546, 8, t);
      if (hasBelt) { D.conveyor(bx0, MINI.beltEnd, by, belt); crates.forEach(drawCrate); }
      if (mini) mini.draw();
      if (Dekor.has('trophy', total)) Dekor.trophy(1060, 712, t);
      gigo.draw();
      D.drawPuffs(); D.drawParts();
      D.sparkle(80, 160 + Math.sin(t * 2) * 6, 8 + 4 * Math.sin(t * 4), C.cream);
    }
  });
})();
