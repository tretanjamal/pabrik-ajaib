/* Acuan skala tunggal Pabrik Ajaib. Semua ukuran gambar di layar diturunkan dari sini (px kanvas logis 1280x720).
   Satuan dasar M = tinggi tampil mesin utama. Bagian mesin dinyatakan sebagai pecahan M agar tetap sebanding
   bila mesin diperbesar/diperkecil (mis. layar judul memakai M lebih besar).
   Ukuran: { h: tinggi } atau { w: lebar }; sisi lain mengikuti rasio gambar di js/data/assets.js (atau cadangan SVG). */
(function (root) {
  var PART = {                     // pecahan M
    machine_main: { h: 1 },
    machine_mini: { h: 0.8 },
    gear_big: { h: 0.4 },          // roda gigi besar di belakang sudut mesin
    gear_small: { h: 0.14 },       // roda gigi kecil di poros depan mesin
    lever_handle: { h: 0.42 },
    lever_base: { h: 0.15 },
    lamp_off: { w: 0.18 },         // menutup bohlam bawaan gambar mesin (kaca lampu ~ 1,15x bohlam)
    valve_wheel: { h: 0.2 }
  };
  var FIXED = {                    // px logis, tidak ikut M
    gigo: { h: 190 },              // Gigo di layar bermain (kiri bawah)
    gigo_title: { h: 250 },
    hand_pointer: { h: 104 },
    crate_in: { w: 84 },           // peti kosong di ban masuk
    crate_out: { w: 150 },         // peti hasil paling besar; mengecil bila banyak peti
    product: { h: 44 },            // produk paling besar di dalam peti (peti 132 px); mengecil bila banyak isi
    cust: { h: 260 }
  };
  var LAYOUT = {
    play: { M: 360, mx: 560, top: 118, floor: 480 },     // mesin: tinggi, pusat x, puncak y; garis lantai
    title: { M: 400, mx: 960, top: 196, floor: 640 }
  };
  root.SKALA = {
    PART: PART, FIXED: FIXED, LAYOUT: LAYOUT,
    /* ukuran tampil {w,h} untuk kunci aset. ratio = w/h gambar. M = tinggi mesin pada adegan ini. */
    box: function (key, ratio, M, kind) {
      var s = PART[kind || key], px;
      if (s) px = { h: s.h != null ? s.h * M : null, w: s.w != null ? s.w * M : null };
      else { s = FIXED[kind || key] || { h: 64 }; px = { h: s.h != null ? s.h : null, w: s.w != null ? s.w : null }; }
      if (px.h != null) return { w: px.h * ratio, h: px.h };
      return { w: px.w, h: px.w / ratio };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
