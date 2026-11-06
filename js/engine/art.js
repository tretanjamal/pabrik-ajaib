/* Art: satu sistem grafik SVG (palet docs/GDD.md). Menyediakan CADANGAN untuk setiap kunci aset bila berkas WebP
   tidak ada atau gagal dimuat. Proporsi dan titik poros cadangan disamakan dengan gambar asli (js/data/assets.js),
   sehingga tata letak tidak berubah. Dipakai hanya lewat Assets (js/engine/loader.js). */
(function (root) {
  var C = {
    ink: '#2E2350', wall: '#4A4FA8', lav: '#8C93E8', mint: '#2BB5A5', brass: '#FFC23D', coral: '#FF6B4A', cream: '#FFF6E0', green: '#7CD957',
    wallD: '#43418A', mintD: '#2A8F88', brassD: '#C9993F', coralD: '#C9574A', lavD: '#7476C0', mintL: '#7DD3C9', brassL: '#FFD98B', lavL: '#BCC1F1', creamD: '#E6D9C2'
  };
  var S = ' stroke="' + C.ink + '" stroke-linejoin="round" stroke-linecap="round" ';
  function rivet(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 6) + '" fill="' + C.brass + '"' + S + 'stroke-width="2.5"/>'; }
  function gearPath(r, teeth, depth) {
    var p = [], n = teeth * 4, ri = r - depth;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, k = i % 4, rr = (k === 1 || k === 2) ? r : ri;
      p.push((Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr).toFixed(1));
    }
    return 'M' + p.join('L') + 'Z';
  }
  function gear(r, teeth, fill, holes) {
    var s = '<g transform="translate(' + (r + 6) + ' ' + (r + 6) + ')"><path d="' + gearPath(r, teeth, r * 0.2) + '" fill="' + fill + '"' + S + 'stroke-width="' + r * 0.06 + '"/>';
    s += '<circle r="' + r * 0.6 + '" fill="none" stroke="' + C.cream + '" stroke-width="' + r * 0.1 + '"/>';
    for (var i = 0; i < holes; i++) { var a = i / holes * Math.PI * 2; s += '<circle cx="' + (Math.cos(a) * r * 0.4).toFixed(1) + '" cy="' + (Math.sin(a) * r * 0.4).toFixed(1) + '" r="' + r * 0.1 + '" fill="' + C.ink + '"/>'; }
    return s + '<circle r="' + r * 0.18 + '" fill="' + C.brass + '"' + S + 'stroke-width="' + r * 0.04 + '"/><circle r="' + r * 0.08 + '" fill="' + C.ink + '"/></g>';
  }

  /* gigo: ekspresi happy|think|cheer, kanvas 345x480 (sama dengan gambar) */
  function gigo(mood) {
    var s = '<g transform="translate(172 0)">';
    s += '<circle cx="0" cy="430" r="44" fill="' + C.ink + '"/><circle cx="0" cy="430" r="18" fill="' + C.brass + '"' + S + 'stroke-width="5"/>';
    var arms = mood === 'cheer' ? ['M-92 250q-50-40-40-110', 'M92 250q50-40 40-110'] : mood === 'think' ? ['M-92 260q-30 20-40 60', 'M70 250q40 0 -10-70'] : ['M-92 250q-50-40-40-110', 'M92 260q30 30 40 70'];
    arms.forEach(function (d) { s += '<path d="' + d + '" stroke="' + C.ink + '" stroke-width="34" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + C.lav + '" stroke-width="20" fill="none" stroke-linecap="round"/>'; });
    var hands = mood === 'cheer' ? [[-132, 140], [132, 140]] : mood === 'think' ? [[-132, 320], [-10, 180]] : [[-132, 140], [132, 330]];
    hands.forEach(function (h) { s += '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="26" fill="' + C.brass + '"' + S + 'stroke-width="7"/>'; });
    s += '<ellipse cx="0" cy="300" rx="112" ry="100" fill="' + C.mint + '"' + S + 'stroke-width="8"/>';
    s += '<ellipse cx="0" cy="306" rx="62" ry="54" fill="' + C.cream + '"' + S + 'stroke-width="5"/>' + rivet(-36, 280) + rivet(36, 280) + rivet(-40, 330) + rivet(40, 330);
    s += '<path d="M0 70V30" stroke="' + C.ink + '" stroke-width="12"/><circle cx="0" cy="26" r="20" fill="' + C.coral + '"' + S + 'stroke-width="6"/>';
    s += '<ellipse cx="0" cy="170" rx="126" ry="110" fill="' + C.mint + '"' + S + 'stroke-width="8"/>';
    s += '<rect x="-80" y="136" width="160" height="96" rx="40" fill="' + C.cream + '"' + S + 'stroke-width="6"/><rect x="-68" y="146" width="136" height="76" rx="32" fill="' + C.ink + '"/>';
    if (mood === 'cheer') s += '<path d="M-44 184q14-20 28 0M16 184q14-20 28 0" stroke="' + C.brass + '" stroke-width="8" fill="none" stroke-linecap="round"/>';
    else s += '<circle cx="-30" cy="178" r="16" fill="' + C.brass + '"/><circle cx="34" cy="174" r="16" fill="' + C.brass + '"/>';
    s += mood === 'think' ? '<circle cx="6" cy="208" r="6" fill="' + C.coral + '"/>' : '<path d="M-14 200q14 16 28 0z" fill="' + C.coral + '"/>';
    return s + '</g>';
  }
  function person(color, mood) {
    var s = '<g transform="translate(121 0)"><circle cx="0" cy="70" r="52" fill="#E9B98F"' + S + 'stroke-width="6"/>';
    s += '<path d="M-60 60q0-60 60-60t60 60v40h-120z" fill="' + color + '"' + S + 'stroke-width="6"/>';
    s += '<rect x="-56" y="124" width="112" height="170" rx="30" fill="' + C.cream + '"' + S + 'stroke-width="6"/>';
    s += '<rect x="-64" y="250" width="128" height="160" rx="18" fill="' + C.wall + '"' + S + 'stroke-width="6"/>';
    s += '<circle cx="-18" cy="72" r="6" fill="' + C.ink + '"/><circle cx="18" cy="72" r="6" fill="' + C.ink + '"/>';
    s += mood === 'happy' ? '<path d="M-16 94q16 16 32 0" stroke="' + C.ink + '" stroke-width="5" fill="none"/>' : '<path d="M-10 96h20" stroke="' + C.ink + '" stroke-width="5"/>';
    return s + '</g>';
  }
  function product(kind) {   // 168x168
    var b = '<g transform="translate(84 84)">', st = S + 'stroke-width="9"';
    if (kind === 'prod_ball') b += '<circle r="72" fill="' + C.coral + '"' + st + '/><path d="M-72 0q72 46 144 0" stroke="' + C.cream + '" stroke-width="28" fill="none"/><circle r="72" fill="none"' + st + '/>';
    else if (kind === 'prod_bread') b += '<ellipse rx="78" ry="56" fill="' + C.brass + '"' + st + '/><path d="M-36 -10l14 22M0 -16l14 22M36 -10l14 22" stroke="' + C.brassD + '" stroke-width="8"/>';
    else if (kind === 'prod_duck') b += '<path d="M-74 0q0 62 70 62h30q44 0 44-56q-40 0-50-6z" fill="' + C.brass + '"' + st + '/><circle cx="16" cy="-26" r="36" fill="' + C.brass + '"' + st + '/><path d="M48 -30l30 6-28 14z" fill="' + C.coral + '"' + st + '/><circle cx="26" cy="-34" r="7" fill="' + C.ink + '"/>';
    else if (kind === 'prod_cupcake') b += '<path d="M-56 0h112l-18 70h-76z" fill="' + C.mint + '"' + st + '/><path d="M-66 0q0-50 36-54q32-40 64 0q36 4 32 54z" fill="' + C.cream + '"' + st + '/><circle cx="0" cy="-66" r="14" fill="' + C.coral + '"' + st + '/>';
    else if (kind === 'prod_toybot') b += '<rect x="-46" y="-12" width="92" height="76" rx="12" fill="' + C.lav + '"' + st + '/><rect x="-40" y="-76" width="80" height="60" rx="12" fill="' + C.lav + '"' + st + '/><circle cx="-16" cy="-46" r="10" fill="' + C.brass + '"/><circle cx="16" cy="-46" r="10" fill="' + C.brass + '"/>';
    else b += '<path d="M-76 30v-30q0-14 14-16l20-34h70l26 34q22 2 22 16v30z" fill="' + C.mint + '"' + st + '/><path d="M-30 -14l12-22h40l14 22z" fill="' + C.cream + '"/><circle cx="-40" cy="34" r="22" fill="' + C.ink + '"/><circle cx="44" cy="34" r="22" fill="' + C.ink + '"/>';
    return b + '</g>';
  }

  /* kunci -> [lebar, tinggi, isi SVG, meta] (meta = titik poros bila gambar asli tidak ada) */
  var F = {
    machine_main: function () {
      var s = '<rect x="150" y="40" width="70" height="40" rx="8" fill="' + C.brass + '"' + S + 'stroke-width="6"/><rect x="245" y="40" width="70" height="40" rx="8" fill="' + C.brass + '"' + S + 'stroke-width="6"/>';
      s += '<rect x="420" y="20" width="70" height="70" rx="10" fill="' + C.lav + '"' + S + 'stroke-width="6"/><rect x="404" y="4" width="102" height="30" rx="12" fill="' + C.coral + '"' + S + 'stroke-width="6"/>';
      s += '<rect x="20" y="380" width="120" height="140" rx="20" fill="' + C.brass + '"' + S + 'stroke-width="7"/><rect x="580" y="380" width="110" height="120" rx="20" fill="' + C.coral + '"' + S + 'stroke-width="7"/>';
      s += '<rect x="120" y="650" width="70" height="60" rx="10" fill="' + C.brass + '"' + S + 'stroke-width="6"/><rect x="510" y="650" width="70" height="60" rx="10" fill="' + C.brass + '"' + S + 'stroke-width="6"/>';
      s += '<rect x="70" y="100" width="560" height="560" rx="60" fill="' + C.mint + '"' + S + 'stroke-width="8"/><path d="M110 140h260" stroke="#fff" stroke-opacity=".35" stroke-width="18" stroke-linecap="round"/>';
      s += '<rect x="196" y="178" width="292" height="160" rx="22" fill="' + C.brass + '"' + S + 'stroke-width="7"/><rect x="217" y="199" width="267" height="137" rx="14" fill="' + C.ink + '"/>';
      s += '<rect x="190" y="380" width="300" height="50" rx="20" fill="' + C.brass + '"' + S + 'stroke-width="6"/><rect x="207" y="394" width="282" height="22" rx="8" fill="' + C.ink + '"/>';
      s += '<rect x="244" y="451" width="207" height="161" rx="20" fill="' + C.brass + '"' + S + 'stroke-width="6"/><rect x="262" y="468" width="172" height="128" rx="12" fill="' + C.mintD + '"/>';
      s += rivet(164, 202, 22) + rivet(535, 202, 22) + rivet(544, 307, 18) + rivet(104, 130) + rivet(596, 130) + rivet(104, 630) + rivet(596, 630);
      return [703, 720, s];
    },
    machine_mini: function () {
      var s = '<rect x="200" y="10" width="110" height="80" rx="14" fill="' + C.coral + '"' + S + 'stroke-width="6"/>';
      s += '<rect x="10" y="260" width="70" height="90" rx="16" fill="' + C.mint + '"' + S + 'stroke-width="6"/><rect x="420" y="280" width="78" height="70" rx="14" fill="' + C.mint + '"' + S + 'stroke-width="6"/>';
      s += '<rect x="80" y="70" width="340" height="400" rx="50" fill="' + C.lav + '"' + S + 'stroke-width="8"/>';
      s += '<rect x="130" y="150" width="230" height="140" rx="18" fill="' + C.brass + '"' + S + 'stroke-width="6"/><rect x="141" y="165" width="200" height="121" rx="12" fill="' + C.ink + '"/>';
      s += '<rect x="160" y="335" width="160" height="28" rx="12" fill="' + C.cream + '"' + S + 'stroke-width="5"/><rect x="172" y="345" width="136" height="12" rx="6" fill="' + C.ink + '"/>' + rivet(357, 121, 22);
      s += '<rect x="130" y="470" width="50" height="40" rx="8" fill="' + C.brass + '"' + S + 'stroke-width="5"/><rect x="320" y="470" width="50" height="40" rx="8" fill="' + C.brass + '"' + S + 'stroke-width="5"/>';
      return [498, 520, s];
    },
    gear_big: function () { return [360, 357, '<g transform="scale(.98)">' + gear(170, 12, C.brass, 4) + '</g>']; },
    gear_small: function () { return [240, 239, '<g transform="scale(.98)">' + gear(110, 8, C.mint, 3) + '</g>']; },
    valve_wheel: function () {
      return [160, 160, '<g transform="translate(80 80)"><circle r="68" fill="none" stroke="' + C.ink + '" stroke-width="22"/><circle r="68" fill="none" stroke="' + C.coral + '" stroke-width="12"/><path d="M-66 0H66M0 -66V66" stroke="' + C.ink + '" stroke-width="18"/><path d="M-62 0H62M0 -62V62" stroke="' + C.coral + '" stroke-width="9"/><circle r="18" fill="' + C.brass + '"' + S + 'stroke-width="5"/></g>'];
    },
    lever_base: function () { return [199, 200, '<circle cx="99" cy="100" r="88" fill="' + C.brass + '"' + S + 'stroke-width="8"/><circle cx="99" cy="100" r="30" fill="' + C.wall + '"' + S + 'stroke-width="6"/>' + rivet(99, 30) + rivet(99, 170) + rivet(30, 100) + rivet(168, 100)]; },
    lever_handle: function () { return [83, 300, '<rect x="33" y="60" width="16" height="210" rx="8" fill="' + C.brass + '"' + S + 'stroke-width="5"/><circle cx="41" cy="42" r="34" fill="' + C.coral + '"' + S + 'stroke-width="6"/><circle cx="40" cy="279" r="20" fill="' + C.brass + '"' + S + 'stroke-width="5"/><circle cx="40" cy="279" r="8" fill="' + C.ink + '"/>']; },
    lamp_off: function () { return [146, 166, '<rect x="14" y="120" width="118" height="38" rx="14" fill="' + C.brass + '"' + S + 'stroke-width="6"/><path d="M30 120v-50a43 43 0 0 1 86 0v50z" fill="' + C.lavL + '"' + S + 'stroke-width="6"/><path d="M73 28v92M30 84h86" stroke="' + C.brass + '" stroke-width="6"/>']; },
    machine_door: function () { return [260, 258, '<rect x="10" y="10" width="240" height="238" rx="26" fill="' + C.brass + '"' + S + 'stroke-width="7"/><rect x="34" y="34" width="192" height="190" rx="16" fill="' + C.mint + '"' + S + 'stroke-width="5"/><circle cx="130" cy="129" r="56" fill="' + C.lavL + '" stroke="' + C.brass + '" stroke-width="12"/><circle cx="130" cy="129" r="62" fill="none"' + S + 'stroke-width="5"/>']; },
    crate: function () {
      return [306, 181, '<path d="M30 20h246l20 50H10z" fill="' + C.wall + '"' + S + 'stroke-width="6"/><rect x="8" y="67" width="290" height="106" rx="10" fill="' + C.cream + '"' + S + 'stroke-width="6"/><path d="M14 102h278M14 138h278" stroke="' + C.ink + '" stroke-width="4"/>' + rivet(32, 84, 9) + rivet(274, 84, 9) + rivet(32, 156, 9) + rivet(274, 156, 9)];
    },
    hand_pointer: function () {
      return [190, 206, '<path d="M12 10q18-8 30 10l60 70q20-16 40 0q24-6 34 14q26 4 6 50l-30 50q-14 14-40 0l-70-60q-14-14 0-26l20-10l-56-76q-8-14 6-22z" fill="' + C.cream + '"' + S + 'stroke-width="8"/><path d="M80 170l50 30" stroke="' + C.brass + '" stroke-width="22" stroke-linecap="round"/>'];
    },
    bg_factory: function () {
      var s = '<rect width="1600" height="900" fill="' + C.wall + '"/>';
      for (var x = 0; x < 1600; x += 200) for (var y = 80; y < 700; y += 190) s += '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="184" height="174" rx="12" fill="' + C.wallD + '" opacity=".55"/>';
      s += '<rect y="28" width="1600" height="34" fill="' + C.brass + '"' + S + 'stroke-width="5"/>';
      [70, 1360].forEach(function (wx) { s += '<path d="M' + wx + ' 380V200a85 85 0 0 1 170 0v180z" fill="' + C.lav + '"' + S + 'stroke-width="6"/><path d="M' + (wx + 85) + ' 115V380M' + wx + ' 260h170" stroke="' + C.brass + '" stroke-width="10"/>'; });
      return [1600, 900, s + '<rect y="700" width="1600" height="200" fill="#3B3A7D"/><rect y="694" width="1600" height="12" fill="' + C.brass + '"/>'];
    },
    bg_title: function () {
      var s = '<rect width="1600" height="900" fill="' + C.lavL + '"/><rect y="0" width="1600" height="60" fill="' + C.brass + '"/>';
      s += '<circle cx="1100" cy="260" r="150" fill="' + C.cream + '" stroke="' + C.brass + '" stroke-width="22"/>';
      for (var i = 0; i < 6; i++) s += '<rect x="' + (120 + i * 240) + '" y="520" width="150" height="220" rx="16" fill="' + C.lav + '" opacity=".5"/>';
      return [1600, 900, s + '<rect y="740" width="1600" height="160" fill="' + C.wall + '"/><rect y="730" width="1600" height="14" fill="' + C.brass + '"/>'];
    }
  };
  ['prod_ball', 'prod_bread', 'prod_duck', 'prod_cupcake', 'prod_toybot', 'prod_car'].forEach(function (k) { F[k] = function () { return [168, 168, product(k)]; }; });
  ['happy', 'think', 'cheer'].forEach(function (m) { F['gigo_' + m] = function () { return [345, 480, gigo(m)]; }; });
  [['idle', 'idle'], ['happy', 'happy'], ['think', 'idle']].forEach(function (m) {
    F['cust_a_' + m[0]] = function () { return [242, 440, person(C.mint, m[1])]; };
    F['cust_b_' + m[0]] = function () { return [233, 440, person(C.ink, m[1])]; };
  });

  /* meta cadangan: sama dengan nilai yang diukur pada gambar asli (lihat tools/proses-aset.py) */
  var META = {
    machine_main: { screen: [0.309, 0.276, 0.38, 0.191], slot: [0.294, 0.547, 0.401, 0.031], lamps: [[0.262, 0.08, 0.11], [0.397, 0.08, 0.11]],
      gears: [[0.233, 0.28], [0.761, 0.28]], leverSocket: [0.774, 0.426], door: [0.347, 0.626, 0.294, 0.224], in: [0.063, 0.622], out: [0.934, 0.617], belt: 0.69, chimney: [0.649, 0.028], base: 0.985 },
    machine_mini: { screen: [0.284, 0.317, 0.4, 0.233], slot: [0.346, 0.664, 0.27, 0.025], gears: [[0.718, 0.233]], in: [0.06, 0.583], out: [0.9, 0.614], belt: 0.67, chimney: [0.455, 0.03], base: 0.98 },
    crate: { wall: 0.37, inside: [0.15, 0.08, 0.7, 0.29] },
    gear_big: { pivot: [0.5, 0.5] }, gear_small: { pivot: [0.5, 0.5] }, valve_wheel: { pivot: [0.5, 0.5] }, lever_base: { pivot: [0.5, 0.5] },
    lever_handle: { pivot: [0.488, 0.93] }, lamp_off: { glass: [0.2055, 0.15, 0.555, 0.55] }, hand_pointer: { tip: [0.05, 0.04] },
    gigo_happy: { visor: [0.302, 0.283, 0.464, 0.2], eyes: [[0.36, 0.33, 0.1, 0.07], [0.54, 0.325, 0.1, 0.07]] },
    gigo_think: { visor: [0.302, 0.283, 0.464, 0.2], eyes: [[0.36, 0.33, 0.1, 0.07], [0.54, 0.325, 0.1, 0.07]] },
    gigo_cheer: { visor: [0.302, 0.283, 0.464, 0.2] }
  };

  root.Art = {
    C: C,
    has: function (key) { return !!F[key]; },
    /* {w, h, svg, meta} untuk kunci; svg = dokumen utuh siap jadi data URI */
    fallback: function (key) {
      var r = F[key] && F[key]();
      if (!r) return null;
      return { w: r[0], h: r[1], meta: META[key] || {}, svg: '<svg xmlns="http://www.w3.org/2000/svg" width="' + r[0] + '" height="' + r[1] + '" viewBox="0 0 ' + r[0] + ' ' + r[1] + '">' + r[2] + '</svg>' };
    },
    keys: function () { return Object.keys(F); }
  };
})(window);
