// Atelier « Frise chronologique » : l'histoire de France en événements
// cliquables, filtrables par période. Contenu aligné sur les fiches histoire.
import './frise.css';

const PERIODES = [
  { cle: 'origines', nom: 'Des origines à Louis XIV', couleur: '#8a6d3b' },
  { cle: 'revolution', nom: 'La Révolution', couleur: '#d6293a' },
  { cle: 'republiques', nom: 'Les républiques (1792-1958)', couleur: '#1e2b9e' },
  { cle: 'guerres', nom: 'Les guerres mondiales', couleur: '#5a5a5a' },
  { cle: 'cinquieme', nom: 'La Ve République', couleur: '#1c8a4b' },
];

const EVENEMENTS = [
  { date: '≈ -18 000', periode: 'origines', titre: 'Les grottes de Lascaux', texte: 'Des hommes préhistoriques peignent les parois des grottes de Lascaux, en Dordogne : l\'une des plus anciennes traces de présence humaine en France.' },
  { date: '-52', periode: 'origines', titre: 'La Gaule devient romaine', texte: 'Jules César bat Vercingétorix à Alésia. La Gaule romaine adopte le latin, à l\'origine de la langue française.' },
  { date: '496', periode: 'origines', titre: 'Baptême de Clovis', texte: 'Clovis, roi des Francs, se fait baptiser à Reims. Le pays des Francs donnera son nom à la France.' },
  { date: '800', periode: 'origines', titre: 'Charlemagne empereur', texte: 'Charlemagne est couronné empereur d\'Occident. Son empire couvre une grande partie de l\'Europe.' },
  { date: '1163', periode: 'origines', titre: 'Notre-Dame de Paris', texte: 'Début de la construction de la cathédrale Notre-Dame de Paris, chef-d\'œuvre de l\'art gothique.' },
  { date: '1429', periode: 'origines', titre: 'Jeanne d\'Arc délivre Orléans', texte: 'Pendant la guerre de Cent Ans contre l\'Angleterre, Jeanne d\'Arc mène les troupes françaises à la victoire d\'Orléans.' },
  { date: '1598', periode: 'origines', titre: 'Édit de Nantes', texte: 'Henri IV met fin aux guerres de religion entre catholiques et protestants en accordant la liberté de culte aux protestants.' },
  { date: '1661', periode: 'origines', titre: 'Louis XIV, le Roi-Soleil', texte: 'Louis XIV règne en monarque absolu et fait construire le château de Versailles. Molière écrit ses grandes comédies à cette époque.' },
  { date: 'XVIIIe', periode: 'origines', titre: 'Les Lumières', texte: 'Voltaire, Rousseau, Diderot et Montesquieu défendent la raison, la liberté et la tolérance. Leurs idées préparent la Révolution.' },

  { date: '5 mai 1789', periode: 'revolution', titre: 'Ouverture des états généraux', texte: 'Face à la crise financière, Louis XVI convoque les états généraux à Versailles : c\'est le début de la Révolution française.' },
  { date: '14 juillet 1789', periode: 'revolution', titre: 'Prise de la Bastille', texte: 'Le peuple de Paris prend la Bastille, prison symbole de l\'arbitraire royal. Avec la fête de la Fédération de 1790, c\'est l\'origine de la fête nationale.' },
  { date: '26 août 1789', periode: 'revolution', titre: 'Déclaration des droits de l\'homme', texte: 'La Déclaration des droits de l\'homme et du citoyen proclame que les hommes naissent et demeurent libres et égaux en droits.' },
  { date: 'avril 1792', periode: 'revolution', titre: 'La Marseillaise', texte: 'Rouget de Lisle compose le chant de guerre pour l\'armée du Rhin, qui deviendra l\'hymne national : La Marseillaise.' },
  { date: '21 sept. 1792', periode: 'revolution', titre: 'Ière République', texte: 'La monarchie est abolie et la Ière République est proclamée. Louis XVI est guillotiné le 21 janvier 1793.' },
  { date: '1799', periode: 'revolution', titre: 'Coup d\'État de Bonaparte', texte: 'Napoléon Bonaparte prend le pouvoir par un coup d\'État et met fin à la Révolution. Il crée le Code civil en 1804.' },

  { date: '27 avril 1848', periode: 'republiques', titre: 'Abolition de l\'esclavage', texte: 'La IIe République abolit définitivement l\'esclavage, grâce au combat de Victor Schœlcher, et instaure le suffrage universel masculin.' },
  { date: '1870', periode: 'republiques', titre: 'IIIe République', texte: 'Après la défaite face à la Prusse, la IIIe République est proclamée. Elle durera jusqu\'en 1940.' },
  { date: '28 mars 1882', periode: 'republiques', titre: 'École gratuite et obligatoire', texte: 'Les lois de Jules Ferry rendent l\'instruction obligatoire, gratuite et laïque. L\'école devient le pilier de la République.' },
  { date: '1881', periode: 'republiques', titre: 'Liberté de la presse', texte: 'La loi sur la liberté de la presse garantit le droit d\'informer et de critiquer : un fondement de la démocratie.' },
  { date: '9 déc. 1905', periode: 'republiques', titre: 'Loi de séparation (laïcité)', texte: 'La loi de séparation des Églises et de l\'État fonde la laïcité : la République garantit la liberté de conscience et ne salarie aucun culte.' },
  { date: '1936', periode: 'republiques', titre: 'Front populaire', texte: 'Les premiers congés payés et la semaine de 40 heures : des avancées sociales majeures pour les travailleurs.' },

  { date: '1914-1918', periode: 'guerres', titre: 'Première Guerre mondiale', texte: 'La Grande Guerre fait 1,4 million de morts français. La bataille de Verdun (1916) en est le symbole. Armistice le 11 novembre 1918.' },
  { date: '18 juin 1940', periode: 'guerres', titre: 'Appel du général de Gaulle', texte: 'Depuis Londres, le général de Gaulle appelle les Français à résister à l\'occupation allemande.' },
  { date: '1943', periode: 'guerres', titre: 'Jean Moulin unifie la Résistance', texte: 'Jean Moulin crée le Conseil national de la Résistance, qui unifie les mouvements de résistance contre l\'occupant.' },
  { date: '6 juin 1944', periode: 'guerres', titre: 'Débarquement de Normandie', texte: 'Les Alliés débarquent en Normandie. L\'Allemagne nazie capitule le 8 mai 1945. La Shoah a exterminé 6 millions de Juifs d\'Europe.' },
  { date: '21 avril 1944', periode: 'guerres', titre: 'Droit de vote des femmes', texte: 'Les femmes obtiennent le droit de vote et l\'exercent pour la première fois en 1945.' },
  { date: '1945', periode: 'guerres', titre: 'Sécurité sociale', texte: 'Création de la Sécurité sociale, financée par les cotisations : un exemple concret de la fraternité républicaine.' },

  { date: '4 oct. 1958', periode: 'cinquieme', titre: 'Constitution de la Ve République', texte: 'Le général de Gaulle fonde la Ve République. La Constitution de 1958 organise encore aujourd\'hui nos institutions.' },
  { date: '1962', periode: 'cinquieme', titre: 'Élection du président au suffrage direct', texte: 'Les Français élisent désormais directement le président de la République. La même année, l\'Algérie devient indépendante.' },
  { date: 'mai 1968', periode: 'cinquieme', titre: 'Mai 68', texte: 'Un vaste mouvement étudiant et ouvrier transforme la société française : libéralisation des mœurs et modernisation.' },
  { date: '17 janv. 1975', periode: 'cinquieme', titre: 'Loi Veil (IVG)', texte: 'Simone Veil fait voter la loi qui dépénalise l\'interruption volontaire de grossesse : le droit des femmes à disposer de leur corps.' },
  { date: '1981', periode: 'cinquieme', titre: 'Abolition de la peine de mort', texte: 'Sous François Mitterrand, Robert Badinter fait abolir la peine de mort.' },
  { date: '25 mars 1957', periode: 'cinquieme', titre: 'Traité de Rome', texte: 'La France et 5 autres pays fondent la Communauté économique européenne, devenue l\'Union européenne le 1er novembre 1993.' },
  { date: '17 mai 2013', periode: 'cinquieme', titre: 'Mariage pour tous', texte: 'La loi ouvre le mariage aux couples de même sexe : l\'égalité des droits progresse.' },
];

export default {
  slug: 'frise',
  thematique: 'histoire-geographie-culture',
  titre: 'La frise chronologique interactive',
  description: 'De Lascaux à nos jours : cliquez sur chaque événement pour comprendre ce qui s\'est passé.',
  icone: '🕰️',
  rendre(conteneur) {
    let filtre = 'tout';
    let ouvert = null;

    const dessiner = () => {
      const visibles = EVENEMENTS.filter((e) => filtre === 'tout' || e.periode === filtre);
      conteneur.innerHTML = `
        <div class="at-frise">
          <div class="at-frise-filtres" role="tablist">
            <button type="button" class="at-frise-filtre ${filtre === 'tout' ? 'actif' : ''}" data-periode="tout">Tout</button>
            ${PERIODES.map(
              (p) => `<button type="button" class="at-frise-filtre ${filtre === p.cle ? 'actif' : ''}"
                data-periode="${p.cle}" style="--pastille:${p.couleur}"><i></i>${p.nom}</button>`
            ).join('')}
          </div>
          <ol class="at-frise-liste">
            ${visibles
              .map((e, i) => {
                const periode = PERIODES.find((p) => p.cle === e.periode);
                const estOuvert = ouvert === e.titre;
                return `
              <li class="at-frise-item ${estOuvert ? 'ouvert' : ''}" style="--pastille:${periode.couleur}; --delai:${Math.min(i * 40, 600)}ms">
                <button type="button" class="at-frise-evenement" data-titre="${e.titre.replace(/"/g, '&quot;')}" aria-expanded="${estOuvert}">
                  <span class="at-frise-date">${e.date}</span>
                  <span class="at-frise-titre">${e.titre}</span>
                  <span class="at-frise-chevron" aria-hidden="true">${estOuvert ? '−' : '+'}</span>
                </button>
                <div class="at-frise-detail" ${estOuvert ? '' : 'hidden'}>
                  <p>${e.texte}</p>
                  <span class="at-frise-periode">${periode.nom}</span>
                </div>
              </li>`;
              })
              .join('')}
          </ol>
        </div>
      `;

      conteneur.querySelectorAll('.at-frise-filtre').forEach((b) =>
        b.addEventListener('click', () => {
          filtre = b.dataset.periode;
          ouvert = null;
          dessiner();
        })
      );
      // Ouverture/fermeture en place, sans re-rendu (l'animation d'entrée
      // de la liste ne doit pas se rejouer à chaque clic)
      conteneur.querySelectorAll('.at-frise-evenement').forEach((b) =>
        b.addEventListener('click', () => {
          const item = b.closest('.at-frise-item');
          const detail = item.querySelector('.at-frise-detail');
          const dejaOuvert = !detail.hidden;
          conteneur.querySelectorAll('.at-frise-item.ouvert').forEach((autre) => {
            autre.classList.remove('ouvert');
            autre.querySelector('.at-frise-detail').hidden = true;
            autre.querySelector('.at-frise-chevron').textContent = '+';
            autre.querySelector('.at-frise-evenement').setAttribute('aria-expanded', 'false');
          });
          ouvert = dejaOuvert ? null : b.dataset.titre;
          if (!dejaOuvert) {
            item.classList.add('ouvert');
            detail.hidden = false;
            item.querySelector('.at-frise-chevron').textContent = '−';
            b.setAttribute('aria-expanded', 'true');
          }
        })
      );
    };

    dessiner();
  },
};
