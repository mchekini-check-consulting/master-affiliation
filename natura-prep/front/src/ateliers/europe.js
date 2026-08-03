import './europe.css';

/* Atelier « L'Europe en un coup d'œil » — mini-frise de la construction
   européenne et jeu « UE, Schengen : qui est où ? ». Contenu aligné sur la
   fiche « L'Union européenne » (src/donnees/cours/systeme-institutionnel.json). */

const JALONS = [
  {
    date: '25 mars 1957',
    titre: 'Le traité de Rome',
    texte:
      "Le traité de Rome crée la Communauté économique européenne (CEE) et la Communauté européenne de l'énergie atomique (Euratom). Six pays fondateurs : l'Allemagne, la Belgique, la France, l'Italie, le Luxembourg et les Pays-Bas.",
  },
  {
    date: '1er nov. 1993',
    titre: "La CEE devient l'Union européenne",
    texte:
      "Avec l'entrée en vigueur du traité de Maastricht, la CEE devient l'Union européenne (UE) : une organisation politique et économique qui promeut la coopération économique, politique, sociale et culturelle entre ses membres (marché unique, monnaie commune, politiques communes).",
  },
  {
    date: 'Depuis 1995',
    titre: "L'espace Schengen",
    texte:
      "L'espace Schengen est un espace de libre circulation : on passe d'un pays à l'autre sans contrôle aux frontières. Attention, ce n'est pas la même chose que l'UE : l'Irlande et Chypre sont dans l'UE sans être dans Schengen ; la Suisse, la Norvège, l'Islande et le Liechtenstein sont dans Schengen sans être dans l'UE.",
  },
  {
    date: '2002',
    titre: "L'euro dans nos poches",
    texte:
      "L'euro est la monnaie commune utilisée par de nombreux pays de l'UE, dont la France. Les premières pièces et les premiers billets entrent en circulation en 2002.",
  },
  {
    date: '2020',
    titre: "Le Brexit : l'UE à 27",
    texte:
      "Le Royaume-Uni quitte l'Union européenne : c'est le « Brexit ». Depuis ce départ, l'UE compte 27 États membres.",
  },
  {
    date: '9 mai',
    titre: "Les symboles de l'UE",
    texte:
      "Le drapeau : 12 étoiles jaunes en cercle sur fond bleu — elles symbolisent l'unité, l'harmonie et la solidarité entre les peuples (leur nombre ne dépend pas du nombre de pays). La devise : « Unie dans la diversité ». L'hymne : l'« Ode à la joie » de Beethoven. La monnaie : l'euro. Et le 9 mai, la journée de l'Europe, célèbre la paix et l'unité en Europe.",
  },
];

const PAYS = [
  {
    drapeau: '🇫🇷',
    nom: 'La France',
    reponse: 'ue-schengen',
    explication:
      "La France est l'un des 6 pays fondateurs de la CEE en 1957. Elle est membre de l'Union européenne et de l'espace Schengen, et utilise l'euro.",
  },
  {
    drapeau: '🇩🇪',
    nom: "L'Allemagne",
    reponse: 'ue-schengen',
    explication:
      "Comme la France, l'Allemagne est un pays fondateur du traité de Rome (1957) : elle est membre de l'UE et de l'espace Schengen.",
  },
  {
    drapeau: '🇮🇪',
    nom: "L'Irlande",
    reponse: 'ue',
    explication:
      "L'Irlande est membre de l'Union européenne, mais elle ne fait pas partie de l'espace Schengen : ses frontières restent contrôlées.",
  },
  {
    drapeau: '🇨🇾',
    nom: 'Chypre',
    reponse: 'ue',
    explication:
      "Chypre est membre de l'Union européenne, mais pas de l'espace Schengen : c'est l'autre grand exemple du cours, avec l'Irlande.",
  },
  {
    drapeau: '🇨🇭',
    nom: 'La Suisse',
    reponse: 'schengen',
    explication:
      "La Suisse n'est pas membre de l'Union européenne, mais elle fait partie de l'espace Schengen : on y entre sans contrôle aux frontières.",
  },
  {
    drapeau: '🇳🇴',
    nom: 'La Norvège',
    reponse: 'schengen',
    explication:
      "La Norvège n'est pas membre de l'UE, mais elle appartient à l'espace Schengen, comme la Suisse, l'Islande et le Liechtenstein.",
  },
  {
    drapeau: '🇮🇸',
    nom: "L'Islande",
    reponse: 'schengen',
    explication:
      "L'Islande fait partie de l'espace de libre circulation Schengen sans être membre de l'Union européenne.",
  },
  {
    drapeau: '🇬🇧',
    nom: 'Le Royaume-Uni',
    reponse: 'aucun',
    explication:
      "Depuis le Brexit, le Royaume-Uni n'est plus membre de l'UE — et il n'a jamais fait partie de l'espace Schengen. C'est depuis son départ que l'UE compte 27 États membres.",
  },
];

const LIBELLES = {
  'ue-schengen': 'UE + Schengen',
  ue: 'UE sans Schengen',
  schengen: 'Schengen sans UE',
  aucun: 'Ni UE ni Schengen',
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
  slug: 'europe',
  thematique: 'systeme-institutionnel',
  titre: 'L\'Europe en un coup d\'œil',
  description: 'La construction européenne et le piège UE / Schengen, enfin clairs.',
  icone: '🇪🇺',

  rendre(conteneur) {
    let cartes = melanger(PAYS);
    let index = 0;
    let score = 0;

    conteneur.innerHTML = `
      <div class="at-eu">
        <section class="at-eu-section">
          <h3 class="at-eu-section-titre"><span aria-hidden="true">★</span> La construction européenne</h3>
          <p class="at-eu-section-intro">Six jalons pour tout retenir : cliquez sur chaque étape pour dérouler le détail.</p>
          <ol class="at-eu-frise">
            ${JALONS.map(
              (j, i) => `
              <li class="at-eu-jalon" style="--delai:${Math.min(i * 50, 400)}ms">
                <button type="button" class="at-eu-jalon-bouton" aria-expanded="false">
                  <span class="at-eu-jalon-date">${j.date}</span>
                  <span class="at-eu-jalon-titre">${j.titre}</span>
                  <span class="at-eu-jalon-chevron" aria-hidden="true">+</span>
                </button>
                <div class="at-eu-jalon-detail" hidden>
                  <p>${j.texte}</p>
                </div>
              </li>`
            ).join('')}
          </ol>
        </section>

        <section class="at-eu-section">
          <h3 class="at-eu-section-titre"><span aria-hidden="true">★</span> UE, Schengen : qui est où&nbsp;?</h3>
          <p class="at-eu-section-intro">Le piège classique de l'entretien : pour chaque pays, dites s'il est dans l'Union européenne, dans l'espace Schengen… les deux, ou aucun des deux.</p>
          <div class="at-eu-jeu">
            <div class="at-eu-entete">
              <span class="at-eu-compteur"></span>
              <span class="at-eu-points"></span>
            </div>
            <div class="at-eu-barre"><div class="at-eu-barre-remplie"></div></div>
            <div class="at-eu-carte">
              <span class="at-eu-carte-drapeau" aria-hidden="true"></span>
              <p class="at-eu-carte-nom"></p>
            </div>
            <div class="at-eu-boutons">
              ${Object.entries(LIBELLES)
                .map(
                  ([cle, libelle]) =>
                    `<button type="button" class="at-eu-choix" data-choix="${cle}">${libelle}</button>`
                )
                .join('')}
            </div>
            <div class="at-eu-retour" hidden>
              <p class="at-eu-verdict"></p>
              <p class="at-eu-explication"></p>
              <button type="button" class="at-eu-suivant">Pays suivant</button>
            </div>
          </div>
          <div class="at-eu-fin" hidden>
            <span class="at-eu-fin-icone" aria-hidden="true">🇪🇺</span>
            <p class="at-eu-fin-score"></p>
            <p class="at-eu-fin-message"></p>
            <button type="button" class="at-eu-rejouer">Rejouer</button>
          </div>
        </section>
      </div>
    `;

    /* ---- Section A : mini-frise en accordéon (un seul jalon ouvert) ---- */

    const jalons = Array.from(conteneur.querySelectorAll('.at-eu-jalon'));
    jalons.forEach((jalon) => {
      const bouton = jalon.querySelector('.at-eu-jalon-bouton');
      bouton.addEventListener('click', () => {
        const detail = jalon.querySelector('.at-eu-jalon-detail');
        const dejaOuvert = !detail.hidden;
        jalons.forEach((autre) => {
          autre.classList.remove('ouvert');
          autre.querySelector('.at-eu-jalon-detail').hidden = true;
          autre.querySelector('.at-eu-jalon-chevron').textContent = '+';
          autre.querySelector('.at-eu-jalon-bouton').setAttribute('aria-expanded', 'false');
        });
        if (!dejaOuvert) {
          jalon.classList.add('ouvert');
          detail.hidden = false;
          jalon.querySelector('.at-eu-jalon-chevron').textContent = '−';
          bouton.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ---- Section B : jeu « UE, Schengen : qui est où ? » ---- */

    const jeu = conteneur.querySelector('.at-eu-jeu');
    const fin = conteneur.querySelector('.at-eu-fin');
    const compteur = conteneur.querySelector('.at-eu-compteur');
    const points = conteneur.querySelector('.at-eu-points');
    const barreRemplie = conteneur.querySelector('.at-eu-barre-remplie');
    const carte = conteneur.querySelector('.at-eu-carte');
    const carteDrapeau = conteneur.querySelector('.at-eu-carte-drapeau');
    const carteNom = conteneur.querySelector('.at-eu-carte-nom');
    const boutonsChoix = Array.from(conteneur.querySelectorAll('.at-eu-choix'));
    const retour = conteneur.querySelector('.at-eu-retour');
    const verdict = conteneur.querySelector('.at-eu-verdict');
    const explication = conteneur.querySelector('.at-eu-explication');
    const boutonSuivant = conteneur.querySelector('.at-eu-suivant');
    const finScore = conteneur.querySelector('.at-eu-fin-score');
    const finMessage = conteneur.querySelector('.at-eu-fin-message');
    const boutonRejouer = conteneur.querySelector('.at-eu-rejouer');

    function afficherCarte() {
      const actuelle = cartes[index];
      compteur.textContent = `Pays ${index + 1} / ${cartes.length}`;
      points.textContent = `Score : ${score}`;
      barreRemplie.style.width = `${(index / cartes.length) * 100}%`;
      carteDrapeau.textContent = actuelle.drapeau;
      carteNom.textContent = actuelle.nom;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = false;
        bouton.classList.remove('at-eu-bon', 'at-eu-mauvais');
      });
      retour.hidden = true;
      verdict.classList.remove('at-eu-verdict-bon', 'at-eu-verdict-mauvais');
      boutonSuivant.textContent =
        index === cartes.length - 1 ? 'Voir mon score' : 'Pays suivant';

      /* Relance l'animation d'entrée de la carte. */
      carte.classList.remove('at-eu-carte-entree');
      void carte.offsetWidth;
      carte.classList.add('at-eu-carte-entree');
    }

    function repondre(choix, boutonClique) {
      const actuelle = cartes[index];
      const bonne = choix === actuelle.reponse;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = true;
        if (bouton.dataset.choix === actuelle.reponse) {
          bouton.classList.add('at-eu-bon');
        }
      });

      if (bonne) {
        score += 1;
        verdict.textContent = 'Bonne réponse !';
        verdict.classList.add('at-eu-verdict-bon');
      } else {
        boutonClique.classList.add('at-eu-mauvais');
        verdict.textContent = `Raté… La bonne réponse était : ${LIBELLES[actuelle.reponse]}.`;
        verdict.classList.add('at-eu-verdict-mauvais');
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
        message = 'Sans faute ! UE ou Schengen, plus aucun pays ne vous piège.';
      } else if (score >= 6) {
        message = "Très bien ! Encore un pays ou deux à revoir et le piège UE / Schengen n'en sera plus un.";
      } else if (score >= 4) {
        message = "Bon début ! Relisez la fiche « L'Union européenne », section « UE et espace Schengen : quelle différence ? ».";
      } else {
        message = "Courage ! Reprenez la fiche « L'Union européenne » du cours, puis rejouez pour progresser.";
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
      cartes = melanger(PAYS);
      index = 0;
      score = 0;
      fin.hidden = true;
      jeu.hidden = false;
      afficherCarte();
    });

    afficherCarte();
  },
};
