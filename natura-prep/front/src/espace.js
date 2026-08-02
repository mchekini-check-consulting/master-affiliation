import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import './membre.css';
import { api } from './api.js';
import { rendreCours } from './cours.js';

const SECTIONS = ['cours', 'quizz', 'simulations', 'rapports'];

const espace = document.querySelector('[data-espace]');
const liens = Array.from(document.querySelectorAll('.lateral-lien'));
const panneaux = Array.from(document.querySelectorAll('[data-panneau]'));

// Navigation par ancre : #cours, #cours/<thematique>/<fiche>, #quizz…
function rendre() {
  const segments = window.location.hash.replace('#', '').split('/').filter(Boolean);
  const section = SECTIONS.includes(segments[0]) ? segments[0] : 'cours';
  panneaux.forEach((p) => (p.hidden = p.dataset.panneau !== section));
  liens.forEach((l) => l.classList.toggle('actif', l.dataset.section === section));
  if (section === 'cours') rendreCours(segments.slice(1));
}

window.addEventListener('hashchange', rendre);

liens.forEach((lien) => {
  lien.addEventListener('click', () => {
    if (window.location.hash === `#${lien.dataset.section}`) rendre();
    else window.location.hash = lien.dataset.section;
  });
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

  rendre();
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
