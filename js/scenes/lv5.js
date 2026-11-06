/* Level 5 "Pesanan Pelanggan" (soal cerita, TAMBAHAN): pelanggan (cust_a / cust_b) datang membawa cerita di balon yang
   menempel padanya. Jenis: op (pilih aturan mesin dari cerita; mesin yang menghitung), num (pilih jawaban; MESIN CEK
   menjalankan operasi kebalikannya, mis. jawaban x 12 harus 144), two (cerita dua langkah, dua machine_mini).
   Salah: pelanggan bingung, tebakan + hasil mesin diperlihatkan. Petunjuk 2 menyalakan angka dan kata penting di cerita;
   petunjuk 3 memperagakan (model kalimat, memecah bilangan jadi puluhan dan satuan, atau dua langkah berurutan). */
(function () {
  var P = Play, C = Art.C, RT = Soal.ruleText, fmt = P.fmt;
  // dua mesin sedikit lebih kecil agar tuas tidak tertutup balon cerita pelanggan
  var M = 330, M2 = 300, TOP = 160, ONE = { m: 470, out: 710, inX: 170 }, TWO = { m1: 270, m2: 580, mid: 425, out: 765, inX: 92 };
  var CUST = { x: 1140, base: 548 }, STEPS = { x: 560, y: 104, w: 470 };
  var KEY = /\d|tiap|rata|semuanya|muat|isi/;
  var m1, m2, lever, cust, cbub, st, lay = ONE, els = {};
  var ARROW = '<svg class="ar" viewBox="0 0 40 32" aria-hidden="true"><path d="M4 16h26M22 7l10 9-10 9" fill="none" stroke="#7DD3C9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function two(q) { return q.type === 'two'; }
  /* wadah sesuai benda: mainan besar tidak masuk kantong */
  function ctrOf(q) { return STR.L5.ctr[q.ctr === 2 && /duck|toybot|car/.test(q.product) ? 0 : q.ctr]; }
  function vars(q, extra) {
    var o = { a: q.a, b: q.b, c: q.c, s: q.s, m: q.m, e: q.e, p: STR.L5.prod[q.product], w: ctrOf(q), g: STR.L5.grp[q.grp] };
    if (two(q)) { o.n1 = +q.r1.slice(1); o.n2 = +q.r2.slice(1); }
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  function story(q) { return fmt(STR.L5.story[q.kind], vars(q)); }
  function unitOf(q) { return q.kind === 'group' ? ctrOf(q) : STR.products[q.product]; }
  function answerVal(q) { return two(q) ? q.e : Soal.div5(q) ? q.a : q.c; }
  var ruleHTML = P.ruleHTML;
  function mt(id, r) { return r.target(id, STR.slots[id]); }
  function setT(def) { for (var i = 0; i < LV.targets.length; i++) if (LV.targets[i].id === def.id) LV.targets[i] = def; }

  var LV = {
    setup: function () {
      cust = Customer(CUST.x, CUST.base, SKALA.FIXED.cust.h);
      st = { belt: 0, beltV: 0, start: null, mid: null, out: null, ghost: null };
      m1 = MiniRig(M, ONE.m, TOP); m2 = null;
      lever = Lever(m1.x0 + m1.w + 18, TOP + 0.48 * m1.h, M * 0.9);
      var off = { x: -400, y: 0, w: 10, h: 10 };
      LV.targets = [mt('m1', m1), { id: 'm2', label: STR.slots.m2, zone: off, btn: off, anchor: { x: 0, y: 0 } }, { id: 'in', label: STR.slots.in, zone: off, btn: off, anchor: { x: 0, y: 0 } }];
    },
    build: function (root) {
      els.midLbl = U.h('div', 'mid-lbl', STR.mid); root.appendChild(els.midLbl);
      els.checkLbl = U.h('div', 'mid-lbl check-lbl', STR.L5.check); root.appendChild(els.checkLbl);
      els.steps = U.h('div', 'steps'); els.steps.style.cssText = 'left:' + STEPS.x + 'px;top:' + STEPS.y + 'px;width:' + STEPS.w + 'px;display:none';
      root.appendChild(els.steps);
      cbub = UI.bubble(root, 'cust', 'replay-cust'); cbub.hide(true);
      var h = cust.head(); cbub.anchor(h.x + 30, h.y);
    },
    /* tata letak per soal: satu mesin (op, num) atau dua mesin (two); tombol tempat kartu dipindah oleh runner */
    layout: function (q) {
      lay = two(q) ? TWO : ONE;
      var mm = two(q) ? M2 : M;
      m1 = MiniRig(mm, two(q) ? TWO.m1 : ONE.m, TOP); m2 = two(q) ? MiniRig(mm, TWO.m2, TOP) : null;
      var last = m2 || m1, by = m1.beltY;
      lever = Lever(last.x0 + last.w + 18, TOP + 0.48 * last.h, mm * 0.9);
      setT(mt('m1', m1)); if (m2) setT(mt('m2', m2));
      setT({ id: 'in', label: STR.slots.in, zone: { x: 0, y: by - 200, w: m1.x0, h: 260 }, btn: { x: lay.inX - 80, y: by - 110, w: 160, h: 124 }, anchor: { x: lay.inX, y: by - 34 } });
      els.midLbl.style.cssText = 'left:' + (TWO.mid - 70) + 'px;top:' + (by - 132) + 'px;display:' + (two(q) ? 'block' : 'none');
      els.checkLbl.style.cssText = 'left:' + (ONE.m - 90) + 'px;top:' + (TOP - 40) + 'px;width:180px;display:' + (q.type === 'num' ? 'block' : 'none');
    },
    knob: function () { return lever.knob(0.35); },
    pull: function () { return lever.pull(); },
    gen: function (type) { var S = P.S; return Soal.L5(S.rnd, type, S.tier, S.last); },
    similar: function (q) { return Soal.similar5(P.S.rnd, q); },
    skillKey: function (q) { return q.type + '5'; },
    sayText: function (q) { return STR.L5.say[q.type]; },
    partialText: function () { return STR.L5.next; },
    show: async function (q, my) {
      setBoard(q, {}); setScreens(q, {}); showSteps(null);
      st.mid = st.out = null;
      st.ghost = q.type === 'num' ? { x: ONE.out, y: m1.beltY, v: Soal.plan5(q).e, alpha: 1, ghost: true, tag: fmt(STR.L5.mustBe, { v: Soal.plan5(q).e }), tagBelow: true } : null;
      st.start = { x: -80, y: m1.beltY, v: q.type === 'num' ? '?' : two(q) ? q.s : Soal.plan5(q).s, alpha: 1, tag: q.type === 'num' ? STR.L5.guess : STR.input };
      var ch = st.start;
      st.beltV = 150;
      Tween.run(700, function (e) { ch.x = -80 + (lay.inX + 80) * e; }, Ease.easeOutCubic).then(function () { st.beltV = 0; });
      cbub.hide(true);
      await cust.enter(q.cust); if (!P.alive(my)) return;
      cbub.hide(false);
      st.story = cbub.say(story(q));
    },
    narration: function () { return st.story; },
    cardFace: function (q, cd) {
      if (q.type === 'num') return { cls: 'k-num', aria: fmt(STR.cardNum, { v: cd.v }), main: String(cd.v), unit: unitOf(q) };
      return { cls: 'k-rule', aria: fmt(STR.cardRuleAny, { v: RT(cd.v) }), main: ruleHTML(cd.v), unit: STR.ruleLbl.toLowerCase(), long: cd.v.length > 3 };
    },
    onPlace: function (q, tid, v) {
      var placed = P.S.placed;
      showSteps(null);
      setBoard(q, placed); setScreens(q, placed);
      if (tid === 'in') st.start.v = v;
      if (!P.nextNeed()) cbub.hide(true);   // semua kartu terpasang: balon cerita minggir agar tuas terlihat
      return false;
    },
    run: async function (q, placed, my) {
      var res = Soal.run5(q, placed), ch = st.start, x0 = ch.x;
      st.out = null; st.mid = null; m1.glow = 0; if (m2) m2.glow = 0;
      cbub.hide(true);   // balon cerita disembunyikan selama mesin berjalan agar keping hasil terlihat
      st.beltV = 170;
      await Tween.run(520, function (e) { ch.x = x0 + (m1.inX + 20 - x0) * e; ch.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
      if (!P.alive(my)) return res;
      st.beltV = 0; st.start = null;
      await m1.run(760); if (!P.alive(my)) return res;
      if (!two(q)) {
        if (res.jam) { await jamChip(m1, ONE.out, res.s, my); return res; }
        if (st.ghost) st.ghost.alpha = 0.35;
        await outChip(m1, ONE.out, res.out, q.type === 'num' ? (res.ok ? String(res.want) : fmt(STR.L5.mustBe, { v: res.want })) : unitOf(q), my);
        if (st.ghost && P.alive(my)) st.ghost = null;
        return res;
      }
      if (res.jam === 1) { await jamChip(m1, TWO.mid, res.s, my); return res; }
      st.mid = { x: m1.outX, y: m1.beltY, v: res.m, alpha: 0 };
      var mid = st.mid;
      st.beltV = 170; Aud.sfx('pop');
      await Tween.run(520, function (e) { mid.alpha = Math.min(1, e * 3); mid.x = m1.outX + (TWO.mid - m1.outX) * e; }, Ease.easeInOutCubic);
      st.beltV = 0; setBoard(q, placed, false, res.m); Aud.sfx('tick', 1.1);
      await Tween.wait(600); if (!P.alive(my)) return res;
      st.beltV = 170;
      await Tween.run(460, function (e) { mid.x = TWO.mid + (m2.inX + 20 - TWO.mid) * e; mid.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
      if (!P.alive(my)) return res;
      st.beltV = 0; st.mid = { x: TWO.mid, y: m1.beltY, v: res.m, alpha: 0.45 };
      await m2.run(760); if (!P.alive(my)) return res;
      if (res.jam === 2) { await jamChip(m2, TWO.out, res.m, my); return res; }
      await outChip(m2, TWO.out, res.e, unitOf(q), my);
      return res;
    },
    solve: function (q, placed) { return Soal.solves5(q, placed); },
    errOf: function (q, placed, cards) { return Soal.err5(q, placed, cards); },
    wrongMsg: function (q, placed, res) {
      var W = STR.L5.wrong;
      if (q.type === 'op') return res.jam ? fmt(W.opJam, { s: res.s, r: Soal.ruleSay(res.r1) }) : fmt(W.op, { s: res.s, r: Soal.ruleSay(res.r1), t: res.out });
      if (q.type === 'num') {
        if (res.jam) return fmt(W.numJam, { v: res.s, b: q.b });
        return fmt(Soal.div5(q) ? W.numDiv : W.numMul, vars(q, { v: res.s, t: res.out }));
      }
      if (res.jam) return fmt(STR.L4.jam, { k: res.jam, x: res.jam === 1 ? res.s : res.m, r: Soal.ruleSay(res.jam === 1 ? res.r1 : res.r2) });
      return fmt(W.two, { s: res.s, m: res.m, t: res.e });
    },
    goodMsg: function (q) { var G = STR.L5.good; return fmt(two(q) ? G.two : Soal.div5(q) ? G.div : G.mul, vars(q)); },
    correctFx: function (q, placed) {
      setBoard(q, placed, true, two(q) ? q.m : null);
      if (st.out) { st.out.tagCol = C.green; st.out.glow = true; st.out.glowCol = C.green; }
      if (st.mid) st.mid.alpha = 1;
      cust.cheer();
      cbub.hide(false); cbub.setText(fmt(STR.L5.thanks, { ans: answerVal(q), u: unitOf(q) }));
      D.burst(CUST.x, CUST.base - 200, 18); D.burst(lay.out, m1.beltY - 50, 12);
    },
    leave: async function (q, my) {
      st.beltV = 260;
      cbub.hide(true);
      var list = [st.mid, st.out].filter(Boolean);
      await Promise.all([cust.leave()].concat(list.map(function (c) { var x0 = c.x; c.tag = ''; return Tween.run(700, function (e) { c.x = x0 + 520 * e; c.alpha = 1 - e; }, Ease.easeInOutCubic); })));
      st.beltV = 0; st.mid = st.out = null;
    },
    cough: function (q, res) { (res && res.jam === 2 && m2 ? m2 : m1).cough(); cust.mood = 'think'; },
    tip: function (q, err) {
      var T = STR.L5.tips;
      if (err === 'same') return two(q) ? T.same2 : Soal.div5(q) ? T.sameDiv : T.sameMul;
      if (err === 'near' && q.type === 'num') return T.nearNum;
      if (err && T[err]) return T[err];
      if (err === 'ok') return STR.wrong.again;
      var H = STR.L5.help;
      return q.type === 'num' ? fmt(Soal.div5(q) ? H.numDiv : H.numMul, vars(q)) : H[q.type];
    },
    hint2: async function (q) {
      var T = STR.L5.tier2;
      P.highlightBoard(); cbub.hide(false); markKeys(true);
      if (two(q)) {
        st.mid = { x: TWO.mid, y: m1.beltY, v: q.m, alpha: 1, glow: true };
        setBoard(q, P.S.placed, false, q.m);
        await P.bubble.say(T.two); return;
      }
      if (q.type === 'op') { await P.bubble.say(fmt(T[q.kind], vars(q))); return; }
      var t = q.a - q.a % 10, u = q.a % 10;
      if (Soal.div5(q)) await P.bubble.say(fmt(T.numDiv, vars(q, { b10: q.b * 10 })));
      else await P.bubble.say(u ? fmt(T.numMul, vars(q, { t: t, u: u })) : fmt(T.numMul0, vars(q, { k: q.a / 10 })));
    },
    demo: async function (q, my) {
      var T = STR.L5.tier3;
      if (q.type === 'num') {
        P.bubble.say(T.num);
        await showSteps(q, my);
        return;
      }
      if (q.type === 'op') {
        var r = Soal.plan5(q).r;
        P.bubble.say(fmt(Soal.div5(q) ? T.opDiv : T.opMul, vars(q)));
        markKeys(true);
        P.board(P.N(Soal.plan5(q).s) + ARROW + P.Q(RT(r)) + ARROW + P.N(Soal.plan5(q).e, 1), 'l4 l5');
        m1.screenQ = false; m1.screen = RT(r); m1.screenCol = C.green; m1.glow = 1;
        await Tween.wait(1600); if (!P.alive(my)) return;
        m1.glow = 0;
        st.out = { x: ONE.out, y: m1.beltY, v: Soal.plan5(q).e, alpha: 1, tag: unitOf(q), tagBelow: true, tagCol: C.green, glow: true, glowCol: C.green };
        Aud.sfx('ding');
        await Tween.wait(1000);
        return;
      }
      // dua langkah: aturan tampil di kedua mesin, keping mengalir s -> m -> e
      P.bubble.say(fmt(T.two, vars(q)));
      st.out = null;
      st.start = { x: TWO.inX, y: m1.beltY, v: q.s, alpha: 1, tag: STR.input, glow: true };
      m1.screenQ = m2.screenQ = false; m1.screen = RT(q.r1); m2.screen = RT(q.r2); m1.screenCol = m2.screenCol = C.cream;
      await Tween.wait(700); if (!P.alive(my)) return;
      st.start.glow = false; m1.glow = 1; m1.screenCol = C.green; Aud.sfx('tick', 1);
      await Tween.wait(800); if (!P.alive(my)) return;
      m1.glow = 0; st.mid = { x: TWO.mid, y: m1.beltY, v: q.m, alpha: 1, glow: true }; Aud.sfx('pop');
      await Tween.wait(800); if (!P.alive(my)) return;
      st.mid.glow = false; m2.glow = 1; m2.screenCol = C.green; Aud.sfx('tick', 1.15);
      await Tween.wait(800); if (!P.alive(my)) return;
      m2.glow = 0; st.out = { x: TWO.out, y: m1.beltY, v: q.e, alpha: 1, tag: unitOf(q), tagBelow: true, tagCol: C.green, glow: true, glowCol: C.green }; Aud.sfx('ding');
      await Tween.wait(900);
    },
    answerText: function (q) {
      if (q.type === 'num') return answerVal(q);
      if (two(q)) return RT(q.r1) + ', ' + RT(q.r2);
      return RT(Soal.plan5(q).r);
    },
    reset: function (q) {
      var hl = P.S.hintLv >= 2;
      st.start = { x: lay.inX, y: m1.beltY, v: q.type === 'num' ? '?' : two(q) ? q.s : Soal.plan5(q).s, alpha: 0, tag: q.type === 'num' ? STR.L5.guess : STR.input };
      var ch = st.start; Tween.run(260, function (e) { ch.alpha = e; });
      // keping hasil tebakan tetap terlihat sampai mesin dijalankan lagi
      st.ghost = q.type === 'num' && !st.out ? { x: ONE.out, y: m1.beltY, v: Soal.plan5(q).e, alpha: 1, ghost: true, tag: fmt(STR.L5.mustBe, { v: Soal.plan5(q).e }), tagBelow: true } : null;
      st.mid = two(q) && hl ? { x: TWO.mid, y: m1.beltY, v: q.m, alpha: 1, glow: true } : null;
      setBoard(q, {}, false, two(q) && hl ? q.m : null); setScreens(q, {});
      cust.mood = 'idle';
      if (els.steps.style.display === 'none') { cbub.hide(false); cbub.setText(story(q)); markKeys(hl); }
    },
    update: function (dt) { m1.update(dt); if (m2) m2.update(dt); cust.update(dt); st.belt += st.beltV * dt; },
    draw: function () {
      P.drawFactory(m1.t);
      D.conveyor(-10, lay.out + 80, m1.beltY, st.belt);
      var c = D.ctx;
      lever.post(m1.beltY);
      if (st.start) drawChip(st.start);
      if (st.ghost) drawChip(st.ghost);
      if (m2 && !st.mid) {   // tempat hasil antara (kosong)
        c.save(); c.strokeStyle = C.lavL; c.lineWidth = 3; c.setLineDash([8, 6]); c.globalAlpha = 0.8;
        D.rrect(c, TWO.mid - 44, m1.beltY - 66, 88, 62, 12); c.stroke(); c.restore();
        D.text('?', TWO.mid, m1.beltY - 34, 32, C.lavL);
      }
      m1.draw(); if (m2) m2.draw();
      if (st.mid) drawChip(st.mid);
      if (st.out) drawChip(st.out);
      lever.draw();
      cust.draw();
    },
    testQ: function (q) { return { type: q.type, kind: q.kind, a: q.a, b: q.b, c: q.c, s: q.s, r1: q.r1, r2: q.r2, m: q.m, e: q.e, need: q.need, cust: q.cust, extra: !!q.extra }; }
  };

  /* papan atas. op: masuk -> [aturan] -> ?; num: model kalimat (144 : 12 = ?); two: masuk -> [aturan 1] -> antara -> [aturan 2] -> ? */
  function setBoard(q, placed, ok, mid) {
    if (q.type === 'num') {
      var Q = P.Q(placed.in != null ? placed.in : null, ok);
      if (Soal.div5(q)) P.board(P.N(q.c) + P.OP(':') + P.N(q.b) + P.OP('=') + Q);
      else P.board(P.N(q.a) + P.OP('×') + P.N(q.b) + P.OP('=') + Q);
      return;
    }
    var end = ok ? P.N(answerVal(q), 1) : '<span class="n dim">?</span>';
    var a = P.Q(placed.m1 ? RT(placed.m1) : null, ok);
    if (q.type === 'op') { P.board(P.N(Soal.plan5(q).s) + ARROW + a + ARROW + end, 'l4 l5'); return; }
    var b = P.Q(placed.m2 ? RT(placed.m2) : null, ok);
    var m = mid != null ? '<span class="n mid">' + mid + '</span>' : '<span class="n dim">…</span>';
    P.board(P.N(q.s) + ARROW + a + ARROW + m + ARROW + b + ARROW + end, 'l4');
  }
  function setScreens(q, placed) {
    if (q.type === 'num') { m1.screenQ = false; m1.screen = RT(Soal.plan5(q).r); m1.screenCol = C.brass; m1.glow = 0; return; }
    [[m1, 'm1'], [m2, 'm2']].forEach(function (x) {
      var r = x[0], k = x[1]; if (!r) return;
      if (!placed[k]) { r.screenQ = true; r.screen = ''; r.glow = Play.nextNeed() === k ? 1 : 0.35; }
      else { r.screenQ = false; r.screen = RT(placed[k]); r.screenCol = C.cream; r.glow = 0; }
    });
  }
  /* sorot angka dan kata kunci di balon cerita (petunjuk 2) */
  function markKeys(on) { cbub.el.querySelectorAll('.w').forEach(function (w) { w.classList.toggle('key', !!on && KEY.test(w.textContent)); }); }
  /* papan langkah "Cara Gigo": memecah bilangan jadi puluhan dan satuan, baris demi baris. q = null: sembunyikan */
  async function showSteps(q, my) {
    var box = els.steps;
    if (!q) { if (box.style.display !== 'none') { box.style.display = 'none'; if (cbub && P.S && P.S.q && P.S.phase !== 'busy') cbub.hide(false); } return; }
    var a = q.a, b = q.b, c = q.c, t = a - a % 10, u = a % 10, rows;
    if (Soal.div5(q)) rows = u ? [c + ' = ' + t * b + ' + ' + u * b, t * b + ' : ' + b + ' = ' + t, u * b + ' : ' + b + ' = ' + u, t + ' + ' + u + ' = ' + a] : [b + ' × 10 = ' + b * 10, b + ' × ' + t + ' = ' + c, c + ' : ' + b + ' = ' + a];
    else rows = u ? [a + ' = ' + t + ' + ' + u, t + ' × ' + b + ' = ' + t * b, u + ' × ' + b + ' = ' + u * b, t * b + ' + ' + u * b + ' = ' + c] : [t + ' × ' + b + ' = ' + c];
    box.innerHTML = '<div class="ph">' + STR.L5.steps + '</div>' + rows.map(function (r) { return '<div class="srow">' + r + '</div>'; }).join('');
    cbub.hide(true); box.style.display = 'block';
    var els2 = box.querySelectorAll('.srow');
    for (var i = 0; i < els2.length; i++) {
      els2[i].classList.add('on'); Aud.sfx('tick', 1 + i * 0.1);
      await Tween.wait(1000); if (my && !P.alive(my)) return;
    }
    els2[els2.length - 1].classList.add('res');
    await Tween.wait(400);
  }
  /* keping hasil keluar dari luncuran ke tempatnya; label di bawah keping (balon cerita ada di atas) */
  function outChip(r, tx, v, tag, my) {
    st.out = { x: r.outX, y: r.beltY, v: v, alpha: 0, tag: tag, tagBelow: true, tagCol: C.cream };
    var out = st.out;
    st.beltV = 170; Aud.sfx('pop');
    return Tween.run(560, function (e) { out.alpha = Math.min(1, e * 3); out.x = r.outX + (tx - r.outX) * e; }, Ease.easeInOutCubic)
      .then(function () { st.beltV = 0; if (P.alive(my)) out.tagCol = C.brass; return Tween.wait(250); });
  }
  function jamChip(r, tx, v, my) {
    var ch = { x: r.outX, y: r.beltY, v: '?', alpha: 0, jam: true, tag: String(v), tagCol: C.brass, tagBelow: true };
    if (r === m1 && m2) st.mid = ch; else st.out = ch;
    Aud.sfx('empty');
    return Tween.run(520, function (e) { ch.alpha = Math.min(1, e * 3); ch.x = r.outX + (tx - r.outX) * e; }, Ease.easeInOutCubic).then(function () { return Tween.wait(300); });
  }
  P.levels[5] = LV;
})();
