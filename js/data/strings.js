/* Semua teks UI (Bahasa Indonesia) di satu tempat agar mudah ditinjau guru.
   {a} {b} {c} {v} {n} {p} diganti angka/nama benda oleh kode. Instruksi maks. 2 baris pendek. */
window.STR = {
  title: 'Pabrik Ajaib',
  titleTop: 'PABRIK',
  titleBottom: 'AJAIB',
  subtitle: 'Misteri Perkalian dan Pembagian',
  start: 'MULAI',
  rotate: 'Putar perangkatmu agar mendatar',

  icons: {
    soundOn: 'Suara nyala', soundOff: 'Suara mati', full: 'Layar penuh', fullExit: 'Keluar layar penuh',
    settings: 'Pengaturan', pause: 'Jeda', replay: 'Dengar lagi', fsDenied: 'Layar penuh tidak tersedia di perangkat ini'
  },
  settings: {
    title: 'Pengaturan', sound: 'Suara', reduce: 'Kurangi animasi', santai: 'Mode Santai',
    santaiNote: 'Tanpa batas waktu', voice: 'Suara Gigo', voiceNote: 'Kalimat tetap tampil', fresh: 'Murid baru', freshNote: 'Hapus bintang dan catatan', freshBtn: 'Hapus', freshSure: 'Yakin?', on: 'Nyala', off: 'Mati', close: 'Tutup'
  },
  pause: { title: 'Istirahat dulu', resume: 'Lanjut', settings: 'Pengaturan', restart: 'Ulangi level', home: 'Beranda' },
  santaiBadge: 'Santai',

  /* tombol Informasi, Referensi, Pengembang di layar judul (panel pop up, tanpa tautan keluar) */
  about: {
    info: {
      btn: 'Informasi', title: 'Informasi',
      tabs: { goal: 'Tujuan', how: 'Cara Main', machines: 'Mesin', teacher: 'Untuk Guru' },
      intro: 'Pabrik Ajaib butuh insinyur baru! Bantu Gigo mengatur mesin dan memenuhi pesanan.',
      goalHead: 'Setelah bermain, kamu bisa:',
      goals: [
        'Memahami perkalian dan pembagian sebagai operasi yang saling berkebalikan.',
        'Menemukan bilangan yang belum diketahui, misalnya ? × 6 = 42.',
        'Menebak aturan mesin dari pasangan bilangan masuk dan keluar.',
        'Menyelesaikan soal cerita satu langkah dan dua langkah.'
      ],
      meta: 'Matematika. Aljabar: Perkalian dan Pembagian. Sekitar 15-20 menit.',
      steps: [
        'Lihat pesanan di papan dan dengarkan arahan Gigo.',
        'Seret kartu ke mesin, atau ketuk kartu lalu ketuk mesin.',
        'Tarik tuas, lalu lihat hasilnya keluar dari mesin.',
        'Cocok? Kamu dapat koin. Belum cocok? Gigo memberi petunjuk, ayo coba lagi!'
      ],
      howNote: 'Tidak ada game over. Tombol Bantuan dan Tabel selalu siap menolong. Selesaikan satu mesin untuk membuka mesin berikutnya.',
      machines: {
        1: 'Cari aturan, hasil, atau jumlah peti.',
        2: 'Pakai operasi kebalikan dengan susunan titik.',
        3: 'Tebak aturan dari 3 pasangan bilangan.',
        4: 'Rangkai dua mesin sampai mencapai target.',
        5: 'Selesaikan soal cerita dari pelanggan.'
      },
      practice: { name: 'Latihan Bebas', text: 'Berlatih satu tabel, ×2 sampai ×10.' },
      teacher: [
        ['Bintang', '3 bintang: paling banyak 1 kesalahan. 2 bintang: paling banyak 3. 1 bintang: selesai.'],
        ['Waktu', 'Hanya Mesin 4 yang memakai waktu, dan hanya untuk bintang ketiga. Mode Santai menghilangkannya.'],
        ['Petunjuk', 'Salah ke-1: dorongan. Ke-2: bagian penting disorot. Ke-3: Gigo memperagakan caranya, lalu ada soal serupa.'],
        ['Catatan', 'Layar hasil memuat Catatan untuk Guru: keterampilan, fakta yang dikuasai, dan pola kesalahan.'],
        ['Data', 'Tersimpan hanya di perangkat ini, tanpa data pribadi. Pengaturan > Murid baru menghapusnya.']
      ]
    },
    ref: {
      btn: 'Referensi', title: 'Referensi',
      tabs: { source: 'Sumber Materi', ai: 'Kecerdasan Artifisial' },
      sourceIntro: 'Sumber materi gim ini:',
      sources: [
        ['Ari Setiyani, dkk. (2025).', 'Panduan Mata Pelajaran Matematika.', 'Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.']
      ],
      topic: 'Topik gim ini: Aljabar, Perkalian dan Pembagian.',
      aiIntro: 'Pengembang memakai kecerdasan artifisial (KA) sebagai alat bantu.',
      aiRows: [
        ['Gambar', 'Ilustrasi dibuat dengan ChatGPT (OpenAI), lalu diolah oleh program.'],
        ['Musik', 'Musik latar dibuat dengan Suno.'],
        ['Kode dan teks', 'Program, soal, dan kalimat disusun dengan bantuan Claude (Anthropic).'],
        ['Pemeriksaan', 'Generator soal diuji otomatis pada jutaan kasus. Pengembang bertanggung jawab atas seluruh isi.'],
        ['Saat bermain', 'Gim tidak memakai KA, tidak perlu internet, dan tidak mengirim data apa pun.']
      ],
      aiRefHead: 'Rujukan',
      aiRef: ['Purwarianti, A., dkk. (2025).', 'Panduan Pemanfaatan Kecerdasan Artifisial untuk Guru PAUD, Pendidikan Dasar, dan Pendidikan Menengah.', 'Jakarta: Pusat Kurikulum dan Pembelajaran & Pusat Standar dan Kebijakan Pendidikan.']
    },
    dev: {
      btn: 'Pengembang', title: 'Pengembang',
      photoAlt: 'Foto Jamaluddin',
      name: 'Jamaluddin', school: 'UPTD SMPN 2 Robatal', email: 'jamaluddin551@guru.smp.belajar.id', year: 'Tahun pembuatan: 2026',
      listHead: 'Prestasi dan Pengalaman',
      list: [
        'Narasumber Digitalisasi Pembelajaran Kemendikdasmen',
        'Guru Pejuang Digital',
        'Juara 1 Lomba Inovasi Guru SMP Kabupaten Sampang 2026',
        'Juara 1 Guru Inspiratif SMP Kabupaten Sampang 2026',
        'Komunitas Belajar Terbaik BLPT Kemendikdasmen 2024'
      ]
    }
  },

  /* nama level (HUD, pilih mesin, layar hasil) */
  lv: {
    1: { hud: 'MESIN 1', name: 'Mesin Satu Langkah', icon: '×' },
    2: { hud: 'MESIN 2', name: 'Mesin Kebalikan', icon: ':' },
    3: { hud: 'MESIN 3', name: 'Tebak Aturan', icon: '?' },
    4: { hud: 'MESIN 4', name: 'Mesin Dua Langkah', icon: '×:' },
    5: { hud: 'MESIN 5', name: 'Pesanan Pelanggan', icon: '?!' }
  },
  levels: { title: 'Pilih Mesin', back: 'Beranda', stars: '{n} dari 3 bintang', play: 'Main', table: 'Tabel', practice: 'Latihan', lockHint: 'Selesaikan Mesin {n}', lockAria: 'terkunci, selesaikan Mesin {n} dulu' },
  /* hiasan pabrik (pabrik berkembang karena bintang) */
  dekor: {
    title: 'Pabrikku', stars: '{n} dari {max} bintang',
    names: { flags: 'Bendera hias', lamps: 'Lampu gantung', belt: 'Ban produk', mini: 'Mesin mini', trophy: 'Piala Insinyur' },
    next: '{n} bintang lagi: {name}', all: 'Semua hiasan terbuka!', fresh: 'Hiasan baru: {name}!',
    locked: '{name}, terbuka di {n} bintang', open: '{name}, sudah terbuka'
  },
  /* Latihan bebas per tabel perkalian */
  LT: {
    title: 'Latihan Bebas', sub: 'Pilih tabel perkalian', hud: 'TABEL ×{n}', table: 'Tabel ×{n}', back: 'Pilih Mesin',
    mastered: '{k} dari {all} dikuasai',
    say: { mul: '{a} kelompok isi {b}. Berapa titik?', div: '{c} : {b} = ? Ada berapa kelompok?', missf: '? × {b} = {c}. Berapa kelompok?' },
    resTitle: 'Latihan Beres!', resSub: 'Tabel ×{n}: {k} dari {all} langsung benar', again: 'Lagi', pick: 'Pilih tabel'
  },
  timer: 'Bonus waktu',
  timerOut: 'Waktu bonus habis, tetap lanjut!',
  out: 'KELUAR',
  target: 'TARGET',
  mid: 'HASIL 1',
  dots: 'titik',
  group: 'kelompok',
  perGroup: 'tiap kelompok',
  number: 'bilangan',
  ruleLbl: 'ATURAN',
  pairsHead: ['MASUK', 'KELUAR', 'HASIL'],
  slots: { m1: 'Mesin 1', m2: 'Mesin 2', in: 'Tempat bilangan masuk' },
  cardRuleAny: 'Kartu aturan {v}',
  input: 'MASUK',
  order: 'PESANAN',
  crates: 'peti',
  perCrate: 'tiap peti',
  table: 'Tabel',
  help: 'Bantuan',
  lever: 'Tarik tuas',
  slot: 'Slot kartu mesin',
  cardRule: 'Kartu kali {v}',
  cardNum: 'Kartu angka {v}',
  cardCrate: 'Kartu {v} peti',

  products: {
    prod_ball: 'bola', prod_bread: 'roti', prod_duck: 'bebek', prod_cupcake: 'kue',
    prod_toybot: 'robot', prod_car: 'mobil'
  },
  /* tombol Bantuan sebelum ada kesalahan */
  helpTip: {
    rule: 'Ada {a} peti. Isi berapa agar jadi {c}?',
    output: 'Hitung loncat {b} sebanyak {a} kali.',
    input: 'Isi {b} tiap peti. Berapa peti untuk {c}?'
  },
  pickFirst: 'Pilih kartu dulu, lalu ketuk mesin.',
  dropHere: 'Letakkan kartu di tempat yang menyala.',

  /* arahan Gigo (dibacakan; juga di naskah_audio.csv) */
  say: {
    guide1: 'Seret kartu ×2 ke slot mesin!',
    guide1tap: 'Atau ketuk kartunya, lalu ketuk mesin.',
    guide2: 'Bagus! Sekarang tarik tuasnya!',
    rule: 'Pilih aturan mesin agar jadi {c} {p}!',
    output: '{a} peti, isi {b} {p}. Berapa semuanya?',
    input: 'Berapa peti agar jadi {c} {p}?',
    pull: 'Tarik tuasnya!',
    running: 'Mesin sedang jalan...',
    idle: 'Pilih satu kartu, lalu masukkan ke mesin.'
  },
  /* kalimat pembuka saat pertama kali masuk sebuah mesin */
  firstTip: {
    2: 'Mesin ini mencari kebalikannya: × jadi :.',
    3: 'Mesin ini punya satu aturan. Tebak, ya!',
    4: 'Ada dua mesin berurutan. Jam hanya bonus.',
    5: 'Pelanggan datang. Baca dulu ceritanya!'
  },
  good: ['Hebat! Pesanan beres!', 'Tepat sekali!', 'Mesin bekerja sempurna!', 'Keren, Insinyur!'],
  goodSum: '{a} × {b} = {c}',
  /* salah: tebakan murid + hasil sebenarnya, tanpa menghakimi */
  wrong: {
    rule: 'Kartumu ×{v} membuat {t} {p}. Pesanan {c}.',
    output: 'Tebakanmu {v}. Mesin membuat {c} {p}.',
    input: '{v} peti membuat {t} {p}. Pesanan {c}.',
    add: '{x} + {y} = {s}, tapi mesin mengali!',
    near: 'Coba hitung loncat {b} pelan-pelan.',
    nearHigh: 'Hampir! Sedikit kebanyakan.',
    nearLow: 'Hampir! Masih kurang sedikit.',
    high: 'Terlalu banyak! Coba kartu lebih kecil.',
    low: 'Masih kurang! Coba kartu lebih besar.',
    swap: 'Mana jumlah peti? Mana isi tiap peti?',
    tier2: 'Lihat petinya. Hitung {p} di tiap peti.',
    tier3: 'Lihat caraku membaginya!',
    tier3out: 'Hitung loncat {b}, lihat angkanya!',
    tier3in: 'Masukkan {b} ke tiap peti sampai habis.',
    showAnswer: 'Jadi kartunya {ans}. Ayo coba!',
    again: 'Coba lagi, kamu pasti bisa!',
    extra: 'Satu soal mirip lagi untuk latihan!'
  },
  /* Level 2 Mesin Kebalikan (array titik). {t} = hasil mesin dari kartu murid */
  L2: {
    say: {
      div: '{c} : {b} = ? Ada berapa kelompok isi {b}?',
      missf: 'Mesin ×{b} membuat {c}. Apa yang masuk?',
      divisor: '{c} titik jadi {a} kelompok. Isi tiap kelompok?'
    },
    good: '{c} : {b} = {a}, jadi {a} × {b} = {c}.',
    wrong: {
      div: 'Tebakanmu {v}. Mesin membuat {a} kelompok.',
      missf: '{v} × {b} = {t}. Pesanan {c}.',
      divisor: '{a} kelompok isi {v} = {t}. Harus {c}.',
      mul: 'Tebakanmu {v}. Mesin membuat {c} titik.'
    },
    tips: {
      add: '× artinya kelompok sama, bukan tambah.',
      same: 'Pakai kebalikannya! Kebalikan × adalah :.',
      near: 'Hampir! Hitung loncat {b} sampai {c}.',
      sub: ': bukan mengurangi sekali saja.',
      nearDiv: 'Bagi {c} satu-satu ke {a} kelompok.',
      swap: 'Mana banyak kelompok, mana isinya?'
    },
    help: {
      div: 'Kelompokkan {c} titik, tiap kelompok {b}.',
      missf: 'Berapa kali {b} agar jadi {c}?',
      divisor: 'Bagi {c} titik rata ke {a} kelompok.',
      mul: 'Hitung loncat {b} sebanyak {a} kali.'
    },
    back: 'Mesin mundur! ×{b} dibalik jadi :{b}.',
    tier2: { div: 'Lihat titiknya. Berapa kelompok isi {b}?', missf: 'Lihat titiknya. Berapa kelompok isi {b}?', divisor: 'Lihat titiknya. Isi tiap kelompok berapa?', mul: 'Lihat titiknya. Hitung loncat {b}.' },
    tier3: { div: 'Lihat! {c} titik dikelompokkan isi {b}.', missf: 'Lihat! {c} titik dikelompokkan isi {b}.', divisor: 'Lihat! {c} titik dibagi rata satu-satu.', mul: 'Lihat! {a} kelompok, tiap kelompok {b}.' },
    tooMany: 'Terlalu banyak titik!'
  },
  /* Level 3 Tebak Aturan. {v} = aturan murid, {x} masukan, {got} hasil mesin, {want} keluaran yang benar */
  L3: {
    say: 'Lihat 3 pasangan. Pilih aturan mesinnya!',
    good: 'Aturan {r} cocok untuk semua pasangan!',
    wrong: 'Dengan {v}, {x} jadi {got}, bukan {want}.',
    wrongFrac: 'Dengan {v}, {x} tidak habis dibagi.',
    tips: {
      inv: 'Cek arahnya: dari MASUK ke KELUAR.',
      add: 'Aturan {v} cocok di 1 pasangan saja.',
      near: 'Belum cocok. {x} jadi {y} pakai apa?'
    },
    help: 'Lihat {x} jadi {y}. Lebih besar atau lebih kecil?',
    tier2: 'Lihat titiknya: {x} jadi {y}. Kali atau bagi?',
    tier2mul: '{x} kelompok sama besar = {y} titik',
    tier2div: '{x} titik = {y} kelompok sama besar',
    tier3: 'Lihat aturan {ans} di tiap pasangan.',
    ok: 'cocok', no: 'tidak cocok', frac: 'tidak habis'
  },
  /* Level 4 Mesin Dua Langkah. {s} masuk, {m} hasil antara, {e} target, {r1} {r2} aturan */
  L4: {
    say: {
      second: 'Pilih aturan mesin 2 agar jadi {e}!',
      first: 'Pilih aturan mesin 1 agar jadi {e}!',
      start: 'Bilangan berapa masuk agar jadi {e}?',
      both: 'Pasang 2 aturan agar {s} jadi {e}!'
    },
    next: 'Bagus! Sekarang kartu untuk mesin 2.',
    good: '{s} {r1} = {m}, lalu {m} {r2} = {e}. Pas!',
    wrong: '{s} jadi {m}, lalu jadi {t}. Target {e}.',
    jam: 'Mesin {k} macet: {x} {r} tidak bulat.',
    tips: {
      inv: 'Cek tandanya: perlu × atau :?',
      near: 'Hampir! Cek lagi hasil tiap mesin.',
      swap: 'Aturan itu milik mesin yang lain.',
      one: 'Mesin 1 juga harus dibalik, ya!',
      same: 'Mundur? Pakai kebalikan: × jadi :.',
      order: 'Coba tukar kartunya agar hasil antaranya bulat.',
      fracin: 'Coba bilangan lain yang habis dibagi.',
      frac: 'Hasil tiap mesin harus bulat. Coba aturan lain.'
    },
    help: {
      second: 'Mesin 1 membuat {m}. {m} jadi {e} pakai apa?',
      first: 'Mundur dari {e}: sebelum {r2} berapa?',
      start: 'Mundur dari {e}, pakai kebalikan tiap mesin.',
      both: 'Cari dulu hasil antara yang bulat.'
    },
    tier2: {
      second: 'Hasil antara {m}. Dari {m} ke {e} pakai apa?',
      first: 'Mundur: sebelum {r2}, angkanya harus {m}.',
      start: 'Mundur: {e} jadi {m}, lalu jadi ...?',
      both: 'Hasil antaranya harus {m}.'
    },
    tier3: 'Lihat: {s} {r1} = {m}, lalu {m} {r2} = {e}.'
  },
  /* Level 5 Pesanan Pelanggan (soal cerita). Cerita di balon pelanggan (maks. 3 baris), arahan Gigo maks. 2 baris.
     {a} {b} {c}: a × b = c; {p} benda, {w} wadah, {g} kelompok penerima; {s} {n1} {n2} {m} {e}: cerita dua langkah */
  L5: {
    ctr: ['kotak', 'peti', 'kantong'],
    grp: ['meja', 'kelas', 'tim'],
    /* nama lengkap benda di cerita (kartu dan label memakai nama pendek STR.products) */
    prod: { prod_ball: 'bola', prod_bread: 'roti', prod_duck: 'bebek mainan', prod_cupcake: 'kue', prod_toybot: 'robot mainan', prod_car: 'mobil mainan' },
    story: {
      group: 'Aku pesan {c} {p}. Satu {w} muat {b} {p}. Perlu berapa {w}?',
      share: 'Ada {c} {p}, mau kubagi rata ke {b} {g}. Tiap {g} dapat berapa {p}?',
      mul: 'Aku pesan {a} {w}. Tiap {w} isi {b} {p}. Berapa {p} semuanya?',
      two: 'Aku beli {s} {w}, tiap {w} isi {n1} {p}. Kubagi rata ke {n2} {g}. Tiap {g} dapat berapa?'
    },
    say: { op: 'Pilih aturan mesin untuk pesanan ini!', num: 'Pilih jawabannya. Mesin akan mengecek!', two: 'Pasang 2 aturan sesuai urutan cerita!' },
    next: 'Bagus! Sekarang aturan langkah kedua.',
    check: 'MESIN CEK', guess: 'JAWABAN', mustBe: 'HARUS {v}',
    thanks: 'Pas! {ans} {u}. Terima kasih!',
    good: { div: '{c} : {b} = {a}. Pesanan beres!', mul: '{a} × {b} = {c}. Pesanan beres!', two: '{s} × {n1} = {m}, lalu {m} : {n2} = {e}.' },
    wrong: {
      op: '{s} {r} = {t}. Bukan itu pesanannya.',
      opJam: '{s} {r}: tidak habis dibagi.',
      numDiv: '{v} × {b} = {t}, bukan {c}.',
      numMul: '{v} : {b} = {t}, bukan {a}.',
      numJam: '{v} : {b}: tidak habis dibagi.',
      two: '{s} jadi {m}, lalu jadi {t}.'
    },
    tips: {
      sameDiv: 'Dengan ×, jumlahnya membesar. Di cerita?',
      sameMul: 'Dengan :, jumlahnya mengecil. Di cerita?',
      same2: 'Cek tiap langkah: perlu × atau :?',
      add: 'Menambah sekali belum cukup. Baca lagi.',
      sub: 'Mengurangi sekali belum cukup. Baca lagi.',
      near: 'Hampir! Cek lagi angka di cerita.',
      nearNum: 'Hampir! Hitung lagi pelan-pelan.',
      part: 'Ada bagian yang belum dihitung. Cek lagi!',
      order: 'Urutan penting! Mana langkah pertama?',
      frac: 'Hasilnya tidak bulat. Coba aturan lain.'
    },
    help: { op: 'Baca lagi ceritanya. Kali atau bagi?', numDiv: 'Jawabanmu × {b} harus jadi {c}.', numMul: 'Pecah {a} jadi puluhan dan satuan.', two: 'Langkah 1 dulu: berapa semuanya?' },
    tier2: { group: 'Tiap {w} {b}. Pakai apa?', share: 'Dibagi rata ke {b} {g}. Pakai apa?', mul: '{a} {w} sama banyak. Pakai apa?', numDiv: '{b} × 10 = {b10}. Lanjutkan sampai {c}.', numMul: '{a} = {t} + {u}. Kalikan satu-satu.', numMul0: 'Hitung {k} × {b}, lalu kali 10.', two: 'Hitung semuanya dulu, lalu bagi rata.' },
    tier3: { opDiv: '{c} dibagi {b}: pakai :{b}.', opMul: '{a} kelompok isi {b}: pakai ×{b}.', num: 'Lihat caraku memecah bilangannya!', two: 'Lihat: {s} × {n1} = {m}, lalu : {n2}.' },
    steps: 'Cara Gigo'
  },
  tableTitle: 'Tabel Perkalian',
  tableUI: {
    legend: { ok: 'Dikuasai', seen: 'Pernah dicoba', none: 'Belum' },
    count: 'Dikuasai: {k} dari {all} fakta',
    pick: 'Ketuk satu kotak untuk melihat fakta dan kebalikannya.',
    st: { ok: 'Sudah dikuasai', seen: 'Terus berlatih', none: 'Belum dicoba', one: 'Kali 1: tetap sama' },
    cell: '{a} kali {b} sama dengan {c}'
  },
  close: 'Tutup',

  result: {
    title: 'Mesin Beres!',
    sub: ['Terus berlatih, kamu makin hebat!', 'Kerja bagus, Insinyur!', 'Sempurna! Pabrik bangga padamu!'],   // 1, 2, 3 bintang
    skillsTitle: 'Yang sudah kamu kuasai',
    skills: {
      rule: 'Menemukan aturan mesin (berapa isi tiap peti)',
      output: 'Menghitung semua benda dalam kelompok sama',
      input: 'Menemukan jumlah peti yang belum diketahui',
      div: 'Membagi dengan mengelompokkan titik',
      missf: 'Mencari bilangan yang hilang dengan membagi',
      divisor: 'Membagi rata ke beberapa kelompok',
      mul: 'Menebak aturan kali dari pasangan angka',
      div3: 'Menebak aturan bagi dari pasangan angka',
      second: 'Mencari aturan mesin kedua',
      first: 'Berpikir mundur untuk aturan mesin pertama',
      start: 'Berpikir mundur untuk bilangan awal',
      both: 'Merangkai dua mesin sampai target',
      op5: 'Memilih kali atau bagi dari cerita',
      num5: 'Membagi bilangan 3 angka',
      two5: 'Menyelesaikan cerita dua langkah',
      ltmul: 'Mengalikan dengan tabel ini',
      ltdiv: 'Membagi dengan tabel ini',
      ltmissf: 'Mencari bilangan yang hilang'
    },
    algebraKidTitle: 'Kekuatan aljabarmu',
    skillsTodoTitle: 'Ayo latihan lagi',
    algebraKid: { unknown: 'Menemukan bilangan yang belum diketahui', inverse: 'Hubungan × dan : (saling berkebalikan)' },
    skillsTodo: 'Terus berlatih',
    coins: 'Koin',
    again: 'Ulangi',
    home: 'Beranda',
    next: 'Mesin {n}',
    choose: 'Pilih Mesin',
    teacherTitle: 'Catatan untuk Guru',
    tColSkill: 'Kompetensi', tColStatus: 'Status',
    tSkills: {
      rule: 'Menemukan faktor yang hilang (a × ? = c)',
      output: 'Perkalian sebagai kelompok sama (a × b = ?)',
      input: 'Menemukan bilangan yang belum diketahui (? × b = c)',
      div: 'Pembagian sebagai pengelompokan (c : b = ?)',
      missf: 'Faktor hilang lewat operasi kebalikan (? × b = c)',
      divisor: 'Menemukan pembagi / bagi rata (c : ? = a)',
      mul: 'Menentukan aturan × dari 3 pasangan',
      div3: 'Menentukan aturan : dari 3 pasangan',
      second: 'Aturan langkah kedua (hasil antara diketahui)',
      first: 'Aturan langkah pertama (berpikir mundur)',
      start: 'Bilangan awal dua langkah (operasi kebalikan)',
      both: 'Menyusun dua langkah berurutan',
      op5: 'Memodelkan cerita: memilih × atau :',
      num5: 'Bilangan 3 angka : 1-2 angka (dicek dengan ×)',
      two5: 'Soal cerita dua langkah',
      ltmul: 'Fakta perkalian tabel ini (a × b = ?)',
      ltdiv: 'Fakta pembagian tabel ini (c : b = ?)',
      ltmissf: 'Faktor hilang (? × b = c)'
    },
    tabs: { session: 'Sesi ini', algebra: 'Aljabar', all: 'Rekap' },
    algTitle: 'Kompetensi aljabar',
    alg: {
      unknown: 'Bilangan yang belum diketahui',
      inverse: 'Hubungan perkalian dan pembagian',
      rule: 'Aturan dari pasangan angka',
      story: 'Soal cerita dan dua langkah'
    },
    algSession: 'Sesi ini', algAll: 'Semua sesi',
    allStars: 'Bintang tiap mesin', allFacts: 'Fakta 2-10 dikuasai: {k} dari {all}', allWeak: 'Fakta perlu latihan: {list}', allPractice: 'Latihan bebas selesai: {n} kali',
    hintsUsed: 'Bantuan dipakai: {n} kali (soal yang diperagakan tidak dihitung dikuasai)',
    errTitle: 'Pola kesalahan',
    status: { ok: 'Lancar', mid: 'Cukup', low: 'Perlu latihan', few: 'Data sedikit', none: 'Belum muncul' },
    factsOk: 'Benar tanpa salah sesi ini: {list}',
    factsLow: 'Perlu latihan: {list}',
    none: '-',
    tips: {
      add: 'Murid kadang menjumlah alih-alih mengali; tekankan "kelompok yang sama".',
      near: 'Ada salah fakta tetangga; latih hitung loncat dan tabel.',
      swap: 'Murid kadang menukar jumlah kelompok dan isi kelompok.',
      same: 'Murid memakai operasi yang sama, bukan kebalikannya; tekankan pasangan × dan :.',
      sub: 'Murid kadang mengurangi alih-alih membagi; peragakan membagi rata.',
      inv: 'Murid membaca aturan terbalik arah; latih membaca masukan ke keluaran.',
      one: 'Murid baru membalik satu langkah; latih berpikir mundur langkah demi langkah.',
      order: 'Murid menukar urutan mesin. Hasil akhirnya sama, tetapi di mesin ini hasil antara harus bulat; bahas keterbagian.',
      fracin: 'Murid memilih bilangan yang tidak habis dibagi; bahas keterbagian dan berpikir mundur.',
      frac: 'Murid memilih langkah yang hasil antaranya tidak bulat; bahas keterbagian.',
      part: 'Murid baru menghitung sebagian (puluhan saja); latih memecah bilangan jadi puluhan dan satuan.',
      none: 'Tidak ada pola kesalahan menonjol.'
    },
    algebraLv: {
      5: 'Kompetensi aljabar: memodelkan soal cerita dengan × atau :, menemukan bilangan yang belum diketahui, dan mengecek pembagian dengan perkalian.',
      lt: 'Latihan fakta: perkalian dan pembagian dalam satu tabel sebagai pasangan berkebalikan.',
      1: 'Kompetensi aljabar: menemukan bilangan yang belum diketahui. Hubungan × dan : dilatih mulai Mesin 2.',
      2: 'Kompetensi aljabar: hubungan perkalian dan pembagian sebagai operasi berkebalikan; menemukan bilangan yang belum diketahui.',
      3: 'Kompetensi aljabar: menentukan aturan (fungsi) dari pasangan masukan-keluaran.',
      4: 'Kompetensi aljabar: menyelesaikan masalah dua langkah dan berpikir mundur dengan operasi kebalikan.'
    },
    timeBonus: 'Bonus waktu: {s}',
    santaiNote: 'Mode Santai (tanpa batas waktu)'
  }
};
