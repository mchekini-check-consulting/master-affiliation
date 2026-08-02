import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './style.css';

// Forme d'onde du mockup de simulation (hauteurs reprises du design)
const HAUTEURS_ONDE = [
  8, 14, 22, 12, 18, 26, 10, 16, 24, 14, 20, 9,
  15, 23, 11, 19, 25, 13, 17, 8, 21, 12, 16, 10,
];
const onde = document.querySelector('[data-onde]');
if (onde) {
  onde.innerHTML = HAUTEURS_ONDE
    .map((h) => `<span style="height:${h}px"></span>`)
    .join('');
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
