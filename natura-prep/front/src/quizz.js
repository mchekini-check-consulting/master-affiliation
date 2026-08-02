// Rendu de la section « Quizz » : un quiz par thématique + un quiz
// général mélangé. Une question à la fois, correction immédiate, score.
import { thematiques } from './donnees/cours/index.js';
import {
  quizParTheme,
  tirerQuizGeneral,
  NB_QUESTIONS_GENERAL,
} from './donnees/quiz/index.js';

const conteneur = () => document.querySelector('[data-quizz]');

// Session en cours (perdue si on quitte le quiz : volontairement simple)
let session = null;

export function rendreQuizz(segments) {
  const [slug] = segments;
  if (slug === 'general') {
    demarrer('general');
    return;
  }
  const theme = quizParTheme.find((q) => q.slug === slug);
  if (theme) {
    demarrer(slug);
    return;
  }
  session = null;
  rendreAccueil();
}

/* ---------- Accueil : choix du quiz ---------- */

function infosTheme(slug) {
  return thematiques.find((t) => t.slug === slug) || { titre: slug, icone: '❓' };
}

function rendreAccueil() {
  const total = quizParTheme.reduce((n, q) => n + q.questions.length, 0);
  conteneur().innerHTML = `
    <header class="page-tete">
      <div>
        <h1>Quizz</h1>
        <p class="page-sous">
          ${total} questions type entretien pour vous évaluer, thématique par
          thématique — ou tout mélanger avec le quiz général.
        </p>
      </div>
    </header>

    <a class="quiz-general" href="#quizz/general">
      <span class="quiz-general-ico" aria-hidden="true">🎯</span>
      <span class="quiz-general-corps">
        <strong>Quiz général</strong>
        <span>${NB_QUESTIONS_GENERAL} questions tirées au hasard dans toutes les thématiques — comme le jour J.</span>
      </span>
      <span class="quiz-general-cta">Commencer →</span>
    </a>

    <div class="quiz-liste">
      ${quizParTheme
        .map((q) => {
          const t = infosTheme(q.slug);
          return `
        <a class="quiz-carte" href="#quizz/${q.slug}">
          <span class="thematique-ico" aria-hidden="true">${t.icone}</span>
          <span class="quiz-carte-corps">
            <strong>${t.titre}</strong>
            <span>${q.questions.length} questions</span>
          </span>
          <span class="fiche-fleche" aria-hidden="true">→</span>
        </a>`;
        })
        .join('')}
    </div>
  `;
}

/* ---------- Session de quiz ---------- */

function demarrer(slug) {
  const general = slug === 'general';
  const theme = general ? null : quizParTheme.find((q) => q.slug === slug);
  const infos = general
    ? { titre: 'Quiz général', icone: '🎯' }
    : infosTheme(slug);
  session = {
    slug,
    titre: infos.titre,
    icone: infos.icone,
    questions: general ? tirerQuizGeneral() : theme.questions,
    index: 0,
    score: 0,
    repondu: false,
  };
  rendreQuestion();
}

function rendreQuestion() {
  const q = session.questions[session.index];
  const progression = Math.round((session.index / session.questions.length) * 100);
  conteneur().innerHTML = `
    <nav class="cours-retour"><a href="#quizz">← Tous les quizz</a></nav>
    <div class="quiz-session">
      <div class="quiz-tete">
        <p class="fiche-etiquette">${session.icone} ${session.titre}</p>
        <div class="quiz-avancement">
          <span>Question ${session.index + 1} / ${session.questions.length}</span>
          <span class="quiz-score">Score : ${session.score}</span>
        </div>
        <div class="quiz-barre"><div style="width:${progression}%"></div></div>
      </div>

      <h2 class="quiz-question">${q.question}</h2>
      <div class="quiz-options">
        ${q.options
          .map(
            (o, i) => `
          <button type="button" class="quiz-option" data-option="${i}">
            <span class="quiz-lettre">${'ABCD'[i]}</span>
            <span>${o}</span>
          </button>`
          )
          .join('')}
      </div>
      <div class="quiz-feedback" data-feedback hidden>
        <p data-explication></p>
        <button type="button" class="quiz-suivant" data-suivant></button>
      </div>
    </div>
  `;

  const options = Array.from(conteneur().querySelectorAll('.quiz-option'));
  options.forEach((bouton, i) => {
    bouton.addEventListener('click', () => {
      if (session.repondu) return;
      session.repondu = true;
      const bonne = q.reponse;
      if (i === bonne) {
        session.score += 1;
        bouton.classList.add('quiz-option--bonne');
      } else {
        bouton.classList.add('quiz-option--mauvaise');
        options[bonne].classList.add('quiz-option--bonne');
      }
      options.forEach((b) => (b.disabled = true));
      const feedback = conteneur().querySelector('[data-feedback]');
      feedback.hidden = false;
      feedback.querySelector('[data-explication]').textContent = q.explication;
      const suivant = feedback.querySelector('[data-suivant]');
      suivant.textContent =
        session.index + 1 < session.questions.length
          ? 'Question suivante →'
          : 'Voir mon résultat';
      suivant.focus();
      // Met à jour le score affiché
      conteneur().querySelector('.quiz-score').textContent = `Score : ${session.score}`;
    });
  });

  conteneur()
    .querySelector('[data-suivant]')
    .addEventListener('click', () => {
      session.index += 1;
      session.repondu = false;
      if (session.index < session.questions.length) rendreQuestion();
      else rendreResultat();
    });

  window.scrollTo(0, 0);
}

function rendreResultat() {
  const total = session.questions.length;
  const pct = Math.round((session.score / total) * 100);
  let message;
  if (pct >= 90) message = 'Excellent ! Vous êtes prêt pour l\'entretien.';
  else if (pct >= 70) message = 'Très bien ! Encore quelques révisions et ce sera parfait.';
  else if (pct >= 50) message = 'Bon début — relisez les fiches des questions ratées.';
  else message = 'Continuez à réviser les cours, puis retentez ce quiz.';

  conteneur().innerHTML = `
    <nav class="cours-retour"><a href="#quizz">← Tous les quizz</a></nav>
    <div class="quiz-session quiz-resultat">
      <p class="fiche-etiquette">${session.icone} ${session.titre}</p>
      <p class="quiz-note">${session.score} / ${total}</p>
      <p class="quiz-pct">${pct} % de bonnes réponses</p>
      <p class="quiz-message">${message}</p>
      <div class="quiz-resultat-actions">
        <a class="quiz-suivant" href="#quizz/${session.slug}" data-rejouer>Rejouer ce quiz</a>
        <a class="quiz-secondaire" href="#quizz">Choisir un autre quiz</a>
        <a class="quiz-secondaire" href="#cours">Revoir les cours</a>
      </div>
    </div>
  `;
  // « Rejouer » : le hash ne change pas si on est déjà dessus → relance manuelle
  conteneur()
    .querySelector('[data-rejouer]')
    .addEventListener('click', (e) => {
      if (window.location.hash === `#quizz/${session.slug}`) {
        e.preventDefault();
        demarrer(session.slug);
      }
    });
  window.scrollTo(0, 0);
}
