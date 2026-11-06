/* Level 3 "Tebak Aturan" (abstrak): 3 pasangan masukan -> keluaran, murid memilih kartu aturan (x atau :).
   Mesin menjalankan aturan pilihan pada ketiga masukan satu per satu; tiap hasil ditandai cocok / tidak cocok.
   Bantuan visual bisa dibuka (petunjuk tingkat 2 / tombol Bantuan): papan titik untuk pasangan pertama. */
(function () {
  var P = Play, L = SKALA.LAYOUT.play, C = Art.C, BOX = { x: 760, y: 108, w: 490, h: 424 };
  var rig, board, st, els = {};
  var fmt = P.fmt, RT = Soal.ruleText;
  var ARROW = '<svg class="ar" viewBox="0 0 48 32" aria-hidden="true"><path d="M4 16h34M28 6l12 10-12 10" fill="none" stroke="#2E2350" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MARK_OK = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#7CD957" stroke="#2E2350" stroke-width="4"/><path d="M14 25l7 7 13-14" fill="none" stroke="#2E2350" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MARK_NO = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#FFC23D" stroke="#2E2350" stroke-width="4"/><path d="M13 19h22M13 29h22M30 11L18 37" fill="none" stroke="#2E2350" stroke-width="5" stroke-linecap="round"/></svg>';

  var ruleHTML = P.ruleHTML;
  function firstBad(q, r) { var rs = Soal.run3(q, r); for (var i = 0; i < rs.length; i++) if (!rs[i].ok) return rs[i]; return rs[0]; }

  var LV = {
    setup: function () {
      rig = Rig(L.M, L.mx, L.top);
      board = DotBoard({ x: BOX.x + 6, y: BOX.y + 6, w: BOX.w - 12, h: BOX.h - 12 });
      st = { beltL: 0, beltLv: 0, chips: [], dots: false };
      var rs = rig.slotRect();
      LV.targets = [{
        id: 'slot', label: STR.slot,
        zone: { x: rig.x0 - 30, y: rig.y0, w: rig.w + 60, h: rig.h },
        btn: { x: rs.x - 26, y: rs.y - 36, w: rs.w + 52, h: rs.h + 72 },
        anchor: { x: rs.x + rs.w / 2, y: rs.y + rs.h / 2 }
      }];
    },
    build: function (root) {
      els.table = U.h('div', 'pairs');
      els.table.style.cssText = 'left:' + BOX.x + 'px;top:' + BOX.y + 'px;width:' + BOX.w + 'px;height:' + BOX.h + 'px';
      root.appendChild(els.table);
    },
    knob: function () { return rig.knob(0.35); },
    pull: function () { return rig.pull(); },
    gen: function (type) { var S = P.S; return Soal.L3(S.rnd, type, S.tier, S.last); },
    similar: function (q) { return Soal.similar3(P.S.rnd, q); },
    skillKey: function (q) { return q.type === 'mul' ? 'mul' : 'div3'; },
    sayText: function () { return STR.L3.say; },
    show: function (q) {
      setBoard(null); buildTable(q); showDots(false);
      rig.screenQ = true; rig.screen = '?'; rig.screenCol = C.brass;
      st.chips = []; layoutChips(q, true);
      st.beltLv = 150;
      return Tween.wait(700).then(function () { st.beltLv = 0; });
    },
    cardFace: function (q, cd) {
      return { cls: 'k-rule', aria: fmt(STR.cardRuleAny, { v: RT(cd.v) }), main: ruleHTML(cd.v), unit: STR.ruleLbl.toLowerCase(), long: cd.v.length > 3 };
    },
    onPlace: function (q, tid, v) {
      setBoard(RT(v));
      showDots(false);
      rig.screenQ = false; rig.screen = RT(v); rig.screenCol = C.cream;
      rig.lamps[0] = 1; rig.lampCol[0] = C.brass;
      return false;
    },
    run: async function (q, placed, my) {
      var r = placed.slot, res = Soal.run3(q, r);
      clearResults(); showDots(false);
      for (var i = 0; i < res.length; i++) {
        var ch = st.chips[i], x0 = ch.x;
        st.beltLv = 170;
        await Tween.run(420, function (e) { ch.x = x0 + (rig.inX + 20 - x0) * e; ch.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
        if (!P.alive(my)) return res;
        st.beltLv = 0;
        await rig.run(520); if (!P.alive(my)) return res;
        await flyResult(i, res[i], my); if (!P.alive(my)) return res;
      }
      return res;
    },
    solve: function (q, placed) { return Soal.solves3(q, placed.slot); },
    errOf: function (q, placed, cards) { return cards[0].err; },
    wrongMsg: function (q, placed) {
      var r = placed.slot, b = firstBad(q, r);
      return fmt(isNaN(b.got) ? STR.L3.wrongFrac : STR.L3.wrong, { v: RT(r), x: b.x, got: b.got, want: b.want });
    },
    goodMsg: function (q) { return fmt(STR.L3.good, { r: RT(q.rule) }); },
    correctFx: function (q, placed) {
      setBoard(RT(placed.slot), true);
      els.table.classList.add('ok');
      rig.lamps[0] = 1; rig.lampCol[0] = C.green;
      D.burst(BOX.x + BOX.w / 2, BOX.y + 80, 18); D.burst(rig.x0 + rig.w / 2, rig.y0 + 80, 12);
    },
    leave: async function (q, my) {
      await Tween.run(260, function (e) { els.table.style.opacity = 1 - e; }); if (!P.alive(my)) return;
      els.table.style.opacity = 1; els.table.classList.remove('ok'); rig.lamps[0] = 0;
    },
    cough: function () { rig.cough(); rig.lamps[0] = 1; rig.lampCol[0] = C.brass; },
    tip: function (q, err) {
      if (err && STR.L3.tips[err]) return fmt(STR.L3.tips[err], { v: P.S.placed.slot ? RT(P.S.placed.slot) : '', x: q.pairs[0][0], y: q.pairs[0][1] });
      if (err === 'ok') return STR.wrong.again;
      return fmt(STR.L3.help, { x: q.pairs[0][0], y: q.pairs[0][1] });
    },
    hint2: async function (q) {
      var rows = els.table.querySelectorAll('.pr');
      rows[0].classList.remove('hl'); void rows[0].offsetWidth; rows[0].classList.add('hl');
      openDots(q);
      await P.bubble.say(fmt(STR.L3.tier2, { x: q.pairs[0][0], y: q.pairs[0][1] }));
    },
    demo: async function (q, my) {
      showDots(false); clearResults();
      P.bubble.say(fmt(STR.L3.tier3, { ans: RT(q.rule) }));
      rig.screenQ = false; rig.screen = RT(q.rule); rig.screenCol = C.green;
      var res = Soal.run3(q, q.rule);
      for (var i = 0; i < res.length; i++) { setResult(i, res[i], RT(q.rule)); Aud.sfx('tick', 1 + i * 0.1); await Tween.wait(900); if (!P.alive(my)) return; }
      await Tween.wait(400);
    },
    answerText: function (q) { return RT(q.rule); },
    reset: function (q) {
      st.chips = []; layoutChips(q, false);
      st.chips.forEach(function (c) { c.alpha = 0; Tween.run(260, function (e) { c.alpha = e; }); });
      setBoard(null);
      rig.screenQ = true; rig.screen = '?'; rig.screenCol = C.brass;
      rig.lamps[0] = 0;
    },
    update: function (dt) { rig.update(dt); st.beltL += st.beltLv * dt; },
    draw: function () {
      P.drawFactory(rig.t);
      D.conveyor(-10, rig.inX + 6, rig.beltY, st.beltL);
      D.conveyor(rig.outX - 6, BOX.x + 20, rig.beltY, 0);
      st.chips.forEach(drawChip);
      rig.draw();
      if (st.dots) board.draw();
    },
    testQ: function (q) { return { type: q.type, rule: q.rule, pairs: q.pairs, extra: !!q.extra }; }
  };

  function setBoard(filled, ok) { P.board('<span class="lbl">' + STR.ruleLbl + '</span>' + P.Q(filled, ok), 'rule'); }
  function buildTable(q) {
    var H = STR.pairsHead;
    var h = '<div class="ph"><span>' + H[0] + '</span><span></span><span>' + H[1] + '</span><span>' + H[2] + '</span></div>';
    q.pairs.forEach(function (p, i) {
      h += '<div class="pr" data-i="' + i + '"><span class="dg">' + p[0] + '</span>' + ARROW + '<span class="dg out">' + p[1] + '</span><span class="res"></span></div>';
    });
    els.table.innerHTML = h;
    els.table.classList.remove('ok');
  }
  function clearResults() { els.table.querySelectorAll('.res').forEach(function (r) { r.innerHTML = ''; r.className = 'res'; }); }
  /* hasil mesin di kolom MESIN: angka (atau "sisa") + tanda cocok / tidak cocok */
  function setResult(i, r, ruleT) {
    var cell = els.table.querySelectorAll('.res')[i];
    var val = isNaN(r.got) ? '<small>' + STR.L3.frac + '</small>' : r.got;   // tidak bisa dibagi rata
    cell.className = 'res ' + (r.ok ? 'good' : 'bad');
    cell.innerHTML = '<span class="got">' + val + '</span><span class="mk" aria-label="' + (r.ok ? STR.L3.ok : STR.L3.no) + '">' + (r.ok ? MARK_OK : MARK_NO) + '</span>';
    if (ruleT) cell.title = ruleT;
  }
  /* keping hasil terbang dari luncuran mesin ke baris tabel */
  async function flyResult(i, r, my) {
    var cell = els.table.querySelectorAll('.res')[i], row = cell.parentNode;
    var tx = BOX.x + cell.offsetLeft + 10, ty = BOX.y + row.offsetTop + 14;
    var f = U.h('div', 'flynum', isNaN(r.got) ? '?' : String(r.got));
    var x0 = rig.outX - 40, y0 = rig.beltY - 70;
    f.style.left = x0 + 'px'; f.style.top = y0 + 'px';
    P.root.appendChild(f);
    Aud.sfx('pop');
    await Tween.run(420, function (e) { f.style.left = (x0 + (tx - x0) * e) + 'px'; f.style.top = (y0 + (ty - y0) * e - Math.sin(e * Math.PI) * 60) + 'px'; }, Ease.easeInOutCubic);
    if (f.parentNode) f.parentNode.removeChild(f);
    if (!P.alive(my)) return;
    setResult(i, r);
    Aud.sfx(r.ok ? 'tick' : 'empty', 1.2);
    await Tween.wait(160);
  }
  function layoutChips(q, fromLeft) {
    q.pairs.forEach(function (p, i) {
      var tx = rig.inX - 64 - (q.pairs.length - 1 - i) * 100, ch = { x: fromLeft ? tx - 420 : tx, y: rig.beltY, v: p[0], alpha: 1 };
      st.chips.push(ch);
      if (fromLeft) Tween.run(700, function (e) { ch.x = tx - 420 * (1 - e); }, Ease.easeOutCubic);
    });
  }
  /* bantuan visual: papan titik untuk pasangan pertama menggantikan tabel sampai kartu dipasang */
  function openDots(q) {
    var p = q.pairs[0], n = +q.rule.slice(1), mul = q.rule.charAt(0) === 'x';
    var cols = mul ? p[0] : p[1];
    board.set(cols, n, 0, true); board.glowCols = true;
    board.title = fmt(mul ? STR.L3.tier2mul : STR.L3.tier2div, { x: p[0], y: p[1], n: n });
    showDots(true);
  }
  function showDots(on) { st.dots = on; els.table.style.visibility = on ? 'hidden' : ''; }
  P.levels[3] = LV;
})();
