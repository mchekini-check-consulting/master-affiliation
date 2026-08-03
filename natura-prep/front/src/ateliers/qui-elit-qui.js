// Atelier « Qui élit qui ? » : pour chaque institution, la chaîne de
// désignation s'anime depuis le citoyen. Mode découverte + mode quiz.
import './qui-elit-qui.css';

const INSTITUTIONS = [
  {
    cle: 'president',
    nom: 'Le président de la République',
    icone: '🖋️',
    mode: 'direct',
    chaine: ['🗳️ Vous votez', '👤 Président de la République'],
    detail: "Élu au suffrage universel DIRECT pour 5 ans (le quinquennat), renouvelable une fois de suite. Scrutin majoritaire à deux tours : il faut plus de 50 % des voix. Il siège à l'Élysée.",
  },
  {
    cle: 'deputes',
    nom: 'Les 577 députés',
    icone: '🏛️',
    mode: 'direct',
    chaine: ['🗳️ Vous votez (par circonscription)', '👥 577 députés'],
    detail: "Élus au suffrage universel DIRECT pour 5 ans, aux élections législatives : un scrutin uninominal à deux tours dans chaque circonscription. Ils siègent au palais Bourbon (Assemblée nationale) et votent la loi.",
  },
  {
    cle: 'municipaux',
    nom: 'Le maire et le conseil municipal',
    icone: '🏘️',
    mode: 'mixte',
    chaine: ['🗳️ Vous votez', '👥 Conseil municipal', '🎗️ Le conseil élit le maire'],
    detail: "Aux élections municipales (tous les 6 ans), vous élisez le CONSEIL MUNICIPAL. C'est ensuite le conseil qui élit le MAIRE parmi ses membres. Vous ne votez donc jamais directement pour un nom de maire.",
  },
  {
    cle: 'senateurs',
    nom: 'Les 348 sénateurs',
    icone: '🏦',
    mode: 'indirect',
    chaine: ['🗳️ Vous votez', '👥 Élus locaux (grands électeurs)', '🏦 348 sénateurs'],
    detail: "Élus au suffrage INDIRECT pour 6 ans (renouvelés par moitié tous les 3 ans) : ce sont environ 150 000 grands électeurs — surtout des élus locaux que vous avez élus — qui votent. Ils siègent au palais du Luxembourg. C'est LA question piège de l'entretien.",
  },
  {
    cle: 'europeens',
    nom: 'Les députés européens',
    icone: '🇪🇺',
    mode: 'direct',
    chaine: ['🗳️ Vous votez (listes nationales)', '🇪🇺 Députés européens'],
    detail: "Élus au suffrage universel DIRECT tous les 5 ans, au scrutin proportionnel à un seul tour. Ils représentent la France au Parlement européen, qui siège à Strasbourg.",
  },
  {
    cle: 'premier-ministre',
    nom: 'Le Premier ministre',
    icone: '🏢',
    mode: 'nomme',
    chaine: ['👤 Président de la République', '🖋️ NOMME', '🏢 Premier ministre'],
    detail: "Personne ne l'élit : il est NOMMÉ par le président de la République. Il dirige l'action du Gouvernement depuis Matignon et peut être renversé par une motion de censure de l'Assemblée (289 voix).",
  },
  {
    cle: 'gouvernement',
    nom: 'Les ministres',
    icone: '🪑',
    mode: 'nomme',
    chaine: ['🏢 Premier ministre propose', '👤 Le président NOMME', '🪑 Ministres'],
    detail: "Les ministres sont NOMMÉS par le président de la République, sur proposition du Premier ministre. Ensemble, ils forment le Gouvernement, qui conduit la politique de la nation.",
  },
  {
    cle: 'conseil-constitutionnel',
    nom: 'Le Conseil constitutionnel',
    icone: '⚖️',
    mode: 'nomme',
    chaine: ['👤 Président + 🏛️ président AN + 🏦 président Sénat', '🖋️ DÉSIGNENT (3 chacun)', '⚖️ 9 membres'],
    detail: "Ses 9 membres (les « Sages ») ne sont pas élus par les citoyens : ils sont désignés pour 9 ans — trois par le président de la République, trois par le président de l'Assemblée nationale, trois par le président du Sénat — renouvelés par tiers tous les 3 ans.",
  },
];

const MODES = {
  direct: { libelle: 'Suffrage direct', classe: 'direct' },
  indirect: { libelle: 'Suffrage indirect', classe: 'indirect' },
  mixte: { libelle: 'Direct puis indirect', classe: 'indirect' },
  nomme: { libelle: 'Nommé, pas élu', classe: 'nomme' },
};

const QUESTIONS = [
  { question: 'Qui élit les sénateurs ?', options: ['Les citoyens directement', 'Les grands électeurs (élus locaux)', 'Le président de la République', 'Les députés'], reponse: 1, explication: 'Les sénateurs sont élus au suffrage indirect par environ 150 000 grands électeurs, essentiellement des élus locaux.' },
  { question: 'Qui nomme le Premier ministre ?', options: ['Les citoyens', "L'Assemblée nationale", 'Le président de la République', 'Le Sénat'], reponse: 2, explication: 'Le Premier ministre est nommé par le président de la République : personne ne l\'élit.' },
  { question: 'Qui élit le maire ?', options: ['Les habitants directement', 'Le conseil municipal', 'Le préfet', 'Le département'], reponse: 1, explication: 'Vous élisez le conseil municipal, et c\'est lui qui élit ensuite le maire parmi ses membres.' },
  { question: 'Comment le président de la République est-il désigné ?', options: ['Élu par le Parlement', 'Nommé par le Conseil constitutionnel', 'Élu au suffrage universel direct', 'Tiré au sort'], reponse: 2, explication: 'Depuis la révision de 1962, le président est élu directement par les citoyens, pour 5 ans.' },
  { question: 'Qui désigne les 9 membres du Conseil constitutionnel ?', options: ['Les citoyens', 'Les juges', 'Le président de la République et les présidents des deux assemblées', 'Le Gouvernement'], reponse: 2, explication: 'Trois chacun : le président de la République, le président de l\'Assemblée nationale et le président du Sénat.' },
  { question: 'Pour combien de temps les députés sont-ils élus ?', options: ['4 ans', '5 ans', '6 ans', '7 ans'], reponse: 1, explication: 'Les 577 députés sont élus pour 5 ans aux élections législatives.' },
  { question: 'Qui nomme les ministres ?', options: ['Le Premier ministre seul', 'Le président, sur proposition du Premier ministre', "L'Assemblée nationale", 'Les citoyens'], reponse: 1, explication: 'Le président de la République nomme les ministres sur proposition du Premier ministre.' },
  { question: 'Comment vote-t-on aux élections européennes ?', options: ['Scrutin proportionnel à un tour', 'Scrutin majoritaire à deux tours', 'Suffrage indirect', 'Par referendum'], reponse: 0, explication: 'Les députés européens sont élus au scrutin proportionnel à un seul tour, sur des listes nationales.' },
];

export default {
  slug: 'qui-elit-qui',
  thematique: 'systeme-institutionnel',
  titre: 'Qui élit qui ?',
  description: 'Suffrage direct, indirect ou nomination : visualisez comment chaque institution est désignée, puis testez-vous.',
  icone: '🗳️',
  rendre(conteneur) {
    let ecran = 'decouverte';
    let actif = null;
    let quiz = null;

    const dessiner = () => {
      if (ecran === 'quiz') {
        dessinerQuiz();
        return;
      }
      const inst = INSTITUTIONS.find((i) => i.cle === actif);
      conteneur.innerHTML = `
        <div class="at-qeq">
          <div class="at-qeq-legende">
            <span class="at-qeq-pastille at-qeq-pastille--direct">Suffrage direct</span>
            <span class="at-qeq-pastille at-qeq-pastille--indirect">Suffrage indirect</span>
            <span class="at-qeq-pastille at-qeq-pastille--nomme">Nommé, pas élu</span>
            <button type="button" class="at-qeq-quiz-bouton" data-quiz>🎯 Passer au quiz</button>
          </div>
          <div class="at-qeq-grille">
            ${INSTITUTIONS.map(
              (i) => `
              <button type="button" class="at-qeq-institution at-qeq-institution--${MODES[i.mode].classe} ${actif === i.cle ? 'active' : ''}" data-institution="${i.cle}">
                <span class="at-qeq-institution-icone">${i.icone}</span>
                <span class="at-qeq-institution-nom">${i.nom}</span>
                <span class="at-qeq-institution-mode">${MODES[i.mode].libelle}</span>
              </button>`
            ).join('')}
          </div>
          ${
            inst
              ? `
          <div class="at-qeq-panneau">
            <div class="at-qeq-chaine">
              ${inst.chaine
                .map(
                  (maillon, i) => `
                ${i > 0 ? '<span class="at-qeq-fleche" style="--delai:' + (i * 0.35) + 's" aria-hidden="true">→</span>' : ''}
                <span class="at-qeq-maillon" style="--delai:${i * 0.35}s">${maillon}</span>`
                )
                .join('')}
            </div>
            <p class="at-qeq-detail">${inst.detail}</p>
          </div>`
              : '<p class="at-qeq-invite">👆 Cliquez sur une institution pour voir comment elle est désignée, depuis votre bulletin de vote.</p>'
          }
        </div>
      `;
      conteneur.querySelectorAll('[data-institution]').forEach((b) =>
        b.addEventListener('click', () => {
          actif = actif === b.dataset.institution ? null : b.dataset.institution;
          dessiner();
        })
      );
      conteneur.querySelector('[data-quiz]').addEventListener('click', () => {
        ecran = 'quiz';
        const melange = [...QUESTIONS];
        for (let i = melange.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [melange[i], melange[j]] = [melange[j], melange[i]];
        }
        quiz = { questions: melange, index: 0, score: 0, repondu: false };
        dessiner();
      });
    };

    const dessinerQuiz = () => {
      if (quiz.index >= quiz.questions.length) {
        const pct = Math.round((quiz.score / quiz.questions.length) * 100);
        conteneur.innerHTML = `
          <div class="at-qeq-fin">
            <p class="at-qeq-fin-score">${quiz.score} / ${quiz.questions.length}</p>
            <p class="at-qeq-fin-message">${
              pct >= 80
                ? 'Excellent : les chaînes de désignation n\'ont plus de secret pour vous.'
                : pct >= 50
                  ? 'Bien ! Revoyez le schéma pour les questions ratées, surtout les sénateurs.'
                  : 'Retournez au schéma interactif : les flèches valent mille listes à apprendre.'
            }</p>
            <div class="at-qeq-fin-actions">
              <button type="button" class="at-qeq-quiz-bouton" data-rejouer>Rejouer le quiz</button>
              <button type="button" class="at-qeq-retour" data-schema>Revoir le schéma</button>
            </div>
          </div>`;
        conteneur.querySelector('[data-rejouer]').addEventListener('click', () => {
          quiz = { questions: quiz.questions, index: 0, score: 0, repondu: false };
          dessiner();
        });
        conteneur.querySelector('[data-schema]').addEventListener('click', () => {
          ecran = 'decouverte';
          actif = null;
          dessiner();
        });
        return;
      }

      const q = quiz.questions[quiz.index];
      conteneur.innerHTML = `
        <div class="at-qeq-quiz">
          <div class="at-qeq-quiz-tete">
            <span>Question ${quiz.index + 1} / ${quiz.questions.length}</span>
            <button type="button" class="at-qeq-retour" data-schema>← Revoir le schéma</button>
          </div>
          <h3 class="at-qeq-question">${q.question}</h3>
          <div class="at-qeq-options">
            ${q.options
              .map((o, i) => `<button type="button" class="at-qeq-option" data-option="${i}">${o}</button>`)
              .join('')}
          </div>
          <div class="at-qeq-feedback" data-feedback hidden>
            <p></p>
            <button type="button" class="at-qeq-quiz-bouton" data-suivant>Question suivante →</button>
          </div>
        </div>`;

      const options = Array.from(conteneur.querySelectorAll('.at-qeq-option'));
      options.forEach((b, i) =>
        b.addEventListener('click', () => {
          if (quiz.repondu) return;
          quiz.repondu = true;
          if (i === q.reponse) {
            quiz.score += 1;
            b.classList.add('bonne');
          } else {
            b.classList.add('mauvaise');
            options[q.reponse].classList.add('bonne');
          }
          options.forEach((autre) => (autre.disabled = true));
          const feedback = conteneur.querySelector('[data-feedback]');
          feedback.hidden = false;
          feedback.querySelector('p').textContent = q.explication;
        })
      );
      conteneur.querySelector('[data-suivant]').addEventListener('click', () => {
        quiz.index += 1;
        quiz.repondu = false;
        dessiner();
      });
      conteneur.querySelector('[data-schema]').addEventListener('click', () => {
        ecran = 'decouverte';
        dessiner();
      });
    };

    dessiner();
  },
};
