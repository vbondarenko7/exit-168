// Host address for date requests. Empty until Roman supplies it: the mail app then opens without a recipient.
const HOST_EMAIL = '';

// ---- navigation ----
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
menu.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); menuButton.focus(); } });

// ---- photographs ----
const photos = [
  ['river', 'assets/img/river-1440.webp', 'The pool below the deck, with the steps down from the sauna'],
  ['stove', 'assets/img/stove-1600.webp', 'The wood-fired stove in the sauna'],
  ['sauna', 'assets/img/sauna-1600.webp', 'The sauna benches'],
  ['sauna-lounge', 'assets/img/sauna-lounge-1440.webp', 'The changing lounge off the sauna'],
  ['dining', 'assets/img/dining-1440.webp', 'The dining table for six'],
  ['living', 'assets/img/living-1440.webp', 'The living room'],
  ['deck', 'assets/img/deck-1400.webp', 'The deck with picnic tables'],
  ['cabin', 'assets/img/cabin-1400.webp', 'The cabin from the road'],
  ['gate', 'assets/img/gate-1400.webp', 'The private gate off Rainbow Road'],
];
const photoDialog = document.querySelector('#photo-dialog');
const lightboxImage = document.querySelector('#lightbox-image');
let photoIndex = 0;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const [, src, caption] = photos[photoIndex];
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  document.querySelector('#photo-caption').textContent = caption;
  document.querySelector('#photo-count').textContent = `Exit 168 · ${String(photoIndex + 1).padStart(2, '0')} of ${photos.length}`;
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
const stayLabel = () => form.elements.stay.value === 'overnight' ? '24 hours' : 'Day visit';
const stayRate = () => form.elements.stay.value === 'overnight' ? '$1,000' : '$500';

form.addEventListener('input', () => {
  result.hidden = true;
  document.querySelector('#rate-total').textContent = stayRate();
  document.querySelector('#stay-duration').textContent = stayLabel();
});

function requestText() {
  const date = new Date(`${dateInput.value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const guests = Number(form.elements.guests.value);
  const interests = [...form.querySelectorAll('input[name="interest"]:checked')].map(i => i.value);
  const notes = form.elements.notes.value.trim();
  return [
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
  ].filter(line => line !== null).join('\n');
}

const mailLink = document.querySelector('#request-mail');
const resultLead = document.querySelector('#request-lead');
// While the host's address is missing, say so instead of promising an email that cannot be sent.
document.querySelector('#request-pending').hidden = Boolean(HOST_EMAIL);

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const text = requestText();
  const href = `mailto:${HOST_EMAIL}?subject=${encodeURIComponent(`Exit 168 date request: ${stayLabel()}, ${dateInput.value}`)}&body=${encodeURIComponent(text)}`;
  document.querySelector('#request-text').textContent = text;
  mailLink.href = href;
  mailLink.hidden = !HOST_EMAIL;
  resultLead.textContent = HOST_EMAIL
    ? 'It should have opened in your mail app, addressed to the host. Press send there. If nothing opened, use the button below.'
    : 'The email address is not published on this page yet. Copy the text below and send it to the host with the address you were given.';
  result.hidden = false;
  // Clicking a mailto link hands the request to the mail app without unloading this page;
  // setting window.location instead reloads it and wipes the text the visitor just wrote.
  if (HOST_EMAIL) mailLink.click();
  result.focus();
});

document.querySelector('#request-copy').addEventListener('click', async e => {
  const button = e.currentTarget;
  try {
    await navigator.clipboard.writeText(document.querySelector('#request-text').textContent);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Select and copy the text above';
  }
  setTimeout(() => { button.textContent = 'Copy the text'; }, 2500);
});

// ---- sticky action on small screens: after the hero, hidden while the request form is on screen ----
const sticky = document.querySelector('#sticky-cta');
const hero = document.querySelector('.hero');
const request = document.querySelector('#request');
if ('IntersectionObserver' in window) {
  let pastHero = false, formVisible = false;
  const update = () => { sticky.hidden = !(pastHero && !formVisible); };
  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0; update(); }, { threshold: 0 }).observe(hero);
  new IntersectionObserver(([entry]) => { formVisible = entry.isIntersecting; update(); }, { threshold: 0.05 }).observe(request);
}
