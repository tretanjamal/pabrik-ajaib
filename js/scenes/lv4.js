/* Level 4 "Mesin Dua Langkah" (abstrak + hasil antara terlihat): dua machine_mini dirangkai di satu ban berjalan.
   s -> mesin 1 (aturan 1) -> hasil antara m di ban -> mesin 2 (aturan 2) -> e. Jenis: second (cari aturan mesin 2),
   first (cari aturan mesin 1, berpikir mundur), start (cari bilangan masuk), both (pasang kedua aturan, urutan penting).
   Hasil antara tidak bulat: mesin macet (batuk lembut) dan keping bergaris. Timer hanya untuk bonus bintang 3. */
(function () {
  var P = Play, C = Art.C, LAY = { M: 360, top: 150, m1: 400, m2: 830, midX: 615, inX: 150, outX: 1120 };
  var m1, m2, lever, st, els = {};
  var fmt = P.fmt, RT = Soal.ruleText;
  var ARROW = '<svg class="ar" viewBox="0 0 40 32" aria-hidden="true"><path d="M4 16h26M22 7l10 9-10 9" fill="none" stroke="#7DD3C9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var ruleHTML = P.ruleHTML;
  function needs(q, k) { return q.need.indexOf(k) >= 0; }
  function vars(q, extra) { var o = { s: q.s, m: q.m, e: q.e, r1: Soal.ruleSay(q.r1), r2: Soal.ruleSay(q.r2) }; for (var k in extra || {}) o[k] = extra[k]; return o; }

  var LV = {
    setup: function () {
      m1 = MiniRig(LAY.M, LAY.m1, LAY.top); m2 = MiniRig(LAY.M, LAY.m2, LAY.top);
      lever = Lever(m2.x0 + m2.w + 18, LAY.top + 0.48 * m2.h, LAY.M * 0.9);
      st = { belt: 0, beltV: 0, start: null, mid: null, out: null };
      function mt(id, r) { return r.target(id, STR.slots[id]); }
      var by = m1.beltY;
      LV.targets = [mt('m1', m1), mt('m2', m2),
        { id: 'in', label: STR.slots.in, zone: { x: 0, y: by - 200, w: m1.x0, h: 260 }, btn: { x: LAY.inX - 80, y: by - 110, w: 160, h: 124 }, anchor: { x: LAY.inX, y: by - 34 } }];
    },
    build: function (root) {
      els.target = U.h('div', 'tag-sign order'); els.target.style.cssText = 'left:1090px;top:96px;width:164px';
      root.appendChild(els.target);
      els.midLbl = U.h('div', 'mid-lbl', STR.mid); els.midLbl.style.cssText = 'left:' + (LAY.midX - 70) + 'px;top:' + (m1.beltY - 132) + 'px';
      root.appendChild(els.midLbl);
    },
    knob: function () { return lever.knob(0.35); },
    pull: function () { return lever.pull(); },
    gen: function (type) { var S = P.S; return Soal.L4(S.rnd, type, S.tier, S.last); },
    similar: function (q) { return Soal.similar4(P.S.rnd, q); },
    skillKey: function (q) { return q.type; },
    sayText: function (q) { return fmt(STR.L4.say[q.type], vars(q)); },
    partialText: function () { return STR.L4.next; },
    show: function (q) {
      setBoard(q, {}); setTarget(q); setScreens(q, {});
      st.mid = null; st.out = null;
      st.start = { x: -80, y: m1.beltY, v: needs(q, 'in') ? '?' : q.s, alpha: 1, tag: STR.input };
      var ch = st.start;
      st.beltV = 150;
      return Tween.run(700, function (e) { ch.x = -80 + (LAY.inX + 80) * e; }, Ease.easeOutCubic).then(function () { st.beltV = 0; });
    },
    cardFace: function (q, cd) {
      if (q.type === 'start') return { cls: 'k-num', aria: fmt(STR.cardNum, { v: cd.v }), main: String(cd.v), unit: STR.number };
      return { cls: 'k-rule', aria: fmt(STR.cardRuleAny, { v: RT(cd.v) }), main: ruleHTML(cd.v), unit: STR.ruleLbl.toLowerCase() };
    },
    onPlace: function (q, tid, v) {
      var placed = P.S.placed;
      setBoard(q, placed); setScreens(q, placed);
      if (tid === 'in') st.start.v = v;
      return false;
    },
    run: async function (q, placed, my) {
      var res = Soal.run4(q, placed), ch = st.start, x0 = ch.x;
      st.out = null; st.mid = null; m1.glow = m2.glow = 0;
      st.beltV = 170;
      await Tween.run(520, function (e) { ch.x = x0 + (m1.inX + 20 - x0) * e; ch.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
      if (!P.alive(my)) return res;
      st.beltV = 0; st.start = null;
      await m1.run(760); if (!P.alive(my)) return res;
      if (res.jam === 1) { await jamChip(m1, LAY.midX, res.s, my); return res; }
      st.mid = { x: m1.outX, y: m1.beltY, v: res.m, alpha: 0 };
      var mid = st.mid;
      st.beltV = 170; Aud.sfx('pop');
      await Tween.run(520, function (e) { mid.alpha = Math.min(1, e * 3); mid.x = m1.outX + (LAY.midX - m1.outX) * e; }, Ease.easeInOutCubic);
      st.beltV = 0;
      setBoard(q, placed, false, res.m);
      Aud.sfx('tick', 1.1);
      await Tween.wait(650); if (!P.alive(my)) return res;
      st.beltV = 170;
      await Tween.run(460, function (e) { mid.x = LAY.midX + (m2.inX + 20 - LAY.midX) * e; mid.alpha = e > 0.75 ? (1 - e) * 4 : 1; }, Ease.easeInOutCubic);
      if (!P.alive(my)) return res;
      st.beltV = 0; st.mid = { x: LAY.midX, y: m1.beltY, v: res.m, alpha: 0.45 };   // jejak hasil antara tetap terlihat
      await m2.run(760); if (!P.alive(my)) return res;
      if (res.jam === 2) { await jamChip(m2, LAY.outX, res.m, my); return res; }
      st.out = { x: m2.outX, y: m2.beltY, v: res.e, alpha: 0, tag: STR.out };
      var out = st.out;
      st.beltV = 170; Aud.sfx('pop');
      await Tween.run(560, function (e) { out.alpha = Math.min(1, e * 3); out.x = m2.outX + (LAY.outX - m2.outX) * e; }, Ease.easeInOutCubic);
      st.beltV = 0;
      if (!res.ok) out.tagCol = C.brass;
      await Tween.wait(250);
      return res;
    },
    solve: function (q, placed) { return Soal.solves4(q, placed); },
    errOf: function (q, placed, cards) { return Soal.err4(q, placed, cards); },
    wrongMsg: function (q, placed, res) {
      if (res.jam) return fmt(STR.L4.jam, { k: res.jam, x: res.jam === 1 ? res.s : res.m, r: Soal.ruleSay(res.jam === 1 ? res.r1 : res.r2) });
      return fmt(STR.L4.wrong, vars(q, { s: res.s, m: res.m, t: res.e }));
    },
    goodMsg: function (q) { return fmt(STR.L4.good, vars(q)); },
    correctFx: function (q, placed, res) {
      els.target.className = 'tag-sign order ok';
      setBoard(q, placed, true, q.m);
      if (st.out) { st.out.tagCol = C.green; st.out.glow = true; st.out.glowCol = C.green; }
      if (st.mid) st.mid.alpha = 1;
      D.burst(1170, 150, 18); D.burst(LAY.outX, m2.beltY - 50, 12);
    },
    leave: async function (q, my) {
      st.beltV = 260;
      var list = [st.mid, st.out].filter(Boolean);
      await Promise.all(list.map(function (c) { var x0 = c.x; c.tag = ''; return Tween.run(700, function (e) { c.x = x0 + 520 * e; c.alpha = 1 - e; }, Ease.easeInOutCubic); }));
      st.beltV = 0; st.mid = st.out = null;
    },
    cough: function (q, res) { (res && res.jam === 1 ? m1 : m2).cough(); },
    tip: function (q, err) {
      if (err && STR.L4.tips[err]) return STR.L4.tips[err];
      if (err === 'ok') return STR.wrong.again;
      return fmt(STR.L4.help[q.type], vars(q));
    },
    hint2: async function (q) {
      P.highlightBoard();
      st.mid = { x: LAY.midX, y: m1.beltY, v: q.m, alpha: 1, glow: true };
      setBoard(q, P.S.placed, false, q.m);
      await P.bubble.say(fmt(STR.L4.tier2[q.type], vars(q)));
    },
    demo: async function (q, my) {
      P.bubble.say(fmt(STR.L4.tier3, vars(q)));
      st.out = null;
      st.start = { x: LAY.inX, y: m1.beltY, v: q.s, alpha: 1, tag: STR.input, glow: true };
      m1.screenQ = m2.screenQ = false;
      m1.screen = RT(q.r1); m2.screen = RT(q.r2); m1.screenCol = m2.screenCol = C.cream;
      await Tween.wait(700); if (!P.alive(my)) return;
      st.start.glow = false; m1.glow = 1; m1.screenCol = C.green; Aud.sfx('tick', 1);
      await Tween.wait(800); if (!P.alive(my)) return;
      m1.glow = 0; st.mid = { x: LAY.midX, y: m1.beltY, v: q.m, alpha: 1, glow: true }; Aud.sfx('pop');
      await Tween.wait(800); if (!P.alive(my)) return;
      st.mid.glow = false; m2.glow = 1; m2.screenCol = C.green; Aud.sfx('tick', 1.15);
      await Tween.wait(800); if (!P.alive(my)) return;
      m2.glow = 0; st.out = { x: LAY.outX, y: m2.beltY, v: q.e, alpha: 1, tag: STR.out, tagCol: C.green, glow: true, glowCol: C.green }; Aud.sfx('ding');
      await Tween.wait(900);
    },
    answerText: function (q) {
      if (q.type === 'start') return q.s;
      if (q.type === 'both') return RT(q.r1) + ', ' + RT(q.r2);
      return RT(q.type === 'first' ? q.r1 : q.r2);
    },
    reset: function (q) {
      st.start = { x: LAY.inX, y: m1.beltY, v: needs(q, 'in') ? '?' : q.s, alpha: 0, tag: STR.input };
      var ch = st.start; Tween.run(260, function (e) { ch.alpha = e; });
      // keping hasil tebakan tetap terlihat sampai mesin dijalankan lagi
      if (P.S.hintLv >= 2) st.mid = { x: LAY.midX, y: m1.beltY, v: q.m, alpha: 1, glow: true }; else st.mid = null;
      setBoard(q, {}, false, P.S.hintLv >= 2 ? q.m : null); setScreens(q, {});
    },
    update: function (dt) { m1.update(dt); m2.update(dt); st.belt += st.beltV * dt; },
    draw: function () {
      P.drawFactory(m1.t);
      D.conveyor(-10, 1290, m1.beltY, st.belt);
      var c = D.ctx;
      lever.post(m1.beltY);
      if (st.start) drawChip(st.start);
      if (!st.mid) {   // tempat hasil antara di ban (kosong)
        c.save(); c.strokeStyle = C.lavL; c.lineWidth = 3; c.setLineDash([8, 6]); c.globalAlpha = 0.8;
        D.rrect(c, LAY.midX - 44, m1.beltY - 66, 88, 62, 12); c.stroke(); c.restore();
        D.text('?', LAY.midX, m1.beltY - 34, 32, C.lavL);
      }
      m1.draw(); m2.draw();
      if (st.mid) drawChip(st.mid);
      if (st.out) drawChip(st.out);
      lever.draw();
    },
    testQ: function (q) { return { type: q.type, s: q.s, r1: q.r1, r2: q.r2, m: q.m, e: q.e, need: q.need, extra: !!q.extra }; }
  };

  /* papan atas: s -> aturan 1 -> hasil antara -> aturan 2 -> e; bagian yang dicari = kotak "?" */
  function setBoard(q, placed, ok, mid) {
    var s = needs(q, 'in') ? P.Q(placed.in != null ? placed.in : null, ok) : P.N(q.s);
    var a = needs(q, 'm1') ? P.Q(placed.m1 ? RT(placed.m1) : null, ok) : P.N(RT(q.r1));
    var b = needs(q, 'm2') ? P.Q(placed.m2 ? RT(placed.m2) : null, ok) : P.N(RT(q.r2));
    var m = mid != null ? '<span class="n mid">' + mid + '</span>' : '<span class="n dim">…</span>';
    P.board(s + ARROW + a + ARROW + m + ARROW + b + ARROW + P.N(q.e, 1), 'l4');
  }
  function setTarget(q) {
    els.target.className = 'tag-sign order';
    els.target.innerHTML = '<div class="h">' + STR.target + '</div><div class="v">' + q.e + '</div>' + P.stampHTML();
  }
  function setScreens(q, placed) {
    [[m1, 'm1', q.r1], [m2, 'm2', q.r2]].forEach(function (x) {
      var r = x[0], k = x[1];
      if (needs(q, k) && !placed[k]) { r.screenQ = true; r.screen = ''; r.glow = Play.nextNeed() === k ? 1 : 0.35; }
      else { r.screenQ = false; r.screen = RT(placed[k] || x[2]); r.screenCol = placed[k] ? C.cream : C.brass; r.glow = 0; }
    });
  }
  /* mesin macet: keping bergaris keluar pelan, tanpa bunyi keras */
  async function jamChip(r, tx, v, my) {
    var ch = { x: r.outX, y: r.beltY, v: '?', alpha: 0, jam: true, tag: String(v), tagCol: C.brass };
    if (r === m1) st.mid = ch; else st.out = ch;
    Aud.sfx('empty');
    await Tween.run(520, function (e) { ch.alpha = Math.min(1, e * 3); ch.x = r.outX + (tx - r.outX) * e; }, Ease.easeInOutCubic);
    if (!P.alive(my)) return;
    await Tween.wait(300);
  }
  P.levels[4] = LV;
})();
