/* Konfigurasi bank soal (dibaca js/engine/soal.js). Rentang lengkap tiap level didokumentasikan di docs/RENTANG.md.
   Tingkat adaptif (tiers) dipakai semua level: 3 benar langsung beruntun naik, 2 salah beruntun turun.
   Jenis soal Level 1 (mesin satu langkah, a peti x b isi = c benda):
   - rule   : a x ? = c   (pilih kartu aturan xb)
   - output : a x b = ?   (tebak jumlah benda c)
   - input  : ? x b = c   (pilih jumlah peti a)
   Level 2 (mesin kebalikan, array titik, c = a x b):
   - div     : c : b = ?   (berapa kelompok)
   - missf   : ? x b = c   (faktor hilang, diselesaikan dengan pembagian)
   - divisor : c : ? = a   (berapa isi tiap kelompok)
   Level 3 (tebak aturan dari 3 pasangan): mul = aturan xn, div = aturan :n
   Level 4 (dua mesin, s -> aturan 1 -> m -> aturan 2 -> e):
   - second : cari aturan mesin 2;  first : cari aturan mesin 1;  start : cari bilangan masuk;  both : pasang kedua aturan */
(function (root) {
  root.SOAL = {
    L1: {
      count: 5,                                    // soal utama
      maxExtra: 3,                                 // soal ulang/serupa di akhir level (yang salah muncul lagi)
      order: ['rule', 'rule', 'output', 'input', 'mix'],
      onboarding: { type: 'rule', a: 3, b: 2, product: 'prod_ball', cards: [2, 3, 4, 5] },
      tiers: [
        { a: [2, 4], b: [2, 5], max: 20 },
        { a: [2, 5], b: [2, 7], max: 30 },
        { a: [2, 10], b: [2, 10], max: 40 }   // faktor 2-10, hasil <= 40 agar semua benda tampil
      ],
      weakChance: 0.3,                             // peluang memakai fakta yang pernah salah (penguasaan per fakta)
      products: ['prod_ball', 'prod_bread', 'prod_duck', 'prod_cupcake', 'prod_toybot', 'prod_car'],
      // nilai kartu per jenis: aturan x2..x10 dan peti 1..10 agar hasil mesin dari kartu salah tetap bisa digambar
      cardRange: { rule: [2, 10], output: [2, 50], input: [1, 10] }
    },
    L2: {
      count: 5, maxExtra: 3,
      order: ['div', 'missf', 'div', 'divisor', 'mix'],
      tiers: [
        { a: [2, 5], b: [2, 5], max: 25 },
        { a: [2, 9], b: [2, 9], max: 60 },
        { a: [2, 10], b: [2, 10], max: 100 }   // fakta perkalian/pembagian faktor 2-10
      ],
      weakChance: 0.35,
      cardRange: [2, 999]                          // pengecoh "operasi sama" (42 : 6 -> 252) bisa 3 angka
    },
    L3: {
      count: 5, maxExtra: 2, pairs: 3,
      order: ['mul', 'div', 'mul', 'div', 'mix'],
      // s = sisi kecil pasangan: aturan xn -> masukan s (2-12), keluaran s x n; aturan :n -> keluaran s, masukan s x n
      tiers: [
        { n: [2, 5], s: [2, 10] },
        { n: [2, 8], s: [2, 12] },
        { n: [2, 10], s: [2, 12] }
      ],
      maxVal: 120
    },
    L4: {
      count: 4, maxExtra: 2,
      order: ['second', 'first', 'start', 'both'],
      tiers: [
        { n: [2, 5], s: [2, 30] },
        { n: [2, 7], s: [2, 50] },
        { n: [2, 9], s: [2, 60] }
      ],
      max: 200,                                    // hasil antara dan hasil akhir maks. 200, selalu bulat
      cardRange: [2, 400],                         // kartu bilangan (jenis start)
      bonusTime: 240                               // detik untuk bonus bintang 3 (tidak berlaku di Mode Santai)
    },
    /* Level 5 Pesanan Pelanggan (soal cerita, TAMBAHAN). c = a x b, c 3 angka (100-999), b 1-2 angka.
       Jenis: op  = pilih aturan mesin dari cerita (pemodelan; mesin yang menghitung)
              num = pilih jawaban; mesin cek menjalankan operasi kebalikannya (? x b = c untuk cerita bagi)
              two = cerita dua langkah: s wadah x n1 isi = m, lalu : n2 (dibagi rata) = e
       Cerita: group (c benda, b tiap wadah -> a wadah), share (c benda dibagi rata ke b -> a), mul (a wadah x b isi -> c) */
    L5: {
      count: 4, maxExtra: 2,
      order: ['op', 'num', 'two', 'num2'],         // num2 = cerita bagi dengan pembagi 2 angka
      tiers: [
        { b: [2, 9], a: [11, 30] },
        { b: [2, 12], a: [11, 50] },
        { b: [2, 25], a: [11, 80] }                // contoh brief: 144 : 12 = 12
      ],
      two: [
        { s: [2, 9], n1: [6, 15], n2: [2, 9] },
        { s: [2, 12], n1: [6, 20], n2: [2, 12] },
        { s: [3, 15], n1: [6, 25], n2: [2, 12] }
      ],
      minBig: 100, max: 999,                       // bilangan yang dibagi selalu 3 angka; hasil antara L5 <= 999
      products: ['prod_ball', 'prod_bread', 'prod_duck', 'prod_cupcake', 'prod_toybot', 'prod_car'],
      cardRange: [2, 999]
    },
    /* Latihan bebas per tabel perkalian: b = tabel pilihan (2-10), a = 2-10. Jenis: mul (a x b = ?), div (c : b = ?), missf (? x b = c) */
    LT: {
      count: 5, maxExtra: 3,
      order: ['mul', 'div', 'missf', 'mix', 'mix'],
      types: ['mul', 'div', 'missf'],
      tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      a: [2, 10],
      tiers: [{}],
      weakChance: 0.5                              // fakta tabel ini yang pernah salah lebih sering muncul
    }
  };
  /* Hiasan pabrik (pabrik berkembang): terbuka setelah jumlah bintang semua mesin mencapai batas */
  root.DEKOR = [
    { id: 'flags', stars: 2 }, { id: 'lamps', stars: 4 }, { id: 'belt', stars: 6 }, { id: 'mini', stars: 9 }, { id: 'trophy', stars: 12 }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
