/* Make a post: the user's photo in a template that moves. Each template has its own decoration, entrance and the
   spots its texts may take; a tap moves a text to the next free spot, and a text the look pins stays put.
   Template names follow the app's catalogue (findings/plans/create-redesign/programs-catalogue.md). */
(() => {
  const I = window.I18N, t = (s) => I.t(s);
  const $ = (s) => document.querySelector(s);
  const stage = $('#tplStage');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PHOTOS = {
    mona: { handle: '@oldmasters.daily', title: 'She’s not smiling at you.', word: 'Smile' },
    latte: { handle: '@pikolo.corner', title: 'New on the menu: oat flat white.', word: 'Fresh' },
    tahdig: { handle: '@ashpazkhane.shirin', title: 'Real tahdig takes patience.', word: 'Tahdig' },
    breakfast: { handle: '@eat.with.mina', title: 'Breakfast in three minutes.', word: 'Morning' },
    treats: { handle: '@lotte.treats', title: 'Taste-tested by the boss.', word: 'Crunch' },
    pushups: { handle: '@ten.min.amir', title: 'Ten minutes. No excuses.', word: 'Move' },
    pearl: { handle: '@oldmasters.daily', title: 'The pearl is probably not a pearl.', word: 'Pearl' },
    agnew: { handle: '@oldmasters.daily', title: 'Sargent painted her in one sitting.', word: 'Sargent' },
  };
  const deco = {
    date: () => `<span class="deco"><b>${I.digits(I.lang === 'fa' ? 8 : 30)}</b>${t('OCT')}</span>`,
    price: () => `<span class="deco" dir="ltr">${I.lang === 'fa' ? '۴٫۹۰ €' : '€4.90'}</span>`,
    frame: () => '<span class="deco"></span>', polaroid: () => '<span class="deco"></span>', third: () => '<span class="deco"></span>',
  };
  // title / handle: the spots in order; pinned: the look keeps that text where it is.
  const TEMPLATES = [
    { k: 'date', name: 'Date stamp', title: ['bl', 'br', 'tl'], handle: ['tl', 'bc', 'br'] },
    { k: 'frame', name: 'Thin frame', title: ['bl', 'tl', 'br'], handle: ['tr', 'tl', 'br'] },
    { k: 'price', name: 'Price tag', title: ['bl', 'br', 'tl'], handle: ['tl', 'bl', 'br'] },
    { k: 'polaroid', name: 'Tape polaroid', title: ['bc'], handle: ['tl', 'tr', 'bl'], pinned: 'title' },
    { k: 'third', name: 'Lower third', title: ['bl', 'br', 'tl'], handle: ['tr', 'tl', 'br'] },
    { k: 'stacked', name: 'Stacked word', title: ['tl', 'tr', 'bl'], handle: ['br', 'bl', 'tr'], big: true },
    { k: 'bubble', name: 'Speech bubble', title: ['tl', 'tr', 'bl'], handle: ['br', 'bl', 'tr'] },
  ];
  const st = { photo: 'tahdig', tpl: 0, spot: { title: 0, handle: 0 } };

  // Persian mirrors the page, so a spot on the left becomes the same spot on the right.
  const side = (s) => I.lang === 'fa' ? s.replace(/l$/, 'R').replace(/r$/, 'l').replace('R', 'r') : s;
  const spotOf = (T, key) => T[key][st.spot[key] % T[key].length];

  function render(enter) {
    const T = TEMPLATES[st.tpl], P = PHOTOS[st.photo];
    const title = T.big ? t(P.word) : t(P.title);
    stage.className = 'tpl-stage t-' + T.k;
    stage.innerHTML = `<img src="/v2/assets/${st.photo}.jpg" alt="">${(deco[T.k] || (() => ''))()}`
      + `<button type="button" class="tx title sp-${side(spotOf(T, 'title'))}${T.pinned === 'title' ? ' pinned' : ''}" data-k="title" style="--i:0">${title}</button>`
      + `<button type="button" class="tx handle sp-${side(spotOf(T, 'handle'))}" data-k="handle" style="--i:1" dir="ltr">${P.handle}</button>`;
    stage.querySelectorAll('.tx').forEach(b => b.setAttribute('aria-label', b.classList.contains('pinned') ? t('This one stays put') : t('Tap to move this text')));
    if (enter && !reduce) { stage.classList.remove('in'); void stage.offsetWidth; stage.classList.add('in'); }
    $('#tplName').textContent = t(T.name);
    meta();
    $('#tplList').querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === st.tpl));
    $('#tplPhotos').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.p === st.photo));
  }
  function meta(key = 'title') {
    const T = TEMPLATES[st.tpl];
    $('#tplSpot').textContent = T.pinned === key ? t('This one stays put') : t('Tap a text to move it');
  }

  stage.addEventListener('click', (e) => {
    const b = e.target.closest('.tx'); if (!b) return;
    const T = TEMPLATES[st.tpl], key = b.dataset.k, other = key === 'title' ? 'handle' : 'title';
    if (T.pinned === key) { meta(key); return; }
    // Next spot the template allows that the other text is not using.
    for (let step = 1; step <= T[key].length; step++) {
      const next = (st.spot[key] + step) % T[key].length;
      if (T[key][next] !== spotOf(T, other)) { st.spot[key] = next; break; }
    }
    b.className = b.className.replace(/sp-\w+/, 'sp-' + side(spotOf(T, key)));
    if (!reduce) { b.classList.remove('moved'); void b.offsetWidth; b.classList.add('moved'); }
    meta(key);
  });

  function lists() {
    $('#tplPhotos').innerHTML = Object.keys(PHOTOS).map(k => `<button type="button" class="ptile" data-p="${k}" aria-label="${t(PHOTOS[k].title)}"><img src="/v2/assets/${k}.jpg" alt=""></button>`).join('');
    $('#tplList').innerHTML = TEMPLATES.map((T, i) => `<button type="button" data-t="${i}">${t(T.name)}</button>`).join('');
  }
  $('#tplPhotos').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (!b) return; st.photo = b.dataset.p; render(true); });
  $('#tplList').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; st.tpl = +b.dataset.t; st.spot = { title: 0, handle: 0 }; render(true); });
  $('#tplShuffle').addEventListener('click', () => {
    let n; do { n = Math.floor(Math.random() * TEMPLATES.length); } while (n === st.tpl);
    st.tpl = n; st.spot = { title: 0, handle: 0 }; render(true);
  });
  document.addEventListener('langchange', () => { lists(); render(false); });

  lists(); render(false);
  // Play the entrance once, when the section comes into view.
  if (!reduce) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { render(true); o.disconnect(); } }), { threshold: .4 }).observe(stage);
})();
