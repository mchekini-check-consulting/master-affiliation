import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './style.css';

// Vidéo hero : lecture unique (pas de boucle ni de replay). L'autoplay
// sonore étant bloqué par les navigateurs, la vidéo démarre muette et le
// son s'active au clic. On relance aussi l'autoplay par sécurité si la
// source n'était pas prête au moment du parsing.
const video = document.querySelector('.hero-video');
const boutonSon = document.getElementById('hero-son');
if (video && boutonSon) {
  const relancer = () => {
    if (video.paused && !video.ended) video.play().catch(() => {});
  };
  video.addEventListener('canplay', relancer, { once: true });
  setTimeout(relancer, 800);

  boutonSon.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted && !video.ended) video.play().catch(() => {});
    boutonSon.textContent = video.muted ? '🔇 Activer le son' : '🔊 Couper le son';
    boutonSon.setAttribute(
      'aria-label',
      video.muted ? 'Activer le son' : 'Couper le son'
    );
  });

  // Une fois la vidéo terminée, le bouton n'a plus d'utilité
  video.addEventListener('ended', () => {
    boutonSon.hidden = true;
  });
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
