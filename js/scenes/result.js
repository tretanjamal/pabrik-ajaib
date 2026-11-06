/* Layar hasil: lampu bintang menyala satu per satu dengan nada bertingkat, koin menghitung naik, keterampilan dan
   "kekuatan aljabar" dalam bahasa anak, hiasan pabrik yang baru terbuka, dan panel "Catatan untuk Guru" (tanpa data pribadi)
   bertab: Sesi ini (kompetensi, fakta, pola kesalahan), Aljabar (dua kompetensi brief + aturan + cerita, sesi ini dan semua sesi),
   Rekap (bintang tiap mesin, fakta dikuasai, latihan bebas). Juga dipakai Latihan bebas (level 'lt', tanpa bintang mesin). */
(function () {
  var C = Art.C, P, lampsOn, gigo, coinsEl, t;
  var LAMP_X = [150, 290, 430], LAMP_Y = 228;
  var SKILLS = { 1: ['rule', 'output', 'input'], 2: ['div', 'missf', 'divisor'], 3: ['mul', 'div3'], 4: ['second', 'first', 'start', 'both'], 5: ['op5', 'num5', 'two5'], lt: ['ltmul', 'ltdiv', 'ltmissf'] };
  /* kompetensi aljabar -> jenis soal (kunci 'level:jenis', sama dengan Save.data.skills) */
  var ALG = {
    unknown: ['1:rule', '1:input', '2:missf', '2:divisor', '4:first', '4:start', '5:num', 'lt:missf'],
    inverse: ['2:missf', '2:divisor', '4:first', '4:start', '5:num', 'lt:missf'],
    rule: ['3:mul', '3:div', '4:second'],
    story: ['4:both', '5:op', '5:two']
  };
  var COL = { ok: C.green, mid: C.brass, low: C.coral, few: C.lavL, none: '#ffffff' };
  var fmt = U.fmt;

  /* satu aturan untuk sesi ini dan semua sesi: proporsi benar langsung (tanpa salah, tanpa peragaan). Kurang dari 2 soal = data sedikit */
  function statusOf(first, seen) {
    if (!seen) return 'none';
    if (seen < 2) return 'few';
    var r = first / seen;
    return r >= 0.8 ? 'ok' : r >= 0.5 ? 'mid' : 'low';
  }
  function tally(recs) { return { first: recs.filter(function (r) { return r.first; }).length, seen: recs.length }; }
  function tallyAll(keys) {
    var seen = 0, first = 0;
    keys.forEach(function (k) { var s = Save.data.skills[k]; if (s) { seen += s.ok; first += s.first; } });
    return { first: first, seen: seen };
  }
  /* sel status: titik + kata (bukan warna saja) + jumlah benar langsung */
  function stCell(n) {
    var st = statusOf(n.first, n.seen);
    return '<td class="st"><i class="dot" style="background:' + COL[st] + '"></i>' + STR.result.status[st] + (n.seen ? ' <small>' + n.first + '/' + n.seen + '</small>' : '') + '</td>';
  }
  /* layar anak: sudah bisa bila status baik, atau satu-satunya soal jenis itu benar langsung */
  function kidOk(recs) { var n = tally(recs), st = statusOf(n.first, n.seen); return st === 'ok' || st === 'mid' || (st === 'few' && n.first === 1); }
  function list(arr) { return arr.length > 8 ? arr.slice(0, 8).join(', ') + ', …' : arr.join(', '); }

  Scenes.add('result', {
    enter: function (root, params) {
      P = params; lampsOn = [0, 0, 0]; t = 0;
      D.clear();
      gigo = Gigo(578, 338, 168);
      gigo.mood = P.stars >= 2 ? 'cheer' : 'happy';
      var R = STR.result, all = P.records || [], recs = all.filter(function (r) { return !r.guided; }), lv = P.level || 1, lt = lv === 'lt';   // soal pandu tidak dinilai
      var main = recs.filter(function (r) { return !r.extra; });

      var left = U.h('div', 'res-left');
      var sub = lt ? fmt(STR.LT.resSub, { n: P.table, k: main.filter(function (r) { return r.first; }).length, all: main.length }) : STR.lv[lv].hud + ': ' + R.sub[Math.max(0, P.stars - 1)];
      left.innerHTML = '<div class="res-title">' + (lt ? STR.LT.resTitle : R.title) + '</div><div class="res-sub">' + sub + '</div>';
      coinsEl = U.h('div', 'coins res-coins', '<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l4 5 6-2 1 6 6 2-2 6 5 4-5 4 2 6-6 2-1 6-6-2-4 5-4-5-6 2-1-6-6-2 2-6-5-4 5-4-2-6 6-2 1-6 6 2z" fill="#FFC23D" stroke="#2E2350" stroke-width="3"/><circle cx="24" cy="24" r="7" fill="#2E2350"/></svg><span class="cn">+0</span>');
      coinsEl.style.right = 'auto';
      left.appendChild(coinsEl);
      // keterampilan (bahasa anak) + kekuatan aljabar
      var types = SKILLS[lv], done = [], todo = [];
      types.forEach(function (ty) {
        var rr = recs.filter(function (r) { return r.type === ty; });
        if (!rr.length) return;
        (kidOk(rr) ? done : todo).push(R.skills[ty]);
      });
      var alg = ['unknown', 'inverse'].map(function (k) {
        var rr = recs.filter(function (r) { return ALG[k].indexOf(r.key) >= 0; });
        if (!rr.length) return '';
        var yes = kidOk(rr);
        return '<li class="alg' + (yes ? '' : ' todo') + '">' + (yes ? R.algebraKid[k] : R.skillsTodo + ': ' + R.algebraKid[k].charAt(0).toLowerCase() + R.algebraKid[k].slice(1)) + '</li>';
      }).join('');
      var sk = U.h('div', 'res-skills');
      // judul mengikuti isi: bila belum ada yang dikuasai, jangan menulis "sudah kamu kuasai"
      sk.innerHTML = (done.length ? '<h3>' + R.skillsTitle + '</h3><ul>' + done.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' : '') +
        (todo.length ? '<h3>' + R.skillsTodoTitle + '</h3><ul>' + todo.map(function (s) { return '<li class="todo">' + s + '</li>'; }).join('') + '</ul>' : '') +
        (alg ? '<h3>' + R.algebraKidTitle + '</h3><ul>' + alg + '</ul>' : '');
      left.appendChild(sk);
      root.appendChild(left);
      // hiasan pabrik yang baru terbuka
      var fresh = lt ? [] : Dekor.fresh(P.starsBefore || 0, Dekor.total());
      if (fresh.length) {
        var un = U.h('div', 'unlock', Dekor.svg(fresh[fresh.length - 1].id, 40) + '<span>' + fmt(STR.dekor.fresh, { name: STR.dekor.names[fresh[fresh.length - 1].id] }) + '</span>');
        un.style.opacity = 0; left.appendChild(un);
        P.unlockEl = un;
      }

      // Catatan untuk Guru (bertab)
      var tp = U.h('div', 'panel teacher');
      tp.innerHTML = '<div class="phead"><span>' + R.teacherTitle + '</span><i class="lamp on"></i><i class="lamp"></i></div>';
      var tabs = U.h('div', 'ttabs'), body = U.h('div', 'pbody');
      tabs.setAttribute('role', 'tablist');
      var pages = { session: sessionHTML(R, recs, lv, types), algebra: algebraHTML(R, recs, lv), all: allHTML(R) };
      Object.keys(pages).forEach(function (k, i) {
        var b = Input.button(R.tabs[k], 'tab' + (i ? '' : ' on'), function () { pick(k); }, { id: 'tab-' + k });
        b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i ? 'false' : 'true');
        tabs.appendChild(b);
      });
      function pick(k) {
        body.innerHTML = pages[k];
        tabs.querySelectorAll('.btn').forEach(function (b) { var on = b.dataset.id === 'tab-' + k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      }
      tp.appendChild(tabs); tp.appendChild(body); pick('session');
      root.appendChild(tp);

      var btns = U.h('div', 'res-btns'), nx;
      if (lt) {
        btns.appendChild(Input.button(UI.icon('replay', 38) + STR.LT.again, 'mint', function () { Scenes.go('play', { level: 'lt', table: P.table }); }, { id: 'again' }));
        btns.appendChild(Input.button(STR.LT.pick, 'plum', function () { Scenes.go('practice'); }, { id: 'home' }));
        nx = Input.button(R.choose, 'coral', function () { Scenes.go('levels'); }, { id: 'next' });
      } else {
        btns.appendChild(Input.button(UI.icon('replay', 38) + R.again, 'mint', function () { Scenes.go('play', { level: lv }); }, { id: 'again' }));
        if (lv < 5) btns.appendChild(Input.button(R.choose, 'plum', function () { Scenes.go('levels'); }, { id: 'levels' }));
        else btns.appendChild(Input.button(UI.icon('home', 38) + R.home, 'plum', function () { Scenes.go('title'); }, { id: 'home' }));
        nx = lv < 5
          ? Input.button(fmt(R.next, { n: lv + 1 }) + UI.icon('play', 34), 'coral', function () { Scenes.go('play', { level: lv + 1 }); }, { id: 'next' })
          : Input.button(R.choose, 'coral', function () { Scenes.go('levels'); }, { id: 'next' });
      }
      btns.appendChild(nx);
      root.appendChild(btns);
      Aud.music(false);
      play(P.stars >= 2 ? nx : btns.firstChild);
      if (U.TEST) { window.__test = window.__test || {}; window.__test.result = { level: lv, stars: P.stars, coins: P.coins, wrong: P.wrongTotal, records: all.length, timed: !!P.timed, time: P.time, fresh: fresh.map(function (d) { return d.id; }) }; }
    },
    update: function (dt) {
      t += dt; gigo.update(dt); D.updateFx(dt);
      D.begin();
      D.layer('res-bg', function (c) { D.img('bg_factory', 0, 0, 1280, 720, null, c); c.fillStyle = 'rgba(46,35,80,0.42)'; c.fillRect(0, 0, 1280, 720); });
      var lb = { w: 128, h: 128 * Assets.get('lamp_off').h / Assets.get('lamp_off').w }, gl = Assets.get('lamp_off').m.glass;
      LAMP_X.forEach(function (x, i) {
        var on = lampsOn[i], gx = gl[0] + gl[2] / 2, gy = gl[1] + gl[3] / 2;
        D.shadow(x, LAMP_Y + lb.h * (1 - gy) + 4, lb.w * 0.42, 8, 0.3);
        D.img('lamp_off', x, LAMP_Y, lb.w, lb.h, { ax: gx, ay: gy, sx: 1 + on * 0.06 * Math.sin(Math.min(1, on) * Math.PI), sy: 1 + on * 0.06 * Math.sin(Math.min(1, on) * Math.PI) });
        if (on > 0.01) {
          var rr = gl[2] * lb.w * 0.5;
          D.glow(x, LAMP_Y, rr * 3.2, C.brass, 0.7 * Math.min(1, on));
          var c = D.ctx; c.save(); c.globalAlpha = 0.8 * Math.min(1, on); c.fillStyle = C.brass;
          c.beginPath(); c.ellipse(x, LAMP_Y, rr * 0.86, gl[3] * lb.h * 0.45, 0, 0, Math.PI * 2); c.fill(); c.restore();
          D.sparkle(x, LAMP_Y, 22 * Math.min(1, on) + 3 * Math.sin(t * 4 + i), C.cream);
        }
      });
      gigo.draw();
      D.drawParts();
    },
    exit: function () { Voice.stop(); }
  });

  /* tab "Sesi ini": status per jenis soal, fakta, pola kesalahan, bonus waktu */
  function sessionHTML(R, recs, lv, types) {
    var rows = types.filter(function (ty) { return (lv !== 4 && lv !== 5) || recs.some(function (r) { return r.type === ty; }); }).map(function (ty) {
      return '<tr><td>' + R.tSkills[ty] + '</td>' + stCell(tally(recs.filter(function (r) { return r.type === ty; }))) + '</tr>';
    }).join('');
    var okF = [], lowF = [], seen = {};
    recs.forEach(function (r) {
      (r.facts || []).filter(Boolean).forEach(function (f) { seen[f] = seen[f] || { w: 0 }; seen[f].w += r.wrongs; });
    });
    Object.keys(seen).forEach(function (f) { (seen[f].w === 0 ? okF : lowF).push(f.replace('x', ' × ')); });
    var errs = {}; recs.forEach(function (r) { r.errs.forEach(function (e) { if (e !== 'ok') errs[e] = (errs[e] || 0) + 1; }); });
    var tops = Object.keys(errs).filter(function (e) { return R.tips[e]; }).sort(function (a, b) { return errs[b] - errs[a]; }).slice(0, 2);
    var time = P.timed ? '<p>' + fmt(R.timeBonus, { s: Math.floor(P.time / 60) + ':' + ('0' + P.time % 60).slice(-2) + ' / ' + Math.floor(SOAL.L4.bonusTime / 60) + ':00' }) + '</p>' : (lv === 4 && P.santai ? '<p>' + R.santaiNote + '</p>' : '');
    return '<table><tr><th>' + R.tColSkill + '</th><th>' + R.tColStatus + '</th></tr>' + rows + '</table>' +
      (okF.length || lowF.length ? '<p>' + fmt(R.factsOk, { list: list(okF) || R.none }) + '</p><p>' + fmt(R.factsLow, { list: list(lowF) || R.none }) + '</p>' : '') +
      '<p><b>' + R.errTitle + ':</b> ' + (tops.length ? tops.map(function (e) { return R.tips[e]; }).join(' ') : R.tips.none) + '</p>' +
      (P.hints ? '<p>' + fmt(R.hintsUsed, { n: P.hints }) + '</p>' : '') + time;
  }
  /* tab "Aljabar": kompetensi brief (bilangan belum diketahui, hubungan x dan :) + aturan + cerita; sesi ini dan semua sesi */
  function algebraHTML(R, recs, lv) {
    var rows = ['unknown', 'inverse', 'rule', 'story'].map(function (k) {
      var rr = recs.filter(function (r) { return ALG[k].indexOf(r.key) >= 0; });
      return '<tr><td>' + R.alg[k] + '</td>' + stCell(tally(rr)) + stCell(tallyAll(ALG[k])) + '</tr>';
    }).join('');
    return '<table class="alg"><tr><th>' + R.algTitle + '</th><th>' + R.algSession + '</th><th>' + R.algAll + '</th></tr>' + rows + '</table>' +
      '<p>' + R.algebraLv[lv] + '</p>';
  }
  /* tab "Rekap": bintang tiap mesin, fakta 2-10 yang dikuasai, latihan bebas */
  function allHTML(R) {
    var rows = '';
    for (var n = 1; n <= 5; n++) {
      var s = (Save.data.levels[n] && Save.data.levels[n].stars) || 0, lamps = '';
      for (var i = 0; i < 3; i++) lamps += '<i class="slamp' + (i < s ? ' on' : '') + '"></i>';
      rows += '<tr><td>' + STR.lv[n].hud + ' ' + STR.lv[n].name + '</td><td class="st" aria-label="' + fmt(STR.levels.stars, { n: s }) + '">' + lamps + '</td></tr>';
    }
    return '<table><tr><th>' + R.allStars + '</th><th></th></tr>' + rows + '</table>' +
      '<p>' + fmt(R.allFacts, Tabel.countMastered()) + '</p>' +
      '<p>' + fmt(R.allWeak, { list: list(Save.weakFacts().map(function (f) { return f.replace('x', ' × '); })) || R.none }) + '</p>' +
      '<p>' + fmt(R.allPractice, { n: Save.data.practice || 0 }) + '</p>';
  }

  async function play(focusBtn) {
    var my = P;
    for (var i = 0; i < 3; i++) {
      await Tween.wait(450); if (P !== my) return;
      if (i < P.stars) {
        (function (k) { Tween.run(420, function (e) { lampsOn[k] = e; }, Ease.easeOutBack); })(i);
        Aud.sfx('star', i); D.burst(LAMP_X[i], LAMP_Y, 12);
      } else Aud.sfx('empty');
    }
    await Tween.wait(300); if (P !== my) return;
    Aud.sfx('fanfare', P.stars);
    if (P.stars >= 2) gigo.cheer();
    if (P.unlockEl) {   // hiasan baru: muncul memantul + bunyi
      var un = P.unlockEl;
      Tween.run(380, function (e) { un.style.opacity = Math.min(1, e * 2); un.style.transform = 'scale(' + (0.6 + 0.4 * e) + ')'; }, Ease.easeOutBack);
      Aud.sfx('ding'); D.burst(330, 140, 14);
    }
    var cn = coinsEl.querySelector('.cn'), shown = 0;
    while (shown < P.coins) {
      shown = Math.min(P.coins, shown + 5); cn.textContent = '+' + shown; Aud.sfx('tick', 1 + shown / 200);
      await Tween.wait(70); if (P !== my) return;
    }
    Aud.sfx('coin');
    if (focusBtn) focusBtn.focus({ preventScroll: true });
    Aud.music(true, 'calm');
  }
})();
