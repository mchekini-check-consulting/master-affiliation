import './vivre-la-devise.css';

/* Atelier « Vivre la devise » — jeu de classement dérivé des cours
   « Principes et valeurs » (src/donnees/cours/principes-et-valeurs.json)
   et « Droits et devoirs » (src/donnees/cours/droits-et-devoirs.json). */

const SITUATIONS = [
  {
    texte: 'La Sécurité sociale rembourse vos soins quand vous êtes malade',
    reponse: 'fraternite',
    explication:
      "C'est la Fraternité : la Sécurité sociale, créée en 1945, est un exemple concret de solidarité entre les citoyens. Elle est financée par les cotisations des entreprises et des personnes qui travaillent.",
  },
  {
    texte: 'Défiler dans la rue pour exprimer une opinion',
    reponse: 'liberte',
    explication:
      "C'est la Liberté : manifester est une liberté collective, comme le droit de se rassembler. Il faut déclarer la manifestation à l'avance et rester pacifique.",
  },
  {
    texte: 'Les femmes et les hommes ont les mêmes droits',
    reponse: 'egalite',
    explication:
      "C'est l'Égalité : depuis la Constitution de 1946, la loi garantit à la femme des droits égaux à ceux de l'homme dans tous les domaines (éducation, travail, santé, vie politique).",
  },
  {
    texte: 'Croire, ne pas croire ou changer de religion',
    reponse: 'liberte',
    explication:
      "C'est la Liberté : la liberté de conscience vient de la Déclaration des droits de l'homme et du citoyen de 1789. La laïcité garantit ce choix à chacun.",
  },
  {
    texte: "L'école publique est gratuite pour tous les enfants",
    reponse: 'egalite',
    explication:
      "C'est l'Égalité : chacun a accès à l'éducation sans discrimination. L'école publique gratuite et laïque garantit les mêmes chances à tous les enfants.",
  },
  {
    texte: 'Des bénévoles distribuent des repas aux personnes démunies',
    reponse: 'fraternite',
    explication:
      "C'est la Fraternité : l'engagement associatif (aide alimentaire, soutien scolaire, aide aux réfugiés) est une forme de solidarité rendue possible par la liberté d'association de 1901.",
  },
  {
    texte: 'Un journal peut critiquer le gouvernement',
    reponse: 'liberte',
    explication:
      "C'est la Liberté : la liberté d'expression permet à chacun, y compris à la presse, de dire ce qu'il pense, dans le respect de la loi.",
  },
  {
    texte: "Refuser d'embaucher quelqu'un à cause de son origine est interdit",
    reponse: 'egalite',
    explication:
      "C'est l'Égalité : la loi française interdit la discrimination selon plus de 26 critères (origine, sexe, âge, handicap, religion…). Les sanctions vont de l'amende à la prison.",
  },
  {
    texte: 'Les personnes qui travaillent financent les retraites des aînés',
    reponse: 'fraternite',
    explication:
      "C'est la Fraternité : la solidarité entre générations fait que les actifs d'aujourd'hui paient les retraites de leurs aînés.",
  },
  {
    texte: 'Adhérer à un syndicat pour défendre les travailleurs',
    reponse: 'liberte',
    explication:
      "C'est la Liberté : adhérer à un syndicat est une liberté collective, au même titre que le droit de se rassembler ou de manifester.",
  },
  {
    texte: 'La loi est la même pour tous, riches ou pauvres',
    reponse: 'egalite',
    explication:
      "C'est l'Égalité : l'égalité devant la loi est un principe fondamental inscrit dans la Constitution et dans la Déclaration des droits de l'homme et du citoyen.",
  },
  {
    texte: 'Le RSA et les aides au logement soutiennent les personnes en difficulté',
    reponse: 'fraternite',
    explication:
      "C'est la Fraternité : ces aides sont une solidarité collective organisée par l'État et financée par les impôts et les cotisations.",
  },
];

const LIBELLES = {
  liberte: 'Liberté',
  egalite: 'Égalité',
  fraternite: 'Fraternité',
};

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export default {
  slug: 'vivre-la-devise',
  thematique: 'principes-et-valeurs',
  titre: 'Vivre la devise',
  description:
    'Liberté, Égalité ou Fraternité ? Rattachez chaque situation concrète au bon principe.',
  icone: '🔵',

  rendre(conteneur) {
    let situations = melanger(SITUATIONS);
    let index = 0;
    let score = 0;

    conteneur.innerHTML = `
      <div class="at-vd">
        <div class="at-vd-jeu">
          <div class="at-vd-entete">
            <span class="at-vd-compteur"></span>
            <span class="at-vd-points"></span>
          </div>
          <div class="at-vd-barre"><div class="at-vd-barre-remplie"></div></div>
          <div class="at-vd-carte">
            <span class="at-vd-carte-etiquette">Quel principe de la devise&nbsp;?</span>
            <p class="at-vd-carte-texte"></p>
          </div>
          <div class="at-vd-boutons">
            <button type="button" class="at-vd-choix at-vd-choix-liberte" data-choix="liberte">${LIBELLES.liberte}</button>
            <button type="button" class="at-vd-choix at-vd-choix-egalite" data-choix="egalite">${LIBELLES.egalite}</button>
            <button type="button" class="at-vd-choix at-vd-choix-fraternite" data-choix="fraternite">${LIBELLES.fraternite}</button>
          </div>
          <div class="at-vd-retour" hidden>
            <p class="at-vd-verdict"></p>
            <p class="at-vd-explication"></p>
            <button type="button" class="at-vd-suivant">Situation suivante</button>
          </div>
        </div>
        <div class="at-vd-fin" hidden>
          <span class="at-vd-fin-icone">🇫🇷</span>
          <p class="at-vd-fin-score"></p>
          <p class="at-vd-fin-message"></p>
          <button type="button" class="at-vd-rejouer">Rejouer</button>
        </div>
      </div>
    `;

    const jeu = conteneur.querySelector('.at-vd-jeu');
    const fin = conteneur.querySelector('.at-vd-fin');
    const compteur = conteneur.querySelector('.at-vd-compteur');
    const points = conteneur.querySelector('.at-vd-points');
    const barreRemplie = conteneur.querySelector('.at-vd-barre-remplie');
    const carte = conteneur.querySelector('.at-vd-carte');
    const carteTexte = conteneur.querySelector('.at-vd-carte-texte');
    const boutonsChoix = Array.from(conteneur.querySelectorAll('.at-vd-choix'));
    const retour = conteneur.querySelector('.at-vd-retour');
    const verdict = conteneur.querySelector('.at-vd-verdict');
    const explication = conteneur.querySelector('.at-vd-explication');
    const boutonSuivant = conteneur.querySelector('.at-vd-suivant');
    const finScore = conteneur.querySelector('.at-vd-fin-score');
    const finMessage = conteneur.querySelector('.at-vd-fin-message');
    const boutonRejouer = conteneur.querySelector('.at-vd-rejouer');

    function afficherSituation() {
      const actuelle = situations[index];
      compteur.textContent = `Situation ${index + 1} / ${situations.length}`;
      points.textContent = `Score : ${score}`;
      barreRemplie.style.width = `${(index / situations.length) * 100}%`;
      carteTexte.textContent = actuelle.texte;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = false;
        bouton.classList.remove('at-vd-bon', 'at-vd-mauvais');
      });
      retour.hidden = true;
      verdict.classList.remove('at-vd-verdict-bon', 'at-vd-verdict-mauvais');
      boutonSuivant.textContent =
        index === situations.length - 1 ? 'Voir mon score' : 'Situation suivante';

      /* Relance l'animation d'entrée de la carte. */
      carte.classList.remove('at-vd-carte-entree');
      void carte.offsetWidth;
      carte.classList.add('at-vd-carte-entree');
    }

    function repondre(choix, boutonClique) {
      const actuelle = situations[index];
      const bonne = choix === actuelle.reponse;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = true;
        if (bouton.dataset.choix === actuelle.reponse) {
          bouton.classList.add('at-vd-bon');
        }
      });

      if (bonne) {
        score += 1;
        verdict.textContent = 'Bonne réponse !';
        verdict.classList.add('at-vd-verdict-bon');
      } else {
        boutonClique.classList.add('at-vd-mauvais');
        verdict.textContent = `Raté… La bonne réponse était : ${LIBELLES[actuelle.reponse]}.`;
        verdict.classList.add('at-vd-verdict-mauvais');
      }

      points.textContent = `Score : ${score}`;
      explication.textContent = actuelle.explication;
      retour.hidden = false;
    }

    function afficherFin() {
      jeu.hidden = true;
      fin.hidden = false;
      finScore.textContent = `${score} / ${situations.length}`;

      let message;
      if (score === situations.length) {
        message =
          'Sans faute ! Liberté, Égalité, Fraternité : vous vivez la devise de la République.';
      } else if (score >= 10) {
        message =
          "Excellent ! Encore une ou deux situations à revoir et la devise n'aura plus de secret pour vous.";
      } else if (score >= 6) {
        message =
          'Bon début ! Relisez la fiche « La devise de la République » pour consolider vos connaissances.';
      } else {
        message =
          'Courage ! Reprenez le cours « Principes et valeurs », puis rejouez pour progresser.';
      }
      finMessage.textContent = message;
    }

    boutonsChoix.forEach((bouton) => {
      bouton.addEventListener('click', () => repondre(bouton.dataset.choix, bouton));
    });

    boutonSuivant.addEventListener('click', () => {
      index += 1;
      if (index >= situations.length) {
        afficherFin();
      } else {
        afficherSituation();
      }
    });

    boutonRejouer.addEventListener('click', () => {
      situations = melanger(SITUATIONS);
      index = 0;
      score = 0;
      fin.hidden = true;
      jeu.hidden = false;
      afficherSituation();
    });

    afficherSituation();
  },
};
