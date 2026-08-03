// Simulation d'entretien de naturalisation en voix temps réel (OpenAI
// Realtime via WebRTC). Trois écrans : accueil (modèle + micro), entretien
// (bandeau coût/modèle en direct, transcript), puis évaluation → rapport.
import { api } from './api.js';
import { thematiques } from './donnees/cours/index.js';
import { quizParTheme } from './donnees/quiz/index.js';

const conteneur = () => document.querySelector('[data-simulations]');

// Tarifs Realtime en dollars par MILLION de tokens (à ajuster si OpenAI
// change sa grille). Le taux €/$ est indicatif pour l'affichage.
const TARIFS = {
  mini: { audioIn: 10, audioInCache: 0.3, audioOut: 20, texteIn: 0.6, texteInCache: 0.06, texteOut: 2.4 },
  flagship: { audioIn: 32, audioInCache: 0.4, audioOut: 64, texteIn: 4, texteInCache: 0.4, texteOut: 16 },
};
const TAUX_EUR = 0.93;
const DUREE_MAX_MS = 30 * 60 * 1000; // coupure propre bien avant la limite API (60 min)

// Session en cours (null hors entretien)
let live = null;

export function rendreSimulations() {
  if (live) {
    rendreEntretien();
    return;
  }
  rendreAccueil();
}

/** Si le membre quitte l'onglet pendant un entretien, on termine proprement. */
window.addEventListener('hashchange', () => {
  if (live && !window.location.hash.startsWith('#simulations')) terminer();
});
window.addEventListener('beforeunload', () => {
  if (live) fermerConnexion();
});

/* ---------- Écran 1 : accueil ---------- */

function rendreAccueil() {
  conteneur().innerHTML = `
    <header class="page-tete">
      <div>
        <h1>Simulations d'entretiens</h1>
        <p class="page-sous">
          Un agent de préfecture virtuel vous fait passer un entretien oral en
          conditions réelles : parcours personnel, questions civiques et
          imprévus. À la fin, vous recevez un rapport d'évaluation détaillé.
        </p>
      </div>
    </header>

    <div class="simu-accueil">
      <section class="simu-bloc">
        <h2>1. Choisissez le modèle vocal</h2>
        <div class="simu-modeles">
          <label class="simu-modele">
            <input type="radio" name="modele" value="mini" checked />
            <span class="simu-modele-corps">
              <strong>Mini <span class="simu-badge">recommandé</span></strong>
              <span>Voix naturelle, très économique (≈ 0,05-0,10 $ / min de conversation).</span>
            </span>
          </label>
          <label class="simu-modele">
            <input type="radio" name="modele" value="flagship" />
            <span class="simu-modele-corps">
              <strong>Flagship</strong>
              <span>Voix la plus réaliste et meilleure compréhension (≈ 4× plus cher).</span>
            </span>
          </label>
        </div>
      </section>

      <section class="simu-bloc">
        <h2>2. Vérifiez votre micro</h2>
        <div class="simu-micro">
          <button type="button" class="quiz-suivant" data-tester-micro>Tester mon micro</button>
          <div class="simu-vumetre" hidden><div data-niveau></div></div>
          <span class="simu-micro-etat" data-micro-etat></span>
        </div>
      </section>

      <section class="simu-bloc">
        <h2>3. Le déroulé (15 à 20 minutes)</h2>
        <ol class="simu-deroule">
          <li><strong>Parcours personnel</strong> — identité, famille, travail, motivations.</li>
          <li><strong>Questions civiques</strong> — piochées dans les 5 thématiques officielles, différentes à chaque session.</li>
          <li><strong>Spontanéité</strong> — questions imprévues et mises en situation.</li>
        </ol>
        <p class="simu-conseil">Parlez comme le jour J : phrases complètes, répondez développé. L'agent ne corrige jamais pendant l'entretien — c'est le rapport final qui vous dira tout.</p>
      </section>

      <div class="simu-lancement">
        <button type="button" class="quiz-suivant simu-demarrer" data-demarrer>🎙️ Démarrer l'entretien</button>
        <p class="simu-note" data-erreur-lancement></p>
        <p class="simu-note">Entraînement — ne prédit pas la décision réelle de l'administration.</p>
      </div>
    </div>
  `;

  conteneur().querySelector('[data-tester-micro]').addEventListener('click', testerMicro);
  conteneur().querySelector('[data-demarrer]').addEventListener('click', demarrer);
}

async function testerMicro() {
  const etat = conteneur().querySelector('[data-micro-etat]');
  const vumetre = conteneur().querySelector('.simu-vumetre');
  try {
    const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
    vumetre.hidden = false;
    etat.textContent = 'Parlez : la barre doit bouger…';
    const ctx = new AudioContext();
    const analyseur = ctx.createAnalyser();
    analyseur.fftSize = 512;
    ctx.createMediaStreamSource(flux).connect(analyseur);
    const donnees = new Uint8Array(analyseur.frequencyBinCount);
    const barre = vumetre.firstElementChild;
    const debut = Date.now();
    (function boucle() {
      analyseur.getByteFrequencyData(donnees);
      const niveau = Math.min(100, (donnees.reduce((a, b) => a + b, 0) / donnees.length) * 1.8);
      barre.style.width = `${niveau}%`;
      if (Date.now() - debut < 6000) requestAnimationFrame(boucle);
      else {
        flux.getTracks().forEach((t) => t.stop());
        ctx.close();
        vumetre.hidden = true;
        etat.textContent = '✅ Micro opérationnel.';
      }
    })();
  } catch {
    etat.textContent = "❌ Micro refusé. Autorisez l'accès au micro dans votre navigateur puis réessayez.";
  }
}

/* ---------- Sélection des questions civiques ---------- */

function tirerQuestions() {
  const titres = Object.fromEntries(thematiques.map((t) => [t.slug, t.titre]));
  const questions = [];
  for (const theme of quizParTheme) {
    const melange = [...theme.questions];
    for (let i = melange.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [melange[i], melange[j]] = [melange[j], melange[i]];
    }
    for (const q of melange.slice(0, 4)) {
      questions.push({ theme: titres[theme.slug] || theme.slug, question: q.question });
    }
  }
  return questions;
}

/* ---------- Écran 2 : entretien en direct ---------- */

async function demarrer() {
  const erreur = conteneur().querySelector('[data-erreur-lancement]');
  erreur.textContent = '';
  const choix = conteneur().querySelector('input[name="modele"]:checked').value;

  let micro;
  try {
    micro = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    erreur.textContent = "Impossible d'accéder au micro : autorisez-le puis relancez.";
    return;
  }

  live = {
    choix,
    modele: '…',
    micro,
    pc: null,
    dc: null,
    audioDistant: new MediaStream(),
    transcript: [],
    tokens: { audioIn: 0, audioInCache: 0, audioOut: 0, texteIn: 0, texteInCache: 0, texteOut: 0 },
    debut: Date.now(),
    statut: 'Connexion à l’agent…',
    montrerTranscript: false,
    reconnexions: 0,
    minuteries: [],
    audioCtx: null,
  };
  rendreEntretien();

  try {
    await connecter();
  } catch (e) {
    fermerConnexion();
    live = null;
    rendreAccueil();
    conteneur().querySelector('[data-erreur-lancement]').textContent =
      `La session n'a pas pu démarrer : ${e.message}`;
    return;
  }

  // Coupure propre à 30 min (limite API Realtime : 60 min)
  live.minuteries.push(setTimeout(() => {
    if (live) { live.statut = 'Durée maximale atteinte — fin de l’entretien.'; terminer(); }
  }, DUREE_MAX_MS));
  live.minuteries.push(setInterval(majBandeau, 1000));
}

async function connecter() {
  const session = await api('/simulation/session', {
    methode: 'POST',
    corps: { modele: live.choix, questions: tirerQuestions() },
  });
  live.modele = session.modele;

  const pc = new RTCPeerConnection();
  live.pc = pc;
  pc.addTrack(live.micro.getAudioTracks()[0], live.micro);
  pc.ontrack = (e) => {
    live.audioDistant = e.streams[0];
    const audio = document.querySelector('[data-audio-agent]');
    if (audio) audio.srcObject = e.streams[0];
    brancherVumetres();
  };

  const dc = pc.createDataChannel('oai-events');
  live.dc = dc;
  dc.addEventListener('message', (e) => {
    try { traiterEvenement(JSON.parse(e.data)); } catch { /* évènement non JSON : ignoré */ }
  });
  dc.addEventListener('open', () => {
    live.statut = 'En ligne — l’agent va vous saluer.';
    majBandeau();
  });

  pc.addEventListener('connectionstatechange', () => {
    if (!live || live.pc !== pc) return;
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      gererDeconnexion();
    }
  });

  const offre = await pc.createOffer();
  await pc.setLocalDescription(offre);
  const reponse = await fetch(
    `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(session.modele)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.client_secret}`, 'Content-Type': 'application/sdp' },
      body: offre.sdp,
    }
  );
  if (!reponse.ok) throw new Error(`connexion refusée (${reponse.status})`);
  await pc.setRemoteDescription({ type: 'answer', sdp: await reponse.text() });
}

async function gererDeconnexion() {
  if (!live) return;
  if (live.reconnexions >= 1) {
    live.statut = 'Connexion perdue — fin de l’entretien.';
    terminer();
    return;
  }
  live.reconnexions += 1;
  live.statut = '⚠️ Connexion perdue, reconnexion en cours…';
  majBandeau();
  try {
    live.pc?.close();
    await connecter();
    live.statut = 'Reconnecté — reprenez l’entretien.';
  } catch {
    live.statut = 'Reconnexion impossible — fin de l’entretien.';
    terminer();
  }
  majBandeau();
}

/* Évènements du canal de données Realtime */
function traiterEvenement(ev) {
  if (!live) return;
  switch (ev.type) {
    // Tokens consommés, à chaque réponse de l'agent (base du coût temps réel)
    case 'response.done': {
      const usage = ev.response?.usage;
      if (!usage) break;
      const entree = usage.input_token_details || {};
      const cache = entree.cached_tokens_details || {};
      const sortie = usage.output_token_details || {};
      live.tokens.texteInCache += cache.text_tokens || 0;
      live.tokens.audioInCache += cache.audio_tokens || 0;
      live.tokens.texteIn += Math.max(0, (entree.text_tokens || 0) - (cache.text_tokens || 0));
      live.tokens.audioIn += Math.max(0, (entree.audio_tokens || 0) - (cache.audio_tokens || 0));
      live.tokens.texteOut += sortie.text_tokens || 0;
      live.tokens.audioOut += sortie.audio_tokens || 0;
      majBandeau();
      break;
    }
    // Transcription de ce que dit le candidat
    case 'conversation.item.input_audio_transcription.completed':
      ajouterTour('candidat', ev.transcript);
      break;
    // Transcription de ce que dit l'agent (les deux noms selon versions d'API)
    case 'response.output_audio_transcript.done':
    case 'response.audio_transcript.done':
      ajouterTour('agent', ev.transcript);
      break;
    default:
      break;
  }
}

function ajouterTour(role, texte) {
  if (!texte || !texte.trim()) return;
  live.transcript.push({ role, texte: texte.trim() });
  const liste = document.querySelector('[data-transcript-liste]');
  if (liste && live.montrerTranscript) {
    liste.insertAdjacentHTML(
      'beforeend',
      `<p class="simu-tour simu-tour--${role}"><strong>${role === 'agent' ? 'Agent' : 'Vous'}</strong> ${echapper(texte)}</p>`
    );
    liste.scrollTop = liste.scrollHeight;
  }
}

function echapper(texte) {
  const div = document.createElement('div');
  div.textContent = texte;
  return div.innerHTML;
}

/* Coût cumulé en dollars à partir des compteurs de tokens */
function coutUsd() {
  const t = live.tokens;
  const p = TARIFS[live.choix];
  return (
    (t.audioIn * p.audioIn + t.audioInCache * p.audioInCache + t.audioOut * p.audioOut +
      t.texteIn * p.texteIn + t.texteInCache * p.texteInCache + t.texteOut * p.texteOut) / 1_000_000
  );
}

const fmtUsd = (v) => `$${v.toFixed(v < 0.1 ? 4 : 2)}`;
const fmtEur = (v) => `${(v * TAUX_EUR).toFixed(v * TAUX_EUR < 0.1 ? 4 : 2)} €`;

function duree() {
  const s = Math.floor((Date.now() - live.debut) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function rendreEntretien() {
  const t = live.tokens;
  conteneur().innerHTML = `
    <div class="simu-live">
      <div class="simu-scene">
        <p class="fiche-etiquette">🎙️ Entretien en cours</p>
        <p class="simu-statut" data-statut>${live.statut}</p>
        <div class="simu-voix-groupe">
          <div class="simu-voix">
            <span class="simu-voix-halo" data-halo-agent></span>
            <span class="simu-voix-avatar">🏛️</span>
            <span>L'agent</span>
          </div>
          <div class="simu-voix">
            <span class="simu-voix-halo simu-voix-halo--vous" data-halo-vous></span>
            <span class="simu-voix-avatar">🎤</span>
            <span>Vous</span>
          </div>
        </div>
        <audio data-audio-agent autoplay></audio>

        <label class="simu-toggle">
          <input type="checkbox" data-toggle-transcript ${live.montrerTranscript ? 'checked' : ''} />
          Afficher le transcript en direct
        </label>
        <div class="simu-transcript" data-transcript-liste ${live.montrerTranscript ? '' : 'hidden'}>
          ${live.transcript
            .map((tour) => `<p class="simu-tour simu-tour--${tour.role}"><strong>${tour.role === 'agent' ? 'Agent' : 'Vous'}</strong> ${echapper(tour.texte)}</p>`)
            .join('')}
        </div>

        <button type="button" class="simu-terminer" data-terminer>⏹ Terminer l'entretien</button>
      </div>

      <aside class="simu-bandeau">
        <p class="cote-titre">Coût de la session</p>
        <div class="simu-bandeau-ligne"><span>Modèle</span><strong data-b-modele>${live.modele}</strong></div>
        <div class="simu-bandeau-ligne"><span>Durée</span><strong data-b-duree>${duree()}</strong></div>
        <div class="simu-bandeau-sep"></div>
        <div class="simu-bandeau-ligne"><span>Audio entrée</span><span data-b-audio-in>${t.audioIn}</span></div>
        <div class="simu-bandeau-ligne"><span>Audio entrée (cache)</span><span data-b-audio-cache>${t.audioInCache}</span></div>
        <div class="simu-bandeau-ligne"><span>Audio sortie</span><span data-b-audio-out>${t.audioOut}</span></div>
        <div class="simu-bandeau-ligne"><span>Texte entrée (+cache)</span><span data-b-texte-in>${t.texteIn + t.texteInCache}</span></div>
        <div class="simu-bandeau-ligne"><span>Texte sortie</span><span data-b-texte-out>${t.texteOut}</span></div>
        <div class="simu-bandeau-sep"></div>
        <div class="simu-bandeau-total">
          <span data-b-usd>${fmtUsd(coutUsd())}</span>
          <span data-b-eur>${fmtEur(coutUsd())}</span>
        </div>
      </aside>
    </div>
  `;

  conteneur().querySelector('[data-terminer]').addEventListener('click', terminer);
  conteneur().querySelector('[data-toggle-transcript]').addEventListener('change', (e) => {
    live.montrerTranscript = e.target.checked;
    const liste = conteneur().querySelector('[data-transcript-liste]');
    liste.hidden = !live.montrerTranscript;
    if (live.montrerTranscript) {
      liste.innerHTML = live.transcript
        .map((tour) => `<p class="simu-tour simu-tour--${tour.role}"><strong>${tour.role === 'agent' ? 'Agent' : 'Vous'}</strong> ${echapper(tour.texte)}</p>`)
        .join('');
      liste.scrollTop = liste.scrollHeight;
    }
  });
  const audio = conteneur().querySelector('[data-audio-agent]');
  if (live.audioDistant.getTracks().length) audio.srcObject = live.audioDistant;
  brancherVumetres();
}

function majBandeau() {
  if (!live) return;
  const el = (s) => document.querySelector(s);
  if (!el('[data-b-duree]')) return;
  const t = live.tokens;
  el('[data-statut]').textContent = live.statut;
  el('[data-b-modele]').textContent = live.modele;
  el('[data-b-duree]').textContent = duree();
  el('[data-b-audio-in]').textContent = t.audioIn;
  el('[data-b-audio-cache]').textContent = t.audioInCache;
  el('[data-b-audio-out]').textContent = t.audioOut;
  el('[data-b-texte-in]').textContent = t.texteIn + t.texteInCache;
  el('[data-b-texte-out]').textContent = t.texteOut;
  el('[data-b-usd]').textContent = fmtUsd(coutUsd());
  el('[data-b-eur]').textContent = fmtEur(coutUsd());
}

/* Halos « qui parle » : niveau audio des deux flux */
function brancherVumetres() {
  if (!live || !document.querySelector('[data-halo-vous]')) return;
  if (live.audioCtx) { live.audioCtx.close().catch(() => {}); }
  const ctx = new AudioContext();
  live.audioCtx = ctx;
  const brancher = (flux, selecteur) => {
    if (!flux || !flux.getAudioTracks().length) return null;
    const analyseur = ctx.createAnalyser();
    analyseur.fftSize = 256;
    ctx.createMediaStreamSource(flux).connect(analyseur);
    return { analyseur, donnees: new Uint8Array(analyseur.frequencyBinCount), selecteur };
  };
  const sondes = [
    brancher(live.micro, '[data-halo-vous]'),
    brancher(live.audioDistant, '[data-halo-agent]'),
  ].filter(Boolean);
  (function boucle() {
    if (!live || live.audioCtx !== ctx) return;
    for (const s of sondes) {
      s.analyseur.getByteFrequencyData(s.donnees);
      const niveau = s.donnees.reduce((a, b) => a + b, 0) / s.donnees.length / 255;
      const halo = document.querySelector(s.selecteur);
      if (halo) halo.style.transform = `scale(${1 + niveau * 1.6})`;
    }
    requestAnimationFrame(boucle);
  })();
}

/* ---------- Fin de session et évaluation ---------- */

function fermerConnexion() {
  if (!live) return;
  live.minuteries.forEach((m) => { clearTimeout(m); clearInterval(m); });
  try { live.dc?.close(); } catch { /* déjà fermé */ }
  try { live.pc?.close(); } catch { /* déjà fermé */ }
  live.micro?.getTracks().forEach((t) => t.stop());
  live.audioCtx?.close().catch(() => {});
}

async function terminer() {
  if (!live) return;
  const session = live;
  fermerConnexion();
  live = null;

  const dureeSecondes = Math.round((Date.now() - session.debut) / 1000);
  const cout = sessionCoutUsd(session);

  if (session.transcript.length < 2) {
    conteneur().innerHTML = `
      <div class="quiz-resultat simu-resultat-court">
        <p class="quiz-note">Entretien interrompu</p>
        <p class="quiz-message">La session était trop courte pour être évaluée. Vérifiez votre micro et votre connexion, puis réessayez.</p>
        <div class="quiz-resultat-actions">
          <a class="quiz-suivant" href="#simulations" data-relancer>Relancer une simulation</a>
        </div>
      </div>`;
    conteneur().querySelector('[data-relancer]').addEventListener('click', (e) => {
      e.preventDefault();
      rendreAccueil();
    });
    return;
  }

  conteneur().innerHTML = `
    <div class="simu-evaluation">
      <div class="simu-spinner" aria-hidden="true"></div>
      <h2>Évaluation en cours…</h2>
      <p>Votre entretien de ${Math.round(dureeSecondes / 60)} min (${session.transcript.length} échanges,
      ${fmtUsd(cout)} / ${fmtEur(cout)}) est en cours d'analyse : niveau de langue, exactitude civique,
      cohérence et interaction. Cela prend moins d'une minute.</p>
    </div>`;

  try {
    const rapport = await api('/simulation/evaluation', {
      methode: 'POST',
      corps: {
        modele_conversation: session.modele,
        duree_secondes: dureeSecondes,
        cout_conversation_usd: cout,
        transcript: session.transcript,
      },
    });
    window.location.hash = `#rapports/${rapport.id}`;
  } catch (e) {
    conteneur().innerHTML = `
      <div class="quiz-resultat simu-resultat-court">
        <p class="quiz-note">Évaluation impossible</p>
        <p class="quiz-message">${echapper(e.message)}</p>
        <div class="quiz-resultat-actions">
          <a class="quiz-suivant" href="#simulations">Retour aux simulations</a>
        </div>
      </div>`;
  }
}

function sessionCoutUsd(session) {
  const t = session.tokens;
  const p = TARIFS[session.choix];
  return (
    (t.audioIn * p.audioIn + t.audioInCache * p.audioInCache + t.audioOut * p.audioOut +
      t.texteIn * p.texteIn + t.texteInCache * p.texteInCache + t.texteOut * p.texteOut) / 1_000_000
  );
}
