import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './style.css';

// Vidéo hero : certains navigateurs bloquent l'autoplay si la source
// n'est pas prête au moment du parsing — on relance par sécurité.
const video = document.querySelector('.hero-video');
if (video) {
  const relancer = () => {
    if (video.paused && !video.ended) video.play().catch(() => {});
  };
  video.addEventListener('canplay', relancer, { once: true });
  setTimeout(relancer, 800);
}

// FAQ : accordéon exclusif — une seule réponse ouverte à la fois,
// la première est ouverte par défaut.
const items = Array.from(document.querySelectorAll('[data-faq] .faq-item'));

function ouvrir(cible) {
  items.forEach((item) => {
    const ouvert = item === cible;
    item.classList.toggle('faq-item--ouvert', ouvert);
    item.querySelector('.faq-question').setAttribute('aria-expanded', String(ouvert));
    item.querySelector('.faq-icone').textContent = ouvert ? '−' : '+';
  });
}

items.forEach((item) => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    ouvrir(item.classList.contains('faq-item--ouvert') ? null : item);
  });
});

ouvrir(items[0] ?? null);
