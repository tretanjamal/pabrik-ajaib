/* Rig: mesin utama yang dirakit dari aset terpisah memakai titik poros di js/data/assets.js:
   roda gigi berputar, tuas diayun, lampu menyala (pendar kode di atas lamp_off), pintu membuka, layar menampilkan aturan.
   Juga Gigo (bernapas, berkedip, bergoyang, melompat) dan peti berisi produk. Dipakai layar judul dan bermain. */
(function (root) {
  var C = Art.C;

  function Rig(M, mx, top) {
    var a = Assets.get('machine_main'), m = a.m, box = Assets.box('machine_main', M);
    var r = {
      M: M, w: box.w, h: box.h, x0: mx - box.w / 2, y0: top, m: m,
      gearA: 0, gearV: 0.6, lever: 0.35, door: 0, lamps: [0, 0], lampCol: [C.green, C.brass], shake: 0, squash: 0,
      screen: '', screenCol: C.cream, screenQ: false, running: false, puffT: 0, t: 0
    };
    r.P = function (fx, fy) { return { x: r.x0 + fx * r.w, y: r.y0 + fy * r.h }; };
    r.beltY = r.y0 + (m.belt || 0.69) * r.h;
    r.inX = r.P(m.in[0], 0).x; r.outX = r.P(m.out[0], 0).x;
    r.leverPivot = r.P(m.leverSocket[0], m.leverSocket[1]);
    var lh = Assets.box('lever_handle', M), lp = Assets.get('lever_handle').m.pivot;
    r.knob = function (ang) {   // pusat kenop tuas pada sudut ang
      var L = (lp[1] - 0.12) * lh.h;
      return { x: r.leverPivot.x + Math.sin(ang) * L, y: r.leverPivot.y - Math.cos(ang) * L };
    };
    r.slotRect = function () { var s = m.slot; return { x: r.x0 + s[0] * r.w, y: r.y0 + s[1] * r.h, w: s[2] * r.w, h: s[3] * r.h }; };
    r.screenRect = function () { var s = m.screen; return { x: r.x0 + s[0] * r.w, y: r.y0 + s[1] * r.h, w: s[2] * r.w, h: s[3] * r.h }; };

    r.update = function (dt) {
      r.t += dt;
      var target = r.running ? 5 : 0.6;
      r.gearV += (target - r.gearV) * Math.min(1, dt * 3);
      r.gearA += r.gearV * dt;
      r.puffT -= dt;
      if (r.puffT <= 0) {
        var ch = r.P(m.chimney[0], m.chimney[1]);
        D.puff(ch.x, ch.y, { r: r.running ? 14 : 9 });
        r.puffT = r.running ? 0.12 : 1.4 + Math.random();
      }
    };
    r.draw = function () {
      var c = D.ctx, sh = r.shake ? Math.sin(r.t * 60) * r.shake : 0;
      var gb = Assets.box('gear_big', M), gs = Assets.box('gear_small', M);
      // roda gigi besar di belakang sudut atas (hanya bagian luar yang terlihat)
      D.img('gear_big', r.x0 + 0.07 * r.w, r.y0 + 0.2 * r.h, gb.w, gb.h, { ax: 0.5, ay: 0.5, rot: r.gearA });
      D.img('gear_big', r.x0 + 0.95 * r.w, r.y0 + 0.24 * r.h, gb.w * 0.72, gb.h * 0.72, { ax: 0.5, ay: 0.5, rot: -r.gearA * 1.35 + 0.2 });
      D.shadow(r.x0 + r.w / 2, r.y0 + (m.base || 0.985) * r.h, r.w * 0.5, 12, 0.3);
      c.save(); c.translate(sh, Math.abs(sh) * 0.3);
      var sq = 1 + r.squash;
      D.img('machine_main', r.x0 + r.w / 2, r.y0 + r.h, r.w, r.h, { ax: 0.5, ay: 1, sx: 1 / sq, sy: sq });
      // layar: ditutup panel plum (gambar asli punya gumpalan buram), lalu aturan mesin
      var s = r.screenRect();
      c.fillStyle = C.ink; D.rrect(c, s.x + 1, s.y + 1, s.w - 2, s.h - 2, 10); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.07)'; D.rrect(c, s.x + 8, s.y + 6, s.w - 16, 7, 3); c.fill();
      if (r.screen) {
        var fs = Math.min(s.h * 0.78, 60);
        if (r.screenQ) {
          var parts = r.screen.split('?'), bx = parts[0] ? 0.52 : 0.33;   // tanpa tanda operasi: kotak "?" di tengah
          if (parts[0]) D.text(parts[0], s.x + s.w * 0.36, s.y + s.h * 0.54, fs, C.mintL);
          c.save(); c.strokeStyle = C.brass; c.lineWidth = 4; c.setLineDash([9, 6]); c.globalAlpha = 0.6 + 0.4 * Math.sin(r.t * 5);
          D.rrect(c, s.x + s.w * bx, s.y + s.h * 0.14, s.w * 0.34, s.h * 0.72, 8); c.stroke(); c.restore();
          D.text('?', s.x + s.w * (bx + 0.17), s.y + s.h * 0.54, fs * 0.9, C.brass);
        } else D.text(r.screen, s.x + s.w / 2, s.y + s.h * 0.54, fs, r.screenCol);
      }
      // roda gigi kecil di poros depan
      (m.gears || []).forEach(function (g, i) {
        var p = r.P(g[0], g[1]);
        D.img('gear_small', p.x, p.y, gs.w, gs.h, { ax: 0.5, ay: 0.5, rot: (i % 2 ? -1 : 1) * r.gearA * 1.8 });
      });
      // lampu: lamp_off menutup bohlam bawaan; nyala = pendar kode di atas kaca
      var la = Assets.get('lamp_off'), lb = Assets.box('lamp_off', M), gl = la.m.glass;
      (m.lamps || []).forEach(function (L, i) {
        var p = r.P(L[0], L[1]), gx = gl[0] + gl[2] / 2, gy = gl[1] + gl[3] / 2;
        D.img('lamp_off', p.x, p.y, lb.w, lb.h, { ax: gx, ay: gy });
        var on = r.lamps[i];
        if (on > 0.01) {
          var rr = gl[2] * lb.w * 0.5;
          D.glow(p.x, p.y, rr * 3, r.lampCol[i], 0.55 * on);
          c.save(); c.globalAlpha = 0.72 * on; c.fillStyle = r.lampCol[i];
          c.beginPath(); c.ellipse(p.x, p.y + rr * 0.08, rr * 0.86, gl[3] * lb.h * 0.45, 0, 0, Math.PI * 2); c.fill(); c.restore();
        }
      });
      // pintu: membuka dengan engsel kiri, memperlihatkan pendar di dalam
      var d = m.door, dx = r.x0 + d[0] * r.w, dy = r.y0 + d[1] * r.h, dw = d[2] * r.w, dh = d[3] * r.h;
      if (r.door > 0.01) {
        c.fillStyle = C.ink; D.rrect(c, dx + 4, dy + 4, dw - 8, dh - 8, 8); c.fill();
        D.glow(dx + dw / 2, dy + dh / 2, dw * 0.6, C.brass, 0.8 * r.door);
      }
      D.img('machine_door', dx, dy, dw, dh, { sx: 1 - 0.82 * r.door });
      c.restore();
      // tuas
      var bb = Assets.box('lever_base', M), lpv = Assets.get('lever_handle').m.pivot;
      D.img('lever_base', r.leverPivot.x, r.leverPivot.y, bb.w, bb.h, { ax: 0.5, ay: 0.5 });
      D.img('lever_handle', r.leverPivot.x, r.leverPivot.y, lh.w, lh.h, { ax: lpv[0], ay: lpv[1], rot: r.lever });
    };
    /* tarik tuas: turun lalu kembali */
    r.pull = function () {
      Aud.sfx('lever');
      return Tween.run(220, function (e) { r.lever = 0.35 + 0.9 * e; }, Ease.easeInOutCubic)
        .then(function () { return Tween.run(380, function (e) { r.lever = 1.25 - 0.9 * e; }, Ease.easeOutBack); });
    };
    /* jalankan mesin selama dur ms: getar, roda gigi cepat, pintu terbuka, uap */
    r.run = function (dur) {
      r.running = true; Aud.sfx('run', dur / 1000); Aud.sfx('steam');
      Tween.run(200, function (e) { r.door = e; }, Ease.easeOutCubic); Aud.sfx('door');
      Tween.run(dur, function (e, k) { r.shake = D.reduce ? 0 : 2.2 * Math.sin(k * Math.PI); r.squash = D.reduce ? 0 : 0.015 * Math.sin(k * Math.PI * 10); r.lamps[1] = (Math.floor(k * 10) % 2); }, Ease.linear);
      return Tween.wait(dur).then(function () {
        r.running = false; r.shake = 0; r.squash = 0; r.lamps[1] = 0;
        return Tween.run(240, function (e) { r.door = 1 - e; }, Ease.easeInOutCubic);
      });
    };
    /* batuk lembut saat jawaban salah */
    r.cough = function () {
      var ch = r.P(m.chimney[0], m.chimney[1]);
      for (var i = 0; i < 5; i++) D.puff(ch.x + (Math.random() - 0.5) * 20, ch.y, { r: 16, col: C.lav, vx: (i - 2) * 20 });
      return Tween.run(420, function (e, k) { r.shake = D.reduce ? 0 : 3 * Math.sin(k * Math.PI * 4) * (1 - k); }, Ease.linear).then(function () { r.shake = 0; });
    };
    return r;
  }

  /* Gigo: satu pembicara, balon menempel padanya */
  function Gigo(x, base, h) {
    var g = { x: x, base: base, h: h, mood: 'happy', t: Math.random() * 5, blink: 0, nextBlink: 2, jump: 0, sway: 0 };
    g.top = function () { return g.base - g.h - g.jump; };
    g.update = function (dt) {
      g.t += dt;
      g.nextBlink -= dt;
      if (g.nextBlink <= 0) { g.blink = 0.16; g.nextBlink = 2.5 + Math.random() * 2.5; }
      if (g.blink > 0) g.blink = Math.max(0, g.blink - dt);
    };
    g.cheer = function () {
      g.mood = 'cheer';
      if (D.reduce) return Promise.resolve();
      return Tween.run(260, function (e) { g.jump = 26 * e; }, Ease.easeOutCubic).then(function () { return Tween.run(320, function (e) { g.jump = 26 * (1 - e); }, Ease.easeOutBack); });
    };
    g.draw = function () {
      var key = 'gigo_' + g.mood, a = Assets.get(key); if (!a) return;
      var bx = Assets.box(key, 0, 'gigo'), k = g.h / bx.h, w = bx.w * k;
      var br = D.reduce ? 0 : Math.sin(g.t * 2.4), sway = D.reduce ? 0 : Math.sin(g.t * 1.3) * 0.035;
      D.shadow(g.x, g.base - 2, w * 0.3 * (1 - g.jump / 80), 8, 0.3);
      var y = g.base - g.jump + (D.reduce ? 0 : Math.abs(Math.sin(g.t * 2.6)) * -3);
      var c = D.ctx; c.save(); c.translate(g.x, y); c.rotate(sway);
      c.scale(1 - br * 0.008, 1 + br * 0.015);
      c.drawImage(a.img, -w / 2, -g.h, w, g.h);
      // kedip: kelopak plum menutup mata dari atas (koordinat mata dari assets.js)
      if (g.blink > 0 && a.m.eyes) {
        var amt = Math.sin((g.blink / 0.16) * Math.PI);
        c.fillStyle = C.ink;
        a.m.eyes.forEach(function (e) {
          var ex = -w / 2 + e[0] * w, ey = -g.h + e[1] * g.h, ew = e[2] * w, eh = e[3] * g.h;
          c.fillRect(ex - 2, ey - 2, ew + 4, (eh + 4) * amt);
        });
      }
      c.restore();
    };
    return g;
  }

  /* Peti tampak depan; produk ditaruh di antara dinding belakang dan depan */
  function drawCrate(cr) {
    var a = Assets.get('crate'); if (!a) return;
    var c = D.ctx, w = cr.w, h = w * a.h / a.w, x = cr.x - w / 2, y = cr.y - h, wall = a.m.wall || 0.37;
    c.save(); if (cr.alpha != null) c.globalAlpha = cr.alpha;
    if (!cr.lifted) D.shadow(cr.x, cr.y + 2, w * 0.46, 6, 0.25);
    c.drawImage(a.img, x, y, w, h);
    var n = cr.n || 0;
    if (n > 0 && cr.kind) {
      var perRow = n <= 5 ? n : Math.ceil(n / 2), rows = n <= 5 ? 1 : 2;
      var inner = w * 0.78, s = Math.min(SKALA.FIXED.product.h * (w / 132), inner / perRow * 1.25), pa = Assets.get(cr.kind), ratio = pa.w / pa.h;
      var wallY = y + wall * h;
      for (var row = rows - 1; row >= 0; row--) {
        var cnt = row === 0 ? (rows === 1 ? n : n - perRow) : perRow;
        if (rows === 2 && row === 0) cnt = n - perRow;
        if (rows === 2 && row === 1) cnt = perRow;
        var by = wallY + s * 0.38 - row * s * 0.62;
        for (var i = 0; i < cnt; i++) {
          var idx = row * perRow + i, pop = cr.pops ? cr.pops[idx] : 1;
          if (pop == null) pop = 1;
          if (pop <= 0) continue;
          var px = cr.x + (i - (cnt - 1) / 2) * (inner / perRow);
          var sc = pop < 1 ? Ease.easeOutBack(pop) : 1, iw = s * Math.min(1, ratio) * sc, ih = s / Math.max(1, ratio) * sc;
          c.drawImage(pa.img, px - iw / 2, by - ih, iw, ih);
        }
      }
      // dinding depan digambar ulang di atas produk
      var sy0 = wall * a.h;
      c.drawImage(a.img, 0, sy0, a.img.naturalWidth ? a.img.naturalWidth : a.w, (a.img.naturalHeight || a.h) * (1 - wall), x, y + wall * h, w, h * (1 - wall));
    }
    if (cr.glow) { c.globalAlpha = (cr.alpha == null ? 1 : cr.alpha) * (0.5 + 0.5 * Math.sin(D.t * 6)); c.strokeStyle = C.brass; c.lineWidth = 5; D.rrect(c, x - 4, y - 4, w + 8, h + 8, 12); c.stroke(); }
    c.restore();
    if (cr.label) {   // angka hitung loncat di atas peti
      var lw = Math.max(48, cr.label.length * 22 + 20), ly = y - 26;
      c.save(); c.fillStyle = cr.labelCol || C.cream; c.strokeStyle = C.ink; c.lineWidth = 3;
      D.rrect(c, cr.x - lw / 2, ly - 20, lw, 40, 12); c.fill(); c.stroke(); c.restore();
      D.text(cr.label, cr.x, ly + 1, 28, C.ink);
    }
  }

  /* Mesin kecil (machine_mini) untuk Level 4: layar aturan, roda gigi, uap, getar saat berjalan */
  function MiniRig(M, cx, top) {
    var a = Assets.get('machine_mini'), m = a.m, box = Assets.box('machine_mini', M);
    var r = { M: M, w: box.w, h: box.h, x0: cx - box.w / 2, y0: top, m: m, gearA: 0, gearV: 0.6, shake: 0, screen: '', screenQ: false, screenCol: C.cream, running: false, puffT: Math.random(), t: 0, glow: 0 };
    r.P = function (fx, fy) { return { x: r.x0 + fx * r.w, y: r.y0 + fy * r.h }; };
    r.beltY = r.y0 + (m.belt || 0.67) * r.h;
    r.inX = r.P(m.in[0], 0).x; r.outX = r.P(m.out[0], 0).x;
    r.screenRect = function () { var s = m.screen; return { x: r.x0 + s[0] * r.w, y: r.y0 + s[1] * r.h, w: s[2] * r.w, h: s[3] * r.h }; };
    r.bounds = function () { return { x: r.x0, y: r.y0, w: r.w, h: r.h }; };
    /* tempat kartu di layar mesin ini */
    r.target = function (id, label) {
      var s = r.screenRect();
      return { id: id, label: label, zone: { x: r.x0 - 20, y: r.y0, w: r.w + 40, h: r.h }, btn: { x: s.x - 24, y: s.y - 22, w: s.w + 48, h: s.h + 44 }, anchor: { x: s.x + s.w / 2, y: s.y + s.h / 2 } };
    };
    r.update = function (dt) {
      r.t += dt;
      r.gearV += ((r.running ? 6 : 0.6) - r.gearV) * Math.min(1, dt * 3);
      r.gearA += r.gearV * dt;
      r.puffT -= dt;
      if (r.puffT <= 0) { var ch = r.P(m.chimney[0], m.chimney[1]); D.puff(ch.x, ch.y, { r: r.running ? 12 : 8 }); r.puffT = r.running ? 0.12 : 1.6 + Math.random(); }
    };
    r.draw = function () {
      var c = D.ctx, sh = r.shake ? Math.sin(r.t * 60) * r.shake : 0, gs = Assets.box('gear_small', M);
      D.shadow(r.x0 + r.w / 2, r.y0 + (m.base || 0.98) * r.h, r.w * 0.42, 10, 0.3);
      c.save(); c.translate(sh, Math.abs(sh) * 0.3);
      D.img('machine_mini', r.x0, r.y0, r.w, r.h);
      (m.gears || []).forEach(function (g) { var p = r.P(g[0], g[1]); D.img('gear_small', p.x, p.y, gs.w * 0.9, gs.h * 0.9, { ax: 0.5, ay: 0.5, rot: r.gearA * 1.6 }); });
      var s = r.screenRect();
      c.fillStyle = C.ink; D.rrect(c, s.x + 1, s.y + 1, s.w - 2, s.h - 2, 10); c.fill();
      if (r.glow > 0.01) { c.save(); c.globalAlpha = r.glow * (0.6 + 0.4 * Math.sin(r.t * 6)); c.strokeStyle = C.brass; c.lineWidth = 6; D.rrect(c, s.x - 6, s.y - 6, s.w + 12, s.h + 12, 14); c.stroke(); c.restore(); }
      var fs = Math.min(s.h * 0.74, 54);
      if (r.screenQ) {
        c.save(); c.strokeStyle = C.brass; c.lineWidth = 4; c.setLineDash([9, 6]); c.globalAlpha = 0.6 + 0.4 * Math.sin(r.t * 5);
        D.rrect(c, s.x + s.w * 0.22, s.y + s.h * 0.14, s.w * 0.56, s.h * 0.72, 8); c.stroke(); c.restore();
        D.text('?', s.x + s.w / 2, s.y + s.h * 0.54, fs * 0.9, C.brass);
      } else if (r.screen) D.text(r.screen, s.x + s.w / 2, s.y + s.h * 0.54, fs, r.screenCol);
      c.restore();
    };
    r.run = function (dur) {
      r.running = true; Aud.sfx('run', dur / 1000); Aud.sfx('steam');
      Tween.run(dur, function (e, k) { r.shake = D.reduce ? 0 : 2 * Math.sin(k * Math.PI); }, Ease.linear);
      return Tween.wait(dur).then(function () { r.running = false; r.shake = 0; });
    };
    r.cough = function () {
      var ch = r.P(m.chimney[0], m.chimney[1]);
      for (var i = 0; i < 4; i++) D.puff(ch.x + (Math.random() - 0.5) * 16, ch.y, { r: 14, col: C.lav, vx: (i - 1.5) * 20 });
      return Tween.run(420, function (e, k) { r.shake = D.reduce ? 0 : 3 * Math.sin(k * Math.PI * 4) * (1 - k); }, Ease.linear).then(function () { r.shake = 0; });
    };
    return r;
  }

  /* Tuas berdiri sendiri (Level 4): poros di (px, py), ukuran mengikuti M */
  function Lever(px, py, M) {
    var lh = Assets.box('lever_handle', M), lb = Assets.box('lever_base', M), lp = Assets.get('lever_handle').m.pivot;
    var L = { x: px, y: py, ang: 0.35 };
    L.knob = function (ang) { var len = (lp[1] - 0.12) * lh.h; return { x: px + Math.sin(ang) * len, y: py - Math.cos(ang) * len }; };
    L.draw = function () {
      D.img('lever_base', px, py, lb.w, lb.h, { ax: 0.5, ay: 0.5 });
      D.img('lever_handle', px, py, lh.w, lh.h, { ax: lp[0], ay: lp[1], rot: L.ang });
    };
    /* tiang tuas sampai ban berjalan */
    L.post = function (beltY) {
      var c = D.ctx;
      c.save(); c.fillStyle = C.wallD; c.strokeStyle = C.ink; c.lineWidth = 4;
      c.fillRect(px - 9, py, 18, beltY - py - 4); c.strokeRect(px - 9, py, 18, beltY - py - 4); c.restore();
    };
    L.pull = function () {
      Aud.sfx('lever');
      return Tween.run(220, function (e) { L.ang = 0.35 + 0.9 * e; }, Ease.easeInOutCubic)
        .then(function () { return Tween.run(380, function (e) { L.ang = 1.25 - 0.9 * e; }, Ease.easeOutBack); });
    };
    return L;
  }

  /* Keping angka di ban berjalan (Level 2-4): krem bergaris plum dengan strip atas, angka Fredoka.
     ch: x (tengah), y (alas), v (teks), w, alpha, glow, col (strip), tag (label kecil di atas), jam (macet: strip kuningan bergaris) */
  function drawChip(ch) {
    var c = D.ctx, txt = String(ch.v), w = ch.w || Math.max(84, 30 + txt.length * 24), h = ch.h || 66, x = ch.x - w / 2, y = ch.y - h;
    if (ch.ghost) {   // tempat keping yang diharapkan: garis putus-putus + angka pudar
      c.save(); if (ch.alpha != null) c.globalAlpha = ch.alpha;
      c.strokeStyle = C.lavL; c.lineWidth = 3; c.setLineDash([8, 6]); D.rrect(c, x, y, w, h, 12); c.stroke(); c.restore();
      c.save(); if (ch.alpha != null) c.globalAlpha = ch.alpha;
      D.text(txt, ch.x, y + h / 2 + 2, txt.length > 4 ? 26 : 34, C.lavL, 'center', 700); c.restore();
      chipTag(ch, x, y, w, h);
      return;
    }
    c.save(); if (ch.alpha != null) c.globalAlpha = ch.alpha;
    if (!ch.lifted) D.shadow(ch.x, ch.y + 2, w * 0.46, 6, 0.25);
    var sc = ch.scale || 1;
    if (sc !== 1) { c.translate(ch.x, ch.y); c.scale(sc, sc); c.translate(-ch.x, -ch.y); }
    c.fillStyle = C.cream; c.strokeStyle = C.ink; c.lineWidth = 4;
    D.rrect(c, x, y, w, h, 12); c.fill();
    c.save(); D.rrect(c, x, y, w, h, 12); c.clip();
    c.fillStyle = ch.col || C.mint; c.fillRect(x, y, w, 14);
    if (ch.jam) { c.fillStyle = C.ink; for (var k = -2; k < w / 12; k++) c.fillRect(x + k * 12, y, 5, 14); }
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x + 6, y + 18, w - 12, 4);
    c.restore();
    D.rrect(c, x, y, w, h, 12); c.stroke();
    c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x + w, y + 14); c.lineWidth = 3; c.stroke();
    if (ch.glow) { c.globalAlpha = (ch.alpha == null ? 1 : ch.alpha) * (0.5 + 0.5 * Math.sin(D.t * 6)); c.strokeStyle = ch.glowCol || C.brass; c.lineWidth = 5; D.rrect(c, x - 5, y - 5, w + 10, h + 10, 15); c.stroke(); }
    c.restore();
    c.save(); if (ch.alpha != null) c.globalAlpha = ch.alpha;
    if (sc !== 1) { c.translate(ch.x, ch.y); c.scale(sc, sc); c.translate(-ch.x, -ch.y); }
    D.text(txt, ch.x, y + 14 + (h - 14) / 2 + 1, txt.length > 4 ? 26 : 36, C.ink, 'center', 700);
    c.restore();
    chipTag(ch, x, y, w, h);
  }
  /* label kecil di atas keping (mis. hasil mesin, cocok/tidak); tagBelow = di bawah keping, di depan ban */
  function chipTag(ch, x, y, w, h) {
    if (!ch.tag) return;
    var c = D.ctx, tw = Math.max(48, ch.tag.length * 15 + 22), ty = ch.tagBelow ? y + h + 30 : y - 24;
    c.save(); if (ch.alpha != null) c.globalAlpha = ch.alpha;
    c.fillStyle = ch.tagCol || C.cream; c.strokeStyle = C.ink; c.lineWidth = 3;
    D.rrect(c, ch.x - tw / 2, ty - 18, tw, 36, 11); c.fill(); c.stroke();
    D.text(ch.tag, ch.x, ty + 1, 24, C.ink, 'center', 700);
    c.restore();
  }

  /* Papan titik (Level 2, bantuan Level 3): layar plum berbingkai kuningan berisi array titik.
     Tiap kolom = satu kelompok (seperti satu peti di Level 1); angka hitung loncat di bawah kolom; sisa di kolom putus-putus. */
  function DotBoard(rect) {
    var B = { r: rect, cols: 0, per: 0, rem: 0, pops: [], labels: [], remPops: [], text: '', sub: '', glowCols: false, pile: 0, title: '', alpha: 1 };
    B.clear = function () { B.cols = 0; B.per = 0; B.rem = 0; B.pops = []; B.labels = []; B.remPops = []; B.text = ''; B.sub = ''; B.pile = 0; B.glowCols = false; B.title = ''; };
    /* siapkan susunan; filled = langsung tampil penuh */
    B.set = function (cols, per, rem, filled) {
      B.clear(); B.cols = cols; B.per = per; B.rem = rem || 0;
      for (var i = 0; i < cols * per; i++) B.pops.push(filled ? 1 : 0);
      for (i = 0; i < B.rem; i++) B.remPops.push(filled ? 1 : 0);
      B.labels = new Array(cols).fill('');
    };
    B.drawable = function (cols, per, rem) { return cols <= 12 && per <= 10 && (rem || 0) <= 10 && cols * per + (rem || 0) <= 130; };
    function geo() {
      var R = B.r, ncol = B.cols + (B.rem ? 1 : 0), padT = B.title ? 44 : 18, padB = 46;
      var cw = Math.min(64, (R.w - 36) / Math.max(1, ncol)), rh = Math.min(36, (R.h - padT - padB) / Math.max(1, Math.max(B.per, B.rem)));
      var tot = ncol * cw, x0 = R.x + (R.w - tot) / 2 + cw / 2, yb = R.y + R.h - padB;
      return { cw: cw, rh: rh, x0: x0, yb: yb, dr: Math.max(4, Math.min(cw, rh) * 0.34) };
    }
    /* posisi titik ke-k dalam kolom col (dari bawah ke atas) */
    B.dotPos = function (col, k) { var g = geo(); return { x: g.x0 + col * g.cw, y: g.yb - g.rh * (k + 0.5) }; };
    B.colBox = function (col) { var g = geo(); return { x: g.x0 + col * g.cw - g.cw * 0.42, y: g.yb - g.rh * B.per - 6, w: g.cw * 0.84, h: g.rh * B.per + 12 }; };
    B.draw = function () {
      var c = D.ctx, R = B.r;
      c.save(); c.globalAlpha = B.alpha;
      c.fillStyle = C.brass; c.strokeStyle = C.ink; c.lineWidth = 4;
      D.rrect(c, R.x - 10, R.y - 10, R.w + 20, R.h + 20, 20); c.fill(); c.stroke();
      c.fillStyle = C.ink; D.rrect(c, R.x, R.y, R.w, R.h, 12); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.06)'; D.rrect(c, R.x + 10, R.y + 8, R.w - 20, 8, 4); c.fill();
      [[R.x - 2, R.y - 2], [R.x + R.w + 2, R.y - 2], [R.x - 2, R.y + R.h + 2], [R.x + R.w + 2, R.y + R.h + 2]].forEach(function (p) { c.fillStyle = C.brassD; c.beginPath(); c.arc(p[0], p[1], 4, 0, Math.PI * 2); c.fill(); });
      if (B.title) D.text(B.title, R.x + R.w / 2, R.y + 26, 24, C.mintL, 'center', 600);
      if (B.text) {
        D.text(B.text, R.x + R.w / 2, R.y + R.h * 0.45, 44, C.cream);
        if (B.sub) D.text(B.sub, R.x + R.w / 2, R.y + R.h * 0.45 + 52, 24, C.lavL, 'center', 600);
        c.restore(); return;
      }
      var g = geo(), i, k;
      // tumpukan titik (sebelum dibagi): bulatan acak di tengah
      if (B.pile > 0) {   // susunan bunga matahari: rapat tetapi tetap di dalam layar
        var sp = Math.min(24, Math.sqrt(R.w * R.h * 0.4 / B.pile)), pr = sp * 0.36, py = R.y + (B.title ? 22 : 0) + R.h * 0.5;
        for (i = 0; i < B.pile; i++) {
          var ang = i * 2.39996, rad = Math.sqrt(i + 0.5) * sp * 0.55;
          var px = R.x + R.w / 2 + Math.cos(ang) * rad, pyy = py + Math.sin(ang) * rad * 0.8;
          c.fillStyle = C.brass; c.beginPath(); c.arc(px, pyy, pr, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(px - pr * 0.3, pyy - pr * 0.3, pr * 0.32, 0, Math.PI * 2); c.fill();
        }
      }
      for (var col = 0; col < B.cols; col++) {
        var bx = B.colBox(col);
        c.save(); c.strokeStyle = B.glowCols ? C.brass : 'rgba(188,193,241,0.35)'; c.lineWidth = B.glowCols ? 3 + 2 * Math.sin(D.t * 6) : 2;
        D.rrect(c, bx.x, bx.y, bx.w, bx.h, 8); c.stroke(); c.restore();
        for (k = 0; k < B.per; k++) {
          var pp = B.pops[col * B.per + k]; if (!pp) continue;
          var p = B.dotPos(col, k), s = pp < 1 ? Ease.easeOutBack(pp) : 1;
          c.fillStyle = C.brass; c.beginPath(); c.arc(p.x, p.y, g.dr * s, 0, Math.PI * 2); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(p.x - g.dr * 0.3, p.y - g.dr * 0.3, g.dr * 0.32 * s, 0, Math.PI * 2); c.fill();
        }
        if (B.labels[col]) D.text(B.labels[col], g.x0 + col * g.cw, g.yb + 24, B.labels[col].length > 2 ? 20 : 22, C.cream, 'center', 700);
      }
      if (B.rem) {
        var rc = B.cols, rb = { x: g.x0 + rc * g.cw - g.cw * 0.42, y: g.yb - g.rh * Math.max(B.rem, 1) - 6, w: g.cw * 0.84, h: g.rh * Math.max(B.rem, 1) + 12 };
        c.save(); c.strokeStyle = C.lav; c.lineWidth = 3; c.setLineDash([6, 5]); D.rrect(c, rb.x, rb.y, rb.w, rb.h, 8); c.stroke(); c.restore();
        for (k = 0; k < B.rem; k++) {
          var rp = B.remPops[k]; if (!rp) continue;
          var q = B.dotPos(rc, k); c.fillStyle = C.lavL; c.beginPath(); c.arc(q.x, q.y, g.dr * (rp < 1 ? Ease.easeOutBack(rp) : 1), 0, Math.PI * 2); c.fill();
        }
        if (B.remLabel) D.text(B.remLabel, g.x0 + rc * g.cw, g.yb + 24, 20, C.lavL, 'center', 700);
      }
      c.restore();
    };
    /* isi kolom demi kolom (kelompok sama), hitung loncat di bawah tiap kolom */
    B.fillCols = async function (step, alive) {
      for (var col = 0; col < B.cols; col++) {
        for (var k = 0; k < B.per; k++) { (function (idx) { Tween.run(160, function (e) { B.pops[idx] = e; }, Ease.linear); })(col * B.per + k); }
        if (B.pile) B.pile = Math.max(0, B.pile - B.per);
        Aud.sfx('pop');
        await Tween.wait(step); if (alive && !alive()) return;
        B.labels[col] = String(B.per * (col + 1)); Aud.sfx('tick', 1 + col * 0.06);
      }
      for (var r = 0; r < B.rem; r++) { (function (r) { Tween.run(160, function (e) { B.remPops[r] = e; }, Ease.linear); })(r); }
      if (B.rem) { B.pile = 0; Aud.sfx('pop'); await Tween.wait(step); }
    };
    /* bagi rata: satu titik ke tiap kolom bergiliran (membagi benda rata ke kotak) */
    B.deal = async function (step, alive) {
      for (var k = 0; k < B.per; k++) {
        for (var col = 0; col < B.cols; col++) { (function (idx) { Tween.run(140, function (e) { B.pops[idx] = e; }, Ease.linear); })(col * B.per + k); }
        if (B.pile) B.pile = Math.max(0, B.pile - B.cols);
        Aud.sfx('pop', 1); await Tween.wait(step); if (alive && !alive()) return;
      }
      for (var col2 = 0; col2 < B.cols; col2++) B.labels[col2] = String(B.per);
    };
    return B;
  }

  /* Pelanggan Level 5 (cust_a / cust_b, ekspresi idle/think/happy): masuk dari kanan sambil melangkah, bernapas saat diam.
     head() = titik ekor balon dialog (di atas kepala). */
  function Customer(x, base, h) {
    var c = { id: 'a', mood: 'idle', x: x, home: x, base: base, h: h, t: 0, walk: 0, alpha: 0, hop: 0 };
    c.head = function () { return { x: c.home - 30, y: c.base - c.h - 6 }; };
    c.update = function (dt) { c.t += dt; };
    c.enter = function (id) {
      c.id = id; c.mood = 'idle'; c.alpha = 1; c.walk = 1;
      return Tween.run(D.reduce ? 200 : 700, function (e) { c.x = c.home + 300 * (1 - e); }, Ease.easeOutCubic).then(function () { c.walk = 0; });
    };
    c.leave = function () {
      c.walk = 1;
      return Tween.run(D.reduce ? 200 : 600, function (e) { c.x = c.home + 320 * e; c.alpha = 1 - e * 0.6; }, Ease.easeInOutCubic).then(function () { c.walk = 0; c.alpha = 0; });
    };
    c.cheer = function () {
      c.mood = 'happy';
      if (D.reduce) return;
      Tween.run(240, function (e) { c.hop = 18 * e; }, Ease.easeOutCubic).then(function () { return Tween.run(300, function (e) { c.hop = 18 * (1 - e); }, Ease.easeOutBack); });
    };
    c.draw = function () {
      if (c.alpha <= 0.01) return;
      var key = 'cust_' + c.id + '_' + c.mood, a = Assets.get(key); if (!a) return;
      var w = c.h * a.w / a.h, br = D.reduce ? 0 : Math.sin(c.t * 2.2), step = c.walk && !D.reduce ? Math.abs(Math.sin(c.t * 12)) * 8 : 0;
      var ctx = D.ctx; ctx.save(); ctx.globalAlpha = c.alpha;
      D.shadow(c.x, c.base - 2, w * 0.34, 8, 0.3);
      ctx.translate(c.x, c.base - step - c.hop); ctx.rotate(c.walk && !D.reduce ? Math.sin(c.t * 12) * 0.03 : 0);
      ctx.scale(1 - br * 0.006, 1 + br * 0.012);
      ctx.drawImage(a.img, -w / 2, -c.h, w, c.h);
      ctx.restore();
    };
    return c;
  }

  root.Rig = Rig; root.Gigo = Gigo; root.drawCrate = drawCrate; root.Customer = Customer;
  root.MiniRig = MiniRig; root.Lever = Lever; root.drawChip = drawChip; root.DotBoard = DotBoard;
})(window);
