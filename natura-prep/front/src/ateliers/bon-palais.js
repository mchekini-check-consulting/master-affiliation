// Atelier « Le bon palais » : associez chaque lieu de la République à son
// occupant (jeu des paires), puis vérifiez les chiffres clés avec un quiz.
import './bon-palais.css';

const PAIRES = [
  {
    cle: 'elysee',
    lieu: "Le palais de l'Élysée",
    iconeLieu: '🏰',
    occupant: 'Le président de la République',
    iconeOccupant: '👤',
    detail: "Siège de la présidence de la République : le Président y réside, élu pour 5 ans au suffrage universel direct.",
  },
  {
    cle: 'matignon',
    lieu: "L'hôtel de Matignon",
    iconeLieu: '🏢',
    occupant: 'Le Premier ministre',
    iconeOccupant: '🧑‍💼',
    detail: "Nommé par le président de la République, le Premier ministre y dirige le Gouvernement et conduit la politique de la Nation.",
  },
  {
    cle: 'bourbon',
    lieu: 'Le palais Bourbon',
    iconeLieu: '🏛️',
    occupant: 'Les 577 députés',
    iconeOccupant: '👥',
    detail: "L'Assemblée nationale, la chambre basse : les députés y votent la loi et peuvent renverser le Gouvernement.",
  },
  {
    cle: 'luxembourg',
    lieu: 'Le palais du Luxembourg',
    iconeLieu: '🏦',
    occupant: 'Les 348 sénateurs',
    iconeOccupant: '🧓',
    detail: "Le Sénat, la chambre haute : ses membres sont élus pour 6 ans au suffrage indirect, renouvelés par moitié tous les 3 ans.",
  },
  {
    cle: 'versailles',
    lieu: 'Le château de Versailles',
    iconeLieu: '👑',
    occupant: 'Le Congrès, qui révise la Constitution',
    iconeOccupant: '📜',
    detail: "Députés et sénateurs s'y réunissent en Congrès pour réviser la Constitution, à la majorité des 3/5 des votes.",
  },
  {
    cle: 'strasbourg',
    lieu: "L'hémicycle de Strasbourg",
    iconeLieu: '🏟️',
    occupant: 'Les députés européens',
    iconeOccupant: '🇪🇺',
    detail: "Le Parlement européen siège en France, à Strasbourg : les eurodéputés y votent les lois européennes et le budget.",
  },
];

const QUESTIONS = [
  {
    question: "Combien de députés siègent à l'Assemblée nationale ?",
    options: ['348', '500', '577', '925'],
    reponse: 2,
    explication: "L'Assemblée nationale compte 577 députés, élus pour 5 ans : la France est découpée en autant de circonscriptions que de sièges.",
  },
  {
    question: 'Combien de sénateurs siègent au palais du Luxembourg ?',
    options: ['289', '348', '435', '577'],
    reponse: 1,
    explication: 'Le Sénat compte 348 sénateurs, élus pour 6 ans au suffrage indirect par environ 150 000 grands électeurs.',
  },
  {
    question: "Combien de voix faut-il pour atteindre la majorité absolue à l'Assemblée (et faire adopter une motion de censure) ?",
    options: ['250', '289', '301', '350'],
    reponse: 1,
    explication: 'La majorité absolue est de 289 voix : la moitié des 577 sièges plus un. Une motion de censure votée à 289 voix renverse le Gouvernement.',
  },
  {
    question: 'Combien de membres compte le Conseil constitutionnel ?',
    options: ['5', '7', '9', '12'],
    reponse: 2,
    explication: "Le Conseil constitutionnel compte 9 membres : 3 nommés par le président de la République, 3 par le président de l'Assemblée nationale et 3 par le président du Sénat.",
  },
  {
    question: 'Quelle est la durée du mandat du président de la République ?',
    options: ['4 ans', '5 ans', '6 ans', '7 ans'],
    reponse: 1,
    explication: 'Depuis la révision de 2000, le Président est élu pour 5 ans : le quinquennat, renouvelable une fois consécutivement.',
  },
  {
    question: 'Pour combien de temps les sénateurs sont-ils élus ?',
    options: ['3 ans', '5 ans', '6 ans', '9 ans'],
    reponse: 2,
    explication: 'Les sénateurs sont élus pour 6 ans, et le Sénat est renouvelé par moitié tous les 3 ans.',
  },
  {
    question: 'Dans quel délai le président de la République doit-il promulguer une loi votée par le Parlement ?',
    options: ['48 heures', '8 jours', '15 jours', '1 mois'],
    reponse: 2,
    explication: "Le Président dispose de 15 jours pour promulguer (signer) la loi ; elle entre en vigueur après sa publication au Journal officiel.",
  },
  {
    question: 'Combien de députés ou de sénateurs faut-il, au minimum, pour saisir le Conseil constitutionnel ?',
    options: ['30', '60', '100', '289'],
    reponse: 1,
    explication: "Au moins 60 députés ou 60 sénateurs peuvent saisir le Conseil constitutionnel, comme le Président, le Premier ministre ou les présidents des deux assemblées.",
  },
];

const melanger = (tableau) => {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
};

export default {
  slug: 'bon-palais',
  thematique: 'systeme-institutionnel',
  titre: 'Le bon palais',
  description: 'Associez chaque institution à son lieu et à son chiffre clé.',
  icone: '🏰',
  rendre(conteneur) {
    // Jeton de session : invalide les minuteries d'un rendu précédent.
    const jeton = Symbol('bon-palais');
    conteneur.atBpJeton = jeton;
    const actif = () => conteneur.atBpJeton === jeton;

    let ecran = 'paires';
    let jeu = null;
    let quiz = null;

    const nouveauJeu = () => ({
      lieux: melanger(PAIRES.map((p) => p.cle)),
      occupants: melanger(PAIRES.map((p) => p.cle)),
      selection: null,
      erreurs: 0,
      appariees: [],
      verrou: false,
    });

    const nouveauQuiz = () => ({
      questions: melanger(QUESTIONS).map((q) => {
        const options = melanger(q.options.map((texte, i) => ({ texte, bonne: i === q.reponse })));
        return {
          question: q.question,
          explication: q.explication,
          options: options.map((o) => o.texte),
          reponse: options.findIndex((o) => o.bonne),
        };
      }),
      index: 0,
      score: 0,
      repondu: false,
    });

    const parCle = (cle) => PAIRES.find((p) => p.cle === cle);

    const dessiner = () => {
      if (ecran === 'quiz') dessinerQuiz();
      else dessinerPaires();
    };

    const dessinerPaires = () => {
      const total = PAIRES.length;

      if (jeu.appariees.length === total) {
        conteneur.innerHTML = `
          <div class="at-bp">
            <div class="at-bp-fin">
              <p class="at-bp-fin-icone">🏰</p>
              <p class="at-bp-fin-score">${total} paires trouvées</p>
              <p class="at-bp-fin-message">${
                jeu.erreurs === 0
                  ? 'Sans-faute ! Chaque institution est à sa place : vous connaissez la géographie de la République.'
                  : jeu.erreurs <= 3
                    ? `Bien joué, avec ${jeu.erreurs} erreur${jeu.erreurs > 1 ? 's' : ''} seulement. Relisez les paires validées, puis passez aux chiffres.`
                    : `${jeu.erreurs} erreurs : rejouez une fois pour ancrer les lieux, ce sont des questions classiques de l'entretien.`
              }</p>
              <div class="at-bp-fin-actions">
                <button type="button" class="at-bp-bouton" data-quiz>🎯 Quiz des chiffres clés</button>
                <button type="button" class="at-bp-lien" data-rejouer-paires>↺ Rejouer les paires</button>
              </div>
            </div>
          </div>`;
        conteneur.querySelector('[data-quiz]').addEventListener('click', () => {
          ecran = 'quiz';
          quiz = nouveauQuiz();
          dessiner();
        });
        conteneur.querySelector('[data-rejouer-paires]').addEventListener('click', () => {
          jeu = nouveauJeu();
          dessiner();
        });
        return;
      }

      const derniere = jeu.appariees[jeu.appariees.length - 1];
      const restantes = (liste) => liste.filter((cle) => !jeu.appariees.includes(cle));

      conteneur.innerHTML = `
        <div class="at-bp">
          <div class="at-bp-tete">
            <p class="at-bp-consigne">🧭 Cliquez sur un <strong>lieu</strong> à gauche, puis sur son <strong>occupant</strong> à droite.</p>
            <div class="at-bp-compteurs">
              <span class="at-bp-compteur at-bp-compteur--paires">✅ ${jeu.appariees.length} / ${total}</span>
              <span class="at-bp-compteur at-bp-compteur--erreurs" data-erreurs>❌ ${jeu.erreurs} erreur${jeu.erreurs > 1 ? 's' : ''}</span>
            </div>
          </div>
          ${
            jeu.appariees.length
              ? `<div class="at-bp-validees">
                  ${jeu.appariees
                    .map((cle) => {
                      const p = parCle(cle);
                      return `
                      <div class="at-bp-validee ${cle === derniere ? 'at-bp-validee--nouvelle' : ''}">
                        <div class="at-bp-validee-paire">
                          <span>${p.iconeLieu} ${p.lieu}</span>
                          <span class="at-bp-validee-lien" aria-hidden="true">→</span>
                          <span>${p.iconeOccupant} ${p.occupant}</span>
                        </div>
                        <p class="at-bp-validee-detail">${p.detail}</p>
                      </div>`;
                    })
                    .join('')}
                </div>`
              : ''
          }
          <div class="at-bp-colonnes">
            <div class="at-bp-colonne">
              <h3 class="at-bp-colonne-titre">Les lieux</h3>
              ${restantes(jeu.lieux)
                .map((cle) => {
                  const p = parCle(cle);
                  return `
                  <button type="button" class="at-bp-carte at-bp-carte--lieu ${jeu.selection === cle ? 'choisie' : ''}" data-lieu="${cle}">
                    <span class="at-bp-carte-icone">${p.iconeLieu}</span>
                    <span class="at-bp-carte-nom">${p.lieu}</span>
                  </button>`;
                })
                .join('')}
            </div>
            <div class="at-bp-colonne">
              <h3 class="at-bp-colonne-titre">Les occupants</h3>
              ${restantes(jeu.occupants)
                .map((cle) => {
                  const p = parCle(cle);
                  return `
                  <button type="button" class="at-bp-carte at-bp-carte--occupant" data-occupant="${cle}">
                    <span class="at-bp-carte-icone">${p.iconeOccupant}</span>
                    <span class="at-bp-carte-nom">${p.occupant}</span>
                  </button>`;
                })
                .join('')}
            </div>
          </div>
          <p class="at-bp-statut" data-statut></p>
        </div>`;

      const statut = conteneur.querySelector('[data-statut]');

      conteneur.querySelectorAll('[data-lieu]').forEach((carte) =>
        carte.addEventListener('click', () => {
          if (jeu.verrou) return;
          const cle = carte.dataset.lieu;
          jeu.selection = jeu.selection === cle ? null : cle;
          conteneur
            .querySelectorAll('[data-lieu]')
            .forEach((autre) => autre.classList.toggle('choisie', autre.dataset.lieu === jeu.selection));
          statut.textContent = '';
        })
      );

      conteneur.querySelectorAll('[data-occupant]').forEach((carte) =>
        carte.addEventListener('click', () => {
          if (jeu.verrou) return;
          const cle = carte.dataset.occupant;
          if (!jeu.selection) {
            statut.textContent = "Choisissez d'abord un lieu dans la colonne de gauche.";
            return;
          }
          const carteLieu = conteneur.querySelector(`[data-lieu="${jeu.selection}"]`);
          if (jeu.selection === cle) {
            jeu.verrou = true;
            carteLieu.classList.add('bonne');
            carte.classList.add('bonne');
            setTimeout(() => {
              if (!actif()) return;
              jeu.appariees.push(cle);
              jeu.selection = null;
              jeu.verrou = false;
              dessiner();
            }, 450);
          } else {
            jeu.verrou = true;
            jeu.erreurs += 1;
            const compteur = conteneur.querySelector('[data-erreurs]');
            compteur.textContent = `❌ ${jeu.erreurs} erreur${jeu.erreurs > 1 ? 's' : ''}`;
            carteLieu.classList.add('secousse', 'mauvaise');
            carte.classList.add('secousse', 'mauvaise');
            setTimeout(() => {
              if (!actif()) return;
              carteLieu.classList.remove('secousse', 'mauvaise', 'choisie');
              carte.classList.remove('secousse', 'mauvaise');
              jeu.selection = null;
              jeu.verrou = false;
            }, 550);
          }
        })
      );
    };

    const dessinerQuiz = () => {
      if (quiz.index >= quiz.questions.length) {
        const pct = Math.round((quiz.score / quiz.questions.length) * 100);
        conteneur.innerHTML = `
          <div class="at-bp">
            <div class="at-bp-fin">
              <p class="at-bp-fin-score">${quiz.score} / ${quiz.questions.length}</p>
              <p class="at-bp-fin-message">${
                pct >= 80
                  ? "Excellent : 577, 348, 289, 9... les chiffres de la République n'ont plus de secret pour vous."
                  : pct >= 50
                    ? 'Bien ! Rejouez pour ancrer les chiffres manqués : ils reviennent souvent à l’entretien.'
                    : 'Refaites d’abord le jeu des paires, puis retentez le quiz : les chiffres viendront avec les lieux.'
              }</p>
              <div class="at-bp-fin-actions">
                <button type="button" class="at-bp-bouton" data-rejouer>↺ Rejouer</button>
                <button type="button" class="at-bp-lien" data-paires>← Revenir aux paires</button>
              </div>
            </div>
          </div>`;
        conteneur.querySelector('[data-rejouer]').addEventListener('click', () => {
          quiz = nouveauQuiz();
          dessiner();
        });
        conteneur.querySelector('[data-paires]').addEventListener('click', () => {
          ecran = 'paires';
          jeu = nouveauJeu();
          dessiner();
        });
        return;
      }

      const q = quiz.questions[quiz.index];
      conteneur.innerHTML = `
        <div class="at-bp">
          <div class="at-bp-quiz">
            <div class="at-bp-quiz-tete">
              <span>Question ${quiz.index + 1} / ${quiz.questions.length}</span>
              <span class="at-bp-quiz-score">Score : ${quiz.score}</span>
            </div>
            <h3 class="at-bp-question">${q.question}</h3>
            <div class="at-bp-options">
              ${q.options
                .map((o, i) => `<button type="button" class="at-bp-option" data-option="${i}">${o}</button>`)
                .join('')}
            </div>
            <div class="at-bp-feedback" data-feedback hidden>
              <p></p>
              <button type="button" class="at-bp-bouton" data-suivant>Question suivante →</button>
            </div>
          </div>
        </div>`;

      const options = Array.from(conteneur.querySelectorAll('.at-bp-option'));
      options.forEach((b, i) =>
        b.addEventListener('click', () => {
          if (quiz.repondu) return;
          quiz.repondu = true;
          if (i === q.reponse) {
            quiz.score += 1;
            b.classList.add('bonne');
          } else {
            b.classList.add('mauvaise', 'secousse');
            options[q.reponse].classList.add('bonne');
          }
          options.forEach((autre) => (autre.disabled = true));
          const feedback = conteneur.querySelector('[data-feedback]');
          feedback.hidden = false;
          feedback.querySelector('p').textContent = q.explication;
          if (quiz.index === quiz.questions.length - 1) {
            conteneur.querySelector('[data-suivant]').textContent = 'Voir le score →';
          }
        })
      );
      conteneur.querySelector('[data-suivant]').addEventListener('click', () => {
        quiz.index += 1;
        quiz.repondu = false;
        dessiner();
      });
    };

    jeu = nouveauJeu();
    dessiner();
  },
};
