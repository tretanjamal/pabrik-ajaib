/* Tabel Perkalian bantu (panel, dipakai layar bermain, Pilih Mesin, dan Latihan).
   Lampu hijau + tanda centang = fakta dikuasai (2 kali benar langsung); ungu muda = pernah dicoba.
   Ketuk / Enter pada kotak: fakta beserta dua kalimat kebalikannya (7 × 8 = 56, 56 : 8 = 7, 56 : 7 = 8) + susunan titik.
   Keyboard: panah bergerak di dalam kisi (kiri/kanan 1 kotak, atas/bawah 1 baris), satu kotak saja yang masuk urutan Tab. */
(function (root) {
  var T = STR.tableUI, CHECK = '<svg class="ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#2E2350" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function state(r, c) {
    if (r === 1 || c === 1) return 'one';
    var f = Math.min(r, c) + 'x' + Math.max(r, c);
    return Save.mastered(f) ? 'ok' : (Save.data.facts[f] ? 'seen' : 'none');
  }
  /* susunan titik r baris x c kolom (maks. 10 x 10) */
  function dots(r, c) {
    var s = Math.min(14, 150 / Math.max(r, c)), h = '';
    for (var i = 0; i < r; i++) for (var j = 0; j < c; j++) h += '<circle cx="' + (s / 2 + j * s) + '" cy="' + (s / 2 + i * s) + '" r="' + (s * 0.36) + '" fill="#FFC23D" stroke="#2E2350" stroke-width="1.2"/>';
    return '<svg class="tdots" viewBox="0 0 ' + c * s + ' ' + r * s + '" width="' + c * s + '" height="' + r * s + '" aria-hidden="true">' + h + '</svg>';
  }
  function countMastered() {
    var k = 0, all = 0;
    for (var a = 2; a <= 10; a++) for (var b = a; b <= 10; b++) { all++; if (Save.mastered(a + 'x' + b)) k++; }
    return { k: k, all: all };
  }

  var Tabel = {
    countMastered: countMastered,
    open: function (onClose) {
      var o = UI.overlay(STR.tableTitle, 'tablepanel'), wrap = U.h('div', 'twrap');
      var g = U.h('div', 'ttable'), h = '<div class="hd">×</div>';
      g.setAttribute('role', 'grid');
      for (var c = 1; c <= 10; c++) h += '<div class="hd" data-c="' + c + '">' + c + '</div>';
      for (var r = 1; r <= 10; r++) {
        h += '<div class="hd" data-r="' + r + '">' + r + '</div>';
        for (c = 1; c <= 10; c++) {
          var s = state(r, c);
          h += '<button type="button" class="tc ' + s + '" data-r="' + r + '" data-c="' + c + '" tabindex="-1" aria-label="' + U.fmt(T.cell, { a: r, b: c, c: r * c }) + ', ' + T.st[s] + '">' + r * c + (s === 'ok' ? CHECK : '') + '</button>';
        }
      }
      g.innerHTML = h;
      var side = U.h('div', 'tside'), cnt = countMastered();
      var info = U.h('div', 'tinfo', '<p class="tpick">' + T.pick + '</p>');
      info.setAttribute('aria-live', 'polite');
      side.appendChild(info);
      side.appendChild(U.h('div', 'tlegend', '<span><i class="sw ok">' + CHECK + '</i>' + T.legend.ok + '</span><span><i class="sw seen"></i>' + T.legend.seen + '</span><span><i class="sw none"></i>' + T.legend.none + '</span>'));
      side.appendChild(U.h('p', 'tcount', U.fmt(T.count, cnt)));
      var b = Input.button(STR.close, 'mint wide', function () { o.close(); }, { id: 'close' });
      side.appendChild(b);
      wrap.appendChild(g); wrap.appendChild(side); o.body.appendChild(wrap);
      var cells = Array.prototype.slice.call(g.querySelectorAll('.tc'));
      function show(cell) {
        var rr = +cell.dataset.r, cc = +cell.dataset.c, p = rr * cc, s = state(rr, cc);
        cells.forEach(function (x) { x.classList.remove('pick'); x.tabIndex = -1; });
        cell.classList.add('pick'); cell.tabIndex = 0;
        g.querySelectorAll('.hd').forEach(function (x) { x.classList.toggle('on', +x.dataset.r === rr || +x.dataset.c === cc); });
        info.innerHTML = '<div class="tfact">' + rr + ' × ' + cc + ' = ' + p + '</div>' +
          '<div class="tinv">' + p + ' : ' + cc + ' = ' + rr + '<br>' + p + ' : ' + rr + ' = ' + cc + '</div>' + dots(rr, cc) +
          '<div class="tst ' + s + '">' + T.st[s] + '</div>';
        Aud.sfx('pick');
      }
      g.addEventListener('click', function (e) { var cell = e.target.closest('.tc'); if (cell) show(cell); });
      g.addEventListener('keydown', function (e) {
        var cell = e.target.closest('.tc'); if (!cell) return;
        var i = cells.indexOf(cell), d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10 }[e.key];
        if (d == null) return;
        e.preventDefault(); e.stopPropagation();
        var r = Math.floor(i / 10) + (Math.abs(d) === 10 ? d / 10 : 0), c = i % 10 + (Math.abs(d) === 1 ? d : 0);
        var n = r >= 0 && r < 10 && c >= 0 && c < 10 ? cells[r * 10 + c] : cell;   // tepi kisi: tetap di tempat
        cells.forEach(function (x) { x.tabIndex = -1; }); n.tabIndex = 0; n.focus();
      });
      cells[11].tabIndex = 0;   // 2 x 2: kotak pertama dalam urutan Tab
      o.onClose = onClose;
      setTimeout(function () { b.focus(); }, 30);
      if (U.TEST) { window.__test = window.__test || {}; window.__test.tablePick = function (r, c) { show(cells[(r - 1) * 10 + (c - 1)]); return info.textContent; }; }
      return o;
    }
  };
  root.Tabel = Tabel;
})(window);
