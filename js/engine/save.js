/* Save: progres di localStorage (try/catch); tetap jalan bila penyimpanan diblokir. Tanpa data pribadi. */
(function (root) {
  var KEY = 'pabrikajaib577.v1';
  var memory = null;
  function fresh() {
    return {
      settings: { santai: false, reduce: false, mute: false, voice: true },
      onboarded: false, coins: 0, practice: 0,
      tier: 0,      // tingkat adaptif terakhir, dibawa ke level berikutnya
      facts: {},    // '3x4' -> {seen, ok, first, wrong}  (penguasaan per fakta)
      skills: {},   // rule|output|input -> {tries, ok, first}
      levels: {}    // 1 -> {stars, best}
    };
  }
  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  /* simpanan lama atau rusak: kunci yang hilang diisi, entri salah bentuk dibuang (gim tidak boleh macet karena data) */
  function clean(d) {
    var f = fresh(), k;
    if (!isObj(d)) return f;
    if (!isObj(d.settings)) d.settings = f.settings;
    for (k in f.settings) if (typeof d.settings[k] !== 'boolean') d.settings[k] = f.settings[k];
    ['coins', 'practice', 'tier'].forEach(function (n) { if (typeof d[n] !== 'number' || !isFinite(d[n])) d[n] = f[n]; });
    if (typeof d.onboarded !== 'boolean') d.onboarded = f.onboarded;
    ['facts', 'skills'].forEach(function (n) {
      if (!isObj(d[n])) d[n] = {};
      Object.keys(d[n]).forEach(function (e) { var v = d[n][e]; if (!isObj(v) || ['seen', 'ok', 'first', 'wrong'].some(function (x) { return typeof v[x] !== 'number'; })) delete d[n][e]; });
    });
    if (!isObj(d.levels)) d.levels = {};
    Object.keys(d.levels).forEach(function (e) { var v = d.levels[e]; if (!isObj(v) || typeof v.stars !== 'number') delete d.levels[e]; });
    return d;
  }
  function slot(map, k) { return map[k] || (map[k] = { seen: 0, ok: 0, first: 0, wrong: 0 }); }
  var Save = {
    data: fresh(),
    MASTER_AT: 2,   // fakta dianggap dikuasai setelah 2 kali benar langsung
    load: function () {
      try {
        var raw = root.localStorage.getItem(KEY);
        if (raw) {
          Save.data = clean(JSON.parse(raw));
        }
      } catch (e) { Save.data = memory || fresh(); }
    },
    save: function () {
      memory = Save.data;
      try { root.localStorage.setItem(KEY, JSON.stringify(Save.data)); } catch (e) { /* diblokir: abaikan */ }
    },
    /* satu soal selesai: fakta + keterampilan, benar langsung (tanpa salah)? */
    /* facts: satu fakta ('3x4') atau daftar fakta yang dipakai soal (L3/L4 bisa lebih dari satu) */
    record: function (facts, skill, firstTry) {
      var s = slot(Save.data.skills, skill);
      s.seen++; s.ok++; if (firstTry) s.first++;
      [].concat(facts).forEach(function (k) { var f = slot(Save.data.facts, k); f.seen++; f.ok++; if (firstTry) f.first++; });
    },
    recordWrong: function (facts, skill) {
      slot(Save.data.skills, skill).wrong++;
      // salah lagi mengurangi penguasaan: fakta hijau bisa kembali perlu latihan
      [].concat(facts).forEach(function (k) { var f = slot(Save.data.facts, k); f.wrong++; f.first = Math.max(0, f.first - 1); });
    },
    mastered: function (fact) { var f = Save.data.facts[fact]; return !!f && f.first >= Save.MASTER_AT; },
    /* fakta yang pernah salah dan belum dikuasai: dimunculkan lagi oleh generator */
    weakFacts: function () {
      return Object.keys(Save.data.facts).filter(function (k) { var f = Save.data.facts[k]; return f.wrong > 0 && !Save.mastered(k); });
    },
    /* mesin n terbuka bila mesin sebelumnya selesai; patokannya mesin tertinggi yang selesai agar simpanan lama tidak kehilangan mesin */
    unlocked: function (n) {
      for (var i = n - 1; i <= 5; i++) { var l = Save.data.levels[i]; if (l && l.stars) return true; }
      return n <= 1;
    },
    reset: function () { Save.data = fresh(); Save.save(); },
    /* Murid baru di perangkat yang sama: progres dihapus, pengaturan tetap */
    newStudent: function () { var s = Save.data.settings; Save.data = fresh(); Save.data.settings = s; Save.save(); }
  };
  root.Save = Save;
})(typeof window !== 'undefined' ? window : globalThis);
