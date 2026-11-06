/* Hiasan pabrik (pabrik berkembang): terbuka dari jumlah bintang semua mesin (batas di config/soal.js DEKOR).
   Tampil di layar judul (bendera, lampu) dan Pilih Mesin (semua). Semua digambar kode dengan palet GDD. */
(function (root) {
  var C = Art.C;
  var ICON = {
    flags: '<path d="M6 12q18 10 36 0" fill="none" stroke="#2E2350" stroke-width="3"/><path d="M10 14l5 14 5-12zM22 18l4 13 5-13zM33 15l4 13 4-14z" fill="#FF6B4A" stroke="#2E2350" stroke-width="2.5" stroke-linejoin="round"/>',
    lamps: '<path d="M24 4v12" stroke="#2E2350" stroke-width="3"/><path d="M12 28q0-12 12-12t12 12z" fill="#FFC23D" stroke="#2E2350" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="32" r="5" fill="#FFF6E0" stroke="#2E2350" stroke-width="2.5"/>',
    belt: '<rect x="5" y="28" width="38" height="9" rx="4.5" fill="#7476C0" stroke="#2E2350" stroke-width="3"/><rect x="11" y="13" width="14" height="13" rx="2" fill="#E6D9C2" stroke="#2E2350" stroke-width="2.5"/><circle cx="33" cy="20" r="6" fill="#FF6B4A" stroke="#2E2350" stroke-width="2.5"/>',
    mini: '<rect x="11" y="12" width="26" height="28" rx="6" fill="#8C93E8" stroke="#2E2350" stroke-width="3"/><rect x="16" y="18" width="16" height="10" rx="2" fill="#2E2350"/><path d="M20 6h8v6h-8z" fill="#FF6B4A" stroke="#2E2350" stroke-width="2.5"/>',
    trophy: '<path d="M15 8h18v8q0 10-9 10t-9-10z" fill="#FFC23D" stroke="#2E2350" stroke-width="3" stroke-linejoin="round"/><path d="M15 11h-5q0 7 6 8M33 11h5q0 7-6 8" fill="none" stroke="#2E2350" stroke-width="3"/><path d="M20 34h8l2 6H18z" fill="#C9993F" stroke="#2E2350" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 26v8" stroke="#2E2350" stroke-width="3"/>',
    lock: '<rect x="13" y="21" width="22" height="18" rx="4" fill="#BCC1F1" stroke="#2E2350" stroke-width="3"/><path d="M17 21v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#2E2350" stroke-width="3"/>',
    star: '<path d="M24 5l5.6 12 13 1.4-9.7 8.8 2.8 12.8L24 33.4 12.3 40l2.8-12.8-9.7-8.8 13-1.4z" fill="#FFC23D" stroke="#2E2350" stroke-width="3" stroke-linejoin="round"/>'
  };
  function svg(name, size) { return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" aria-hidden="true">' + ICON[name] + '</svg>'; }

  var Dekor = {
    svg: svg,
    max: function () { return 15; },
    total: function () { var t = 0; for (var n = 1; n <= 5; n++) t += (Save.data.levels[n] && Save.data.levels[n].stars) || 0; return t; },
    has: function (id, total) { var t = total == null ? Dekor.total() : total; return DEKOR.some(function (d) { return d.id === id && t >= d.stars; }); },
    /* hiasan yang baru terbuka di antara dua jumlah bintang */
    fresh: function (before, after) { return DEKOR.filter(function (d) { return before < d.stars && after >= d.stars; }); },
    next: function (total) { return DEKOR.filter(function (d) { return total < d.stars; })[0] || null; },
    /* panel "Pabrikku": jumlah bintang + lencana tiap hiasan (gembok bila belum) + hiasan berikutnya */
    panel: function () {
      var t = Dekor.total(), nx = Dekor.next(t), D2 = STR.dekor, el = U.h('div', 'deco-panel');
      var badges = DEKOR.map(function (d) {
        var on = t >= d.stars, name = D2.names[d.id];
        return '<span class="badge' + (on ? ' on' : '') + '" role="img" aria-label="' + U.fmt(on ? D2.open : D2.locked, { name: name, n: d.stars }) + '">' + svg(on ? d.id : 'lock', 34) + '</span>';
      }).join('');
      el.innerHTML = '<div class="dh"><span class="dt">' + D2.title + '</span><span class="ds">' + svg('star', 28) + t + '/' + Dekor.max() + '</span></div>' +
        '<div class="db">' + badges + '</div><div class="dn">' + (nx ? U.fmt(D2.next, { n: nx.stars - t, name: D2.names[nx.id] }) : D2.all) + '</div>';
      el.setAttribute('aria-label', U.fmt(D2.stars, { n: t, max: Dekor.max() }));
      return el;
    },

    /* ===== gambar (koordinat kanvas logis) ===== */
    /* untaian bendera segitiga dari (x0, y) ke (x1, y), melengkung sag px, bergoyang pelan */
    flags: function (x0, x1, y, sag, t) {
      var c = D.ctx, n = Math.round((x1 - x0) / 44), cols = [C.coral, C.brass, C.mint, C.lav, C.green];
      c.save(); c.strokeStyle = C.ink; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); c.stroke();
      for (var i = 0; i < n; i++) {
        var k = (i + 0.5) / n, px = x0 + (x1 - x0) * k, py = y + sag * 4 * k * (1 - k), sw = D.reduce ? 0 : Math.sin(t * 2 + i) * 2;
        c.fillStyle = cols[i % cols.length];
        c.beginPath(); c.moveTo(px - 14, py); c.lineTo(px + 14, py); c.lineTo(px + sw, py + 30); c.closePath(); c.fill(); c.stroke();
      }
      c.restore();
    },
    /* lampu gantung kuningan yang berayun, menyala lembut */
    lamp: function (x, y0, len, t, ph) {
      var c = D.ctx, a = D.reduce ? 0 : Math.sin(t * 1.2 + (ph || 0)) * 0.06, ex = x + Math.sin(a) * len, ey = y0 + Math.cos(a) * len;
      c.save(); c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y0); c.lineTo(ex, ey); c.stroke();
      D.glow(ex, ey + 30, 70, C.brass, 0.35);
      c.translate(ex, ey); c.rotate(-a);
      c.fillStyle = C.cream; c.beginPath(); c.arc(0, 26, 10, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = C.brass; c.beginPath(); c.moveTo(-28, 26); c.quadraticCurveTo(-26, 0, 0, 0); c.quadraticCurveTo(26, 0, 28, 26); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = C.brassD; c.fillRect(-6, -6, 12, 7); c.strokeRect(-6, -6, 12, 7);
      c.restore();
    },
    /* piala Insinyur di alas */
    trophy: function (x, base, t) {
      var c = D.ctx, s = 1 + (D.reduce ? 0 : Math.sin(t * 2) * 0.01);
      D.shadow(x, base - 2, 34, 7, 0.3);
      c.save(); c.translate(x, base); c.scale(s, s); c.strokeStyle = C.ink; c.lineWidth = 4; c.lineJoin = 'round';
      c.fillStyle = C.wallD; D.rrect(c, -34, -26, 68, 26, 6); c.fill(); c.stroke();
      c.fillStyle = C.brassD; c.beginPath(); c.moveTo(-14, -26); c.lineTo(14, -26); c.lineTo(8, -44); c.lineTo(-8, -44); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = C.brass; c.beginPath(); c.moveTo(-28, -92); c.lineTo(28, -92); c.lineTo(28, -76); c.quadraticCurveTo(26, -46, 0, -46); c.quadraticCurveTo(-26, -46, -28, -76); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-28, -84); c.quadraticCurveTo(-46, -84, -40, -66); c.quadraticCurveTo(-36, -58, -24, -58); c.stroke();
      c.beginPath(); c.moveTo(28, -84); c.quadraticCurveTo(46, -84, 40, -66); c.quadraticCurveTo(36, -58, 24, -58); c.stroke();
      c.restore();
      D.sparkle(x + 14, base - 80, 6 + 3 * Math.sin(t * 4), C.cream);
    }
  };
  root.Dekor = Dekor;
})(window);
