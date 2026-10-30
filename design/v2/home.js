/* diwche.com v2 home: data straight from the backend (looks/looks.json, video-spec/vocab/caption-looks.json). */
const LOOKS = {"cats":[["portrait","Portrait"],["film","Film"],["mono","Mono"],["retro","Retro"],["warm","Warm"],["cool","Cool"],["landscape","Landscape"],["food","Food"],["night","Night"],["cinematic","Cinematic"]],"looks":[{"id":"mono","label":"Mono","cat":"mono","code":"M1","cube":"mono.cube","f":false,"v":["dramatic"]},{"id":"warm","label":"Warm","cat":"warm","code":"W1","cube":"warm.cube","f":true,"v":["upbeat","modern_upbeat"]},{"id":"cool","label":"Cool","cat":"cool","code":"C1","cube":"cool.cube","f":true,"v":["modern_chill","modern_upbeat"]},{"id":"vivid","label":"Vivid","cat":"film","code":"F1","cube":"vivid.cube","f":true,"v":["upbeat","modern_upbeat"]},{"id":"fade","label":"Fade","cat":"film","code":"F2","cube":"fade.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"clarendon","label":"Clarendon","cat":"film","code":"F3","cube":"clarendon.cube","f":true,"v":["modern_chill","modern_upbeat"]},{"id":"gingham","label":"Gingham","cat":"film","code":"F4","cube":"gingham.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"moon","label":"Moon","cat":"mono","code":"M2","cube":"moon.cube","f":false,"v":["dramatic"]},{"id":"lark","label":"Lark","cat":"portrait","code":"P1","cube":"lark.cube","f":false,"v":["calm","neutral"]},{"id":"reyes","label":"Reyes","cat":"film","code":"F5","cube":"reyes.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"juno","label":"Juno","cat":"warm","code":"W2","cube":"juno.cube","f":false,"v":["upbeat","modern_upbeat"]},{"id":"slumber","label":"Slumber","cat":"night","code":"N1","cube":"slumber.cube","f":false,"v":["dramatic"]},{"id":"crema","label":"Crema","cat":"film","code":"F6","cube":"crema.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"ludwig","label":"Ludwig","cat":"film","code":"F7","cube":"ludwig.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"aden","label":"Aden","cat":"retro","code":"R1","cube":"aden.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"perpetua","label":"Perpetua","cat":"cool","code":"C2","cube":"perpetua.cube","f":false,"v":["modern_chill","modern_upbeat"]},{"id":"amaro","label":"Amaro","cat":"retro","code":"R2","cube":"amaro.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"mayfair","label":"Mayfair","cat":"portrait","code":"P2","cube":"mayfair.cube","f":false,"v":["calm","neutral"]},{"id":"xpro","label":"X-Pro II","cat":"retro","code":"R3","cube":"xpro.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"inkwell","label":"Inkwell","cat":"mono","code":"M3","cube":"inkwell.cube","f":false,"v":["dramatic"]},{"id":"noir","label":"Noir","cat":"mono","code":"M4","cube":"noir.cube","f":true,"v":["dramatic"]},{"id":"cinema","label":"Cinema","cat":"cinematic","code":"X1","cube":"cinema.cube","f":true,"v":["dramatic","modern_upbeat"]},{"id":"golden","label":"Golden hour","cat":"warm","code":"W3","cube":"golden.cube","f":true,"v":["upbeat","modern_upbeat"]},{"id":"softskin","label":"Soft skin","cat":"portrait","code":"P3","cube":"softskin.cube","f":true,"v":["calm","neutral"]},{"id":"healthyglow","label":"Healthy glow","cat":"portrait","code":"P4","cube":"healthyglow.cube","f":false,"v":["calm","neutral"]},{"id":"porcelain","label":"Porcelain","cat":"portrait","code":"P5","cube":"porcelain.cube","f":false,"v":["calm","neutral"]},{"id":"bronze","label":"Bronze","cat":"portrait","code":"P6","cube":"bronze.cube","f":false,"v":["calm","neutral"]},{"id":"rosy","label":"Rosy","cat":"portrait","code":"P7","cube":"rosy.cube","f":false,"v":["calm","neutral"]},{"id":"matte","label":"Matte","cat":"portrait","code":"P8","cube":"matte.cube","f":false,"v":["calm","neutral"]},{"id":"kodachrome","label":"Kodachrome","cat":"film","code":"F8","cube":"kodachrome.cube","f":true,"v":["calm","modern_chill","neutral"]},{"id":"portra","label":"Portra","cat":"film","code":"F9","cube":"portra.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"ektar","label":"Ektar","cat":"film","code":"F10","cube":"ektar.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"cinestill","label":"Cinestill","cat":"film","code":"F11","cube":"cinestill.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"agfa","label":"Agfa","cat":"film","code":"F12","cube":"agfa.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"superia","label":"Superia","cat":"film","code":"F13","cube":"superia.cube","f":false,"v":["calm","modern_chill","neutral"]},{"id":"silver","label":"Silver","cat":"mono","code":"M5","cube":"silver.cube","f":false,"v":["dramatic"]},{"id":"charcoal","label":"Charcoal","cat":"mono","code":"M6","cube":"charcoal.cube","f":false,"v":["dramatic"]},{"id":"platinum","label":"Platinum","cat":"mono","code":"M7","cube":"platinum.cube","f":false,"v":["dramatic"]},{"id":"bluemono","label":"Blue mono","cat":"mono","code":"M8","cube":"bluemono.cube","f":false,"v":["dramatic"]},{"id":"sepiaprint","label":"Sepia print","cat":"mono","code":"M9","cube":"sepiaprint.cube","f":false,"v":["dramatic"]},{"id":"vhs","label":"VHS","cat":"retro","code":"R4","cube":"vhs.cube","f":true,"v":["modern_chill","upbeat"]},{"id":"eighties","label":"Eighties","cat":"retro","code":"R5","cube":"eighties.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"faded70s","label":"Faded 70s","cat":"retro","code":"R6","cube":"faded70s.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"polaroid","label":"Polaroid","cat":"retro","code":"R7","cube":"polaroid.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"camcorder","label":"Camcorder","cat":"retro","code":"R8","cube":"camcorder.cube","f":false,"v":["modern_chill","upbeat"]},{"id":"amber","label":"Amber","cat":"warm","code":"W4","cube":"amber.cube","f":false,"v":["upbeat","modern_upbeat"]},{"id":"sunset","label":"Sunset","cat":"warm","code":"W5","cube":"sunset.cube","f":false,"v":["upbeat","modern_upbeat"]},{"id":"honey","label":"Honey","cat":"warm","code":"W6","cube":"honey.cube","f":false,"v":["upbeat","modern_upbeat"]},{"id":"arctic","label":"Arctic","cat":"cool","code":"C3","cube":"arctic.cube","f":false,"v":["modern_chill","modern_upbeat"]},{"id":"teal","label":"Teal","cat":"cool","code":"C4","cube":"teal.cube","f":false,"v":["modern_chill","modern_upbeat"]},{"id":"moonlight","label":"Moonlight","cat":"cool","code":"C5","cube":"moonlight.cube","f":false,"v":["modern_chill","modern_upbeat"]},{"id":"verdant","label":"Verdant","cat":"landscape","code":"L1","cube":"verdant.cube","f":false,"v":["calm","neutral"]},{"id":"desert","label":"Desert","cat":"landscape","code":"L2","cube":"desert.cube","f":false,"v":["calm","neutral"]},{"id":"seaside","label":"Seaside","cat":"landscape","code":"L3","cube":"seaside.cube","f":false,"v":["calm","neutral"]},{"id":"alpine","label":"Alpine","cat":"landscape","code":"L4","cube":"alpine.cube","f":false,"v":["calm","neutral"]},{"id":"fresh","label":"Fresh","cat":"food","code":"D1","cube":"fresh.cube","f":false,"v":["upbeat"]},{"id":"rustic","label":"Rustic","cat":"food","code":"D2","cube":"rustic.cube","f":false,"v":["upbeat"]},{"id":"crisp","label":"Crisp","cat":"food","code":"D3","cube":"crisp.cube","f":false,"v":["upbeat"]},{"id":"neonnight","label":"Neon night","cat":"night","code":"N2","cube":"neonnight.cube","f":true,"v":["dramatic"]},{"id":"streetlight","label":"Streetlight","cat":"night","code":"N3","cube":"streetlight.cube","f":false,"v":["dramatic"]},{"id":"bluehour","label":"Blue hour","cat":"night","code":"N4","cube":"bluehour.cube","f":false,"v":["dramatic"]},{"id":"noirnight","label":"Noir night","cat":"night","code":"N5","cube":"noirnight.cube","f":false,"v":["dramatic"]},{"id":"tealorange","label":"Teal & orange","cat":"cinematic","code":"X2","cube":"tealorange.cube","f":true,"v":["dramatic","modern_upbeat"]},{"id":"blockbuster","label":"Blockbuster","cat":"cinematic","code":"X3","cube":"blockbuster.cube","f":false,"v":["dramatic","modern_upbeat"]},{"id":"bleach","label":"Bleach bypass","cat":"cinematic","code":"X4","cube":"bleach.cube","f":false,"v":["dramatic","modern_upbeat"]},{"id":"warmfilm","label":"Warm film","cat":"cinematic","code":"X5","cube":"warmfilm.cube","f":false,"v":["dramatic","modern_upbeat"]},{"id":"coldthriller","label":"Cold thriller","cat":"cinematic","code":"X6","cube":"coldthriller.cube","f":false,"v":["dramatic","modern_upbeat"]}]};
const CAPS = [{"id":"pop-clean","n":"Clean","sh":"Popular","w":3,"f":"DM Sans","px":72,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":4,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"pop-karaoke-gold","n":"Gold fill","sh":"Popular","w":3,"f":"Gabarito","px":80,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":4,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,200,0,1.00)","m":"KARAOKE","ls":0},{"id":"pop-active-yellow","n":"Yellow word","sh":"Popular","w":3,"f":"Manrope","px":78,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":4,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,239,0,1.00)","m":"ACTIVE_WORD_COLOUR","ls":0},{"id":"pop-pop","n":"Big word","sh":"Popular","w":2,"f":"Unbounded","px":70,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":5,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,239,0,1.00)","m":"POP","ls":0},{"id":"pop-box","n":"Box","sh":"Popular","w":4,"f":"DM Sans","px":66,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,0.62)","ow":14,"box":true,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"pop-green","n":"Green word","sh":"Popular","w":3,"f":"Space Grotesk","px":76,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":4,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(76,216,96,1.00)","m":"ACTIVE_WORD_COLOUR","ls":0},{"id":"simple-white","n":"White","sh":"Simple","w":5,"f":"DM Sans","px":60,"b":false,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":3,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"simple-shadow","n":"Shadow","sh":"Simple","w":5,"f":"Manrope","px":62,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":0,"box":false,"al":2,"mv":420,"sd":4,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"simple-serif","n":"Serif","sh":"Simple","w":4,"f":"Playfair Display","px":66,"b":false,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":2,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"simple-editorial","n":"Editorial","sh":"Simple","w":4,"f":"Instrument Serif","px":74,"b":false,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":2,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"simple-soft-box","n":"Soft box","sh":"Simple","w":6,"f":"Manrope","px":56,"b":false,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,0.62)","ow":12,"box":true,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"simple-low","n":"Low","sh":"Simple","w":5,"f":"DM Sans","px":58,"b":false,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":3,"box":false,"al":2,"mv":180,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"words-one","n":"One word","sh":"Words","w":1,"f":"Gabarito","px":110,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":6,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"words-one-gold","n":"Gold word","sh":"Words","w":1,"f":"Gabarito","px":110,"b":true,"i":false,"up":false,"c":"rgba(255,200,0,1.00)","o":"rgba(0,0,0,1.00)","ow":6,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"words-two-pop","n":"Two big","sh":"Words","w":2,"f":"Unbounded","px":92,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":6,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,239,0,1.00)","m":"POP","ls":0},{"id":"words-caps","n":"Caps","sh":"Words","w":1,"f":"Anton","px":118,"b":false,"i":false,"up":true,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":5,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"words-red-box","n":"Red box","sh":"Words","w":1,"f":"DM Sans","px":96,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(232,60,60,1.00)","ow":16,"box":true,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"words-middle","n":"Middle","sh":"Words","w":1,"f":"Bricolage Grotesque","px":104,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":6,"box":false,"al":5,"mv":0,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"bold-anton","n":"Anton","sh":"Bold","w":3,"f":"Anton","px":96,"b":false,"i":false,"up":true,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":5,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,239,0,1.00)","m":"ACTIVE_WORD_COLOUR","ls":0},{"id":"bold-unbounded","n":"Unbounded","sh":"Bold","w":2,"f":"Unbounded","px":80,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":6,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,90,180,1.00)","m":"KARAOKE","ls":0},{"id":"bold-blue","n":"Blue","sh":"Bold","w":2,"f":"Gabarito","px":90,"b":true,"i":false,"up":false,"c":"rgba(60,161,249,1.00)","o":"rgba(0,0,0,1.00)","ow":6,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"bold-sapphire-box","n":"Sapphire box","sh":"Bold","w":3,"f":"Space Grotesk","px":84,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(15,82,186,1.00)","ow":16,"box":true,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"bold-black-yellow","n":"Black & yellow","sh":"Bold","w":2,"f":"Bricolage Grotesque","px":88,"b":true,"i":false,"up":false,"c":"rgba(255,239,0,1.00)","o":"rgba(0,0,0,1.00)","ow":8,"box":false,"al":2,"mv":420,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"bold-top","n":"Top","sh":"Bold","w":2,"f":"Anton","px":100,"b":false,"i":false,"up":true,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":5,"box":false,"al":8,"mv":300,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"x-newsline","n":"Newsline","sh":"New","w":6,"f":"Space Grotesk","px":60,"b":false,"i":false,"up":true,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":18,"box":true,"al":2,"mv":300,"sd":0,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":6},{"id":"x-marker","n":"Marker","sh":"New","w":3,"f":"Manrope","px":70,"b":true,"i":false,"up":false,"c":"rgba(0,0,0,1.00)","o":"rgba(255,239,0,1.00)","ow":10,"box":true,"al":2,"mv":420,"sd":0,"a":"rgba(255,255,255,1.00)","m":"ACTIVE_WORD_COLOUR","ls":0},{"id":"x-headline","n":"Headline","sh":"New","w":2,"f":"Anton","px":112,"b":false,"i":false,"up":true,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":0,"box":false,"al":8,"mv":240,"sd":10,"a":"rgba(232,60,60,1.00)","m":"KARAOKE","ls":0},{"id":"x-quiet","n":"Quiet","sh":"New","w":7,"f":"Instrument Serif","px":68,"b":false,"i":true,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(0,0,0,1.00)","ow":0,"box":false,"al":2,"mv":180,"sd":3,"a":"rgba(255,215,0,1.00)","m":"NONE","ls":0},{"id":"x-centre","n":"Centre stage","sh":"New","w":1,"f":"Unbounded","px":96,"b":true,"i":false,"up":false,"c":"rgba(255,239,0,1.00)","o":"rgba(0,0,0,1.00)","ow":10,"box":false,"al":5,"mv":0,"sd":0,"a":"rgba(255,255,255,1.00)","m":"POP","ls":0},{"id":"x-twotone","n":"Two tone","sh":"New","w":2,"f":"Bricolage Grotesque","px":84,"b":true,"i":false,"up":false,"c":"rgba(255,255,255,1.00)","o":"rgba(15,82,186,1.00)","ow":8,"box":false,"al":2,"mv":520,"sd":4,"a":"rgba(255,90,180,1.00)","m":"ACTIVE_WORD_COLOUR","ls":0}];
(() => {
  const I = window.I18N, t = s => I.t(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const LETTER_FAM = Object.fromEntries(LOOKS.cats.map(c => [c[0], c[1]]));
  const byId = Object.fromEntries(LOOKS.looks.map((l, i) => [l.id, { ...l, i }]));
  const capById = Object.fromEntries(CAPS.map(c => [c.id, c]));

  /* ---------- captions that follow a video, word by word ---------- */
  function liveCaptions() {
    $$('.live-cc[data-video]').forEach(el => {
      if (!el.dataset.en) el.dataset.en = el.dataset.words;
      const enWords = el.dataset.en.split('|').join(' ');
      const words = t(enWords.replace('She’s', 'She’s')).split(' ');
      el.innerHTML = words.map(w => `<span>${w}</span>`).join(' ');
      const spans = [...el.children], host = el.closest('.frame, .art, .f-tt, .f-yt') || el.parentElement;
      const v = host.querySelector('video'), bar = host.querySelector('.yt-bar');
      if (!v) return;
      const tick = () => {
        const p = v.duration ? v.currentTime / v.duration : 0, n = Math.min(words.length - 1, Math.floor(p * (words.length + 1)));
        spans.forEach((s, i) => { s.classList.toggle('on', i === n); s.classList.toggle('wait', i > n); });
        if (bar) bar.style.setProperty('--p', p.toFixed(3));
      };
      v.ontimeupdate = tick; tick();
      if (reduce) { v.removeAttribute('autoplay'); v.pause(); spans.forEach(s => s.classList.remove('wait')); }
    });
  }

  /* ---------- caption look renderer: the app's real style values on a 1080-wide canvas ---------- */
  function capStyle(c, k, persian) {
    const f = persian ? `'Vazirmatn', sans-serif` : `'${c.f}', sans-serif`;
    let css = `font-family:${f};font-weight:${c.b || persian ? 800 : 400};font-size:${(c.px * k).toFixed(1)}px;line-height:1.12;color:${c.c};`;
    if (c.i) css += 'font-style:italic;';
    if (c.up && !persian) css += 'text-transform:uppercase;';
    if (c.ls && !persian) css += `letter-spacing:${(c.ls * k).toFixed(1)}px;`;
    if (!c.box && c.ow > 0) css += `-webkit-text-stroke:${(c.ow * 2 * k).toFixed(1)}px ${c.o};paint-order:stroke fill;`;
    if (c.sd > 0) css += `text-shadow:0 ${(c.sd * k).toFixed(1)}px ${(c.sd * 2.5 * k).toFixed(1)}px rgba(0,0,0,.65);`;
    return css;
  }
  function capLine(c, words, active, k, persian) {
    return words.map((w, i) => {
      let st = '';
      const on = c.m === 'KARAOKE' ? i <= active : i === active;
      if (c.m !== 'NONE' && on) st += `color:${c.a};`;
      if (c.m === 'POP' && i === active) st += 'transform:scale(1.14);';
      if (c.box) st += `background:${c.o};padding:${(c.ow * .55 * k).toFixed(1)}px ${(c.ow * 1.1 * k).toFixed(1)}px;border-radius:${(6 * k).toFixed(1)}px;margin:${(2 * k).toFixed(1)}px 0;`;
      return `<span class="wd${c.box ? ' boxed' : ''}" style="${st}">${w}</span>`;
    }).join(c.box ? '' : ' ');
  }
  function placeLine(line, c, k, H) {
    const mv = c.mv * k * (1350 / 1920) * .9;
    line.style.top = line.style.bottom = line.style.transform = '';
    if (c.al === 5) { line.style.top = '50%'; line.style.transform = 'translateY(-50%)'; }
    else if (c.al === 8) line.style.top = `${Math.max(mv, 18)}px`;
    else line.style.bottom = `${Math.max(mv, 18)}px`;
  }

  /* ---------- motion explainer ---------- */
  const mx = $('#mx');
  if (mx) {
    const SCENES = [3200, 3800, 5400, 5600, 4200, 4600];
    const TITLES = { 1: 'One idea.', 2: 'Becomes a script.', 3: 'The script builds <em>every format</em>.', 4: 'Shuffle the look.', 5: 'Out to every channel.', 6: 'One idea in. <em>Every channel</em> out.' };
    const title = $('#mxTitle'), segs = $$('#mxSeg button'), playBtn = $('#mxPlay'), icon = $('#mxPlayIcon');
    const chipsHost = $('#mxChips'), reel = $('.mx-f.reel video', mx);
    const PLAN = { pst: 'h', car: 'hba', stry: 'hb', reel: 'hba', voice: 'ba' };
    chipsHost.innerHTML = Object.entries(PLAN).map(([f, ks]) => [...ks].map((k, i) => `<span class="el brick ${k}" data-f="${f}" data-k="${k}" data-n="${i}" data-of="${ks.length}"></span>`).join('')).join('');
    const chips = $$('.brick', chipsHost);
    const LABEL = { h: 'Hook', b: 'Body', a: 'Ask' };
    const chipText = () => chips.forEach(c => c.textContent = t(LABEL[c.dataset.k]));
    let scene = 6, playing = false, t0 = 0, raf = 0, timer = 0, shufTimer = 0, visible = false;

    const setNarrow = () => mx.classList.toggle('narrow', mx.clientWidth < 640);
    new ResizeObserver(setNarrow).observe(mx); setNarrow();

    function renderTitle(n) {
      const key = 'html:mx' + n, raw = I.lang === 'en' ? TITLES[n] : (I.dict[key] || [])[I.lang === 'de' ? 0 : 1] || TITLES[n];
      const box = document.createElement('div'); box.innerHTML = raw; let i = 0;
      const wrap = txt => txt.split(/(\s+)/).map(w => w.trim() ? `<span class="w"><span style="--i:${i++}">${w}</span></span>` : w).join('');
      title.innerHTML = [...box.childNodes].map(nd => nd.nodeType === 3 ? wrap(nd.nodeValue) : `<em>${wrap(nd.textContent)}</em>`).join('');
    }
    const u = () => mx.clientWidth / 100;
    function cssNum(el, v) { return parseFloat(getComputedStyle(el).getPropertyValue(v)) || 0; }
    function chipsFromScript() {
      const sr = mx.getBoundingClientRect(), rtl = document.documentElement.dir === 'rtl', U = u();
      const narrow = mx.classList.contains('narrow'), cw = narrow ? 8 : 3.6;
      chips.forEach(c => {
        const b = $(`.mx-script .blk.${c.dataset.k}`, mx).getBoundingClientRect();
        const x = rtl ? (sr.right - b.right) / U : (b.left - sr.left) / U;
        c.style.transition = 'none';
        c.style.setProperty('--x', x.toFixed(2)); c.style.setProperty('--y', ((b.top - sr.top) / U).toFixed(2));
        c.style.setProperty('--s', ((b.width / U) / cw).toFixed(3)); c.style.setProperty('--o', 1);
      });
      void mx.offsetWidth;
      chips.forEach(c => c.style.transition = '');
    }
    function chipsToFormats() {
      const U = u(), narrow = mx.classList.contains('narrow');
      const cw = narrow ? 8 : 3.6, ch = narrow ? 3.4 : 1.5, gap = narrow ? .8 : .35;
      chips.forEach((c, idx) => {
        const f = $(`.mx-f.${c.dataset.f}`, mx), fx = cssNum(f, '--x'), fy = cssNum(f, '--y'), fs = cssNum(f, '--s') || 1;
        const W = f.offsetWidth / U, r = parseFloat(f.dataset.r), n = +c.dataset.n, of = +c.dataset.of;
        const row = of * cw + (of - 1) * gap;
        c.style.setProperty('--x', (fx + ((W - row) / 2 + n * (cw + gap)) * fs).toFixed(2));
        c.style.setProperty('--y', (fy + ((narrow ? 2 : .9) + (c.dataset.f === 'stry' ? (narrow ? 3 : 1.4) : 0)) * fs).toFixed(2));
        c.style.setProperty('--s', fs); c.style.setProperty('--d', idx);
      });
    }
    function chipsHide() { chips.forEach(c => c.style.setProperty('--o', 0)); }

    const SHUF = ['kodachrome', 'noir', 'golden', 'neonnight', 'tealorange', 'vhs', 'softskin', 'arctic', 'bleach', 'polaroid'];
    const SHUF_CAPS = ['pop-karaoke-gold', 'words-caps', 'pop-pop', 'x-marker', 'simple-editorial', 'bold-sapphire-box', 'x-twotone', 'bold-black-yellow'];
    function shuffleTick(i) {
      const l = byId[SHUF[i % SHUF.length]], c = capById[SHUF_CAPS[i % SHUF_CAPS.length]];
      $('#mxShufImg').src = `assets/shuffle/${l.id}.jpg`;
      $('#mxCode').textContent = l.code; $('#mxName').textContent = l.label; $('#mxCapName').textContent = t(c.n);
      const cap = $('#mxShufCap'), frameW = cap.parentElement.clientWidth, k = frameW / 1080, words = t("She's not smiling at you.").split(' ');
      cap.setAttribute('style', capStyle(c, k * .9, I.lang === 'fa'));
      cap.innerHTML = capLine(c, words, i % words.length, k * .9, I.lang === 'fa');
      const b = $('#mxShufBtn'); b.classList.add('press'); setTimeout(() => b.classList.remove('press'), 160);
    }

    function enter(n) {
      clearInterval(shufTimer);
      if (n === 3) chipsFromScript();
      mx.dataset.s = n; scene = n; renderTitle(n);
      if (n === 3) requestAnimationFrame(() => requestAnimationFrame(chipsToFormats)); else chipsHide();
      if (n === 4) { let i = 0; shuffleTick(i++); if (playing) shufTimer = setInterval(() => shuffleTick(i++), 620); }
      if (reel) { (n === 3 || n === 5) && playing ? reel.play().catch(() => {}) : reel.pause(); }
      segs.forEach((s, i) => s.classList.toggle('on', i === n - 1));
    }
    function loop() {
      if (!playing) return;
      const el = performance.now() - t0, d = SCENES[scene - 1];
      segs.forEach((s, i) => s.querySelector('i').style.setProperty('--f', i < scene - 1 ? 1 : i === scene - 1 ? Math.min(1, el / d).toFixed(3) : 0));
      if (el >= d) { t0 = performance.now(); enter(scene % 6 + 1); }
      raf = requestAnimationFrame(loop);
    }
    function play() { if (playing) return; playing = true; mx.dataset.playing = 1; t0 = performance.now(); enter(scene); loop(); icon.setAttribute('d', 'M7 5h4v14H7zM13 5h4v14h-4z'); playBtn.setAttribute('aria-label', t('Pause')); }
    function pause() { playing = false; mx.dataset.playing = 0; cancelAnimationFrame(raf); clearInterval(shufTimer); reel && reel.pause(); icon.setAttribute('d', 'M8 5v14l11-7z'); playBtn.setAttribute('aria-label', t('Play')); }
    playBtn.addEventListener('click', () => playing ? pause() : play());
    segs.forEach((s, i) => s.addEventListener('click', () => { t0 = performance.now(); enter(i + 1); segs.forEach((x, j) => x.querySelector('i').style.setProperty('--f', j < i ? 1 : 0)); }));
    chipText(); renderTitle(6); segs[5].classList.add('on'); segs.forEach(s => s.querySelector('i').style.setProperty('--f', 1));
    pause();
    if (!reduce) new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !mx.dataset.started) { mx.dataset.started = 1; scene = 1; play(); }
      else if (!visible && playing) { pause(); mx.dataset.resume = 1; }
      else if (visible && mx.dataset.resume) { delete mx.dataset.resume; play(); }
    }, { threshold: .35 }).observe(mx);
    document.addEventListener('langchange', () => { chipText(); renderTitle(scene); if (scene === 4) shuffleTick(0); playBtn.setAttribute('aria-label', t(playing ? 'Pause' : 'Play')); });
  }

  /* ---------- Post studio ---------- */
  const canvas = $('#psCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const PHOTOS = [
      ['mona', "She's not smiling at you."], ['pearl', 'The pearl is probably not a pearl.'], ['agnew', 'Painted in one sitting. Still judging you.'],
      ['hammersley', 'Main character energy, 1892.'], ['velata', 'Raphael’s girlfriend, probably.'], ['shepherd', 'POV: you skipped art class.'],
      ['coffee', 'Why our flat white tastes better at 9am.'], ['chelsea', 'Taste-tested by Chelsea.'] ];
    Object.assign(I.dict, {
      'Painted in one sitting. Still judging you.': ['In einer Sitzung gemalt. Urteilt immer noch über dich.', 'تو یه جلسه کشیده شد. هنوز داره قضاوتت می‌کنه.'],
      'Main character energy, 1892.': ['Hauptfiguren-Energie, 1892.', 'انرژی شخصیت اصلی، ۱۸۹۲.'],
      'Raphael’s girlfriend, probably.': ['Raffaels Freundin, vermutlich.', 'احتمالاً دوست‌دختر رافائل.'],
      'POV: you skipped art class.': ['POV: Du hast Kunst geschwänzt.', 'وقتی کلاس هنر رو پیچوندی.'],
      'Why our flat white tastes better at 9am.': ['Warum unser Flat White um 9 Uhr besser schmeckt.', 'چرا فلت‌وایت ما ساعت ۹ صبح خوشمزه‌تره.'],
      'Taste-tested by Chelsea.': ['Getestet von Chelsea.', 'تست‌شده توسط چلسی.'],
      'Mona Lisa, Leonardo': ['Mona Lisa, Leonardo', 'مونالیزا، لئوناردو'], 'Girl with a Pearl Earring, Vermeer': ['Das Mädchen mit dem Perlenohrgehänge, Vermeer', 'دختری با گوشواره‌ی مروارید، ورمیر'],
      'Lady Agnew, Sargent': ['Lady Agnew, Sargent', 'لیدی اگنیو، سارجنت'], 'Mrs Hammersley, Sargent': ['Mrs Hammersley, Sargent', 'خانم همرزلی، سارجنت'],
      'La Velata, Raphael': ['La Velata, Raffael', 'لاولاتا، رافائل'], 'A shepherd girl, Bouguereau': ['Ein Hirtenmädchen, Bouguereau', 'دختر چوپان، بوگرو'],
      'A flat white, CC0 photo': ['Ein Flat White, CC0-Foto', 'یه فلت‌وایت، عکس CC0'], 'Chelsea the cat, CC0 photo': ['Chelsea, die Katze, CC0-Foto', 'چلسی گربه، عکس CC0'],
      'Shuffling': ['Ich mische', 'دارم می‌چینم'],
    });
    const ALT = { mona: 'Mona Lisa, Leonardo', pearl: 'Girl with a Pearl Earring, Vermeer', agnew: 'Lady Agnew, Sargent', hammersley: 'Mrs Hammersley, Sargent',
      velata: 'La Velata, Raphael', shepherd: 'A shepherd girl, Bouguereau', coffee: 'A flat white, CC0 photo', chelsea: 'Chelsea the cat, CC0 photo' };
    const RECIPES = [['Film Glow', 'portra', 85], ['Y2K Flash', 'cool', 60], ['Teal & Orange', 'tealorange', 90], ['Soft Portrait', 'softskin', 80], ['Moody Natural', 'matte', 70],
      ['Golden Hour', 'golden', 85], ['Photo Dump', 'faded70s', 75], ['Mono Classic', 'silver', 100], ['Food Pop', 'fresh', 80], ['Night Neon', 'neonnight', 85]];
    const st = { photo: 'mona', hook: PHOTOS[0][1], look: 'tealorange', strength: 100, cap: 'pop-karaoke-gold', fam: 'suggested', shelf: 'Popular', recipe: null, word: 0 };
    const cubes = {}, bases = {}, graded = {};
    const worker = $('#worker'), wl = $('#workerLine');
    const say = (line, busy) => { wl.textContent = t(line); worker.classList.toggle('busy', !!busy); worker.classList.toggle('done', !busy); };
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

    async function cube(file) {
      if (cubes[file]) return cubes[file];
      const txt = await (await fetch('assets/looks/' + file)).text();
      let N = 0; const d = [];
      for (const line of txt.split('\n')) { const l = line.trim(); if (!l || l[0] === '#') continue;
        if (l.startsWith('LUT_3D_SIZE')) { N = +l.split(/\s+/)[1]; continue; } if (/^[A-Z_]/.test(l)) continue;
        const p = l.split(/\s+/); if (p.length === 3) d.push(+p[0], +p[1], +p[2]); }
      return (cubes[file] = { N, d: new Float32Array(d) });
    }
    function cover(img) {
      const c = mk(W, H), g = c.getContext('2d'), s = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
      g.drawImage(img, (W - w) / 2, (H - h) * .3, w, h); return c;
    }
    async function base(key) {
      if (bases[key]) return bases[key];
      const img = new Image(); img.src = `assets/${key}.jpg`; await img.decode(); return (bases[key] = cover(img));
    }
    function grade(srcC, { N, d }) {
      const g = srcC.getContext('2d'), im = g.getImageData(0, 0, W, H), p = im.data, M = N - 1, out = mk(W, H);
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i] / 255 * M, gg = p[i + 1] / 255 * M, b = p[i + 2] / 255 * M, r0 = r | 0, g0 = gg | 0, b0 = b | 0;
        const r1 = Math.min(r0 + 1, M), g1 = Math.min(g0 + 1, M), b1 = Math.min(b0 + 1, M), fr = r - r0, fg = gg - g0, fb = b - b0;
        for (let c = 0; c < 3; c++) {
          const at = (R, G, B) => d[(R + G * N + B * N * N) * 3 + c];
          const c00 = at(r0, g0, b0) * (1 - fr) + at(r1, g0, b0) * fr, c10 = at(r0, g1, b0) * (1 - fr) + at(r1, g1, b0) * fr;
          const c01 = at(r0, g0, b1) * (1 - fr) + at(r1, g0, b1) * fr, c11 = at(r0, g1, b1) * (1 - fr) + at(r1, g1, b1) * fr;
          p[i + c] = ((c00 * (1 - fg) + c10 * fg) * (1 - fb) + (c01 * (1 - fg) + c11 * fg) * fb) * 255;
        }
      }
      out.getContext('2d').putImageData(im, 0, 0); return out;
    }
    let run = 0;
    async function render() {
      const my = ++run, key = st.photo + '|' + st.look;
      try {
        const b = await base(st.photo);
        if (st.look !== 'none' && !graded[key]) { say('Grading the light', true); await new Promise(r => setTimeout(r, 20)); graded[key] = grade(b, await cube(byId[st.look].cube)); }
        if (my !== run) return;
        ctx.globalAlpha = 1; ctx.drawImage(b, 0, 0);
        if (st.look !== 'none') { ctx.globalAlpha = st.strength / 100; ctx.drawImage(graded[key], 0, 0); ctx.globalAlpha = 1; }
        say('Your look is ready', false);
      } catch (e) { say('That photo could not be opened. Try another.', false); }
      meta();
    }
    function meta() {
      const l = byId[st.look];
      $('#psCode').textContent = l ? l.code : '0'; $('#psName').textContent = l ? l.label : t('Original'); $('#psCapName').textContent = t(capById[st.cap].n);
      $('#psStrengthOut').textContent = I.digits(st.strength);
    }
    const capBox = $('#psCap'), stage = $('#psStage');
    function drawCaption() {
      const c = capById[st.cap], persian = I.lang === 'fa', k = stage.clientWidth / 1080;
      const words = t(st.hook).split(' '), chunk = Math.max(1, c.w), nChunks = Math.ceil(words.length / chunk);
      const ci = Math.floor(st.word / chunk) % nChunks, part = words.slice(ci * chunk, ci * chunk + chunk), active = st.word % chunk;
      capBox.innerHTML = `<div class="line" style="${capStyle(c, k, persian)}">${capLine(c, part, Math.min(active, part.length - 1), k, persian)}</div>`;
      placeLine(capBox.firstChild, c, k, stage.clientHeight);
    }
    let capTimer = 0, onScreen = false;
    function capLoop() { clearInterval(capTimer); if (reduce) return drawCaption(); capTimer = setInterval(() => { if (!onScreen) return; st.word = (st.word + 1) % t(st.hook).split(' ').length; drawCaption(); }, 420); }
    new IntersectionObserver(([e]) => onScreen = e.isIntersecting).observe(stage);
    new ResizeObserver(drawCaption).observe(stage);

    // Photos
    const photosEl = $('#psPhotos');
    function photos() {
      photosEl.innerHTML = PHOTOS.map(([k]) => `<button type="button" class="ptile${st.photo === k ? ' on' : ''}" data-p="${k}" aria-label="${t(ALT[k])}"><img src="assets/${k}.jpg" alt=""></button>`).join('')
        + `<label class="ptile up${st.photo === 'own' ? ' on' : ''}">${t('Your photo')}<input type="file" id="psOwn" accept="image/*"></label>`;
      $('#psOwn').addEventListener('change', async e => {
        const f = e.target.files && e.target.files[0]; if (!f) return; say('Reading your photo', true);
        try { const img = new Image(); img.src = URL.createObjectURL(f); await img.decode(); bases.own = cover(img);
          Object.keys(graded).filter(k => k.startsWith('own|')).forEach(k => delete graded[k]);
          st.photo = 'own'; st.hook = 'Your page, your look.'; st.word = 0; photos(); render(); drawCaption();
        } catch (err) { say('That photo could not be opened. Try another.', false); }
      });
    }
    photosEl.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return;
      st.photo = b.dataset.p; st.hook = PHOTOS.find(p => p[0] === st.photo)[1]; st.word = 0; photos(); render(); drawCaption(); });

    // Recipes
    const recEl = $('#psRecipes');
    function recipes() { recEl.innerHTML = RECIPES.map(([n, id, s]) => `<button type="button" class="${st.recipe === n ? 'on' : ''}" data-r="${n}">${n}<small>${byId[id].code} · ${I.digits(s)}</small></button>`).join(''); }
    recEl.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; const r = RECIPES.find(x => x[0] === b.dataset.r);
      st.recipe = r[0]; st.look = r[1]; st.strength = r[2]; $('#psStrength').value = r[2]; recipes(); looksRow(); render(); });

    // Look families and tiles
    const famEl = $('#psFam'), looksEl = $('#psLooks');
    function fams() {
      const list = [['suggested', 'Suggested'], ['all', 'All'], ...LOOKS.cats.map(c => [c[0], c[1]])];
      famEl.innerHTML = list.map(([id, lab]) => `<button type="button" class="${st.fam === id ? 'on' : ''}" data-fam="${id}">${t(lab)}</button>`).join('');
    }
    famEl.addEventListener('click', e => { const b = e.target.closest('[data-fam]'); if (!b) return; st.fam = b.dataset.fam; fams(); looksRow(); });
    function looksRow() {
      const all = LOOKS.looks.map((l, i) => ({ ...l, i }));
      const list = st.fam === 'suggested' ? all.filter(l => l.f).slice(0, 6) : st.fam === 'all' ? all : all.filter(l => l.cat === st.fam);
      const tile = l => `<button type="button" class="ltile${st.look === l.id ? ' on' : ''}" data-l="${l.id}" aria-label="${l.code} ${l.label}"><i data-code="${l.code}" style="background-position:-${(l.i % 10) * 64}px -${Math.floor(l.i / 10) * 80}px"></i><span>${l.label}</span></button>`;
      looksEl.innerHTML = `<button type="button" class="ltile orig${st.look === 'none' ? ' on' : ''}" data-l="none"><i></i><span>${t('Original')}</span></button>` + list.map(tile).join('');
    }
    looksEl.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; st.look = b.dataset.l; st.recipe = null; recipes(); looksRow(); render(); });
    $('#psStrength').addEventListener('input', e => { st.strength = +e.target.value; render(); });

    // Caption looks
    const shelfEl = $('#psShelf'), capsEl = $('#psCaps');
    function shelves() { shelfEl.innerHTML = ['Popular', 'Simple', 'Words', 'Bold', 'New'].map(s => `<button type="button" class="${st.shelf === s ? 'on' : ''}" data-sh="${s}">${t(s)}</button>`).join(''); }
    shelfEl.addEventListener('click', e => { const b = e.target.closest('[data-sh]'); if (!b) return; st.shelf = b.dataset.sh; shelves(); capsRow(); });
    function capsRow() {
      const persian = I.lang === 'fa', sample = persian ? 'سلام' : 'Aa';
      capsEl.innerHTML = CAPS.filter(c => c.sh === st.shelf).map(c => {
        const k = .3, inner = c.box ? `<span style="background:${c.o};padding:2px 6px;border-radius:3px">${sample}</span>` : sample;
        return `<button type="button" class="ctile${st.cap === c.id ? ' on' : ''}" data-c="${c.id}" aria-label="${t(c.n)}"><span class="s" style="${capStyle({ ...c, px: Math.min(c.px, 96) }, k, persian)}${c.m !== 'NONE' ? 'color:' + c.a + ';' : ''}">${inner}</span><span class="n">${t(c.n)}</span></button>`;
      }).join('');
    }
    capsEl.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; st.cap = b.dataset.c; st.word = 0; capsRow(); drawCaption(); meta(); });

    // Shuffle: a new look, strength and caption look, as the app's Shuffle re-rolls a seed
    $('#psShuffle').addEventListener('click', () => {
      const pick = a => a[Math.floor(Math.random() * a.length)];
      let l; do { l = pick(LOOKS.looks); } while (l.id === st.look);
      let c; do { c = pick(CAPS); } while (c.id === st.cap);
      Object.assign(st, { look: l.id, strength: 65 + 5 * Math.floor(Math.random() * 8), cap: c.id, shelf: c.sh, fam: l.cat, recipe: null, word: 0 });
      $('#psStrength').value = st.strength; say('Shuffling', true);
      fams(); looksRow(); shelves(); capsRow(); recipes(); drawCaption(); render();
    });

    const all = () => { photos(); recipes(); fams(); looksRow(); shelves(); capsRow(); drawCaption(); meta(); };
    all(); render(); capLoop();
    document.addEventListener('langchange', all);
  }

  /* ---------- Diw's live lines ---------- */
  const tick = $('#ticker');
  if (tick) {
    const LINES = ['Opening the video', 'Sending the audio', 'Listening word by word', 'Burning the captions in', 'Rendering your video', 'Your video is ready · Open'];
    const en = $('#tickEn'), second = $('#tickFa'), bar = $('#tickBar'), step = $('#tickStep');
    let k = 0, live = false;
    new IntersectionObserver(([e]) => live = e.isIntersecting).observe(tick);
    const show = () => {
      en.classList.add('out');
      setTimeout(() => {
        en.textContent = t(LINES[k]);
        const other = I.lang === 'fa' ? 'en' : 'fa';
        second.textContent = I.t(LINES[k], other); second.lang = other; second.dir = other === 'fa' ? 'rtl' : 'ltr';
        en.classList.remove('out'); bar.style.setProperty('--f', ((k + 1) / LINES.length).toFixed(2));
        step.textContent = I.tf('Step {n} of {t}', { n: I.digits(k + 1), t: I.digits(LINES.length) });
        $('#tickJob').textContent = t('Your reel');
      }, reduce ? 0 : 260);
    };
    show(); setInterval(() => { if (!live) return; k = (k + 1) % LINES.length; show(); }, 2300);
    document.addEventListener('langchange', show);
  }

  /* ---------- Who it's for ---------- */
  const grid = $('#whoGrid');
  if (grid && window.PERSONAS) {
    const draw = () => {
      const lang = I.lang;
      grid.innerHTML = PERSONAS.map(p => { const L = p[lang] || p.en;
        return `<a class="who-card" href="usecases.html#${p.id}"><div class="vis">${personaSlide(p, L, 'cover')}</div><h3>${L.name}</h3><p>${L.line}</p><div class="tags">${L.tags.map(x => `<span>${x}</span>`).join('')}</div></a>`; }).join('');
    };
    draw(); document.addEventListener('langchange', draw);
  }

  liveCaptions();
  document.addEventListener('langchange', liveCaptions);
})();
