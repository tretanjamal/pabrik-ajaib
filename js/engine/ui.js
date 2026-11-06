/* UI: ikon, deret ikon pojok kanan atas, panel (overlay), Pengaturan, toast, balon Gigo, tangan penunjuk.
   Tombol dan panel dibuat kode (pelat tekan, pelat mesin); tangan penunjuk memakai gambar dari Assets. */
(function (root) {
  var ST = ' fill="none" stroke="#2E2350" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  var CR = '#FFF6E0';
  var ICON = {
    soundOn: '<path d="M8 19h8l10-9v28l-10-9H8z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><path d="M32 18q6 6 0 12M37 13q11 11 0 22"' + ST + '/>',
    soundOff: '<path d="M8 19h8l10-9v28l-10-9H8z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><path d="M32 18l10 12M42 18l-10 12"' + ST + '/>',
    full: '<path d="M10 18v-8h8M38 18v-8h-8M10 30v8h8M38 30v8h-8"' + ST + '/>',
    fullExit: '<path d="M18 10v8h-8M30 10v8h8M18 38v-8h-8M30 38v-8h8"' + ST + '/>',
    gear: '<path d="M24 8l3 5 6-1 1 6 5 3-3 5 3 5-5 3-1 6-6-1-3 5-3-5-6 1-1-6-5-3 3-5-3-5 5-3 1-6 6 1z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><circle cx="24" cy="24" r="5" fill="#2E2350"/>',
    pause: '<rect x="14" y="11" width="7" height="26" rx="3" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><rect x="27" y="11" width="7" height="26" rx="3" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/>',
    speaker: '<path d="M10 19h7l9-8v26l-9-8h-7z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><path d="M31 19q5 5 0 10"' + ST + '/>',
    table: [0, 1, 2].map(function (i) { return [0, 1, 2].map(function (j) { return '<rect x="' + (7 + i * 12) + '" y="' + (9 + j * 11) + '" width="10" height="9" rx="2" fill="' + ((i + j) % 2 ? CR : '#FFC23D') + '" stroke="#2E2350" stroke-width="2.5"/>'; }).join(''); }).join(''),
    help: '<circle cx="24" cy="24" r="16" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><path d="M19 19q1-6 6-6t5 5q0 4-5 6v3"' + ST + '/><circle cx="25" cy="33" r="2.4" fill="#2E2350"/>',
    home: '<path d="M8 24L24 10l16 14M13 20v17h22V20" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><rect x="20" y="27" width="8" height="10" fill="#2E2350"/>',
    replay: '<path d="M14 16a13 13 0 1 1-3 12"' + ST + '/><path d="M8 10l3 9 9-3"' + ST + '/>',
    play: '<path d="M16 10l22 14-22 14z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/>',
    info: '<circle cx="24" cy="24" r="17" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><circle cx="24" cy="15" r="2.8" fill="#2E2350"/><path d="M24 22v12"' + ST + '/>',
    book: '<path d="M24 13q-7-5-17-4v27q10-1 17 4q7-5 17-4V9q-10-1-17 4z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><path d="M24 13v27"' + ST + '/>',
    person: '<circle cx="24" cy="15" r="9" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/><path d="M8 41q0-15 16-15t16 15z" fill="' + CR + '"' + ST.replace('fill="none" ', '') + '/>'
  };
  function icon(name, size) { return '<svg class="ico" viewBox="0 0 48 48" width="' + (size || 40) + '" height="' + (size || 40) + '" aria-hidden="true">' + ICON[name] + '</svg>'; }

  var UI = {
    icon: icon,
    iconButton: function (name, cls, onTap, o) {
      var b = Input.button(icon(name, o && o.size), 'ibtn ' + (cls || 'mint'), onTap, o);
      return b;
    },
    applySettings: function () {
      var s = Save.data.settings;
      Aud.setMuted(s.mute);
      var reduce = s.reduce || UI.prefersReduced;
      Tween.speed = reduce ? 0.5 : 1;
      D.reduce = reduce;
      document.body.classList.toggle('reduce', reduce);
    },
    prefersReduced: !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches),

    /* deret ikon pojok kanan atas: suara, layar penuh, lalu tombol terakhir (pengaturan atau jeda) */
    iconBar: function (parent, last) {
      var bar = U.h('div', 'iconbar');
      var snd = UI.iconButton(Save.data.settings.mute ? 'soundOff' : 'soundOn', 'mint', function () {
        Save.data.settings.mute = !Save.data.settings.mute; Save.save(); UI.applySettings(); refresh();
      }, { id: 'sound' });
      bar.appendChild(snd);
      var fs = null;
      if (FS.supported()) {
        fs = UI.iconButton(FS.isFull() ? 'fullExit' : 'full', 'mint', function () {
          FS.toggle(function () { UI.toast(STR.icons.fsDenied); });
        }, { id: 'fullscreen' });
        bar.appendChild(fs);
      }
      var lb = last === 'pause'
        ? UI.iconButton('pause', 'brass', function () { if (UI.onPause) UI.onPause(); }, { id: 'pause' })
        : UI.iconButton('gear', 'brass', function () { UI.settings(); }, { id: 'settings' });
      bar.appendChild(lb);
      function refresh() {
        var m = Save.data.settings.mute;
        snd.innerHTML = '<span class="lbl">' + icon(m ? 'soundOff' : 'soundOn') + '</span>';
        snd.setAttribute('aria-label', m ? STR.icons.soundOff : STR.icons.soundOn);
        if (fs) {
          var f = FS.isFull();
          fs.innerHTML = '<span class="lbl">' + icon(f ? 'fullExit' : 'full') + '</span>';
          fs.setAttribute('aria-label', f ? STR.icons.fullExit : STR.icons.full);
        }
        lb.setAttribute('aria-label', last === 'pause' ? STR.icons.pause : STR.icons.settings);
      }
      refresh();
      FS.onChange(refresh);
      bar._cleanup = function () { FS.offChange(refresh); };
      UI.refreshIcons = refresh;
      parent.appendChild(bar);
      return bar;
    },

    /* panel modal bergaya pelat mesin. Mengembalikan {el, body, close} */
    overlay: function (title, cls) {
      var ov = U.h('div', 'overlay'), panel = U.h('div', 'panel pop ' + (cls || '')), opener = document.activeElement;
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', title);
      // fokus tidak boleh lolos ke belakang panel
      document.getElementById('scene-root').inert = true;
      document.querySelectorAll('.overlay').forEach(function (x) { x.inert = true; });
      panel.innerHTML = '<div class="phead"><span>' + title + '</span><i class="lamp on"></i><i class="lamp"></i></div>';
      var body = U.h('div', 'pbody'); panel.appendChild(body); ov.appendChild(panel);
      document.getElementById('stage').appendChild(ov);
      var api = {
        el: ov, body: body, panel: panel,
        close: function () {
          if (ov.parentNode) ov.parentNode.removeChild(ov);
          var rest = document.querySelectorAll('.overlay');
          if (rest.length) rest[rest.length - 1].inert = false; else document.getElementById('scene-root').inert = false;
          if (opener && opener.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
          if (api.onClose) api.onClose();
        }
      };
      return api;
    },
    closeOverlays: function () {
      document.querySelectorAll('.overlay').forEach(function (x) { x.parentNode.removeChild(x); });
      document.getElementById('scene-root').inert = false;
    },
    /* sakelar Nyala/Mati dengan label (bukan hanya warna) */
    switchRow: function (label, get, set, id, note) {
      var row = U.h('div', 'swrow');
      row.innerHTML = '<span class="swlbl">' + label + (note ? '<small>' + note + '</small>' : '') + '</span>';
      var b = Input.button('', 'switch', function () { set(!get()); paint(); }, { id: id, aria: label });
      function paint() {
        var on = get();
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.innerHTML = '<span class="knob"></span><span class="swtxt">' + (on ? STR.settings.on : STR.settings.off) + '</span>';
      }
      paint(); row.appendChild(b);
      return row;
    },
    settings: function (onClose) {
      var o = UI.overlay(STR.settings.title, 'settings');
      var s = Save.data.settings;
      o.body.appendChild(UI.switchRow(STR.settings.sound, function () { return !s.mute; }, function (v) { s.mute = !v; Save.save(); UI.applySettings(); if (UI.refreshIcons) UI.refreshIcons(); }, 'sw-sound'));
      o.body.appendChild(UI.switchRow(STR.settings.voice, function () { return s.voice !== false; }, function (v) { s.voice = v; Save.save(); if (!v) Voice.stop(); }, 'sw-voice', STR.settings.voiceNote));
      var rd = UI.switchRow(STR.settings.reduce, function () { return s.reduce || UI.prefersReduced; }, function (v) { s.reduce = v; Save.save(); UI.applySettings(); }, 'sw-reduce');
      if (UI.prefersReduced) rd.querySelector('button').disabled = true;   // diatur perangkat: selalu nyala
      o.body.appendChild(rd);
      o.body.appendChild(UI.switchRow(STR.settings.santai, function () { return s.santai; }, function (v) { s.santai = v; Save.save(); }, 'sw-santai', STR.settings.santaiNote));
      // Murid baru (perangkat dipakai bergantian): ketuk dua kali agar tidak terhapus tanpa sengaja
      var row = U.h('div', 'swrow'), sure = false;
      row.innerHTML = '<span class="swlbl">' + STR.settings.fresh + '<small>' + STR.settings.freshNote + '</small></span>';
      var del = Input.button(STR.settings.freshBtn, 'plum fresh-btn', function () {
        if (!sure) { sure = true; del.querySelector('.lbl').textContent = STR.settings.freshSure; return; }
        Save.newStudent(); Scenes.go('title');
      }, { id: 'new-student' });
      row.appendChild(del); o.body.appendChild(row);
      var close = Input.button(STR.settings.close, 'mint wide', function () { o.close(); }, { id: 'close' });
      o.body.appendChild(close);
      o.onClose = onClose;
      setTimeout(function () { close.focus(); }, 30);
      return o;
    },
    toast: function (text) {
      var t = U.h('div', 'toast', text);
      document.getElementById('stage').appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
    },

    /* balon dialog yang menempel pada pembicara. setText memecah kata agar bisa disorot saat dibacakan. */
    bubble: function (parent, side, rid) {
      var el = U.h('div', 'bubble ' + (side || 'up'));
      var txt = U.h('div', 'btxt'); el.appendChild(txt);
      txt.setAttribute('role', 'status'); txt.setAttribute('aria-live', 'polite');   // pembaca layar ikut membacakan
      var rep = Input.button(icon('speaker', 34), 'ibtn small mint', function () { if (api.text) api.say(api.text); }, { id: rid || 'replay', aria: STR.icons.replay });
      el.appendChild(rep);
      parent.appendChild(el);
      var api = {
        el: el, text: '',
        setText: function (s) {
          api.text = s;
          txt.innerHTML = s.split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
          el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        },
        say: function (s) {
          if (s !== api.text) api.setText(s);
          var ws = txt.querySelectorAll('.w');
          return Voice.say(s, { onWord: function (i) { for (var k = 0; k < ws.length; k++) ws[k].classList.toggle('on', k === i); } });
        },
        /* tempelkan ujung ekor ke titik (x, y) kepala pembicara */
        anchor: function (x, y) { el.style.left = x + 'px'; el.style.top = y + 'px'; },
        hide: function (h) { el.style.display = h ? 'none' : ''; }
      };
      return api;
    },

    /* tangan penunjuk (gambar hand_pointer): ujung jari tepat di (x, y). tap = mengetuk berulang. */
    hand: function (parent) {
      var a = Assets.get('hand_pointer'), box = Assets.box('hand_pointer', 0, 'hand_pointer');
      var el = U.h('div', 'hand'); el.setAttribute('aria-hidden', 'true');
      var img = Assets.imgEl('hand_pointer'); img.style.width = box.w + 'px'; img.style.height = box.h + 'px';
      var tip = (a && a.m.tip) || [0.05, 0.04];
      img.style.left = -tip[0] * box.w + 'px'; img.style.top = -tip[1] * box.h + 'px';
      el.appendChild(img); parent.appendChild(el);
      var run = 0;
      var api = {
        el: el,
        hide: function () { run++; el.style.display = 'none'; el.classList.remove('tapping'); },
        at: function (x, y) { run++; el.style.display = 'block'; el.style.opacity = 1; el.style.left = x + 'px'; el.style.top = y + 'px'; el.classList.add('tapping'); },
        /* gerak berulang dari a ke b (contoh menyeret) */
        drag: function (ax, ay, bx, by) {
          var my = ++run; el.style.display = 'block'; el.classList.remove('tapping');
          (function loop() {
            if (my !== run) return;
            el.style.left = ax + 'px'; el.style.top = ay + 'px'; el.style.opacity = 0;
            Tween.run(200, function (e) { if (my === run) el.style.opacity = e; }).then(function () { return Tween.wait(250); })
              .then(function () { return Tween.run(900, function (e) { if (my !== run) return; el.style.left = (ax + (bx - ax) * e) + 'px'; el.style.top = (ay + (by - ay) * e - Math.sin(e * Math.PI) * 60) + 'px'; }, Ease.easeInOutCubic); })
              .then(function () { return Tween.wait(350); })
              .then(function () { return Tween.run(200, function (e) { if (my === run) el.style.opacity = 1 - e; }); })
              .then(function () { return Tween.wait(400); })
              .then(loop);
          })();
        }
      };
      api.hide();
      return api;
    }
  };
  root.UI = UI;
})(window);
