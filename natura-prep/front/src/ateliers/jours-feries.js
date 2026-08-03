import './jours-feries.css';

/* ------------------------------------------------------------------ */
/* Données — dérivées de donnees/cours/histoire-geographie-culture    */
/* (fiche « Culture et patrimoine »), complétées pour les fêtes       */
/* religieuses du calendrier.                                         */
/* ------------------------------------------------------------------ */

const JOURS_FERIES = [
  {
    mois: 1,
    dateCourte: '1er janv.',
    date: '1er janvier',
    nom: 'Jour de l’An',
    emoji: '🎉',
    type: 'civil',
    piege: false,
    origine:
      'Premier jour de l’année du calendrier civil. On fête simplement la nouvelle année : ce jour férié n’a aucune origine religieuse.',
  },
  {
    mois: 4,
    dateCourte: 'Mars–avr.',
    date: 'Mars ou avril (date mobile)',
    nom: 'Lundi de Pâques',
    emoji: '🐣',
    type: 'religieux',
    piege: false,
    origine:
      'Lendemain du dimanche de Pâques, fête chrétienne qui célèbre la résurrection du Christ. Sa date change chaque année : elle tombe en mars ou en avril.',
  },
  {
    mois: 5,
    dateCourte: '1er mai',
    date: '1er mai',
    nom: 'Fête du Travail',
    emoji: '💐',
    type: 'civil',
    piege: false,
    origine:
      'Journée qui célèbre le droit du travail. Elle trouve son origine dans les combats ouvriers pour la journée de huit heures, à la fin du XIXe siècle. C’est le jour où l’on offre du muguet.',
  },
  {
    mois: 5,
    dateCourte: '8 mai',
    date: '8 mai',
    nom: 'Victoire de 1945',
    emoji: '🕊️',
    type: 'civil',
    piege: true,
    origine:
      'Fin de la Seconde Guerre mondiale en Europe : l’Allemagne capitule le 8 mai 1945. C’est une commémoration de guerre, donc un jour férié civil, pas religieux.',
  },
  {
    mois: 5,
    dateCourte: 'Mai',
    date: 'Un jeudi de mai (date mobile)',
    nom: 'Ascension',
    emoji: '☁️',
    type: 'religieux',
    piege: false,
    origine:
      'Fête chrétienne qui célèbre la montée de Jésus au ciel, 40 jours après Pâques. Elle tombe toujours un jeudi, en mai.',
  },
  {
    mois: 6,
    dateCourte: 'Mai–juin',
    date: 'Mai ou juin (date mobile)',
    nom: 'Lundi de Pentecôte',
    emoji: '🔥',
    type: 'religieux',
    piege: false,
    origine:
      'La Pentecôte, fête chrétienne, célèbre la descente du Saint-Esprit sur les apôtres, 50 jours après Pâques. Le lundi qui suit est férié.',
  },
  {
    mois: 7,
    dateCourte: '14 juil.',
    date: '14 juillet',
    nom: 'Fête nationale',
    emoji: '🎆',
    type: 'civil',
    piege: true,
    origine:
      'Elle renvoie aux DEUX 14 juillet : la prise de la Bastille (1789) ET la fête de la Fédération (1790). Fête nationale depuis 1880, c’est le grand jour férié civil de la République.',
  },
  {
    mois: 8,
    dateCourte: '15 août',
    date: '15 août',
    nom: 'Assomption',
    emoji: '🌟',
    type: 'religieux',
    piege: false,
    origine:
      'Fête chrétienne qui célèbre la montée de la Vierge Marie au ciel. Le 15 août est un jour férié d’origine religieuse.',
  },
  {
    mois: 11,
    dateCourte: '1er nov.',
    date: '1er novembre',
    nom: 'Toussaint',
    emoji: '🕯️',
    type: 'religieux',
    piege: false,
    origine:
      'Fête chrétienne de tous les saints. C’est autour de la Toussaint que les familles fleurissent les tombes de leurs proches.',
  },
  {
    mois: 11,
    dateCourte: '11 nov.',
    date: '11 novembre',
    nom: 'Armistice de 1918',
    emoji: '🎖️',
    type: 'civil',
    piege: true,
    origine:
      'Armistice qui met fin aux combats de la Première Guerre mondiale, signé le 11 novembre 1918. Comme le 8 mai, c’est une commémoration de guerre : un jour férié civil.',
  },
  {
    mois: 12,
    dateCourte: '25 déc.',
    date: '25 décembre',
    nom: 'Noël',
    emoji: '🎄',
    type: 'religieux',
    piege: false,
    origine:
      'Fête chrétienne qui célèbre la naissance de Jésus-Christ. Noël est aussi devenu une grande fête familiale, mais son origine est religieuse.',
  },
];

const MOIS = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
];

/* ------------------------------------------------------------------ */
/* Utilitaires                                                        */
/* ------------------------------------------------------------------ */

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function htmlBadge(type) {
  return type === 'civil'
    ? '<span class="at-jf-badge at-jf-badge-civil">⚱️ Civil</span>'
    : '<span class="at-jf-badge at-jf-badge-religieux">⛪ Religieux</span>';
}

/* ------------------------------------------------------------------ */
/* Section A — la frise du calendrier                                 */
/* ------------------------------------------------------------------ */

function htmlFrise() {
  const mois = MOIS.map(
    (nom) => `<span class="at-jf-mois">${nom}</span>`
  ).join('');

  const vignettes = JOURS_FERIES.map(
    (jour, i) => `
      <button type="button"
              class="at-jf-vignette at-jf-vignette-${jour.type}"
              data-jour="${i}" style="grid-column: ${jour.mois};"
              aria-expanded="false">
        <span class="at-jf-vignette-date">${jour.dateCourte}</span>
        <span class="at-jf-vignette-emoji" aria-hidden="true">${jour.emoji}</span>
        <span class="at-jf-vignette-nom">${jour.nom}</span>
      </button>`
  ).join('');

  return `
    <section class="at-jf-section">
      <h2 class="at-jf-titre-section">Le calendrier</h2>
      <p class="at-jf-intro">La France compte 11 jours fériés dans l’année. Cliquez sur chacun d’eux pour découvrir son origine.</p>
      <div class="at-jf-legende">
        <span class="at-jf-legende-item at-jf-legende-civil"><span class="at-jf-pastille" aria-hidden="true"></span> ⚱️ Civil</span>
        <span class="at-jf-legende-item at-jf-legende-religieux"><span class="at-jf-pastille" aria-hidden="true"></span> ⛪ Religieux</span>
      </div>
      <div class="at-jf-frise">
        <div class="at-jf-frise-mois" aria-hidden="true">${mois}</div>
        <div class="at-jf-frise-grille">${vignettes}</div>
      </div>
      <div class="at-jf-panneau">
        <p class="at-jf-panneau-indice">👉 Cliquez sur un jour férié de la frise pour afficher son origine.</p>
      </div>
    </section>`;
}

function afficherDetail(panneau, jour) {
  panneau.className = `at-jf-panneau at-jf-panneau-${jour.type}`;
  panneau.innerHTML = `
    <div class="at-jf-panneau-tete">
      <span class="at-jf-panneau-emoji" aria-hidden="true">${jour.emoji}</span>
      <div class="at-jf-panneau-titres">
        <div class="at-jf-panneau-nom">${jour.nom}</div>
        <div class="at-jf-panneau-date">${jour.date}</div>
      </div>
      ${htmlBadge(jour.type)}
    </div>
    <p class="at-jf-panneau-origine">${jour.origine}</p>`;
}

/* ------------------------------------------------------------------ */
/* Section B — jeu « Civil ou religieux ? »                           */
/* ------------------------------------------------------------------ */

function htmlJeu() {
  return `
    <section class="at-jf-section">
      <h2 class="at-jf-titre-section">Civil ou religieux ?</h2>
      <p class="at-jf-intro">Pour chaque jour férié, dites s’il est d’origine civile ou religieuse. Attention aux pièges !</p>
      <div class="at-jf-jeu"></div>
    </section>`;
}

function rendreJeu(zone) {
  const fetes = melanger(JOURS_FERIES);
  let index = 0;
  let score = 0;

  function afficherFete() {
    const fete = fetes[index];
    zone.innerHTML = `
      <div class="at-jf-progression">Fête ${index + 1} / ${fetes.length}</div>
      <div class="at-jf-enonce">
        <span class="at-jf-enonce-emoji" aria-hidden="true">${fete.emoji}</span>
        <div>
          <div class="at-jf-enonce-nom">${fete.nom}</div>
          <div class="at-jf-enonce-date">${fete.date}</div>
        </div>
      </div>
      <div class="at-jf-choix">
        <button type="button" class="at-jf-btn at-jf-btn-civil" data-reponse="civil">⚱️ Civil</button>
        <button type="button" class="at-jf-btn at-jf-btn-religieux" data-reponse="religieux">⛪ Religieux</button>
      </div>
      <div class="at-jf-feedback" hidden></div>
      <div class="at-jf-suite" hidden>
        <button type="button" class="at-jf-btn-suite">
          ${index + 1 < fetes.length ? 'Fête suivante →' : 'Voir mon score'}
        </button>
      </div>`;

    const boutons = zone.querySelectorAll('.at-jf-btn');
    boutons.forEach((bouton) => {
      bouton.addEventListener('click', () => {
        const correct = bouton.dataset.reponse === fete.type;
        if (correct) score += 1;

        boutons.forEach((b) => {
          b.disabled = true;
          if (b === bouton) {
            b.classList.add(correct ? 'at-jf-btn-vrai' : 'at-jf-btn-faux');
          } else if (b.dataset.reponse === fete.type) {
            b.classList.add('at-jf-btn-vrai');
          }
        });

        const feedback = zone.querySelector('.at-jf-feedback');
        feedback.hidden = false;
        feedback.classList.add(correct ? 'at-jf-feedback-vrai' : 'at-jf-feedback-faux');
        feedback.innerHTML = `
          <strong>${correct ? 'Bonne réponse !' : 'Mauvaise réponse.'} ${htmlBadge(fete.type)}</strong>
          <span>${fete.origine}</span>
          ${fete.piege ? '<span class="at-jf-piege-note">💡 Piège classique de l’entretien !</span>' : ''}`;

        const suite = zone.querySelector('.at-jf-suite');
        suite.hidden = false;
        suite.querySelector('.at-jf-btn-suite').focus();
      });
    });

    zone.querySelector('.at-jf-btn-suite').addEventListener('click', () => {
      index += 1;
      if (index < fetes.length) {
        afficherFete();
      } else {
        afficherScore();
      }
    });
  }

  function afficherScore() {
    let message;
    if (score === fetes.length) {
      message = 'Parfait ! Le calendrier des jours fériés n’a plus de secret pour vous.';
    } else if (score >= 8) {
      message = 'Très bien ! Revoyez juste les fêtes qui vous ont piégé.';
    } else if (score >= 5) {
      message = 'Pas mal. Retenez le réflexe : 8 mai et 11 novembre = guerres, donc civil.';
    } else {
      message = 'Rejouez après avoir relu la frise du calendrier ci-dessus.';
    }
    zone.innerHTML = `
      <div class="at-jf-score">
        <div class="at-jf-score-note">${score} / ${fetes.length}</div>
        <p class="at-jf-score-message">${message}</p>
        <button type="button" class="at-jf-btn-rejouer">↺ Rejouer</button>
      </div>`;
    zone.querySelector('.at-jf-btn-rejouer').addEventListener('click', () => {
      rendreJeu(zone);
    });
  }

  afficherFete();
}

/* ------------------------------------------------------------------ */
/* Module                                                             */
/* ------------------------------------------------------------------ */

export default {
  slug: 'jours-feries',
  thematique: 'histoire-geographie-culture',
  titre: 'Le calendrier des jours fériés',
  description: 'Les 11 jours fériés, leur origine et le réflexe civil ou religieux.',
  icone: '📅',
  rendre(conteneur) {
    /* innerHTML remplace tout le contenu précédent : les anciens
       écouteurs partent avec leurs éléments, aucune fuite possible. */
    conteneur.innerHTML = `
      <div class="at-jf">
        ${htmlFrise()}
        ${htmlJeu()}
      </div>`;

    const panneau = conteneur.querySelector('.at-jf-panneau');
    const vignettes = conteneur.querySelectorAll('.at-jf-vignette');
    vignettes.forEach((vignette) => {
      vignette.addEventListener('click', () => {
        vignettes.forEach((v) => {
          v.classList.remove('at-jf-vignette-active');
          v.setAttribute('aria-expanded', 'false');
        });
        vignette.classList.add('at-jf-vignette-active');
        vignette.setAttribute('aria-expanded', 'true');
        afficherDetail(panneau, JOURS_FERIES[Number(vignette.dataset.jour)]);
      });
    });

    rendreJeu(conteneur.querySelector('.at-jf-jeu'));
  },
};
