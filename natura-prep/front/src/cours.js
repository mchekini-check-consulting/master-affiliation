// Rendu de la section « Cours » de l'espace membre : thématiques
// officielles → fiches → lecteur de fiche.
import { thematiques } from './donnees/cours/index.js';

const conteneur = () => document.querySelector('[data-cours]');

/** Rend la section Cours selon le chemin [slugThematique, slugFiche]. */
export function rendreCours(segments) {
  const [slugThematique, slugFiche] = segments;
  const thematique = thematiques.find((t) => t.slug === slugThematique);
  if (thematique) {
    const fiche = thematique.fiches.find((f) => f.slug === slugFiche);
    if (fiche) {
      rendreFiche(thematique, fiche);
      return;
    }
    rendreThematique(thematique);
    return;
  }
  rendreAccueil();
}

/* ---------- Niveau 1 : les 5 thématiques ---------- */

function rendreAccueil() {
  const totalFiches = thematiques.reduce((n, t) => n + t.fiches.length, 0);
  conteneur().innerHTML = `
    <h1>Cours</h1>
    <p class="cours-intro">
      Les ${totalFiches} fiches de cours suivent les 5 thématiques officielles
      de la formation civique. Lisez-les à votre rythme : tout ce qu'il faut
      savoir pour l'entretien y est expliqué simplement.
    </p>
    <div class="thematiques">
      ${thematiques
        .map(
          (t) => `
        <a class="thematique" href="#cours/${t.slug}">
          <span class="thematique-ico" aria-hidden="true">${t.icone}</span>
          <span class="thematique-corps">
            <strong>${t.titre}</strong>
            <span class="thematique-desc">${t.description}</span>
          </span>
          <span class="thematique-compte">${t.fiches.length} fiche${t.fiches.length > 1 ? 's' : ''}</span>
        </a>`
        )
        .join('')}
    </div>
  `;
}

/* ---------- Niveau 2 : les fiches d'une thématique ---------- */

function rendreThematique(thematique) {
  conteneur().innerHTML = `
    <nav class="cours-retour"><a href="#cours">← Toutes les thématiques</a></nav>
    <h1><span aria-hidden="true">${thematique.icone}</span> ${thematique.titre}</h1>
    <p class="cours-intro">${thematique.description}</p>
    <ol class="fiches">
      ${thematique.fiches
        .map(
          (f, i) => `
        <li>
          <a class="fiche-lien" href="#cours/${thematique.slug}/${f.slug}">
            <span class="fiche-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="fiche-corps">
              <strong>${f.titre}</strong>
              <span class="fiche-resume">${f.resume}</span>
            </span>
            <span class="fiche-fleche" aria-hidden="true">→</span>
          </a>
        </li>`
        )
        .join('')}
    </ol>
  `;
}

/* ---------- Niveau 3 : lecteur de fiche ---------- */

function rendreFiche(thematique, fiche) {
  const index = thematique.fiches.indexOf(fiche);
  const precedente = thematique.fiches[index - 1];
  const suivante = thematique.fiches[index + 1];

  conteneur().innerHTML = `
    <nav class="cours-retour">
      <a href="#cours/${thematique.slug}">← ${thematique.titre}</a>
    </nav>
    <article class="fiche">
      <p class="fiche-etiquette">${thematique.icone} ${thematique.titre} · fiche ${index + 1} / ${thematique.fiches.length}</p>
      <h1>${fiche.titre}</h1>
      <p class="fiche-chapeau">${fiche.resume}</p>

      ${fiche.sections
        .map(
          (s) => `
        <section class="fiche-section">
          <h2>${s.titre}</h2>
          ${s.texte ? `<p>${s.texte}</p>` : ''}
          ${s.points ? `<ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : ''}
        </section>`
        )
        .join('')}

      <aside class="a-retenir">
        <h2>✅ À retenir</h2>
        <ul>${fiche.aRetenir.map((p) => `<li>${p}</li>`).join('')}</ul>
      </aside>

      <nav class="fiche-nav">
        ${
          precedente
            ? `<a class="fiche-nav-lien" href="#cours/${thematique.slug}/${precedente.slug}">← ${precedente.titre}</a>`
            : '<span></span>'
        }
        ${
          suivante
            ? `<a class="fiche-nav-lien fiche-nav-lien--suivant" href="#cours/${thematique.slug}/${suivante.slug}">${suivante.titre} →</a>`
            : `<a class="fiche-nav-lien fiche-nav-lien--suivant" href="#cours/${thematique.slug}">Fin de la thématique ✓</a>`
        }
      </nav>
    </article>
  `;
  conteneur().closest('.contenu').scrollTop = 0;
  window.scrollTo(0, 0);
}
