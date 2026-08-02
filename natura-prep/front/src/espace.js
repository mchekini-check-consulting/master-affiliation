import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './membre.css';
import { api } from './api.js';

const espace = document.querySelector('[data-espace]');
const liens = Array.from(document.querySelectorAll('.lateral-lien'));
const panneaux = Array.from(document.querySelectorAll('[data-panneau]'));

// Navigation entre sections (l'ancre permet de revenir sur la même section)
function afficherSection(nom) {
  const cible = panneaux.some((p) => p.dataset.panneau === nom) ? nom : 'cours';
  panneaux.forEach((p) => (p.hidden = p.dataset.panneau !== cible));
  liens.forEach((l) => l.classList.toggle('actif', l.dataset.section === cible));
  history.replaceState(null, '', `#${cible}`);
}

liens.forEach((lien) => {
  lien.addEventListener('click', () => afficherSection(lien.dataset.section));
});

// Garde d'accès : l'espace ne s'affiche qu'une fois le membre identifié
async function initialiser() {
  let profil;
  try {
    profil = await api('/auth/me');
  } catch {
    window.location.replace('/connexion/');
    return;
  }
  const { nom, email } = profil.membre;
  document.querySelector('[data-nom]').textContent = nom;
  document.querySelector('[data-email]').textContent = email;
  document.querySelector('[data-avatar]').textContent = nom
    .split(/\s+/)
    .map((m) => m[0])
    .slice(0, 2)
    .join('');

  afficherSection(window.location.hash.replace('#', '') || 'cours');
  espace.hidden = false;
}

document.querySelector('[data-deconnexion]').addEventListener('click', async () => {
  try {
    await api('/auth/logout', { methode: 'POST' });
  } finally {
    window.location.href = '/connexion/';
  }
});

initialiser();
