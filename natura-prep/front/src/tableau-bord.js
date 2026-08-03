// Tableau de bord de l'espace membre : progression globale, reprise des
// cours, dernier rapport d'entretien et suggestions de révision.
import { api } from './api.js';
import { thematiques } from './donnees/cours/index.js';
import { quizParTheme } from './donnees/quiz/index.js';
import { ateliersDeThematique } from './ateliers/index.js';
import {
  ficheLue,
  compterFichesLues,
  atelierLance,
  meilleurScoreQuiz,
  avancementThematique,
} from './progression.js';

const conteneur = () => document.querySelector('[data-accueil]');

const AVIS_CLASSE = { favorable: 'favorable', 'réservé': 'reserve', 'défavorable': 'defavorable' };

function dateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

/* ---------- Sélection des suggestions ---------- */

function prochaineFiche() {
  for (const t of thematiques) {
    const fiche = t.fiches.find((f) => !ficheLue(t.slug, f.slug));
    if (fiche) return { thematique: t, fiche };
  }
  return null;
}

function quizConseille() {
  // Le quiz jamais joué d'abord, sinon le plus faible record sous 80 %
  const jamais = quizParTheme.find((q) => meilleurScoreQuiz(q.slug) === null);
  if (jamais) return { slug: jamais.slug, record: null };
  const faible = [...quizParTheme]
    .map((q) => ({ slug: q.slug, record: meilleurScoreQuiz(q.slug) }))
    .sort((a, b) => a.record - b.record)[0];
  return faible && faible.record < 80 ? faible : null;
}

function atelierADecouvrir() {
  for (const t of thematiques) {
    const atelier = ateliersDeThematique(t.slug).find((a) => !atelierLance(a.slug));
    if (atelier) return { thematique: t, atelier };
  }
  return null;
}

function titreThematique(slug) {
  return thematiques.find((t) => t.slug === slug)?.titre || slug;
}

/* ---------- Rendu ---------- */

export async function rendreTableauBord() {
  const nom = document.querySelector('[data-nom]')?.textContent || '';
  const prenom = nom.split(/\s+/)[0] || '';

  // Progression globale pondérée par le nombre d'éléments de chaque thématique
  let fait = 0;
  let total = 0;
  const parThematique = thematiques.map((t) => {
    const ateliers = ateliersDeThematique(t.slug);
    const nbElements = t.fiches.length + ateliers.length + 1; // + le quiz
    total += nbElements;
    fait += compterFichesLues(t);
    fait += ateliers.filter((a) => atelierLance(a.slug)).length;
    if (meilleurScoreQuiz(t.slug) !== null) fait += 1;
    return { t, avancement: avancementThematique(t, ateliers, t.slug) };
  });
  const global = total ? Math.round((fait / total) * 100) : 0;

  const fiche = prochaineFiche();
  const quiz = quizConseille();
  const atelier = atelierADecouvrir();

  conteneur().innerHTML = `
    <header class="page-tete">
      <div>
        <h1>Bonjour${prenom ? ` ${prenom}` : ''} 👋</h1>
        <p class="page-sous">Voici où vous en êtes dans votre préparation à l'entretien de naturalisation.</p>
      </div>
    </header>

    <div class="tb-grille">
      <section class="tb-carte tb-progression">
        <div class="tb-anneau" style="--pct:${global}">
          <span class="tb-anneau-valeur">${global}%</span>
        </div>
        <div class="tb-progression-detail">
          <h2>Progression globale</h2>
          ${parThematique
            .map(
              ({ t, avancement }) => `
            <a class="tb-ligne" href="#cours/${t.slug}">
              <span class="tb-ligne-nom">${t.icone} ${t.titre}</span>
              <span class="tb-ligne-barre"><i style="width:${avancement}%"></i></span>
              <span class="tb-ligne-pct">${avancement}%</span>
            </a>`
            )
            .join('')}
        </div>
      </section>

      <section class="tb-carte" data-rapport-carte>
        <h2>🎙️ Dernier entretien</h2>
        <p class="tb-attente">Chargement…</p>
      </section>

      <section class="tb-carte">
        <h2>🎯 À faire maintenant</h2>
        <div class="tb-suggestions">
          ${
            fiche
              ? `<a class="tb-suggestion" href="#cours/${fiche.thematique.slug}/${fiche.fiche.slug}">
                  <span class="tb-suggestion-type">📖 Reprendre les cours</span>
                  <strong>${fiche.fiche.titre}</strong>
                  <span class="tb-suggestion-detail">${fiche.thematique.titre}</span>
                </a>`
              : `<div class="tb-suggestion tb-suggestion--fait">
                  <span class="tb-suggestion-type">📖 Cours</span>
                  <strong>Toutes les fiches sont lues 🎉</strong>
                </div>`
          }
          ${
            quiz
              ? `<a class="tb-suggestion" href="#quizz/${quiz.slug}">
                  <span class="tb-suggestion-type">✅ Quiz conseillé</span>
                  <strong>${titreThematique(quiz.slug)}</strong>
                  <span class="tb-suggestion-detail">${quiz.record === null ? 'Jamais joué' : `Record actuel : ${quiz.record}% — visez 80%`}</span>
                </a>`
              : ''
          }
          ${
            atelier
              ? `<a class="tb-suggestion" href="#cours/${atelier.thematique.slug}/atelier/${atelier.atelier.slug}">
                  <span class="tb-suggestion-type">✨ Atelier à découvrir</span>
                  <strong>${atelier.atelier.icone} ${atelier.atelier.titre}</strong>
                  <span class="tb-suggestion-detail">${atelier.thematique.titre}</span>
                </a>`
              : ''
          }
        </div>
      </section>
    </div>
  `;

  chargerDernierRapport();
}

async function chargerDernierRapport() {
  const carte = conteneur().querySelector('[data-rapport-carte]');
  let rapports = [];
  try {
    rapports = await api('/simulation/rapports');
  } catch {
    // silencieux : la carte propose simplement de lancer une simulation
  }
  if (!carte || !carte.isConnected) return;

  const dernier = rapports[0];
  if (!dernier) {
    carte.innerHTML = `
      <h2>🎙️ Simulation d'entretien</h2>
      <p class="tb-vide-texte">
        Vous n'avez pas encore passé d'entretien simulé. Un agent virtuel vous
        interroge à l'oral, puis vous recevez un rapport complet.
      </p>
      <a class="quiz-suivant tb-cta" href="#simulations">Lancer ma première simulation</a>
    `;
    return;
  }
  carte.innerHTML = `
    <h2>🎙️ Dernier entretien</h2>
    <p class="tb-rapport-date">Le ${dateFr(dernier.cree_le)} · ${Math.round(dernier.duree_secondes / 60)} min</p>
    <div class="tb-rapport-notes">
      <span class="rapport-puce">CECRL ${dernier.niveau_cecrl}</span>
      <span class="rapport-puce">${dernier.score_civique >= 0 ? `${dernier.score_civique}/20 civique` : 'civique —'}</span>
      <span class="rapport-avis rapport-avis--${AVIS_CLASSE[dernier.avis] || 'reserve'}">${dernier.avis}</span>
    </div>
    <div class="tb-rapport-actions">
      <a class="quiz-suivant tb-cta" href="#rapports/${dernier.id}">Revoir le rapport</a>
      <a class="quiz-secondaire tb-cta" href="#simulations">Nouvel entretien</a>
    </div>
  `;
}
