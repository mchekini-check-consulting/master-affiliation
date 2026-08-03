// Atelier « Parcours d'une loi » : on suit un texte concret, étape par
// étape, du projet initial jusqu'au Journal officiel. Schéma animé +
// explication + ce qui se passe pour notre loi d'exemple.
import './parcours-loi.css';

const ETAPES = [
  {
    lieu: 'Gouvernement',
    icone: '🏢',
    titre: "L'initiative : projet ou proposition ?",
    regle: "Une loi peut venir du Gouvernement (on parle alors de PROJET de loi) ou d'un député ou sénateur (PROPOSITION de loi). C'est la première différence de vocabulaire à connaître pour l'entretien.",
    exemple: "Notre exemple : le Gouvernement prépare un projet de loi pour réduire les déchets plastiques. Comme il vient du Gouvernement, c'est un projet de loi.",
  },
  {
    lieu: 'Conseil des ministres',
    icone: '🪑',
    titre: 'Le Conseil des ministres adopte le texte',
    regle: "Un projet de loi est d'abord examiné en Conseil des ministres, réuni chaque semaine à l'Élysée sous la présidence du président de la République, après avis du Conseil d'État.",
    exemple: 'Le mercredi matin, le projet de loi anti-plastique est adopté en Conseil des ministres : il peut maintenant être déposé au Parlement.',
  },
  {
    lieu: 'Assemblée nationale',
    icone: '🏛️',
    titre: "Première lecture à l'Assemblée nationale",
    regle: "Les 577 députés, réunis au palais Bourbon, examinent le texte : travail en commission, débats en séance publique, amendements (modifications), puis vote. La majorité absolue est de 289 voix.",
    exemple: "Les députés ajoutent un amendement : l'interdiction des pailles en plastique dès l'an prochain. Le texte modifié est adopté à 342 voix.",
  },
  {
    lieu: 'Sénat',
    icone: '🏦',
    titre: 'Le Sénat examine à son tour',
    regle: "Les 348 sénateurs, au palais du Luxembourg, examinent le même texte. S'ils le modifient, il repart à l'Assemblée : c'est la « navette parlementaire », jusqu'à un texte identique voté par les deux chambres.",
    exemple: "Le Sénat modifie la date d'entrée en vigueur. Le texte repart donc à l'Assemblée nationale : la navette commence.",
  },
  {
    lieu: 'Navette / dernier mot',
    icone: '🔁',
    titre: "En cas de désaccord : l'Assemblée a le dernier mot",
    regle: "Si le désaccord persiste, une commission mixte paritaire (7 députés + 7 sénateurs) cherche un compromis. En dernier recours, le Gouvernement peut donner le DERNIER MOT à l'Assemblée nationale, élue au suffrage universel direct.",
    exemple: "Députés et sénateurs trouvent un compromis en commission mixte paritaire : la loi anti-plastique est votée dans les mêmes termes par les deux chambres.",
  },
  {
    lieu: 'Conseil constitutionnel',
    icone: '⚖️',
    titre: 'Le contrôle du Conseil constitutionnel (facultatif)',
    regle: "Avant la promulgation, le président de la République, le Premier ministre, les présidents des assemblées ou 60 députés / 60 sénateurs peuvent saisir le Conseil constitutionnel (9 membres) pour vérifier que la loi respecte la Constitution.",
    exemple: '60 sénateurs saisissent le Conseil constitutionnel. Après examen, il déclare la loi conforme à la Constitution.',
  },
  {
    lieu: 'Président de la République',
    icone: '🖋️',
    titre: 'La promulgation par le président',
    regle: "Le président de la République promulgue la loi dans les 15 jours : il la signe et ordonne son application. Il peut aussi demander une nouvelle délibération au Parlement.",
    exemple: 'Le président signe la loi anti-plastique : elle est officiellement promulguée.',
  },
  {
    lieu: 'Journal officiel',
    icone: '📰',
    titre: 'Publication au Journal officiel',
    regle: "La loi est publiée au Journal officiel de la République française. Elle entre alors en vigueur et s'impose à tous : nul n'est censé ignorer la loi.",
    exemple: "La loi paraît au Journal officiel : dès l'année prochaine, les pailles en plastique disparaissent des commerces. Notre loi a terminé son parcours !",
  },
];

export default {
  slug: 'parcours-loi',
  thematique: 'systeme-institutionnel',
  titre: "Le parcours d'une loi, pas à pas",
  description: "Suivez une loi concrète de son écriture jusqu'au Journal officiel, étape par étape.",
  icone: '🧭',
  rendre(conteneur) {
    let etape = 0;

    const dessiner = () => {
      const e = ETAPES[etape];
      conteneur.innerHTML = `
        <div class="at-loi">
          <div class="at-loi-schema" role="list">
            ${ETAPES.map(
              (s, i) => `
              <button type="button" role="listitem"
                class="at-loi-station ${i === etape ? 'active' : ''} ${i < etape ? 'faite' : ''}"
                data-etape="${i}" title="${s.lieu}">
                <span class="at-loi-station-icone">${s.icone}</span>
                <span class="at-loi-station-nom">${s.lieu}</span>
              </button>
              ${i < ETAPES.length - 1 ? `<span class="at-loi-lien ${i < etape ? 'fait' : ''}" aria-hidden="true"></span>` : ''}`
            ).join('')}
          </div>

          <div class="at-loi-carte" key="${etape}">
            <p class="at-loi-avancement">Étape ${etape + 1} / ${ETAPES.length}</p>
            <h3>${e.icone} ${e.titre}</h3>
            <p class="at-loi-regle">${e.regle}</p>
            <div class="at-loi-exemple">
              <span class="at-loi-exemple-badge">📦 Notre loi d'exemple</span>
              <p>${e.exemple}</p>
            </div>
            <div class="at-loi-nav">
              <button type="button" class="at-loi-bouton at-loi-bouton--retour" data-nav="-1" ${etape === 0 ? 'disabled' : ''}>← Étape précédente</button>
              ${
                etape < ETAPES.length - 1
                  ? '<button type="button" class="at-loi-bouton" data-nav="1">Étape suivante →</button>'
                  : '<button type="button" class="at-loi-bouton" data-nav="reset">🔁 Revoir le parcours</button>'
              }
            </div>
          </div>
        </div>
      `;

      conteneur.querySelectorAll('.at-loi-station').forEach((b) =>
        b.addEventListener('click', () => {
          etape = Number(b.dataset.etape);
          dessiner();
        })
      );
      conteneur.querySelectorAll('[data-nav]').forEach((b) =>
        b.addEventListener('click', () => {
          if (b.dataset.nav === 'reset') etape = 0;
          else etape = Math.min(ETAPES.length - 1, Math.max(0, etape + Number(b.dataset.nav)));
          dessiner();
        })
      );
    };

    dessiner();
  },
};
