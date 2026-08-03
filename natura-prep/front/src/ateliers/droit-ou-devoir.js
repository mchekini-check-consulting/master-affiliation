import './droit-ou-devoir.css';

/* Atelier « Droit ou devoir ? » — jeu de classement dérivé du cours
   « Droits et devoirs » (src/donnees/cours/droits-et-devoirs.json). */

const CARTES = [
  {
    texte: 'Voter aux élections',
    reponse: 'deux',
    explication:
      "« Voter est un droit, c'est aussi un devoir civique » : cette phrase est inscrite sur la carte d'électeur. C'est un droit garanti au citoyen et un devoir envers la démocratie.",
  },
  {
    texte: 'Payer ses impôts',
    reponse: 'devoir',
    explication:
      "C'est un devoir de toute personne résidant en France : l'argent des impôts finance les services publics gratuits (l'école, la police, la justice, les hôpitaux).",
  },
  {
    texte: "S'exprimer librement",
    reponse: 'droit',
    explication:
      "La liberté d'expression est un droit fondamental : chacun peut dire ce qu'il pense, dans le respect de la loi et des autres.",
  },
  {
    texte: 'Respecter la loi',
    reponse: 'devoir',
    explication:
      "C'est un devoir de tous : les citoyens élisent ceux qui votent les lois, ils doivent donc les respecter, qu'elles soient françaises ou européennes.",
  },
  {
    texte: "L'instruction des enfants",
    reponse: 'deux',
    explication:
      "Les deux : l'école publique gratuite et laïque est un droit, et l'instruction est obligatoire de 3 à 16 ans. Ne pas scolariser ses enfants est un délit.",
  },
  {
    texte: 'Créer une association',
    reponse: 'droit',
    explication:
      "C'est un droit du citoyen : chacun peut se regrouper librement avec d'autres personnes autour d'un projet commun.",
  },
  {
    texte: "Respecter l'environnement",
    reponse: 'devoir',
    explication:
      "La Charte de l'environnement (2004) donne à chacun le devoir de participer à sa préservation : trier ses déchets, économiser l'eau et l'énergie, limiter le gaspillage.",
  },
  {
    texte: 'La protection sociale',
    reponse: 'droit',
    explication:
      "C'est un droit : la sécurité sociale, créée en 1945, protège chacun contre les risques de la vie (maladie, accident, vieillesse). C'est un exemple concret de fraternité.",
  },
  {
    texte: 'Défendre le pays en cas de conflit',
    reponse: 'devoir',
    explication:
      "C'est un devoir : si la patrie est menacée par un conflit armé, les citoyens de plus de 16 ans peuvent être appelés pour défendre la France.",
  },
  {
    texte: 'Manifester',
    reponse: 'droit',
    explication:
      "Défiler dans la rue pour exprimer une opinion est un droit, à condition de déclarer la manifestation à l'avance et de rester pacifique.",
  },
  {
    texte: 'Croire ou ne pas croire',
    reponse: 'droit',
    explication:
      "La liberté de religion est un droit fondamental : chacun est libre d'avoir une religion ou de ne pas en avoir.",
  },
  {
    texte: 'Respecter les droits des autres',
    reponse: 'devoir',
    explication:
      "C'est un devoir : la DDHC rappelle que « la liberté consiste à faire tout ce qui ne nuit pas à autrui ». La liberté de chacun s'arrête là où commence celle des autres.",
  },
  {
    texte: 'Travailler',
    reponse: 'deux',
    explication:
      "Les deux : le préambule de la Constitution de 1946 affirme que chacun a le devoir de travailler et le droit d'obtenir un emploi, sans discrimination.",
  },
  {
    texte: 'Faire grève',
    reponse: 'droit',
    explication:
      "Le droit de grève permet d'arrêter le travail pour montrer un désaccord : c'est un moyen pacifique et légal d'exprimer son opinion.",
  },
];

const LIBELLES = {
  droit: 'Un droit',
  devoir: 'Un devoir',
  deux: 'Les deux',
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
  slug: 'droit-ou-devoir',
  thematique: 'droits-et-devoirs',
  titre: 'Droit ou devoir ?',
  description: 'Classez chaque carte : est-ce un droit, un devoir… ou les deux ?',
  icone: '⚖️',

  rendre(conteneur) {
    let cartes = melanger(CARTES);
    let index = 0;
    let score = 0;

    conteneur.innerHTML = `
      <div class="at-dd">
        <div class="at-dd-jeu">
          <div class="at-dd-entete">
            <span class="at-dd-compteur"></span>
            <span class="at-dd-points"></span>
          </div>
          <div class="at-dd-barre"><div class="at-dd-barre-remplie"></div></div>
          <div class="at-dd-carte">
            <span class="at-dd-carte-etiquette">Est-ce un droit, un devoir… ou les deux&nbsp;?</span>
            <p class="at-dd-carte-texte"></p>
          </div>
          <div class="at-dd-boutons">
            <button type="button" class="at-dd-choix" data-choix="droit">${LIBELLES.droit}</button>
            <button type="button" class="at-dd-choix" data-choix="devoir">${LIBELLES.devoir}</button>
            <button type="button" class="at-dd-choix" data-choix="deux">${LIBELLES.deux}</button>
          </div>
          <div class="at-dd-retour" hidden>
            <p class="at-dd-verdict"></p>
            <p class="at-dd-explication"></p>
            <button type="button" class="at-dd-suivant">Carte suivante</button>
          </div>
        </div>
        <div class="at-dd-fin" hidden>
          <span class="at-dd-fin-icone">⚖️</span>
          <p class="at-dd-fin-score"></p>
          <p class="at-dd-fin-message"></p>
          <button type="button" class="at-dd-rejouer">Rejouer</button>
        </div>
      </div>
    `;

    const jeu = conteneur.querySelector('.at-dd-jeu');
    const fin = conteneur.querySelector('.at-dd-fin');
    const compteur = conteneur.querySelector('.at-dd-compteur');
    const points = conteneur.querySelector('.at-dd-points');
    const barreRemplie = conteneur.querySelector('.at-dd-barre-remplie');
    const carte = conteneur.querySelector('.at-dd-carte');
    const carteTexte = conteneur.querySelector('.at-dd-carte-texte');
    const boutonsChoix = Array.from(conteneur.querySelectorAll('.at-dd-choix'));
    const retour = conteneur.querySelector('.at-dd-retour');
    const verdict = conteneur.querySelector('.at-dd-verdict');
    const explication = conteneur.querySelector('.at-dd-explication');
    const boutonSuivant = conteneur.querySelector('.at-dd-suivant');
    const finScore = conteneur.querySelector('.at-dd-fin-score');
    const finMessage = conteneur.querySelector('.at-dd-fin-message');
    const boutonRejouer = conteneur.querySelector('.at-dd-rejouer');

    function afficherCarte() {
      const actuelle = cartes[index];
      compteur.textContent = `Carte ${index + 1} / ${cartes.length}`;
      points.textContent = `Score : ${score}`;
      barreRemplie.style.width = `${(index / cartes.length) * 100}%`;
      carteTexte.textContent = actuelle.texte;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = false;
        bouton.classList.remove('at-dd-bon', 'at-dd-mauvais');
      });
      retour.hidden = true;
      verdict.classList.remove('at-dd-verdict-bon', 'at-dd-verdict-mauvais');
      boutonSuivant.textContent =
        index === cartes.length - 1 ? 'Voir mon score' : 'Carte suivante';

      /* Relance l'animation d'entrée de la carte. */
      carte.classList.remove('at-dd-carte-entree');
      void carte.offsetWidth;
      carte.classList.add('at-dd-carte-entree');
    }

    function repondre(choix, boutonClique) {
      const actuelle = cartes[index];
      const bonne = choix === actuelle.reponse;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = true;
        if (bouton.dataset.choix === actuelle.reponse) {
          bouton.classList.add('at-dd-bon');
        }
      });

      if (bonne) {
        score += 1;
        verdict.textContent = 'Bonne réponse !';
        verdict.classList.add('at-dd-verdict-bon');
      } else {
        boutonClique.classList.add('at-dd-mauvais');
        verdict.textContent = `Raté… La bonne réponse était : ${LIBELLES[actuelle.reponse].toLowerCase()}.`;
        verdict.classList.add('at-dd-verdict-mauvais');
      }

      points.textContent = `Score : ${score}`;
      explication.textContent = actuelle.explication;
      retour.hidden = false;
    }

    function afficherFin() {
      jeu.hidden = true;
      fin.hidden = false;
      finScore.textContent = `${score} / ${cartes.length}`;

      let message;
      if (score === cartes.length) {
        message = 'Sans faute ! Vous maîtrisez parfaitement vos droits et vos devoirs.';
      } else if (score >= 11) {
        message = "Excellent ! Encore une ou deux cartes à revoir et vous serez prêt pour l'entretien.";
      } else if (score >= 7) {
        message = 'Bon début ! Relisez la fiche « Droits et devoirs » pour consolider vos connaissances.';
      } else {
        message = 'Courage ! Reprenez le cours « Droits et devoirs », puis rejouez pour progresser.';
      }
      finMessage.textContent = message;
    }

    boutonsChoix.forEach((bouton) => {
      bouton.addEventListener('click', () => repondre(bouton.dataset.choix, bouton));
    });

    boutonSuivant.addEventListener('click', () => {
      index += 1;
      if (index >= cartes.length) {
        afficherFin();
      } else {
        afficherCarte();
      }
    });

    boutonRejouer.addEventListener('click', () => {
      cartes = melanger(CARTES);
      index = 0;
      score = 0;
      fin.hidden = true;
      jeu.hidden = false;
      afficherCarte();
    });

    afficherCarte();
  },
};
