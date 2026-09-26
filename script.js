// Host address for date requests (Roman, the owner; V's decision 2026-09-25).
const HOST_EMAIL = 'rvsline@gmail.com';

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
  menuButton.setAttribute('aria-label', open ? t('Close navigation', 'Закрыть меню') : t('Open navigation', 'Открыть меню'));
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
menu.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); menuButton.focus(); } });

// ---- photographs ----
const photos = [
  ['stove', 'assets/img/stove-1600.webp', 'The wood-fired stove in the sauna', 'Дровяная печь в бане'],
  ['river', 'assets/img/river-1440.webp', 'The pool below the deck, with the steps down to the water', 'Заводь под террасой и ступеньки к воде'],
  ['dining', 'assets/img/dining-1440.webp', 'The dining table in the cabin', 'Обеденный стол в доме'],
  ['bunks', 'assets/img/bunks-1440.webp', 'The triple bunk in the cabin', 'Трёхъярусная кровать в доме'],
  ['living', 'assets/img/living-1440.webp', 'The living room', 'Гостиная'],
  ['sauna', 'assets/img/sauna-1600.webp', 'The sauna benches', 'Полок в бане'],
  ['cabin', 'assets/img/cabin-1400.webp', 'The cabin from the road', 'Дом со стороны дороги'],
  ['winter-night', 'assets/img/winter-night-1350.webp', 'The cabin under snow at night', 'Дом под снегом ночью'],
  ['winter-river', 'assets/img/winter-river-1500.webp', 'The river between the snowdrifts', 'Река между сугробами'],
  ['winter-cabin', 'assets/img/winter-cabin-1600.webp', 'The cabin in winter, with the snowmobile track to the door', 'Дом зимой, к двери ведёт след снегохода'],
].map(([name, src, en, russian]) => [name, asset(src), t(en, russian)]);
const photoDialog = document.querySelector('#photo-dialog');
const lightboxImage = document.querySelector('#lightbox-image');
let photoIndex = 0;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const [, src, caption] = photos[photoIndex];
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  document.querySelector('#photo-caption').textContent = caption;
  document.querySelector('#photo-count').textContent = `Exit 168 · ${String(photoIndex + 1).padStart(2, '0')} ${t('of', 'из')} ${photos.length}`;
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
photoDialog.addEventListener('close', () => { document.body.classList.remove('gallery-open'); lightboxImage.removeAttribute('src'); });

// ---- date request ----
const form = document.querySelector('#request-form');
const result = document.querySelector('#request-result');
const dateInput = form.elements.date;
const now = new Date();
dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const stayLabel = () => form.elements.stay.value === 'overnight' ? t('24 hours', 'Сутки') : t('Day visit', 'День');
const stayRate = () => form.elements.stay.value === 'overnight' ? t('$1,000', '$1\u00a0000') : '$500';

form.addEventListener('input', () => {
  result.hidden = true;
  document.querySelector('#rate-total').textContent = stayRate();
  document.querySelector('#stay-duration').textContent = stayLabel();
});

function requestText() {
  const date = new Date(`${dateInput.value}T12:00:00`).toLocaleDateString(t('en-US', 'ru-RU'), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const guests = Number(form.elements.guests.value);
  const interests = [...form.querySelectorAll('input[name="interest"]:checked')].map(i => i.value);
  const notes = form.elements.notes.value.trim();
  const lines = ru ? [
    `Заявка на Exit 168`,
    ``,
    `Формат: ${stayLabel()} (${stayRate()}, дом + баня)`,
    `Первый день: ${date}`,
    `Гостей: ${guests}`,
    interests.length ? `Интересно: ${interests.join(', ')}` : null,
    notes ? `Комментарий: ${notes}` : null,
    ``,
    `Имя: ${form.elements.name.value.trim()}`,
    `Ответить на: ${form.elements.email.value.trim()}`,
  ] : [
    `Date request for Exit 168`,
    ``,
    `Stay: ${stayLabel()} (${stayRate()}, cabin + sauna)`,
    `First day: ${date}`,
    `Group: ${guests} ${guests === 1 ? 'person' : 'people'}`,
    interests.length ? `Into: ${interests.join(', ')}` : null,
    notes ? `Notes: ${notes}` : null,
    ``,
    `Name: ${form.elements.name.value.trim()}`,
    `Reply to: ${form.elements.email.value.trim()}`,
  ];
  return lines.filter(line => line !== null).join('\n');
}

const mailLink = document.querySelector('#request-mail');

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const text = requestText();
  const href = `mailto:${HOST_EMAIL}?subject=${encodeURIComponent(`${t('Exit 168 date request', 'Exit 168, заявка')}: ${stayLabel()}, ${dateInput.value}`)}&body=${encodeURIComponent(text)}`;
  document.querySelector('#request-text').textContent = text;
  mailLink.href = href;
  result.hidden = false;
  // The lead Google Ads imports from Analytics as its conversion; value = the rate asked for.
  if (window.gtag) gtag('event', 'generate_lead', { currency: 'USD', value: form.elements.stay.value === 'overnight' ? 1000 : 500 });
  // Clicking a mailto link hands the request to the mail app without unloading this page;
  // setting window.location instead reloads it and wipes the text the visitor just wrote.
  mailLink.click();
  result.focus();
});

document.querySelector('#request-copy').addEventListener('click', async e => {
  const button = e.currentTarget;
  try {
    await navigator.clipboard.writeText(document.querySelector('#request-text').textContent);
    button.textContent = t('Copied', 'Скопировано');
  } catch {
    button.textContent = t('Select and copy the text above', 'Выделите и скопируйте текст выше');
  }
  setTimeout(() => { button.textContent = t('Copy the text', 'Скопировать текст'); }, 2500);
});

// ---- sticky action on small screens: after the hero, hidden while the rates card or the request form is on screen ----
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
  document.querySelectorAll('.offer-card, #request').forEach(el => cover.observe(el));
}
