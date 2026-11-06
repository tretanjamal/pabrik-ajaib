/* Audio: SFX sintesis WebAudio, musik latar mp3, ducking, dan Voice (speechSynthesis id-ID + sorot kata).
   Kerangka (bus, mute, ducking, jeda saat tab tersembunyi, Voice yang selalu selesai) dari gim 221; bunyi diganti suasana pabrik. */
(function (root) {
  var A = {
    ctx: null, master: null, sfxBus: null, duckGain: null,
    muted: false, hidden: false, musicOn: false, mood: 'play', streak: 0,

    init: function () {
      if (A.ctx) { if (A.ctx.state === 'suspended' && !A.hidden) A.ctx.resume(); A._playCur(); return; }
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return;
      try {
        var c = A.ctx = new AC();
        var comp = c.createDynamicsCompressor();
        A.master = c.createGain(); A.sfxBus = c.createGain(); A.duckGain = c.createGain();
        A.sfxBus.gain.value = 0.9;
        A.sfxBus.connect(A.master);
        A.duckGain.connect(A.master);
        A.master.connect(comp); comp.connect(c.destination);
        A.applyMute();
        if (A._wantMusic) A.music(true, A._wantMusic);
      } catch (e) { A.ctx = null; }
    },
    applyMute: function () {
      if (!A.master) return;
      A.master.gain.setTargetAtTime(A.muted || A.hidden ? 0 : 1, A.ctx.currentTime, 0.02);
    },
    setMuted: function (m) { A.muted = m; A.applyMute(); A._fadeTick(); if (m && root.Voice) root.Voice.stop(); },
    setHidden: function (hid) {
      A.hidden = hid; A.applyMute();
      if (!A.ctx) return;
      if (hid) { A.ctx.suspend(); if (A._cur) A._cur.pause(); } else { A.ctx.resume(); A._playCur(); }
    },
    duck: function (on) {
      A._ducked = on; A._fadeTick();
      if (!A.duckGain) return;
      A.duckGain.gain.setTargetAtTime(on ? 0.25 : 1, A.ctx.currentTime, 0.08);
    },

    tone: function (f, t0, dur, type, vol, bus, f2) {
      var c = A.ctx; if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(bus || A.sfxBus);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
    noise: function (t0, dur, vol, freq, bus, type) {
      var c = A.ctx; if (!c) return;
      var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = type || 'lowpass'; f.frequency.value = freq || 1500;
      g.gain.value = vol || 0.2;
      s.connect(f); f.connect(g); g.connect(bus || A.sfxBus); s.start(t0);
    },
    rnd: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    /* denting logam (bel selesai): parsial tak-harmonik dengan peluruhan berbeda */
    metal: function (f, t0, dur, vol) {
      [[1, 1, 1], [2.76, 0.5, 0.6], [5.4, 0.28, 0.35], [8.93, 0.14, 0.2]].forEach(function (p) {
        A.tone(f * p[0], t0, dur * p[2], 'sine', vol * p[1]);
      });
    },
    /* dengung motor + tik roda gigi selama mesin jalan (detik) */
    motor: function (dur) {
      var c = A.ctx; if (!c || A.muted || A.hidden) return;
      var t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(92, t + 0.4); o.frequency.setValueAtTime(92, t + dur - 0.3); o.frequency.linearRampToValueAtTime(50, t + dur);
      f.type = 'lowpass'; f.frequency.value = 420;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.15); g.gain.setValueAtTime(0.09, t + dur - 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(A.sfxBus); o.start(t); o.stop(t + dur + 0.05);
      for (var k = 0; k < dur / 0.12; k++) A.tone(k % 3 ? 2200 : 1700, t + 0.1 + k * 0.12 + Math.random() * 0.01, 0.015, 'square', k % 3 ? 0.012 : 0.02);
      A.noise(t + 0.2, 0.06, 0.12, 300); A.noise(t + dur * 0.5, 0.06, 0.1, 300);   // derak
    },
    sfx: function (name, arg) {
      var c = A.ctx; if (!c || A.muted || A.hidden) return;
      var t = c.currentTime;
      switch (name) {
        case 'click': A.tone(620, t, 0.06, 'triangle', 0.18, null, 400); A.noise(t, 0.015, 0.06, 4000); break;
        case 'pick': A.tone(520, t, 0.08, 'sine', 0.14, null, 780); break;                                      // kartu terangkat
        case 'card': A.noise(t, 0.12, 0.12, 2600); A.tone(180, t + 0.1, 0.08, 'square', 0.08, null, 120); A.tone(1200, t + 0.12, 0.05, 'triangle', 0.08); break;   // kartu masuk slot: srek + klak
        case 'lever': A.noise(t, 0.05, 0.25, 700); A.tone(140, t, 0.12, 'square', 0.1, null, 70);
          for (var r = 0; r < 4; r++) A.tone(1500, t + 0.05 + r * 0.04, 0.01, 'square', 0.05); break;         // klak + ratchet
        case 'run': A.motor(arg || 1.6); break;
        case 'steam': A.noise(t, 0.6, 0.09, 3000, null, 'highpass'); break;
        case 'door': A.tone(300, t, 0.12, 'triangle', 0.06, null, 420); A.noise(t, 0.08, 0.05, 1200); break;
        case 'ding': A.metal(1318, t, 1.1, 0.13); A.metal(1760, t + 0.16, 1.3, 0.12); break;                    // bel selesai
        case 'good': {
          var up = Math.pow(2, Math.min(5, A.streak) / 12);   // nada naik tiap jawaban benar beruntun
          A.streak++;
          [523, 659, 784, 1047].forEach(function (f, n) { A.tone(f * up, t + n * 0.07, 0.18, 'triangle', 0.2); });
          break;
        }
        case 'bad':   // mesin "batuk" lembut: dua embusan uap + nada turun pelan (bukan bunyi keras)
          A.streak = 0; A.noise(t, 0.14, 0.1, 900); A.noise(t + 0.2, 0.18, 0.08, 700); A.tone(262, t + 0.05, 0.3, 'sine', 0.1, null, 196); break;
        case 'tick': A.tone(1568 * (arg || 1), t, 0.04, 'triangle', 0.08); break;   // hitung naik
        case 'pop': A.tone(480 + Math.random() * 120, t, 0.07, 'sine', 0.12, null, 900); break;
        case 'coin': A.tone(1318, t, 0.06, 'square', 0.06); A.tone(1760, t + 0.05, 0.12, 'square', 0.06); break;
        case 'whoosh': A.noise(t, 0.3, 0.1, 1100); break;
        case 'star': A.tone([523, 659, 784, 1047, 1319, 1568][Math.min(5, arg || 0)], t, 0.4, 'triangle', 0.22); A.tone([1047, 1319, 1568][Math.min(2, arg || 0)], t + 0.02, 0.5, 'sine', 0.07); break;
        case 'empty': A.tone(330, t, 0.16, 'sine', 0.08, null, 280); break;
        case 'fanfare': {
          var seq = [[392, 523], [392, 523, 659], [392, 523, 659, 784], [392, 523, 659, 784, 1047, 1319]][Math.max(0, Math.min(3, arg || 0))];
          seq.forEach(function (f, n) { A.tone(f, t + n * 0.11, 0.3, 'triangle', 0.2); A.tone(f / 2, t + n * 0.11, 0.3, 'sine', 0.1); });
          break;
        }
        case 'boot': [196, 262, 330, 392].forEach(function (f, n) { A.tone(f, t + n * 0.09, 0.14, 'square', 0.05); }); A.noise(t, 0.25, 0.08, 500); break;   // pabrik menyala
      }
    },

    /* musik latar: berkas mp3 lewat elemen <audio> (tetap jalan di file://, tanpa fetch). calm = judul, Pilih Mesin, hasil; play = bermain.
       Volume diatur langsung: ducking saat narasi, senyap, dan pudar saat berganti trek. */
    TRACKS: { calm: 'assets/audio/bgm_title.mp3', play: 'assets/audio/bgm_gameplay.mp3' },
    MUSIC_VOL: 0.3, _els: {}, _ducked: false,
    _track: function (mood) {
      var el = A._els[mood];
      if (!el) { el = A._els[mood] = new Audio(A.TRACKS[mood]); el.loop = true; el.preload = 'auto'; el.volume = 0; }
      return el;
    },
    music: function (on, mood) {
      mood = mood || 'play';
      if (!A.ctx) { A._wantMusic = on ? mood : null; return; }
      if (on && A.musicOn && mood === A.mood) { A._playCur(); return; }
      var next = on ? A._track(mood) : null;
      if (next && mood !== A.mood) { try { next.currentTime = 0; } catch (e) { } }
      A.musicOn = on; A.mood = mood; A._cur = next;
      A.ambience(on);
      A._playCur(); A._fadeTick();
    },
    _playCur: function () {
      var el = A._cur;
      if (!el || A.hidden || !el.paused) return;
      var p = el.play();
      if (p && p.catch) p.catch(function () { /* belum ada gerakan pengguna: dicoba lagi saat ketukan berikutnya */ });
    },
    /* volume tiap trek mengejar targetnya tiap 40 ms; trek yang tidak dipakai berhenti setelah senyap */
    _fadeTick: function () {
      if (A._fadeT) return;
      A._fadeT = setInterval(function () {
        var busy = false, target = A.muted || A.hidden ? 0 : A.MUSIC_VOL * (A._ducked ? 0.25 : 1);
        Object.keys(A._els).forEach(function (k) {
          var el = A._els[k], t = el === A._cur ? target : 0, d = t - el.volume;
          if (Math.abs(d) > 0.012) { el.volume = Math.max(0, Math.min(1, el.volume + (d > 0 ? 0.012 : -0.012))); busy = true; }
          else { el.volume = t; if (el !== A._cur && !el.paused) el.pause(); }
        });
        if (!busy) { clearInterval(A._fadeT); A._fadeT = 0; }
      }, 40);
    },
    /* dengung pabrik sangat pelan + desis uap acak; lewat duckGain sehingga turun saat Gigo bicara */
    ambience: function (on) {
      var c = A.ctx; if (!c) return;
      clearTimeout(A._hissT);
      if (!on) {
        if (A._amb) { var g0 = A._amb.g, s0 = A._amb.s; g0.gain.setTargetAtTime(0, c.currentTime, 0.3); setTimeout(function () { try { s0.stop(); } catch (e) { } }, 1500); A._amb = null; }
        return;
      }
      if (A._amb) return;
      var n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * 0.08) / 1.02; d[i] = last * 3; }
      for (i = 0; i < 2000; i++) d[n - 1 - i] = d[n - 1 - i] * (i / 2000) + d[2000 - 1 - i] * (1 - i / 2000);
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 260;
      g.gain.value = 0.0001; g.gain.setTargetAtTime(0.02, c.currentTime, 1.2);
      s.connect(f); f.connect(g); g.connect(A.duckGain); s.start();
      A._amb = { s: s, g: g };
      var hiss = function () {
        A._hissT = setTimeout(hiss, 5000 + Math.random() * 7000);
        if (!A.ctx || A.hidden || A.muted || !A._amb) return;
        A.noise(A.ctx.currentTime + 0.02, 0.5, 0.025, 2500, A.duckGain, 'highpass');
      };
      A._hissT = setTimeout(hiss, 3000);
    }
  };

  /* Voice: speechSynthesis id-ID + sorot kata. Selalu selesai (tidak ada softlock); tanpa suara id-ID cukup subtitle. */
  var V = {
    token: 0,
    voice: function (lang) {
      var ss = root.speechSynthesis; if (!ss) return null;
      var vs = ss.getVoices() || [], pre = lang.slice(0, 2), best = null;
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang === lang || vs[i].lang.replace('_', '-') === lang) return vs[i];
        if (!best && vs[i].lang.slice(0, 2) === pre) best = vs[i];
      }
      return best;
    },
    available: function () { return !!root.speechSynthesis && !U.TEST; },
    /* teks untuk dibacakan: tanda operasi jadi kata. ":" hanya dibaca "bagi" bila di depan bilangan/"?" dan
       didahului spasi/angka (42 : 6, :6); titik dua tanda baca ("Lihat: 3") tetap jeda. */
    spoken: function (text) {
      return text.replace(/×/g, ' kali ').replace(/(^|[\s\d]):(?=\s*[\d?])/g, '$1 bagi ')
        .replace(/=/g, ' sama dengan ').replace(/−/g, ' kurang ').replace(/\+(?=\d)/g, ' tambah ');
    },
    stop: function () {
      V.token++;
      try { if (root.speechSynthesis) root.speechSynthesis.cancel(); } catch (e) { }
      A.duck(false);
    },
    /* opts: rate, lang, onWord(i) (i = indeks kata yang sedang dibaca, words.length = selesai) */
    say: function (text, opts) {
      opts = opts || {};
      V.stop();
      var my = V.token, words = text.split(/\s+/), rate = opts.rate || 1, lang = opts.lang || 'id-ID';
      var perWord = U.TEST ? 0.02 : 0.36 / rate, total = words.length * perWord + 0.3;
      var finished = false, sawBoundary = false;
      A.duck(true);
      function mark(i) { if (my === V.token && opts.onWord) opts.onWord(i); }
      return new Promise(function (resolve) {
        function finish() {
          if (finished) return; finished = true;
          if (my === V.token) { mark(words.length); A.duck(false); }
          resolve();
        }
        var acc = 0;
        for (var i = 0; i < words.length; i++) (function (idx) {
          Tween.wait(acc * 1000 / Tween.speed).then(function () { if (!sawBoundary && !finished) mark(idx); });
          acc += perWord;
        })(i);
        Tween.wait((total + 0.9) * 1000 / Tween.speed).then(finish);
        var vc = V.available() ? V.voice(lang) : null;
        var voiceOn = !(root.Save && Save.data.settings.voice === false);   // "Suara Gigo" mati: subtitle saja
        if (vc && !A.muted && voiceOn) {
          try {
            var u = new SpeechSynthesisUtterance(V.spoken(text));
            u.lang = lang; u.rate = rate; u.pitch = 1.15; u.voice = vc;
            u.onboundary = function (e) {
              if (e.name && e.name !== 'word') return;
              sawBoundary = true;
              var idx = text.slice(0, e.charIndex).split(/\s+/).length - 1;
              mark(Math.max(0, Math.min(words.length - 1, idx)));
            };
            u.onend = finish;
            u.onerror = function () { /* pewaktu akan menyelesaikan */ };
            root.speechSynthesis.speak(u);
          } catch (e) { /* abaikan, subtitle tetap jalan */ }
        }
      });
    }
  };
  root.Aud = A;
  root.Voice = V;
})(typeof window !== 'undefined' ? window : globalThis);
