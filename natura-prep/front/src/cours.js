// Rendu de la section « Cours » de l'espace membre : thématiques
// officielles → fiches → lecteur pleine largeur avec sommaire.
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
    <header class="page-tete">
      <div>
        <h1>Cours</h1>
        <p class="page-sous">
          ${totalFiches} fiches organisées selon les 5 thématiques officielles de la
          formation civique. Tout ce qu'il faut savoir pour l'entretien,
          expliqué simplement.
        </p>
      </div>
    </header>
    <div class="thematiques">
      ${thematiques
        .map(
          (t) => `
        <a class="thematique" href="#cours/${t.slug}">
          <div class="thematique-haut">
            <span class="thematique-ico" aria-hidden="true">${t.icone}</span>
            <span class="thematique-compte">${t.fiches.length} fiche${t.fiches.length > 1 ? 's' : ''}</span>
          </div>
          <strong>${t.titre}</strong>
          <span class="thematique-desc">${t.description}</span>
          <span class="thematique-apercu">
            ${t.fiches
              .slice(0, 3)
              .map((f) => `<span>· ${f.titre}</span>`)
              .join('')}
            ${t.fiches.length > 3 ? `<span class="thematique-plus">+ ${t.fiches.length - 3} autres…</span>` : ''}
          </span>
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
    <header class="page-tete">
      <div>
        <h1><span aria-hidden="true">${thematique.icone}</span> ${thematique.titre}</h1>
        <p class="page-sous">${thematique.description}</p>
      </div>
    </header>
    <div class="fiches">
      ${thematique.fiches
        .map(
          (f, i) => `
        <a class="fiche-lien" href="#cours/${thematique.slug}/${f.slug}">
          <span class="fiche-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="fiche-corps">
            <strong>${f.titre}</strong>
            <span class="fiche-resume">${f.resume}</span>
          </span>
          <span class="fiche-meta">${f.sections.length} parties <span aria-hidden="true">→</span></span>
        </a>`
        )
        .join('')}
    </div>
  `;
}

/* ---------- Niveau 3 : lecteur de fiche (pleine largeur + sommaire) ---------- */

function rendreFiche(thematique, fiche) {
  const index = thematique.fiches.indexOf(fiche);
  const precedente = thematique.fiches[index - 1];
  const suivante = thematique.fiches[index + 1];

  conteneur().innerHTML = `
    <nav class="cours-retour">
      <a href="#cours/${thematique.slug}">← ${thematique.titre}</a>
    </nav>
    <div class="fiche-layout">
      <article class="fiche">
        <p class="fiche-etiquette">${thematique.icone} ${thematique.titre} · fiche ${index + 1} / ${thematique.fiches.length}</p>
        <h1>${fiche.titre}</h1>
        <p class="fiche-chapeau">${fiche.resume}</p>

        ${fiche.sections
          .map(
            (s, i) => `
          <section class="fiche-section" data-cible="s${i}">
            <h2><span class="fiche-section-num">${i + 1}</span> ${s.titre}</h2>
            ${s.texte ? `<p>${s.texte}</p>` : ''}
            ${s.points ? `<ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : ''}
          </section>`
          )
          .join('')}

        <nav class="fiche-nav">
          ${
            precedente
              ? `<a class="fiche-nav-lien" href="#cours/${thematique.slug}/${precedente.slug}"><small>Fiche précédente</small>← ${precedente.titre}</a>`
              : '<span></span>'
          }
          ${
            suivante
              ? `<a class="fiche-nav-lien fiche-nav-lien--suivant" href="#cours/${thematique.slug}/${suivante.slug}"><small>Fiche suivante</small>${suivante.titre} →</a>`
              : `<a class="fiche-nav-lien fiche-nav-lien--suivant" href="#cours/${thematique.slug}"><small>Thématique terminée</small>Retour au sommaire ✓</a>`
          }
        </nav>
      </article>

      <aside class="fiche-cote">
        <nav class="sommaire-fiche">
          <p class="cote-titre">Dans cette fiche</p>
          ${fiche.sections
            .map(
              (s, i) =>
                `<button type="button" data-aller="s${i}"><span>${i + 1}</span>${s.titre}</button>`
            )
            .join('')}
        </nav>
        <div class="a-retenir">
          <p class="cote-titre">✅ À retenir</p>
          <ul>${fiche.aRetenir.map((p) => `<li>${p}</li>`).join('')}</ul>
        </div>
      </aside>
    </div>
  `;

  // Sommaire : défilement doux vers la section (sans toucher au hash de navigation)
  conteneur()
    .querySelectorAll('[data-aller]')
    .forEach((bouton) => {
      bouton.addEventListener('click', () => {
        conteneur()
          .querySelector(`[data-cible="${bouton.dataset.aller}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

  window.scrollTo(0, 0);
}
