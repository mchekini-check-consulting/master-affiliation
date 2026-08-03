// Rapports d'évaluation des simulations d'entretien : liste + vue détaillée
// (scores, erreurs, plan de révision, coûts) avec impression / export PDF.
import { api } from './api.js';

const conteneur = () => document.querySelector('[data-rapports]');

export async function rendreRapports(segments) {
  const [id] = segments;
  try {
    if (id) await rendreDetail(id);
    else await rendreListe();
  } catch (e) {
    conteneur().innerHTML = `
      <header class="page-tete"><div><h1>Rapports</h1></div></header>
      <div class="vide"><span class="vide-ico" aria-hidden="true">📊</span>
        <h2>Impossible de charger les rapports</h2><p>${e.message}</p></div>`;
  }
}

/* ---------- Liste ---------- */

const AVIS_CLASSE = { favorable: 'favorable', 'réservé': 'reserve', 'défavorable': 'defavorable' };

function dateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function dureeFr(secondes) {
  const min = Math.round(secondes / 60);
  return min < 1 ? '< 1 min' : `${min} min`;
}

async function rendreListe() {
  const rapports = await api('/simulation/rapports');
  conteneur().innerHTML = `
    <header class="page-tete">
      <div>
        <h1>Rapports</h1>
        <p class="page-sous">
          Après chaque simulation d'entretien, retrouvez ici votre rapport
          détaillé : niveau de langue, exactitude civique, avis simulé et plan
          de révision.
        </p>
      </div>
    </header>
    ${
      rapports.length === 0
        ? `<div class="vide">
            <span class="vide-ico" aria-hidden="true">📊</span>
            <h2>Aucun rapport pour l'instant</h2>
            <p>Lancez votre première <a href="#simulations">simulation d'entretien</a> :
            son rapport d'évaluation apparaîtra ici.</p>
          </div>`
        : `<div class="rapports-liste">
            ${rapports
              .map(
                (r) => `
              <a class="rapport-carte" href="#rapports/${r.id}">
                <span class="rapport-carte-corps">
                  <strong>Entretien du ${dateFr(r.cree_le)}</strong>
                  <span>${dureeFr(r.duree_secondes)} · ${r.modele_conversation} · ${fmtCout(r.cout_total_usd)}</span>
                </span>
                <span class="rapport-carte-notes">
                  <span class="rapport-puce">CECRL ${r.niveau_cecrl}</span>
                  <span class="rapport-puce">${r.score_civique >= 0 ? `${r.score_civique}/20 civique` : 'civique —'}</span>
                  <span class="rapport-avis rapport-avis--${AVIS_CLASSE[r.avis] || 'reserve'}">${r.avis}</span>
                </span>
                <span class="fiche-fleche" aria-hidden="true">→</span>
              </a>`
              )
              .join('')}
          </div>`
    }
  `;
}

const fmtCout = (usd) => `$${usd.toFixed(usd < 0.1 ? 4 : 2)}`;

/* ---------- Détail ---------- */

async function rendreDetail(id) {
  const r = await api(`/simulation/rapports/${id}`);
  const rap = r.rapport;
  const coutTotal = r.cout_conversation_usd + r.cout_evaluation_usd;
  const transcript = Array.isArray(r.transcript) ? r.transcript : [];

  conteneur().innerHTML = `
    <nav class="cours-retour rapport-non-imprime"><a href="#rapports">← Tous les rapports</a></nav>
    <article class="rapport">
      <header class="rapport-tete">
        <div>
          <p class="fiche-etiquette">📊 Rapport d'évaluation</p>
          <h1>Entretien du ${dateFr(r.cree_le)}</h1>
          <p class="page-sous">${dureeFr(r.duree_secondes)} d'entretien · voix : ${r.modele_conversation} · évaluation : ${r.modele_evaluation}</p>
        </div>
        <button type="button" class="quiz-secondaire rapport-non-imprime" data-imprimer>🖨 Imprimer / PDF</button>
      </header>

      <p class="rapport-disclaimer">⚠️ Entraînement — ne prédit pas la décision réelle de l'administration.</p>

      <div class="rapport-scores">
        <div class="rapport-score">
          <span class="rapport-score-valeur">${rap.niveau_cecrl_estime.niveau}</span>
          <span class="rapport-score-libelle">Niveau CECRL estimé</span>
        </div>
        <div class="rapport-score">
          <span class="rapport-score-valeur">${rap.exactitude_civique.score}<small>/20</small></span>
          <span class="rapport-score-libelle">Exactitude civique</span>
        </div>
        <div class="rapport-score">
          <span class="rapport-score-valeur">${rap.coherence_recit.score}<small>/10</small></span>
          <span class="rapport-score-libelle">Cohérence du récit</span>
        </div>
        <div class="rapport-score">
          <span class="rapport-score-valeur">${rap.interaction.score}<small>/10</small></span>
          <span class="rapport-score-libelle">Interaction</span>
        </div>
        <div class="rapport-score rapport-score--avis">
          <span class="rapport-avis rapport-avis--${AVIS_CLASSE[rap.avis_simule.avis] || 'reserve'}">${rap.avis_simule.avis}</span>
          <span class="rapport-score-libelle">Avis simulé</span>
        </div>
      </div>

      <section class="fiche-section">
        <h2>🗣 Niveau de langue</h2>
        <p>${rap.niveau_cecrl_estime.justification}</p>
      </section>

      <section class="fiche-section">
        <h2>🏛 Connaissances civiques — ${rap.exactitude_civique.score}/20</h2>
        ${
          rap.exactitude_civique.erreurs.length === 0
            ? '<p>Aucune erreur factuelle relevée : excellent.</p>'
            : `<table class="rapport-erreurs">
                <thead><tr><th>Question</th><th>Votre réponse</th><th>Réponse correcte</th><th>Thème</th></tr></thead>
                <tbody>
                  ${rap.exactitude_civique.erreurs
                    .map((e) => `<tr><td>${e.question}</td><td>${e.reponse_candidat}</td><td>${e.reponse_correcte}</td><td>${e.theme}</td></tr>`)
                    .join('')}
                </tbody>
              </table>`
        }
      </section>

      <section class="fiche-section">
        <h2>📖 Cohérence du récit — ${rap.coherence_recit.score}/10</h2>
        <p>${rap.coherence_recit.commentaire}</p>
      </section>

      <section class="fiche-section">
        <h2>⚡ Interaction et spontanéité — ${rap.interaction.score}/10</h2>
        <p>${rap.interaction.commentaire}</p>
      </section>

      <section class="fiche-section rapport-avis-bloc">
        <h2>🧑‍⚖️ Avis simulé : <span class="rapport-avis rapport-avis--${AVIS_CLASSE[rap.avis_simule.avis] || 'reserve'}">${rap.avis_simule.avis}</span></h2>
        <p>${rap.avis_simule.motivation}</p>
      </section>

      <section class="fiche-section">
        <h2>🎯 Plan de révision</h2>
        <ol class="rapport-plan">
          ${rap.plan_revision.map((p) => `<li>${p}</li>`).join('')}
        </ol>
      </section>

      ${
        rap.verbatims.length
          ? `<section class="fiche-section">
              <h2>💬 Extraits à retravailler</h2>
              ${rap.verbatims
                .map((v) => `<blockquote class="rapport-verbatim">« ${v.extrait} »<footer>${v.probleme}</footer></blockquote>`)
                .join('')}
            </section>`
          : ''
      }

      <section class="fiche-section rapport-couts">
        <h2>💵 Coût de la session</h2>
        <div class="simu-bandeau-ligne"><span>Conversation vocale (${r.modele_conversation})</span><strong>${fmtCout(r.cout_conversation_usd)}</strong></div>
        <div class="simu-bandeau-ligne"><span>Évaluation du transcript (${r.modele_evaluation})</span><strong>${fmtCout(r.cout_evaluation_usd)}</strong></div>
        <div class="simu-bandeau-ligne rapport-cout-total"><span>Total</span><strong>${fmtCout(coutTotal)} · ${(coutTotal * 0.93).toFixed(coutTotal * 0.93 < 0.1 ? 4 : 2)} €</strong></div>
      </section>

      ${
        transcript.length
          ? `<details class="rapport-transcript rapport-non-imprime">
              <summary>Voir le transcript complet (${transcript.length} échanges)</summary>
              <div class="simu-transcript">
                ${transcript
                  .map((t) => `<p class="simu-tour simu-tour--${t.role}"><strong>${t.role === 'agent' ? 'Agent' : 'Vous'}</strong> ${t.texte}</p>`)
                  .join('')}
              </div>
            </details>`
          : ''
      }
    </article>
  `;

  conteneur().querySelector('[data-imprimer]').addEventListener('click', () => window.print());
  window.scrollTo(0, 0);
}
