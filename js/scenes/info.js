/* Panel pop up di layar judul: Informasi (bertab), Referensi (bertab), Pengembang. Teks di STR.about; tanpa tautan keluar. */
(function (root) {
  var A = STR.about;

  function bullets(items) { return '<ul class="ab-list">' + items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'; }
  function rows(items) { return '<div class="ab-rows">' + items.map(function (r) { return '<div class="ab-row"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>'; }).join('') + '</div>'; }
  function cite(c) { return '<p class="ab-cite">' + c[0] + ' <i>' + c[1] + '</i> ' + c[2] + '</p>'; }

  function goalHTML() {
    return '<p class="ab-lead">' + A.info.intro + '</p><h3>' + A.info.goalHead + '</h3><p class="ab-goal">' + A.info.goal + '</p><p class="ab-note">' + A.info.meta + '</p>';
  }
  function howHTML() {
    return '<ol class="ab-steps">' + A.info.steps.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol><p class="ab-note">' + A.info.howNote + '</p>';
  }
  function machinesHTML() {
    var list = [1, 2, 3, 4, 5].map(function (n) { return [STR.lv[n].hud + ': ' + STR.lv[n].name, A.info.machines[n]]; });
    list.push([A.info.practice.name, A.info.practice.text]);
    return '<div class="ab-machines">' + rows(list) + '</div>';
  }
  function sourceHTML() {
    return '<p class="ab-lead">' + A.ref.sourceIntro + '</p>' + A.ref.sources.map(cite).join('') + '<p class="ab-note">' + A.ref.topic + '</p>';
  }
  function aiHTML() {
    return '<p class="ab-lead">' + A.ref.aiIntro + '</p><div class="ab-ai">' + rows(A.ref.aiRows) + '</div><h3>' + A.ref.aiRefHead + '</h3>' + cite(A.ref.aiRef);
  }

  /* kerangka panel: isi + tombol Tutup; pages (opsional) menjadi tab */
  function open(title, pages, html) {
    var o = UI.overlay(title, 'aboutpanel'), body = U.h('div', 'ab-body');
    o.panel.dataset.about = title;
    if (pages) {
      var tabs = U.h('div', 'ttabs');
      tabs.setAttribute('role', 'tablist');
      pages.forEach(function (p, i) {
        var b = Input.button(p.label, 'tab' + (i ? '' : ' on'), function () { pick(p); }, { id: 'tab-' + p.id });
        b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i ? 'false' : 'true');
        tabs.appendChild(b);
      });
      o.body.appendChild(tabs);
    }
    function pick(p) {
      body.innerHTML = p.html();
      tabs.querySelectorAll('.btn').forEach(function (b) { var on = b.dataset.id === 'tab-' + p.id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    }
    o.body.appendChild(body);
    if (pages) pick(pages[0]); else body.innerHTML = html;
    var close = Input.button(STR.settings.close, 'mint ab-close', function () { o.close(); }, { id: 'close' });
    o.body.appendChild(close);
    setTimeout(function () { close.focus({ preventScroll: true }); }, 30);
    return o;
  }

  root.About = {
    info: function () {
      var t = A.info.tabs;
      return open(A.info.title, [
        { id: 'goal', label: t.goal, html: goalHTML }, { id: 'how', label: t.how, html: howHTML },
        { id: 'machines', label: t.machines, html: machinesHTML }, { id: 'teacher', label: t.teacher, html: function () { return '<div class="ab-teacher">' + rows(A.info.teacher) + '</div>'; } }
      ]);
    },
    ref: function () {
      return open(A.ref.title, [{ id: 'source', label: A.ref.tabs.source, html: sourceHTML }, { id: 'ai', label: A.ref.tabs.ai, html: aiHTML }]);
    },
    /* satu pengembang per halaman; tombol panah di kiri-kanan Tutup berpindah (berputar) antarpengembang */
    dev: function () {
      var d = A.dev, n = d.people.length, i = 0;
      var o = open(d.title, null, ''), body = o.body.querySelector('.ab-body'), close = o.body.querySelector('.ab-close');
      var dots = U.h('div', 'ab-dots');
      dots.setAttribute('aria-hidden', 'true');
      o.body.insertBefore(dots, close);
      var foot = U.h('div', 'ab-foot');
      o.body.insertBefore(foot, close);
      var prev = UI.iconButton('prev', 'brass', function () { show(i - 1); }, { id: 'dev-prev', aria: d.prev });
      var next = UI.iconButton('next', 'brass', function () { show(i + 1); }, { id: 'dev-next', aria: d.next });
      foot.appendChild(prev); foot.appendChild(close); foot.appendChild(next);
      function show(k) {
        i = (k + n) % n;
        var p = d.people[i];
        body.innerHTML = '<div class="ab-dev" aria-label="' + U.fmt(d.page, { n: i + 1, max: n }) + '"><img class="ab-photo" src="' + p.photo + '" alt="' + U.fmt(d.photoAlt, { name: p.name }) + '" draggable="false">' +
          '<div class="ab-devinfo"><div class="ab-name">' + p.name + '</div><div class="ab-school">' + p.school + '</div>' + (p.email ? '<div class="ab-contact">' + p.email + '</div>' : '') + (p.ig ? '<div class="ab-contact ab-ig"><img src="assets/img/ikon-instagram.webp" alt="' + p.igAlt + '">' + p.ig + '</div>' : '') + '<div class="ab-contact">' + d.year + '</div>' +
          (p.list ? '<h3>' + p.listHead + '</h3>' + bullets(p.list) : '') + '</div></div>';
        body.dataset.dev = i;
        dots.innerHTML = d.people.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join('');
      }
      show(0);
      return o;
    }
  };
})(window);
