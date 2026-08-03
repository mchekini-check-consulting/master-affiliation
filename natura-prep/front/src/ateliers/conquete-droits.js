import './conquete-droits.css';

/* Atelier « La conquête des droits » — jeu de reconstruction chronologique.
   Contenu dérivé des cours « Droits et devoirs » et « Histoire, géographie
   et culture » (src/donnees/cours/). Deux phases : reconstruire la frise
   (clic sur la prochaine conquête), puis réviser chaque conquête. */

const CONQUETES = [
  {
    date: '26 août 1789',
    titre: "Déclaration des droits de l'homme et du citoyen",
    picto: '📜',
    explication:
      "Adoptée pendant la Révolution française, la DDHC marque la fin de l'Ancien Régime. Son article 1er proclame : « Les hommes naissent et demeurent libres et égaux en droits. » Elle garantit la liberté, la propriété, la sûreté et la résistance à l'oppression.",
  },
  {
    date: '27 avril 1848',
    titre: "Abolition définitive de l'esclavage",
    picto: '⛓️',
    explication:
      "La IIe République supprime l'esclavage pour toujours, grâce au combat de Victor Schœlcher. La même année, le suffrage universel masculin est instauré : tous les hommes peuvent voter.",
  },
  {
    date: '1881',
    titre: 'Liberté de la presse',
    picto: '📰',
    explication:
      "La loi de 1881 permet aux journaux de s'exprimer librement. Le droit d'informer et de critiquer devient un fondement de la démocratie française.",
  },
  {
    date: '28 mars 1882',
    titre: 'École gratuite, laïque et obligatoire',
    picto: '🏫',
    explication:
      "Avec les lois de Jules Ferry (1881-1882), l'école publique devient gratuite et laïque, et l'instruction devient obligatoire. L'école pour tous devient un pilier de la République.",
  },
  {
    date: '9 décembre 1905',
    titre: 'Laïcité : séparation des Églises et de l’État',
    picto: '🕊️',
    explication:
      "La loi de séparation des Églises et de l'État fonde la laïcité : la République garantit la liberté de croire ou de ne pas croire, et ne salarie aucun culte.",
  },
  {
    date: '21 avril 1944',
    titre: 'Droit de vote des femmes',
    picto: '🗳️',
    explication:
      "À la Libération, les femmes obtiennent enfin le droit de vote et l'exercent pour la première fois en 1945. Un pas décisif vers l'égalité entre les femmes et les hommes.",
  },
  {
    date: '17 janvier 1975',
    titre: "Loi Veil sur l'IVG",
    picto: '♀️',
    explication:
      "Préparée par la ministre Simone Veil, la loi encadre l'interruption volontaire de grossesse. Elle garantit à la femme le droit de disposer de son corps.",
  },
  {
    date: '1981',
    titre: 'Abolition de la peine de mort',
    picto: '⚖️',
    explication:
      "Sous François Mitterrand, le ministre de la Justice Robert Badinter fait voter l'abolition de la peine de mort : la France ne condamne plus personne à mort.",
  },
  {
    date: '17 mai 2013',
    titre: 'Mariage pour tous',
    picto: '💍',
    explication:
      "La loi ouvre le mariage aux couples de même sexe : deux personnes du même sexe peuvent désormais se marier. L'égalité des droits continue de progresser.",
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
  slug: 'conquete-droits',
  thematique: 'droits-et-devoirs',
  titre: 'La conquête des droits',
  description:
    "Remettez les grandes conquêtes dans l'ordre et reconstruisez deux siècles de progrès.",
  icone: '📜',

  rendre(conteneur) {
    let ordre = [];
    let prochain = 0;
    let erreurs = 0;
    let enVol = false;

    /* Fait « voler » la carte cliquée jusqu'à son emplacement sur la frise
       (clone en position fixe + transition CSS sur transform). */
    function envoler(bouton, cible, apres) {
      const depart = bouton.getBoundingClientRect();
      const arrivee = cible.getBoundingClientRect();
      const clone = bouton.cloneNode(true);
      clone.classList.add('at-cd-vol');
      clone.style.left = `${depart.left}px`;
      clone.style.top = `${depart.top}px`;
      clone.style.width = `${depart.width}px`;
      clone.style.height = `${depart.height}px`;
      document.body.appendChild(clone);
      bouton.style.visibility = 'hidden';

      const dx = arrivee.left + arrivee.width / 2 - (depart.left + depart.width / 2);
      const dy = arrivee.top + arrivee.height / 2 - (depart.top + depart.height / 2);
      const echelle = Math.min(arrivee.width / depart.width, arrivee.height / depart.height, 1);

      let termine = false;
      const finir = () => {
        if (termine) return;
        termine = true;
        clone.remove();
        /* L'atelier a pu être re-rendu pendant le vol : on ne touche plus au DOM. */
        if (!conteneur.contains(cible)) return;
        apres();
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clone.style.transform = `translate(${dx}px, ${dy}px) scale(${echelle})`;
          clone.style.opacity = '0.35';
        });
      });
      clone.addEventListener('transitionend', finir, { once: true });
      setTimeout(finir, 700);
    }

    function majEntete() {
      const etape = conteneur.querySelector('.at-cd-etape-compteur');
      const compteErreurs = conteneur.querySelector('.at-cd-erreurs');
      if (!etape) return;
      etape.textContent = `Étape ${Math.min(prochain + 1, CONQUETES.length)} / ${CONQUETES.length}`;
      compteErreurs.textContent = erreurs === 0 ? 'Aucune erreur' : erreurs === 1 ? '1 erreur' : `${erreurs} erreurs`;
      compteErreurs.classList.toggle('at-cd-erreurs-non-nul', erreurs > 0);
    }

    function remplirEmplacement(indexChrono) {
      const emplacement = conteneur.querySelector(`.at-cd-emplacement[data-position="${indexChrono}"]`);
      const conquete = CONQUETES[indexChrono];
      emplacement.classList.add('at-cd-remplie');
      emplacement.innerHTML = `
        <span class="at-cd-pastille" aria-hidden="true">${indexChrono + 1}</span>
        <div class="at-cd-posee">
          <span class="at-cd-posee-picto" aria-hidden="true">${conquete.picto}</span>
          <span class="at-cd-posee-date">${conquete.date}</span>
          <span class="at-cd-posee-titre">${conquete.titre}</span>
        </div>
      `;
    }

    function rendreJeu() {
      ordre = melanger(CONQUETES.map((c, i) => i));
      prochain = 0;
      erreurs = 0;
      enVol = false;

      conteneur.innerHTML = `
        <div class="at-cd">
          <div class="at-cd-entete">
            <p class="at-cd-consigne">
              Reconstruisez la frise : cliquez sur la conquête qui vient
              <strong>ensuite</strong> dans l'histoire.
            </p>
            <div class="at-cd-scores">
              <span class="at-cd-etape-compteur"></span>
              <span class="at-cd-erreurs"></span>
            </div>
          </div>
          <ol class="at-cd-frise" aria-label="Frise chronologique à compléter">
            ${CONQUETES.map(
              (c, i) => `
              <li class="at-cd-emplacement" data-position="${i}">
                <span class="at-cd-pastille" aria-hidden="true">${i + 1}</span>
                <div class="at-cd-fente" aria-hidden="true">?</div>
              </li>`
            ).join('')}
          </ol>
          <div class="at-cd-main">
            ${ordre
              .map(
                (i) => `
              <button type="button" class="at-cd-carte" data-index="${i}">
                <span class="at-cd-carte-picto" aria-hidden="true">${CONQUETES[i].picto}</span>
                <span class="at-cd-carte-titre">${CONQUETES[i].titre}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>
      `;
      majEntete();

      conteneur.querySelectorAll('.at-cd-carte').forEach((bouton) => {
        bouton.addEventListener('click', () => {
          if (enVol) return;
          const index = Number(bouton.dataset.index);

          if (index !== prochain) {
            erreurs += 1;
            majEntete();
            bouton.classList.remove('at-cd-secoue');
            void bouton.offsetWidth;
            bouton.classList.add('at-cd-secoue');
            bouton.addEventListener(
              'animationend',
              () => bouton.classList.remove('at-cd-secoue'),
              { once: true }
            );
            return;
          }

          enVol = true;
          const emplacement = conteneur.querySelector(`.at-cd-emplacement[data-position="${index}"]`);
          envoler(bouton, emplacement, () => {
            bouton.remove();
            remplirEmplacement(index);
            prochain += 1;
            enVol = false;
            majEntete();
            if (prochain >= CONQUETES.length) {
              const frise = conteneur.querySelector('.at-cd-frise');
              setTimeout(() => {
                if (conteneur.contains(frise)) rendreRevision();
              }, 800);
            }
          });
        });
      });
    }

    function rendreRevision() {
      let message;
      if (erreurs === 0) {
        message = "Sans faute ! Vous connaissez parfaitement l'ordre des grandes conquêtes.";
      } else if (erreurs <= 2) {
        message = "Très bien ! Encore une relecture et cette chronologie n'aura plus de secret pour vous.";
      } else if (erreurs <= 5) {
        message = 'Bon travail ! Relisez les explications ci-dessous pour bien ancrer les dates.';
      } else {
        message = 'La chronologie se construit pas à pas : parcourez la frise ci-dessous, puis rejouez !';
      }
      const texteErreurs =
        erreurs === 0 ? '0 erreur' : erreurs === 1 ? '1 erreur' : `${erreurs} erreurs`;

      conteneur.innerHTML = `
        <div class="at-cd">
          <div class="at-cd-bilan">
            <span class="at-cd-bilan-icone" aria-hidden="true">${erreurs === 0 ? '🏆' : '📜'}</span>
            <p class="at-cd-bilan-titre">Frise reconstruite !</p>
            <p class="at-cd-bilan-erreurs ${erreurs === 0 ? 'at-cd-bilan-parfait' : ''}">${texteErreurs}</p>
            <p class="at-cd-bilan-message">${message}</p>
            <button type="button" class="at-cd-rejouer">Rejouer</button>
          </div>
          <p class="at-cd-revision-consigne">
            Deux siècles de progrès : cliquez sur chaque conquête pour revoir ce qu'elle a changé.
          </p>
          <ol class="at-cd-revision">
            ${CONQUETES.map(
              (c, i) => `
              <li class="at-cd-revision-item">
                <button type="button" class="at-cd-revision-bouton" data-index="${i}" aria-expanded="false">
                  <span class="at-cd-revision-picto" aria-hidden="true">${c.picto}</span>
                  <span class="at-cd-revision-date">${c.date}</span>
                  <span class="at-cd-revision-titre">${c.titre}</span>
                  <span class="at-cd-chevron" aria-hidden="true">+</span>
                </button>
                <div class="at-cd-revision-detail" hidden>
                  <p>${c.explication}</p>
                </div>
              </li>`
            ).join('')}
          </ol>
        </div>
      `;

      conteneur.querySelectorAll('.at-cd-revision-bouton').forEach((bouton) => {
        bouton.addEventListener('click', () => {
          const item = bouton.closest('.at-cd-revision-item');
          const detail = item.querySelector('.at-cd-revision-detail');
          const dejaOuvert = !detail.hidden;
          conteneur.querySelectorAll('.at-cd-revision-item.ouvert').forEach((autre) => {
            autre.classList.remove('ouvert');
            autre.querySelector('.at-cd-revision-detail').hidden = true;
            autre.querySelector('.at-cd-chevron').textContent = '+';
            autre.querySelector('.at-cd-revision-bouton').setAttribute('aria-expanded', 'false');
          });
          if (!dejaOuvert) {
            item.classList.add('ouvert');
            detail.hidden = false;
            bouton.querySelector('.at-cd-chevron').textContent = '−';
            bouton.setAttribute('aria-expanded', 'true');
          }
        });
      });

      conteneur.querySelector('.at-cd-rejouer').addEventListener('click', rendreJeu);
    }

    rendreJeu();
  },
};
