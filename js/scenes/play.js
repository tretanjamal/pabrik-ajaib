/* Layar bermain: runner bersama semua level. Level didaftarkan di Play.levels[n] (js/scenes/lv1.js .. lv5.js, 'lt' = Latihan).
   Runner mengurus: HUD + lampu kemajuan, papan persamaan, koin, kartu (seret, ketuk-lalu-ketuk, ketuk dua kali, Enter),
   tempat kartu (target), tuas, balon Gigo, tangan penunjuk + isyarat 8 detik diam, petunjuk bertingkat, adaptif,
   soal ulang di akhir level, penguasaan per fakta, timer bonus (bila level memakainya), Tabel, Bantuan, menu jeda.
   Level mengurus: dunia (mesin, ban, peti/keping/titik), isi papan, bentuk kartu, animasi mesin, pesan, peragaan. */
(function () {
  var C = Art.C;
  var CARD_X = [452, 592, 732, 872], CARD_Y = 558;
  var S = null, LV = null, els, bar, bubble, hand, gigo;
  var Play = window.Play = { levels: {}, CARD_Y: CARD_Y };

  var fmt = U.fmt;
  function alive(my) { return S === my && Scenes.name === 'play'; }
  Play.fmt = fmt; Play.alive = alive;
  /* wajah kartu aturan: tanda berwarna + bilangan */
  Play.ruleHTML = function (r) { var op = r.charAt(0); return '<span class="' + (op === 'x' ? 'x' : op === 'd' ? 'd' : 'p') + '">' + Soal.ruleText(r).charAt(0) + '</span>' + r.slice(1); };
  /* potongan papan persamaan */
  Play.Q = function (filled, ok) { return '<span class="q' + (filled != null ? ' filled' : '') + (ok ? ' ok' : '') + '">' + (filled != null ? filled : '?') + '</span>'; };
  Play.N = function (v, res) { return '<span class="n' + (res ? ' res' : '') + '" data-v="' + v + '">' + v + '</span>'; };
  Play.OP = function (s) { return '<span class="op">' + s + '</span>'; };
  Play.board = function (html, cls) { els.eq.className = 'eqboard' + (cls ? ' ' + cls : ''); els.eq.innerHTML = html; };
  Play.highlightBoard = function () { els.eq.querySelectorAll('.n').forEach(function (n) { n.classList.remove('hl'); void n.offsetWidth; n.classList.add('hl'); }); };
  /* gambar latar pabrik bersama (roda gigi dinding, katup berputar, uap pipa) */
  Play.drawFactory = function (t) {
    D.layer('play-bg', function (c) { D.img('bg_factory', 0, 0, 1280, 720, null, c); });
    D.img('gear_big', 1262, 470, 104, 104, { ax: 0.5, ay: 0.5, rot: t * 0.4 });
    D.img('valve_wheel', 54, 386, 92, 92, { ax: 0.5, ay: 0.5, rot: Math.sin(t * 0.5) * 1.2 });   // menutup katup di gambar latar agar berputar
    D.img('valve_wheel', 1226, 386, 92, 92, { ax: 0.5, ay: 0.5, rot: -Math.sin(t * 0.5 + 1) * 1.2 });
    if (Math.random() < 0.012) D.puff(40 + Math.random() * 1200, 52, { r: 8, vy: -20, life: 1.2 });
  };

  Scenes.add('play', {
    enter: function (root, params) {
      D.clear();
      var n = params.level || 1, cfg = n === 'lt' ? SOAL.LT : SOAL['L' + n];
      LV = Play.levels[n];
      var seed = U.TEST && /[?&]seed=(\d+)/.exec(location.search);
      S = {
        level: n, table: params.table || 0, firstVisit: n !== 'lt' && !Save.data.levels[n], cfg: cfg, rnd: U.rng(seed ? +seed[1] : Math.floor(Math.random() * 1e9)),
        tier: n === 'lt' ? 0 : Math.min(cfg.tiers.length - 1, Save.data.tier || 0), demoed: 0, okRow: 0, badRow: 0, idx: 0, plan: cfg.order.slice(), extras: [], extrasAdded: 0,
        q: null, last: null, phase: 'intro', wrongs: 0, hintLv: 0, errs: [], records: [], wrongTotal: 0, hints: 0,
        coinsEarned: 0, coinShown: Save.data.coins, selected: null, placed: {}, placedCards: {}, need: [],
        idleT: 0, paused: false, spoken: 0, time: 0, timed: !!cfg.bonusTime && !Save.data.settings.santai, timeShown: -1
      };
      Play.S = S;
      gigo = Gigo(108, 712, SKALA.FIXED.gigo.h);
      Play.gigo = gigo;
      LV.setup();
      build(root);
      nextQuestion();
      Aud.music(true, 'play');
    },
    exit: function () { if (S && S.baseSpeed) Tween.speed = S.baseSpeed; if (bar && bar._cleanup) bar._cleanup(); S = null; Play.S = null; UI.onPause = null; },
    update: function (dt) {
      if (!S) return;
      if (!S.paused) { LV.update(dt); gigo.update(dt); D.updateFx(dt); }   // jeda: gambar tetap, permainan berhenti
      var calm = !S.paused && !document.querySelector('.overlay');
      if ((S.phase === 'choose' || S.phase === 'lever') && calm) {
        S.idleT += dt;
        if (S.idleT > 8 && !S.idleShown) idleHint();
      }
      if (S.timed && calm && S.phase !== 'done' && S.phase !== 'intro') tickTimer(dt);
      if (S.coinShown < Save.data.coins) {
        S.coinShown = Math.min(Save.data.coins, S.coinShown + dt * 30);
        els.coinNum.textContent = Math.floor(S.coinShown);
      }
      D.begin();
      LV.draw();
      gigo.draw();
      D.drawPuffs(); D.drawParts();
    }
  });

  /* ================= DOM ================= */
  function build(root) {
    els = {}; Play.els = els; Play.root = root;
    var hud = U.h('div', 'hud', '<span class="lv">' + (LV.hud ? LV.hud() : STR.lv[S.level].hud) + '</span>');
    els.lamps = [];
    for (var i = 0; i < S.cfg.count; i++) { var l = U.h('i', 'plamp'); hud.appendChild(l); els.lamps.push(l); }
    root.appendChild(hud);
    if (S.cfg.bonusTime) {   // level bertimer: jam bonus, atau tanda "Santai" bila Mode Santai menyala
      els.timer = U.h('div', 'timer', '<svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="17" fill="#FFF6E0" stroke="#2E2350" stroke-width="4"/><path d="M24 26V15M24 26l7 5" stroke="#2E2350" stroke-width="4" stroke-linecap="round"/><rect x="19" y="3" width="10" height="6" rx="2" fill="#FFC23D" stroke="#2E2350" stroke-width="3"/></svg><span class="tt"></span>');
      els.timerTxt = els.timer.querySelector('.tt');
      root.appendChild(els.timer);
      paintTimer();
    }
    els.eq = U.h('div', 'eqboard'); els.eq.setAttribute('aria-live', 'polite'); root.appendChild(els.eq);
    els.coins = U.h('div', 'coins', '<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l4 5 6-2 1 6 6 2-2 6 5 4-5 4 2 6-6 2-1 6-6-2-4 5-4-5-6 2-1-6-6-2 2-6-5-4 5-4-2-6 6-2 1-6 6 2z" fill="#FFC23D" stroke="#2E2350" stroke-width="3"/><circle cx="24" cy="24" r="7" fill="#2E2350"/></svg><span class="cn">' + Save.data.coins + '</span>');
    els.coins.style.right = '290px';
    els.coinNum = els.coins.querySelector('.cn');
    root.appendChild(els.coins);
    bar = UI.iconBar(root, 'pause');
    UI.onPause = pauseMenu;

    if (LV.build) LV.build(root);

    var tray = U.h('div', 'tray'); tray.style.left = '430px'; tray.style.width = '838px'; root.appendChild(tray);
    els.slots = CARD_X.map(function (x) { var s = U.h('div', 'card-slot'); s.style.left = x + 'px'; s.style.top = CARD_Y + 'px'; root.appendChild(s); return s; });
    els.cards = [];
    els.tableBtn = UI.iconButton('table', 'mint ctl', openTable, { id: 'table', aria: STR.table, size: 46 });
    els.tableBtn.style.cssText += ';left:1016px;width:112px;height:76px;top:584px';
    els.helpBtn = UI.iconButton('help', 'brass ctl', function () { helpPressed(); }, { id: 'help', aria: STR.help, size: 46 });
    els.helpBtn.style.cssText += ';left:1142px;width:112px;height:76px;top:584px';
    root.appendChild(els.tableBtn); root.appendChild(els.helpBtn);
    var l1 = U.h('div', 'ctl-lbl', STR.table); l1.style.left = '1002px'; root.appendChild(l1);
    var l2 = U.h('div', 'ctl-lbl', STR.help); l2.style.left = '1128px'; root.appendChild(l2);

    // tempat kartu (target): tombol transparan di atas bagian mesin; bisa diketuk setelah memilih kartu
    els.targets = {};
    LV.targets.forEach(function (t) {
      var b = U.h('button', 'target'); b.type = 'button'; b.dataset.id = t.id; b.setAttribute('aria-label', t.label);
      b.style.cssText = 'left:' + t.btn.x + 'px;top:' + t.btn.y + 'px;width:' + t.btn.w + 'px;height:' + t.btn.h + 'px';
      b.addEventListener('click', function () { targetTapped(t.id); });
      root.appendChild(b); els.targets[t.id] = b;
    });
    var k = LV.knob();
    els.lever = U.h('button', 'target lever'); els.lever.type = 'button'; els.lever.dataset.id = 'lever'; els.lever.setAttribute('aria-label', STR.lever);
    els.lever.style.cssText = 'left:' + (k.x - 56) + 'px;top:' + (k.y - 56) + 'px;width:112px;height:112px';
    els.lever.addEventListener('click', function () { if (S && S.phase === 'lever') runMachine(); });
    els.lever.disabled = true;
    root.appendChild(els.lever);

    bubble = UI.bubble(root, 'up'); Play.bubble = bubble;
    bubble.anchor(118, 516);
    hand = UI.hand(root); Play.hand = hand;
    root.addEventListener('pointerdown', function () { if (S) { S.idleT = 0; if (S.idleShown) { S.idleShown = false; if (!S.q || !S.q.guided || S.phase !== 'choose') hand.hide(); } } }, true);
  }
  /* Level 5 memindah mesin tiap soal: tombol tempat kartu dan tuas mengikuti LV.targets / LV.knob() */
  Play.relayout = function () {
    LV.targets.forEach(function (t) { var b = els.targets[t.id]; b.style.left = t.btn.x + 'px'; b.style.top = t.btn.y + 'px'; b.style.width = t.btn.w + 'px'; b.style.height = t.btn.h + 'px'; });
    var k = LV.knob(); els.lever.style.left = (k.x - 56) + 'px'; els.lever.style.top = (k.y - 56) + 'px';
  };
  function paintTimer() {
    els.timer.classList.toggle('santai', !S.timed);
    els.timer.setAttribute('aria-label', S.timed ? STR.timer : STR.settings.santai);
    if (!S.timed) els.timerTxt.textContent = STR.santaiBadge;
    else { S.timeShown = -1; els.timerTxt.textContent = Math.floor(S.cfg.bonusTime / 60) + ':' + ('0' + S.cfg.bonusTime % 60).slice(-2); }
  }
  /* Mode Santai dinyalakan di tengah level: timer berhenti dan bintang 3 tidak lagi butuh waktu */
  function applySantai() {
    if (!S || !S.cfg.bonusTime) return;
    if (Save.data.settings.santai && S.timed) { S.timed = false; paintTimer(); }
  }
  function targetDef(id) { for (var i = 0; i < LV.targets.length; i++) if (LV.targets[i].id === id) return LV.targets[i]; return null; }
  function nextNeed() { for (var i = 0; i < S.need.length; i++) if (S.placed[S.need[i]] == null) return S.need[i]; return null; }
  Play.nextNeed = function () { return S ? nextNeed() : null; };
  function setTargets() {
    LV.targets.forEach(function (t) { var b = els.targets[t.id], on = S.need.indexOf(t.id) >= 0 && S.placed[t.id] == null; b.disabled = !on; b.classList.remove('armed'); });
  }

  function setLamps() {
    var done = S.records.filter(function (r) { return !r.extra; }).length;
    els.lamps.forEach(function (l, i) { l.className = 'plamp' + (i < done ? ' on' : (i === Math.min(S.idx, S.cfg.count - 1) ? ' cur' : '')); });
  }
  function tickTimer(dt) {
    S.time += dt;
    var left = Math.max(0, Math.ceil(S.cfg.bonusTime - S.time));
    if (left === S.timeShown) return;
    S.timeShown = left;
    els.timerTxt.textContent = Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
    if (left === 0 && !els.timer.classList.contains('out')) { els.timer.classList.add('out'); UI.toast(STR.timerOut); }
  }

  /* ================= kartu ================= */
  function makeCards() {
    els.cards.forEach(function (c) { if (c.el.parentNode) c.el.parentNode.removeChild(c.el); });
    els.cards = [];
    var q = S.q, root = Scenes.root;
    q.cards.forEach(function (cd, i) {
      var f = LV.cardFace(q, cd);
      var el = U.h('button', 'card ' + f.cls);
      el.type = 'button'; el.dataset.card = cd.id;
      el.setAttribute('aria-label', f.aria);
      el.innerHTML = '<span class="ch"></span><span class="cv' + (f.long || (typeof cd.v === 'number' && cd.v >= 100) ? ' long' : '') + '">' + f.main + '</span><span class="cu">' + (f.unit || '') + '</span>';
      var card = { el: el, d: cd, i: i, hx: CARD_X[i], hy: CARD_Y };
      el.style.left = card.hx + 'px'; el.style.top = (CARD_Y + 200) + 'px';
      root.appendChild(el);
      Tween.wait(80 * i).then(function () { return Tween.run(360, function (e) { el.style.top = (CARD_Y + 200 * (1 - e)) + 'px'; }, Ease.easeOutBack); });
      bindCard(card);
      els.cards.push(card);
    });
  }
  function inZone(p, z) { return p.x > z.x && p.x < z.x + z.w && p.y > z.y && p.y < z.y + z.h; }
  function dropTarget(p) {
    for (var i = 0; i < S.need.length; i++) {
      var id = S.need[i], t = targetDef(id);
      if (S.placed[id] == null && inZone(p, t.zone)) return id;
    }
    return null;
  }
  function bindCard(card) {
    var el = card.el, down = null, dragging = false, suppress = false;
    el.addEventListener('pointerdown', function (e) {
      if (!S || S.phase !== 'choose' || el.classList.contains('gone')) return;
      var p = Stage.toLocal(e.clientX, e.clientY);
      down = { x: p.x, y: p.y, ox: p.x - parseFloat(el.style.left), oy: p.y - parseFloat(el.style.top), id: e.pointerId };
      dragging = false;
      try { el.setPointerCapture(e.pointerId); } catch (er) { }
    });
    el.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== down.id) return;
      var p = Stage.toLocal(e.clientX, e.clientY);
      if (!dragging && Math.hypot(p.x - down.x, p.y - down.y) > 12) {
        dragging = true; el.classList.add('drag'); el.classList.remove('sel'); Aud.sfx('pick');
        if (S.selected && S.selected !== card) deselect();
        S.selected = card; hand.hide();
      }
      if (dragging) {
        el.style.left = (p.x - down.ox) + 'px'; el.style.top = (p.y - down.oy) + 'px';
        var over = dropTarget(p);
        LV.targets.forEach(function (t) { els.targets[t.id].classList.toggle('armed', t.id === over); });
      }
    });
    function up(e) {
      if (!down || e.pointerId !== down.id) return;
      var p = Stage.toLocal(e.clientX, e.clientY);
      down = null;
      if (dragging) {
        suppress = true; el.classList.remove('drag');
        LV.targets.forEach(function (t) { els.targets[t.id].classList.remove('armed'); });
        var tid = S && S.phase === 'choose' ? dropTarget(p) : null;
        if (tid) place(card, tid);
        else {
          if (S) S.selected = null;
          returnCard(card);
          if (S && S.phase === 'choose' && p.y < CARD_Y - 10) wrongDrop();
        }
      }
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', function (e) {   // sentuhan dibatalkan sistem: kartu pulang, bukan terpasang
      if (!down || e.pointerId !== down.id) return;
      var wasDrag = dragging; down = null; dragging = false; suppress = false;
      if (wasDrag) { el.classList.remove('drag'); LV.targets.forEach(function (t) { els.targets[t.id].classList.remove('armed'); }); if (S) S.selected = null; returnCard(card); }
    });
    el.addEventListener('click', function () {
      if (suppress) { suppress = false; return; }
      if (!S || S.phase !== 'choose' || el.classList.contains('gone')) return;
      Aud.init();
      if (S.selected === card) place(card, nextNeed());   // ketuk kedua (atau Enter kedua) = masukkan ke tempat berikutnya
      else select(card);
    });
  }
  function select(card) {
    deselect();
    S.selected = card; card.el.classList.add('sel'); Aud.sfx('pick');
    var nx = nextNeed(); if (nx) els.targets[nx].classList.add('armed');
    if (S.q.guided) { var a = targetDef(nx).anchor; hand.at(a.x, a.y); }
  }
  function deselect() {
    if (S.selected) S.selected.el.classList.remove('sel');
    S.selected = null;
    LV.targets.forEach(function (t) { els.targets[t.id].classList.remove('armed'); });
  }
  /* kartu dilepas di luar tempatnya: tempat yang benar menyala + arahan */
  function wrongDrop() {
    var nx = nextNeed(), b = nx && els.targets[nx]; if (!b) return;
    bubble.setText(STR.dropHere); b.classList.add('armed');
    Tween.wait(1200).then(function () { b.classList.remove('armed'); });
  }
  /* kembalikan kartu ke baki; fromSlot = keluar dari mesin (mulai kecil, membesar sambil pulang) */
  function returnCard(card, fromSlot) {
    var el = card.el, x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top);
    el.classList.remove('gone', 'sel', 'hint');
    el.style.transform = fromSlot ? 'scale(.35)' : '';
    return Tween.run(fromSlot ? 380 : 260, function (e) {
      el.style.left = (x0 + (card.hx - x0) * e) + 'px'; el.style.top = (y0 + (card.hy - y0) * e) + 'px';
      if (fromSlot) el.style.transform = 'scale(' + (0.35 + 0.65 * e) + ')';
    }, Ease.easeInOutCubic).then(function () { el.style.transform = ''; });
  }
  function targetTapped(id) {
    if (!S || S.phase !== 'choose') return;
    if (S.selected && S.need.indexOf(id) >= 0 && S.placed[id] == null) place(S.selected, id);
    else if (!S.selected) { bubble.setText(STR.pickFirst); els.cards.forEach(function (c) { if (c.el.classList.contains('gone')) return; c.el.classList.remove('wob'); void c.el.offsetWidth; c.el.classList.add('wob'); }); }
  }

  /* ================= alur soal ================= */
  function sig(q) { return JSON.stringify([q.type, q.a, q.b, q.rule, q.pairs, q.s, q.r1, q.r2]); }
  function nextQuestion() {
    var my = S, q;
    if (S.idx < S.plan.length) {
      var tierNow = S.tier;
      if (S.idx === S.plan.length - 1) S.tier = Soal.planTier(S.tier, S.cfg.tiers.length - 1);   // soal utama terakhir sedikit lebih menantang
      q = LV.gen(S.plan[S.idx]);
      S.tier = tierNow;
    } else if (S.extras.length) {
      q = S.extras.shift();
      for (var g = 0; g < 5 && S.last && sig(q) === sig(S.last); g++) q = LV.similar(q);   // tidak identik berturut-turut
    } else return finish();
    S.q = q; S.last = q; S.wrongs = 0; S.hintLv = 0; S.errs = []; S.placed = {}; S.placedCards = {}; S.selected = null; S.similarQueued = false; S.demoQ = false;
    showQuestion(q, my);
  }
  function showQuestion(q, my) {
    S.need = q.need || [LV.targets[0].id];
    if (LV.layout) { LV.layout(q); Play.relayout(); }
    setLamps(); setTargets(); makeCards();
    Promise.resolve(LV.show(q, my)).then(function () { if (alive(my)) startChoose(); });
  }
  /* jawaban sudah terlihat (a × b = ?, c : b = ?): lanjut dengan bilangan lain agar murid tidak sekadar menyalin */
  function swapQuestion(my) {
    var old = S.q, q = LV.gen(old.type);
    q.extra = old.extra;
    S.q = q; S.last = q; S.placed = {}; S.placedCards = {}; S.selected = null;
    showQuestion(q, my);
  }
  /* pilihan keyboard tidak boleh hilang: fokus jatuh ke BODY saat tombol yang terfokus hilang */
  function keepFocus(el) { var a = document.activeElement; if (!a || a === document.body || a.disabled || a.classList.contains('gone')) el.focus({ preventScroll: true }); }
  function startChoose() {
    var q = S.q, my = S;
    S.phase = 'choose'; S.idleT = 0; S.idleShown = false;
    gigo.mood = 'happy';
    if (LV.intro && LV.intro(q)) return;   // soal pandu L1 mengatur balon dan tangan sendiri
    if (els.cards[0]) keepFocus(els.cards[0].el);
    if (S.hintLv >= 3) pointAnswer();
    var first = S.firstVisit && S.idx === 0 && !q.extra && S.wrongs === 0;
    var pre = q.extra ? STR.wrong.extra : (first && STR.firstTip[S.level]) || null;
    // Level 5: cerita pelanggan masih dibacakan, kartu sudah bisa dipilih
    Promise.resolve(LV.narration ? LV.narration() : null).then(function () {
      if (!alive(my) || S.q !== q || S.phase !== 'choose' || S.selected || Object.keys(S.placed).length || !pre) return;
      return bubble.say(pre);
    }).then(function () {
      if (!alive(my) || S.q !== q || S.phase !== 'choose' || S.selected || Object.keys(S.placed).length) return;   // murid sudah bertindak
      return bubble.say(LV.sayText(q));
    }).then(function () {
      // pertama kali masuk mesin ini: tangan penunjuk langsung memperlihatkan gerakannya (tanpa membocorkan jawaban)
      if (alive(my) && S.q === q && first && S.phase === 'choose' && !S.selected) idleHint();
    });
  }

  function place(card, tid) {
    if (!tid) return;
    var my = S, q = S.q, el = card.el, t = targetDef(tid);
    S.phase = 'busy'; deselect(); hand.hide(); S.placedCards[tid] = card; S.placed[tid] = card.d.v;
    els.targets[tid].disabled = true;
    var tx = t.anchor.x - 62, ty = t.anchor.y - 74, x0 = parseFloat(el.style.left), y0 = parseFloat(el.style.top);
    el.classList.remove('sel', 'hint');
    Tween.run(300, function (e) {
      el.style.left = (x0 + (tx - x0) * e) + 'px'; el.style.top = (y0 + (ty - y0) * e) + 'px';
      el.style.transform = 'scale(' + (1 - 0.65 * e) + ')';
    }, Ease.easeInOutCubic).then(function () {
      if (!alive(my)) return;
      el.classList.add('gone'); el.style.transform = '';
      Aud.sfx('card');
      var handled = LV.onPlace(q, tid, card.d.v);
      var rest = nextNeed();
      S.idleT = 0;
      if (rest) {   // masih ada tempat kosong (L4: dua mesin)
        S.phase = 'choose';
        if (!handled) bubble.say(LV.partialText ? LV.partialText(q) : STR.say.idle);
        if (S.hintLv >= 3) pointAnswer();
        return;
      }
      S.phase = 'lever';
      els.lever.disabled = false; els.lever.classList.add('armed');
      keepFocus(els.lever);
      if (handled) return;
      if (S.spoken < 2) { S.spoken++; bubble.say(STR.say.pull); }
      else bubble.setText(STR.say.pull);
    });
  }

  async function runMachine() {
    var my = S, q = S.q, placed = {}, k;
    for (k in S.placed) placed[k] = S.placed[k];
    S.phase = 'busy'; els.lever.disabled = true; els.lever.classList.remove('armed'); hand.hide();
    bubble.setText(STR.say.running);
    if (S.wrongs > 0) { S.baseSpeed = Tween.speed; Tween.speed = S.baseSpeed * 0.6; }   // percobaan ulang: animasi sama dipercepat
    await LV.pull(); if (!alive(my)) return;
    var res = await LV.run(q, placed, my); if (!alive(my)) return;
    if (S.baseSpeed) { Tween.speed = S.baseSpeed; S.baseSpeed = 0; }
    if (LV.solve(q, placed)) onCorrect(my, res, placed); else onWrong(my, res, placed);
  }

  /* fakta dicatat hanya dari soal yang menuntut fakta itu (L1, L2, Latihan); di L3-L5 mesin yang menghitung */
  function factsOf(q) { return S.level === 'lt' || S.level <= 2 ? (q.facts || [q.fact]) : []; }

  async function onCorrect(my, res, placed) {
    // "benar langsung" = tanpa salah, tanpa dipandu, dan tanpa bantuan sorot/peragaan: hanya ini yang menaikkan penguasaan
    var q = S.q, first = S.wrongs === 0 && S.hintLv < 2 && !q.guided, cfg = S.cfg, facts = factsOf(q);
    S.phase = 'busy';
    LV.correctFx(q, placed, res);
    Aud.sfx('ding'); Aud.sfx('good');
    gigo.cheer();
    var earned = S.wrongs === 0 ? 10 : 5;
    S.coinsEarned += earned; Save.data.coins += earned;
    els.coins.classList.remove('bump'); void els.coins.offsetWidth; els.coins.classList.add('bump');
    Aud.sfx('coin');
    Save.record(facts, S.level + ':' + q.type, first);
    if (q.guided) Save.data.onboarded = true;
    Save.save();
    S.records.push({ type: LV.skillKey(q), key: S.level + ':' + q.type, guided: !!q.guided, fact: q.fact, facts: facts, wrongs: S.wrongs, errs: S.errs.slice(), hints: S.hintLv, extra: !!q.extra, first: first });
    if (first) { S.okRow++; S.badRow = 0; if (S.okRow >= 3) { S.tier = Math.min(cfg.tiers.length - 1, S.tier + 1); S.okRow = 0; } }
    if (!first && !q.extra && !S.similarQueued && S.extrasAdded < cfg.maxExtra) { S.extras.push(LV.similar(q)); S.extrasAdded++; }
    if (!q.extra) S.idx++;
    setLamps();
    await bubble.say(LV.goodMsg(q, S.rnd)); if (!alive(my)) return;
    await Tween.wait(500); if (!alive(my)) return;
    await LV.leave(q, my); if (!alive(my)) return;
    gigo.mood = 'happy';
    nextQuestion();
  }

  async function onWrong(my, res, placed) {
    var q = S.q, cards = Object.keys(S.placedCards).map(function (k) { return S.placedCards[k].d; });
    var err = LV.errOf(q, placed, cards, res);
    S.wrongs++; S.wrongTotal++; S.errs.push(err);
    Save.recordWrong(factsOf(q), S.level + ':' + q.type); Save.save();
    S.okRow = 0; S.badRow++;
    if (S.badRow >= 2) { S.tier = Math.max(0, S.tier - 1); S.badRow = 0; }
    Aud.sfx('bad'); LV.cough(q, res); gigo.mood = 'think';
    await bubble.say(LV.wrongMsg(q, placed, res)); if (!alive(my)) return;
    await Tween.wait(900); if (!alive(my)) return;   // beri waktu membaca hasil tebakan
    await showHint(Math.min(3, Math.max(S.hintLv + 1, S.wrongs)), err, my, res); if (!alive(my)) return;
    if (S.hintLv < 3 && LV.reveals && LV.reveals(q)) { await Tween.wait(500); if (alive(my)) swapQuestion(my); return; }
    resetForRetry();
  }

  function resetForRetry() {
    var q = S.q, cards = Object.keys(S.placedCards).map(function (k) { return S.placedCards[k]; });
    LV.reset(q);
    cards.forEach(function (card) { returnCard(card, true).then(function () { card.el.classList.remove('wob'); void card.el.offsetWidth; card.el.classList.add('wob'); }); });
    S.placed = {}; S.placedCards = {};
    setTargets();
    S.phase = 'choose'; S.idleT = 0;
    if (S.hintLv >= 3) pointAnswer();
    if (els.cards[0]) keepFocus(els.cards[0].el);
  }
  /* tunjuk kartu benar untuk tempat kosong berikutnya (setelah peragaan) */
  function pointAnswer() {
    var nx = nextNeed(), ok = els.cards.filter(function (c) { return c.d.err === 'ok' && (!c.d.slot || c.d.slot === nx) && !c.el.classList.contains('gone'); })[0];
    if (!ok) return;
    els.cards.forEach(function (c) { c.el.classList.remove('hint'); });
    ok.el.classList.add('hint'); hand.at(ok.hx + 96, ok.hy + 122); S.idleShown = true;   // di tepi bawah kartu agar angkanya terbaca
  }

  /* petunjuk bertingkat: 1 dorongan khusus jenis salah; 2 sorot bagian penting; 3 peragaan cara + kartu benar ditunjuk */
  async function showHint(lv, err, my, res) {
    var q = S.q;
    S.hintLv = Math.max(S.hintLv, lv);
    if (lv <= 1) { await bubble.say(LV.tip(q, err, res)); return; }
    if (lv === 2) { await LV.hint2(q, my); return; }
    await LV.demo(q, my); if (!alive(my)) return;
    if (!q.extra && S.extrasAdded < S.cfg.maxExtra && !S.similarQueued) { S.extras.push(LV.similar(q)); S.extrasAdded++; S.similarQueued = true; }
    await bubble.say(fmt(STR.wrong.showAnswer, { ans: LV.answerText(q) }));
  }

  /* kartu yang sudah terpasang kembali ke baki agar peragaan tidak bertentangan dengan isi mesin */
  function takeBackCards() {
    var cards = Object.keys(S.placedCards).map(function (k) { return S.placedCards[k]; });
    if (!cards.length) return;
    LV.reset(S.q); cards.forEach(function (c) { returnCard(c, true); });
    S.placed = {}; S.placedCards = {};
    els.lever.disabled = true; els.lever.classList.remove('armed');
    setTargets();
  }
  function helpPressed() {
    if (!S || (S.phase !== 'choose' && S.phase !== 'lever')) return;
    var my = S;
    S.hints++; S.idleT = 0;
    takeBackCards();
    var lv = Math.min(3, S.hintLv + 1);
    if (lv >= 3 && !S.demoQ) { S.demoQ = true; S.demoed++; }   // peragaan lewat Bantuan dihitung seperti satu kesalahan untuk bintang
    S.phase = 'busy';
    showHint(lv, null, my).then(function () {
      if (!alive(my)) return;
      if (lv >= 3) { if (LV.afterDemo) LV.afterDemo(S.q); pointAnswer(); }
      S.phase = 'choose';
    });
  }

  /* tangan penunjuk setelah 8 detik diam: tunjukkan GERAKANNYA (seret ke mesin / tarik tuas) tanpa membocorkan jawaban */
  function idleHint() {
    S.idleShown = true;
    if (S.phase === 'lever') { var k = LV.knob(); hand.at(k.x, k.y); bubble.setText(STR.say.pull); return; }
    var nx = nextNeed(), a = targetDef(nx).anchor, free = els.cards.filter(function (c) { return !c.el.classList.contains('gone'); }), mid = free[1] || free[0];
    hand.drag(mid.hx + 62, mid.hy + 130, a.x, a.y);
    bubble.setText(STR.say.idle);
  }

  function finish() {
    S.phase = 'done';
    var miss = S.wrongTotal + S.demoed, stars = miss <= 1 ? 3 : miss <= 3 ? 2 : 1;
    var late = S.timed && S.time > S.cfg.bonusTime;
    if (stars === 3 && late) stars = 2;   // timer hanya untuk bonus bintang 3
    var before = Dekor.total();
    if (S.level === 'lt') Save.data.practice = (Save.data.practice || 0) + 1;   // latihan bebas tidak memberi bintang mesin
    else { var lv = Save.data.levels[S.level] || (Save.data.levels[S.level] = { stars: 0 }); lv.stars = Math.max(lv.stars, stars); Save.data.tier = S.tier; }
    Save.save();
    Scenes.go('result', { level: S.level, table: S.table, starsBefore: before, stars: stars, coins: S.coinsEarned, records: S.records, wrongTotal: S.wrongTotal, hints: S.hints, santai: Save.data.settings.santai, timed: S.timed, time: Math.round(S.time), late: late });
  }

  /* ================= panel ================= */
  /* jeda sungguhan: mesin, animasi, pewaktu, dan suara Gigo berhenti sampai panel ditutup */
  function setPaused(on) {
    if (!S) return;
    S.paused = on; S.idleT = 0; Tween.paused = on;
    if (on) Voice.stop();
  }
  function openTable() {
    if (!S) return;
    setPaused(true);
    Tabel.open(function () { setPaused(false); });
  }
  function pauseMenu() {
    if (!S) return;
    setPaused(true);
    var o = UI.overlay(STR.pause.title, 'pausepanel'), n = S.level, tb = S.table;
    var resume = Input.button(UI.icon('play', 40) + STR.pause.resume, 'coral wide', function () { o.close(); }, { id: 'resume' });
    o.body.appendChild(resume);
    // Pengaturan (Suara, Suara Gigo, Kurangi animasi, Mode Santai) di atas menu jeda; Santai langsung berlaku
    o.body.appendChild(Input.button(UI.icon('gear', 40) + STR.pause.settings, 'brass wide', function () {
      UI.settings(function () { applySantai(); });
    }, { id: 'pause-settings' }));
    o.body.appendChild(Input.button(UI.icon('replay', 40) + STR.pause.restart, 'mint wide', function () { o.close(); Scenes.go('play', { level: n, table: tb }); }, { id: 'restart' }));
    o.body.appendChild(Input.button(UI.icon('table', 40) + STR.levels.title, 'plum wide', function () { o.close(); Scenes.go('levels'); }, { id: 'pause-levels' }));
    o.body.appendChild(Input.button(UI.icon('home', 40) + STR.pause.home, 'plum wide', function () { o.close(); Scenes.go('title'); }, { id: 'home' }));
    o.onClose = function () { setPaused(false); };
    setTimeout(function () { resume.focus(); }, 30);
  }

  /* kait uji (hanya ?test=1) */
  if (U.TEST) {
    window.__test = window.__test || {};
    window.__test.phase = function () { return S && S.phase; };
    window.__test.level = function () { return S && S.level; };
    window.__test.q = function () { return S && S.q && LV.testQ(S.q); };
    window.__test.target = function () { return S && nextNeed(); };
    window.__test.expected = function () {
      if (!S || !S.q || S.phase !== 'choose') return null;
      var nx = nextNeed(), c = S.q.cards.filter(function (k) { return k.err === 'ok' && (!k.slot || k.slot === nx); })[0];
      return c && c.id;
    };
    window.__test.wrongCard = function () {
      if (!S || !S.q) return null;
      var used = Object.keys(S.placedCards).map(function (k) { return S.placedCards[k].d.id; });
      var c = S.q.cards.filter(function (k) { return k.err !== 'ok' && used.indexOf(k.id) < 0; })[0];
      return c && c.id;
    };
    window.__test.tier = function () { return S && S.tier; };
    window.__test.timed = function () { return S && S.timed; };
  }
})();
