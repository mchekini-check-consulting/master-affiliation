import './bon-guichet.css';

/* ------------------------------------------------------------------ */
/* Les organismes                                                      */
/* ------------------------------------------------------------------ */

const ORGANISMES = {
  cpam: { nom: 'La CPAM / l’Assurance maladie', emoji: '🏥' },
  caf: { nom: 'La CAF', emoji: '👨‍👩‍👧' },
  franceTravail: { nom: 'France Travail', emoji: '💼' },
  mairie: { nom: 'La mairie', emoji: '🏛️' },
  prefecture: { nom: 'La préfecture', emoji: '🛂' },
  impots: { nom: 'Le centre des finances publiques (impots.gouv.fr)', emoji: '💶' },
  medecin: { nom: 'Le médecin traitant', emoji: '🩺' },
  ecole: { nom: 'L’école / le rectorat', emoji: '🏫' },
  prudhommes: { nom: 'L’inspection du travail / les prud’hommes', emoji: '⚖️' },
  banque: { nom: 'La banque', emoji: '🏦' },
  assurance: { nom: 'L’assurance habitation', emoji: '🛡️' },
  samu: { nom: 'Le 15 (SAMU) / les urgences', emoji: '🚑' },
};

/* ------------------------------------------------------------------ */
/* Les situations (dérivées du cours « Vivre dans la société           */
/* française »)                                                        */
/* ------------------------------------------------------------------ */

const SITUATIONS = [
  {
    enonce: 'Vous vivez en France depuis plus de 3 mois et vous voulez obtenir votre carte Vitale pour être remboursé de vos frais de santé.',
    bonne: 'cpam',
    leurres: ['caf', 'mairie', 'prefecture'],
    explication: 'La CPAM (Caisse primaire d’assurance maladie) gère l’inscription à l’Assurance maladie et délivre la carte Vitale, qui prouve vos droits et permet le remboursement automatique des soins.',
  },
  {
    enonce: 'Vous attendez un enfant et voulez connaître les aides pour votre famille : allocations familiales, aide au logement (APL)…',
    bonne: 'caf',
    leurres: ['cpam', 'impots', 'mairie'],
    explication: 'La CAF (Caisse d’allocations familiales) verse les aides aux familles : allocations familiales, aide au logement (APL) sous conditions de ressources, soutien à la parentalité.',
  },
  {
    enonce: 'Vous venez de perdre votre emploi et vous cherchez un nouveau travail ou une formation.',
    bonne: 'franceTravail',
    leurres: ['prudhommes', 'caf', 'prefecture'],
    explication: 'France Travail (anciennement Pôle emploi) est l’organisme public qui accompagne les demandeurs d’emploi : offres, formations, conseils pour le CV. L’inscription est nécessaire pour être aidé et indemnisé.',
  },
  {
    enonce: 'Votre enfant vient de naître : vous devez déclarer sa naissance dans les 5 jours.',
    bonne: 'mairie',
    leurres: ['prefecture', 'cpam', 'caf'],
    explication: 'La mairie gère l’état civil : naissances, mariages, décès. Elle s’occupe aussi des cartes d’identité, des passeports et de l’inscription des enfants à l’école.',
  },
  {
    enonce: 'Votre titre de séjour expire dans 4 mois : vous voulez demander son renouvellement.',
    bonne: 'prefecture',
    leurres: ['mairie', 'franceTravail', 'impots'],
    explication: 'La préfecture gère le séjour des étrangers : titres de séjour et demandes de naturalisation. Le renouvellement se demande au moins 3 mois avant la fin du titre.',
  },
  {
    enonce: 'C’est le mois de mai : vous devez déclarer vos revenus de l’année précédente.',
    bonne: 'impots',
    leurres: ['banque', 'caf', 'mairie'],
    explication: 'La déclaration de revenus se fait sur impots.gouv.fr ; le centre des finances publiques peut vous aider (première déclaration, numéro fiscal). Elle est obligatoire pour tous les adultes, même sans revenu.',
  },
  {
    enonce: 'Vous avez de la fièvre depuis deux jours, sans gravité : qui consultez-vous en premier ?',
    bonne: 'medecin',
    leurres: ['samu', 'cpam', 'assurance'],
    explication: 'Le médecin traitant est le premier interlocuteur du parcours de soins coordonnés : il vous soigne, vous suit dans la durée et vous oriente vers un spécialiste si nécessaire. On le déclare à l’Assurance maladie pour être bien remboursé.',
  },
  {
    enonce: 'Votre enfant de 10 ans vient d’arriver en France et ne parle pas encore français : vous voulez qu’il soit évalué et scolarisé dans une classe adaptée (UPE2A).',
    bonne: 'ecole',
    leurres: ['mairie', 'caf', 'prefecture'],
    explication: 'L’école et le rectorat organisent la scolarité : test de niveau à l’arrivée, puis classes adaptées (UPE2A) pour apprendre le français avant de rejoindre les cours ordinaires.',
  },
  {
    enonce: 'Votre employeur ne paie pas vos heures supplémentaires et refuse d’en discuter.',
    bonne: 'prudhommes',
    leurres: ['franceTravail', 'prefecture', 'impots'],
    explication: 'L’inspection du travail contrôle le respect du droit du travail dans les entreprises, et le conseil de prud’hommes est le tribunal spécialisé dans les litiges entre salariés et employeurs.',
  },
  {
    enonce: 'Vous venez de signer un CDI : il vous faut un compte pour recevoir votre salaire.',
    bonne: 'banque',
    leurres: ['impots', 'franceTravail', 'caf'],
    explication: 'Le compte bancaire est nécessaire pour recevoir un salaire, et son ouverture est gratuite. En cas de refus, la Banque de France garantit le « droit au compte ».',
  },
  {
    enonce: 'Une fuite d’eau dans votre appartement a causé des dégâts chez votre voisin du dessous.',
    bonne: 'assurance',
    leurres: ['mairie', 'banque', 'cpam'],
    explication: 'L’assurance habitation couvre la responsabilité civile : elle paie à votre place les dommages causés aux autres, même sans le vouloir. Cette assurance est obligatoire.',
  },
  {
    enonce: 'Un membre de votre famille fait un malaise grave et ne répond plus.',
    bonne: 'samu',
    leurres: ['medecin', 'cpam', 'assurance'],
    explication: 'En cas d’urgence médicale grave, on appelle le 15 (SAMU) ou on va aux urgences de l’hôpital. Les numéros d’urgence sont gratuits, 24h/24 et 7j/7 (112 : numéro européen).',
  },
];

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function messageFinal(score, total) {
  const ratio = score / total;
  if (ratio === 1) return 'Parfait ! Vous savez exactement à qui vous adresser, comme un vrai citoyen averti.';
  if (ratio >= 0.75) return 'Très bien ! Les guichets de l’administration française n’ont presque plus de secret pour vous.';
  if (ratio >= 0.5) return 'Pas mal ! Encore quelques révisions et vous ne vous tromperez plus de guichet.';
  return 'Courage ! Relisez la fiche « Les démarches administratives du quotidien » puis rejouez pour progresser.';
}

/* ------------------------------------------------------------------ */
/* Module                                                              */
/* ------------------------------------------------------------------ */

export default {
  slug: 'bon-guichet',
  thematique: 'vivre-en-france',
  titre: 'À qui s’adresser ?',
  description: 'CAF, CPAM, mairie, préfecture… trouvez le bon interlocuteur pour chaque situation.',
  icone: '🏢',

  rendre(conteneur) {
    const total = SITUATIONS.length;
    let ordre = [];
    let indice = 0;
    let score = 0;

    /* --- Écran d'une situation --- */
    function afficherSituation() {
      const situation = ordre[indice];
      const options = melanger([situation.bonne, ...situation.leurres]);

      conteneur.innerHTML = `
        <div class="at-bg">
          <div class="at-bg-tete">
            <span class="at-bg-avancement">Situation ${indice + 1} / ${total}</span>
            <span class="at-bg-score">Score : ${score}</span>
          </div>
          <div class="at-bg-barre"><div class="at-bg-barre-remplie" style="width:${(indice / total) * 100}%"></div></div>
          <div class="at-bg-carte">
            <p class="at-bg-enonce">${echapper(situation.enonce)}</p>
            <p class="at-bg-consigne">À qui vous adressez-vous ?</p>
            <div class="at-bg-options">
              ${options.map((id) => `
                <button type="button" class="at-bg-option" data-id="${id}">
                  <span class="at-bg-vignette">${ORGANISMES[id].emoji}</span>
                  <span class="at-bg-nom">${echapper(ORGANISMES[id].nom)}</span>
                </button>
              `).join('')}
            </div>
            <div class="at-bg-retour" hidden>
              <p class="at-bg-verdict"></p>
              <p class="at-bg-explication">${echapper(situation.explication)}</p>
              <button type="button" class="at-bg-suivant">
                ${indice + 1 < total ? 'Situation suivante →' : 'Voir mon score →'}
              </button>
            </div>
          </div>
        </div>
      `;

      const boutons = conteneur.querySelectorAll('.at-bg-option');
      const retour = conteneur.querySelector('.at-bg-retour');
      const verdict = conteneur.querySelector('.at-bg-verdict');

      boutons.forEach((bouton) => {
        bouton.addEventListener('click', () => {
          const bonne = bouton.dataset.id === situation.bonne;
          if (bonne) score += 1;

          boutons.forEach((b) => {
            b.disabled = true;
            if (b.dataset.id === situation.bonne) b.classList.add('at-bg-option--bonne');
            else if (b === bouton) b.classList.add('at-bg-option--fausse');
            else b.classList.add('at-bg-option--eteinte');
          });

          verdict.textContent = bonne
            ? '✅ Bonne réponse !'
            : `❌ Mauvaise réponse. Il fallait s’adresser à : ${ORGANISMES[situation.bonne].emoji} ${ORGANISMES[situation.bonne].nom}.`;
          verdict.classList.add(bonne ? 'at-bg-verdict--ok' : 'at-bg-verdict--ko');
          retour.hidden = false;
          retour.querySelector('.at-bg-suivant').focus();

          const scoreAffiche = conteneur.querySelector('.at-bg-score');
          if (scoreAffiche) scoreAffiche.textContent = `Score : ${score}`;
        });
      });

      retour.querySelector('.at-bg-suivant').addEventListener('click', () => {
        indice += 1;
        if (indice < total) afficherSituation();
        else afficherFin();
      });
    }

    /* --- Écran final --- */
    function afficherFin() {
      conteneur.innerHTML = `
        <div class="at-bg">
          <div class="at-bg-barre"><div class="at-bg-barre-remplie" style="width:100%"></div></div>
          <div class="at-bg-carte at-bg-fin">
            <span class="at-bg-fin-icone">🏢</span>
            <h3 class="at-bg-fin-titre">Partie terminée !</h3>
            <p class="at-bg-fin-score">${score} / ${total}</p>
            <p class="at-bg-fin-message">${echapper(messageFinal(score, total))}</p>
            <button type="button" class="at-bg-rejouer">↻ Rejouer</button>
          </div>
        </div>
      `;
      conteneur.querySelector('.at-bg-rejouer').addEventListener('click', demarrer);
    }

    /* --- Nouvelle partie --- */
    function demarrer() {
      ordre = melanger(SITUATIONS);
      indice = 0;
      score = 0;
      afficherSituation();
    }

    demarrer();
  },
};
