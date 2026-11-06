/* Generator + solver soal semua level. Bisa jalan di peramban maupun Node (test/logic).
   Kartu pengecoh disusun dari miskonsepsi nyata; tiap kartu membawa jenis kesalahannya (err) untuk umpan balik khusus:
   add = menjumlah/mengurangi alih-alih mengali/membagi, near = salah satu fakta tetangga, swap = menukar peran bilangan,
   same = memakai operasi yang sama bukan kebalikannya, sub = mengurangi alih-alih membagi, inv = aturan terbalik arah,
   one = baru membalik satu mesin, ok = benar.
   Aturan mesin ditulis pendek: x3 (kali 3), d3 (bagi 3), p5 (tambah 5), m5 (kurang 5). */
(function (root) {
  var CFG = root.SOAL || (typeof require !== 'undefined' ? (require('../../config/soal.js'), root.SOAL) : null);

  function ri(rnd, lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); }
  function shuffle(rnd, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function tierOf(L, tier) { return L.tiers[Math.max(0, Math.min(L.tiers.length - 1, tier || 0))]; }
  function factOf(x, y) { return Math.min(x, y) + 'x' + Math.max(x, y); }
  function isFact(x, y) { return x >= 1 && y >= 1 && x <= 10 && y <= 10; }
  /* fakta lemah dari simpanan ('7x8') -> [7, 8] dalam urutan acak */
  function weakPair(rnd, weak) { var p = weak[ri(rnd, 0, weak.length - 1)].split('x').map(Number); return rnd() < 0.5 ? p : [p[1], p[0]]; }

  /* ===== aturan ===== */
  var SYM = { x: '×', d: ':', p: '+', m: '−' };
  function apply(r, x) {
    var op = r.charAt(0), n = +r.slice(1);
    if (op === 'x') return x * n;
    if (op === 'd') return x % n === 0 ? x / n : NaN;
    if (op === 'p') return x + n;
    return x - n >= 0 ? x - n : NaN;
  }
  function inv(r) { return ({ x: 'd', d: 'x', p: 'm', m: 'p' })[r.charAt(0)] + r.slice(1); }
  function ruleText(r) { return SYM[r.charAt(0)] + r.slice(1); }
  /* untuk kalimat: "× 3", ": 3" (layar mesin dan kartu memakai ruleText) */
  function ruleSay(r) { return SYM[r.charAt(0)] + ' ' + r.slice(1); }
  function ruleOk(r) { var n = +r.slice(1); return (r.charAt(0) === 'x' || r.charAt(0) === 'd') ? n >= 2 && n <= 10 : n >= 1 && n <= 300; }

  /* pilih 3 pengecoh dari kandidat [nilai, err]; kandidat pertama diutamakan (miskonsepsi inti level itu) */
  function pickDistractors(rnd, cand, answer, valid, solves, fallback) {
    var out = [], seen = {};
    seen[answer] = 1;
    function add(v, err) {
      if (out.length >= 3 || v == null || seen[v] || !valid(v) || solves(v)) return;
      seen[v] = 1; out.push({ v: v, err: err });
    }
    cand = [cand[0]].concat(shuffle(rnd, cand.slice(1)));
    cand.forEach(function (c) { add(c[0], c[1]); });
    for (var g = 0; out.length < 3 && g < 400; g++) add(fallback(g), 'near');
    return out;
  }
  function deal(rnd, q, answerCard, ds) {
    q.cards = shuffle(rnd, [answerCard].concat(ds)).map(function (c, i) { return { id: 'k' + i, v: c.v, err: c.err, slot: c.slot }; });
    return q;
  }

  /* ================= Level 1 ================= */
  function answerOf(q) { return q.type === 'rule' ? q.b : q.type === 'output' ? q.c : q.a; }
  function solves(q, v) {
    if (q.type === 'rule') return q.a * v === q.c;
    if (q.type === 'output') return q.a * q.b === v;
    return v * q.b === q.c;
  }
  /* hasil mesin bila kartu v dipasang: [peti, isi per peti, total benda] */
  function runWith(q, v) {
    if (q.type === 'rule') return { crates: q.a, per: v, total: q.a * v };
    if (q.type === 'output') return { crates: q.a, per: q.b, total: q.a * q.b, guess: v };
    return { crates: v, per: q.b, total: v * q.b };
  }
  function distractors(q, rnd, range) {
    var cand;
    if (q.type === 'rule') cand = [[q.c - q.a, 'add'], [q.b + 1, 'near'], [q.b - 1, 'near'], [q.a, 'swap'], [q.b + 2, 'near']];
    else if (q.type === 'output') cand = [[q.a + q.b, 'add'], [q.a * (q.b + 1), 'near'], [q.a * (q.b - 1), 'near'], [q.c + 1, 'near'], [q.c - 2, 'near']];
    else cand = [[q.c - q.b, 'add'], [q.a + 1, 'near'], [q.a - 1, 'near'], [q.b, 'swap'], [q.a + 2, 'near']];
    var ans = answerOf(q);
    return pickDistractors(rnd, cand, ans, function (v) { return v >= range[0] && v <= range[1]; }, function (v) { return solves(q, v); },
      function (g) { return g < 100 ? ans + ri(rnd, -4, 4) : ri(rnd, range[0], Math.min(range[1], ans + 10)); });
  }
  function make(q, rnd, range) {
    q.c = q.a * q.b;
    q.answer = answerOf(q);
    q.fact = factOf(q.a, q.b); q.facts = [q.fact];
    return deal(rnd, q, { v: q.answer, err: 'ok' }, distractors(q, rnd, range[q.type]));
  }

  /* ================= Level 2: mesin kebalikan ================= */
  function answer2(q) { return q.type === 'divisor' ? q.b : q.type === 'mul' ? q.c : q.a; }
  function solves2(q, v) {
    if (q.type === 'mul') return v === q.c;   // Latihan: a x b = ?
    if (q.type === 'div') return v === q.c / q.b;
    if (q.type === 'missf') return v * q.b === q.c;
    return v > 0 && q.c % v === 0 && q.c / v === q.a;
  }
  /* hasil mesin untuk kartu v: kolom (kelompok), isi tiap kolom, sisa, total titik, keluaran.
     Papan titik selalu: a kolom (banyak kelompok) x b titik (isi tiap kelompok) = c. */
  function run2(q, v) {
    if (q.type === 'mul') return { cols: q.a, per: q.b, rem: 0, total: q.c, out: q.c, guess: v };
    if (q.type === 'div') return { cols: q.a, per: q.b, rem: 0, total: q.c, out: q.a, guess: v };
    if (q.type === 'missf') return { cols: v, per: q.b, rem: 0, total: v * q.b, out: v * q.b };
    return { cols: q.a, per: v, rem: 0, total: q.a * v, out: q.a * v };   // bagi rata ke a kelompok, isi v
  }
  function make2(q, rnd) {
    var R = CFG.L2.cardRange, cand;
    q.c = q.a * q.b; q.answer = answer2(q); q.fact = factOf(q.a, q.b); q.facts = [q.fact];
    if (q.type === 'divisor') cand = [[q.a, 'swap'], [q.b + 1, 'near'], [q.b - 1, 'near'], [q.c - q.a, 'sub'], [q.b + 2, 'near']];
    else if (q.type === 'mul') cand = [[q.a + q.b, 'add'], [q.c + q.b, 'near'], [q.c - q.b, 'near'], [q.a * (q.b + 2), 'near'], [q.c + 1, 'near']];
    else cand = [[q.c * q.b, 'same'], [q.a + 1, 'near'], [q.a - 1, 'near'], [q.c - q.b, 'sub'], [q.b, 'swap']];
    var ds = pickDistractors(rnd, cand, q.answer, function (v) { return v >= R[0] && v <= R[1]; }, function (v) { return solves2(q, v); },
      function (g) { return q.answer + ri(rnd, -3, 3) + (g > 60 ? ri(rnd, 0, 10) : 0); });
    return deal(rnd, q, { v: q.answer, err: 'ok' }, ds);
  }

  /* ================= Level 3: tebak aturan ================= */
  function solves3(q, r) { return q.pairs.every(function (p) { return apply(r, p[0]) === p[1]; }); }
  function make3(q, rnd) {
    var r = q.rule, op = r.charAt(0), n = +r.slice(1), p0 = q.pairs[0];
    var diff = p0[1] - p0[0], addR = diff > 0 ? 'p' + diff : 'm' + (-diff);
    var cand = [[inv(r), 'inv'], [addR, 'add'], [op + (n + 1), 'near'], [op + (n - 1), 'near'], [op + (n + 2), 'near'], [op + (n - 2), 'near']];
    q.answer = r;
    q.facts = q.pairs.map(function (p) { var s = op === 'x' ? p[0] : p[1]; return isFact(s, n) ? factOf(s, n) : null; }).filter(Boolean);
    q.fact = q.facts[0] || factOf(Math.min(10, n), 2);
    var ds = pickDistractors(rnd, cand, r, ruleOk, function (v) { return solves3(q, v); },
      function () { return (rnd() < 0.5 ? 'x' : 'd') + ri(rnd, 2, 10); });
    return deal(rnd, q, { v: r, err: 'ok' }, ds);
  }
  /* jalankan aturan pada tiap pasangan: hasil mesin (bisa tidak bulat) dan cocok/tidak */
  function run3(q, r) {
    return q.pairs.map(function (p) {
      var got = apply(r, p[0]), op = r.charAt(0), n = +r.slice(1);
      return { x: p[0], want: p[1], got: got, ok: got === p[1], rem: op === 'd' ? p[0] % n : 0, q: op === 'd' ? Math.floor(p[0] / n) : got };
    });
  }

  /* ================= Level 4: dua mesin ================= */
  function chain(s, r1, r2) {
    var m = apply(r1, s), e = isNaN(m) ? NaN : apply(r2, m);
    return { s: s, m: m, e: e, jam: isNaN(m) ? 1 : isNaN(e) ? 2 : 0 };
  }
  /* placed = {in, m1, m2}: nilai yang dipakai mesin (diberikan soal atau dari kartu) */
  function run4(q, placed) {
    var s = placed.in != null ? placed.in : q.s, r1 = placed.m1 || q.r1, r2 = placed.m2 || q.r2;
    var c = chain(s, r1, r2);
    c.r1 = r1; c.r2 = r2; c.ok = !c.jam && c.e === q.e;
    return c;
  }
  function need4(type) { return type === 'second' ? ['m2'] : type === 'first' ? ['m1'] : type === 'start' ? ['in'] : ['m1', 'm2']; }
  function solves4(q, placed) { return run4(q, placed).ok; }
  function inRange4(c, max) { return !c.jam && c.m >= 2 && c.m <= max && c.e >= 2 && c.e <= max; }
  function make4(q, rnd) {
    var L = CFG.L4, type = q.type, cand, ds, ans;
    q.need = need4(type);
    q.facts = [];
    [[q.r1, q.s, q.m], [q.r2, q.m, q.e]].forEach(function (st) {
      var n = +st[0].slice(1), x = st[0].charAt(0) === 'x' ? st[1] : st[2];
      if (isFact(x, n)) q.facts.push(factOf(x, n));
    });
    q.fact = q.facts[0] || factOf(2, Math.min(10, +q.r1.slice(1)));
    if (type === 'start') {
      ans = q.s;
      var fwd = chain(q.e, q.r1, q.r2).e;
      cand = [[q.m, 'one'], [isNaN(fwd) ? null : fwd, 'same'], [q.s + 1, 'near'], [q.s - 1, 'near'], [q.s + 2, 'near'], [q.e, 'same']];
      ds = pickDistractors(rnd, cand, ans, function (v) { return v >= L.cardRange[0] && v <= L.cardRange[1]; },
        function (v) { return solves4(q, { in: v }); }, function (g) { return q.s + ri(rnd, -5, 5) + (g > 50 ? ri(rnd, 0, 20) : 0); });
      q.answer = { in: ans };
      return deal(rnd, q, { v: ans, err: 'ok', slot: 'in' }, ds);
    }
    if (type === 'second' || type === 'first') {
      var key = type === 'second' ? 'm2' : 'm1', r = type === 'second' ? q.r2 : q.r1, other = type === 'second' ? q.r1 : q.r2;
      var op = r.charAt(0), n = +r.slice(1);
      cand = [[inv(r), 'inv'], [other, 'swap'], [op + (n + 1), 'near'], [op + (n - 1), 'near'], [op + (n + 2), 'near']];
      ds = pickDistractors(rnd, cand, r, ruleOk, function (v) { var p = {}; p[key] = v; return solves4(q, p); },
        function () { return (rnd() < 0.5 ? 'x' : 'd') + ri(rnd, 2, 9); });
      q.answer = {}; q.answer[key] = r;
      return deal(rnd, q, { v: r, err: 'ok', slot: key }, ds);
    }
    // both: 2 kartu benar + 2 pengecoh; tepat satu pasangan berurutan yang mencapai target
    var n1 = +q.r1.slice(1), n2 = +q.r2.slice(1);
    var d1 = rnd() < 0.5 ? [inv(q.r1), 'inv'] : [q.r1.charAt(0) + (n1 + (rnd() < 0.5 ? 1 : -1)), 'near'];
    var d2 = rnd() < 0.5 ? [inv(q.r2), 'inv'] : [q.r2.charAt(0) + (n2 + (rnd() < 0.5 ? 1 : -1)), 'near'];
    if (!ruleOk(d1[0]) || !ruleOk(d2[0]) || d1[0] === d2[0] || [q.r1, q.r2].indexOf(d1[0]) >= 0 || [q.r1, q.r2].indexOf(d2[0]) >= 0) return null;
    q.answer = { m1: q.r1, m2: q.r2 };
    q.cards = shuffle(rnd, [{ v: q.r1, err: 'ok', slot: 'm1' }, { v: q.r2, err: 'ok', slot: 'm2' }, { v: d1[0], err: d1[1] }, { v: d2[0], err: d2[1] }])
      .map(function (c, i) { return { id: 'k' + i, v: c.v, err: c.err, slot: c.slot }; });
    return pairsSolving(q).length === 1 ? q : null;
  }
  /* semua pasangan berurutan kartu berbeda (mesin 1, mesin 2) yang mencapai target */
  function pairsSolving(q) {
    var out = [];
    q.cards.forEach(function (a) { q.cards.forEach(function (b) { if (a !== b && solves4(q, { m1: a.v, m2: b.v })) out.push([a.v, b.v]); }); });
    return out;
  }
  /* jenis kesalahan untuk pasangan kartu yang dipasang (L4) */
  function err4(q, placed, cards) {
    var res = run4(q, placed);
    if (res.ok) return 'ok';
    if (q.type === 'both' && placed.m1 === q.r2 && placed.m2 === q.r1) return 'order';
    if (res.jam) return q.type === 'start' ? 'fracin' : 'frac';
    var errs = cards.map(function (c) { return c.err; }).filter(function (e) { return e !== 'ok'; });
    return errs[0] || 'near';
  }

  function randomRule(rnd, T, op) { return op + ri(rnd, T.n[0], T.n[1]); }

  /* ================= Level 5: pesanan pelanggan (soal cerita) ================= */
  function rule5Ok(r) { var op = r.charAt(0), n = +r.slice(1); return (op === 'x' || op === 'd') ? n >= 2 && n <= 25 : n >= 1 && n <= 999; }
  function div5(q) { return q.kind === 'group' || q.kind === 'share'; }
  function need5(type) { return type === 'op' ? ['m1'] : type === 'num' ? ['in'] : ['m1', 'm2']; }
  /* soal 1 langkah: bilangan masuk, aturan mesin, keluaran yang benar.
     num: mesin CEK menjalankan operasi kebalikan dari cerita (cerita bagi: jawaban x b harus = c) */
  function plan5(q) {
    if (q.type === 'op') return div5(q) ? { s: q.c, r: 'd' + q.b, e: q.a } : { s: q.a, r: 'x' + q.b, e: q.c };
    return div5(q) ? { r: 'x' + q.b, e: q.c } : { r: 'd' + q.b, e: q.a };
  }
  function run5(q, placed) {
    if (q.type === 'two') return run4(q, placed);
    var p = plan5(q), s = q.type === 'num' ? placed.in : p.s, r = q.type === 'op' ? placed.m1 : p.r, out = apply(r, s);
    return { s: s, r1: r, out: out, jam: isNaN(out) ? 1 : 0, ok: out === p.e, want: p.e };
  }
  function solves5(q, placed) { return run5(q, placed).ok; }
  function answer5(q) { return q.type === 'two' ? null : q.type === 'op' ? plan5(q).r : div5(q) ? q.a : q.c; }
  function pairs5(q) {
    var out = [];
    q.cards.forEach(function (a) { q.cards.forEach(function (b) { if (a !== b && solves5(q, { m1: a.v, m2: b.v })) out.push([a.v, b.v]); }); });
    return out;
  }
  function make5(q, rnd) {
    var L = CFG.L5, R = L.cardRange, cand, ds;
    q.need = need5(q.type); q.facts = []; q.fact = null;
    if (q.type === 'two') {
      var n1 = +q.r1.slice(1), n2 = +q.r2.slice(1);
      var d1 = rnd() < 0.5 ? [inv(q.r1), 'same'] : ['x' + (n1 + (rnd() < 0.5 ? 1 : -1)), 'near'];
      var d2 = rnd() < 0.5 ? [inv(q.r2), 'same'] : ['m' + n2, 'sub'];
      if (!rule5Ok(d1[0]) || !rule5Ok(d2[0]) || d1[0] === d2[0] || [q.r1, q.r2].indexOf(d1[0]) >= 0 || [q.r1, q.r2].indexOf(d2[0]) >= 0) return null;
      q.answer = { m1: q.r1, m2: q.r2 };
      q.cards = shuffle(rnd, [{ v: q.r1, err: 'ok', slot: 'm1' }, { v: q.r2, err: 'ok', slot: 'm2' }, { v: d1[0], err: d1[1] }, { v: d2[0], err: d2[1] }])
        .map(function (c, i) { return { id: 'k' + i, v: c.v, err: c.err, slot: c.slot }; });
      return pairs5(q).length === 1 ? q : null;
    }
    var a = q.a, b = q.b, c = q.c, tens = a - a % 10;
    if (q.type === 'op') {
      var r = plan5(q).r, op = r.charAt(0), dv = div5(q);
      cand = [[inv(r), 'same'], [(dv ? 'm' : 'p') + b, dv ? 'sub' : 'add'], [op + (b + 1), 'near'], [op + (b - 1), 'near'], [(dv ? 'p' : 'm') + b, dv ? 'add' : 'sub']];
      ds = pickDistractors(rnd, cand, r, rule5Ok, function (v) { return solves5(q, { m1: v }); }, function () { return op + ri(rnd, 2, 25); });
      q.answer = { m1: r };
      return deal(rnd, q, { v: r, err: 'ok', slot: 'm1' }, ds);
    }
    var ans = answer5(q);
    // part = baru menghitung sebagian (puluhan saja): 144 : 12 -> 10; 15 x 8 -> 80 + 5
    if (div5(q)) cand = [[a % 10 ? tens : null, 'part'], [c - b, 'sub'], [a + 1, 'near'], [a - 1, 'near'], [a + 10, 'near'], [a - 10, 'near'], [c * b, 'same']];
    else cand = [[a % 10 ? tens * b + a % 10 : null, 'part'], [a + b, 'add'], [a * (b + 1), 'near'], [a * (b - 1), 'near'], [c + 10, 'near'], [c - 10, 'near']];
    ds = pickDistractors(rnd, cand, ans, function (v) { return v >= R[0] && v <= R[1]; }, function (v) { return solves5(q, { in: v }); },
      function (g) { return ans + ri(rnd, -6, 6) + (g > 50 ? ri(rnd, 0, 20) : 0); });
    q.answer = { in: ans };
    return deal(rnd, q, { v: ans, err: 'ok', slot: 'in' }, ds);
  }
  /* jenis kesalahan L5 untuk kartu yang dipasang */
  function err5(q, placed, cards) {
    var res = run5(q, placed);
    if (res.ok) return 'ok';
    if (q.type === 'two' && placed.m1 === q.r2 && placed.m2 === q.r1) return 'order';
    var errs = cards.map(function (c) { return c.err; }).filter(function (e) { return e !== 'ok'; });
    if (errs[0]) return errs[0];
    return res.jam ? 'frac' : 'near';
  }

  var Soal = {
    answerOf: answerOf, solves: solves, runWith: runWith,
    apply: apply, inv: inv, ruleText: ruleText, ruleSay: ruleSay, factOf: factOf,
    /* soal utama terakhir tiap level satu tingkat lebih tinggi, agar fakta sulit tetap tersentuh */
    planTier: function (tier, maxTier) { return Math.min(maxTier, tier + 1); },
    answer2: answer2, solves2: solves2, run2: run2,
    solves3: solves3, run3: run3,
    chain: chain, run4: run4, solves4: solves4, err4: err4, need4: need4, pairsSolving: pairsSolving,
    plan5: plan5, run5: run5, solves5: solves5, err5: err5, pairs5: pairs5, rule5Ok: rule5Ok, div5: div5,

    /* soal pertama yang dipandu (hook 10 detik): 3 x ? = 6, kartu tetap */
    onboarding: function () {
      var o = CFG.L1.onboarding, q = { type: o.type, a: o.a, b: o.b, product: o.product, guided: true };
      q.c = q.a * q.b; q.answer = answerOf(q); q.fact = factOf(q.a, q.b); q.facts = [q.fact];
      q.cards = o.cards.map(function (v, i) { return { id: 'k' + i, v: v, err: v === q.b ? 'ok' : (v === q.c - q.a ? 'add' : (v === q.a ? 'swap' : 'near')) }; });
      return q;
    },
    /* L1: type = rule|output|input|mix; tier = 0..2; prev = soal sebelumnya (tidak boleh identik berturut-turut);
       weak = fakta yang pernah salah ('7x8'), sesekali dipakai lagi bila muat */
    L1: function (rnd, type, tier, prev, weak) {
      var L = CFG.L1, T = tierOf(L, tier);
      if (type === 'mix') type = ['rule', 'output', 'input'][ri(rnd, 0, 2)];
      for (var tries = 0; tries < 200; tries++) {
        var ab = weak && weak.length && tries < 10 && rnd() < L.weakChance ? weakPair(rnd, weak) : [ri(rnd, T.a[0], T.a[1]), ri(rnd, T.b[0], T.b[1])];
        var a = ab[0], b = ab[1];
        if (a < 2 || b < 2 || a > 10 || b > 10 || a * b > T.max) continue;
        if (prev && prev.a === a && prev.b === b) continue;
        var prod = L.products[ri(rnd, 0, L.products.length - 1)];
        if (prev && prev.product === prod) prod = L.products[(L.products.indexOf(prod) + 1) % L.products.length];
        return make({ type: type, a: a, b: b, product: prod }, rnd, L.cardRange);
      }
      return make({ type: type, a: 2, b: 3, product: L.products[0] }, rnd, L.cardRange);
    },
    /* L2: c : b = ? | ? x b = c | c : ? = a */
    L2: function (rnd, type, tier, prev, weak) {
      var L = CFG.L2, T = tierOf(L, tier), maxAll = L.tiers[L.tiers.length - 1].max;
      if (type === 'mix') type = ['div', 'missf', 'divisor'][ri(rnd, 0, 2)];
      for (var tries = 0; tries < 300; tries++) {
        var useWeak = weak && weak.length && tries < 10 && rnd() < L.weakChance;
        var ab = useWeak ? weakPair(rnd, weak) : [ri(rnd, T.a[0], T.a[1]), ri(rnd, T.b[0], T.b[1])];
        var a = ab[0], b = ab[1];
        if (a < 2 || b < 2 || a > 10 || b > 10 || a * b > (useWeak ? maxAll : T.max)) continue;
        if (prev && prev.a === a && prev.b === b) continue;
        if (type === 'divisor' && a === b) continue;   // 25 : ? = 5 tidak membedakan banyak kelompok dan isinya
        return make2({ type: type, a: a, b: b }, rnd);
      }
      return make2({ type: type, a: 3, b: 4 }, rnd);
    },
    /* L3: 3 pasangan masukan -> keluaran, aturan xn atau :n */
    L3: function (rnd, type, tier, prev) {
      var L = CFG.L3, T = tierOf(L, tier);
      if (type === 'mix') type = rnd() < 0.5 ? 'mul' : 'div';
      var op = type === 'mul' ? 'x' : 'd';
      for (var tries = 0; tries < 300; tries++) {
        var n = ri(rnd, T.n[0], T.n[1]), r = op + n;
        if (prev && prev.rule === r) continue;
        var xs = [];
        for (var g = 0; xs.length < L.pairs && g < 50; g++) { var s = ri(rnd, T.s[0], T.s[1]); if (xs.indexOf(s) < 0) xs.push(s); }
        if (xs.length < L.pairs) continue;
        xs.sort(function (u, v) { return u - v; });
        var pairs = xs.map(function (s) { return op === 'x' ? [s, s * n] : [s * n, s]; });
        if (pairs.some(function (p) { return p[0] > L.maxVal || p[1] > L.maxVal; })) continue;
        return make3({ type: type, rule: r, pairs: pairs }, rnd);
      }
      return make3({ type: type, rule: op + 3, pairs: op === 'x' ? [[2, 6], [4, 12], [5, 15]] : [[6, 2], [12, 4], [15, 5]] }, rnd);
    },
    /* L4: rantai dua mesin dengan hasil antara bulat; tepat satu jawaban di antara kartu */
    L4: function (rnd, type, tier, prev) {
      var L = CFG.L4, T = tierOf(L, tier);
      if (type === 'mix') type = ['second', 'first', 'start', 'both'][ri(rnd, 0, 3)];
      for (var tries = 0; tries < 2000; tries++) {
        var pat = type === 'both' ? 'xd' : ['xd', 'dx', 'xd', 'dx', 'xx', 'dd'][ri(rnd, 0, 5)];
        var r1 = randomRule(rnd, T, pat.charAt(0)), r2 = randomRule(rnd, T, pat.charAt(1));
        if (r1 === inv(r2) || r1 === r2) continue;   // x3 lalu :3 tidak mengubah apa pun
        var s = ri(rnd, T.s[0], T.s[1]), c = chain(s, r1, r2);
        if (!inRange4(c, L.max) || c.e === s) continue;
        if (prev && prev.type === type && prev.s === s && prev.r1 === r1 && prev.r2 === r2) continue;
        if (prev && prev.r1 === r1 && prev.r2 === r2 && tries < 1000) continue;   // utamakan rantai berbeda dari soal sebelumnya
        var q = make4({ type: type, s: s, r1: r1, r2: r2, m: c.m, e: c.e }, rnd);
        if (q) return q;
      }
      return make4({ type: type === 'both' ? 'second' : type, s: 6, r1: 'x3', r2: 'd2', m: 18, e: 9 }, rnd);
    },
    /* L5: soal cerita. Pelanggan bergantian (a/b), produk tidak sama dengan soal sebelumnya */
    L5: function (rnd, type, tier, prev) {
      var L = CFG.L5, T = tierOf(L, tier), W = L.two[Math.max(0, Math.min(L.two.length - 1, tier || 0))];
      if (type === 'mix') type = rnd() < 0.5 ? 'op' : 'num';
      var big = type === 'num2';   // cerita bagi dengan pembagi 2 angka (contoh brief 144 : 12): selalu muncul sekali di tiap sesi
      if (big) { type = 'num'; T = tierOf(L, Math.max(tier || 0, 1)); }
      var cust = prev && prev.cust === 'a' ? 'b' : 'a';
      for (var tries = 0; tries < 3000; tries++) {
        var prod = L.products[ri(rnd, 0, L.products.length - 1)];
        if (prev && prev.product === prod) continue;
        if (type === 'two') {
          var s = ri(rnd, W.s[0], W.s[1]), n1 = ri(rnd, W.n1[0], W.n1[1]), n2 = ri(rnd, W.n2[0], W.n2[1]), m = s * n1;
          if (m > L.max || m % n2 || m / n2 < 2 || m / n2 === s || n1 === n2) continue;
          if (prev && prev.s === s && prev.r1 === 'x' + n1 && prev.r2 === 'd' + n2) continue;
          var q2 = make5({ type: 'two', kind: 'two', s: s, r1: 'x' + n1, r2: 'd' + n2, m: m, e: m / n2, product: prod, cust: cust, ctr: ri(rnd, 0, 2), grp: ri(rnd, 0, 2) }, rnd);
          if (q2) return q2;
          continue;
        }
        var kind = big ? (rnd() < 0.5 ? 'group' : 'share') : type === 'num' ? (rnd() < 0.7 ? (rnd() < 0.5 ? 'group' : 'share') : 'mul') : ['group', 'share', 'mul'][ri(rnd, 0, 2)];
        var b = ri(rnd, big ? 10 : T.b[0], T.b[1]), a = ri(rnd, T.a[0], T.a[1]), c = a * b;
        if (c < L.minBig || c > L.max || a === b) continue;
        if (prev && prev.a === a && prev.b === b) continue;
        return make5({ type: type, kind: kind, a: a, b: b, c: c, product: prod, cust: cust, ctr: ri(rnd, 0, 2), grp: ri(rnd, 0, 2) }, rnd);
      }
      return make5({ type: type === 'two' ? 'num' : type, kind: 'group', a: 12, b: 12, c: 144, product: L.products[3], cust: cust, ctr: 0, grp: 0 }, rnd);
    },
    /* Latihan bebas tabel n: a x n = ? | c : n = ? | ? x n = c; fakta tabel ini yang pernah salah diutamakan */
    LT: function (rnd, n, type, prev, weak) {
      var L = CFG.LT;
      if (type === 'mix') type = L.types[ri(rnd, 0, L.types.length - 1)];
      var mine = (weak || []).map(function (f) { return f.split('x').map(Number); })
        .filter(function (p) { return (p[0] === n || p[1] === n) && p[0] >= L.a[0] && p[1] >= L.a[0]; });
      for (var tries = 0; tries < 100; tries++) {
        var w = mine.length && tries < 10 && rnd() < L.weakChance ? mine[ri(rnd, 0, mine.length - 1)] : null;
        var a = w ? (w[0] === n ? w[1] : w[0]) : ri(rnd, L.a[0], L.a[1]);
        if (prev && prev.a === a) continue;
        var q = make2({ type: type, a: a, b: n }, rnd); q.table = n;
        return q;
      }
      var q0 = make2({ type: type, a: prev && prev.a === 2 ? 3 : 2, b: n }, rnd); q0.table = n; return q0;
    },

    /* soal serupa untuk diulang di akhir level (fakta/aturan sama, bentuk berbeda) */
    similar: function (rnd, q) {
      var L = CFG.L1, types = ['rule', 'output', 'input'], t = types[(types.indexOf(q.type) + 1 + ri(rnd, 0, 1)) % 3];
      var swap = rnd() < 0.5 && q.b * q.a <= 40;
      return make({ type: t, a: swap ? q.b : q.a, b: swap ? q.a : q.b, product: L.products[(L.products.indexOf(q.product) + 2) % L.products.length], extra: true }, rnd, L.cardRange);
    },
    similar2: function (rnd, q) {
      var types = ['div', 'missf', 'divisor'], t = types[(types.indexOf(q.type) + 1 + ri(rnd, 0, 1)) % 3];
      var swap = rnd() < 0.5;
      if (t === 'divisor' && q.a === q.b) t = 'div';
      var o = make2({ type: t, a: swap ? q.b : q.a, b: swap ? q.a : q.b }, rnd); o.extra = true;
      return o;
    },
    similar3: function (rnd, q) {
      var L = CFG.L3, T = L.tiers[L.tiers.length - 1], op = q.rule.charAt(0), n = +q.rule.slice(1), old = q.pairs.map(String).join();
      for (var tries = 0; tries < 100; tries++) {
        var xs = [];
        for (var g = 0; xs.length < L.pairs && g < 50; g++) { var s = ri(rnd, T.s[0], T.s[1]); if (xs.indexOf(s) < 0) xs.push(s); }
        xs.sort(function (u, v) { return u - v; });
        var pairs = xs.map(function (s) { return op === 'x' ? [s, s * n] : [s * n, s]; });
        if (pairs.some(function (p) { return p[0] > L.maxVal || p[1] > L.maxVal; }) || pairs.map(String).join() === old) continue;
        var o = make3({ type: q.type, rule: q.rule, pairs: pairs }, rnd); o.extra = true;
        return o;
      }
      var o2 = Soal.L3(rnd, q.type, 0, q); o2.extra = true; return o2;
    },
    similar4: function (rnd, q) {
      var L = CFG.L4, T = L.tiers[L.tiers.length - 1];
      for (var tries = 0; tries < 400; tries++) {
        var s = ri(rnd, T.s[0], T.s[1]), c = chain(s, q.r1, q.r2);
        if (s === q.s || !inRange4(c, L.max) || c.e === s) continue;
        var o = make4({ type: q.type, s: s, r1: q.r1, r2: q.r2, m: c.m, e: c.e, extra: true }, rnd);
        if (o) return o;
      }
      var o2 = Soal.L4(rnd, q.type, 0, q); o2.extra = true; return o2;
    },
    /* L5 serupa: jenis dan cerita sama, bilangan lain dengan pembagi/aturan sama */
    similar5: function (rnd, q) {
      var L = CFG.L5, T = L.tiers[L.tiers.length - 1], W = L.two[L.two.length - 1], o;
      for (var tries = 0; tries < 400; tries++) {
        if (q.type === 'two') {
          var s = ri(rnd, W.s[0], W.s[1]), m = s * +q.r1.slice(1), n2 = +q.r2.slice(1);
          if (s === q.s || m > L.max || m % n2 || m / n2 < 2 || m / n2 === s) continue;
          o = make5({ type: 'two', kind: 'two', s: s, r1: q.r1, r2: q.r2, m: m, e: m / n2, product: q.product, cust: q.cust === 'a' ? 'b' : 'a', ctr: q.ctr, grp: q.grp, extra: true }, rnd);
          if (o) return o;
          continue;
        }
        var a = ri(rnd, T.a[0], T.a[1]), c = a * q.b;
        if (a === q.a || a === q.b || c < L.minBig || c > L.max) continue;
        return make5({ type: q.type, kind: q.kind, a: a, b: q.b, c: c, product: q.product, cust: q.cust === 'a' ? 'b' : 'a', ctr: q.ctr, grp: q.grp, extra: true }, rnd);
      }
      o = Soal.L5(rnd, q.type, 0, q); o.extra = true; return o;
    },
    similarLT: function (rnd, q) {
      var types = CFG.LT.types, t = types[(types.indexOf(q.type) + 1 + ri(rnd, 0, 1)) % types.length];
      var o = make2({ type: t, a: q.a, b: q.b }, rnd); o.table = q.table; o.extra = true;
      return o;
    }
  };
  root.Soal = Soal;
  if (typeof module !== 'undefined') module.exports = Soal;
})(typeof window !== 'undefined' ? window : globalThis);
