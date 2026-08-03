// Atelier « L'école de 3 à 18 ans » : le système scolaire français sur une
// frise des âges cliquable, puis un vrai/faux pour vérifier ses connaissances.
// Contenu aligné sur la fiche « La parentalité et l'école »
// (src/donnees/cours/vivre-en-france.json).
import './ecole.css';

const AGE_MIN = 3;
const AGE_MAX = 18;
const AGE_FIN_OBLIGATION = 16;

const NIVEAUX = [
  {
    nom: 'École maternelle',
    icone: '🧸',
    debut: 3,
    fin: 6,
    classes: ['Petite section', 'Moyenne section', 'Grande section'],
    diplome: null,
    cles: [
      "Obligatoire dès 3 ans : en 2019, l'âge de début de l'instruction obligatoire est passé de 6 à 3 ans.",
      "La maternelle favorise l'apprentissage du français et de la vie collective.",
      "L'école publique est gratuite et laïque, et la cantine est accessible à tous.",
    ],
  },
  {
    nom: 'École élémentaire',
    icone: '✏️',
    debut: 6,
    fin: 11,
    classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    diplome: null,
    cles: [
      "Les parents font les démarches d'inscription à la mairie de leur commune ; l'acte de naissance de l'enfant est demandé.",
      "Les parents suivent la scolarité : livret scolaire, carnet de liaison, réunions parents-professeurs.",
      "Pour les enfants allophones (qui ne parlent pas encore français), des classes adaptées (UPE2A) les aident à apprendre le français avant de rejoindre les cours ordinaires.",
    ],
  },
  {
    nom: 'Collège',
    icone: '📚',
    debut: 11,
    fin: 15,
    classes: ['6e', '5e', '4e', '3e'],
    diplome: 'Le brevet (DNB), à la fin de la 3e',
    cles: [
      'Le collège accueille les élèves de la 6e à la 3e.',
      'Le diplôme national du brevet (DNB) se passe à la fin de la 3e, donc à la fin du collège.',
      "L'instruction reste obligatoire : ne pas scolariser son enfant expose à des amendes et à des poursuites.",
    ],
  },
  {
    nom: 'Lycée',
    icone: '🎓',
    debut: 15,
    fin: 18,
    classes: ['Seconde', 'Première', 'Terminale'],
    diplome: 'Le baccalauréat (BAC), à la fin de la terminale',
    cles: [
      "L'instruction est obligatoire jusqu'à 16 ans : le début du lycée reste donc obligatoire.",
      "Après 16 ans, l'école n'est plus obligatoire : chacun peut poursuivre au lycée, en apprentissage, puis à l'université ou dans des écoles supérieures.",
    ],
  },
];

const AFFIRMATIONS = [
  {
    texte: "L'école publique est payante.",
    reponse: false,
    explication:
      "Depuis la loi Jules Ferry du 28 mars 1882, l'école publique est gratuite, laïque et obligatoire.",
  },
  {
    texte: "L'instruction est obligatoire dès 3 ans.",
    reponse: true,
    explication:
      "Depuis 2019, l'âge de début de l'instruction obligatoire est passé de 6 à 3 ans. Elle reste obligatoire jusqu'à 16 ans.",
  },
  {
    texte: 'Le brevet se passe à la fin du lycée.',
    reponse: false,
    explication:
      "Le brevet (DNB) se passe à la fin de la 3e, donc à la fin du collège. À la fin du lycée, on passe le baccalauréat (BAC).",
  },
  {
    texte: "On inscrit son enfant à l'école primaire à la mairie.",
    reponse: true,
    explication:
      "Les parents font les démarches d'inscription à la mairie de leur commune ; l'acte de naissance de l'enfant est demandé.",
  },
  {
    texte: "Les élèves peuvent porter des signes religieux ostensibles à l'école publique.",
    reponse: false,
    explication:
      "La loi du 15 mars 2004 interdit les signes religieux ostensibles (très visibles) à l'école publique, qui est laïque.",
  },
  {
    texte: "Après 16 ans, l'école n'est plus obligatoire.",
    reponse: true,
    explication:
      "L'instruction est obligatoire de 3 à 16 ans. Après 16 ans, chacun peut poursuivre au lycée, en apprentissage, à l'université ou dans des écoles supérieures.",
  },
  {
    texte: 'La cantine est réservée aux élèves français.',
    reponse: false,
    explication:
      "La cantine est accessible à tous, et l'école accueille tous les enfants de 3 à 16 ans vivant en France, qu'ils soient français ou étrangers.",
  },
  {
    texte: 'Au collège, les classes vont de la 6e à la 3e.',
    reponse: true,
    explication:
      'Le collège (11-15 ans) accueille les élèves de la 6e à la 3e et se termine par le brevet (DNB).',
  },
];

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export default {
  slug: 'ecole',
  thematique: 'vivre-en-france',
  titre: 'L\'école de 3 à 18 ans',
  description: 'Maternelle, élémentaire, collège, lycée : le système scolaire sur une frise claire.',
  icone: '🎒',

  rendre(conteneur) {
    let niveauActif = 0;
    let affirmations = melanger(AFFIRMATIONS);
    let index = 0;
    let score = 0;

    const partObligation = ((AGE_FIN_OBLIGATION - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;

    conteneur.innerHTML = `
      <div class="at-ec">
        <p class="at-ec-intro">
          Depuis la loi <strong>Jules Ferry du 28 mars 1882</strong>, l'école publique est
          <strong>gratuite, laïque et obligatoire</strong>. Aujourd'hui, l'instruction est obligatoire
          de <strong>3 à 16 ans</strong> pour tous les enfants vivant en France, qu'ils soient
          français ou étrangers.
        </p>

        <section class="at-ec-section">
          <h3 class="at-ec-titre-section">La frise des âges</h3>
          <div class="at-ec-frise" role="tablist" aria-label="Les niveaux scolaires de 3 à 18 ans">
            ${NIVEAUX.map(
              (n, i) => `
              <button type="button" role="tab" aria-selected="${i === niveauActif}"
                class="at-ec-bloc ${i === niveauActif ? 'actif' : ''} ${n.debut < AGE_FIN_OBLIGATION ? 'oblig' : ''}"
                data-niveau="${i}" style="--part:${n.fin - n.debut}">
                <span class="at-ec-bloc-icone" aria-hidden="true">${n.icone}</span>
                <span class="at-ec-bloc-nom">${n.nom}</span>
                <span class="at-ec-bloc-ages">${n.debut} – ${n.fin} ans</span>
              </button>`
            ).join('')}
          </div>
          <div class="at-ec-oblig">
            <span class="at-ec-oblig-barre" style="--largeur:${partObligation}%" aria-hidden="true"></span>
            <span class="at-ec-oblig-texte">Instruction obligatoire de 3 à 16 ans (dès 3 ans depuis 2019)</span>
          </div>
          <div class="at-ec-panneau"></div>
        </section>

        <section class="at-ec-section">
          <h3 class="at-ec-titre-section">Vrai ou faux&nbsp;?</h3>
          <div class="at-ec-vf">
            <div class="at-ec-vf-jeu">
              <div class="at-ec-vf-entete">
                <span class="at-ec-vf-compteur"></span>
                <span class="at-ec-vf-points"></span>
              </div>
              <div class="at-ec-vf-carte">
                <span class="at-ec-vf-etiquette">Vrai ou faux&nbsp;?</span>
                <p class="at-ec-vf-texte"></p>
              </div>
              <div class="at-ec-vf-boutons">
                <button type="button" class="at-ec-vf-choix" data-choix="vrai">✔️ Vrai</button>
                <button type="button" class="at-ec-vf-choix" data-choix="faux">✖️ Faux</button>
              </div>
              <div class="at-ec-vf-retour" hidden>
                <p class="at-ec-vf-verdict"></p>
                <p class="at-ec-vf-explication"></p>
                <button type="button" class="at-ec-vf-suivant">Affirmation suivante</button>
              </div>
            </div>
            <div class="at-ec-vf-fin" hidden>
              <span class="at-ec-vf-fin-icone" aria-hidden="true">🎒</span>
              <p class="at-ec-vf-fin-score"></p>
              <p class="at-ec-vf-fin-message"></p>
              <button type="button" class="at-ec-vf-rejouer">🔁 Rejouer</button>
            </div>
          </div>
        </section>
      </div>
    `;

    /* ---------- Section A : la frise des âges ---------- */

    const panneau = conteneur.querySelector('.at-ec-panneau');
    const blocs = Array.from(conteneur.querySelectorAll('.at-ec-bloc'));

    const dessinerPanneau = () => {
      const n = NIVEAUX[niveauActif];
      panneau.innerHTML = `
        <div class="at-ec-panneau-entete">
          <span class="at-ec-panneau-icone" aria-hidden="true">${n.icone}</span>
          <div>
            <h4>${n.nom} <span class="at-ec-panneau-ages">(${n.debut} – ${n.fin} ans)</span></h4>
            <p class="at-ec-panneau-classes">Classes&nbsp;: ${n.classes.join(', ')}</p>
          </div>
        </div>
        ${n.diplome ? `<p class="at-ec-diplome">🏅 Diplôme&nbsp;: ${n.diplome}</p>` : ''}
        <ul class="at-ec-points">
          ${n.cles.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      `;
      /* Relance l'animation d'entrée du panneau. */
      panneau.classList.remove('at-ec-panneau-entree');
      void panneau.offsetWidth;
      panneau.classList.add('at-ec-panneau-entree');
    };

    blocs.forEach((bloc) =>
      bloc.addEventListener('click', () => {
        niveauActif = Number(bloc.dataset.niveau);
        blocs.forEach((b, i) => {
          b.classList.toggle('actif', i === niveauActif);
          b.setAttribute('aria-selected', String(i === niveauActif));
        });
        dessinerPanneau();
      })
    );

    /* ---------- Section B : vrai ou faux ---------- */

    const jeu = conteneur.querySelector('.at-ec-vf-jeu');
    const fin = conteneur.querySelector('.at-ec-vf-fin');
    const compteur = conteneur.querySelector('.at-ec-vf-compteur');
    const points = conteneur.querySelector('.at-ec-vf-points');
    const carte = conteneur.querySelector('.at-ec-vf-carte');
    const carteTexte = conteneur.querySelector('.at-ec-vf-texte');
    const boutonsChoix = Array.from(conteneur.querySelectorAll('.at-ec-vf-choix'));
    const retour = conteneur.querySelector('.at-ec-vf-retour');
    const verdict = conteneur.querySelector('.at-ec-vf-verdict');
    const explication = conteneur.querySelector('.at-ec-vf-explication');
    const boutonSuivant = conteneur.querySelector('.at-ec-vf-suivant');
    const finScore = conteneur.querySelector('.at-ec-vf-fin-score');
    const finMessage = conteneur.querySelector('.at-ec-vf-fin-message');
    const boutonRejouer = conteneur.querySelector('.at-ec-vf-rejouer');

    const afficherAffirmation = () => {
      const actuelle = affirmations[index];
      compteur.textContent = `Affirmation ${index + 1} / ${affirmations.length}`;
      points.textContent = `Score : ${score}`;
      carteTexte.textContent = actuelle.texte;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = false;
        bouton.classList.remove('at-ec-vf-bon', 'at-ec-vf-mauvais');
      });
      retour.hidden = true;
      verdict.classList.remove('at-ec-vf-verdict-bon', 'at-ec-vf-verdict-mauvais');
      boutonSuivant.textContent =
        index === affirmations.length - 1 ? 'Voir mon score' : 'Affirmation suivante';

      /* Relance l'animation d'entrée de la carte. */
      carte.classList.remove('at-ec-vf-carte-entree');
      void carte.offsetWidth;
      carte.classList.add('at-ec-vf-carte-entree');
    };

    const repondre = (choix, boutonClique) => {
      const actuelle = affirmations[index];
      const bonne = (choix === 'vrai') === actuelle.reponse;

      boutonsChoix.forEach((bouton) => {
        bouton.disabled = true;
        if ((bouton.dataset.choix === 'vrai') === actuelle.reponse) {
          bouton.classList.add('at-ec-vf-bon');
        }
      });

      if (bonne) {
        score += 1;
        verdict.textContent = 'Bonne réponse !';
        verdict.classList.add('at-ec-vf-verdict-bon');
      } else {
        boutonClique.classList.add('at-ec-vf-mauvais');
        verdict.textContent = `Raté… c'était ${actuelle.reponse ? 'vrai' : 'faux'}.`;
        verdict.classList.add('at-ec-vf-verdict-mauvais');
      }

      points.textContent = `Score : ${score}`;
      explication.textContent = actuelle.explication;
      retour.hidden = false;
    };

    const afficherFin = () => {
      jeu.hidden = true;
      fin.hidden = false;
      finScore.textContent = `${score} / ${affirmations.length}`;

      let message;
      if (score === affirmations.length) {
        message = 'Sans faute ! Le système scolaire français n\'a plus de secret pour vous.';
      } else if (score >= 6) {
        message = 'Très bien ! Encore une ou deux affirmations à revoir et vous serez prêt pour l\'entretien.';
      } else if (score >= 4) {
        message = 'Bon début ! Relisez la fiche « La parentalité et l\'école » pour consolider vos connaissances.';
      } else {
        message = 'Courage ! Reprenez la frise des âges ci-dessus, puis rejouez pour progresser.';
      }
      finMessage.textContent = message;
    };

    boutonsChoix.forEach((bouton) =>
      bouton.addEventListener('click', () => repondre(bouton.dataset.choix, bouton))
    );

    boutonSuivant.addEventListener('click', () => {
      index += 1;
      if (index >= affirmations.length) {
        afficherFin();
      } else {
        afficherAffirmation();
      }
    });

    boutonRejouer.addEventListener('click', () => {
      affirmations = melanger(AFFIRMATIONS);
      index = 0;
      score = 0;
      fin.hidden = true;
      jeu.hidden = false;
      afficherAffirmation();
    });

    dessinerPanneau();
    afficherAffirmation();
  },
};
