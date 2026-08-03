import './galerie-personnages.css';

/* Atelier « La galerie des personnages » — jeu « Qui suis-je ? » dérivé du cours
   « Histoire, géographie et culture »
   (src/donnees/cours/histoire-geographie-culture.json, fiche
   « les-personnages-celebres » et fiches voisines). */

const DOMAINES = {
  sciences: { emoji: '🔬', libelle: 'Sciences' },
  litterature: { emoji: '✍️', libelle: 'Littérature' },
  cinema: { emoji: '🎬', libelle: 'Cinéma' },
  musique: { emoji: '🎵', libelle: 'Musique' },
  sport: { emoji: '⚽', libelle: 'Sport' },
  histoire: { emoji: '👑', libelle: 'Histoire' },
  politique: { emoji: '🗳', libelle: 'Politique' },
};

const PERSONNAGES = [
  {
    nom: 'Marie Curie',
    domaine: 'sciences',
    indice: "J'ai reçu deux prix Nobel, en physique et en chimie.",
    distracteurs: ['Simone Veil', 'Catherine de Médicis', "Anne d'Autriche"],
    portrait: [
      "Grande scientifique d'origine polonaise, naturalisée française.",
      'Deux fois prix Nobel : en physique et en chimie.',
      'Un exemple souvent cité de naturalisation réussie.',
    ],
  },
  {
    nom: 'Gustave Eiffel',
    domaine: 'sciences',
    indice:
      "Ingénieur, j'ai construit une grande tour de fer à Paris pour l'Exposition universelle de 1889.",
    distracteurs: ['Claude Monet', 'Auguste Renoir', 'Rouget de Lisle'],
    portrait: [
      'Ingénieur français du XIXème siècle.',
      "Il a construit la tour Eiffel pour l'Exposition universelle de Paris en 1889.",
      'Sa tour est aujourd’hui le monument le plus célèbre de Paris.',
    ],
  },
  {
    nom: 'Molière',
    domaine: 'litterature',
    indice:
      "Je suis le plus célèbre auteur de théâtre français, au temps de Louis XIV.",
    distracteurs: ['Voltaire', 'Beaumarchais', 'Victor Hugo'],
    portrait: [
      'Auteur de théâtre du XVIIème siècle (1622-1673).',
      "Ses pièces les plus connues : Tartuffe, L'Avare, Le Malade imaginaire.",
    ],
  },
  {
    nom: 'Victor Hugo',
    domaine: 'litterature',
    indice: "J'ai écrit Les Misérables et Notre-Dame de Paris.",
    distracteurs: ['Alexandre Dumas', 'Albert Camus', 'Molière'],
    portrait: [
      'Immense écrivain français du XIXème siècle.',
      'Ses œuvres majeures : Les Misérables et Notre-Dame de Paris.',
    ],
  },
  {
    nom: 'Voltaire',
    domaine: 'litterature',
    indice:
      "Écrivain et philosophe des Lumières, j'ai même été enfermé à la Bastille.",
    distracteurs: ['Rousseau', 'Diderot', 'Montesquieu'],
    portrait: [
      'Écrivain et philosophe du XVIIIème siècle, grande figure des Lumières.',
      'Les idées des Lumières ont inspiré la Révolution française de 1789.',
      'Il a été enfermé à la Bastille, la prison symbole du pouvoir absolu.',
    ],
  },
  {
    nom: 'Brigitte Bardot',
    domaine: 'cinema',
    indice:
      'Actrice et chanteuse célèbre, je suis devenue militante pour la protection des animaux.',
    distracteurs: ['Marion Cotillard', 'Dalida', 'Édith Piaf'],
    portrait: [
      'Actrice et chanteuse française très célèbre.',
      'Elle est devenue militante pour la cause animale (la protection des animaux).',
    ],
  },
  {
    nom: 'Édith Piaf',
    domaine: 'musique',
    indice:
      'Surnommée « la Môme », ma chanson La Vie en rose a fait le tour du monde.',
    distracteurs: ['Dalida', 'Brigitte Bardot', 'Marion Cotillard'],
    portrait: [
      'Une des chanteuses françaises les plus célèbres du XXème siècle.',
      'Ses chansons, comme La Vie en rose, sont connues dans le monde entier.',
    ],
  },
  {
    nom: 'Johnny Hallyday',
    domaine: 'musique',
    indice:
      "Surnommé « l'idole des jeunes », j'ai fait découvrir le rock au public français.",
    distracteurs: ['Claude François', 'Charles Aznavour', 'Georges Brassens'],
    portrait: [
      'Chanteur très populaire, surnommé « l’idole des jeunes ».',
      'Il fait partie des grands noms de la chanson française, avec Aznavour, Brassens, Dalida et Claude François.',
    ],
  },
  {
    nom: 'Zinédine Zidane',
    domaine: 'sport',
    indice:
      "J'ai marqué deux buts de la tête en finale de la Coupe du monde de football 1998.",
    distracteurs: ['Michel Platini', 'Yannick Noah', 'Jo-Wilfried Tsonga'],
    portrait: [
      'Footballeur légendaire, champion du monde 1998 avec l’équipe de France.',
      'Avec Michel Platini, l’un des plus grands noms du football français.',
    ],
  },
  {
    nom: 'Teddy Riner',
    domaine: 'sport',
    indice: "Géant du judo, j'ai été plusieurs fois champion olympique.",
    distracteurs: ['Zinédine Zidane', 'Gaël Monfils', 'Yannick Noah'],
    portrait: [
      'Judoka français, plusieurs fois champion olympique.',
      'L’un des sportifs français les plus titrés de l’histoire.',
    ],
  },
  {
    nom: "Jeanne d'Arc",
    domaine: 'histoire',
    indice:
      "Jeune paysanne, j'ai conduit les troupes françaises pendant la guerre de Cent Ans.",
    distracteurs: ['Marie-Antoinette', "Aliénor d'Aquitaine", 'Catherine de Médicis'],
    portrait: [
      'Jeune paysanne française (1412-1431).',
      'Elle a conduit les troupes françaises pendant la guerre de Cent Ans, contre les Anglais, pour libérer une partie du territoire.',
    ],
  },
  {
    nom: 'Napoléon Bonaparte',
    domaine: 'histoire',
    indice:
      "Empereur des Français, j'ai créé le Code civil, un recueil de lois toujours utilisé aujourd'hui.",
    distracteurs: ['Louis XIV', 'Charlemagne', 'Henri IV'],
    portrait: [
      'Son coup d’État du 9 novembre 1799 met fin à la Révolution.',
      'Empereur des Français pendant le Premier Empire (1804-1814).',
      'Créateur du Code civil ; l’Arc de triomphe a été voulu par lui.',
    ],
  },
  {
    nom: 'Charles de Gaulle',
    domaine: 'politique',
    indice:
      "Depuis Londres, j'ai lancé un appel à la Résistance le 18 juin 1940.",
    distracteurs: ['Jean Moulin', 'François Mitterrand', 'Georges Pompidou'],
    portrait: [
      'Général et chef de la Résistance pendant la Seconde Guerre mondiale.',
      'Fondateur de la Vème République en 1958.',
      'Premier président de la Vème République (1959-1969).',
    ],
  },
  {
    nom: 'Simone Veil',
    domaine: 'politique',
    indice:
      "Ministre, j'ai fait voter en 1975 la loi qui encadre l'interruption volontaire de grossesse.",
    distracteurs: ['Marie Curie', 'Brigitte Bardot', 'Marie-Antoinette'],
    portrait: [
      'Ministre qui a préparé la loi du 17 janvier 1975 encadrant l’IVG.',
      'Cette loi garantit à la femme le droit de disposer de son corps.',
    ],
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
  slug: 'galerie-personnages',
  thematique: 'histoire-geographie-culture',
  titre: 'La galerie des personnages',
  description: "Devinez qui se cache derrière chaque indice, puis retenez l'essentiel.",
  icone: '🎭',

  rendre(conteneur) {
    let manches = melanger(PERSONNAGES);
    let index = 0;
    let score = 0;

    conteneur.innerHTML = `
      <div class="at-gp">
        <div class="at-gp-jeu">
          <div class="at-gp-entete">
            <span class="at-gp-compteur"></span>
            <span class="at-gp-points"></span>
          </div>
          <div class="at-gp-barre"><div class="at-gp-barre-remplie"></div></div>
          <div class="at-gp-manche">
            <div class="at-gp-indice">
              <span class="at-gp-domaine"></span>
              <span class="at-gp-indice-etiquette">Qui suis-je&nbsp;?</span>
              <p class="at-gp-indice-texte"></p>
            </div>
            <div class="at-gp-options"></div>
            <div class="at-gp-retour" hidden>
              <p class="at-gp-verdict"></p>
              <div class="at-gp-portrait">
                <div class="at-gp-portrait-entete">
                  <span class="at-gp-portrait-emoji"></span>
                  <span class="at-gp-portrait-nom"></span>
                </div>
                <ul class="at-gp-portrait-lignes"></ul>
              </div>
              <button type="button" class="at-gp-suivant">Personnage suivant</button>
            </div>
          </div>
        </div>
        <div class="at-gp-fin" hidden>
          <span class="at-gp-fin-icone">🎭</span>
          <p class="at-gp-fin-score"></p>
          <p class="at-gp-fin-message"></p>
          <button type="button" class="at-gp-rejouer">Rejouer</button>
        </div>
      </div>
    `;

    const jeu = conteneur.querySelector('.at-gp-jeu');
    const fin = conteneur.querySelector('.at-gp-fin');
    const compteur = conteneur.querySelector('.at-gp-compteur');
    const points = conteneur.querySelector('.at-gp-points');
    const barreRemplie = conteneur.querySelector('.at-gp-barre-remplie');
    const manche = conteneur.querySelector('.at-gp-manche');
    const domaine = conteneur.querySelector('.at-gp-domaine');
    const indiceTexte = conteneur.querySelector('.at-gp-indice-texte');
    const options = conteneur.querySelector('.at-gp-options');
    const retour = conteneur.querySelector('.at-gp-retour');
    const verdict = conteneur.querySelector('.at-gp-verdict');
    const portraitEmoji = conteneur.querySelector('.at-gp-portrait-emoji');
    const portraitNom = conteneur.querySelector('.at-gp-portrait-nom');
    const portraitLignes = conteneur.querySelector('.at-gp-portrait-lignes');
    const boutonSuivant = conteneur.querySelector('.at-gp-suivant');
    const finScore = conteneur.querySelector('.at-gp-fin-score');
    const finMessage = conteneur.querySelector('.at-gp-fin-message');
    const boutonRejouer = conteneur.querySelector('.at-gp-rejouer');

    function afficherManche() {
      const actuel = manches[index];
      const infosDomaine = DOMAINES[actuel.domaine];

      compteur.textContent = `Personnage ${index + 1} / ${manches.length}`;
      points.textContent = `Score : ${score}`;
      barreRemplie.style.width = `${(index / manches.length) * 100}%`;
      domaine.textContent = `${infosDomaine.emoji} ${infosDomaine.libelle}`;
      indiceTexte.textContent = actuel.indice;

      const noms = melanger([actuel.nom, ...actuel.distracteurs]);
      options.innerHTML = '';
      noms.forEach((nom) => {
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'at-gp-choix';
        bouton.textContent = nom;
        bouton.addEventListener('click', () => repondre(nom, bouton));
        options.appendChild(bouton);
      });

      retour.hidden = true;
      verdict.classList.remove('at-gp-verdict-bon', 'at-gp-verdict-mauvais');
      boutonSuivant.textContent =
        index === manches.length - 1 ? 'Voir mon score' : 'Personnage suivant';

      /* Relance l'animation d'entrée de la manche. */
      manche.classList.remove('at-gp-manche-entree');
      void manche.offsetWidth;
      manche.classList.add('at-gp-manche-entree');
    }

    function repondre(nom, boutonClique) {
      const actuel = manches[index];
      const bonne = nom === actuel.nom;
      const boutons = Array.from(options.querySelectorAll('.at-gp-choix'));

      boutons.forEach((bouton) => {
        bouton.disabled = true;
        if (bouton.textContent === actuel.nom) {
          bouton.classList.add('at-gp-bon');
        }
      });

      if (bonne) {
        score += 1;
        verdict.textContent = 'Bonne réponse !';
        verdict.classList.add('at-gp-verdict-bon');
      } else {
        boutonClique.classList.add('at-gp-mauvais');
        verdict.textContent = `Raté… C'était ${actuel.nom}.`;
        verdict.classList.add('at-gp-verdict-mauvais');
      }

      points.textContent = `Score : ${score}`;
      portraitEmoji.textContent = DOMAINES[actuel.domaine].emoji;
      portraitNom.textContent = actuel.nom;
      portraitLignes.innerHTML = '';
      actuel.portrait.forEach((ligne) => {
        const item = document.createElement('li');
        item.textContent = ligne;
        portraitLignes.appendChild(item);
      });
      retour.hidden = false;
    }

    function afficherFin() {
      jeu.hidden = true;
      fin.hidden = false;
      barreRemplie.style.width = '100%';
      finScore.textContent = `${score} / ${manches.length}`;

      let message;
      if (score === manches.length) {
        message =
          'Sans faute ! La galerie des personnages célèbres n’a plus aucun secret pour vous.';
      } else if (score >= 11) {
        message =
          "Excellent ! Encore un ou deux portraits à revoir et vous serez incollable à l'entretien.";
      } else if (score >= 7) {
        message =
          'Bon début ! Relisez la fiche « Les personnages célèbres » pour consolider vos repères.';
      } else {
        message =
          'Courage ! Reprenez le cours « Histoire, géographie et culture », puis rejouez pour progresser.';
      }
      finMessage.textContent = message;
    }

    boutonSuivant.addEventListener('click', () => {
      index += 1;
      if (index >= manches.length) {
        afficherFin();
      } else {
        afficherManche();
      }
    });

    boutonRejouer.addEventListener('click', () => {
      manches = melanger(PERSONNAGES);
      index = 0;
      score = 0;
      fin.hidden = true;
      jeu.hidden = false;
      afficherManche();
    });

    afficherManche();
  },
};
