# Kredit: Pabrik Ajaib: Misteri Perkalian dan Pembagian (577)

Kreator: Jamaluddin, UPTD SMPN 2 Robatal. Konten Ruang Murid (Gim Edukasi Matematika, Fase C).

## Kode
HTML, CSS, dan JavaScript murni ditulis untuk konten ini. Kerangka engine teknis (penskala 16:9, loop, tween, input, simpan, layar penuh, kerangka audio) dipakai ulang dari konten Ruang Murid 221 karya kreator yang sama, tanpa gaya visualnya.

Program, soal, dan teks disusun dengan bantuan Claude (Anthropic). Keterangan penggunaan KA untuk pengguna ada di panel Referensi.

## Fon (SIL Open Font License 1.1, dibundel di `assets/fonts/`)
- **Lilita One** - Copyright (c) 2011 Juan Montoreano. Lisensi: `assets/fonts/OFL-LilitaOne.txt`.
- **Fredoka** - Copyright 2016 The Fredoka Project Authors. Lisensi: `assets/fonts/OFL-Fredoka.txt`.
Berkas WOFF2 diambil dari paket npm @fontsource/lilita-one 5.3.0 dan @fontsource/fredoka 5.3.0.

## Gambar
Dibuat oleh kreator dengan ChatGPT (pembuat gambar OpenAI), tanggal masuk 2026-11-02, memakai prompt di `docs/ASET-PROMPT.md` (satu prompt utuh per aset, gaya induk tergabung). Diproses (pangkas, normalisasi warna garis, garis tinta tambahan untuk benda kecil, pemisahan 3 ekspresi, WebP) dengan `tools/proses-aset.py`.

| Berkas di `assets/img/` | Dari | Prompt |
|---|---|---|
| machine_main.webp | machine_main.png | ASET-PROMPT #1 (acuan gaya) |
| gigo_happy/think/cheer.webp | robot_gigo.png | #2 |
| bg_factory.webp | bg_factory.png | #3 |
| gear_big.webp, gear_small.webp | gear_big.png, gear_small.png | #4, #5 |
| lever_base.webp, lever_handle.webp | lever_base.png, lever_handle.png | #6, #7 |
| lamp_off.webp | lamp_off.png | #8 |
| machine_door.webp | machine_door.png | #9 |
| crate.webp | crate.png | #10 |
| prod_ball/bread/duck/cupcake/toybot/car.webp | prod_*.png | #11-#16 |
| hand_pointer.webp | hand_pointer.png | #17 |
| machine_mini.webp | machine_mini.png | #18 (dipakai Level 4) |
| valve_wheel.webp | valve_wheel.png | #19 |
| bg_title.webp | bg_title.png | #20 |
| cust_a_*.webp, cust_b_*.webp | cust_a.png, cust_b.png | #22, #23 (dipakai Level 5) |

`pengembang.webp` (panel Pengembang) adalah foto kreator, disediakan kreator (`assets/masuk/jamal.png`), dipangkas dengan `tools/proses-foto.py`. Bukan buatan KA.

`key_art.png` (#21) disimpan untuk thumbnail (Fase 4), tidak ikut zip.
Ban berjalan, uap, kilau, partikel, bayangan, tombol, panel, kartu, ikon, dan semua angka dibuat dengan kode.

## Suara
**Musik:** `assets/audio/bgm_title.mp3` (judul, Pilih Mesin, hasil) dan `assets/audio/bgm_gameplay.mp3` (bermain), dibuat kreator dengan Suno, masuk 2026-11-02 (berkas asal `assets/masuk/`). Paket dan lisensi Suno: *belum dicatat, dilengkapi kreator*. Diproses ke mp3 mono 80 kbps dengan `tools/proses-audio.py` (pustaka lameenc dan miniaudio, hanya alat, tidak ikut zip).

Efek bunyi disintesis langsung dengan WebAudio (tanpa berkas audio). Narasi memakai speechSynthesis bawaan peramban (bahasa Indonesia bila tersedia), naskah di `naskah_audio.csv`.
