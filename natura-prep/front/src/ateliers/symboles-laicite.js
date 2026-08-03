import './symboles-laicite.css';

/* ------------------------------------------------------------------ */
/* Données — dérivées de donnees/cours/principes-et-valeurs.json      */
/* ------------------------------------------------------------------ */

const CARTES_SYMBOLES = [
  {
    emoji: '🇫🇷',
    nom: 'Le drapeau tricolore',
    piege: false,
    essentiel:
      'Bleu = la couleur de Paris, blanc = la couleur des rois, rouge = le sang versé pour la libération du peuple. Officiel depuis 1794.',
  },
  {
    emoji: '🎼',
    nom: 'La Marseillaise',
    piege: false,
    essentiel:
      'Écrite par Rouget de Lisle en 1792 comme « Chant de guerre pour l’armée du Rhin ». Hymne national définitif en 1879.',
  },
  {
    emoji: '👒',
    nom: 'Marianne',
    piege: false,
    essentiel:
      'Figure féminine qui représente la République. Elle porte le bonnet phrygien, symbole de liberté. Son buste est présent dans toutes les mairies.',
  },
  {
    emoji: '🤝',
    nom: 'La devise',
    piege: false,
    essentiel:
      '« Liberté, Égalité, Fraternité ». Née pendant la Révolution, officielle en 1848, inscrite dans la Constitution de 1958.',
  },
  {
    emoji: '🎆',
    nom: 'Le 14 juillet',
    piege: false,
    essentiel:
      'Deux événements : la prise de la Bastille (14 juillet 1789) ET la Fête de la Fédération (14 juillet 1790). Fête nationale depuis 1880.',
  },
  {
    emoji: '🐓',
    nom: 'Le coq',
    piege: false,
    essentiel:
      'Symbole NON officiel. En latin, « gallus » signifie à la fois « Gaulois » et « coq ». Très présent dans le sport.',
  },
  {
    emoji: '⚜️',
    nom: 'La fleur de lys',
    piege: true,
    essentiel:
      'Emblème de la royauté française, PAS un symbole républicain. Ne pas la confondre avec les symboles de la République.',
  },
];

const SITUATIONS_LAICITE = [
  {
    enonce:
      'Un agent de mairie porte un signe religieux visible au guichet.',
    autorise: false,
    explication:
      'Interdit : les agents publics sont soumis à une neutralité stricte. Ils ne peuvent pas montrer leurs convictions religieuses au travail.',
  },
  {
    enonce: 'Une étudiante porte le voile à l’université.',
    autorise: true,
    explication:
      'Autorisé : la loi du 15 mars 2004 ne concerne que l’école publique (primaire, collège, lycée). Elle ne s’applique pas à l’université.',
  },
  {
    enonce:
      'Un élève porte un signe religieux ostensible au collège public.',
    autorise: false,
    explication:
      'Interdit : la loi du 15 mars 2004 interdit les signes religieux ostensibles (très visibles) à l’école publique.',
  },
  {
    enonce: 'Prier chez soi ou dans un lieu de culte.',
    autorise: true,
    explication:
      'Autorisé : la liberté de conscience garantit à chacun le droit de croire et de pratiquer sa religion, en privé comme dans un lieu de culte.',
  },
  {
    enonce: 'Critiquer une religion dans un livre.',
    autorise: true,
    explication:
      'Autorisé : le blasphème n’est pas interdit en France. La liberté d’expression permet de critiquer les religions (mais pas d’insulter les personnes).',
  },
  {
    enonce: 'L’État finance les salaires des prêtres.',
    autorise: false,
    explication:
      'Interdit : depuis la loi de 1905 de séparation des Églises et de l’État, la République ne reconnaît, ne salarie ni ne finance aucun culte.',
  },
  {
    enonce:
      'Une usagère porte un foulard religieux pour faire une démarche à la préfecture.',
    autorise: true,
    explication:
      'Autorisé : la neutralité s’impose aux agents publics, pas aux usagers. Les usagers des services publics peuvent porter des signes religieux.',
  },
  {
    enonce:
      'Un enseignant d’une école publique affiche ses convictions religieuses devant ses élèves.',
    autorise: false,
    explication:
      'Interdit : les enseignants sont des agents publics soumis à la neutralité. L’école publique protège la liberté de conscience des élèves.',
  },
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

/* ------------------------------------------------------------------ */
/* Section A — cartes symboles                                        */
/* ------------------------------------------------------------------ */

function htmlCartes() {
  const cartes = CARTES_SYMBOLES.map(
    (carte, i) => `
      <button type="button" class="at-symb-carte${carte.piege ? ' at-symb-carte-piege' : ''}"
              data-carte="${i}" aria-expanded="false">
        <span class="at-symb-carte-int">
          <span class="at-symb-face at-symb-face-avant">
            ${carte.piege ? '<span class="at-symb-badge-piege">⚠️ PIÈGE</span>' : ''}
            <span class="at-symb-emoji" aria-hidden="true">${carte.emoji}</span>
            <span class="at-symb-nom">${carte.nom}</span>
            <span class="at-symb-indice">Cliquer pour retourner</span>
          </span>
          <span class="at-symb-face at-symb-face-arriere">
            <span class="at-symb-arriere-nom">${carte.nom}</span>
            <span class="at-symb-essentiel">${carte.essentiel}</span>
          </span>
        </span>
      </button>`
  ).join('');

  return `
    <section class="at-symb-section">
      <h2 class="at-symb-titre-section">Les symboles à connaître</h2>
      <p class="at-symb-intro">Cliquez sur chaque carte pour découvrir l’essentiel à retenir.</p>
      <div class="at-symb-grille">${cartes}</div>
    </section>`;
}

/* ------------------------------------------------------------------ */
/* Section B — jeu de situations                                      */
/* ------------------------------------------------------------------ */

function htmlJeu() {
  return `
    <section class="at-symb-section">
      <h2 class="at-symb-titre-section">Laïcité : autorisé ou interdit ?</h2>
      <p class="at-symb-intro">Pour chaque situation, décidez si elle est autorisée ou interdite en France.</p>
      <div class="at-symb-jeu"></div>
    </section>`;
}

function rendreJeu(zone) {
  const situations = melanger(SITUATIONS_LAICITE);
  let index = 0;
  let score = 0;

  function afficherSituation() {
    const situation = situations[index];
    zone.innerHTML = `
      <div class="at-symb-progression">Situation ${index + 1} / ${situations.length}</div>
      <p class="at-symb-enonce">${situation.enonce}</p>
      <div class="at-symb-choix">
        <button type="button" class="at-symb-btn at-symb-btn-autorise" data-reponse="autorise">✔ Autorisé</button>
        <button type="button" class="at-symb-btn at-symb-btn-interdit" data-reponse="interdit">✖ Interdit</button>
      </div>
      <div class="at-symb-feedback" hidden></div>
      <div class="at-symb-suite" hidden>
        <button type="button" class="at-symb-btn-suite">
          ${index + 1 < situations.length ? 'Situation suivante →' : 'Voir mon score'}
        </button>
      </div>`;

    const boutons = zone.querySelectorAll('.at-symb-btn');
    boutons.forEach((bouton) => {
      bouton.addEventListener('click', () => {
        const reponseAutorise = bouton.dataset.reponse === 'autorise';
        const correct = reponseAutorise === situation.autorise;
        if (correct) score += 1;

        boutons.forEach((b) => {
          b.disabled = true;
          const estBonneReponse =
            (b.dataset.reponse === 'autorise') === situation.autorise;
          if (b === bouton) {
            b.classList.add(correct ? 'at-symb-btn-vrai' : 'at-symb-btn-faux');
          } else if (estBonneReponse) {
            b.classList.add('at-symb-btn-vrai');
          }
        });

        const feedback = zone.querySelector('.at-symb-feedback');
        feedback.hidden = false;
        feedback.classList.add(correct ? 'at-symb-feedback-vrai' : 'at-symb-feedback-faux');
        feedback.innerHTML = `
          <strong>${correct ? 'Bonne réponse !' : 'Mauvaise réponse.'}</strong>
          <span>${situation.explication}</span>`;

        const suite = zone.querySelector('.at-symb-suite');
        suite.hidden = false;
        suite.querySelector('.at-symb-btn-suite').focus();
      });
    });

    zone.querySelector('.at-symb-btn-suite').addEventListener('click', () => {
      index += 1;
      if (index < situations.length) {
        afficherSituation();
      } else {
        afficherScore();
      }
    });
  }

  function afficherScore() {
    let message;
    if (score === situations.length) {
      message = 'Parfait ! La laïcité n’a plus de secret pour vous.';
    } else if (score >= 6) {
      message = 'Très bien ! Encore un petit effort pour tout maîtriser.';
    } else if (score >= 4) {
      message = 'Pas mal, mais relisez la fiche sur la laïcité avant l’entretien.';
    } else {
      message = 'Rejouez après avoir relu la fiche « La laïcité » du cours.';
    }
    zone.innerHTML = `
      <div class="at-symb-score">
        <div class="at-symb-score-note">${score} / ${situations.length}</div>
        <p class="at-symb-score-message">${message}</p>
        <button type="button" class="at-symb-btn-rejouer">↺ Rejouer</button>
      </div>`;
    zone.querySelector('.at-symb-btn-rejouer').addEventListener('click', () => {
      rendreJeu(zone);
    });
  }

  afficherSituation();
}

/* ------------------------------------------------------------------ */
/* Module                                                             */
/* ------------------------------------------------------------------ */

export default {
  slug: 'symboles-laicite',
  thematique: 'principes-et-valeurs',
  titre: 'Symboles et laïcité en pratique',
  description:
    'Retournez les cartes des symboles, puis tranchez des situations réelles de laïcité.',
  icone: '🇫🇷',
  rendre(conteneur) {
    /* innerHTML remplace tout le contenu précédent : les anciens
       écouteurs partent avec leurs éléments, aucune fuite possible. */
    conteneur.innerHTML = `
      <div class="at-symb">
        ${htmlCartes()}
        ${htmlJeu()}
      </div>`;

    conteneur.querySelectorAll('.at-symb-carte').forEach((carte) => {
      carte.addEventListener('click', () => {
        const retournee = carte.classList.toggle('at-symb-retournee');
        carte.setAttribute('aria-expanded', String(retournee));
      });
    });

    rendreJeu(conteneur.querySelector('.at-symb-jeu'));
  },
};
