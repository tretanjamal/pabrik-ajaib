/* Daftar aset terpusat (DIBUAT OTOMATIS oleh tools/proses-aset.py; jangan diedit tangan).
   kunci -> berkas WebP + ukuran asli + titik poros (pecahan 0-1 dari lebar/tinggi gambar).
   Kunci tanpa berkas (atau berkas gagal dimuat) memakai cadangan SVG dari js/engine/art.js. */
window.ASSET_FILES = {
 "bg_factory": {
  "file": "assets/img/bg_factory.webp",
  "h": 900,
  "w": 1600
 },
 "bg_title": {
  "file": "assets/img/bg_title.webp",
  "h": 900,
  "w": 1600
 },
 "crate": {
  "file": "assets/img/crate.webp",
  "h": 181,
  "inside": [
   0.15,
   0.08,
   0.7,
   0.29
  ],
  "w": 306,
  "wall": 0.37
 },
 "cust_a_happy": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/cust_a_happy.webp",
  "h": 440,
  "w": 242
 },
 "cust_a_idle": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/cust_a_idle.webp",
  "h": 440,
  "w": 242
 },
 "cust_a_think": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/cust_a_think.webp",
  "h": 440,
  "w": 242
 },
 "cust_b_happy": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/cust_b_happy.webp",
  "h": 440,
  "w": 233
 },
 "cust_b_idle": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/cust_b_idle.webp",
  "h": 440,
  "w": 233
 },
 "cust_b_think": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/cust_b_think.webp",
  "h": 440,
  "w": 233
 },
 "gear_big": {
  "file": "assets/img/gear_big.webp",
  "h": 357,
  "pivot": [
   0.4986,
   0.4986
  ],
  "w": 360
 },
 "gear_small": {
  "file": "assets/img/gear_small.webp",
  "h": 239,
  "pivot": [
   0.4979,
   0.4979
  ],
  "w": 240
 },
 "gigo_cheer": {
  "anchor": [
   0.5,
   1.0
  ],
  "file": "assets/img/gigo_cheer.webp",
  "h": 480,
  "visor": [
   0.302,
   0.283,
   0.464,
   0.2
  ],
  "w": 345
 },
 "gigo_happy": {
  "anchor": [
   0.5,
   1.0
  ],
  "eyes": [
   [
    0.367,
    0.317,
    0.107,
    0.087
   ],
   [
    0.575,
    0.308,
    0.107,
    0.087
   ]
  ],
  "file": "assets/img/gigo_happy.webp",
  "h": 480,
  "visor": [
   0.302,
   0.283,
   0.464,
   0.2
  ],
  "w": 345
 },
 "gigo_think": {
  "anchor": [
   0.5,
   1.0
  ],
  "eyes": [
   [
    0.357,
    0.313,
    0.111,
    0.08
   ],
   [
    0.582,
    0.29,
    0.125,
    0.09
   ]
  ],
  "file": "assets/img/gigo_think.webp",
  "h": 480,
  "visor": [
   0.348,
   0.287,
   0.406,
   0.196
  ],
  "w": 345
 },
 "hand_pointer": {
  "file": "assets/img/hand_pointer.webp",
  "h": 206,
  "tip": [
   0.0474,
   0.0437
  ],
  "w": 190
 },
 "lamp_off": {
  "file": "assets/img/lamp_off.webp",
  "glass": [
   0.2055,
   0.1506,
   0.5548,
   0.5542
  ],
  "h": 166,
  "w": 146
 },
 "lever_base": {
  "file": "assets/img/lever_base.webp",
  "h": 200,
  "pivot": [
   0.4975,
   0.4975
  ],
  "w": 199
 },
 "lever_handle": {
  "file": "assets/img/lever_handle.webp",
  "h": 300,
  "pivot": [
   0.488,
   0.93
  ],
  "w": 83
 },
 "machine_door": {
  "file": "assets/img/machine_door.webp",
  "h": 258,
  "w": 260
 },
 "machine_main": {
  "base": 0.985,
  "belt": 0.69,
  "chimney": [
   0.649,
   0.028
  ],
  "door": [
   0.347,
   0.626,
   0.294,
   0.224
  ],
  "file": "assets/img/machine_main.webp",
  "gears": [
   [
    0.233,
    0.28
   ],
   [
    0.761,
    0.28
   ]
  ],
  "h": 720,
  "in": [
   0.063,
   0.622
  ],
  "lamps": [
   [
    0.338,
    0.089,
    0.09
   ],
   [
    0.467,
    0.089,
    0.09
   ]
  ],
  "leverSocket": [
   0.774,
   0.426
  ],
  "out": [
   0.934,
   0.617
  ],
  "screen": [
   0.309,
   0.276,
   0.38,
   0.191
  ],
  "slot": [
   0.294,
   0.547,
   0.401,
   0.031
  ],
  "w": 703
 },
 "machine_mini": {
  "base": 0.98,
  "belt": 0.67,
  "chimney": [
   0.455,
   0.03
  ],
  "file": "assets/img/machine_mini.webp",
  "gears": [
   [
    0.718,
    0.233
   ]
  ],
  "h": 520,
  "in": [
   0.06,
   0.583
  ],
  "out": [
   0.9,
   0.614
  ],
  "screen": [
   0.284,
   0.317,
   0.4,
   0.233
  ],
  "slot": [
   0.346,
   0.664,
   0.27,
   0.025
  ],
  "w": 498
 },
 "prod_ball": {
  "file": "assets/img/prod_ball.webp",
  "h": 168,
  "w": 167
 },
 "prod_bread": {
  "file": "assets/img/prod_bread.webp",
  "h": 136,
  "w": 168
 },
 "prod_car": {
  "file": "assets/img/prod_car.webp",
  "h": 139,
  "w": 168
 },
 "prod_cupcake": {
  "file": "assets/img/prod_cupcake.webp",
  "h": 168,
  "w": 125
 },
 "prod_duck": {
  "file": "assets/img/prod_duck.webp",
  "h": 166,
  "w": 168
 },
 "prod_toybot": {
  "file": "assets/img/prod_toybot.webp",
  "h": 168,
  "w": 143
 },
 "valve_wheel": {
  "file": "assets/img/valve_wheel.webp",
  "h": 160,
  "pivot": [
   0.4969,
   0.4969
  ],
  "w": 160
 }
};
