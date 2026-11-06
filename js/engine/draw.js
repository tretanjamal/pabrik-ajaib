/* Draw: satu kanvas dunia 1280x720 logis. Resolusi kanvas mengikuti ukuran layar (tajam di 1920x1080, ringan di HP),
   lapisan latar diam di-cache. Semua gambar lewat Assets; ban berjalan, uap, kilau, partikel, dan bayangan dibuat kode. */
(function (root) {
  var C = Art.C;
  var D = {
    cv: null, ctx: null, k: 1, layers: {}, puffs: [], parts: [], reduce: false, t: 0,
    init: function () {
      D.cv = document.getElementById('world');
      D.ctx = D.cv.getContext('2d');
      Stage.onFit(D.resize);
      // konteks kanvas bisa hilang (memori GPU penuh di HP murah): buang cache lapisan agar digambar ulang
      D.cv.addEventListener('contextrestored', function () { D.layers = {}; D.ctx.imageSmoothingQuality = 'high'; });
    },
    resize: function (s) {
      var dpr = Math.min(root.devicePixelRatio || 1, 2);
      var w = Math.round(Math.max(640, Math.min(2560, 1280 * s * dpr)));
      if (D.cv.width === w) return;
      D.cv.width = w; D.cv.height = Math.round(w * 9 / 16);
      D.k = w / 1280; D.layers = {};
    },
    begin: function () {
      var c = D.ctx;
      c.setTransform(D.k, 0, 0, D.k, 0, 0);
      c.clearRect(0, 0, 1280, 720);
      c.imageSmoothingQuality = 'high';
    },
    clear: function () { D.begin(); D.puffs.length = 0; D.parts.length = 0; },
    /* lapisan diam di-cache sebagai kanvas sesuai resolusi; fn(ctx) menggambar dalam koordinat logis */
    layer: function (name, fn) {
      var L = D.layers[name];
      if (L && L.getContext('2d').isContextLost && L.getContext('2d').isContextLost()) L = null;
      if (!L) {
        L = document.createElement('canvas'); L.width = D.cv.width; L.height = D.cv.height;
        var c = L.getContext('2d'); c.setTransform(D.k, 0, 0, D.k, 0, 0); c.imageSmoothingQuality = 'high';
        fn(c); D.layers[name] = L;
      }
      D.ctx.save(); D.ctx.setTransform(1, 0, 0, 1, 0, 0); D.ctx.drawImage(L, 0, 0); D.ctx.restore();
    },
    /* gambar aset. o: ax, ay (titik jangkar 0-1), rot (radian, berputar di jangkar), alpha, sx, sy (skala tambahan) */
    img: function (key, x, y, w, h, o, ctx) {
      var a = Assets.get(key); if (!a) return;
      var c = ctx || D.ctx; o = o || {};
      var ax = o.ax == null ? 0 : o.ax, ay = o.ay == null ? 0 : o.ay;
      c.save();
      if (o.alpha != null) c.globalAlpha *= o.alpha;
      c.translate(x, y);
      if (o.rot) c.rotate(o.rot);
      if (o.sx != null || o.sy != null) c.scale(o.sx == null ? 1 : o.sx, o.sy == null ? 1 : o.sy);
      c.drawImage(a.img, -ax * w, -ay * h, w, h);
      c.restore();
    },
    shadow: function (x, y, rx, ry, alpha, ctx) {
      var c = ctx || D.ctx;
      c.save(); c.globalAlpha *= alpha == null ? 0.28 : alpha; c.fillStyle = C.ink;
      c.beginPath(); c.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2); c.fill(); c.restore();
    },
    glow: function (x, y, r, color, alpha, ctx) {
      var c = ctx || D.ctx, g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.save(); c.globalAlpha *= alpha == null ? 0.6 : alpha; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.restore();
    },
    rrect: function (c, x, y, w, h, r) {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    },
    /* ban berjalan: permukaan atas di y, bergerak menurut off (px) */
    conveyor: function (x0, x1, y, off, ctx) {
      var c = ctx || D.ctx, w = x1 - x0;
      if (w <= 0) return;
      c.save();
      c.fillStyle = C.wallD; c.strokeStyle = C.ink; c.lineWidth = 4;
      for (var lx = x0 + 34; lx < x1 - 10; lx += 130) { c.fillRect(lx - 6, y + 40, 12, 70); c.strokeRect(lx - 6, y + 40, 12, 70); }
      c.fillStyle = C.wallD; D.rrect(c, x0 - 4, y + 12, w + 8, 32, 8); c.fill(); c.stroke();
      c.fillStyle = C.ink; D.rrect(c, x0 - 6, y - 4, w + 12, 26, 13); c.fill();
      c.save(); D.rrect(c, x0, y, w, 18, 9); c.clip();
      c.fillStyle = C.lavD; c.fillRect(x0, y, w, 18);
      c.fillStyle = C.wall;
      var s = ((off % 40) + 40) % 40;
      for (var sx = x0 - 40 + s; sx < x1 + 20; sx += 40) { c.beginPath(); c.moveTo(sx, y + 18); c.lineTo(sx + 12, y); c.lineTo(sx + 24, y); c.lineTo(sx + 12, y + 18); c.closePath(); c.fill(); }
      c.restore();
      for (var rx = x0 + 18; rx < x1 - 4; rx += 42) {
        c.fillStyle = C.lav; c.beginPath(); c.arc(rx, y + 30, 8, 0, Math.PI * 2); c.fill(); c.lineWidth = 3; c.stroke();
        var ang = off / 8;
        c.beginPath(); c.moveTo(rx, y + 30); c.lineTo(rx + Math.cos(ang) * 6, y + 30 + Math.sin(ang) * 6); c.stroke();
      }
      c.restore();
    },
    /* uap: kepulan bulat lavender yang naik, membesar, memudar */
    puff: function (x, y, o) {
      o = o || {};
      if (D.reduce && D.puffs.length > 6) return;
      D.puffs.push({ x: x, y: y, vx: (o.vx || 0) + (Math.random() - 0.5) * 14, vy: o.vy || -(38 + Math.random() * 20), r: o.r || 10 + Math.random() * 6, t: 0, life: o.life || 1.6, col: o.col || C.lavL });
    },
    sparkle: function (x, y, r, col, ctx) {
      var c = ctx || D.ctx;
      c.save(); c.fillStyle = col || C.brass; c.beginPath();
      c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r);
      c.fill(); c.restore();
    },
    /* partikel kecil saat benar */
    burst: function (x, y, n, cols) {
      cols = cols || [C.brass, C.green, C.coral, C.cream, C.mint];
      n = D.reduce ? Math.min(6, n) : n;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = 140 + Math.random() * 220;
        D.parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, t: 0, life: 0.7 + Math.random() * 0.5, r: 5 + Math.random() * 6, col: cols[i % cols.length], star: i % 3 === 0 });
      }
    },
    updateFx: function (dt) {
      D.t += dt;
      for (var i = D.puffs.length - 1; i >= 0; i--) {
        var p = D.puffs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= 0.985;
        if (p.t > p.life) D.puffs.splice(i, 1);
      }
      for (i = D.parts.length - 1; i >= 0; i--) {
        var q = D.parts[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 520 * dt;
        if (q.t > q.life) D.parts.splice(i, 1);
      }
    },
    drawPuffs: function () {
      var c = D.ctx;
      D.puffs.forEach(function (p) {
        var k = p.t / p.life;
        c.save(); c.globalAlpha = (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8) * 0.75; c.fillStyle = p.col;
        c.beginPath(); c.arc(p.x, p.y, p.r * (0.6 + k * 1.1), 0, Math.PI * 2); c.fill();
        c.globalAlpha *= 0.8; c.fillStyle = '#fff'; c.beginPath(); c.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.35 * (0.6 + k), 0, Math.PI * 2); c.fill();
        c.restore();
      });
    },
    drawParts: function () {
      var c = D.ctx;
      D.parts.forEach(function (q) {
        c.save(); c.globalAlpha = Math.max(0, 1 - q.t / q.life);
        if (q.star) D.sparkle(q.x, q.y, q.r * 1.4, q.col);
        else { c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, q.r * 0.7, 0, Math.PI * 2); c.fill(); }
        c.restore();
      });
    },
    text: function (s, x, y, size, color, align, weight, ctx) {
      var c = ctx || D.ctx;
      c.save(); c.font = (weight || 700) + ' ' + size + 'px Fredoka, "Trebuchet MS", "Segoe UI", Arial, sans-serif';
      c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText(s, x, y); c.restore();
    }
  };
  root.D = D;
})(window);
