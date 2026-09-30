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
// No email on the site (V's decision 2026-09-26): the form writes the request, copies it,
// and the visitor sends it to the club's Facebook page in Messenger.
const form = document.querySelector('#request-form');
const result = document.querySelector('#request-result');
const dateInput = form.elements.date;
const now = new Date();
dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const stayLabel = () => form.elements.stay.value === 'overnight' ? t('24 hours', 'Сутки') : t('Day visit', 'День');
// Up to 10 people is the base rate; 11–15 adds half (Roman, 2026-09-30): $750 a day, $1,500 for 24 hours.
const bigGroup = () => Number(form.elements.guests.value) > 10;
const stayPrice = () => (form.elements.stay.value === 'overnight' ? 1000 : 500) * (bigGroup() ? 1.5 : 1);
const stayRate = () => '$' + String(stayPrice()).replace(/\B(?=(\d{3})+$)/, t(',', '\u00a0'));

form.addEventListener('input', () => {
  result.hidden = true;
  document.querySelector('#rate-total').textContent = stayRate();
  document.querySelector('#stay-duration').textContent = `${bigGroup() ? '11–15' : t('up to 10', 'до\u00a010')}, ${stayLabel().toLowerCase()}`;
});

function requestText() {
  const date = new Date(`${dateInput.value}T12:00:00`).toLocaleDateString(t('en-US', 'ru-RU'), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const notes = form.elements.notes.value.trim();
  return [
    t('Exit 168 booking request', 'Заявка на Exit 168'),
    `${t('Stay', 'Формат')}: ${stayLabel()} (${stayRate()})`,
    `${t('Arrival', 'Дата приезда')}: ${date}`,
    `${t('Group', 'Гостей')}: ${form.elements.guests.value}`,
    `${t('Name', 'Имя')}: ${form.elements.name.value.trim()}`,
    `${t('Contact', 'Связь')}: ${form.elements.contact.value.trim()}`,
    notes && `${t('Notes', 'Комментарий')}: ${notes}`,
  ].filter(Boolean).join('\n');
}

const requestPre = document.querySelector('#request-text');
const copyButton = document.querySelector('#request-copy');
// Copying must start inside the tap itself: mobile browsers refuse the clipboard once it has passed.
async function copyRequest() {
  try {
    await navigator.clipboard.writeText(requestPre.textContent);
    return true;
  } catch {
    return false;
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  requestPre.textContent = requestText();
  const copied = copyRequest();
  document.querySelector('#result-title').textContent = t('Your request is ready', 'Заявка готова');
  requestPre.hidden = copyButton.hidden = false;
  result.hidden = false;
  result.focus();
  document.querySelector('#result-text').textContent = await copied
    ? t('We copied it for you. Open Messenger, paste it into the chat with our page and send.', 'Мы её уже скопировали. Откройте Messenger, вставьте в чат с нашей страницей и отправьте.')
    : t('Copy the text below, open Messenger, paste it into the chat with our page and send.', 'Скопируйте текст ниже, откройте Messenger, вставьте в чат с нашей страницей и отправьте.');
  // The lead Google Ads imports from Analytics as its conversion; value = the rate asked for.
  if (window.gtag) gtag('event', 'generate_lead', { currency: 'USD', value: stayPrice() });
});

copyButton.addEventListener('click', async () => {
  copyButton.textContent = await copyRequest() ? t('Copied', 'Скопировано') : t('Select and copy the text above', 'Выделите и скопируйте текст выше');
  setTimeout(() => { copyButton.textContent = t('Copy the text', 'Скопировать текст'); }, 2500);
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
