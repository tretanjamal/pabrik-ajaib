/* Input: tombol anak (Pointer Events via click, keyboard Tab/Enter/panah), bunyi klik < 100 ms. Dari gim 221. */
(function (root) {
  var Input = {
    /* area sentuh tak terlihat; meluas di layar kecil (body.compact, lihat scene.js) agar target sentuh >= 44 px nyata */
    hit: function (b) { var h = document.createElement('i'); h.className = 'hit'; h.setAttribute('aria-hidden', 'true'); b.appendChild(h); return b; },
    /* buat tombol. cls: warna (coral|mint|brass|plum) + kelas tambahan; o: x,y,w,h (posisi di stage), id, aria */
    button: function (label, cls, onTap, o) {
      o = o || {};
      var b = U.h('button', 'btn ' + (cls || 'coral'));
      b.type = 'button';
      b.innerHTML = '<span class="lbl">' + label + '</span>';
      Input.hit(b);
      if (o.x != null) { b.style.left = o.x + 'px'; b.style.top = o.y + 'px'; b.style.width = o.w + 'px'; b.style.height = o.h + 'px'; }
      if (o.aria) b.setAttribute('aria-label', o.aria);
      if (o.id) b.dataset.id = o.id;
      var sounded = false;
      b.addEventListener('pointerdown', function () {
        if (b.disabled) return;
        Aud.init(); Aud.sfx('click'); sounded = true;
      });
      b.addEventListener('click', function (e) {
        if (b.disabled) return;
        Aud.init();
        if (!sounded) Aud.sfx('click');   // keyboard / uji
        sounded = false;
        if (onTap) onTap(e, b);
      });
      return b;
    }
  };

  /* navigasi panah antar tombol aktif (di dalam overlay bila ada) */
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(k) < 0) return;
    var ovs = document.querySelectorAll('.overlay'), scope = ovs.length ? ovs[ovs.length - 1] : document.getElementById('scene-root');
    var list = Array.prototype.filter.call(scope.querySelectorAll('button'), function (b) { return !b.disabled && b.offsetParent !== null; });
    if (!list.length) return;
    var cur = list.indexOf(document.activeElement);
    var dir = (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 1;
    var next = cur < 0 ? (dir > 0 ? 0 : list.length - 1) : (cur + dir + list.length) % list.length;
    list[next].focus();
    e.preventDefault();
  });
  /* Escape: tutup panel teratas (Tutup / Lanjut); tanpa panel, saat bermain membuka menu jeda */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var ovs = document.querySelectorAll('.overlay'), top = ovs.length ? ovs[ovs.length - 1] : null;
    var b = top ? top.querySelector('[data-id=close], [data-id=resume]') : document.querySelector('#scene-root [data-id=pause]');
    if (b && !b.disabled) { b.click(); e.preventDefault(); }
  });
  document.addEventListener('pointerdown', function () { Aud.init(); }, { passive: true });
  root.Input = Input;
})(window);
