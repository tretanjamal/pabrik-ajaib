/* Level 1 "Mesin Satu Langkah" (konkret): a peti x b isi = c benda. Cari yang hilang (aturan, hasil, atau jumlah peti).
   Peti kosong masuk dari kiri, mesin berjalan, peti keluar berisi produk, isi dihitung loncat di atas tiap peti.
   Salah: hasil tebakan tetap diperlihatkan + petunjuk bertingkat (peragaan membagi rata / hitung loncat / mengisi peti). */
(function () {
  var P = Play, L = SKALA.LAYOUT.play, C = Art.C, CFG = SOAL.L1, OUT = { x0: 734, w: 528 };
  var rig, st, els = {};
  var fmt = P.fmt;
  function pname(q) { return STR.products[q.product]; }
  function vars(q, extra) { var o = { a: q.a, b: q.b, c: q.c, p: pname(q) }; for (var k in extra || {}) o[k] = extra[k]; return o; }
  /* isi kotak ? di papan: angka saja agar tertulis 3 × 2 = 6 (kartu dan layar mesin tetap ×2) */
  function cardText(q, v) { return String(v); }

  var LV = {
    setup: function () {
      rig = Rig(L.M, L.mx, L.top);
      st = { beltL: 0, beltR: 0, beltLv: 0, beltRv: 0, inCrates: [], outCrates: [] };
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
      els.ticket = U.h('div', 'tag-sign order'); els.ticket.style.cssText = 'left:930px;top:96px;width:184px';
      root.appendChild(els.inSign); root.appendChild(els.ticket);
    },
    knob: function () { return rig.knob(0.35); },
    pull: function () { return rig.pull(); },
    gen: function (type) {
      var S = P.S;
      return (S.idx === 0 && !Save.data.onboarded) ? Soal.onboarding() : Soal.L1(S.rnd, type, S.tier, S.last, Save.weakFacts());
    },
    similar: function (q) { return Soal.similar(P.S.rnd, q); },
    skillKey: function (q) { return q.type; },
    sayText: function (q) { return fmt(STR.say[q.type], vars(q)); },
    show: function (q, my) {
      setBoard(null); setSigns(q); setScreen(q);
      st.inCrates = []; st.outCrates = [];
      layoutIn(q.type === 'input' ? 0 : q.a, true);
      st.beltLv = 140;
      return Tween.wait(700).then(function () { st.beltLv = 0; });
    },
    intro: function (q) {
      if (!q.guided) return false;
      var my = P.S;
      P.bubble.say(STR.say.guide1).then(function () { if (P.alive(my) && my.phase === 'choose' && !my.selected) return Tween.wait(1200).then(function () { if (P.alive(my) && my.phase === 'choose' && !my.selected) P.bubble.say(STR.say.guide1tap); }); });
      var c = P.els.cards.filter(function (c) { return c.d.err === 'ok'; })[0], a = LV.targets[0].anchor;
      P.hand.drag(c.hx + 62, c.hy + 130, a.x, a.y);   // mulai dari tepi bawah kartu agar angkanya tetap terbaca
      my.idleShown = true;
      return true;
    },
    cardFace: function (q, cd) {
      var cls = 'k-' + (q.type === 'rule' ? 'rule' : q.type === 'output' ? 'num' : 'crate');
      var aria = q.type === 'rule' ? fmt(STR.cardRule, { v: cd.v }) : q.type === 'input' ? fmt(STR.cardCrate, { v: cd.v }) : fmt(STR.cardNum, { v: cd.v });
      var unit = q.type === 'input' ? Assets.imgEl('crate').outerHTML + STR.crates : q.type === 'output' ? pname(q) : STR.perCrate;
      return { cls: cls, aria: aria, main: q.type === 'rule' ? '<span class="x">×</span>' + cd.v : String(cd.v), unit: unit };
    },
    onPlace: function (q, tid, v) {
      setBoard(cardText(q, v));
      if (q.type === 'rule') { rig.screenQ = false; rig.screen = '×' + v; rig.screenCol = C.cream; }
      if (q.type === 'input') { st.inCrates = []; layoutIn(v, false); st.inCrates.forEach(function (c) { c.alpha = 0; Tween.run(250, function (e) { c.alpha = e; }); }); }
      rig.lamps[0] = 1; rig.lampCol[0] = C.brass;
      if (q.guided) { var k = rig.knob(0.35); P.bubble.say(v === q.b ? STR.say.guide2 : STR.say.pull); P.hand.at(k.x, k.y); P.S.idleShown = true; return true; }
      return false;
    },
    run: async function (q, placed, my) {
      var v = placed.slot;
      st.outCrates = [];
      var res = Soal.runWith(q, v);
      st.beltLv = 160;   // peti masuk ke corong
      var ins = st.inCrates.slice();
      await Promise.all(ins.map(function (cr, i) {
        var x0 = cr.x;
        return Tween.run(520 + i * 40, function (e) { cr.x = x0 + (rig.inX + 20 - x0) * e; cr.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
      }));
      if (!P.alive(my)) return res;
      st.beltLv = 0; st.inCrates = [];
      await rig.run(1300); if (!P.alive(my)) return res;
      await produce(res.crates, res.per, q.product, my);
      return res;
    },
    solve: function (q, placed) { return Soal.solves(q, placed.slot); },
    errOf: function (q, placed, cards) { return cards[0].err; },
    wrongMsg: function (q, placed, res) { return fmt(STR.wrong[q.type], vars(q, { v: placed.slot, t: res.total })); },
    goodMsg: function (q, rnd) { return STR.good[Math.floor(rnd() * STR.good.length)] + ' ' + fmt(STR.goodSum, vars(q)); },
    correctFx: function (q, placed) {
      els.ticket.className = 'tag-sign order ok';
      setBoard(cardText(q, placed.slot), true);
      rig.lamps[0] = 1; rig.lampCol[0] = C.green;
      D.burst(1020, 170, 18); D.burst(OUT.x0 + OUT.w / 2, rig.beltY - 60, 14);
    },
    leave: async function (q, my) {   // peti hasil meluncur keluar ke kanan
      st.beltRv = 260;
      var outs = st.outCrates.slice();
      await Promise.all(outs.map(function (cr) { var x0 = cr.x, y0 = cr.y; cr.label = ''; return Tween.run(700, function (e) { cr.x = x0 + 700 * e; cr.y = y0 + (rig.beltY - y0) * Math.min(1, e * 3); cr.alpha = 1 - e; }, Ease.easeInOutCubic); }));
      st.beltRv = 0; st.outCrates = []; rig.lamps[0] = 0;
    },
    cough: function () { rig.cough(); rig.lamps[0] = 1; rig.lampCol[0] = C.brass; },
    /* soal a × b = ?: jawaban terlihat setelah mesin jalan, jadi percobaan berikutnya memakai soal baru */
    reveals: function (q) { return q.type === 'output'; },
    tip: function (q, err, res) {
      var W = STR.wrong, v = P.S.placed.slot;
      if (err === 'add') {   // menjumlah: tunjukkan penjumlahan yang dilakukan murid
        var x = q.type === 'input' ? v : q.a, y = q.type === 'rule' ? v : q.b;
        return fmt(W.add, { x: x, y: y, s: x + y });
      }
      if (err === 'near' && res && q.type !== 'output') {   // "hampir" hanya bila memang dekat; arah saja, tanpa menyebut jawaban
        var hi = res.total > q.c, close = Math.abs(res.total - q.c) <= q.c * 0.25;
        return close ? (hi ? W.nearHigh : W.nearLow) : (hi ? W.high : W.low);
      }
      var t = err && W[err] ? W[err] : (err === 'ok' ? W.again : STR.helpTip[q.type]);
      return fmt(t, vars(q));
    },
    hint2: async function (q) {
      P.highlightBoard();
      st.inCrates.forEach(function (c) { c.glow = true; });
      await P.bubble.say(fmt(STR.wrong.tier2, vars(q)));
    },
    demo: demo,
    afterDemo: function () { st.inCrates.forEach(function (c) { c.glow = true; }); },
    answerText: function (q) { return q.type === 'rule' ? '×' + q.b : q.type === 'input' ? q.a + ' ' + STR.crates : q.c; },
    reset: function (q) {
      // peti hasil tebakan tetap terlihat sampai mesin dijalankan lagi (dirujuk petunjuk tingkat 2)
      st.inCrates = []; layoutIn(q.type === 'input' ? 0 : q.a, false);
      st.inCrates.forEach(function (c) { c.alpha = 0; Tween.run(260, function (e) { c.alpha = e; }); if (P.S.hintLv >= 2) c.glow = true; });
      setBoard(null); setScreen(q);
      rig.lamps[0] = 0;
    },
    update: function (dt) { rig.update(dt); st.beltL += st.beltLv * dt; st.beltR += st.beltRv * dt; },
    draw: function () {
      P.drawFactory(rig.t);
      D.conveyor(-10, rig.inX + 6, rig.beltY, st.beltL);
      D.conveyor(rig.outX - 6, 1290, rig.beltY, st.beltR);
      st.inCrates.forEach(drawCrate);
      rig.draw();
      st.outCrates.filter(function (c) { return !c.lifted; }).forEach(drawCrate);
      st.outCrates.filter(function (c) { return c.lifted; }).forEach(drawCrate);
    },
    testQ: function (q) { return { type: q.type, a: q.a, b: q.b, c: q.c, guided: !!q.guided, extra: !!q.extra }; }
  };

  function setBoard(filled, ok) {
    var q = P.S.q, Q = P.Q(filled, ok), x = P.OP('×'), eq = P.OP('=');
    if (q.type === 'rule') P.board(P.N(q.a) + x + Q + eq + P.N(q.c, 1));
    else if (q.type === 'output') P.board(P.N(q.a) + x + P.N(q.b) + eq + Q);
    else P.board(Q + x + P.N(q.b) + eq + P.N(q.c, 1));
  }
  function setSigns(q) {
    var crateImg = Assets.imgEl('crate').outerHTML, prodImg = Assets.imgEl(q.product).outerHTML;
    els.inSign.innerHTML = '<div class="h">' + STR.input + '</div><div class="v">' + (q.type === 'input' ? '<span class="qm">?</span>' : q.a) + crateImg + '</div><div class="u">' + STR.crates + '</div>';
    els.ticket.className = 'tag-sign order';
    els.ticket.innerHTML = '<div class="h">' + STR.order + '</div><div class="v">' + (q.type === 'output' ? '<span class="qm">?</span>' : q.c) + prodImg + '</div><div class="u">' + pname(q) + '</div>' + stampHTML();
  }
  function setScreen(q) { rig.screenQ = q.type === 'rule'; rig.screen = q.type === 'rule' ? '×?' : '×' + q.b; rig.screenCol = C.brass; }

  function layoutIn(n, fromLeft) {
    var w = SKALA.FIXED.crate_in.w, gap = Math.min(w + 8, 360 / Math.max(1, n)), end = rig.inX - w / 2 - 6;
    for (var i = 0; i < n; i++) {
      var tx = end - (n - 1 - i) * gap, cr = { x: fromLeft ? tx - 420 : tx, y: rig.beltY, w: w, alpha: 1 };
      st.inCrates.push(cr);
      if (fromLeft) (function (cr, tx) { Tween.run(700, function (e) { cr.x = tx - 420 * (1 - e); }, Ease.easeOutCubic); })(cr, tx);
    }
  }
  function grid(n) {
    var two = n > 5, cols = two ? Math.ceil(n / 2) : n, cw = Math.min(two ? 108 : SKALA.FIXED.crate_out.w, (OUT.w - 8 * (cols - 1)) / cols);
    var ch = cw * Assets.get('crate').h / Assets.get('crate').w, total = cols * cw + (cols - 1) * 8, x0 = OUT.x0 + (OUT.w - total) / 2, out = [];
    for (var i = 0; i < n; i++) {
      var row = i < cols ? 0 : 1, col = row ? i - cols : i;
      out.push({ x: x0 + col * (cw + 8) + cw / 2, y: rig.beltY - row * (ch - 4), w: cw, row: row });
    }
    return out;
  }
  /* peti keluar dari luncuran, produk masuk, lalu hitung loncat di atas tiap peti */
  async function produce(n, per, kind, my) {
    var pos = grid(n);
    st.beltRv = 160;
    var arr = pos.map(function (p) { return { x: rig.outX, y: rig.beltY, w: p.w, n: per, kind: kind, pops: new Array(per).fill(0), alpha: 0, lifted: false }; });
    st.outCrates = arr;
    var moves = arr.map(function (cr, i) {
      var p = pos[i];
      return Tween.wait(i * 150).then(function () {
        if (!P.alive(my)) return;
        Aud.sfx('pop');
        return Tween.run(560, function (e) {
          cr.alpha = Math.min(1, e * 3); cr.x = rig.outX + (p.x - rig.outX) * e;
          if (p.row) { cr.y = rig.beltY - (rig.beltY - p.y) * Math.max(0, (e - 0.5) * 2); cr.lifted = e > 0.5; }
        }, Ease.easeInOutCubic).then(function () {
          return Promise.all(cr.pops.map(function (_, k) {   // produk meloncat masuk peti
            return Tween.wait(k * 35).then(function () { return Tween.run(220, function (e) { cr.pops[k] = e; }, Ease.linear); });
          }));
        });
      });
    });
    await Promise.all(moves); if (!P.alive(my)) return;
    st.beltRv = 0;
    for (var i = 0; i < arr.length; i++) {   // hitung loncat: b, 2b, 3b, ...
      arr[i].label = String(per * (i + 1));
      Aud.sfx('tick', 1 + i * 0.06);
      await Tween.wait(n > 6 ? 170 : 260); if (!P.alive(my)) return;
    }
  }
  /* peragaan: rule = membagi rata ke peti; output = hitung loncat; input = mengisi peti b demi b sampai habis */
  async function demo(q, my) {
    var pos = grid(q.a), arr = pos.map(function (p) { return { x: p.x, y: p.y, w: p.w, n: q.b, kind: q.product, pops: new Array(q.b).fill(q.type === 'output' ? 1 : 0), alpha: 0, lifted: p.row === 1 }; });
    st.outCrates = arr;
    await Promise.all(arr.map(function (cr) { return Tween.run(250, function (e) { cr.alpha = e; }); }));
    var step = Math.max(45, Math.min(140, 2600 / q.c)), i;
    if (q.type === 'rule') {
      P.bubble.say(STR.wrong.tier3);
      for (var k = 0; k < q.c; k++) {
        var cr = arr[k % q.a], idx = Math.floor(k / q.a);
        (function (cr, idx) { Tween.run(160, function (e) { cr.pops[idx] = e; }, Ease.linear); })(cr, idx);
        cr.label = String(idx + 1);
        Aud.sfx('pop');
        await Tween.wait(step); if (!P.alive(my)) return;
      }
    } else if (q.type === 'output') {
      P.bubble.say(fmt(STR.wrong.tier3out, vars(q)));
      for (i = 0; i < arr.length; i++) { arr[i].label = String(q.b * (i + 1)); arr[i].glow = true; Aud.sfx('tick', 1 + i * 0.08); await Tween.wait(520); if (!P.alive(my)) return; arr[i].glow = false; }
    } else {
      P.bubble.say(fmt(STR.wrong.tier3in, vars(q)));
      for (i = 0; i < arr.length; i++) {
        for (var j = 0; j < q.b; j++) { (function (cr, j) { Tween.run(150, function (e) { cr.pops[j] = e; }, Ease.linear); })(arr[i], j); Aud.sfx('pop'); await Tween.wait(step); if (!P.alive(my)) return; }
        arr[i].label = (i + 1) + ' ' + STR.crates; Aud.sfx('tick', 1 + i * 0.08);
      }
    }
    await Tween.wait(500);
  }

  function stampHTML() { return '<div class="stamp"><svg width="34" height="34" viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" fill="none" stroke="#2E2350" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'; }
  P.stampHTML = stampHTML;
  P.levels[1] = LV;
})();
