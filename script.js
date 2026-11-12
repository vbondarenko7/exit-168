// ---- language: the Russian edition lives in /ru/ and shares this script ----
const ru = document.documentElement.lang === 'ru';
const t = (en, russian) => ru ? russian : en;
// Photo paths are relative to this script (the site root), so /ru/ finds them too.
const asset = path => new URL(path, document.currentScript.src).href;
// A switch click is a choice: remember it, so the root page stops redirecting by browser language.
document.querySelectorAll('.lang a').forEach(a => a.addEventListener('click', () => {
  try { localStorage.setItem('lang', a.hreflang); } catch {}
  a.hash = location.hash;
}));

// ---- navigation ----
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  menuButton.setAttribute('aria-label', open ? t("Close menu", 'Закрыть меню') : t("Open menu", 'Открыть меню'));
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
menu.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); menuButton.focus(); } });

// ---- photographs ----
// The video's poster is a picture like any other: it loads when the video comes near, not with the first screen.
const clip = document.querySelector('video[data-poster]');
if (clip) new IntersectionObserver(([e], io) => { if (e.isIntersecting) { clip.poster = clip.dataset.poster; io.disconnect(); } }, { rootMargin: '1500px' }).observe(clip);
const photos = [
  ['stove', 'assets/img/stove-1600.webp', "The sauna stove", 'Дровяная печь в бане'],
  ['sauna', 'assets/img/sauna-1600.webp', "Inside the sauna, two tiers of benches", 'Полок в бане'],
  ['deck', 'assets/img/deck-1440.webp', "The deck above the swimming hole", 'Терраса у бани, над заводью'],
  ['sauna-outside', 'assets/img/sauna-outside-1440.webp', "The sauna from outside, by the road and the bridge", 'Баня с дороги: белый вагончик у реки и моста'],
  ['river', 'assets/img/river-1440.webp', "Steps into the swimming hole", 'Заводь под террасой и ступеньки к воде'],
  ['cabin', 'assets/img/cabin-1400.webp', "The cabin from the road", 'Дом со стороны дороги'],
  ['greatroom', 'assets/img/greatroom-1440.webp', "The living room", 'Гостиная: диван, настольный футбол и дровяная печь'],
  ['living', 'assets/img/living-1440.webp', "The living room from the other side", 'Гостиная с другой стороны'],
  ['dining', 'assets/img/dining-1440.webp', "The carved dining table", 'Обеденный стол в доме'],
  ['kitchen', 'assets/img/kitchen-1440.webp', "The kitchen", 'Кухня'],
  ['bunkroom', 'assets/img/bunkroom-1440.webp', "Bunk room with the hand-built triple bunk", 'Комната с трёхъярусной кроватью'],
  ['bedroom', 'assets/img/bedroom-1440.webp', "Bedroom with a bunk bed and one more bed", 'Спальня: двухъярусная кровать и ещё одна'],
  ['loft', 'assets/img/loft-1440.webp', "The sleeping loft", 'Кровать в мансарде'],
  ['bathroom', 'assets/img/bathroom-1440.webp', "The bathroom", 'Санузел в доме'],
  ['gate', 'assets/img/gate-1440.webp', "The gate", 'Ворота участка'],
  ['winter-night', 'assets/img/winter-night-1350.webp', "Winter night at the cabin", 'Дом под снегом ночью'],
  ['winter-river', 'assets/img/winter-river-1500.webp', "The South Yuba in winter", 'Река между сугробами'],
  ['winter-cabin', 'assets/img/winter-cabin-1600.webp', "Snowmobile track to the cabin", 'Дом зимой, к двери ведёт след снегохода'],
  ['winter-trench', 'assets/img/winter-trench-941.webp', "The path dug to the door", 'Тропа к двери дома, прокопанная в снегу'],
  ['winter-mountain', 'assets/img/winter-mountain-1600.webp', "The river below a snowy ridge", 'Река под заснеженным хребтом'],
].map(([name, src, en, russian]) => [name, asset(src), t(en, russian)]);
const photoDialog = document.querySelector('#photo-dialog');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxAvif = document.querySelector('#lightbox-avif');
let photoIndex = 0;
// The picture is hidden until its own file has arrived, so a slow link never shows the last photo under a new caption.
lightboxImage.addEventListener('load', () => { lightboxImage.style.opacity = ''; });
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const [, src, caption] = photos[photoIndex];
  if (lightboxImage.src !== src) { lightboxImage.style.opacity = 0; lightboxAvif.srcset = src.replace('.webp', '.avif'); lightboxImage.src = src; }
  lightboxImage.alt = caption;
  document.querySelector('#photo-caption').textContent = caption;
  document.querySelector('#photo-count').textContent = `Exit 168 · ${String(photoIndex + 1).padStart(2, '0')} ${t("of", 'из')} ${photos.length}`;
}
function openPhoto(name) {
  showPhoto(Math.max(0, photos.findIndex(p => p[0] === name)));
  photoDialog.showModal();
  document.body.classList.add('gallery-open');
}
document.querySelectorAll('[data-photo]').forEach(b => b.addEventListener('click', () => openPhoto(b.dataset.photo)));
document.querySelector('.lightbox-close').addEventListener('click', () => photoDialog.close());
document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('#photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
photoDialog.addEventListener('click', e => {
  if (e.target !== photoDialog) return;
  const r = photoDialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) photoDialog.close();
});
photoDialog.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(photoIndex - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(photoIndex + 1); }
});
// On a phone the photographs page with a swipe as well as with the arrows.
let swipeX = null;
photoDialog.addEventListener('touchstart', e => { swipeX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
photoDialog.addEventListener('touchend', e => {
  if (swipeX === null) return;
  const dx = e.changedTouches[0].clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) > 40) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
}, { passive: true });
photoDialog.addEventListener('close', () => { document.body.classList.remove('gallery-open'); lightboxImage.removeAttribute('src'); });
document.querySelectorAll('[data-all-photos]').forEach(el => { el.textContent = t(`All ${photos.length} photos`, `Все ${photos.length} фото`); el.hidden = false; });

// ---- time alone with nature: eight things to do, one text and one picture at a time ----
// The texts lie in a row that snaps; a name jumps to its text, and on a phone a finger can drag the row.
const natureSlides = document.querySelector('.nature-slides');
if (natureSlides) {
  const names = [...document.querySelectorAll('.nature-tabs a')];
  const pics = [...document.querySelectorAll('.nature-pics picture')];
  // the other pictures stay [hidden] (so they don't load with the page) until the section is near the screen;
  // then they load and decode in the background, so a fade never starts on a picture that isn't ready
  new IntersectionObserver((seen, watch) => {
    if (!seen.some(s => s.isIntersecting)) return;
    pics.forEach(p => { p.hidden = false; p.querySelector('img').decode().catch(() => {}); });
    watch.disconnect();
  }, { rootMargin: '600px 0px' }).observe(natureSlides.closest('.nature'));
  let shown = 0;
  // under the photograph (narrow screens) the stylesheet gives the row the height of the text on show
  const fit = () => natureSlides.style.setProperty('--h', `${natureSlides.children[shown].offsetHeight}px`);
  const show = i => {
    shown = i;
    names.forEach((a, n) => {
      if (n === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      natureSlides.children[n].classList.toggle('is-current', n === i);
    });
    pics.forEach(p => p.classList.toggle('is-current', p.dataset.for === natureSlides.children[i].id));
    fit();
  };
  names.forEach((a, i) => a.addEventListener('click', e => {
    e.preventDefault(); // without this script the link itself scrolls the row to its text
    natureSlides.scrollTo({ left: i * natureSlides.clientWidth, behavior: 'instant' });
    show(i);
  }));
  natureSlides.addEventListener('scroll', () => {
    const i = Math.round(natureSlides.scrollLeft / natureSlides.clientWidth);
    if (i !== shown) show(i);
  }, { passive: true });
  addEventListener('resize', fit);
  document.fonts.ready.then(fit);
  fit();
}

// ---- scroll scenes: the place from above, and the banya ----
// Both pin to the screen and play out over the scroll. With reduced motion, or without this script,
// the stylesheet shows their end state: the clearing with its pins (in summer), the stove alight with every step.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = v => Math.min(1, Math.max(0, v));
const progress = track => { const r = track.getBoundingClientRect(); return clamp01(-r.top / (r.height - innerHeight)); };
// Each scene follows the scroll with a short lag, so a mouse wheel's 100-pixel jumps play as one smooth move.
const scenes = [];
let running = false, last = 0;
const frame = now => {
  const k = 1 - Math.exp(-(last ? now - last : 16.7) / 130); // about 95% of the way in 0.4 s
  last = now;
  let moving = false;
  scenes.forEach(s => {
    const to = progress(s.track), p = s.p + (to - s.p) * k;
    s.p = Math.abs(to - p) < 1e-4 ? to : p;
    if (s.p !== to) moving = true;
    if (s.p !== s.drawn) { s.drawn = s.p; s.draw(s.p); }
  });
  running = moving;
  if (moving) requestAnimationFrame(frame); else last = 0;
};
const queue = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
const scene = (track, draw, measure = () => {}) => scenes.push({ track, draw, measure, p: progress(track), drawn: NaN });
// One full-screen quad drawn by one fragment shader; null without WebGL or when the shader does not build.
const glQuad = (canvas, frag, attrs) => {
  const gl = canvas.getContext('webgl', attrs);
  if (!gl) return null;
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return { gl, u: name => gl.getUniformLocation(prog, name) };
};

// The clearing from above: the two pins come up, and as the scroll goes on the same view passes from summer into deep snow.
const estate = document.querySelector('.estate-track');
if (estate && !still) {
  const stage = estate.querySelector('.estate-stage');
  const pins = [...estate.querySelectorAll('.pin')];
  const winterImg = estate.querySelector('.estate-winter');
  // The winter view is the last thing the scene needs, so it loads after the summer view instead of alongside it.
  const loadWinter = () => { if (!winterImg.dataset.srcset) return; const lighter = winterImg.previousElementSibling; lighter.srcset = lighter.dataset.srcset; winterImg.srcset = winterImg.dataset.srcset; winterImg.src = winterImg.dataset.src; delete winterImg.dataset.srcset; };
  // If the visitor is already standing on the winter step when the file arrives, draw the scene again.
  winterImg.addEventListener('load', () => { scenes.forEach(sc => { sc.drawn = NaN; }); queue(); });
  const summerImg = estate.querySelector('.estate-close img:not(.estate-winter)');
  if (summerImg.complete && summerImg.naturalWidth) loadWinter(); else summerImg.addEventListener('load', loadWinter, { once: true });
  let snow = 0; // how far the view has gone into winter
  const draw = p => {
    pins.forEach((pin, i) => pin.classList.toggle('is-on', p > .08 + i * .06));
    stage.classList.toggle('pins-on', p > .08);
    if (p > .2) loadWinter();
    snow = winterImg.complete && winterImg.naturalWidth > 1 ? clamp01((p - .35) / .5) : 0; // 1px is the placeholder the page ships with
    winterImg.style.opacity = snow;
  };

  // The river runs. A canvas over both pictures redraws only their water: the picture is pulled a few pixels downstream
  // and faded back in, two layers half a beat apart, quick in the rapids and slow in the pool and near the banks,
  // so the water moves while every rock, drift, the bridge and the trees stay put. The map of where the water is and
  // which way it runs is made by tools/river-flow-map.cjs. Without WebGL the pictures simply stay still.
  const water = document.createElement('canvas');
  const river = 'createImageBitmap' in self && glQuad(water, `precision highp float;uniform sampler2D S,W,F;uniform vec2 r;uniform float t,w;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 u=vec2(gl_FragCoord.x/r.x,1.-gl_FragCoord.y/r.y);vec4 f=texture2D(F,u);
        float ds=f.b,dw=f.a*2.-1.,ms=smoothstep(0.,.4,ds),mw=smoothstep(0.,.4,dw),as=(1.-w)*ms,aw=w*mw;
        if(as+aw<.002){gl_FragColor=vec4(0.);return;}
        vec2 d=f.rg*2.-1.,v=d*vec2(.007,.0105),x=vec2(-d.y,d.x)*vec2(.007,.0105);
        float e=t+n(u*vec2(11.,7.3)),p=fract(e),q=fract(e+.5),k=abs(2.*p-1.),i=floor(e),j=floor(e+.5);
        // every pass of a layer starts a little off the last, along and across the flow, so the foam never loops the same way
        vec2 a=v*(p-.5+.4*(h(vec2(i,1.))-.5))+x*.5*(h(vec2(i,2.))-.5),b=v*(q-.5+.4*(h(vec2(j,3.))-.5))+x*.5*(h(vec2(j,4.))-.5);
        vec3 s=mix(texture2D(S,u-a*ds).rgb,texture2D(S,u-b*ds).rgb,k);
        vec3 c=mix(texture2D(W,u-a*dw).rgb,texture2D(W,u-b*dw).rgb,k);
        // halfway between seasons the summer and winter water differ round the snowy boulders: correct for the page underneath,
        // which is already showing both pictures half and half there
        vec3 m=s*as+c*aw+w*(1.-w)*(ms-mw)*(texture2D(W,u).rgb-texture2D(S,u).rgb);
        gl_FragColor=vec4(clamp(m,0.,as+aw),as+aw);}`, { antialias: false, depth: false });
  let fit = () => {};
  if (river) {
    const { gl, u } = river, uT = u('t'), uW = u('w'), uR = u('r'), ready = [];
    water.className = 'estate-water';
    water.setAttribute('aria-hidden', 'true');
    summerImg.closest('.estate-close').append(water);
    // three pictures on three texture units: summer, winter, and the map of the water
    [0, 1, 2].forEach(i => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(u('SWF'[i]), i);
    });
    // each picture goes to the graphics card once, decoded off the main thread first, so the upload does not hold up the scroll
    const upload = (i, img, map) => (map ? img.decode().then(() => img) : createImageBitmap(img)).then(pic => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, map ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pic);
      ready[i] = true;
    }, () => {});
    const map = new Image(), mapSrc = asset('assets/img/river-flow.png');
    const summerIn = () => { upload(0, summerImg); if (!map.src) { map.src = mapSrc; upload(2, map, true); } };
    if (summerImg.complete && summerImg.naturalWidth) summerIn();
    summerImg.addEventListener('load', summerIn); // again if the browser swaps in a sharper file on resize
    winterImg.addEventListener('load', () => { if (winterImg.naturalWidth > 1) upload(1, winterImg); });
    // never sharper than the pictures themselves, whatever the screen
    fit = () => {
      water.width = Math.round(Math.min(water.clientWidth * devicePixelRatio, 1536));
      water.height = Math.round(water.width / 1.5);
      gl.viewport(0, 0, water.width, water.height);
      gl.uniform2f(uR, water.width, water.height);
    };
    fit();
    let flowing = false;
    const flow = ms => {
      if (!flowing) return;
      // until the winter picture is on the card, a winter step shows the still pictures rather than summer water on snow
      if (ready[0] && ready[2] && (ready[1] || !snow)) {
        gl.uniform1f(uT, ms / 1400 % 64); // one beat is 1.4 s; the layers' starting points repeat only after 64 beats
        gl.uniform1f(uW, snow);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else gl.clear(gl.COLOR_BUFFER_BIT);
      requestAnimationFrame(flow);
    };
    // only while the view is on screen (and, as with any animation frame, only while the tab is open in front)
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !flowing) { flowing = true; requestAnimationFrame(flow); }
      if (!e.isIntersecting) flowing = false;
    }).observe(stage);
  }
  scene(estate, draw, () => fit());
}

// The banya: five steps over the scroll; the fire takes on "light the stove", the river comes on the last step.
const ritual = document.querySelector('.ritual-track');
if (ritual && !still) {
  const stage = ritual.querySelector('.ritual-stage');
  const steps = [...stage.querySelectorAll('.ritual-steps li')];
  const draw = p => {
    const now = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((li, i) => { li.classList.toggle('is-now', i === now); li.classList.toggle('is-done', i < now); });
    stage.style.setProperty('--p', p.toFixed(4));
    stage.style.setProperty('--fire', clamp01((p - .17) / .2).toFixed(3));
    stage.style.setProperty('--river', clamp01((p - .8) / .08).toFixed(3));
  };
  scene(ritual, draw);

  // Firelight: the room's glow flickers and a live flame burns in the open firebox, only while the scene is on screen.
  const flame = stage.querySelector('.ritual-flame');
  const fire = glQuad(flame, `precision mediump float;uniform float t;uniform vec2 r;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
      void main(){vec2 u=gl_FragCoord.xy/r;
        float body=(1.-u.y)*1.2-abs(u.x-.5)*1.4;
        float f=clamp(body+(fbm(vec2(u.x*3.2,u.y*2.6-t*1.7))-.5)*1.3,0.,1.);
        f=smoothstep(.3,.95,f);
        f*=smoothstep(0.,.18,u.y)*smoothstep(0.,.2,u.x)*smoothstep(0.,.2,1.-u.x)*smoothstep(0.,.12,1.-u.y)*.85;
        vec3 c=mix(vec3(.45,.07,0.),vec3(1.,.42,.05),smoothstep(.1,.45,f));
        c=mix(c,vec3(1.,.78,.4),smoothstep(.55,.85,f));
        gl_FragColor=vec4(c*f,1.);}`, { premultipliedAlpha: false, antialias: false });
  let fireDraw = () => {};
  if (fire) {
    const { gl, u } = fire, uT = u('t'), uR = u('r');
    fireDraw = t => {
      const w = Math.round(flame.clientWidth * devicePixelRatio), h = Math.round(flame.clientHeight * devicePixelRatio);
      if (flame.width !== w || flame.height !== h) { flame.width = w; flame.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform1f(uT, t); gl.uniform2f(uR, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }
  let burning = false;
  const burn = ms => {
    if (!burning) return;
    const t = ms / 1000;
    // three detuned waves read as a fire breathing, without a noise texture
    stage.style.setProperty('--flick', (.78 + .14 * Math.sin(t * 7.1) + .08 * Math.sin(t * 13.3 + 1.7) + .05 * Math.sin(t * 23.9 + .4)).toFixed(3));
    fireDraw(t);
    requestAnimationFrame(burn);
  };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !burning) { burning = true; requestAnimationFrame(burn); }
    if (!e.isIntersecting) burning = false;
  }).observe(stage);
}

if (scenes.length) {
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { scenes.forEach(s => { s.measure(); s.drawn = NaN; }); queue(); });
  queue();
}

// ---- date request ----
// With the booking service (form data-api, the Cloudflare Worker in календарь/) the form shows live
// free days and holds the dates for 24 hours. The request itself the guest sends from their own WhatsApp:
// in the US a call from an unknown number reads as spam, so we answer in their chat (Roman via V, 2026-11-09).
const WA = '19169144407';
const form = document.querySelector('#request-form');
const result = document.querySelector('#request-result');
// Three ways to book under the form: WhatsApp, a text message (phones only: from a computer it rarely works) and a call.
// The chosen app opens at once; the other ways are buttons right under it in the panel, no fold (V, 2026-11-09).
// A phone gets SMS and a call there; a computer a QR code for the phone camera, the request to copy and the number.
const desktop = matchMedia('(hover: hover) and (pointer: fine)').matches;
form.classList.toggle('desk', desktop);
let viaSms = false;
const qrLib = asset('assets/qrcode.js'); // here, while document.currentScript is still this script
const dateInput = form.elements.date;
// The live site is https. A local copy (http, on this Mac or a phone on its Wi-Fi) talks to the test service
// (launch.json «booking-local»), so trying the form never holds real dates.
const API = location.protocol === 'https:' ? form.dataset.api : `http://${location.hostname}:8787`;
const now = new Date();
dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const nights = () => form.elements.stay.value === 'overnight' ? Number(form.elements.nights.value) : 0;
const stayLabel = () => form.elements.stay.value === 'day' ? t("Day use", 'День')
  : nights() === 1 ? t("Overnight", 'С ночёвкой') : t(`${nights()} nights`, `${nights()} ${nights() < 5 ? 'ночи' : 'ночей'}`); // 2–7 nights
// The site prices a group of up to 10 only; for more than 10 it shows no rent, «we'll work it out» (V, 2026-11-11).
// Check-in at noon, check-out at 10 a.m., so never «24 hours» (Roman, 2026-11-10 evening).
// The group size never stops a booking: empty counts as 10, anything else is kept within 1–15 (V, 2026-11-09).
const guestsGiven = () => form.elements.guests.value !== '';
const guestCount = () => guestsGiven() ? Math.min(15, Math.max(1, Math.round(Number(form.elements.guests.value)))) : 10;
const bigGroup = () => guestCount() > 10;
const stayPrice = () => form.elements.stay.value === 'overnight' ? 1000 * nights() : 500;
const usd = n => '$' + String(n).replace(/\B(?=(\d{3})+$)/g, t(',', ' '));
// Cleaning is $250 once per booking, whatever its length (Roman via V, 2026-11-10). V shows rent and cleaning side by
// side and no total, knowing California's honest-pricing law asks for the total (DECISIONS, 10.11).
const CLEANING = 250;

// ---- calendar ----
const cal = document.querySelector('#calendar');
const calGrid = cal.querySelector('.cal-grid');
const calStatus = document.querySelector('#cal-status');
const locale = t('en-US', 'ru-RU');
let busy = null; // { 'YYYY-MM-DD': 'hold' | 'busy' } once the service has answered
let loading = false; // the calendar is on the page, its days closed until the service answers
let longWeekends = [], minNights = 2; // New Year and Independence Day and their shortest stay, sent by the service with the busy days
let today = dateInput.min;
let month = today.slice(0, 7);
const utc = iso => new Date(`${iso}T00:00:00Z`);
const addDays = (iso, n) => new Date(utc(iso).getTime() + n * 864e5).toISOString().slice(0, 10);
const lastDay = () => addDays(today, 365);
const nice = iso => utc(iso).toLocaleDateString(locale, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
// A day visit takes its date; N nights take the arrival date and the N dates after it.
const stayDays = () => dateInput.value ? Array.from({ length: nights() + 1 }, (_, i) => addDays(dateInput.value, i)) : [];
const clashes = () => busy ? stayDays().filter(d => busy[d] || d > lastDay()) : [];
const tooShort = () => nights() < minNights && stayDays().some(d => longWeekends.some(([a, b]) => d >= a && d <= b));

function renderCalendar() {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + (ru ? 6 : 0)) % 7; // weeks start on Sunday in English, Monday in Russian
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  cal.querySelector('.cal-title').textContent = `${first.toLocaleDateString(locale, { timeZone: 'UTC', month: 'long' })} ${y}`;
  cal.querySelector('.cal-prev').disabled = month <= today.slice(0, 7);
  cal.querySelector('.cal-next').disabled = month >= lastDay().slice(0, 7);
  const range = stayDays(), bad = clashes(), short = tooShort();
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2026, 1, 1 + i + (ru ? 1 : 0))); // 1 Feb 2026 is a Sunday
    cells.push(`<span class="cal-dow" aria-hidden="true">${d.toLocaleDateString(locale, { timeZone: 'UTC', weekday: ru ? 'short' : 'narrow' })}</span>`);
  }
  for (let i = 0; i < lead; i++) cells.push('<span></span>');
  for (let day = 1; day <= count; day++) {
    const iso = `${month}-${String(day).padStart(2, '0')}`;
    const state = busy[iso];
    const off = loading || iso < today || iso > lastDay() || !!state;
    const cls = ['cal-day', state, range.includes(iso) && (short || bad.includes(iso) ? 'clash' : 'range')].filter(Boolean).join(' ');
    const note = state === 'hold' ? t(", on hold", ', держим') : state ? t(", booked", ', занято') : '';
    cells.push(`<button type="button" class="${cls}" data-day="${iso}" aria-pressed="${iso === dateInput.value}" aria-label="${nice(iso)}${note}"${off ? ' disabled' : ''}>${day}</button>`);
  }
  calGrid.innerHTML = cells.join('');
  const days = stayDays();
  calStatus.textContent = loading ? t("Checking open dates…", 'Смотрим, какие даты свободны…')
    : !days.length ? ''
    : leaving ? t(`Check-in ${nice(days[0])}. Now tap your check-out day, up to 7 nights later.`, `Приезд ${nice(days[0])} — теперь выберите день отъезда, до 7 ночей.`)
    : bad.length ? t(`${nice(bad[0])} is already taken. Pick another check-in day or fewer nights.`, `${nice(bad[0])} занято. Выберите другой день приезда или меньше ночей.`)
    : short ? t(`These are holiday dates, with a ${minNights}-night minimum stay.`, `Это праздничные дни: бронь от ${minNights} ночей.`)
    : days.length === 1 ? nice(days[0]) : `${nice(days[0])} – ${nice(days.at(-1))}`;
}

// «С ночёвкой»: the first tap is the arrival day, the next later tap the day you leave (V, 2026-11-09: the
// «how many» list under the calendar went unseen and then confused: it shows only when the calendar does not).
let leaving = false;
calGrid.addEventListener('click', e => {
  const b = e.target.closest('[data-day]');
  if (!b || b.disabled) return;
  const n = dateInput.value ? Math.round((utc(b.dataset.day) - utc(dateInput.value)) / 864e5) : 0;
  if (leaving && n >= 1 && n <= form.elements.nights.options.length) {
    form.elements.nights.value = n;
    leaving = false;
  } else {
    dateInput.value = b.dataset.day;
    leaving = form.elements.stay.value === 'overnight';
  }
  form.dispatchEvent(new Event('input'));
});
cal.querySelector('.cal-prev').addEventListener('click', () => { month = addDays(`${month}-01`, -1).slice(0, 7); renderCalendar(); });
cal.querySelector('.cal-next').addEventListener('click', () => { month = addDays(`${month}-28`, 7).slice(0, 7); renderCalendar(); });

async function loadBusy() {
  // a service that hangs must not leave the calendar closed for good: the plain date field takes over
  const res = await fetch(`${API}/busy`, { cache: 'no-store', signal: AbortSignal.timeout?.(8000) });
  if (!res.ok) throw new Error(res.status);
  ({ days: busy, today, longWeekends = [], minNights = 2 } = await res.json());
  // The calendar counts days by California; a visitor a timezone ahead had today's date offered in the calendar but
  // refused by the hidden field, and the button then did nothing.
  dateInput.min = today;
  if (month < today.slice(0, 7)) month = today.slice(0, 7);
}

if (API) {
  // The calendar takes its place at once, so the form does not jump under the visitor when the service answers.
  const dateField = document.querySelector('#date-field');
  // the calendar checks the date itself on submit; the input event shows the «how many» list again without it
  const showCalendar = on => { cal.hidden = !on; dateField.hidden = on; dateInput.required = !on; form.dispatchEvent(new Event('input')); };
  loading = true; busy = {};
  showCalendar(true);
  renderCalendar();
  loadBusy().then(() => {
    loading = false;
    renderCalendar();
  }).catch(() => { loading = false; busy = null; showCalendar(false); }); // no answer: the plain date field and WhatsApp keep working
}

form.addEventListener('input', () => {
  result.hidden = true;
  const overnight = form.elements.stay.value === 'overnight';
  if (!overnight) leaving = false;
  cal.querySelector('.cal-label').textContent = overnight ? t("Check-in and check-out", 'Приезд и отъезд') : t("Pick a date", 'Дата приезда');
  document.querySelector('#nights-field').hidden = !overnight || !cal.hidden; // with the calendar, the stay is picked in it
  document.querySelector('#rate-rent').textContent = usd(stayPrice());
  document.querySelector('#rent-row').hidden = bigGroup();
  document.querySelector('#rate-big').hidden = !bigGroup();
  // three nights or more: a bonus — your own vehicles, hunting and walks across the 168 acres, which stay shared with us
  // (Roman and V, 2026-11-10; «бонус», «мы тоже имели доступ» — V, 2026-11-12)
  document.querySelector('#rate-bonus').hidden = nights() < 3;
  // the stay wraps as a whole, so a phone never leaves «nights» alone on the second line
  document.querySelector('#stay-duration').textContent = `${t("up to 10", 'до 10')}, ${stayLabel().toLowerCase().replaceAll(' ', '\u00a0')}`;
  if (busy) renderCalendar();
});

// The guest's first message in WhatsApp. Their name and number come with it, so the form asks for neither.
// The QR code leaves the notes out: a long text makes it too dense to scan, and the notes reach us with the hold.
function requestText(withNotes = true) {
  const days = stayDays().map(nice);
  const notes = withNotes && form.elements.notes.value.trim();
  return [
    t("Hi, I'd like to book Exit 168.", 'Здравствуйте! Хочу забронировать Exit 168.'),
    `${stayLabel()}: ${days.length > 1 ? `${days[0]} – ${days.at(-1)}` : days[0]}`,
    `${t("Group", 'Гостей')}: ${guestsGiven() ? guestCount() : t("up to 10", 'до 10')}`,
    !bigGroup() && `${t("Rental", 'Аренда')}: ${usd(stayPrice())}`,
    `${t("Cleaning fee", 'Уборка')}: ${usd(CLEANING)}`,
    notes && `${t("Notes", 'Комментарий')}: ${notes}`,
  ].filter(Boolean).join('\n');
}

const sentText = until => [
  viaSms ? t("Your request is written out in a text to 916-914-4407. It isn't sent yet, so hit Send there.",
    'Заявка уже написана в сообщении на номер 916-914-4407. Нажмите там «Отправить»: без этого она до нас не дойдёт.')
  : t("Your request is written out in WhatsApp to 916-914-4407. It isn't sent yet, so hit Send there.",
    'Заявка уже написана в WhatsApp, на номер 916-914-4407. Нажмите там «Отправить»: без этого она до нас не дойдёт.'),
  until && t(`We're holding your dates until ${until} and will reply in that chat.`, `Даты держим до ${until}, ответим в этом же чате.`),
].filter(Boolean).join(' ');

function showResult(title, text, withLinks) {
  document.querySelector('#result-title').textContent = title;
  document.querySelector('#result-text').textContent = text;
  result.querySelector('.ways').hidden = !withLinks;
  result.hidden = false;
  result.focus();
}

// The lead Google Ads imports from Analytics as its conversion; value = the rate asked for.
const countLead = () => {
  if (window.gtag) gtag('event', 'generate_lead', { currency: 'USD', value: stayPrice() + CLEANING });
  if (window.fbq) fbq('track', 'Lead', { currency: 'USD', value: stayPrice() + CLEANING });
};
// How far guests get in the form: each step is its own event, sent once per visit. Google's form_start fires on
// any first touch (even «День» to see the price), so it says nothing about who typed a name or a phone.
const stepsSent = new Set();
const formStep = name => {
  if (!name || stepsSent.has(name) || !window.gtag) return;
  stepsSent.add(name);
  gtag('event', name);
};
const fieldSteps = { date: 'form_date', guests: 'form_guests' };
form.addEventListener('change', e => formStep(fieldSteps[e.target.name]));
// The tap itself, and which field reportValidity refused in the submit handler (the form is novalidate).
form.querySelectorAll('.submit').forEach(b => b.addEventListener('click', () => formStep('form_send_tap')));
form.addEventListener('invalid', e => formStep(`form_invalid_${e.target.name}`), true);
calGrid.addEventListener('click', e => { if (e.target.closest('[data-day]:not(:disabled)')) formStep('form_date'); });
// A call, a WhatsApp chat or the shared-sauna Telegram chat leaves no other trace on the site: count the taps.
document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me/"], a[href^="https://t.me/"]').forEach(a => a.addEventListener('click', () => {
  if (window.gtag) gtag('event', a.protocol === 'tel:' ? 'phone_click' : a.hostname === 't.me' ? 'telegram_click' : 'whatsapp_click');
  if (window.fbq) fbq('track', 'Contact');
}));

// Holds the dates while the guest sends the message. If the service fails, WhatsApp does the job alone.
// keepalive and a plain-text body (no CORS preflight): on a phone the page goes to the background as WhatsApp opens.
async function holdDates() {
  const fields = Object.fromEntries(new FormData(form));
  let res;
  try {
    res = await fetch(`${API}/request`, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ ...fields, guests: String(guestCount()), lang: ru ? 'ru' : 'en' }) });
  } catch {
    return;
  }
  const data = await res.json().catch(() => ({}));
  // ponytail: WhatsApp is already open with these dates by now; rare enough that we sort it out in the chat.
  if (res.status === 409) {
    busy = data.days || busy;
    renderCalendar();
    showResult(t("Someone just booked those dates", 'Эти даты только что заняли'), t("The calendar is updated. Pick other dates, or tell us in the chat which ones work for you.", 'Календарь обновлён. Выберите другие даты и напишите нам в чате, какие.'), false);
    return;
  }
  if (!res.ok || !data.ok) return;
  stayDays().forEach(d => { busy[d] = 'hold'; });
  const until = new Date(data.holdUntil).toLocaleString(locale, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  document.querySelector('#result-text').textContent = sentText(until);
  dateInput.value = '';
  renderCalendar();
}

// What can still stop a request: no arrival date, dates taken, a holiday stay too short (V, 2026-11-09).
// The form is novalidate, so a wrong group size reaches this handler and is corrected here instead of refused.
form.addEventListener('submit', e => {
  e.preventDefault();
  form.elements.guests.value = guestsGiven() ? guestCount() : ''; // a group of 0 or 40 is corrected rather than refused
  if (!form.reportValidity()) return;
  if (busy) {
    if (!dateInput.value) { calStatus.textContent = t("Pick a check-in day on the calendar.", 'Выберите день приезда в календаре.'); cal.scrollIntoView({ block: 'center' }); return; }
    if (clashes().length || tooShort()) { leaving = false; renderCalendar(); cal.scrollIntoView({ block: 'center' }); return; }
  }
  viaSms = e.submitter?.dataset.via === 'sms';
  sentRequest = requestText();
  qrUrl = `https://wa.me/${WA}?text=${encodeURIComponent(requestText(false))}`;
  const text = encodeURIComponent(sentRequest);
  const wa = `https://wa.me/${WA}?text=${text}`;
  const sms = `sms:+${WA}?&body=${text}`;
  document.querySelector('#wa-link').href = wa;
  document.querySelector('#sms-link').href = sms;
  setQr(false);
  showResult(viaSms ? t("Now hit Send in Messages", 'Осталось нажать «Отправить» в сообщении') : t("Now hit Send in WhatsApp", 'Осталось нажать «Отправить» в WhatsApp'), sentText(), true);
  if (busy) holdDates();
  // Inside the tap itself: browsers block a new window once the tap has passed. On a computer wa.me opens
  // the WhatsApp app or WhatsApp Web (V, 2026-11-09).
  if (viaSms) {
    if (window.gtag) gtag('event', 'sms_request');
    location.href = sms;
  } else {
    window.open(wa, '_blank', 'noopener');
  }
  countLead();
});

// The QR code library loads only on the first press of its button (V, 2026-11-09).
let qrUrl = '';
let qrLoad = null;
const loadQr = () => qrLoad ||= new Promise((ok, fail) => {
  const s = document.createElement('script');
  s.src = qrLib;
  s.onload = ok;
  s.onerror = () => { qrLoad = null; fail(); };
  document.head.append(s);
});
const qrButton = document.querySelector('#qr-button');
const qrPanel = document.querySelector('#qr-panel');
const qrLabel = qrButton.textContent;
function setQr(shown) {
  qrPanel.hidden = !shown;
  qrButton.setAttribute('aria-expanded', shown);
  qrButton.textContent = shown ? t("Hide QR code", 'Скрыть QR-код') : qrLabel;
}
qrButton.addEventListener('click', () => {
  if (!qrPanel.hidden) return setQr(false);
  // shown only once drawn: no empty white box while it loads, or if it never does
  loadQr().then(() => {
    const qr = qrcode(0, 'L');
    qr.addData(qrUrl);
    qr.make();
    document.querySelector('#wa-qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: t("QR code that opens WhatsApp with your request", 'QR-код: WhatsApp с вашей заявкой') });
    setQr(true);
  }, () => {});
});

// The text as it was sent: the hold clears the date once it succeeds, so it can't be written out again later.
let sentRequest = '';
const copyButton = document.querySelector('#request-copy');
const copyLabel = copyButton.textContent;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(sentRequest);
    copyButton.textContent = t("Copied", 'Скопировано');
  } catch {
    copyButton.textContent = t("Couldn't copy", 'Не получилось скопировать');
  }
  setTimeout(() => { copyButton.textContent = copyLabel; }, 2500);
});

// ---- sticky action on small screens: after the hero, hidden while another booking button or the form is on screen ----
const sticky = document.querySelector('#sticky-cta');
const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window) {
  let pastHero = false;
  const covering = new Set();
  const update = () => { sticky.hidden = !(pastHero && !covering.size); };
  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0; update(); }, { threshold: 0 }).observe(hero);
  const cover = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? covering.add(e.target) : covering.delete(e.target));
    update();
  }, { threshold: 0.05 });
  document.querySelectorAll('.offer-card, #request, .section-cta').forEach(el => cover.observe(el));
}

// ---- rates card: the three prices split by the group size; past 10 people the price is agreed separately ----
const calc = document.querySelector('.offer-calc');
if (calc) {
  let people = 10;
  const money = x => {
    const r = Math.round(x);
    return (r === x ? '' : '≈') + '$' + String(r).replace(/\B(?=(\d{3})+$)/g, ru ? ' ' : ',');
  };
  const draw = () => {
    const over = people > 10;
    calc.querySelector('output').textContent = over ? '10+' : people;
    calc.querySelector('[data-step="-1"]').disabled = people <= 1;
    calc.querySelector('[data-step="1"]').disabled = over;
    calc.querySelectorAll('.offer-per').forEach(el => { el.hidden = over; });
    calc.querySelector('.offer-over').hidden = !over;
    calc.querySelectorAll('[data-sum]').forEach(el => {
      const m = money(el.dataset.sum / people);
      el.textContent = el.hasAttribute('data-plus') ? m.replace('$', '+$') : m;
    });
  };
  calc.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { people += +b.dataset.step; draw(); }));
}
