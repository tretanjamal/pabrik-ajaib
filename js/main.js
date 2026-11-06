/* Main: muat simpanan dan aset, siapkan kanvas, lalu ke layar judul. ?test=1 hanya untuk bot QA. */
(function () {
  Save.load();
  document.getElementById('rotate-text').textContent = STR.rotate;
  bootStage();
  D.init();
  D.resize(Stage.scale);
  UI.applySettings();
  if (U.TEST) {
    window.__test = window.__test || {};
    window.__test.scene = function () { return Scenes.name; };
    window.__test.assets = function () { return Assets.stats(); };
    if (/[?&]fresh=1/.test(location.search)) Save.reset();
    if (/[?&]fast=1/.test(location.search)) Tween.speed = 0.35;
  }
  var fontsReady = document.fonts && document.fonts.load ? Promise.all([
    document.fonts.load('400 40px "Lilita One"'), document.fonts.load('700 40px Fredoka'), document.fonts.load('600 26px Fredoka')
  ]).catch(function () { }) : Promise.resolve();
  var timeout = new Promise(function (r) { setTimeout(r, 2500); });   // font gagal: tetap jalan dengan cadangan
  var jump = U.TEST && /[?&]level=(\d|lt)/.exec(location.search), tb = /[?&]table=(\d+)/.exec(location.search);   // uji: langsung ke level n / latihan tabel
  var scene = U.TEST && /[?&]scene=(\w+)/.exec(location.search);   // uji: langsung ke layar (levels, practice)
  Assets.load(function () {
    Promise.race([fontsReady, timeout]).then(function () {
      if (jump) Scenes.go('play', { level: jump[1] === 'lt' ? 'lt' : +jump[1], table: tb ? +tb[1] : 7 });
      else Scenes.go(scene ? scene[1] : 'title');
    });
  });
})();
