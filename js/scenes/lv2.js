/* Level 2 "Mesin Kebalikan" (gambar): array titik. Papan titik = a kolom (banyak kelompok) x b titik (isi tiap kelompok) = c.
   Jenis: div (c : b = ?), missf (? x b = c, dicari dengan pembagian), divisor (c : ? = a, bagi rata).
   Benar: kalimat kebalikan ditampilkan (42 : 6 = 7, jadi 7 x 6 = 42). Memakai operasi yang sama: mesin berjalan mundur
   dan layar berganti ke operasi kebalikannya. Peragaan: titik dikelompokkan / dibagi rata satu-satu sambil dihitung. */
(function () {
  var P = Play, L = SKALA.LAYOUT.play, C = Art.C, BOARD = { x: 762, y: 238, w: 486, h: 292 };
  var rig, board, st, els = {};
  var fmt = P.fmt;
  function vars(q, extra) { var o = { a: q.a, b: q.b, c: q.c }; for (var k in extra || {}) o[k] = extra[k]; return o; }
  /* keping masuk di ban: missf = belum diketahui, mul (Latihan) = banyak kelompok, lainnya = jumlah titik */
  function chipVal(q) { return q.type === 'missf' ? '?' : q.type === 'mul' ? q.a : q.c; }
  function dotIcon() { return '<svg class="dot-ico" viewBox="0 0 40 40" aria-hidden="true">' + [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return '<circle cx="' + (8 + i * 12) + '" cy="' + (8 + j * 12) + '" r="4.5" fill="#FFC23D" stroke="#2E2350" stroke-width="2"/>'; }).join(''); }).join('') + '</svg>'; }

  var LV = {
    setup: function () {
      rig = Rig(L.M, L.mx, L.top);
      board = DotBoard(BOARD);
      st = { beltL: 0, beltLv: 0, chip: null, back: 0 };
      var rs = rig.slotRect();
      LV.targets = [{
        id: 'slot', label: STR.slot,
        zone: { x: rig.x0 - 30, y: rig.y0, w: rig.w + 60, h: rig.h },
        btn: { x: rs.x - 26, y: rs.y - 36, w: rs.w + 52, h: rs.h + 72 },
        anchor: { x: rs.x + rs.w / 2, y: rs.y + rs.h / 2 }
      }];
    },
    build: function (root) {
      els.inSign = U.h('div', 'tag-sign'); els.inSign.style.cssText = 'left:132px;top:96px;width:170px';
      els.outSign = U.h('div', 'tag-sign order'); els.outSign.style.cssText = 'left:930px;top:96px;width:184px';
      root.appendChild(els.inSign); root.appendChild(els.outSign);
    },
    knob: function () { return rig.knob(0.35); },
    pull: function () { return rig.pull(); },
    gen: function (type) { var S = P.S; return Soal.L2(S.rnd, type, S.tier, S.last, Save.weakFacts()); },
    similar: function (q) { return Soal.similar2(P.S.rnd, q); },
    skillKey: function (q) { return q.type; },
    sayText: function (q) { return fmt(STR.L2.say[q.type], vars(q)); },
    show: function (q) {
      setBoard(q, null); setSigns(q, null); setScreen(q);
      idleBoard(q);
      st.chip = { x: -80, y: rig.beltY, v: chipVal(q), alpha: 1 };
      st.beltLv = 150;
      var chip = st.chip, tx = rig.inX - 70;
      return Tween.run(700, function (e) { chip.x = -80 + (tx + 80) * e; }, Ease.easeOutCubic).then(function () { st.beltLv = 0; });
    },
    cardFace: function (q, cd) {
      return { cls: 'k-num', aria: fmt(STR.cardNum, { v: cd.v }), main: String(cd.v), unit: q.type === 'divisor' ? STR.perGroup : q.type === 'mul' ? STR.dots : STR.group };
    },
    onPlace: function (q, tid, v) {
      setBoard(q, v);
      if (q.type === 'missf') { st.chip.v = v; setSigns(q, v); }
      if (q.type === 'divisor') { rig.screenQ = false; rig.screen = ':' + v; rig.screenCol = C.cream; }
      rig.lamps[0] = 1; rig.lampCol[0] = C.brass;
      return false;
    },
    run: async function (q, placed, my) {
      var v = placed.slot, res = Soal.run2(q, v), chip = st.chip;
      board.clear();
      st.beltLv = 160;
      var x0 = chip.x;
      await Tween.run(560, function (e) { chip.x = x0 + (rig.inX + 20 - x0) * e; chip.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
      if (!P.alive(my)) return res;
      st.beltLv = 0;
      await rig.run(1100); if (!P.alive(my)) return res;
      await showResult(q, res, my);
      return res;
    },
    solve: function (q, placed) { return Soal.solves2(q, placed.slot); },
    errOf: function (q, placed, cards) { return cards[0].err; },
    wrongMsg: function (q, placed, res) { return fmt(STR.L2.wrong[q.type], vars(q, { v: placed.slot, t: res.out })); },
    goodMsg: function (q) { return fmt(STR.L2.good, vars(q)); },
    correctFx: function (q, placed) {
      els.outSign.className = 'tag-sign order ok';
      setBoard(q, placed.slot, true);
      rig.lamps[0] = 1; rig.lampCol[0] = C.green;
      board.glowCols = true;
      D.burst(1020, 170, 18); D.burst(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h / 2, 14);
    },
    leave: async function (q, my) {
      // kalimat kebalikan di papan atas: c : b = a  <->  a x b = c
      if (q.type === 'mul') P.board(P.N(q.c) + P.OP(':') + P.N(q.b) + P.OP('=') + P.N(q.a, 1), 'inv');
      else P.board(P.N(q.a) + P.OP('×') + P.N(q.b) + P.OP('=') + P.N(q.c, 1), 'inv');
      Aud.sfx('whoosh');
      await Tween.wait(1100); if (!P.alive(my)) return;
      await Tween.run(300, function (e) { board.alpha = 1 - e; }); if (!P.alive(my)) return;
      board.clear(); board.alpha = 1; rig.lamps[0] = 0;
      board.title = ''; board.text = '';
    },
    cough: function () { rig.cough(); rig.lamps[0] = 1; rig.lampCol[0] = C.brass; },
    /* c : b = ? dan a × b = ?: jawaban terlihat di papan titik, jadi percobaan berikutnya memakai soal baru */
    reveals: function (q) { return q.type === 'div' || q.type === 'mul'; },
    tip: function (q, err) {
      if (err === 'same') { backward(q); return fmt(STR.L2.back, vars(q)); }
      if (err === 'near' && q.type === 'divisor') return fmt(STR.L2.tips.nearDiv, vars(q));   // "hitung loncat b" membocorkan b
      if (err === 'near' && q.type === 'mul') return fmt(STR.L2.help.mul, vars(q));
      if (err && STR.L2.tips[err]) return fmt(STR.L2.tips[err], vars(q));
      return err === 'ok' ? STR.wrong.again : fmt(STR.L2.help[q.type], vars(q));
    },
    hint2: async function (q) {
      P.highlightBoard();
      board.set(q.a, q.b, 0, true); board.glowCols = true;
      board.title = q.type === 'mul' ? q.a + ' ' + STR.group + ' × ' + q.b : fmt('{c} ' + STR.dots, vars(q));   // a x b = ?: jangan sebut jumlahnya
      await P.bubble.say(fmt(STR.L2.tier2[q.type], vars(q)));
    },
    demo: async function (q, my) {
      board.set(q.a, q.b, 0, false); board.title = fmt('{c} ' + STR.dots, vars(q));
      var step = Math.max(160, Math.min(420, 3200 / q.a));
      P.bubble.say(fmt(STR.L2.tier3[q.type], vars(q)));
      if (q.type === 'divisor') await board.deal(Math.max(160, Math.min(420, 3200 / q.b)), function () { return P.alive(my); });
      else await board.fillCols(step, function () { return P.alive(my); });
      if (!P.alive(my)) return;
      board.title = q.a + ' ' + STR.group + ' × ' + q.b + ' = ' + q.c;
      await Tween.wait(600);
    },
    answerText: function (q) { return q.answer; },
    reset: function (q) {
      st.chip = { x: rig.inX - 70, y: rig.beltY, v: chipVal(q), alpha: 0 };
      var chip = st.chip; Tween.run(260, function (e) { chip.alpha = e; });
      setBoard(q, null); setSigns(q, null); setScreen(q);
      rig.lamps[0] = 0;
    },
    update: function (dt) { rig.update(dt); st.beltL += st.beltLv * dt; },
    draw: function () {
      P.drawFactory(rig.t);
      D.conveyor(-10, rig.inX + 6, rig.beltY, st.beltL);
      D.conveyor(rig.outX - 6, BOARD.x + 20, rig.beltY, 0);
      if (st.chip) drawChip(st.chip);
      rig.draw();
      board.draw();
    },
    testQ: function (q) { return { type: q.type, a: q.a, b: q.b, c: q.c, extra: !!q.extra }; }
  };

  /* sebelum mesin jalan: titik masuk (atau pesanan, untuk missf) bertumpuk di papan; Latihan a x b = ?: belum ada titik */
  function idleBoard(q) {
    board.clear();
    if (q.type === 'mul') { board.text = '?'; board.sub = q.a + ' ' + STR.group + ' × ' + q.b; return; }
    board.pile = q.c; board.title = q.c + ' ' + STR.dots;
  }
  function setBoard(q, filled, ok) {
    var Q = P.Q(filled, ok), d = P.OP(':'), x = P.OP('×'), eq = P.OP('=');
    if (q.type === 'div') P.board(P.N(q.c) + d + P.N(q.b) + eq + Q);
    else if (q.type === 'missf') P.board(Q + x + P.N(q.b) + eq + P.N(q.c, 1));
    else if (q.type === 'mul') P.board(P.N(q.a) + x + P.N(q.b) + eq + Q);
    else P.board(P.N(q.c) + d + Q + eq + P.N(q.a, 1));
  }
  function setSigns(q, placedIn) {
    var qm = '<span class="qm">?</span>', grpIn = q.type === 'missf' || q.type === 'mul';
    var inV = q.type === 'missf' ? (placedIn != null ? placedIn : qm) : q.type === 'mul' ? q.a : q.c, inU = grpIn ? STR.group : STR.dots;
    var outV = q.type === 'div' || q.type === 'mul' ? qm : q.type === 'missf' ? q.c : q.a, outU = grpIn ? STR.dots : STR.group;
    els.inSign.innerHTML = '<div class="h">' + STR.input + '</div><div class="v">' + inV + (grpIn ? '' : dotIcon()) + '</div><div class="u">' + inU + '</div>';
    els.outSign.className = 'tag-sign order';
    els.outSign.innerHTML = '<div class="h">' + STR.out + '</div><div class="v">' + outV + (grpIn ? dotIcon() : '') + '</div><div class="u">' + outU + '</div>' + P.stampHTML();
  }
  function setScreen(q) {
    rig.screenQ = q.type === 'divisor';
    rig.screen = q.type === 'divisor' ? ':?' : (q.type === 'div' ? ':' : '×') + q.b;
    rig.screenCol = C.brass;
  }
  /* hasil mesin di papan titik: kelompokkan (div/missf) atau bagi rata (divisor); terlalu banyak = angka saja */
  async function showResult(q, res, my) {
    var alive = function () { return P.alive(my); };
    if (!board.drawable(res.cols, res.per, 0)) {
      board.clear(); board.text = String(res.total); board.sub = STR.L2.tooMany;
      Aud.sfx('pop'); await Tween.wait(500); return;
    }
    board.set(res.cols, res.per, 0, false);
    if (q.type === 'divisor') { await board.deal(Math.max(120, Math.min(320, 2400 / res.per)), alive); }
    else await board.fillCols(Math.max(120, Math.min(300, 2400 / res.cols)), alive);
    if (!alive()) return;
    board.title = res.cols + ' ' + STR.group + ' × ' + res.per + ' = ' + res.total;
    await Tween.wait(300);
  }
  /* operasi sama: mesin berjalan mundur, keping kembali, layar berganti ke operasi kebalikan */
  function backward(q) {
    var opF = '×', opB = ':', b = q.b;   // murid mengali (operasi yang tampak), padahal perlu kebalikannya: bagi
    st.chip = { x: rig.inX + 10, y: rig.beltY, v: chipVal(q), alpha: 0 };
    var chip = st.chip;
    st.beltLv = -170; Aud.sfx('whoosh');
    Tween.run(900, function (e) { chip.alpha = Math.min(1, e * 3); chip.x = rig.inX + 10 - 80 * e; }, Ease.easeOutCubic).then(function () { st.beltLv = 0; });
    rig.screenQ = false; rig.screen = opF + b; rig.screenCol = C.cream;
    Tween.wait(450).then(function () { rig.screen = opB + b; rig.screenCol = C.brass; rig.lamps[1] = 1; rig.lampCol[1] = C.brass; Aud.sfx('card'); })
      .then(function () { return Tween.wait(1400); }).then(function () { rig.lamps[1] = 0; });
  }
  P.levels[2] = LV;

  /* Latihan bebas per tabel: papan titik dan mesin yang sama dengan Level 2, b = tabel pilihan.
     Jenis: mul (a x b = ?), div (c : b = ?), missf (? x b = c). Tidak memberi bintang mesin. */
  var LT = Object.create(LV);
  LT.hud = function () { return fmt(STR.LT.hud, { n: P.S.table }); };
  LT.gen = function (type) { var S = P.S; return Soal.LT(S.rnd, S.table, type, S.last, Save.weakFacts()); };
  LT.similar = function (q) { return Soal.similarLT(P.S.rnd, q); };
  LT.skillKey = function (q) { return 'lt' + q.type; };
  LT.sayText = function (q) { return fmt(STR.LT.say[q.type], vars(q)); };
  P.levels.lt = LT;
})();
