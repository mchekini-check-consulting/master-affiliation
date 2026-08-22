/*
 * Échecs360 — interface de l'application d'échecs.
 * Trois modes : Deux joueurs, Contre le bot (Web Worker), Mes parties
 * (import chess.com + relecture + analyse). Interaction au clic et au
 * glisser-déposer (Pointer Events), animations ~180 ms, sons WebAudio.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------- contexte --

  const PSEUDO = document.querySelector('meta[name="user-pseudo"]').content || 'Moi';
  let chesscomUsername = document.querySelector('meta[name="chesscom-username"]').content || '';
  const CSRF_TOKEN = document.querySelector('meta[name="_csrf"]').content;
  const CSRF_HEADER = document.querySelector('meta[name="_csrf_header"]').content;

  const boardEl = document.getElementById('board');
  const movesEl = document.getElementById('moves');
  const statusMain = document.getElementById('status-main');
  const statusSub = document.getElementById('status-sub');
  const thinkingEl = document.getElementById('thinking');
  const gamesPanel = document.getElementById('games-panel');
  const replayNav = document.getElementById('replay-nav');
  const graphWrap = document.getElementById('eval-graph-wrap');
  const graphCanvas = document.getElementById('eval-graph');
  const analysisProgress = document.getElementById('analysis-progress');
  const analysisSummary = document.getElementById('analysis-summary');
  const btnNew = document.getElementById('btn-new');
  const btnUndo = document.getElementById('btn-undo');
  const btnFlip = document.getElementById('btn-flip');
  const btnAnalyze = document.getElementById('btn-analyze');

  // ----------------------------------------------------------------- état --

  let mode = 'two';               // 'two' | 'bot' | 'games'
  let game = Chess.newGame();     // état moteur (modes jeu)
  let sanHistory = [];            // SAN des coups joués
  let orientation = 'w';          // couleur en bas de l'échiquier
  let selected = -1;              // case sélectionnée (-1 : aucune)
  let legalTargets = [];          // coups légaux depuis la sélection
  let lastMove = null;            // { from, to } pour la surbrillance
  let gameOver = false;

  // Bot
  let worker = null;
  let botColor = 'b';
  let botElo = 800;
  let botThinking = false;
  let searchToken = 0;            // invalide les réponses obsolètes du worker

  // Mes parties (relecture)
  let gamesList = [];
  let replay = null;              // { headers, sans, snapshots, moves, userColor, evals?, cls? }
  let replayPly = 0;

  // Exercices intensifs
  let exFilter = 'mats';          // sous-onglet : 'mats' | 'finales'
  let exCurrent = null;           // exercice en cours { type: 'mat'|'finale', data }
  let exPlayerColor = 'w';        // camp joué par l'utilisateur
  let exStep = 0;                 // avancement dans la solution (mats)
  let exBusy = false;             // réponse scriptée / solution en cours
  let exAutoPlay = false;         // la solution a été déroulée automatiquement
  let exMessage = '';             // message affiché sous le titre
  let exSteps = null;             // visionneuse d'étapes { line, ply, attacker, startTurn, finCaption }
  let trainer = null;             // Blunder Trainer { state, puzzles, index, score, ... }
  let missP = null;               // Miss Puzzles { state, puzzles, index, score, ... }
  let missM = null;               // Miss Mates { state, puzzles, index, score, matesLeft, ... }

  // Réglages persistés : sons, aides (badges, alertes, explications),
  // moteur d'analyse ('stockfish' | 'maison'), apparence (échiquier, fond,
  // couleur des flèches) et bot (Elo, temps de réflexion maxi en ms)
  const SETTINGS_KEY = 'echecs360-reglages';
  let settings = Object.assign({
    sons: true, aides: true, moteur: 'stockfish',
    plateau: 'classique', fond: 'sombre', fleche: 'vert',
    botElo: 800, botTemps: 0,
    musique: false, musiqueVolume: 0.4
  }, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  botElo = settings.botElo || 800;

  // ------------------------------------------------------------ apparence --

  // Palettes d'échiquier (surbrillances accordées aux cases)
  const PLATEAUX = {
    classique: { light: '#ebecd0', dark: '#739552', hlStrong: '#f5f682', hlSoft: '#b9ca43' },
    bois:      { light: '#f0d9b5', dark: '#b58863', hlStrong: '#f6eb72', hlSoft: '#dcc34b' },
    bleu:      { light: '#dee3e6', dark: '#788a94', hlStrong: '#f5f682', hlSoft: '#b9ca43' },
    gris:      { light: '#e9e9e9', dark: '#8b959e', hlStrong: '#f5f682', hlSoft: '#c6cf5e' }
  };
  // Fonds de la zone échiquier (panneaux et bordures accordés)
  const FONDS = {
    sombre:  { bg: '#262421', panel: '#21201d', panel2: '#2b2926', border: '#3d3a36' },
    ardoise: { bg: '#20242e', panel: '#1b1f27', panel2: '#272c38', border: '#363c4a' },
    foret:   { bg: '#1c2622', panel: '#171f1c', panel2: '#24302b', border: '#32403a' },
    prune:   { bg: '#271f27', panel: '#211a21', panel2: '#2e252e', border: '#3e323e' }
  };
  const FLECHES = { vert: '#15781b', rouge: '#a02222', bleu: '#1a4b8f', orange: '#e68f00' };

  function applyAppearance() {
    const p = PLATEAUX[settings.plateau] || PLATEAUX.classique;
    const f = FONDS[settings.fond] || FONDS.sombre;
    const rs = document.documentElement.style;
    rs.setProperty('--light-sq', p.light);
    rs.setProperty('--dark-sq', p.dark);
    rs.setProperty('--hl-strong', p.hlStrong);
    rs.setProperty('--hl-soft', p.hlSoft);
    rs.setProperty('--bg', f.bg);
    rs.setProperty('--panel', f.panel);
    rs.setProperty('--panel-2', f.panel2);
    rs.setProperty('--border', f.border);
  }
  const EX_STORAGE_KEY = 'echecs360-exercices-faits';
  let exDone = new Set(JSON.parse(localStorage.getItem(EX_STORAGE_KEY) || '[]'));

  // Cache des analyses de parties : une partie terminée ne change plus, son
  // analyse non plus. Les résultats par partie (gaffes détectées, mats ratés)
  // sont conservés — les sessions suivantes du Blunder Trainer, de Miss
  // Puzzles et de Miss Mates se préparent quasi instantanément. Les résultats
  // vides comptent aussi : ne pas ré-analyser une partie sans puzzle est
  // l'essentiel du gain.
  const SCAN_CACHE_KEY = 'echecs360-scan-cache-v1';
  let scanCache;
  try { scanCache = JSON.parse(localStorage.getItem(SCAN_CACHE_KEY) || '{}'); }
  catch (e) { scanCache = {}; }
  function scanCacheKey(kind, g, color) {
    return kind + '|' + color + '|' + (g.url || g.end_time || '');
  }
  function scanCacheGet(kind, g, color) {
    const entry = scanCache[scanCacheKey(kind, g, color)];
    return entry ? entry.items : null;
  }
  function scanCachePut(key, items) {
    scanCache[key] = { t: Date.now(), items };
    const keys = Object.keys(scanCache);
    if (keys.length > 400) { // borne la taille du cache (par ancienneté)
      keys.sort((a, b) => (scanCache[a].t || 0) - (scanCache[b].t || 0));
      for (const k of keys.slice(0, keys.length - 400)) delete scanCache[k];
    }
    try { localStorage.setItem(SCAN_CACHE_KEY, JSON.stringify(scanCache)); }
    catch (e) { /* quota plein : le cache mémoire suffit pour la session */ }
  }

  const squares = [];             // 64 éléments .sq (ordre index moteur)
  const pieceEls = new Map();     // index case → élément .piece

  // ------------------------------------------------------ musique d'ambiance --
  // Playlist importée par l'utilisateur (fichiers audio, stockés dans le
  // navigateur via IndexedDB, persistants) jouée en boucle dans toute l'app.
  // Sans playlist : « Fjord Moonlight » (Draugr Beatz), piste embarquée par
  // défaut, jouée en boucle.

  const MUSIC_DEFAULT_URL = '/app/music/fjord-moonlight.mp3';
  let musicPlaying = false;
  let musicAudio = null;   // <audio> (piste par défaut ou importée)
  let musicQueue = [];     // [{ id, name, blob }]
  let musicIndex = 0;

  function musicDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('echecs360-musique', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('pistes', { keyPath: 'id', autoIncrement: true });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function musicLoadAll() {
    const db = await musicDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction('pistes').objectStore('pistes').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  async function musicAdd(file) {
    const db = await musicDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pistes', 'readwrite');
      tx.objectStore('pistes').add({ name: file.name.replace(/\.[^.]+$/, ''), blob: file });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  async function musicDelete(id) {
    const db = await musicDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pistes', 'readwrite');
      tx.objectStore('pistes').delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  function musicStopAudio() {
    if (!musicAudio) return;
    musicAudio.pause();
    if (musicAudio.src.startsWith('blob:')) URL.revokeObjectURL(musicAudio.src);
    musicAudio = null;
  }

  /** Piste par défaut embarquée : « Fjord Moonlight » (Draugr Beatz), en boucle. */
  function musicPlayDefault() {
    musicStopAudio();
    musicAudio = new Audio(MUSIC_DEFAULT_URL);
    musicAudio.loop = true;
    musicAudio.volume = settings.musiqueVolume || 0.4;
    musicAudio.play().catch(() => { /* autoplay bloqué : relancé au 1er geste */ });
  }

  function musicPlayTrack(index) {
    if (musicQueue.length === 0) return;
    musicIndex = ((index % musicQueue.length) + musicQueue.length) % musicQueue.length;
    musicStopAudio();
    musicAudio = new Audio(URL.createObjectURL(musicQueue[musicIndex].blob));
    musicAudio.volume = settings.musiqueVolume || 0.4;
    musicAudio.addEventListener('ended', () => { if (musicPlaying) musicPlayTrack(musicIndex + 1); });
    musicAudio.play().catch(() => { /* autoplay bloqué : relancé au 1er geste */ });
  }

  /** Démarre la musique (playlist importée, sinon Fjord Moonlight). */
  async function musicStart() {
    if (!settings.musique || musicPlaying) return;
    musicPlaying = true;
    try { musicQueue = await musicLoadAll(); } catch (e) { musicQueue = []; }
    if (!musicPlaying) return; // coupée entre-temps
    if (musicQueue.length > 0) musicPlayTrack(musicIndex);
    else musicPlayDefault();
  }
  function musicStop() {
    musicPlaying = false;
    musicStopAudio();
  }
  function musicApplyVolume() {
    if (musicAudio) musicAudio.volume = settings.musiqueVolume || 0.4;
  }
  // Autoplay bloqué avant le premier geste : on relance à la première
  // interaction (l'AudioContext suspendu reprend aussi)
  document.addEventListener('pointerdown', () => {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    if (musicPlaying && musicAudio && musicAudio.paused) musicAudio.play().catch(() => {});
  }, { capture: true });

  // ------------------------------------------------------------------ sons --

  let audioCtx = null;
  function beep(freq, duration, type, gainValue) {
    if (!settings.sons) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainValue || 0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* audio non disponible : silencieux */ }
  }
  const soundMove = () => beep(420, 0.07, 'sine', 0.07);
  const soundCapture = () => beep(210, 0.1, 'triangle', 0.1);
  const soundEnd = () => { beep(392, 0.14, 'sine', 0.08); setTimeout(() => beep(523, 0.22, 'sine', 0.08), 130); };

  /** Nappe grave dissonante : le son du « signal faible ». */
  function soundWeird() {
    if (!settings.sons) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      gain.connect(audioCtx.destination);
      for (const freq of [98, 104.5]) {          // deux ondes désaccordées : battement inquiétant
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.92, now + 0.9);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch (e) { /* silencieux */ }
  }

  // ----------------------------------------------------------- échiquier --

  /** Ligne/colonne affichées selon l'orientation. */
  function viewRow(sq) { const r = (sq / 8) | 0; return orientation === 'w' ? r : 7 - r; }
  function viewCol(sq) { const c = sq % 8; return orientation === 'w' ? c : 7 - c; }
  function squareAtView(row, col) {
    const r = orientation === 'w' ? row : 7 - row;
    const c = orientation === 'w' ? col : 7 - col;
    return r * 8 + c;
  }

  /** Construit les 64 cases (une seule fois). */
  function buildBoard() {
    boardEl.innerHTML = '';
    squares.length = 0;
    for (let sq = 0; sq < 64; sq++) {
      const el = document.createElement('div');
      el.className = 'sq' + (((((sq / 8) | 0) + sq % 8) % 2 === 1) ? ' dark' : '');
      el.dataset.sq = sq;
      squares.push(el);
      boardEl.appendChild(el);
    }
    placeSquares();
  }

  /** Positionne les cases et les coordonnées selon l'orientation. */
  function placeSquares() {
    for (let sq = 0; sq < 64; sq++) {
      const el = squares[sq];
      el.style.gridRowStart = viewRow(sq) + 1;
      el.style.gridColumnStart = viewCol(sq) + 1;
      // Coordonnées : rangée sur la colonne de gauche, colonne sur la dernière rangée
      el.querySelectorAll('.coord').forEach(n => n.remove());
      if (viewCol(sq) === 0) {
        const span = document.createElement('span');
        span.className = 'coord rank';
        span.textContent = Chess.rankOf(sq);
        el.appendChild(span);
      }
      if (viewRow(sq) === 7) {
        const span = document.createElement('span');
        span.className = 'coord file';
        span.textContent = 'abcdefgh'[sq % 8];
        el.appendChild(span);
      }
    }
  }

  /** Synchronise la couche des pièces avec un plateau donné. */
  function syncPieces(board, animate) {
    // Supprime les pièces disparues, met à jour ou crée les autres
    for (const [sq, el] of [...pieceEls]) {
      if (board[sq] === null || el.dataset.piece !== board[sq]) {
        el.remove();
        pieceEls.delete(sq);
      }
    }
    for (let sq = 0; sq < 64; sq++) {
      const piece = board[sq];
      if (piece === null) continue;
      let el = pieceEls.get(sq);
      if (!el) {
        el = document.createElement('div');
        el.className = 'piece no-anim';
        el.dataset.piece = piece;
        el.dataset.sq = sq;
        el.innerHTML = PIECES[piece];
        positionPiece(el, sq);
        boardEl.appendChild(el);
        pieceEls.set(sq, el);
        requestAnimationFrame(() => el.classList.remove('no-anim'));
      } else {
        positionPiece(el, sq);
      }
    }
    void animate;
  }

  /** Déplace visuellement une pièce (transition CSS ~180 ms). */
  function animateMove(from, to) {
    const el = pieceEls.get(from);
    if (!el) return;
    pieceEls.delete(from);
    const captured = pieceEls.get(to);
    if (captured) { captured.remove(); pieceEls.delete(to); }
    pieceEls.set(to, el);
    el.dataset.sq = to;
    positionPiece(el, to);
  }

  function positionPiece(el, sq) {
    el.style.transform = 'translate(' + viewCol(sq) * 100 + '%, ' + viewRow(sq) * 100 + '%)';
  }

  /** Ajuste la taille pour occuper quasiment toute la hauteur de l'écran. */
  function fitBoard() {
    if (window.innerWidth <= 1100) {
      document.documentElement.style.setProperty('--board-size', '100%');
      return;
    }
    const zone = document.querySelector('.board-zone');
    // Réserve verticale : juste les deux barres de joueurs (30 px chacune)
    const size = Math.max(320, Math.min(zone.clientHeight - 64, zone.clientWidth - 8));
    document.documentElement.style.setProperty('--board-size', size + 'px');
  }

  // ------------------------------------------------------- surbrillances --

  function refreshHighlights(board, check) {
    for (const el of squares) {
      el.classList.remove('last-move', 'selected', 'check', 'drag-over');
      el.querySelectorAll('.hint').forEach(n => n.remove());
    }
    if (lastMove) {
      squares[lastMove.from].classList.add('last-move');
      squares[lastMove.to].classList.add('last-move');
    }
    if (selected >= 0) {
      squares[selected].classList.add('selected');
      for (const move of legalTargets) {
        const hint = document.createElement('div');
        hint.className = 'hint' + ((board[move.to] !== null || move.ep) ? ' capture' : '');
        squares[move.to].appendChild(hint);
        if (move.castle) {
          // Le roi peut aussi être déposé sur la tour : anneau sur sa case
          const rookSq = move.castle === 'K' ? move.to + 1 : move.to - 2;
          const ring = document.createElement('div');
          ring.className = 'hint capture';
          squares[rookSq].appendChild(ring);
        }
      }
    }
    if (check) {
      // Halo rouge sur le roi en échec
      const kingSq = findKing(board, check);
      if (kingSq >= 0) squares[kingSq].classList.add('check');
    }
  }

  function findKing(board, color) {
    const king = color === 'w' ? 'K' : 'k';
    for (let i = 0; i < 64; i++) if (board[i] === king) return i;
    return -1;
  }

  // ------------------------------------------------------- barres joueurs --

  const PIECE_ORDER = ['q', 'r', 'b', 'n', 'p'];
  const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const INITIAL_COUNT = { p: 8, n: 2, b: 2, r: 2, q: 1 };

  /** Pièces capturées par `color` = pièces adverses manquantes du plateau. */
  function capturedBy(board, color) {
    const enemy = color === 'w' ? 'b' : 'w';
    const count = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    for (const piece of board) {
      if (piece === null) continue;
      if ((enemy === 'w') === (piece === piece.toUpperCase())) {
        const t = piece.toLowerCase();
        if (count[t] !== undefined) count[t]++;
      }
    }
    const captured = [];
    let value = 0;
    for (const t of PIECE_ORDER) {
      for (let i = count[t]; i < INITIAL_COUNT[t]; i++) {
        captured.push(enemy === 'w' ? t.toUpperCase() : t);
        value += PIECE_VALUE[t];
      }
    }
    return { captured, value };
  }

  function renderBars(board, turn, names) {
    const bottomColor = orientation;
    const topColor = orientation === 'w' ? 'b' : 'w';
    const bars = {
      [bottomColor]: document.getElementById('bar-bottom'),
      [topColor]: document.getElementById('bar-top')
    };
    for (const color of ['w', 'b']) {
      const bar = bars[color];
      bar.classList.toggle('white', color === 'w');
      bar.classList.toggle('black', color === 'b');
      bar.querySelector('.avatar').textContent = color === 'w' ? 'B' : 'N';
      bar.querySelector('.name').textContent = names[color];
      bar.classList.toggle('to-move', turn === color && !gameOver);
      const mine = capturedBy(board, color);
      const other = capturedBy(board, color === 'w' ? 'b' : 'w');
      const capturedHost = bar.querySelector('.captured');
      capturedHost.innerHTML = mine.captured.map(p => PIECES[p]).join('');
      const diff = mine.value - other.value;
      bar.querySelector('.material').textContent = diff > 0 ? '+' + diff : '';
    }
  }

  function playerNames() {
    if (mode === 'exercises' && exCurrent) {
      const other = exCurrent.type === 'finale' ? 'Bot' : 'Adversaire';
      return exPlayerColor === 'w' ? { w: PSEUDO, b: other } : { w: other, b: PSEUDO };
    }
    if (mode === 'bot') {
      const bot = 'Bot (' + botElo + ')';
      return botColor === 'w' ? { w: bot, b: PSEUDO } : { w: PSEUDO, b: bot };
    }
    if (mode === 'games' && replay) {
      return { w: replay.headers.White || 'Blancs', b: replay.headers.Black || 'Noirs' };
    }
    if (mode === 'trainer' && trainer && trainer.puzzles && trainer.puzzles[trainer.index]) {
      const p = trainer.puzzles[trainer.index];
      return p.userColor === 'w' ? { w: PSEUDO, b: p.opponent } : { w: p.opponent, b: PSEUDO };
    }
    const quiz = mode === 'misspuzzles' ? missP : mode === 'missmates' ? missM : null;
    if (quiz && quiz.puzzles && quiz.puzzles[quiz.index]) {
      const p = quiz.puzzles[quiz.index];
      return p.userColor === 'w' ? { w: PSEUDO, b: p.opponent } : { w: p.opponent, b: PSEUDO };
    }
    return { w: 'Blancs', b: 'Noirs' };
  }

  // ----------------------------------------------------------- liste SAN --

  function renderMoves(sans, currentPly, classifications) {
    movesEl.innerHTML = '';
    for (let i = 0; i < sans.length; i += 2) {
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = (i / 2 + 1) + '.';
      movesEl.appendChild(num);
      for (const j of [i, i + 1]) {
        const cell = document.createElement('span');
        if (j < sans.length) {
          cell.className = 'mv' + (currentPly === j + 1 ? ' current' : '');
          cell.textContent = sans[j];
          cell.dataset.ply = j + 1;
          const cls = classifications && classifications[j];
          if (cls) {
            const badge = document.createElement('span');
            badge.className = 'badge-q ' + cls.kind;
            badge.textContent = cls.symbol;
            cell.appendChild(badge);
          }
          cell.addEventListener('click', () => {
            if (mode === 'games' && replay) gotoPly(j + 1);
          });
        }
        movesEl.appendChild(cell);
      }
    }
    // Fait défiler jusqu'au coup courant
    const current = movesEl.querySelector('.mv.current');
    if (current) current.scrollIntoView({ block: 'nearest' });
  }

  // ---------------------------------------------------------------- statut --

  function renderStatus() {
    if (mode === 'openings') {
      if (opState.ligne) {
        statusMain.textContent = opState.opening.nom;
        statusSub.textContent = opState.ligne.titre + ' — suivez la flèche, coup par coup.';
      } else {
        statusMain.textContent = 'Ouvertures';
        statusSub.textContent = 'Choisissez votre camp puis une ouverture à étudier.';
      }
      return;
    }
    if (mode === 'config') {
      statusMain.textContent = 'Configuration';
      statusSub.textContent = 'Pseudo chess.com et chargement des parties.';
      return;
    }
    if (mode === 'trainer') {
      statusMain.textContent = 'Blunder Trainer';
      if (trainer && (trainer.state === 'guess' || trainer.state === 'feedback')) {
        const p = trainer.puzzles[trainer.index];
        statusSub.textContent = trainer.state === 'guess'
          ? 'Trouvez le meilleur coup pour les ' + (p.userColor === 'w' ? 'Blancs' : 'Noirs') + '.'
          : (trainer.lastResult && trainer.lastResult.ok ? '✓ Bien vu !' : '✗ Le meilleur coup est surligné en vert.');
      } else if (trainer && trainer.state === 'done') {
        statusSub.textContent = 'Session terminée : ' + trainer.score + '/' + trainer.puzzles.length + '.';
      } else {
        statusSub.textContent = 'Vos gaffes deviennent vos exercices.';
      }
      return;
    }
    if (mode === 'misspuzzles') {
      statusMain.textContent = 'Miss Puzzles';
      if (missP && (missP.state === 'guess' || missP.state === 'feedback')) {
        const p = missP.puzzles[missP.index];
        statusSub.textContent = missP.state === 'guess'
          ? 'Vous aviez l\'avantage : trouvez le coup qui le garde ('
            + (p.userColor === 'w' ? 'Blancs' : 'Noirs') + ').'
          : (missP.lastResult && missP.lastResult.ok ? '✓ Avantage conservé !' : '✗ Le bon coup est surligné en vert.');
      } else if (missP && missP.state === 'done') {
        statusSub.textContent = 'Session terminée : ' + missP.score + '/' + missP.puzzles.length + '.';
      } else {
        statusSub.textContent = 'Les avantages laissés filer deviennent vos exercices.';
      }
      return;
    }
    if (mode === 'missmates') {
      statusMain.textContent = 'Miss Mates';
      if (missM && (missM.state === 'guess' || missM.state === 'feedback')) {
        const p = missM.puzzles[missM.index];
        if (missM.state === 'guess') {
          statusSub.textContent = missM.busy
            ? (missM.notice || 'Vérification du mat…')
            : (missM.notice || 'Mat en ' + missM.matesLeft + ' — trait aux '
               + (p.userColor === 'w' ? 'Blancs' : 'Noirs') + '.');
        } else {
          statusSub.textContent = missM.lastResult && missM.lastResult.ok
            ? '✓ Échec et mat !' : '✗ Le mat s\'est échappé — regardez la solution.';
        }
      } else if (missM && missM.state === 'done') {
        statusSub.textContent = 'Note finale : ' + missM.score + '/' + missM.puzzles.length + '.';
      } else {
        statusSub.textContent = 'Rejouez les mats en 1 à 3 coups que vous avez ratés.';
      }
      return;
    }
    if (mode === 'exercises') {
      if (!exCurrent) {
        statusMain.textContent = 'Exercices intensifs';
        statusSub.textContent = 'Choisissez un exercice : mats célèbres ou finales de base.';
      } else {
        statusMain.textContent = exCurrent.data.titre;
        statusSub.textContent = exMessage;
      }
      return;
    }
    if (mode === 'games') {
      if (!replay) {
        statusMain.textContent = 'Mes parties';
        statusSub.textContent = 'Importez vos parties chess.com pour les rejouer.';
        return;
      }
      const h = replay.headers;
      statusMain.textContent = (h.White || '?') + ' – ' + (h.Black || '?');
      statusSub.textContent = 'Coup ' + replayPly + ' / ' + replay.sans.length
          + (h.Result ? ' · ' + h.Result : '');
      return;
    }
    const status = Chess.statusOf(game);
    if (status.over) {
      const labels = {
        '1-0': 'Victoire des Blancs', '0-1': 'Victoire des Noirs', '1/2-1/2': 'Partie nulle'
      };
      statusMain.textContent = labels[status.result];
      statusSub.textContent = reasonLabel(status.reason);
    } else if (status.check) {
      statusMain.textContent = game.turn === 'w' ? 'Les Blancs sont en échec !' : 'Les Noirs sont en échec !';
      statusSub.textContent = '';
    } else {
      statusMain.textContent = game.turn === 'w' ? 'Trait aux Blancs' : 'Trait aux Noirs';
      statusSub.textContent = '';
    }
  }

  function reasonLabel(reason) {
    const labels = {
      'échec et mat': 'Par échec et mat',
      'pat': 'Par pat — aucun coup légal, roi non attaqué',
      'règle des 50 coups': 'Nulle par la règle des 50 coups',
      'triple répétition': 'Nulle par triple répétition',
      'matériel insuffisant': 'Nulle par matériel insuffisant'
    };
    return labels[reason] || reason;
  }

  // ------------------------------------------------------------ rendu global --

  function renderGame(options) {
    const opts = options || {};
    const status = Chess.statusOf(game);
    gameOver = status.over;
    if (opts.animate && lastMove) {
      animateMove(lastMove.from, lastMove.to);
      // Resynchronise après l'animation (roque, e.p., promotion)
      setTimeout(() => syncPieces(game.board), 110);
    } else {
      syncPieces(game.board);
    }
    refreshHighlights(game.board, status.check ? game.turn : null);
    renderBars(game.board, game.turn, playerNames());
    renderMoves(sanHistory, sanHistory.length, null);
    renderStatus();
    btnUndo.disabled = sanHistory.length === 0 || botThinking;
    if (status.over && opts.justEnded) {
      soundEnd();
      if (mode === 'exercises' && exCurrent) {
        exOnGameOver(status);
      } else {
        showGameOverModal(status);
      }
    }
  }

  // ------------------------------------------------------------- jouer un coup --

  function playMove(move) {
    const san = Chess.sanOf(game, move);
    Chess.play(game, move);
    sanHistory.push(san);
    lastMove = { from: move.from, to: move.to };
    selected = -1;
    legalTargets = [];
    if (move.capture) soundCapture(); else soundMove();
    const status = Chess.statusOf(game);
    renderGame({ animate: true, justEnded: status.over });
    const botDefendsExercise = mode === 'exercises' && exCurrent
        && exCurrent.type === 'finale' && game.turn !== exPlayerColor;
    if (!status.over && ((mode === 'bot' && game.turn === botColor) || botDefendsExercise)) {
      requestBotMove();
    }
    if (mode === 'exercises' && exCurrent && exCurrent.type === 'finale' && !status.over) {
      exMessage = exFinaleMessage();
      renderStatus();
    }
  }

  /**
   * Roque intuitif : le roi déposé (ou cliqué) sur sa propre tour joue le
   * roque de ce côté, comme sur Lichess/chess.com.
   */
  function castleMoveViaRook(from, to) {
    const piece = game.board[from];
    const target = game.board[to];
    if (piece === null || target === null) return null;
    if (piece.toLowerCase() !== 'k' || target.toLowerCase() !== 'r') return null;
    if (Chess.colorOf(target) !== Chess.colorOf(piece)) return null;
    const side = to > from ? 'K' : 'Q';
    return legalTargets.find(m => m.from === from && m.castle === side) || null;
  }

  /** Tente de jouer de `from` vers `to` (gère le choix de promotion). */
  function tryMove(from, to) {
    let candidates = legalTargets.filter(m => m.from === from && m.to === to);
    if (candidates.length === 0) {
      const castle = castleMoveViaRook(from, to);
      if (castle) candidates = [castle];
    }
    if (candidates.length === 0) return false;
    // Blunder Trainer : le coup est une réponse au quiz, pas une partie
    if (mode === 'trainer') {
      if (trainer && trainer.state === 'guess') return trainerTryMove(from, to, candidates);
      return false;
    }
    // Miss Puzzles / Miss Mates : même principe, le coup répond au puzzle
    if (mode === 'misspuzzles') {
      if (missP && missP.state === 'guess') return missPTryMove(from, to, candidates);
      return false;
    }
    if (mode === 'missmates') {
      if (missM && missM.state === 'guess' && !missM.busy) return missMTryMove(from, to, candidates);
      return false;
    }
    // Mode « trouve le mat » : le coup doit être celui de la solution
    if (mode === 'exercises' && exCurrent && exCurrent.type === 'mat') {
      return exTryMatMove(from, to, candidates);
    }
    if (candidates[0].promo) {
      showPromotionPicker(candidates, to);
    } else {
      playMove(candidates[0]);
    }
    return true;
  }

  // ----------------------------------------------------- promotion (choix) --

  function showPromotionPicker(candidates, to) {
    closePromotionPicker();
    const color = Chess.colorOf(candidates[0].piece);
    const picker = document.createElement('div');
    picker.className = 'promo-picker';
    picker.id = 'promo-picker';
    // Enfant de #board : sans ceci, le pointerdown de l'échiquier fermerait
    // le sélecteur avant que le click des boutons ne se déclenche
    picker.addEventListener('pointerdown', (e) => e.stopPropagation());
    picker.style.left = (viewCol(to) * 12.5) + '%';
    const onTop = viewRow(to) === 0;
    picker.style.top = onTop ? '0' : 'auto';
    picker.style.bottom = onTop ? 'auto' : '0';
    for (const promo of ['q', 'r', 'b', 'n']) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = PIECES[color === 'w' ? promo.toUpperCase() : promo];
      btn.addEventListener('click', () => {
        closePromotionPicker();
        playMove(candidates.find(m => m.promo === promo));
      });
      picker.appendChild(btn);
    }
    boardEl.appendChild(picker);
  }

  function closePromotionPicker() {
    const existing = document.getElementById('promo-picker');
    if (existing) existing.remove();
  }

  // ------------------------------------- flèches et cercles (clic droit) --

  let drawSvg = null;      // calque SVG au-dessus des pièces
  let drawings = [];       // { from, to } — from === to : cercle
  let drawStart = null;    // case du pointerdown droit en cours
  let drawPointerId = null;

  function ensureDrawLayer() {
    if (drawSvg && drawSvg.parentNode === boardEl) return drawSvg;
    drawSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    drawSvg.setAttribute('viewBox', '0 0 80 80');
    drawSvg.classList.add('draw-layer');
    boardEl.appendChild(drawSvg);
    return drawSvg;
  }

  function centerOf(sq) {
    return { x: viewCol(sq) * 10 + 5, y: viewRow(sq) * 10 + 5 };
  }

  /** Redessine toutes les annotations (+ aperçu de la flèche en cours). */
  function redrawAnnotations(previewTo) {
    const svg = ensureDrawLayer();
    svg.innerHTML = '';
    const color = FLECHES[settings.fleche] || FLECHES.vert;
    const items = drawings.slice();
    if (drawStart !== null && previewTo !== undefined && previewTo >= 0) {
      items.push({ from: drawStart, to: previewTo, preview: true });
    }
    for (const d of items) {
      const a = centerOf(d.from);
      if (d.from === d.to) {
        const c = document.createElementNS(svg.namespaceURI, 'circle');
        c.setAttribute('cx', a.x); c.setAttribute('cy', a.y); c.setAttribute('r', 4.2);
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', color);
        c.setAttribute('stroke-width', '0.9');
        c.setAttribute('opacity', d.preview ? '0.5' : '0.8');
        svg.appendChild(c);
      } else {
        const b = centerOf(d.to);
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        const headLen = 3.4, headW = 2.4;
        const sx = a.x + ux * 1.6, sy = a.y + uy * 1.6;       // léger retrait du départ
        const ex = b.x - ux * headLen, ey = b.y - uy * headLen; // base de la pointe
        const g = document.createElementNS(svg.namespaceURI, 'g');
        g.setAttribute('opacity', d.preview ? '0.5' : '0.8');
        const line = document.createElementNS(svg.namespaceURI, 'line');
        line.setAttribute('x1', sx); line.setAttribute('y1', sy);
        line.setAttribute('x2', ex); line.setAttribute('y2', ey);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2.1');
        line.setAttribute('stroke-linecap', 'round');
        g.appendChild(line);
        const head = document.createElementNS(svg.namespaceURI, 'polygon');
        head.setAttribute('points',
          b.x + ',' + b.y + ' '
          + (ex - uy * headW) + ',' + (ey + ux * headW) + ' '
          + (ex + uy * headW) + ',' + (ey - ux * headW));
        head.setAttribute('fill', color);
        g.appendChild(head);
        svg.appendChild(g);
      }
    }
  }

  function clearAnnotations() {
    if (drawings.length === 0 && drawStart === null) return;
    drawings = [];
    drawStart = null;
    redrawAnnotations();
  }

  boardEl.addEventListener('contextmenu', (e) => e.preventDefault());

  // -------------------------------------------------- interactions (clic + drag) --

  let dragging = null; // { el, from, moved, startX, startY }

  function humanCanMove() {
    if (gameOver || mode === 'games' || exSteps) return false;
    if (mode === 'bot') return !botThinking && game.turn !== botColor;
    if (mode === 'exercises') {
      return exCurrent !== null && !exBusy && !botThinking && game.turn === exPlayerColor;
    }
    if (mode === 'trainer') return trainer !== null && trainer.state === 'guess';
    if (mode === 'misspuzzles') return missP !== null && missP.state === 'guess';
    if (mode === 'missmates') return missM !== null && missM.state === 'guess' && !missM.busy;
    if (mode === 'openings') return false;
    return true;
  }

  boardEl.addEventListener('pointerdown', (event) => {
    // Clic droit : début d'une flèche / d'un cercle
    if (event.button === 2) {
      const start = squareFromEvent(event);
      if (start >= 0) {
        drawStart = start;
        drawPointerId = event.pointerId;
        try { boardEl.setPointerCapture(event.pointerId); } catch (e) { /* pointeur synthétique */ }
        redrawAnnotations(start);
      }
      return;
    }
    if (event.button !== 0) return;
    if (event.target.closest && event.target.closest('.promo-picker')) return;
    clearAnnotations();   // clic gauche : efface flèches et cercles (comme Lichess)
    closePromotionPicker();
    const sq = squareFromEvent(event);
    if (sq < 0) return;

    // Clic sur une case cible d'un coup légal → jouer
    if (selected >= 0 && tryMove(selected, sq)) return;

    if (!humanCanMove()) return;
    const piece = game.board[sq];
    if (piece !== null && Chess.colorOf(piece) === game.turn) {
      selected = sq;
      legalTargets = Chess.movesFrom(game, sq);
      refreshHighlights(game.board, Chess.statusOf(game).check ? game.turn : null);
      // Prépare un éventuel glisser-déposer
      const el = pieceEls.get(sq);
      if (el) {
        dragging = { el, from: sq, moved: false, startX: event.clientX, startY: event.clientY };
        boardEl.setPointerCapture(event.pointerId);
      }
    } else {
      selected = -1;
      legalTargets = [];
      refreshHighlights(game.board, Chess.statusOf(game).check ? game.turn : null);
    }
  });

  boardEl.addEventListener('pointermove', (event) => {
    if (drawStart !== null && event.pointerId === drawPointerId) {
      redrawAnnotations(squareFromEvent(event));
      return;
    }
    if (!dragging) return;
    const dx = event.clientX - dragging.startX;
    const dy = event.clientY - dragging.startY;
    if (!dragging.moved && Math.hypot(dx, dy) < 4) return;
    dragging.moved = true;
    dragging.el.classList.add('dragging');
    const rect = boardEl.getBoundingClientRect();
    const size = rect.width / 8;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    dragging.el.style.transform = 'translate(' + (x / size * 100) + '%, ' + (y / size * 100) + '%)';
    // Surbrillance de la case survolée
    for (const el of squares) el.classList.remove('drag-over');
    const over = squareFromEvent(event);
    if (over >= 0 && (legalTargets.some(m => m.to === over) || castleMoveViaRook(dragging.from, over))) {
      squares[over].classList.add('drag-over');
    }
  });

  boardEl.addEventListener('pointerup', (event) => {
    if (drawStart !== null && event.pointerId === drawPointerId) {
      const from = drawStart;
      const to = squareFromEvent(event);
      drawStart = null;
      drawPointerId = null;
      if (to >= 0) {
        // Redessiner une annotation identique la retire (toggle)
        const idx = drawings.findIndex(d => d.from === from && d.to === to);
        if (idx >= 0) drawings.splice(idx, 1);
        else drawings.push({ from, to });
      }
      redrawAnnotations();
      return;
    }
    if (!dragging) return;
    const drag = dragging;
    dragging = null;
    drag.el.classList.remove('dragging');
    for (const el of squares) el.classList.remove('drag-over');
    if (drag.moved) {
      const to = squareFromEvent(event);
      if (to < 0 || !tryMove(drag.from, to)) {
        // Dépôt invalide : la pièce revient à sa case
        positionPiece(drag.el, drag.from);
      }
    }
    // Sans déplacement : simple sélection au clic (déjà gérée au pointerdown)
  });

  // Drag interrompu par le navigateur (scroll système, appui long, appel…) :
  // sans remise à zéro, la pièce reste flottante et l'échiquier semble cassé.
  function cancelDrag() {
    if (drawStart !== null) {
      drawStart = null;
      drawPointerId = null;
      redrawAnnotations();
    }
    if (!dragging) return;
    const drag = dragging;
    dragging = null;
    drag.el.classList.remove('dragging');
    for (const el of squares) el.classList.remove('drag-over');
    positionPiece(drag.el, drag.from);
  }
  boardEl.addEventListener('pointercancel', cancelDrag);
  boardEl.addEventListener('lostpointercapture', () => { if (dragging && dragging.moved) cancelDrag(); });

  function squareFromEvent(event) {
    const rect = boardEl.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / (rect.width / 8));
    const row = Math.floor((event.clientY - rect.top) / (rect.height / 8));
    if (col < 0 || col > 7 || row < 0 || row > 7) return -1;
    return squareAtView(row, col);
  }

  // --------------------------------------------------------------- modales --

  function openModal(innerHtml) {
    closeModal();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal';
    backdrop.innerHTML = '<div class="modal">' + innerHtml + '</div>';
    backdrop.addEventListener('pointerdown', (e) => { if (e.target === backdrop) closeModal(); });
    document.body.appendChild(backdrop);
    return backdrop;
  }
  function closeModal() {
    const existing = document.getElementById('modal');
    if (existing) existing.remove();
  }

  function showGameOverModal(status) {
    const labels = { '1-0': '1 – 0', '0-1': '0 – 1', '1/2-1/2': '½ – ½' };
    const titles = {
      '1-0': 'Victoire des Blancs', '0-1': 'Victoire des Noirs', '1/2-1/2': 'Partie nulle'
    };
    const modal = openModal(
      '<h2 style="text-align:center">' + titles[status.result] + '</h2>'
      + '<p class="result-big">' + labels[status.result] + '</p>'
      + '<p class="reason">' + reasonLabel(status.reason) + '</p>'
      + '<div class="actions">'
      + '<button type="button" class="btn btn-primary" id="modal-new">Nouvelle partie</button>'
      + '<button type="button" class="btn btn-secondary" id="modal-close">Fermer</button>'
      + '</div>');
    modal.querySelector('#modal-new').addEventListener('click', () => { closeModal(); newGameFlow(); });
    modal.querySelector('#modal-close').addEventListener('click', closeModal);
  }

  // ----------------------------------------------------------- mode bot --

  const ELO_LABELS = [
    [400, 'Débutant'], [800, 'Occasionnel'], [1200, 'Club'], [1600, 'Compétiteur'], [2000, 'Expert']
  ];
  function eloLabel(elo) {
    let label = ELO_LABELS[0][1];
    for (const [threshold, name] of ELO_LABELS) if (elo >= threshold) label = name;
    return label;
  }

  function showBotConfigModal() {
    let chosenColor = 'w';
    const modal = openModal(
      '<h2>Jouer contre le bot</h2>'
      + '<p class="sub">Réglez la force du bot et choisissez votre couleur.</p>'
      + '<div class="field">'
      + '<label for="elo-slider">Niveau du bot</label>'
      + '<input type="range" id="elo-slider" min="400" max="2200" step="50" value="' + botElo + '">'
      + '<div class="elo-label"><span id="elo-name">' + eloLabel(botElo) + '</span><strong id="elo-value">' + botElo + ' Elo</strong></div>'
      + '</div>'
      + '<div class="field">'
      + '<label>Temps de réflexion maxi du bot</label>'
      + '<div class="time-choice">'
      + [[0, 'Instantané'], [1000, '1 s'], [3000, '3 s'], [10000, '10 s'], [60000, '1 min']].map(([ms, label]) =>
          '<button type="button" data-time="' + ms + '"'
          + ((settings.botTemps || 0) === ms ? ' class="selected"' : '') + '>' + label + '</button>').join('')
      + '</div></div>'
      + '<div class="field">'
      + '<label>Votre couleur</label>'
      + '<div class="color-choice">'
      + '<button type="button" data-color="w" class="selected">Blancs</button>'
      + '<button type="button" data-color="random">Aléatoire</button>'
      + '<button type="button" data-color="b">Noirs</button>'
      + '</div></div>'
      + '<div class="actions">'
      + '<button type="button" class="btn btn-primary" id="bot-start">Commencer</button>'
      + '</div>');
    let chosenTime = settings.botTemps || 0;
    for (const btn of modal.querySelectorAll('.time-choice button')) {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.time-choice button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        chosenTime = Number(btn.dataset.time);
      });
    }
    const slider = modal.querySelector('#elo-slider');
    slider.addEventListener('input', () => {
      modal.querySelector('#elo-value').textContent = slider.value + ' Elo';
      modal.querySelector('#elo-name').textContent = eloLabel(Number(slider.value));
    });
    for (const btn of modal.querySelectorAll('.color-choice button')) {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.color-choice button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        chosenColor = btn.dataset.color;
      });
    }
    modal.querySelector('#bot-start').addEventListener('click', () => {
      botElo = Number(slider.value);
      settings.botElo = botElo;
      settings.botTemps = chosenTime;
      saveSettings();
      const playerColor = chosenColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : chosenColor;
      botColor = playerColor === 'w' ? 'b' : 'w';
      closeModal();
      startGame(playerColor);
      if (game.turn === botColor) requestBotMove();
    });
  }

  function ensureWorker() {
    if (!worker) {
      worker = new Worker('/app/js/bot-worker.js');
      worker.onmessage = onWorkerMessage;
    }
    return worker;
  }

  function requestBotMove() {
    botThinking = true;
    thinkingEl.classList.add('on');
    btnUndo.disabled = true;
    const token = ++searchToken;
    const startedAt = Date.now();
    ensureWorker().postMessage({
      type: 'search',
      position: {
        board: game.board, turn: game.turn, castling: game.castling,
        ep: game.ep, halfmove: game.halfmove, fullmove: game.fullmove
      },
      elo: botElo,
      timeMs: mode === 'bot' ? (settings.botTemps || 0) : 0
    });
    worker._pending = { token, startedAt };
  }

  function onWorkerMessage(event) {
    const msg = event.data;
    if (msg.type === 'move') {
      const pending = worker._pending || { token: -1, startedAt: 0 };
      if (pending.token !== searchToken) return; // recherche annulée
      // Rythme naturel : réponse jamais avant 250 ms (le temps de « voir » le coup)
      const wait = Math.max(0, 250 - (Date.now() - pending.startedAt));
      setTimeout(() => {
        if (pending.token !== searchToken) return;
        botThinking = false;
        thinkingEl.classList.remove('on');
        const exerciseDefense = mode === 'exercises' && exCurrent
            && exCurrent.type === 'finale' && game.turn !== exPlayerColor;
        if (msg.move && !gameOver && ((mode === 'bot' && game.turn === botColor) || exerciseDefense)) {
          // Retrouve le coup équivalent dans la position courante
          const move = Chess.legalMoves(game).find(m =>
              m.from === msg.move.from && m.to === msg.move.to
              && (m.promo || null) === (msg.move.promo || null));
          if (move) playMove(move);
        }
        renderGame({});
      }, wait);
    } else if (msg.type === 'analysisProgress') {
      analysisProgress.textContent = 'Analyse en cours… ' + msg.percent + ' %';
    } else if (msg.type === 'analysis') {
      onAnalysisDone(msg.evals);
    }
    // (les scans de gaffes passent désormais par le pool de workers dédié,
    // avec leurs propres gestionnaires de messages — voir scanBlundersPool)
  }

  // -------------------------------------------------- démarrage de partie --

  function startGame(bottomColor) {
    game = Chess.newGame();
    sanHistory = [];
    lastMove = null;
    selected = -1;
    legalTargets = [];
    gameOver = false;
    clearAnnotations();
    musicStart(); // musique d'ambiance (si activée) dès le début de la partie
    botThinking = false;
    searchToken++;
    thinkingEl.classList.remove('on');
    orientation = bottomColor || 'w';
    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    renderGame({});
  }

  function newGameFlow() {
    if (mode === 'bot') showBotConfigModal();
    else if (mode === 'games') showImportModal();
    else startGame('w');
  }

  // ------------------------------------------------------------- mode games --

  function showImportModal() {
    const modal = openModal(
      '<h2>Mes parties chess.com</h2>'
      + '<p class="sub">Récupère vos 100 dernières parties via l\'API publique de chess.com.</p>'
      + '<div class="field">'
      + '<label for="chesscom-user">Pseudo chess.com</label>'
      + '<input type="text" id="chesscom-user" value="' + chesscomUsername.replace(/"/g, '&quot;') + '" placeholder="ex. hikaru" autocomplete="off">'
      + '</div>'
      + '<p class="error" id="import-error" style="display:none"></p>'
      + '<div class="actions">'
      + '<button type="button" class="btn btn-primary" id="import-start">Importer</button>'
      + '</div>');
    const input = modal.querySelector('#chesscom-user');
    input.focus();
    const start = () => importGames(input.value.trim(), modal);
    modal.querySelector('#import-start').addEventListener('click', start);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
  }

  async function importGames(username, modal) {
    const errorEl = modal.querySelector('#import-error');
    const btn = modal.querySelector('#import-start');
    if (!username) {
      errorEl.textContent = 'Saisissez votre pseudo chess.com.';
      errorEl.style.display = 'block';
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Import en cours…';
    errorEl.style.display = 'none';
    try {
      const games = await fetchChesscomGames(username);
      gamesList = games;
      chesscomUsername = username;
      saveChesscomUsername(username);
      closeModal();
      renderGamesList();
    } catch (err) {
      errorEl.textContent = err.message.startsWith('Pseudo') || err.message.startsWith('Aucune')
          ? err.message
          : 'Impossible de contacter chess.com. Vérifiez votre connexion et réessayez.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Importer';
    }
  }

  /** Récupère les ~100 dernières parties classiques via l'API publique chess.com. */
  async function fetchChesscomGames(username) {
    const archivesResp = await fetch('https://api.chess.com/pub/player/'
        + encodeURIComponent(username.toLowerCase()) + '/games/archives');
    if (archivesResp.status === 404) throw new Error('Pseudo chess.com introuvable.');
    if (!archivesResp.ok) throw new Error('Erreur réseau (' + archivesResp.status + ').');
    const archives = (await archivesResp.json()).archives || [];
    // Archives parcourues de la plus récente à la plus ancienne, en série
    const games = [];
    for (let i = archives.length - 1; i >= 0 && games.length < 100; i--) {
      const resp = await fetch(archives[i]);
      if (!resp.ok) continue;
      const month = (await resp.json()).games || [];
      // Dans une archive les parties sont chronologiques : on prend la fin d'abord
      for (let j = month.length - 1; j >= 0 && games.length < 100; j--) {
        if (month[j].rules === 'chess') games.push(month[j]);
      }
    }
    if (games.length === 0) throw new Error('Aucune partie d\'échecs classique trouvée pour ce compte.');
    return games;
  }

  function saveChesscomUsername(username) {
    fetch('/api/chesscom-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [CSRF_HEADER]: CSRF_TOKEN },
      body: JSON.stringify({ username })
    }).catch(() => { /* non bloquant */ });
  }

  const TIME_CLASSES = { bullet: 'Bullet', blitz: 'Blitz', rapid: 'Rapide', daily: 'Quotidien' };

  function renderGamesList() {
    gamesPanel.innerHTML = '';
    const me = chesscomUsername.toLowerCase();
    for (const g of gamesList) {
      const meIsWhite = (g.white.username || '').toLowerCase() === me;
      const my = meIsWhite ? g.white : g.black;
      const result = resultBadge(my.result);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'game-row';
      row.innerHTML =
        '<span class="result-badge ' + result.cls + '">' + result.label + '</span>'
        + '<span class="who">'
        + '<span class="players">' + escapeHtml(g.white.username) + ' (' + g.white.rating + ') – '
        + escapeHtml(g.black.username) + ' (' + g.black.rating + ')</span>'
        + '<span class="meta">' + (TIME_CLASSES[g.time_class] || g.time_class) + ' · '
        + new Date(g.end_time * 1000).toLocaleDateString('fr-FR') + '</span>'
        + '</span>';
      row.addEventListener('click', () => loadReplay(g, meIsWhite));
      gamesPanel.appendChild(row);
    }
  }

  /** Badge V/D/N du point de vue de l'utilisateur. */
  function resultBadge(myResult) {
    if (myResult === 'win') return { label: 'V', cls: 'win' };
    const draws = ['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'];
    if (draws.includes(myResult)) return { label: 'N', cls: 'draw' };
    return { label: 'D', cls: 'loss' };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // ------------------------------------------------------------- relecture --

  function loadReplay(chesscomGame, meIsWhite) {
    const parsed = Pgn.parsePgn(chesscomGame.pgn || '');
    // Positions pré-calculées pour une navigation instantanée
    const s = Chess.newGame();
    const snapshots = [{ board: s.board.slice(), move: null, checkColor: null }];
    const sans = [];
    for (const san of parsed.sans) {
      const move = Pgn.sanToMove(Chess, s, san);
      if (!move) break; // SAN inattendu : on garde le préfixe rejouable
      Chess.play(s, move);
      sans.push(san);
      snapshots.push({
        board: s.board.slice(),
        move: { from: move.from, to: move.to },
        checkColor: Chess.inCheck(s, s.turn) ? s.turn : null
      });
    }
    replay = {
      headers: parsed.headers, sans, snapshots,
      userColor: meIsWhite ? 'w' : 'b', evals: null, cls: null,
      mistakes: null, weak: null
    };
    replayPly = 0;
    lastAnnotatedPly = -1;
    clearAnnotations();
    orientation = replay.userColor; // échiquier orienté du côté de l'utilisateur
    placeSquares();
    gamesPanel.style.display = 'none';
    movesEl.style.display = '';
    replayNav.style.display = 'flex';
    btnAnalyze.style.display = '';
    btnAnalyze.textContent = 'Analyser la partie';
    analysisSummary.textContent = '';
    graphWrap.style.display = 'none';
    gotoPly(0);
  }

  function gotoPly(ply) {
    if (!replay) return;
    replayPly = Math.max(0, Math.min(ply, replay.sans.length));
    const snap = replay.snapshots[replayPly];
    lastMove = snap.move;
    selected = -1;
    legalTargets = [];
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    syncPieces(snap.board);
    refreshHighlights(snap.board, snap.checkColor);
    renderBars(snap.board, replayPly % 2 === 0 ? 'w' : 'b', playerNames());
    renderMoves(replay.sans, replayPly, replay.cls);
    renderStatus();
    drawEvalGraph();
    updateEvalBar();
    updateMoveExplain();
    hideSignalsPanel();
    updateSignalsButton();
    updateMoveAnnotations();
  }

  /** Badges + alertes « signal faible » sur l'échiquier pendant la relecture. */
  let lastAnnotatedPly = -1;
  function updateMoveAnnotations() {
    clearMoveBadge();
    clearWeakAlert();
    const advanced = replayPly === lastAnnotatedPly + 1;
    lastAnnotatedPly = replayPly;
    if (!replay || !settings.aides || replayPly === 0) return;
    const snapMove = replay.snapshots[replayPly] && replay.snapshots[replayPly].move;
    if (!snapMove) return;
    // Badge de classification sur la case d'arrivée du dernier coup
    if (replay.cls && replay.cls[replayPly - 1]) {
      showMoveBadge(snapMove.to, replay.cls[replayPly - 1]);
    }
    // Signal faible sur un coup adverse : halo + icône + son (en avançant)
    if (replay.weak && replay.weak[replayPly - 1]) {
      showWeakAlert(snapMove.to);
      if (advanced) soundWeird();
    }
  }

  document.getElementById('nav-first').addEventListener('click', () => gotoPly(0));
  document.getElementById('nav-prev').addEventListener('click', () => gotoPly(replayPly - 1));
  document.getElementById('nav-next').addEventListener('click', () => gotoPly(replayPly + 1));
  document.getElementById('nav-last').addEventListener('click', () => replay && gotoPly(replay.sans.length));

  document.addEventListener('keydown', (event) => {
    if (mode !== 'games' || !replay) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); gotoPly(replayPly - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); gotoPly(replayPly + 1); }
    else if (event.key === 'Home') { event.preventDefault(); gotoPly(0); }
    else if (event.key === 'End') { event.preventDefault(); gotoPly(replay.sans.length); }
  });

  // --------------------------------------------------------------- analyse --

  // ------------------------------------ annotation Stockfish (classification) --

  let analysisToken = 0;

  /** uci « e2e4 » → coup légal de la position, ou null. */
  function uciToMove(state, uci) {
    if (!uci) return null;
    const files = 'abcdefgh';
    const from = (8 - +uci[1]) * 8 + files.indexOf(uci[0]);
    const to = (8 - +uci[3]) * 8 + files.indexOf(uci[2]);
    const promo = uci[4] || null;
    return Chess.legalMoves(state).find(m =>
        m.from === from && m.to === to && (m.promo || null) === promo) || null;
  }

  /** Composant MoveBadge : pastille de classification sur la case d'arrivée. */
  function showMoveBadge(sq, cls) {
    clearMoveBadge();
    if (!settings.aides || !cls || sq === undefined || sq === null) return;
    const badge = document.createElement('div');
    badge.className = 'move-badge mb-' + (cls.css || cls.kind);
    badge.textContent = cls.symbol;
    squares[sq].appendChild(badge);
  }
  function clearMoveBadge() {
    document.querySelectorAll('.move-badge').forEach(n => n.remove());
  }

  /** Alerte visuelle « signal faible » : halo pulsé + icône ⚠️. */
  function showWeakAlert(sq) {
    if (!settings.aides) return;
    squares[sq].classList.remove('weak-halo');
    void squares[sq].offsetWidth; // relance l'animation
    squares[sq].classList.add('weak-halo');
    const icon = document.createElement('div');
    icon.className = 'weak-eye';
    icon.textContent = '⚠️';
    squares[sq].appendChild(icon);
  }
  function clearWeakAlert() {
    document.querySelectorAll('.weak-eye').forEach(n => n.remove());
    for (const el of squares) el.classList.remove('weak-halo');
  }

  function startAnalysis() {
    if (!replay) return;
    if (replay.evals) {
      // Partie déjà analysée : le bouton ré-ouvre le bilan
      showAnalysisSummary();
      return;
    }
    btnAnalyze.disabled = true;
    analysisProgress.style.display = 'block';
    const token = ++analysisToken;
    if (settings.moteur === 'maison') {
      analysisProgress.textContent = 'Analyse en cours… 0 %';
      ensureWorker().postMessage({ type: 'analyze', sans: replay.sans });
      return;
    }
    analysisProgress.textContent = 'Chargement de Stockfish…';
    SfEngine.ready().then(ok => {
      if (token !== analysisToken || !replay) return;
      if (!ok) {
        // Stockfish indisponible : on retombe sur le moteur maison
        analysisProgress.textContent = 'Analyse en cours… 0 %';
        ensureWorker().postMessage({ type: 'analyze', sans: replay.sans });
        return;
      }
      runSfAnalysis(token);
    });
  }

  async function runSfAnalysis(token) {
    // Rejoue la partie pour collecter FEN et coups joués
    const state = Chess.newGame();
    const fens = [Chess.toFen(state)];
    const played = [];
    for (const san of replay.sans) {
      const move = Pgn.sanToMove(Chess, state, san);
      if (!move) break;
      played.push({ from: move.from, to: move.to, promo: move.promo || null, san });
      Chess.play(state, move);
      fens.push(Chess.toFen(state));
    }

    // Pool de moteurs : les positions sont indépendantes, on en analyse
    // plusieurs en parallèle (un moteur mono-thread par cœur disponible,
    // borné pour laisser la machine respirer)
    const cores = navigator.hardwareConcurrency || 4;
    const poolSize = Math.max(1, Math.min(6, cores - 2, fens.length));
    const engines = (await Promise.all(Array.from({ length: poolSize }, () => {
      const engine = SfEngine.createEngine(16);
      return engine.ready().then(ok => ok ? engine : (engine.terminate(), null));
    }))).filter(Boolean);
    if (engines.length === 0) {
      // Stockfish indisponible : moteur maison
      analysisProgress.textContent = 'Analyse en cours… 0 %';
      ensureWorker().postMessage({ type: 'analyze', sans: replay.sans });
      return;
    }

    const infos = new Array(fens.length);
    let nextIndex = 0;
    let doneCount = 0;
    try {
      await Promise.all(engines.map(async (engine) => {
        for (;;) {
          const i = nextIndex++;
          if (i >= fens.length) return;
          if (token !== analysisToken || !replay) return;
          const pos = Chess.fromFen(fens[i]);
          const status = Chess.statusOf(pos);
          if (status.over) {
            infos[i] = { over: true, result: status.result, lines: [] };
          } else {
            const lines = await engine.analyze(fens[i], { multipv: 5, movetime: 450, depth: 18 });
            if (token !== analysisToken || !replay) return;
            infos[i] = { over: false, lines: lines || [] };
          }
          doneCount++;
          analysisProgress.textContent = 'Analyse Stockfish (' + engines.length + ' moteurs)… '
            + Math.round((doneCount / fens.length) * 100) + ' %';
        }
      }));
    } finally {
      for (const engine of engines) engine.terminate();
    }
    if (token !== analysisToken || !replay || doneCount < fens.length) return;
    onSfAnalysisDone(infos, played);
  }

  /** Éval « effective » d'une position analysée, perspective Blancs. */
  function infoEval(info) {
    if (info.over) return info.result === '1-0' ? 3000 : info.result === '0-1' ? -3000 : 0;
    const top = info.lines[0];
    if (!top) return 0;
    if (top.mate !== null && top.mate !== undefined) return top.mate > 0 ? 3000 : -3000;
    return top.cp || 0;
  }

  function onSfAnalysisDone(infos, played) {
    analysisProgress.style.display = 'none';
    btnAnalyze.disabled = false;
    if (!replay) return;

    // Évals pour le graphe et la barre (bornées comme avant)
    replay.evals = infos.map(info => Math.max(-1200, Math.min(1200, infoEval(info))));

    // Classification + explications + signaux faibles, coup par coup
    const cls = new Array(played.length).fill(null);
    const mistakes = new Array(played.length).fill(null);
    const weak = new Array(played.length).fill(null);
    const counts = { w: { blunder: 0, mistake: 0, inaccuracy: 0 }, b: { blunder: 0, mistake: 0, inaccuracy: 0 } };

    const state = Chess.newGame();
    for (let i = 0; i < played.length; i++) {
      const info = infos[i];
      const after = infos[i + 1];
      if (!info || !after) break;
      const mover = i % 2 === 0 ? 'w' : 'b';
      const top = info.lines[0];
      const playedUci = Chess.algebraic(played[i].from) + Chess.algebraic(played[i].to) + (played[i].promo || '');
      const entry = {
        cpBefore: top ? top.cp : null,
        mateBefore: top ? top.mate : null,
        cpAfter: after.over ? infoEval(after) : (after.lines[0] ? after.lines[0].cp : null),
        mateAfter: after.over ? null : (after.lines[0] ? after.lines[0].mate : null),
        mover,
        isBest: top ? top.uci === playedUci : false
      };
      if (info.over) { cls[i] = null; continue; }
      const c = MoveClassifier.classify(entry);
      cls[i] = c;
      if (counts[mover][c.kind] !== undefined) counts[mover][c.kind]++;

      const move = uciToMove(state, playedUci);

      // Signal faible : coups de l'ADVERSAIRE uniquement
      if (mover !== replay.userColor && move) {
        const alert = WeakSignalDetector.detect(Chess, Signals, {
          move,
          stateBefore: state,
          topUci: info.lines.map(l => l.uci),
          cpBefore: infoEval(info),
          cpAfter: infoEval(after),
          mover,
          player: replay.userColor
        });
        if (alert) weak[i] = alert;
      }

      // Explication des fautes : meilleur coup + conséquence (réfutation)
      if (c.kind === 'blunder' || c.kind === 'mistake' || c.kind === 'inaccuracy') {
        let sanBest = null;
        if (top) {
          const bestMove = uciToMove(state, top.uci);
          if (bestMove) sanBest = Chess.sanOf(state, bestMove);
        }
        if (move) Chess.play(state, move);
        let refutation = null;
        if (!after.over && after.lines[0]) {
          const refMove = uciToMove(state, after.lines[0].uci);
          if (refMove) refutation = Object.assign({}, refMove, { san: Chess.sanOf(state, refMove) });
        }
        mistakes[i] = MoveClassifier.explain(Chess, Signals, {
          cls: c,
          sanPlayed: played[i].san,
          sanBest,
          evalBestCp: top ? top.cp : null,
          mateBefore: top ? top.mate : null,
          mateAfter: after.over ? null : (after.lines[0] ? after.lines[0].mate : null),
          mover,
          stateAfter: state,
          refutation
        });
      } else if (move) {
        Chess.play(state, move);
      }
    }

    replay.cls = cls;
    replay.mistakes = mistakes;
    replay.weak = weak;
    replay.sfDone = true;
    graphWrap.style.display = 'block';
    renderMoves(replay.sans, replayPly, cls);
    drawEvalGraph();
    updateEvalBar();
    gotoPly(replayPly);
    btnAnalyze.textContent = 'Bilan de la partie';
    showAnalysisSummary();
  }

  function onAnalysisDone(evals) {
    analysisProgress.style.display = 'none';
    btnAnalyze.disabled = false;
    if (!replay) return;
    replay.evals = evals;
    // Classification : perte en centipions du point de vue du joueur au trait
    const cls = new Array(replay.sans.length).fill(null);
    const counts = { w: { blunder: 0, mistake: 0, inaccuracy: 0 }, b: { blunder: 0, mistake: 0, inaccuracy: 0 } };
    for (let i = 0; i < replay.sans.length && i + 1 < evals.length; i++) {
      const mover = i % 2 === 0 ? 'w' : 'b';
      const loss = mover === 'w' ? evals[i] - evals[i + 1] : evals[i + 1] - evals[i];
      if (loss >= 300) { cls[i] = { kind: 'blunder', symbol: '??' }; counts[mover].blunder++; }
      else if (loss >= 150) { cls[i] = { kind: 'mistake', symbol: '?' }; counts[mover].mistake++; }
      else if (loss >= 80) { cls[i] = { kind: 'inaccuracy', symbol: '?!' }; counts[mover].inaccuracy++; }
    }
    replay.cls = cls;
    graphWrap.style.display = 'block';
    renderMoves(replay.sans, replayPly, cls);
    drawEvalGraph();
    updateEvalBar();
    btnAnalyze.textContent = 'Bilan de la partie';
    showAnalysisSummary();
  }

  function plural(n) { return n > 1 ? 's' : ''; }

  // ------------------------------------------- bilan de la partie (résumé) --

  /** % de victoire estimé depuis l'éval (perspective Blancs), façon lichess. */
  function winPct(cp) {
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  }

  /** Précision d'un camp (0-100), algorithme lichess complet : précision de
      chaque coup depuis la perte de % de victoire, puis moyenne PONDÉRÉE par
      la volatilité de la position (un coup en position critique pèse plus
      lourd) combinée à la moyenne HARMONIQUE (une gaffe isolée ne se dilue
      pas). Nettement plus sévère qu'une moyenne simple. */
  function accuracyFor(color) {
    if (!replay || !replay.evals) return null;
    const evals = replay.evals;
    // % de victoire à chaque position, du point de vue du joueur
    const wps = evals.map(cp => color === 'w' ? winPct(cp) : 100 - winPct(cp));
    const accs = [];
    const weights = [];
    const windowSize = Math.max(2, Math.min(8, Math.floor(replay.sans.length / 10)));
    for (let i = 0; i + 1 < evals.length && i < replay.sans.length; i++) {
      if ((i % 2 === 0 ? 'w' : 'b') !== color) continue;
      const drop = Math.max(0, wps[i] - wps[i + 1]);
      accs.push(Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * drop) - 3.1669)));
      // Volatilité : écart-type des % de victoire autour du coup
      const slice = wps.slice(Math.max(0, i - windowSize + 1), i + 2);
      const mean = slice.reduce((s, w) => s + w, 0) / slice.length;
      const stdev = Math.sqrt(slice.reduce((s, w) => s + (w - mean) * (w - mean), 0) / slice.length);
      weights.push(Math.max(0.5, Math.min(12, stdev)));
    }
    if (accs.length === 0) return null;
    let weightedSum = 0;
    let weightTotal = 0;
    let harmonicDen = 0;
    for (let i = 0; i < accs.length; i++) {
      weightedSum += accs[i] * weights[i];
      weightTotal += weights[i];
      harmonicDen += 1 / Math.max(accs[i], 1);
    }
    const weighted = weightedSum / weightTotal;
    const harmonic = accs.length / harmonicDen;
    return (weighted + harmonic) / 2;
  }

  /** Bilan façon chess.com : précision des deux camps + décompte des coups
      par catégorie, présenté AVANT de naviguer dans l'analyse. */
  function showAnalysisSummary() {
    if (!replay || !replay.cls) return;
    const counts = {
      w: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 },
      b: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 }
    };
    for (let i = 0; i < replay.cls.length; i++) {
      const c = replay.cls[i];
      if (!c) continue;
      const mover = i % 2 === 0 ? 'w' : 'b';
      if (counts[mover][c.kind] !== undefined) counts[mover][c.kind]++;
    }
    const accW = accuracyFor('w');
    const accB = accuracyFor('b');
    const names = playerNames(); // { w, b }
    // Moteur maison : pas de catégories positives fiables (perte seule)
    const rows = replay.sfDone
      ? [['best', '★', 'Meilleurs'], ['excellent', '!!', 'Excellents'], ['good', '!', 'Bons coups'],
         ['inaccuracy', '?!', 'Imprécisions'], ['mistake', '?', 'Erreurs'], ['blunder', '??', 'Gaffes']]
      : [['inaccuracy', '?!', 'Imprécisions'], ['mistake', '?', 'Erreurs'], ['blunder', '??', 'Gaffes']];
    let html = '<h2>Bilan de la partie</h2>'
      + '<p class="sub">' + escapeHtml(names.w) + ' contre ' + escapeHtml(names.b) + '</p>'
      + '<div class="sum-acc">'
      + '<div class="sum-acc-side"><span class="sum-acc-label">Blancs</span>'
      + '<b>' + (accW === null ? '—' : accW.toFixed(1) + ' %') + '</b><small>précision</small></div>'
      + '<div class="sum-acc-side dark"><span class="sum-acc-label">Noirs</span>'
      + '<b>' + (accB === null ? '—' : accB.toFixed(1) + ' %') + '</b><small>précision</small></div>'
      + '</div>'
      + '<table class="sum-table"><thead><tr><th></th><th>Blancs</th><th>Noirs</th></tr></thead><tbody>';
    for (const [kind, symbol, label] of rows) {
      html += '<tr><td><span class="sum-sym sum-' + kind + '">' + symbol + '</span> ' + label + '</td>'
        + '<td>' + counts.w[kind] + '</td><td>' + counts.b[kind] + '</td></tr>';
    }
    html += '</tbody></table>'
      + '<p class="sum-engine">' + (replay.sfDone ? 'Analyse Stockfish 18 · MultiPV 5' : 'Analyse rapide (moteur maison)') + '</p>'
      + '<div class="actions"><button type="button" class="btn btn-primary" id="sum-go">Passer à l\'analyse</button></div>';
    const modal = openModal(html);
    modal.querySelector('#sum-go').addEventListener('click', closeModal);
  }

  /** Barre d'évaluation verticale : proportion blanche selon l'éval moteur
      (matériel + position), courbe douce façon lichess. */
  function updateEvalBar() {
    const wrap = document.getElementById('eval-wrap');
    const show = mode === 'games' && replay && replay.evals && replay.evals.length > 0;
    wrap.style.display = show ? 'block' : 'none';
    if (!show) return;
    const cp = replay.evals[Math.min(replayPly, replay.evals.length - 1)];
    // Sigmoïde : ±100 cp ≈ 60/40, ±400 cp ≈ 83/17, borné pour rester lisible
    const pct = 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
    document.getElementById('eval-fill').style.height = Math.max(3, Math.min(97, pct)) + '%';
    wrap.classList.toggle('flipped', orientation === 'b');
    const label = document.getElementById('eval-label');
    label.textContent = Math.abs(cp) >= 1200
      ? (cp > 0 ? '1-0' : cp < 0 ? '0-1' : '½-½')
      : (cp >= 0 ? '+' : '') + (cp / 100).toFixed(1);
  }

  /** Graphique d'évaluation : aire blanche = avantage Blancs, points rouges = gaffes. */
  function drawEvalGraph() {
    if (!replay || !replay.evals) return;
    const ctx = graphCanvas.getContext('2d');
    const W = graphCanvas.width;
    const H = graphCanvas.height;
    const evals = replay.evals;
    const BOUND = 1200;
    const x = (i) => evals.length > 1 ? (i / (evals.length - 1)) * W : 0;
    const y = (cp) => H / 2 - (Math.max(-BOUND, Math.min(BOUND, cp)) / BOUND) * (H / 2 - 4);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#22302a';
    ctx.fillRect(0, 0, W, H);
    // Aire claire (au-dessus de la courbe = avantage Blancs)
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i < evals.length; i++) ctx.lineTo(x(i), y(evals[i]));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = '#f0e9d8';
    ctx.fill();
    // Ligne médiane (égalité)
    ctx.strokeStyle = 'rgba(143,208,174,.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    // Points rouges sur les gaffes
    if (replay.cls) {
      ctx.fillStyle = '#fa412d';
      for (let i = 0; i < replay.cls.length; i++) {
        if (replay.cls[i] && replay.cls[i].kind === 'blunder') {
          ctx.beginPath();
          ctx.arc(x(i + 1), y(evals[i + 1]), 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Curseur du coup courant
    ctx.strokeStyle = '#8fd0ae';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x(replayPly), 0);
    ctx.lineTo(x(replayPly), H);
    ctx.stroke();
  }

  graphCanvas.addEventListener('click', (event) => {
    if (!replay || !replay.evals) return;
    const rect = graphCanvas.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    gotoPly(Math.round(ratio * (replay.evals.length - 1)));
  });

  // ------------------------------------------------------------ ouvertures --
  // Répertoire d'ouvertures Blancs / Noirs : chaque ligne se rejoue coup par
  // coup sur l'échiquier avec un commentaire pédagogique et la flèche du
  // prochain coup (données : openings-data.js).

  const openingsPanel = document.getElementById('openings-panel');
  let opState = { couleur: 'w', opening: null, ligne: null, ply: 0 };

  function renderOpeningsPanel() {
    if (opState.ligne) { renderOpeningViewer(); return; }
    let html = '<div class="op-tabs">'
      + '<button type="button" class="op-tab' + (opState.couleur === 'w' ? ' active' : '') + '" data-op-couleur="w">Blancs</button>'
      + '<button type="button" class="op-tab' + (opState.couleur === 'b' ? ' active' : '') + '" data-op-couleur="b">Noirs</button>'
      + '</div>';

    if (opState.opening) {
      const opening = opState.opening;
      html += '<button type="button" class="op-back" data-op-back="1">⬅ Toutes les ouvertures</button>'
        + '<div class="tr-card"><h3>' + escapeHtml(opening.nom) + '</h3>'
        + '<p>' + escapeHtml(opening.description) + '</p></div>';
      for (const ligne of opening.lignes) {
        html += '<button type="button" class="op-card" data-op-ligne="' + ligne.id + '">'
          + '<span class="op-titre"><span class="op-badge ' + ligne.type + '">'
          + (ligne.type === 'piege' ? 'Piège' : 'Ligne') + '</span>' + escapeHtml(ligne.titre) + '</span>'
          + '<span class="op-resume">' + escapeHtml(ligne.resume) + '</span>'
          + '</button>';
      }
    } else {
      const list = OPENINGS.filter(o => o.couleur === opState.couleur);
      if (list.length === 0) {
        html += '<div class="op-empty">Les ouvertures avec les '
          + (opState.couleur === 'w' ? 'Blancs' : 'Noirs')
          + ' arrivent bientôt : défense scandinave, Caro-Kann, défense française…</div>';
      }
      for (const opening of list) {
        html += '<button type="button" class="op-card" data-op-id="' + opening.id + '">'
          + '<span class="op-titre">' + escapeHtml(opening.nom) + '</span>'
          + '<span class="op-resume">' + escapeHtml(opening.apercu) + '</span>'
          + '</button>';
      }
    }
    openingsPanel.innerHTML = html;
  }

  function renderOpeningViewer() {
    const ligne = opState.ligne;
    const total = ligne.coups.length;
    const i = opState.ply;
    let caption;
    if (i === 0) {
      caption = escapeHtml(ligne.resume) + ' Avancez avec « Suivant » — la flèche montre chaque coup.';
    } else {
      const [san, commentaire] = ligne.coups[i - 1];
      const mover = (i - 1) % 2 === 0 ? 'Les Blancs jouent' : 'Les Noirs jouent';
      caption = '<b>' + escapeHtml(san) + '</b> — '
        + (commentaire ? escapeHtml(commentaire) : mover.replace(' jouent', '') + ' développent leur plan.');
    }
    openingsPanel.innerHTML =
      '<button type="button" class="op-back" data-op-quit="1">⬅ ' + escapeHtml(opState.opening.nom) + '</button>'
      + '<div class="op-viewer tr-card">'
      + '<span class="op-count"><span class="op-badge ' + ligne.type + '">'
      + (ligne.type === 'piege' ? 'Piège' : 'Ligne') + '</span> ' + escapeHtml(ligne.titre)
      + ' · coup ' + i + ' / ' + total + '</span>'
      + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:' + Math.round((i / total) * 100) + '%"></div></div>'
      + '<div class="op-caption">' + caption + '</div>'
      + '<div class="op-nav">'
      + '<button type="button" class="btn btn-secondary" data-op-prev="1"' + (i === 0 ? ' disabled' : '') + '>◀ Précédent</button>'
      + '<button type="button" class="btn btn-primary" data-op-next="1"' + (i === total ? ' disabled' : '') + '>Suivant ▶</button>'
      + '</div>'
      + '</div>';
  }

  function opGoto(ply) {
    const ligne = opState.ligne;
    opState.ply = Math.max(0, Math.min(ply, ligne.coups.length));
    game = Chess.newGame();
    sanHistory = [];
    lastMove = null;
    for (let i = 0; i < opState.ply; i++) {
      const move = Pgn.sanToMove(Chess, game, ligne.coups[i][0]);
      Chess.play(game, move);
      sanHistory.push(ligne.coups[i][0]);
      lastMove = { from: move.from, to: move.to };
    }
    selected = -1;
    legalTargets = [];
    renderGame({});
    // Flèche du prochain coup
    const arrow = document.getElementById('op-arrow');
    if (arrow) arrow.remove();
    if (opState.ply < ligne.coups.length) {
      const next = Pgn.sanToMove(Chess, game, ligne.coups[opState.ply][0]);
      if (next) drawArrow(next.from, next.to, 'rgba(240, 154, 32, .9)', 'op-arrow');
    }
    renderOpeningsPanel();
  }

  function opOpenLigne(ligne) {
    opState.ligne = ligne;
    orientation = opState.opening.couleur;
    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    opGoto(0);
    renderStatus();
  }

  function opQuitViewer() {
    opState.ligne = null;
    const arrow = document.getElementById('op-arrow');
    if (arrow) arrow.remove();
    startGame(opState.couleur);
    renderOpeningsPanel();
    renderStatus();
  }

  openingsPanel.addEventListener('click', (event) => {
    const target = event.target.closest('[data-op-couleur],[data-op-id],[data-op-ligne],[data-op-back],[data-op-quit],[data-op-prev],[data-op-next]');
    if (!target) return;
    if (target.dataset.opCouleur) {
      opState.couleur = target.dataset.opCouleur;
      opState.opening = null;
      renderOpeningsPanel();
    } else if (target.dataset.opId) {
      opState.opening = OPENINGS.find(o => o.id === target.dataset.opId);
      renderOpeningsPanel();
    } else if (target.dataset.opLigne) {
      opOpenLigne(opState.opening.lignes.find(l => l.id === target.dataset.opLigne));
    } else if (target.dataset.opBack) {
      opState.opening = null;
      renderOpeningsPanel();
    } else if (target.dataset.opQuit) {
      opQuitViewer();
    } else if (target.dataset.opPrev) {
      opGoto(opState.ply - 1);
    } else if (target.dataset.opNext) {
      opGoto(opState.ply + 1);
    }
  });

  // Navigation clavier dans la visionneuse d'ouvertures
  document.addEventListener('keydown', (event) => {
    if (mode !== 'openings' || !opState.ligne) return;
    if (event.key === 'ArrowRight') { opGoto(opState.ply + 1); event.preventDefault(); }
    else if (event.key === 'ArrowLeft') { opGoto(opState.ply - 1); event.preventDefault(); }
    else if (event.key === 'Escape') { opQuitViewer(); }
  });

  // --------------------------------------------------------- configuration --
  // Pseudo chess.com + chargement des parties une seule fois pour la session :
  // « Mes parties », l'analyse et le Blunder Trainer réutilisent gamesList.

  const configPanel = document.getElementById('config-panel');
  let configBusy = false;

  function renderConfigPanel(status, kind) {
    const loaded = gamesList.length > 0;
    configPanel.innerHTML =
      '<div class="tr-card"><h3>⚙️ Configuration</h3>'
      + '<p>Indiquez votre pseudo chess.com puis chargez vos 100 dernières parties. '
      + 'Elles restent en mémoire : « Mes parties » et le Blunder Trainer les réutilisent sans recharger.</p>'
      + '<label style="font-size:12px;font-weight:700">Pseudo chess.com</label>'
      + '<input type="text" id="cfg-user" value="' + escapeHtml(chesscomUsername) + '" placeholder="ex. hikaru" autocomplete="off">'
      + '<button type="button" class="btn btn-primary" id="cfg-load"' + (configBusy ? ' disabled' : '') + '>'
      + (configBusy ? 'Chargement en cours…' : (loaded ? 'Recharger les parties' : 'Charger mes parties')) + '</button>'
      + (status ? '<p class="cfg-status ' + kind + '">' + status + '</p>'
          : (loaded ? '<p class="cfg-status ok">✓ ' + gamesList.length + ' parties chargées pour « '
             + escapeHtml(chesscomUsername) + ' ».</p>'
             : '<p class="cfg-status busy">Aucune partie chargée pour l\'instant.</p>'))
      + '</div>'
      + '<div class="tr-card"><h3>Préférences</h3>'
      + '<label class="cfg-toggle"><input type="checkbox" id="cfg-sons"' + (settings.sons ? ' checked' : '') + '>'
      + '<span>Sons<small>Coups, captures et alerte « signal faible ».</small></span></label>'
      + '<label class="cfg-toggle"><input type="checkbox" id="cfg-aides"' + (settings.aides ? ' checked' : '') + '>'
      + '<span>Aides visuelles<small>Badges de coups (??, !, ★), alertes et explications. '
      + 'Décochez pour un mode « sans aide ».</small></span></label>'
      + '</div>'
      + '<div class="tr-card"><h3>Moteur d\'analyse</h3>'
      + '<label class="cfg-toggle"><input type="radio" name="cfg-moteur" value="stockfish"'
      + (settings.moteur !== 'maison' ? ' checked' : '') + '>'
      + '<span>Stockfish 18<small>Analyse précise (top 5 coups, profondeur 18). '
      + 'Télécharge ~7 Mo au premier lancement.</small></span></label>'
      + '<label class="cfg-toggle"><input type="radio" name="cfg-moteur" value="maison"'
      + (settings.moteur === 'maison' ? ' checked' : '') + '>'
      + '<span>Moteur maison<small>Analyse rapide et légère (profondeur 3), moins précise. '
      + 'Sans annotation détaillée des coups.</small></span></label>'
      + '</div>'
      + '<div class="tr-card"><h3>Apparence</h3>'
      + '<label class="cfg-sublabel">Échiquier</label>'
      + '<div class="swatches" data-setting="plateau">'
      + Object.entries(PLATEAUX).map(([key, p]) =>
          '<button type="button" class="swatch' + (settings.plateau === key ? ' selected' : '')
          + '" data-value="' + key + '" title="' + key + '">'
          + '<span style="background:' + p.light + '"></span><span style="background:' + p.dark + '"></span>'
          + '</button>').join('')
      + '</div>'
      + '<label class="cfg-sublabel">Fond de l\'application</label>'
      + '<div class="swatches" data-setting="fond">'
      + Object.entries(FONDS).map(([key, f]) =>
          '<button type="button" class="swatch' + (settings.fond === key ? ' selected' : '')
          + '" data-value="' + key + '" title="' + key + '">'
          + '<span style="background:' + f.bg + '"></span>'
          + '</button>').join('')
      + '</div>'
      + '<label class="cfg-sublabel">Couleur des flèches <small>(clic droit sur l\'échiquier : '
      + 'glisser = flèche, clic = cercle)</small></label>'
      + '<div class="swatches" data-setting="fleche">'
      + Object.entries(FLECHES).map(([key, color]) =>
          '<button type="button" class="swatch' + (settings.fleche === key ? ' selected' : '')
          + '" data-value="' + key + '" title="' + key + '">'
          + '<span style="background:' + color + '"></span>'
          + '</button>').join('')
      + '</div>'
      + '</div>'
      + '<div class="tr-card"><h3>🎵 Musique</h3>'
      + '<label class="cfg-toggle"><input type="checkbox" id="cfg-musique"' + (settings.musique ? ' checked' : '') + '>'
      + '<span>Musique d\'ambiance<small>Jouée dans toute l\'application, lancée au début '
      + 'de la partie. Sans playlist : « Fjord Moonlight » (Draugr Beatz).</small></span></label>'
      + '<label class="cfg-sublabel">Volume</label>'
      + '<input type="range" id="cfg-mus-vol" min="0" max="100" value="'
      + Math.round((settings.musiqueVolume || 0.4) * 100) + '">'
      + '<label class="cfg-sublabel">Playlist</label>'
      + '<div id="cfg-mus-list" class="mus-list"></div>'
      + '<input type="file" id="cfg-mus-files" accept="audio/*" multiple style="display:none">'
      + '<button type="button" class="btn btn-secondary" id="cfg-mus-import">Importer des musiques…</button>'
      + '</div>';
    const input = configPanel.querySelector('#cfg-user');
    configPanel.querySelector('#cfg-load').addEventListener('click', () => loadGamesFromConfig(input.value.trim()));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadGamesFromConfig(input.value.trim()); });
    configPanel.querySelector('#cfg-sons').addEventListener('change', (e) => {
      settings.sons = e.target.checked;
      saveSettings();
    });
    configPanel.querySelector('#cfg-aides').addEventListener('change', (e) => {
      settings.aides = e.target.checked;
      saveSettings();
      clearMoveBadge();
      clearWeakAlert();
    });
    configPanel.querySelectorAll('input[name="cfg-moteur"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (!e.target.checked) return;
        settings.moteur = e.target.value;
        saveSettings();
      });
    });
    configPanel.querySelectorAll('.swatches').forEach((group) => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.swatch');
        if (!btn) return;
        settings[group.dataset.setting] = btn.dataset.value;
        saveSettings();
        applyAppearance();
        redrawAnnotations();
        group.querySelectorAll('.swatch').forEach(s => s.classList.toggle('selected', s === btn));
      });
    });
    configPanel.querySelector('#cfg-musique').addEventListener('change', (e) => {
      settings.musique = e.target.checked;
      saveSettings();
      if (settings.musique) musicStart(); else musicStop();
    });
    configPanel.querySelector('#cfg-mus-vol').addEventListener('input', (e) => {
      settings.musiqueVolume = +e.target.value / 100;
      saveSettings();
      musicApplyVolume();
    });
    const musFiles = configPanel.querySelector('#cfg-mus-files');
    configPanel.querySelector('#cfg-mus-import').addEventListener('click', () => musFiles.click());
    musFiles.addEventListener('change', async () => {
      for (const file of musFiles.files) {
        await musicAdd(file).catch(() => {});
      }
      musFiles.value = '';
      // La playlist a changé : bascule dessus si la musique joue déjà
      if (musicPlaying) {
        musicStop();
        if (settings.musique) musicStart();
      }
      renderMusicList();
    });
    renderMusicList();
  }

  /** Liste des pistes de la playlist dans la configuration. */
  async function renderMusicList() {
    const list = configPanel.querySelector('#cfg-mus-list');
    if (!list) return;
    let tracks = [];
    try { tracks = await musicLoadAll(); } catch (e) { tracks = []; }
    let html = '<div class="mus-item builtin"><span>🌙 Fjord Moonlight — Draugr Beatz</span>'
      + '<small>' + (tracks.length === 0 ? 'par défaut' : 'jouée si la playlist est vide') + '</small></div>';
    for (const t of tracks) {
      html += '<div class="mus-item"><span>' + escapeHtml(t.name) + '</span>'
        + '<button type="button" class="mus-del" data-id="' + t.id + '" title="Retirer">✕</button></div>';
    }
    list.innerHTML = html;
    for (const btn of list.querySelectorAll('.mus-del')) {
      btn.addEventListener('click', async () => {
        await musicDelete(+btn.dataset.id).catch(() => {});
        if (musicPlaying) {
          musicStop();
          if (settings.musique) musicStart();
        }
        renderMusicList();
      });
    }
  }

  async function loadGamesFromConfig(username) {
    if (configBusy) return;
    if (!username) {
      renderConfigPanel('Saisissez votre pseudo chess.com.', 'err');
      return;
    }
    configBusy = true;
    renderConfigPanel('Récupération des parties de « ' + escapeHtml(username) + ' »…', 'busy');
    try {
      const games = await fetchChesscomGames(username);
      gamesList = games;
      chesscomUsername = username;
      saveChesscomUsername(username);
      replay = null; // les parties affichées ne correspondent plus à l'ancien pseudo
      configBusy = false;
      renderConfigPanel(null, null);
    } catch (err) {
      configBusy = false;
      renderConfigPanel(escapeHtml(err.message), 'err');
    }
  }

  // ------------------------------------- explications et signaux faibles --

  const moveExplainEl = document.getElementById('move-explain');
  const btnSignals = document.getElementById('btn-signals');
  const signalsPanel = document.getElementById('signals-panel');
  let signalsActive = null; // index du signal surligné

  /** État moteur complet de la position affichée (relecture ou trainer). */
  function currentDisplayedState() {
    if (mode === 'games' && replay) {
      const s = Chess.newGame();
      for (let i = 0; i < replayPly; i++) {
        const move = Pgn.sanToMove(Chess, s, replay.sans[i]);
        if (!move) break;
        Chess.play(s, move);
      }
      return s;
    }
    if (mode === 'trainer' && trainer && (trainer.state === 'guess' || trainer.state === 'feedback')) {
      return game;
    }
    if (mode === 'misspuzzles' && missP && (missP.state === 'guess' || missP.state === 'feedback')) {
      return game;
    }
    return null;
  }

  /** Panneau d'explication du coup courant : classification Stockfish
      (gaffe/erreur + meilleur coup + conséquence), signal faible éventuel,
      et lecture « humaine » du coup. */
  function updateMoveExplain() {
    if (mode !== 'games' || !replay || replayPly === 0 || !settings.aides) {
      moveExplainEl.style.display = 'none';
      return;
    }
    const parts = [];
    const index = replayPly - 1;
    if (replay.mistakes && replay.mistakes[index]) {
      parts.push('<b>' + escapeHtml(replay.mistakes[index]) + '</b>');
    }
    if (replay.weak && replay.weak[index]) {
      parts.push('<span style="color:#8e44ad;font-weight:600">' + escapeHtml(replay.weak[index].message) + '</span>');
    }
    // Lecture « humaine » du coup (développement, roque, colonne ouverte...)
    const s = Chess.newGame();
    let valid = true;
    for (let i = 0; i < index; i++) {
      const move = Pgn.sanToMove(Chess, s, replay.sans[i]);
      if (!move) { valid = false; break; }
      Chess.play(s, move);
    }
    if (valid) {
      const san = replay.sans[index];
      const move = Pgn.sanToMove(Chess, s, san);
      if (move && parts.length === 0) {
        const reasons = Signals.explainMove(Chess, s, move);
        if (reasons.length > 0) parts.push('<b>' + escapeHtml(san) + '</b> — ' + reasons.join(' · ') + '.');
      }
    }
    if (parts.length === 0) {
      moveExplainEl.style.display = 'none';
      return;
    }
    moveExplainEl.innerHTML = parts.join('<br>');
    moveExplainEl.style.display = 'block';
  }

  function clearSignalOverlays() {
    for (const el of squares) el.querySelectorAll('.ov-signal').forEach(n => n.remove());
    signalsActive = null;
  }

  function hideSignalsPanel() {
    signalsPanel.style.display = 'none';
    clearSignalOverlays();
    if (typeof sigTourClose === 'function') sigTourClose();
  }

  function updateSignalsButton() {
    const available = (mode === 'games' && replay)
        || (mode === 'trainer' && trainer && (trainer.state === 'guess' || trainer.state === 'feedback'))
        || (mode === 'misspuzzles' && missP && (missP.state === 'guess' || missP.state === 'feedback'));
    btnSignals.style.display = available ? '' : 'none';
    document.getElementById('btn-signals-visual').style.display = available ? '' : 'none';
    if (!available) hideSignalsPanel();
  }

  function showSignalsPanel() {
    const state = currentDisplayedState();
    if (!state) return;
    const result = Signals.detectSignals(Chess, state);
    let html = '<div class="sig-head"><span>🔍 Signaux de la position</span>'
      + '<button type="button" class="sig-close" id="sig-close">✕ fermer</button></div>';
    const section = (titre, items) => {
      let out = '<h4>' + titre + '</h4>';
      if (items.length === 0) return out + '<p class="sig-empty">Rien de notable.</p>';
      items.forEach((item) => {
        const campLabel = item.camp ? '<span class="sig-camp ' + item.camp + '">'
          + (item.camp === 'w' ? 'Blancs' : 'Noirs') + '</span> · ' : '';
        out += '<button type="button" class="sig-item" data-sig="' + signalsFlat.length + '">'
          + campLabel + escapeHtml(item.titre)
          + '<span class="sig-detail">' + escapeHtml(item.detail) + '</span></button>';
        signalsFlat.push(item);
      });
      return out;
    };
    const signalsFlat = [];
    html += section('Signaux tactiques', result.tactiques);
    html += section('Signaux positionnels', result.positionnels);
    signalsPanel.innerHTML = html;
    signalsPanel.style.display = 'flex';
    clearSignalOverlays();
    signalsPanel.querySelector('#sig-close').addEventListener('click', hideSignalsPanel);
    for (const btn of signalsPanel.querySelectorAll('.sig-item')) {
      btn.addEventListener('click', () => {
        const index = +btn.dataset.sig;
        const wasActive = signalsActive === index;
        clearSignalOverlays();
        for (const el of signalsPanel.querySelectorAll('.sig-item')) el.classList.remove('active');
        if (wasActive) return;
        signalsActive = index;
        btn.classList.add('active');
        for (const sq of signalsFlat[index].cases) {
          const ov = document.createElement('div');
          ov.className = 'ov ov-signal';
          squares[sq].appendChild(ov);
        }
      });
    }
  }

  btnSignals.addEventListener('click', () => {
    if (signalsPanel.style.display === 'flex') hideSignalsPanel();
    else showSignalsPanel();
  });

  // ---------------------------- visite guidée des signaux (bulle visuelle) --

  const btnSignalsVisual = document.getElementById('btn-signals-visual');
  let sigTour = null; // { items, index }

  function sigTourClose() {
    if (!sigTour) return;
    sigTour = null;
    clearSignalOverlays();
    const bubble = document.getElementById('signal-bubble');
    if (bubble) bubble.remove();
  }

  /** Parcourt les signaux un à un : cases surlignées + bulle explicative sur
      l'échiquier (façon analyse chess.com), navigation ‹ › dans la bulle. */
  function sigTourStart() {
    sigTourClose();
    hideSignalsPanel();
    const state = currentDisplayedState();
    if (!state) return;
    const result = Signals.detectSignals(Chess, state);
    const items = result.tactiques.concat(result.positionnels);
    if (items.length === 0) {
      sigTour = { items: [{ titre: 'Rien de notable', detail: 'Aucun signal tactique ou positionnel dans cette position.', cases: [] }], index: 0 };
    } else {
      sigTour = { items, index: 0 };
    }
    sigTourShow();
  }

  function sigTourShow() {
    if (!sigTour) return;
    const item = sigTour.items[sigTour.index];
    clearSignalOverlays();
    for (const sq of item.cases || []) {
      const ov = document.createElement('div');
      ov.className = 'ov ov-signal';
      squares[sq].appendChild(ov);
    }
    let bubble = document.getElementById('signal-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'signal-bubble';
      bubble.className = 'signal-bubble';
      boardEl.appendChild(bubble);
    }
    const campLabel = item.camp
      ? '<span class="sb-camp ' + item.camp + '">' + (item.camp === 'w' ? 'Blancs' : 'Noirs') + '</span> '
      : '';
    bubble.innerHTML =
      '<div class="sb-title">' + campLabel + escapeHtml(item.titre) + '</div>'
      + '<div class="sb-detail">' + escapeHtml(item.detail) + '</div>'
      + '<div class="sb-nav">'
      + '<button type="button" id="sb-prev"' + (sigTour.index === 0 ? ' disabled' : '') + '>‹</button>'
      + '<span>' + (sigTour.index + 1) + ' / ' + sigTour.items.length + '</span>'
      + '<button type="button" id="sb-next"' + (sigTour.index >= sigTour.items.length - 1 ? ' disabled' : '') + '>›</button>'
      + '<button type="button" id="sb-close">✕</button>'
      + '</div>';
    // Position : près de la première case concernée, côté libre de l'échiquier
    const anchor = (item.cases && item.cases.length > 0) ? item.cases[0] : 27;
    const col = viewCol(anchor);
    const row = viewRow(anchor);
    bubble.style.left = Math.max(2, Math.min(58, col * 12.5 - 15)) + '%';
    if (row <= 3) {
      bubble.style.top = ((row + 1) * 12.5 + 1) + '%';
      bubble.style.bottom = 'auto';
    } else {
      bubble.style.bottom = ((8 - row) * 12.5 + 1) + '%';
      bubble.style.top = 'auto';
    }
    bubble.querySelector('#sb-prev').addEventListener('click', () => {
      if (sigTour && sigTour.index > 0) { sigTour.index--; sigTourShow(); }
    });
    bubble.querySelector('#sb-next').addEventListener('click', () => {
      if (sigTour && sigTour.index < sigTour.items.length - 1) { sigTour.index++; sigTourShow(); }
    });
    bubble.querySelector('#sb-close').addEventListener('click', sigTourClose);
  }

  btnSignalsVisual.addEventListener('click', () => {
    if (sigTour) sigTourClose();
    else sigTourStart();
  });

  // ------------------------------------------------------- blunder trainer --
  // Quiz : 10 positions tirées au hasard des 100 dernières parties chess.com,
  // là où le joueur a gaffé (perte >= 150 cp). Retrouver le meilleur coup
  // rapporte un point ; le taux de réussite est affiché et persisté.

  const TRAINER_SIZE = 10;
  const TRAINER_STATS_KEY = 'echecs360-trainer-stats';
  const trainerPanel = document.getElementById('trainer-panel');
  let trainerRequestId = 0;

  function trainerStats() {
    try {
      return JSON.parse(localStorage.getItem(TRAINER_STATS_KEY)) || { attempts: 0, correct: 0 };
    } catch (e) { return { attempts: 0, correct: 0 }; }
  }

  function trainerSaveAttempt(correct) {
    const stats = trainerStats();
    stats.attempts++;
    if (correct) stats.correct++;
    localStorage.setItem(TRAINER_STATS_KEY, JSON.stringify(stats));
  }

  function trainerRate(correct, attempts) {
    return attempts === 0 ? '—' : Math.round((correct / attempts) * 100) + ' %';
  }

  async function trainerStart() {
    trainer = { state: 'prep', puzzles: [], index: 0, score: 0, order: [], oi: 0, gamesScanned: 0 };
    renderTrainerPanel();
    renderStatus();
    if (gamesList.length === 0) {
      if (!chesscomUsername) {
        trainer.state = 'needuser';
        renderTrainerPanel();
        return;
      }
      try {
        gamesList = await fetchChesscomGames(chesscomUsername);
      } catch (err) {
        if (!trainer || trainer.state !== 'prep') return;
        trainer.state = 'error';
        trainer.error = err.message;
        renderTrainerPanel();
        return;
      }
      if (!trainer || trainer.state !== 'prep') return;
    }
    // Parties en cache d'abord (préparation quasi instantanée), mélangées
    // pour que les positions varient à chaque session
    trainer.order = scanAwareOrder(BLUNDERS_KIND);
    trainerRunScan();
  }

  // Clé de cache des scans de gaffes. Le suffixe -sf invalide les anciennes
  // analyses du moteur maison : elles seront refaites en qualité Stockfish.
  const BLUNDERS_KIND = 'blunders-sf';

  /** Scanne UNE partie avec Stockfish : éval de chaque position (rapide),
      puis, sur les coups fautifs du joueur (perte >= 150 cp hors positions
      déjà pliées), calcul des coups acceptés en MultiPV. Mêmes seuils que
      l'ancien scan maison, mais avec des évals fiables — et le meilleur coup
      est juste dès le scan (plus besoin de re-vérification à l'affichage).
      Renvoie null si interrompu (résultat partiel : pas de cache). */
  async function scanGameBlundersSf(engine, meta, alive) {
    const s = Chess.newGame();
    const fens = [Chess.toFen(s)];
    const played = [];
    for (const san of meta.sans) {
      const move = Pgn.sanToMove(Chess, s, san);
      if (!move) break;
      played.push(san);
      Chess.play(s, move);
      fens.push(Chess.toFen(s));
    }
    // Passe 1 : éval de chaque position (perspective Blancs, bornée ±1200)
    const evals = [];
    for (let i = 0; i < fens.length; i++) {
      if (!alive()) return null;
      const pos = Chess.fromFen(fens[i]);
      const status = Chess.statusOf(pos);
      if (status.over) {
        evals.push(status.result === '1-0' ? 1200 : status.result === '0-1' ? -1200 : 0);
        continue;
      }
      const lines = await engine.analyze(fens[i], { multipv: 1, movetime: 90, depth: 12 });
      if (!alive()) return null;
      const top = lines && lines[0];
      const eff = !top ? 0
        : (top.mate !== null && top.mate !== undefined ? (top.mate > 0 ? 1200 : -1200)
           : Math.max(-1200, Math.min(1200, top.cp || 0)));
      evals.push(eff);
    }
    // Passe 2 : détection + meilleurs coups sur les positions fautives
    const items = [];
    for (let i = 0; i < played.length && i + 1 < evals.length; i++) {
      const mover = i % 2 === 0 ? 'w' : 'b';
      if (mover !== meta.userColor) continue;
      if (i < 4) continue;                                  // bruit d'ouverture
      const before = mover === 'w' ? evals[i] : -evals[i];  // perspective joueur
      if (before <= -1100 || before >= 1100) continue;      // partie déjà pliée
      const loss = mover === 'w' ? evals[i] - evals[i + 1] : evals[i + 1] - evals[i];
      if (loss < 150) continue;
      if (!alive()) return null;
      const lines = await engine.analyze(fens[i], { multipv: 4, movetime: 600, depth: 18 });
      if (!alive()) return null;
      if (!lines || lines.length === 0) continue;
      const state = Chess.fromFen(fens[i]);
      const sign = state.turn === 'w' ? 1 : -1;
      const eff = l => sign * (l.mate !== null && l.mate !== undefined ? (l.mate > 0 ? 3000 : -3000) : (l.cp || 0));
      const best = eff(lines[0]);
      const acceptable = [];
      for (const line of lines) {
        if (best - eff(line) > 30) continue;
        const move = uciToMove(state, line.uci);
        if (move) {
          acceptable.push({ from: move.from, to: move.to, promo: move.promo || null, san: Chess.sanOf(state, move) });
        }
      }
      // Tous les choix se valent : position molle, mauvais quiz
      if (acceptable.length === 0 || acceptable.length >= 4) continue;
      items.push({
        ply: i,
        played: played[i],
        loss,
        before,
        after: mover === 'w' ? evals[i + 1] : -evals[i + 1],
        bestSan: acceptable[0].san,
        evalBest: Math.round(best),
        acceptable,
        sfDone: true, sfVerified: true // déjà en qualité Stockfish
      });
    }
    return items;
  }

  /** Scanne les parties à la recherche de gaffes, en PARALLÈLE : un pool
      d'instances Stockfish (une par cœur, borné à 4) se répartit les
      parties ; repli automatique sur le moteur maison si le wasm est
      indisponible. Les parties en cache sont consommées sans moteur : une
      session entièrement cachée ne lance rien. */
  async function scanBlundersPool(cfg) {
    // cfg : { order, alive(), done(), accept(meta, items), progress(), finish() }
    const poolSize = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 2));
    let cursor = 0;
    const takeJob = () => {
      while (cursor < cfg.order.length) {
        const g = gamesList[cfg.order[cursor++]];
        const meIsWhite = (g.white.username || '').toLowerCase() === chesscomUsername.toLowerCase();
        const parsed = Pgn.parsePgn(g.pgn || '');
        if (parsed.sans.length < 10) continue;
        return {
          g,
          meta: {
            sans: parsed.sans,
            userColor: meIsWhite ? 'w' : 'b',
            opponent: (meIsWhite ? g.black.username : g.white.username) || 'Adversaire'
          }
        };
      }
      return null;
    };
    const sfOk = await SfEngine.ready();
    if (!cfg.alive()) return;
    const engines = [];
    const workers = [];
    await Promise.all(Array.from({ length: poolSize }, async () => {
      let engine = null;
      let w = null; // worker moteur maison (repli)
      while (cfg.alive() && !cfg.done()) {
        const job = takeJob();
        if (!job) break;
        let items = scanCacheGet(BLUNDERS_KIND, job.g, job.meta.userColor);
        if (!items) {
          if (sfOk && !engine && !w) {
            engine = SfEngine.createEngine(16);
            const ok = await engine.ready();
            if (!ok) { engine.terminate(); engine = null; }
            else engines.push(engine);
          }
          if (engine) {
            items = await scanGameBlundersSf(engine, job.meta, cfg.alive);
            if (items === null) break; // scan interrompu
          } else {
            if (!w) { w = new Worker('/app/js/bot-worker.js'); workers.push(w); }
            items = await new Promise((resolve) => {
              const requestId = ++trainerRequestId;
              w.onmessage = (e) => {
                if (e.data && e.data.type === 'blunders' && e.data.requestId === requestId) resolve(e.data.items);
              };
              w.postMessage({ type: 'blunders', sans: job.meta.sans, userColor: job.meta.userColor, requestId });
            });
            if (!cfg.alive()) break;
          }
          scanCachePut(scanCacheKey(BLUNDERS_KIND, job.g, job.meta.userColor), items);
        }
        if (!cfg.alive() || cfg.done()) break;
        cfg.accept(job.meta, items);
        cfg.progress();
      }
    }));
    for (const engine of engines) engine.terminate();
    for (const w of workers) w.terminate();
    if (cfg.alive()) cfg.finish();
  }

  function trainerRunScan() {
    const session = trainer;
    scanBlundersPool({
      order: session.order,
      alive: () => trainer === session && session.state === 'prep',
      // Au plus 40 parties analysées par session : la préparation reste courte
      done: () => session.puzzles.length >= TRAINER_SIZE || session.gamesScanned >= 40,
      accept: (meta, items) => {
        const found = items.slice();
        // Au plus 2 positions par partie, pour varier les contextes
        while (found.length > 2) found.splice(Math.floor(Math.random() * found.length), 1);
        for (const item of found) {
          if (session.puzzles.length >= TRAINER_SIZE) break;
          session.puzzles.push({
            ...item, sans: meta.sans, userColor: meta.userColor, opponent: meta.opponent
          });
        }
        session.gamesScanned++;
      },
      progress: () => renderTrainerPanel(),
      finish: () => trainerBegin()
    });
  }

  function trainerBegin() {
    if (!trainer) return;
    if (trainer.puzzles.length === 0) {
      trainer.state = 'empty';
      renderTrainerPanel();
      return;
    }
    for (let i = trainer.puzzles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trainer.puzzles[i], trainer.puzzles[j]] = [trainer.puzzles[j], trainer.puzzles[i]];
    }
    trainer.index = 0;
    trainer.score = 0;
    trainerShowPuzzle();
  }

  /** Affiche la position du puzzle courant (juste avant la gaffe). */
  function trainerShowPuzzle() {
    const p = trainer.puzzles[trainer.index];
    clearAnnotations();
    replayPuzzlePrefix(p);
    selected = -1;
    legalTargets = [];
    gameOver = false;
    orientation = p.userColor;
    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    for (const el of squares) el.classList.remove('hint-move');
    const arrow = document.getElementById('trainer-arrow');
    if (arrow) arrow.remove();
    trainer.state = 'guess';
    trainer.lastResult = null;
    renderGame({});
    renderTrainerPanel();
    updateSignalsButton();
    sfVerifyPuzzle(p);
  }

  /** Vérifie le meilleur coup du puzzle avec Stockfish (profondeur 18) :
      remplace la réponse du moteur maison dès que disponible. */
  async function sfVerifyPuzzle(p) {
    if (p.sfDone) return;
    p.sfDone = true; // une seule tentative
    if (settings.moteur === 'maison') return; // on garde l'éval du moteur maison
    const fen = Chess.toFen(game);
    const ok = await SfEngine.ready();
    if (!ok) return;
    const lines = await SfEngine.analyze(fen, { multipv: 4, movetime: 1500, depth: 18 });
    if (!lines || lines.length === 0) return;
    const state = Chess.fromFen(fen);
    const sign = state.turn === 'w' ? 1 : -1;
    const eff = l => sign * (l.mate !== null && l.mate !== undefined ? (l.mate > 0 ? 3000 : -3000) : (l.cp || 0));
    const best = eff(lines[0]);
    const acceptable = [];
    for (const line of lines) {
      if (best - eff(line) > 30) continue;
      const move = uciToMove(state, line.uci);
      if (move) {
        acceptable.push({ from: move.from, to: move.to, promo: move.promo || null, san: Chess.sanOf(state, move) });
      }
    }
    if (acceptable.length > 0) {
      p.acceptable = acceptable;
      p.bestSan = acceptable[0].san;
      p.evalBest = Math.round(sign * (lines[0].cp !== null && lines[0].cp !== undefined ? lines[0].cp : 0));
      p.sfVerified = true;
    }
  }

  /** Après une bonne réponse : rejoue visuellement le coup réellement joué
      dans la partie (la gaffe) — flèche rouge et badge sur l'échiquier, pas
      seulement du texte — avant de passer à la position suivante. */
  function showActualPlayedMove(p, arrowId, stillActive) {
    setTimeout(() => {
      if (!stillActive()) return;
      clearMoveBadge();
      replayPuzzlePrefix(p);
      for (const el of pieceEls.values()) el.remove();
      pieceEls.clear();
      syncPieces(game.board);
      const played = Pgn.sanToMove(Chess, game, p.played);
      if (!played) return;
      Chess.play(game, played);
      sanHistory.push(p.played);
      lastMove = { from: played.from, to: played.to };
      soundMove();
      renderGame({ animate: true });
      showMoveBadge(played.to, MoveClassifier.KINDS.blunder);
      drawArrow(played.from, played.to, 'rgba(196, 64, 48, .85)', arrowId);
    }, 1200);
  }

  /** Position d'un puzzle (trainer, Miss Puzzles, Miss Mates) rejouée dans
      `game` : préfixe de la partie jusqu'au coup fautif. */
  function replayPuzzlePrefix(p) {
    game = Chess.newGame();
    sanHistory = [];
    lastMove = null;
    for (let i = 0; i < p.ply; i++) {
      const move = Pgn.sanToMove(Chess, game, p.sans[i]);
      Chess.play(game, move);
      sanHistory.push(p.sans[i]);
      lastMove = { from: move.from, to: move.to };
    }
  }

  /** Réponse du joueur : point si le coup est (quasi) le meilleur. */
  function trainerTryMove(from, to, candidates) {
    const p = trainer.puzzles[trainer.index];
    let move = candidates[0];
    if (move.promo) move = candidates.find(m => m.promo === 'q') || move;
    const ok = p.acceptable.some(a =>
        a.from === move.from && a.to === move.to && (a.promo || null) === (move.promo || null));
    const userSan = Chess.sanOf(game, move);
    // Explication « humaine » du meilleur coup, calculée sur la position du puzzle
    const best = p.acceptable[0];
    const bestMove = Chess.legalMoves(game).find(m =>
        m.from === best.from && m.to === best.to && (m.promo || null) === (best.promo || null));
    const why = bestMove ? Signals.explainMove(Chess, game, bestMove) : [];
    Chess.play(game, move);
    sanHistory.push(userSan);
    lastMove = { from: move.from, to: move.to };
    selected = -1;
    legalTargets = [];
    if (ok) trainer.score++;
    trainer.state = 'feedback';
    trainer.lastResult = { ok, userSan, why };
    trainerSaveAttempt(ok);
    if (move.capture) soundCapture(); else soundMove();
    renderGame({ animate: true });
    // Badge façon chess.com sur le coup de l'utilisateur
    showMoveBadge(move.to, ok ? MoveClassifier.KINDS.best : MoveClassifier.KINDS.mistake);
    squares[best.from].classList.add('hint-move');
    squares[best.to].classList.add('hint-move');
    if (!ok) {
      // Réponse visuelle : on revient à la position et on JOUE le meilleur coup
      setTimeout(() => {
        if (!trainer || trainer.state !== 'feedback' || mode !== 'trainer') return;
        replayPuzzlePrefix(p);
        for (const el of pieceEls.values()) el.remove();
        pieceEls.clear();
        syncPieces(game.board);
        const replayBest = Chess.legalMoves(game).find(m =>
            m.from === best.from && m.to === best.to && (m.promo || null) === (best.promo || null));
        if (!replayBest) return;
        Chess.play(game, replayBest);
        sanHistory.push(best.san);
        lastMove = { from: best.from, to: best.to };
        soundMove();
        renderGame({ animate: true });
        squares[best.from].classList.add('hint-move');
        squares[best.to].classList.add('hint-move');
        drawArrow(best.from, best.to, 'rgba(46, 125, 91, .85)', 'trainer-arrow');
      }, 1100);
    } else {
      // Trouvé : montrer sur l'échiquier la gaffe réellement jouée en partie
      showActualPlayedMove(p, 'trainer-arrow',
          () => trainer && trainer.state === 'feedback' && mode === 'trainer');
    }
    renderTrainerPanel();
    updateSignalsButton();
    return true;
  }

  /** Suggestion : surligne la pièce à jouer (sans révéler la case d'arrivée). */
  function trainerHint() {
    if (!trainer || trainer.state !== 'guess') return;
    const best = trainer.puzzles[trainer.index].acceptable[0];
    squares[best.from].classList.add('hint-move');
    setTimeout(() => squares[best.from].classList.remove('hint-move'), 2200);
  }

  function trainerNext() {
    if (!trainer) return;
    trainer.index++;
    if (trainer.index >= trainer.puzzles.length) {
      trainer.state = 'done';
      renderTrainerPanel();
      renderStatus();
      updateSignalsButton();
    } else {
      trainerShowPuzzle();
    }
  }

  function trainerEvalLabel(cp) {
    const value = cp / 100;
    return (value >= 0 ? '+' : '') + value.toFixed(1);
  }

  function renderTrainerPanel() {
    if (!trainer) {
      trainerPanel.innerHTML = '';
      return;
    }
    const stats = trainerStats();
    const globalStats =
      '<div class="tr-stats">'
      + '<div class="tr-stat"><b>' + stats.attempts + '</b><span>positions jouées</span></div>'
      + '<div class="tr-stat"><b>' + stats.correct + '</b><span>réussies</span></div>'
      + '<div class="tr-stat"><b>' + trainerRate(stats.correct, stats.attempts) + '</b><span>taux global</span></div>'
      + '</div>';

    if (trainer.state === 'intro') {
      trainerPanel.innerHTML =
        '<div class="tr-card"><h3>🧩 Blunder Trainer</h3>'
        + '<p>' + TRAINER_SIZE + ' positions tirées au hasard de vos 100 dernières parties chess.com, '
        + 'juste avant une gaffe ou une erreur que vous avez commise. '
        + 'Retrouvez le meilleur coup : 1 point par bonne réponse.</p>'
        + globalStats
        + '<button type="button" class="btn btn-primary" data-tr="start">Démarrer · ' + TRAINER_SIZE + ' positions</button>'
        + '</div>';
    } else if (trainer.state === 'needuser') {
      trainerPanel.innerHTML =
        '<div class="tr-card"><h3>🧩 Blunder Trainer</h3>'
        + '<p>Indiquez votre pseudo chess.com : vos 100 dernières parties seront récupérées puis analysées.</p>'
        + '<input type="text" id="tr-user" placeholder="ex. hikaru" autocomplete="off" '
        + 'style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font-family:inherit;font-size:14px">'
        + '<button type="button" class="btn btn-primary" data-tr="setuser">Analyser mes parties</button>'
        + '</div>';
    } else if (trainer.state === 'prep') {
      const pct = Math.round((trainer.puzzles.length / TRAINER_SIZE) * 100);
      trainerPanel.innerHTML =
        '<div class="tr-card"><h3>Recherche de vos gaffes…</h3>'
        + '<p>' + trainer.gamesScanned + ' partie' + plural(trainer.gamesScanned) + ' analysée'
        + plural(trainer.gamesScanned) + ' · ' + trainer.puzzles.length + '/' + TRAINER_SIZE
        + ' position' + plural(trainer.puzzles.length) + ' trouvée' + plural(trainer.puzzles.length) + '</p>'
        + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:' + pct + '%"></div></div>'
        + '</div>';
    } else if (trainer.state === 'guess' || trainer.state === 'feedback') {
      const p = trainer.puzzles[trainer.index];
      const moveNumber = Math.floor(p.ply / 2) + 1;
      const kind = p.loss >= 200 ? 'gaffe' : p.loss >= 100 ? 'erreur' : 'imprécision';
      const kindSym = p.loss >= 200 ? '??' : p.loss >= 100 ? '?' : '?!';
      let feedback = '';
      if (trainer.state === 'feedback') {
        const r = trainer.lastResult;
        const why = r.why && r.why.length > 0
          ? '<small>Pourquoi ' + escapeHtml(p.bestSan) + ' ? Ce coup ' + r.why.join(', ') + '.</small>'
          : '';
        const partie = '<small>' + kindSym + ' ' + kind.charAt(0).toUpperCase() + kind.slice(1)
          + ' — en partie, vous aviez joué ' + escapeHtml(p.played)
          + ' (−' + (p.loss / 100).toFixed(1) + '). Le meilleur coup était ' + escapeHtml(p.bestSan)
          + ' (' + trainerEvalLabel(p.evalBest) + ')' + (p.sfVerified ? ' — vérifié Stockfish 18' : '') + '.</small>';
        feedback = r.ok
          ? '<div class="tr-feedback ok">✓ Exact ! ' + escapeHtml(r.userSan) + ' était le meilleur coup ('
            + trainerEvalLabel(p.evalBest) + ').' + why + partie + '</div>'
          : '<div class="tr-feedback ko">✗ ' + escapeHtml(r.userSan) + '… Regardez : le meilleur coup ('
            + escapeHtml(p.bestSan) + ', ' + trainerEvalLabel(p.evalBest) + ') est joué en vert sur l\'échiquier.'
            + why + partie + '</div>';
        feedback += '<button type="button" class="btn btn-primary" data-tr="next">'
          + (trainer.index + 1 >= trainer.puzzles.length ? 'Voir le résultat' : 'Position suivante') + '</button>';
      }
      trainerPanel.innerHTML =
        '<div class="tr-card">'
        + '<div class="tr-quiz-head"><span class="pos">Position ' + (trainer.index + 1) + ' / '
        + trainer.puzzles.length + '</span><span class="score">Score : ' + trainer.score + '</span></div>'
        + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:'
        + Math.round((trainer.index / trainer.puzzles.length) * 100) + '%"></div></div>'
        + '<p class="tr-meta">Contre ' + escapeHtml(p.opponent) + ' · coup n°' + moveNumber
        + ' · trait aux ' + (p.userColor === 'w' ? 'Blancs' : 'Noirs') + '.</p>'
        + (trainer.state === 'guess'
            ? '<p>Vous avez commis une ' + kind + ' ici. Trouvez le meilleur coup !</p>'
              + '<button type="button" class="btn btn-secondary" data-tr="hint">💡 Suggestion : quelle pièce jouer ?</button>'
            : '')
        + feedback
        + '</div>';
    } else if (trainer.state === 'done') {
      const total = trainer.puzzles.length;
      const pct = Math.round((trainer.score / total) * 100);
      trainerPanel.innerHTML =
        '<div class="tr-card"><h3>Session terminée !</h3>'
        + '<div class="tr-stats">'
        + '<div class="tr-stat"><b>' + trainer.score + '/' + total + '</b><span>score</span></div>'
        + '<div class="tr-stat"><b>' + pct + ' %</b><span>réussite session</span></div>'
        + '</div>'
        + globalStats
        + '<button type="button" class="btn btn-primary" data-tr="start">Nouvelle session</button>'
        + '</div>';
    } else if (trainer.state === 'empty') {
      trainerPanel.innerHTML =
        '<div class="tr-card"><h3>Aucune gaffe trouvée 🎉</h3>'
        + '<p>Bravo — ou presque : aucune erreur nette n\'a été détectée dans les parties analysées. Réessayez, le tirage est aléatoire.</p>'
        + '<button type="button" class="btn btn-primary" data-tr="start">Réessayer</button>'
        + '</div>';
    } else if (trainer.state === 'error') {
      trainerPanel.innerHTML =
        '<div class="tr-card"><h3>Impossible de récupérer vos parties</h3>'
        + '<p>' + escapeHtml(trainer.error || 'Erreur inconnue.') + '</p>'
        + '<button type="button" class="btn btn-primary" data-tr="start">Réessayer</button>'
        + '</div>';
    }
  }

  trainerPanel.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-tr]');
    if (!btn) return;
    const action = btn.dataset.tr;
    if (action === 'start') trainerStart();
    else if (action === 'next') trainerNext();
    else if (action === 'hint') trainerHint();
    else if (action === 'setuser') {
      const input = trainerPanel.querySelector('#tr-user');
      const value = (input && input.value.trim()) || '';
      if (!value) return;
      chesscomUsername = value;
      saveChesscomUsername(value);
      trainerStart();
    }
  });

  // ---------------------------------------------------------- miss puzzles --
  // Quiz : 10 positions tirées des 100 dernières parties chess.com où le
  // joueur avait un net avantage (au moins +2) et où son coup l'a laissé
  // filer. Retrouver le coup qui gardait l'avantage rapporte un point ;
  // note sur 10 en fin de session.

  const MISSP_SIZE = 10;
  const MISSP_STATS_KEY = 'echecs360-misspuzzles-stats';
  const missPPanel = document.getElementById('misspuzzles-panel');

  /** Indices 0..n-1 en ordre aléatoire (mélange de Fisher-Yates). */
  function shuffledIndexes(n) {
    const order = [...Array(n).keys()];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  /** Ordre de scan : les parties déjà analysées (cache) d'abord — la session
      démarre alors quasi instantanément — puis les autres. Chaque groupe est
      mélangé pour garder des positions variées d'une session à l'autre. */
  function scanAwareOrder(kind) {
    const cachedIdx = [];
    const freshIdx = [];
    for (let i = 0; i < gamesList.length; i++) {
      const g = gamesList[i];
      const meIsWhite = (g.white.username || '').toLowerCase() === chesscomUsername.toLowerCase();
      const color = meIsWhite ? 'w' : 'b';
      (scanCacheGet(kind, g, color) ? cachedIdx : freshIdx).push(i);
    }
    for (const arr of [cachedIdx, freshIdx]) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return cachedIdx.concat(freshIdx);
  }

  /** Statistiques persistées d'un quiz (Miss Puzzles / Miss Mates). */
  function quizStats(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || { attempts: 0, correct: 0 };
    } catch (e) { return { attempts: 0, correct: 0 }; }
  }

  function quizSaveAttempt(key, correct) {
    const stats = quizStats(key);
    stats.attempts++;
    if (correct) stats.correct++;
    localStorage.setItem(key, JSON.stringify(stats));
  }

  async function missPStart() {
    missP = { state: 'prep', puzzles: [], index: 0, score: 0, order: [], oi: 0, gamesScanned: 0 };
    renderMissPPanel();
    renderStatus();
    if (gamesList.length === 0) {
      if (!chesscomUsername) {
        missP.state = 'needuser';
        renderMissPPanel();
        return;
      }
      try {
        gamesList = await fetchChesscomGames(chesscomUsername);
      } catch (err) {
        if (!missP || missP.state !== 'prep') return;
        missP.state = 'error';
        missP.error = err.message;
        renderMissPPanel();
        return;
      }
      if (!missP || missP.state !== 'prep') return;
    }
    missP.order = scanAwareOrder(BLUNDERS_KIND);
    missPRunScan();
  }

  /** Analyse la partie suivante (dans le worker) jusqu'à avoir 10 positions. */
  /** Scan parallèle (pool partagé avec le Blunder Trainer). Ne retient que
      les avantages gâchés : au moins +2 avant le coup, égalité (ou pire)
      après. */
  function missPRunScan() {
    const session = missP;
    scanBlundersPool({
      order: session.order,
      alive: () => missP === session && session.state === 'prep',
      // Au plus 40 parties analysées par session : la préparation reste courte
      done: () => session.puzzles.length >= MISSP_SIZE || session.gamesScanned >= 40,
      accept: (meta, items) => {
        const found = items.filter(item => item.before >= 200 && item.after <= 100);
        // Au plus 2 positions par partie, pour varier les contextes
        while (found.length > 2) found.splice(Math.floor(Math.random() * found.length), 1);
        for (const item of found) {
          if (session.puzzles.length >= MISSP_SIZE) break;
          session.puzzles.push({
            ...item, sans: meta.sans, userColor: meta.userColor, opponent: meta.opponent
          });
        }
        session.gamesScanned++;
      },
      progress: () => renderMissPPanel(),
      finish: () => missPBegin()
    });
  }

  function missPBegin() {
    if (!missP) return;
    if (missP.puzzles.length === 0) {
      missP.state = 'empty';
      renderMissPPanel();
      return;
    }
    for (let i = missP.puzzles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [missP.puzzles[i], missP.puzzles[j]] = [missP.puzzles[j], missP.puzzles[i]];
    }
    missP.index = 0;
    missP.score = 0;
    missPShowPuzzle();
  }

  /** Affiche la position du puzzle courant (juste avant l'avantage gâché). */
  function missPShowPuzzle() {
    const p = missP.puzzles[missP.index];
    clearAnnotations();
    clearMoveBadge();
    replayPuzzlePrefix(p);
    selected = -1;
    legalTargets = [];
    gameOver = false;
    orientation = p.userColor;
    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    for (const el of squares) el.classList.remove('hint-move');
    const arrow = document.getElementById('missp-arrow');
    if (arrow) arrow.remove();
    missP.state = 'guess';
    missP.lastResult = null;
    renderGame({});
    renderMissPPanel();
    updateSignalsButton();
    sfVerifyPuzzle(p);
  }

  /** Réponse du joueur : point si le coup garde l'avantage (quasi meilleur). */
  function missPTryMove(from, to, candidates) {
    const p = missP.puzzles[missP.index];
    let move = candidates[0];
    if (move.promo) move = candidates.find(m => m.promo === 'q') || move;
    const ok = p.acceptable.some(a =>
        a.from === move.from && a.to === move.to && (a.promo || null) === (move.promo || null));
    const userSan = Chess.sanOf(game, move);
    // Explication « humaine » du meilleur coup, calculée sur la position du puzzle
    const best = p.acceptable[0];
    const bestMove = Chess.legalMoves(game).find(m =>
        m.from === best.from && m.to === best.to && (m.promo || null) === (best.promo || null));
    const why = bestMove ? Signals.explainMove(Chess, game, bestMove) : [];
    Chess.play(game, move);
    sanHistory.push(userSan);
    lastMove = { from: move.from, to: move.to };
    selected = -1;
    legalTargets = [];
    if (ok) missP.score++;
    missP.state = 'feedback';
    missP.lastResult = { ok, userSan, why };
    quizSaveAttempt(MISSP_STATS_KEY, ok);
    if (move.capture) soundCapture(); else soundMove();
    renderGame({ animate: true });
    showMoveBadge(move.to, ok ? MoveClassifier.KINDS.best : MoveClassifier.KINDS.mistake);
    squares[best.from].classList.add('hint-move');
    squares[best.to].classList.add('hint-move');
    if (!ok) {
      // Réponse visuelle : retour à la position puis le coup qui gardait l'avantage
      setTimeout(() => {
        if (!missP || missP.state !== 'feedback' || mode !== 'misspuzzles') return;
        replayPuzzlePrefix(p);
        for (const el of pieceEls.values()) el.remove();
        pieceEls.clear();
        syncPieces(game.board);
        const replayBest = Chess.legalMoves(game).find(m =>
            m.from === best.from && m.to === best.to && (m.promo || null) === (best.promo || null));
        if (!replayBest) return;
        Chess.play(game, replayBest);
        sanHistory.push(best.san);
        lastMove = { from: best.from, to: best.to };
        soundMove();
        renderGame({ animate: true });
        squares[best.from].classList.add('hint-move');
        squares[best.to].classList.add('hint-move');
        drawArrow(best.from, best.to, 'rgba(46, 125, 91, .85)', 'missp-arrow');
      }, 1100);
    } else {
      // Trouvé : montrer sur l'échiquier le coup réellement joué en partie
      showActualPlayedMove(p, 'missp-arrow',
          () => missP && missP.state === 'feedback' && mode === 'misspuzzles');
    }
    renderMissPPanel();
    updateSignalsButton();
    return true;
  }

  /** Suggestion : surligne la pièce à jouer (sans révéler la case d'arrivée). */
  function missPHint() {
    if (!missP || missP.state !== 'guess') return;
    const best = missP.puzzles[missP.index].acceptable[0];
    squares[best.from].classList.add('hint-move');
    setTimeout(() => squares[best.from].classList.remove('hint-move'), 2200);
  }

  function missPNext() {
    if (!missP) return;
    missP.index++;
    if (missP.index >= missP.puzzles.length) {
      missP.state = 'done';
      renderMissPPanel();
      renderStatus();
      updateSignalsButton();
    } else {
      missPShowPuzzle();
    }
  }

  function renderMissPPanel() {
    if (!missP) {
      missPPanel.innerHTML = '';
      return;
    }
    const stats = quizStats(MISSP_STATS_KEY);
    const globalStats =
      '<div class="tr-stats">'
      + '<div class="tr-stat"><b>' + stats.attempts + '</b><span>positions jouées</span></div>'
      + '<div class="tr-stat"><b>' + stats.correct + '</b><span>réussies</span></div>'
      + '<div class="tr-stat"><b>' + trainerRate(stats.correct, stats.attempts) + '</b><span>taux global</span></div>'
      + '</div>';

    if (missP.state === 'intro') {
      missPPanel.innerHTML =
        '<div class="tr-card"><h3>💡 Miss Puzzles</h3>'
        + '<p>' + MISSP_SIZE + ' positions tirées de vos 100 dernières parties chess.com, '
        + 'là où vous aviez un net avantage… et où votre coup l\'a laissé filer. '
        + 'Retrouvez le coup qui gardait l\'avantage : 1 point par bonne réponse, note sur '
        + MISSP_SIZE + ' à la fin.</p>'
        + globalStats
        + '<button type="button" class="btn btn-primary" data-mp="start">Démarrer · ' + MISSP_SIZE + ' positions</button>'
        + '</div>';
    } else if (missP.state === 'needuser') {
      missPPanel.innerHTML =
        '<div class="tr-card"><h3>💡 Miss Puzzles</h3>'
        + '<p>Indiquez votre pseudo chess.com : vos 100 dernières parties seront récupérées puis analysées.</p>'
        + '<input type="text" id="mp-user" placeholder="ex. hikaru" autocomplete="off" '
        + 'style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font-family:inherit;font-size:14px">'
        + '<button type="button" class="btn btn-primary" data-mp="setuser">Analyser mes parties</button>'
        + '</div>';
    } else if (missP.state === 'prep') {
      const pct = Math.round((missP.puzzles.length / MISSP_SIZE) * 100);
      missPPanel.innerHTML =
        '<div class="tr-card"><h3>Recherche de vos avantages manqués…</h3>'
        + '<p>' + missP.gamesScanned + ' partie' + plural(missP.gamesScanned) + ' analysée'
        + plural(missP.gamesScanned) + ' · ' + missP.puzzles.length + '/' + MISSP_SIZE
        + ' position' + plural(missP.puzzles.length) + ' trouvée' + plural(missP.puzzles.length) + '</p>'
        + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:' + pct + '%"></div></div>'
        + '</div>';
    } else if (missP.state === 'guess' || missP.state === 'feedback') {
      const p = missP.puzzles[missP.index];
      const moveNumber = Math.floor(p.ply / 2) + 1;
      let feedback = '';
      if (missP.state === 'feedback') {
        const r = missP.lastResult;
        const why = r.why && r.why.length > 0
          ? '<small>Pourquoi ' + escapeHtml(p.bestSan) + ' ? Ce coup ' + r.why.join(', ') + '.</small>'
          : '';
        const partie = '<small>En partie, vous aviez joué ' + escapeHtml(p.played)
          + ' : l\'avantage est passé de ' + trainerEvalLabel(p.before) + ' à ' + trainerEvalLabel(p.after)
          + '. Le coup juste était ' + escapeHtml(p.bestSan) + ' (' + trainerEvalLabel(p.evalBest) + ')'
          + (p.sfVerified ? ' — vérifié Stockfish 18' : '') + '.</small>';
        feedback = r.ok
          ? '<div class="tr-feedback ok">✓ Bien vu ! ' + escapeHtml(r.userSan) + ' garde l\'avantage ('
            + trainerEvalLabel(p.evalBest) + ').' + why + partie + '</div>'
          : '<div class="tr-feedback ko">✗ ' + escapeHtml(r.userSan) + '… Regardez : le coup qui gardait l\'avantage ('
            + escapeHtml(p.bestSan) + ', ' + trainerEvalLabel(p.evalBest) + ') est joué en vert sur l\'échiquier.'
            + why + partie + '</div>';
        feedback += '<button type="button" class="btn btn-primary" data-mp="next">'
          + (missP.index + 1 >= missP.puzzles.length ? 'Voir la note' : 'Position suivante') + '</button>';
      }
      missPPanel.innerHTML =
        '<div class="tr-card">'
        + '<div class="tr-quiz-head"><span class="pos">Position ' + (missP.index + 1) + ' / '
        + missP.puzzles.length + '</span><span class="score">Score : ' + missP.score + '</span></div>'
        + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:'
        + Math.round((missP.index / missP.puzzles.length) * 100) + '%"></div></div>'
        + '<p class="tr-meta">Contre ' + escapeHtml(p.opponent) + ' · coup n°' + moveNumber
        + ' · trait aux ' + (p.userColor === 'w' ? 'Blancs' : 'Noirs') + '.</p>'
        + (missP.state === 'guess'
            ? '<p>Vous aviez ici un avantage de <b>' + trainerEvalLabel(p.before)
              + '</b>… et vous l\'avez manqué. Trouvez le coup qui le gardait !</p>'
              + '<button type="button" class="btn btn-secondary" data-mp="hint">💡 Suggestion : quelle pièce jouer ?</button>'
            : '')
        + feedback
        + '</div>';
    } else if (missP.state === 'done') {
      const total = missP.puzzles.length;
      const pct = Math.round((missP.score / total) * 100);
      missPPanel.innerHTML =
        '<div class="tr-card"><h3>Session terminée !</h3>'
        + '<div class="tr-stats">'
        + '<div class="tr-stat"><b>' + missP.score + ' / ' + total + '</b><span>note</span></div>'
        + '<div class="tr-stat"><b>' + pct + ' %</b><span>réussite session</span></div>'
        + '</div>'
        + globalStats
        + '<button type="button" class="btn btn-primary" data-mp="start">Nouvelle session</button>'
        + '</div>';
    } else if (missP.state === 'empty') {
      missPPanel.innerHTML =
        '<div class="tr-card"><h3>Aucun avantage manqué trouvé 🎉</h3>'
        + '<p>Dans les parties analysées, vous avez converti vos avantages — ou aucun net avantage '
        + 'n\'a été gâché. Réessayez : le tirage des parties est aléatoire.</p>'
        + '<button type="button" class="btn btn-primary" data-mp="start">Réessayer</button>'
        + '</div>';
    } else if (missP.state === 'error') {
      missPPanel.innerHTML =
        '<div class="tr-card"><h3>Impossible de récupérer vos parties</h3>'
        + '<p>' + escapeHtml(missP.error || 'Erreur inconnue.') + '</p>'
        + '<button type="button" class="btn btn-primary" data-mp="start">Réessayer</button>'
        + '</div>';
    }
  }

  missPPanel.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-mp]');
    if (!btn) return;
    const action = btn.dataset.mp;
    if (action === 'start') missPStart();
    else if (action === 'next') missPNext();
    else if (action === 'hint') missPHint();
    else if (action === 'setuser') {
      const input = missPPanel.querySelector('#mp-user');
      const value = (input && input.value.trim()) || '';
      if (!value) return;
      chesscomUsername = value;
      saveChesscomUsername(value);
      missPStart();
    }
  });

  // ------------------------------------------------------------ miss mates --
  // Quiz : les mats en 1, 2 ou 3 coups que le joueur a ratés dans ses parties
  // chess.com, détectés par Stockfish. Chaque mat se rejoue coup par coup
  // (Stockfish vérifie le coup et joue la meilleure défense) ; mater rapporte
  // un point, note sur 10 en fin de session.

  const MISSM_SIZE = 10;
  const MISSM_MAX_GAMES = 20;
  const MISSM_STATS_KEY = 'echecs360-missmates-stats';
  const missMPanel = document.getElementById('missmates-panel');
  let missMToken = 0;

  async function missMStart() {
    const token = ++missMToken;
    missM = { state: 'prep', puzzles: [], index: 0, score: 0, order: [], oi: 0,
      gamesScanned: 0, token, seq: 0 };
    renderMissMPanel();
    renderStatus();
    if (gamesList.length === 0) {
      if (!chesscomUsername) {
        missM.state = 'needuser';
        renderMissMPanel();
        return;
      }
      try {
        gamesList = await fetchChesscomGames(chesscomUsername);
      } catch (err) {
        if (!missM || missM.token !== token) return;
        missM.state = 'error';
        missM.error = err.message;
        renderMissMPanel();
        return;
      }
      if (!missM || missM.token !== token || missM.state !== 'prep') return;
    }
    const ok = await SfEngine.ready();
    if (!missM || missM.token !== token || missM.state !== 'prep') return;
    if (!ok) {
      missM.state = 'error';
      missM.error = 'Stockfish est indisponible sur cet appareil — Miss Mates en a besoin pour détecter les mats forcés.';
      renderMissMPanel();
      return;
    }
    missM.order = scanAwareOrder('mates');
    missMScanLoop(token);
  }

  /** Passe les parties au crible (en ordre aléatoire) jusqu'à 10 mats ratés.
      PARALLÈLE : un pool d'instances Stockfish (une par cœur, borné à 4) se
      répartit les parties ; les parties en cache ne coûtent aucun moteur. */
  async function missMScanLoop(token) {
    const alive = () => missM && missM.token === token && missM.state === 'prep';
    const done = () => missM.puzzles.length >= MISSM_SIZE || missM.gamesScanned >= MISSM_MAX_GAMES;
    const takeJob = () => {
      while (missM.oi < missM.order.length) {
        const g = gamesList[missM.order[missM.oi++]];
        const meIsWhite = (g.white.username || '').toLowerCase() === chesscomUsername.toLowerCase();
        const parsed = Pgn.parsePgn(g.pgn || '');
        if (parsed.sans.length < 12) continue;
        return {
          g,
          meta: {
            sans: parsed.sans,
            userColor: meIsWhite ? 'w' : 'b',
            opponent: (meIsWhite ? g.black.username : g.white.username) || 'Adversaire'
          }
        };
      }
      return null;
    };
    const poolSize = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 2));
    const engines = [];
    await Promise.all(Array.from({ length: poolSize }, async () => {
      let engine = null;
      while (alive() && !done()) {
        const job = takeJob();
        if (!job) break;
        // Partie déjà passée au crible lors d'une session précédente
        const cached = scanCacheGet('mates', job.g, job.meta.userColor);
        if (cached) {
          for (const item of cached) {
            if (missM.puzzles.length >= MISSM_SIZE) break;
            missM.puzzles.push({ ...item, userColor: job.meta.userColor, opponent: job.meta.opponent });
          }
          missM.gamesScanned++;
          renderMissMPanel();
          continue;
        }
        if (!engine) {
          engine = SfEngine.createEngine(16);
          const ok = await engine.ready();
          if (!ok) { engine.terminate(); engine = null; return; }
          engines.push(engine);
        }
        const foundItems = await missMScanGame(token, job.meta, engine);
        if (!alive()) return;
        // Scan complet (non interrompu) : mémorisé, même vide
        if (foundItems !== null) {
          scanCachePut(scanCacheKey('mates', job.g, job.meta.userColor), foundItems);
        }
        missM.gamesScanned++;
        renderMissMPanel();
      }
    }));
    for (const engine of engines) engine.terminate();
    if (alive()) missMBegin();
  }

  /** Cherche dans une partie les mats en 1 à 3 du joueur que son coup a
      laissés s'échapper (Stockfish, ~100 ms par position). Au plus 2 par
      partie. Renvoie les puzzles trouvés, ou null si le scan a été interrompu
      (résultat partiel : à ne pas mettre en cache). `engine` : instance
      Stockfish dédiée du pool (les analyses des autres moteurs continuent
      en parallèle). */
  async function missMScanGame(token, meta, engine) {
    const s = Chess.newGame();
    const fens = [Chess.toFen(s)];
    const sans = [];
    for (const san of meta.sans) {
      const move = Pgn.sanToMove(Chess, s, san);
      if (!move) break;
      Chess.play(s, move);
      sans.push(san);
      fens.push(Chess.toFen(s));
    }
    const sign = meta.userColor === 'w' ? 1 : -1;
    const foundItems = [];
    // Les mats n'apparaissent presque jamais dans l'ouverture : départ au ply 8
    for (let i = 8; i < sans.length && foundItems.length < 2; i++) {
      if ((i % 2 === 0 ? 'w' : 'b') !== meta.userColor) continue;
      if (!missM || missM.token !== token || missM.state !== 'prep'
          || missM.puzzles.length >= MISSM_SIZE) return null;
      const lines = await engine.analyze(fens[i], { multipv: 1, movetime: 110, depth: 12 });
      if (!missM || missM.token !== token || missM.state !== 'prep') return null;
      const top = lines && lines[0];
      if (!top || top.mate === null || top.mate === undefined
          || !top.pv || top.pv.length === 0) continue;
      const mateIn = sign * top.mate;
      if (mateIn < 1 || mateIn > 3) continue;
      // Mat disponible : raté si le coup joué n'y a pas progressé (le mat
      // s'est échappé, ou il reste aussi long qu'avant — coup non matant)
      const afterState = Chess.fromFen(fens[i + 1]);
      if (Chess.statusOf(afterState).over) continue; // le coup joué concluait déjà
      const alines = await engine.analyze(fens[i + 1], { multipv: 1, movetime: 140, depth: 12 });
      if (!missM || missM.token !== token || missM.state !== 'prep') return null;
      const atop = alines && alines[0];
      if (atop && atop.mate !== null && atop.mate !== undefined
          && sign * atop.mate > 0 && sign * atop.mate < mateIn) continue;
      const item = {
        ply: i, sans, mateIn, played: sans[i],
        pv: top.pv.slice(0, mateIn * 2 - 1)
      };
      foundItems.push(item);
      missM.puzzles.push({ ...item, userColor: meta.userColor, opponent: meta.opponent });
      renderMissMPanel();
      i += 6; // le même mat traîne souvent plusieurs coups : on saute plus loin
    }
    return foundItems;
  }

  function missMBegin() {
    if (!missM) return;
    if (missM.puzzles.length === 0) {
      missM.state = 'empty';
      renderMissMPanel();
      return;
    }
    for (let i = missM.puzzles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [missM.puzzles[i], missM.puzzles[j]] = [missM.puzzles[j], missM.puzzles[i]];
    }
    missM.index = 0;
    missM.score = 0;
    missMShowPuzzle();
  }

  /** Affiche la position du puzzle courant (juste avant le mat raté). */
  function missMShowPuzzle() {
    const p = missM.puzzles[missM.index];
    missM.seq = (missM.seq || 0) + 1; // invalide les vérifications en attente
    clearAnnotations();
    clearMoveBadge();
    replayPuzzlePrefix(p);
    selected = -1;
    legalTargets = [];
    gameOver = false;
    orientation = p.userColor;
    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    for (const el of squares) el.classList.remove('hint-move');
    const arrow = document.getElementById('missm-arrow');
    if (arrow) arrow.remove();
    missM.state = 'guess';
    missM.busy = false;
    missM.matesLeft = p.mateIn;
    missM.notice = null;
    missM.lastResult = null;
    renderGame({});
    renderMissMPanel();
  }

  /** Coup du joueur : mat immédiat = réussi ; sinon Stockfish vérifie que le
      mat reste forcé puis joue la meilleure défense. */
  function missMTryMove(from, to, candidates) {
    const p = missM.puzzles[missM.index];
    let move = candidates[0];
    if (move.promo) move = candidates.find(m => m.promo === 'q') || move;
    const userSan = Chess.sanOf(game, move);
    Chess.play(game, move);
    sanHistory.push(userSan);
    lastMove = { from: move.from, to: move.to };
    selected = -1;
    legalTargets = [];
    if (move.capture) soundCapture(); else soundMove();
    renderGame({ animate: true });
    const status = Chess.statusOf(game);
    if (status.over && status.reason === 'échec et mat') {
      missM.score++;
      missM.state = 'feedback';
      missM.lastResult = { ok: true, userSan };
      quizSaveAttempt(MISSM_STATS_KEY, true);
      showMoveBadge(move.to, MoveClassifier.KINDS.best);
      soundEnd();
      renderMissMPanel();
      renderStatus();
      // Mat trouvé : montrer sur l'échiquier le coup réellement joué en partie
      const seqDone = missM.seq;
      showActualPlayedMove(p, 'missm-arrow',
          () => missM && missM.seq === seqDone && missM.state === 'feedback' && mode === 'missmates');
      return true;
    }
    if (status.over) {
      missMFail(p, userSan + ' arrête la partie sans mat ('
        + reasonLabel(status.reason).toLowerCase() + ').');
      return true;
    }
    missM.notice = null;
    missM.busy = true;
    renderStatus();
    missMVerify(p, userSan, missM.seq);
    return true;
  }

  async function missMVerify(p, userSan, seq) {
    const lines = await SfEngine.analyze(Chess.toFen(game), { multipv: 1, movetime: 500, depth: 16 });
    if (!missM || missM.seq !== seq || missM.state !== 'guess' || mode !== 'missmates') return;
    const sign = p.userColor === 'w' ? 1 : -1;
    const top = lines && lines[0];
    const mate = top && top.mate !== null && top.mate !== undefined ? sign * top.mate : null;
    if (mate !== null && mate > 0 && mate <= missM.matesLeft - 1) {
      // Le mat reste forcé : l'adversaire joue sa meilleure défense
      missM.matesLeft = mate;
      missM.notice = '✓ Le mat reste forcé — l\'adversaire défend…';
      renderStatus();
      setTimeout(() => {
        if (!missM || missM.seq !== seq || missM.state !== 'guess' || mode !== 'missmates') return;
        const reply = uciToMove(game, top.uci) || Chess.legalMoves(game)[0];
        if (!reply) return;
        const replySan = Chess.sanOf(game, reply);
        Chess.play(game, reply);
        sanHistory.push(replySan);
        lastMove = { from: reply.from, to: reply.to };
        soundMove();
        missM.busy = false;
        missM.notice = 'À vous — mat en ' + missM.matesLeft + '.';
        renderGame({ animate: true });
        renderStatus();
      }, 550);
    } else if (mate !== null && mate > 0) {
      missMFail(p, userSan + ' mate encore, mais trop lentement : il fallait conclure en '
        + missM.matesLeft + ' coup' + plural(missM.matesLeft) + '.');
    } else {
      missMFail(p, userSan + ' laisse le mat s\'échapper.');
    }
  }

  /** Puzzle raté : feedback puis la séquence de mat se rejoue sur l'échiquier. */
  function missMFail(p, why) {
    missM.busy = false;
    missM.state = 'feedback';
    missM.lastResult = { ok: false, why };
    quizSaveAttempt(MISSM_STATS_KEY, false);
    if (lastMove) showMoveBadge(lastMove.to, MoveClassifier.KINDS.blunder);
    renderMissMPanel();
    renderStatus();
    missMPlaySolution(p, missM.seq);
  }

  /** Rejoue la séquence gagnante (PV Stockfish du scan), animée. */
  function missMPlaySolution(p, seq) {
    setTimeout(() => {
      if (!missM || missM.seq !== seq || missM.state !== 'feedback' || mode !== 'missmates') return;
      clearMoveBadge();
      replayPuzzlePrefix(p);
      for (const el of pieceEls.values()) el.remove();
      pieceEls.clear();
      syncPieces(game.board);
      let index = 0;
      const step = () => {
        if (!missM || missM.seq !== seq || missM.state !== 'feedback' || mode !== 'missmates') return;
        const move = uciToMove(game, p.pv[index]);
        if (!move) return;
        const san = Chess.sanOf(game, move);
        Chess.play(game, move);
        sanHistory.push(san);
        lastMove = { from: move.from, to: move.to };
        if (index === 0) drawArrow(move.from, move.to, 'rgba(46, 125, 91, .85)', 'missm-arrow');
        soundMove();
        renderGame({ animate: true });
        index++;
        if (index < p.pv.length) setTimeout(step, 700);
      };
      step();
    }, 1100);
  }

  /** Suggestion : demande à Stockfish le coup à jouer et surligne la pièce. */
  async function missMHint() {
    if (!missM || missM.state !== 'guess' || missM.busy) return;
    const seq = missM.seq;
    const lines = await SfEngine.analyze(Chess.toFen(game), { multipv: 1, movetime: 350, depth: 14 });
    if (!missM || missM.seq !== seq || missM.state !== 'guess' || missM.busy || mode !== 'missmates') return;
    const move = lines && lines[0] ? uciToMove(game, lines[0].uci) : null;
    if (!move) return;
    squares[move.from].classList.add('hint-move');
    setTimeout(() => squares[move.from].classList.remove('hint-move'), 2200);
  }

  function missMNext() {
    if (!missM) return;
    missM.index++;
    if (missM.index >= missM.puzzles.length) {
      missM.state = 'done';
      missM.seq = (missM.seq || 0) + 1; // stoppe une éventuelle solution en cours
      renderMissMPanel();
      renderStatus();
    } else {
      missMShowPuzzle();
    }
  }

  function renderMissMPanel() {
    if (!missM) {
      missMPanel.innerHTML = '';
      return;
    }
    const stats = quizStats(MISSM_STATS_KEY);
    const globalStats =
      '<div class="tr-stats">'
      + '<div class="tr-stat"><b>' + stats.attempts + '</b><span>mats joués</span></div>'
      + '<div class="tr-stat"><b>' + stats.correct + '</b><span>conclus</span></div>'
      + '<div class="tr-stat"><b>' + trainerRate(stats.correct, stats.attempts) + '</b><span>taux global</span></div>'
      + '</div>';

    if (missM.state === 'intro') {
      missMPanel.innerHTML =
        '<div class="tr-card"><h3>👑 Miss Mates</h3>'
        + '<p>Stockfish repère dans vos 100 dernières parties chess.com les mats en 1, 2 ou 3 coups '
        + 'que vous avez ratés. Rejouez chaque mat coup par coup — l\'adversaire défend au mieux. '
        + '1 point par mat conclu : note sur ' + MISSM_SIZE + ' à la fin.</p>'
        + globalStats
        + '<button type="button" class="btn btn-primary" data-mm="start">Démarrer · ' + MISSM_SIZE + ' mats</button>'
        + '</div>';
    } else if (missM.state === 'needuser') {
      missMPanel.innerHTML =
        '<div class="tr-card"><h3>👑 Miss Mates</h3>'
        + '<p>Indiquez votre pseudo chess.com : vos 100 dernières parties seront récupérées puis passées au crible.</p>'
        + '<input type="text" id="mm-user" placeholder="ex. hikaru" autocomplete="off" '
        + 'style="padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font-family:inherit;font-size:14px">'
        + '<button type="button" class="btn btn-primary" data-mm="setuser">Analyser mes parties</button>'
        + '</div>';
    } else if (missM.state === 'prep') {
      const pct = Math.round((missM.puzzles.length / MISSM_SIZE) * 100);
      missMPanel.innerHTML =
        '<div class="tr-card"><h3>Recherche de vos mats ratés…</h3>'
        + '<p>Stockfish passe vos parties au crible — ' + missM.gamesScanned + ' partie'
        + plural(missM.gamesScanned) + ' analysée' + plural(missM.gamesScanned) + ' · '
        + missM.puzzles.length + '/' + MISSM_SIZE + ' mat' + plural(missM.puzzles.length)
        + ' raté' + plural(missM.puzzles.length) + ' trouvé' + plural(missM.puzzles.length) + '</p>'
        + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:' + pct + '%"></div></div>'
        + '</div>';
    } else if (missM.state === 'guess' || missM.state === 'feedback') {
      const p = missM.puzzles[missM.index];
      const moveNumber = Math.floor(p.ply / 2) + 1;
      let feedback = '';
      if (missM.state === 'feedback') {
        const r = missM.lastResult;
        const partie = '<small>En partie, vous aviez joué ' + escapeHtml(p.played)
          + ' et le mat en ' + p.mateIn + ' vous avait échappé.</small>';
        feedback = r.ok
          ? '<div class="tr-feedback ok">✓ Échec et mat ! Cette fois, le mat en ' + p.mateIn
            + ' est dans la poche.' + partie + '</div>'
          : '<div class="tr-feedback ko">✗ ' + escapeHtml(r.why)
            + ' La séquence gagnante se rejoue sur l\'échiquier (flèche verte).' + partie + '</div>';
        feedback += '<button type="button" class="btn btn-primary" data-mm="next">'
          + (missM.index + 1 >= missM.puzzles.length ? 'Voir la note' : 'Mat suivant') + '</button>';
      }
      missMPanel.innerHTML =
        '<div class="tr-card">'
        + '<div class="tr-quiz-head"><span class="pos">Mat ' + (missM.index + 1) + ' / '
        + missM.puzzles.length + '</span><span class="score">Note : ' + missM.score + '</span></div>'
        + '<div class="tr-progress-track"><div class="tr-progress-fill" style="width:'
        + Math.round((missM.index / missM.puzzles.length) * 100) + '%"></div></div>'
        + '<p class="tr-meta">Contre ' + escapeHtml(p.opponent) + ' · coup n°' + moveNumber
        + ' · trait aux ' + (p.userColor === 'w' ? 'Blancs' : 'Noirs') + '.</p>'
        + (missM.state === 'guess'
            ? '<p>Vous étiez passé à côté d\'un <b>mat en ' + p.mateIn + '</b>. Cette fois, concluez !</p>'
              + '<button type="button" class="btn btn-secondary" data-mm="hint">💡 Suggestion : quelle pièce jouer ?</button>'
            : '')
        + feedback
        + '</div>';
    } else if (missM.state === 'done') {
      const total = missM.puzzles.length;
      const pct = Math.round((missM.score / total) * 100);
      missMPanel.innerHTML =
        '<div class="tr-card"><h3>Session terminée !</h3>'
        + '<div class="tr-stats">'
        + '<div class="tr-stat"><b>' + missM.score + ' / ' + total + '</b><span>note finale</span></div>'
        + '<div class="tr-stat"><b>' + pct + ' %</b><span>mats conclus</span></div>'
        + '</div>'
        + globalStats
        + '<button type="button" class="btn btn-primary" data-mm="start">Nouvelle session</button>'
        + '</div>';
    } else if (missM.state === 'empty') {
      missMPanel.innerHTML =
        '<div class="tr-card"><h3>Aucun mat raté trouvé 🎉</h3>'
        + '<p>Dans les parties passées au crible, vous n\'avez laissé filer aucun mat en 1 à 3 coups. '
        + 'Réessayez : le tirage des parties est aléatoire.</p>'
        + '<button type="button" class="btn btn-primary" data-mm="start">Réessayer</button>'
        + '</div>';
    } else if (missM.state === 'error') {
      missMPanel.innerHTML =
        '<div class="tr-card"><h3>Impossible de préparer la session</h3>'
        + '<p>' + escapeHtml(missM.error || 'Erreur inconnue.') + '</p>'
        + '<button type="button" class="btn btn-primary" data-mm="start">Réessayer</button>'
        + '</div>';
    }
  }

  missMPanel.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-mm]');
    if (!btn) return;
    const action = btn.dataset.mm;
    if (action === 'start') missMStart();
    else if (action === 'next') missMNext();
    else if (action === 'hint') missMHint();
    else if (action === 'setuser') {
      const input = missMPanel.querySelector('#mm-user');
      const value = (input && input.value.trim()) || '';
      if (!value) return;
      chesscomUsername = value;
      saveChesscomUsername(value);
      missMStart();
    }
  });

  // ---------------------------------------------------- exercices intensifs --

  const exPanelEl = document.getElementById('exercises-panel');
  const exCardsEl = document.getElementById('ex-cards');
  const exToolbarEl = document.getElementById('ex-toolbar');
  const exExplanationEl = document.getElementById('ex-explanation');

  function exList() {
    return exFilter === 'mats' ? EXERCISES.MATS : EXERCISES.FINALES;
  }

  function exSaveDone() {
    localStorage.setItem(EX_STORAGE_KEY, JSON.stringify([...exDone]));
    updateExProgress();
  }

  /** Progression globale des exercices : badge du rail + carte « Progression ». */
  function updateExProgress() {
    const total = EXERCISES.MATS.length + EXERCISES.FINALES.length;
    const done = exDone.size;
    const label = done + '/' + total;
    document.getElementById('ex-progress-badge').textContent = label;
    document.getElementById('progress-count').textContent = label;
    document.getElementById('progress-fill').style.width = Math.round((done / total) * 100) + '%';
    document.getElementById('progress-caption').textContent = done >= total
      ? 'Tous les exercices sont validés, bravo !'
      : 'Encore ' + (total - done) + ' exercice' + (total - done > 1 ? 's' : '') + ' à valider.';
  }

  /** Grille des exercices : titre, difficulté, progression (fait / non fait). */
  function renderExerciseCards() {
    for (const tab of document.querySelectorAll('.ex-tab')) {
      tab.classList.toggle('active', tab.dataset.filter === exFilter);
    }
    exCardsEl.innerHTML = '';
    for (const data of exList()) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ex-card' + (exDone.has(data.id) ? ' done' : '');
      card.innerHTML =
        '<span class="check">' + (exDone.has(data.id) ? '✓' : '') + '</span>'
        + '<span class="infos"><span class="titre">' + data.titre + '</span>'
        + (data.sousTitre ? '<br><span class="sous">' + data.sousTitre + '</span>' : '')
        + '</span>'
        + '<span class="badge-diff ' + data.difficulte + '">' + data.difficulte + '</span>';
      card.addEventListener('click', () => startExercise(data));
      exCardsEl.appendChild(card);
    }
  }

  function startExercise(data) {
    const type = exFilter === 'mats' ? 'mat' : 'finale';
    exCurrent = { type, data };
    exSteps = null;
    clearAnnotations();
    exStepsPanelEl.style.display = 'none';
    clearStepsOverlays();
    exStepsBtn.style.display = exStepsLineOf(data) ? '' : 'none';
    exStep = 0;
    exBusy = false;
    exAutoPlay = false;
    searchToken++;
    botThinking = false;
    thinkingEl.classList.remove('on');

    game = Chess.fromFen(data.fen);
    sanHistory = [];
    lastMove = null;
    selected = -1;
    legalTargets = [];
    gameOver = false;
    exPlayerColor = type === 'finale' ? data.joueur : game.turn;
    orientation = exPlayerColor;

    if (type === 'finale') {
      // Le bot défend l'autre camp à pleine force
      botColor = exPlayerColor === 'w' ? 'b' : 'w';
      botElo = 2200;
      exMessage = exFinaleMessage();
    } else {
      exMessage = trouverLeMatLabel(data);
    }

    exPanelEl.style.display = 'none';
    exToolbarEl.style.display = 'flex';
    exExplanationEl.style.display = 'none';
    movesEl.style.display = '';

    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    renderGame({});
  }

  function trouverLeMatLabel(data) {
    const plies = data.solution.filter((san, i) => i % 2 === 0).length;
    return 'Trouvez le mat en ' + plies + ' coup' + (plies > 1 ? 's' : '')
        + ' (trait aux ' + (exPlayerColor === 'w' ? 'Blancs' : 'Noirs') + ').';
  }

  function exFinaleMessage() {
    const moveNumber = Math.floor(sanHistory.length / 2) + 1;
    return 'Objectif : ' + (exCurrent.data.objectif === 'mat' ? 'gagner (mat)' : 'tenir la nulle')
        + ' · coup ' + moveNumber + ' · règle des 50 coups : ' + Math.floor((100 - game.halfmove) / 2) + ' restants';
  }

  /** Coup attendu du joueur dans la solution du mat (résolu dans la position courante). */
  function exExpectedMove() {
    if (!exCurrent || exStep >= exCurrent.data.solution.length) return null;
    return Pgn.sanToMove(Chess, game, exCurrent.data.solution[exStep]);
  }

  /** Valide le coup du joueur contre la solution (mode « trouve le mat »). */
  function exTryMatMove(from, to, candidates) {
    if (exBusy) return true;
    const expected = exExpectedMove();
    if (!expected) return true;
    if (expected.from === from && expected.to === to) {
      // Bon coup : on joue la version exacte de la solution (promotion comprise)
      exStep++;
      exMessage = '✓ Bien joué !';
      playMove(expected);
      exScheduleReply();
    } else {
      // Mauvais coup : feedback sans appliquer, la position reste intacte
      exMessage = '✗ Ce n\'est pas le bon coup — réessayez. (« Indice » peut aider.)';
      renderStatus();
      boardEl.classList.add('ex-feedback-bad');
      setTimeout(() => boardEl.classList.remove('ex-feedback-bad'), 320);
      selected = -1;
      legalTargets = [];
      refreshHighlights(game.board, Chess.statusOf(game).check ? game.turn : null);
      void candidates;
    }
    return true;
  }

  /** Joue la réponse adverse scriptée après ~450 ms. */
  function exScheduleReply() {
    if (!exCurrent || exCurrent.type !== 'mat') return;
    if (exStep >= exCurrent.data.solution.length) return; // solution terminée
    exBusy = true;
    setTimeout(() => {
      if (!exCurrent || mode !== 'exercises') return;
      const reply = exExpectedMove();
      exBusy = false;
      if (reply) {
        exStep++;
        exMessage = 'À vous : trouvez la suite.';
        playMove(reply);
      }
    }, 450);
  }

  /** Fin de partie en mode exercices : succès ou échec selon l'objectif. */
  function exOnGameOver(status) {
    const data = exCurrent.data;
    let success;
    if (exCurrent.type === 'mat') {
      success = status.reason === 'échec et mat'
          && status.result === (exPlayerColor === 'w' ? '1-0' : '0-1');
    } else if (data.objectif === 'mat') {
      success = status.result === (exPlayerColor === 'w' ? '1-0' : '0-1');
    } else {
      // Objectif nulle : la nulle suffit, gagner est encore mieux
      success = status.result === '1/2-1/2'
          || status.result === (exPlayerColor === 'w' ? '1-0' : '0-1');
    }
    if (success && !exAutoPlay) {
      exDone.add(data.id);
      exSaveDone();
      exMessage = '✓ Exercice réussi !';
    } else if (success) {
      exMessage = 'Solution jouée — à vous de la refaire !';
    } else {
      exMessage = '✗ Objectif manqué — recommencez.';
    }
    renderStatus();

    const modal = openModal(
      '<h2 style="text-align:center">' + (success ? (exAutoPlay ? 'Solution terminée' : '🎉 Bravo !') : 'Raté…') + '</h2>'
      + '<p class="reason">' + (success
          ? 'Exercice réussi : ' + reasonLabel(status.reason).toLowerCase() + '.'
          : 'Résultat : ' + reasonLabel(status.reason).toLowerCase()
            + '. Objectif : ' + (exCurrent.type === 'mat' || data.objectif === 'mat' ? 'mat' : 'nulle') + '.') + '</p>'
      + '<div class="actions">'
      + (success
          ? '<button type="button" class="btn btn-primary" id="ex-modal-next">Exercice suivant</button>'
          : '<button type="button" class="btn btn-primary" id="ex-modal-retry">Recommencer</button>')
      + '<button type="button" class="btn btn-secondary" id="ex-modal-close">Fermer</button>'
      + '</div>');
    const nextBtn = modal.querySelector('#ex-modal-next');
    if (nextBtn) nextBtn.addEventListener('click', () => { closeModal(); exNavigate(1); });
    const retryBtn = modal.querySelector('#ex-modal-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => { closeModal(); startExercise(data); });
    modal.querySelector('#ex-modal-close').addEventListener('click', closeModal);
  }

  /** Exercice précédent / suivant dans la liste filtrée courante. */
  function exNavigate(delta) {
    if (!exCurrent) return;
    const list = exList();
    const index = list.findIndex(e => e.id === exCurrent.data.id);
    const next = list[(index + delta + list.length) % list.length];
    startExercise(next);
  }

  /** Indice : premier coup à jouer (mats) ou conseil textuel (finales). */
  function exShowHint() {
    if (!exCurrent) return;
    if (exCurrent.type === 'mat') {
      const expected = exExpectedMove();
      if (!expected) return;
      exMessage = 'Indice : jouez ' + Chess.sanOf(game, expected) + '.';
      renderStatus();
      squares[expected.from].classList.add('hint-move');
      squares[expected.to].classList.add('hint-move');
      setTimeout(() => {
        squares[expected.from].classList.remove('hint-move');
        squares[expected.to].classList.remove('hint-move');
      }, 2200);
    } else {
      exShowTextPanel('Indice', '<p>' + exCurrent.data.indice + '</p>');
    }
  }

  /** Solution : déroule la ligne (mats) ou affiche le plan (finales). */
  function exShowSolution() {
    if (!exCurrent || exBusy) return;
    if (exCurrent.type === 'finale') {
      exShowTextPanel('Plan de la solution', '<p>' + exCurrent.data.plan + '</p>');
      return;
    }
    // Redémarre proprement puis rejoue toute la ligne, animée
    startExercise(exCurrent.data);
    exAutoPlay = true;
    exBusy = true;
    exMessage = 'Solution : ' + exCurrent.data.solution.join(' ');
    renderStatus();
    const sans = exCurrent.data.solution;
    let index = 0;
    const playNext = () => {
      if (mode !== 'exercises' || !exCurrent || index >= sans.length) { exBusy = false; return; }
      const move = Pgn.sanToMove(Chess, game, sans[index]);
      if (!move) { exBusy = false; return; }
      index++;
      exStep = index;
      playMove(move);
      if (index < sans.length) setTimeout(playNext, 650);
      else exBusy = false;
    };
    setTimeout(playNext, 400);
  }

  /** Panneau refermable (accordéon) au style de l'application. */
  function exShowTextPanel(titre, corpsHtml) {
    exExplanationEl.innerHTML =
      '<div class="ex-exp-head"><span>' + titre + '</span>'
      + '<button type="button" class="ex-exp-close" aria-label="Fermer">✕ fermer</button></div>'
      + corpsHtml;
    exExplanationEl.style.display = 'block';
    exExplanationEl.querySelector('.ex-exp-close')
        .addEventListener('click', () => { exExplanationEl.style.display = 'none'; });
  }

  /** 💡 Explication pédagogique : 4 rubriques, masquée par défaut. */
  function exToggleExplanation() {
    if (!exCurrent) return;
    if (exExplanationEl.style.display === 'block') {
      exExplanationEl.style.display = 'none';
      return;
    }
    const exp = exCurrent.data.explication;
    exShowTextPanel('💡 ' + exCurrent.data.titre,
      '<h4>L\'idée générale</h4><p>' + exp.idee + '</p>'
      + '<h4>Le mécanisme</h4><p>' + exp.mecanisme + '</p>'
      + '<h4>Comment le reconnaître en partie réelle</h4><p>' + exp.reconnaitre + '</p>'
      + '<h4>L\'erreur typique à éviter</h4><p>' + exp.erreur + '</p>');
  }

  // ------------------------------------------- étapes de résolution (visuel) --
  // Rejoue la ligne (solution du mat ou démo de finale) coup par coup en
  // colorant l'échiquier : rouge = cases contrôlées par l'attaquant,
  // bleu = cases où le roi défenseur peut encore aller, flèche = prochain coup.

  const exStepsPanelEl = document.getElementById('ex-steps-panel');
  const exStepsBtn = document.getElementById('ex-steps');

  function exStepsLineOf(data) {
    return data.solution || data.demo || null;
  }

  function enterExSteps() {
    if (!exCurrent) return;
    const line = exStepsLineOf(exCurrent.data);
    if (!line) return;
    searchToken++;
    botThinking = false;
    thinkingEl.classList.remove('on');
    closePromotionPicker();
    const start = Chess.fromFen(exCurrent.data.fen);
    // Camp dont on visualise la couverture (rouge) : l'attaquant réel —
    // le joueur pour les mats et les finales gagnantes, son adversaire pour
    // les finales défensives — sauf indication contraire (demoCouleur).
    let attacker = start.turn;
    if (exCurrent.type === 'finale') {
      attacker = exCurrent.data.objectif === 'mat'
        ? exCurrent.data.joueur
        : Chess.opposite(exCurrent.data.joueur);
      if (exCurrent.data.demoCouleur) attacker = exCurrent.data.demoCouleur;
    }
    exSteps = {
      line,
      ply: 0,
      startTurn: start.turn,
      attacker,
      showCovered: false,           // cases rouges masquées par défaut (option)
      finCaption: exCurrent.data.demoFin || null
    };
    document.getElementById('ex-steps-covered').checked = false;
    exToolbarEl.style.display = 'none';
    exExplanationEl.style.display = 'none';
    movesEl.style.display = 'none';
    exStepsPanelEl.style.display = 'flex';
    exMessage = 'Étapes de résolution — avancez avec « Suivante ».';
    exStepsGoto(0);
  }

  function quitExSteps(restart) {
    exSteps = null;
    exStepsPanelEl.style.display = 'none';
    clearStepsOverlays();
    if (restart && exCurrent) startExercise(exCurrent.data);
  }

  function exStepsGoto(ply) {
    exSteps.ply = Math.max(0, Math.min(ply, exSteps.line.length));
    game = Chess.fromFen(exCurrent.data.fen);
    sanHistory = [];
    lastMove = null;
    selected = -1;
    legalTargets = [];
    for (let i = 0; i < exSteps.ply; i++) {
      const move = Pgn.sanToMove(Chess, game, exSteps.line[i]);
      sanHistory.push(exSteps.line[i]);
      lastMove = { from: move.from, to: move.to };
      Chess.play(game, move);
    }
    renderGame({});
    renderStepsOverlays();
    renderStepsPanel();
  }

  function clearStepsOverlays() {
    for (const el of squares) el.querySelectorAll('.ov').forEach(n => n.remove());
    const arrow = document.getElementById('steps-arrow');
    if (arrow) arrow.remove();
  }

  /** Cases où le roi défenseur peut aller : voisines, non occupées par son camp,
      non contrôlées (roi retiré du plateau pour couvrir les cases « derrière » lui). */
  function defenderKingFreeSquares(att) {
    const def = Chess.opposite(att);
    const dk = Chess.kingSquare(game, def);
    const ghost = Chess.fromFen(Chess.toFen(game));
    ghost.board[dk] = null;
    const free = [];
    const r = (dk / 8) | 0, f = dk % 8;
    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const nr = r + dr, nf = f + df;
        if (nr < 0 || nr > 7 || nf < 0 || nf > 7) continue;
        const n = nr * 8 + nf;
        const piece = game.board[n];
        if (piece !== null && Chess.colorOf(piece) === def) continue;
        if (!Chess.attacked(ghost, n, att)) free.push(n);
      }
    }
    return free;
  }

  function renderStepsOverlays() {
    clearStepsOverlays();
    const att = exSteps.attacker;
    // Cases contrôlées par l'attaquant (la « barrière ») — sur option uniquement
    if (exSteps.showCovered) {
      for (let sq = 0; sq < 64; sq++) {
        if (Chess.attacked(game, sq, att)) {
          const ov = document.createElement('div');
          ov.className = 'ov ov-covered';
          squares[sq].appendChild(ov);
        }
      }
    }
    // Cases restantes du roi défenseur
    for (const sq of defenderKingFreeSquares(att)) {
      const ov = document.createElement('div');
      ov.className = 'ov ov-free';
      squares[sq].appendChild(ov);
    }
    // Flèche du prochain coup
    if (exSteps.ply < exSteps.line.length) {
      const next = Pgn.sanToMove(Chess, game, exSteps.line[exSteps.ply]);
      if (next) drawStepsArrow(next.from, next.to);
    }
  }

  /** Flèche superposée à l'échiquier (étapes : orange, meilleur coup : vert). */
  function drawArrow(from, to, color, id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.id = id;
    svg.setAttribute('class', 'steps-arrow');
    svg.setAttribute('viewBox', '0 0 8 8');
    const x1 = viewCol(from) + 0.5, y1 = viewRow(from) + 0.5;
    const x2 = viewCol(to) + 0.5, y2 = viewRow(to) + 0.5;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const hx = x2 - ux * 0.42, hy = y2 - uy * 0.42; // base de la pointe
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x1 + ux * 0.28);
    line.setAttribute('y1', y1 + uy * 0.28);
    line.setAttribute('x2', hx);
    line.setAttribute('y2', hy);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '0.2');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
    const px = -uy, py = ux; // perpendiculaire
    const head = document.createElementNS(NS, 'polygon');
    head.setAttribute('points',
      (x2 - ux * 0.06) + ',' + (y2 - uy * 0.06) + ' '
      + (hx + px * 0.2) + ',' + (hy + py * 0.2) + ' '
      + (hx - px * 0.2) + ',' + (hy - py * 0.2));
    head.setAttribute('fill', color);
    svg.appendChild(head);
    boardEl.appendChild(svg);
  }

  function drawStepsArrow(from, to) {
    drawArrow(from, to, 'rgba(240, 154, 32, .9)', 'steps-arrow');
  }

  function renderStepsPanel() {
    const total = exSteps.line.length;
    const i = exSteps.ply;
    document.getElementById('ex-steps-count').textContent = 'Étape ' + i + ' / ' + total;
    document.getElementById('ex-steps-prev').disabled = i === 0;
    document.getElementById('ex-steps-next').disabled = i === total;
    document.getElementById('ex-steps-caption').textContent = stepsCaption();
  }

  function stepsCaption() {
    const att = exSteps.attacker;
    const def = Chess.opposite(att);
    const couleur = def === 'w' ? 'blanc' : 'noir';
    const i = exSteps.ply;
    const total = exSteps.line.length;
    const freeCount = defenderKingFreeSquares(att).length;
    const cases = freeCount + ' case' + (freeCount > 1 ? 's' : '');
    if (i === 0) {
      const joueur = exCurrent.type === 'finale' ? exCurrent.data.joueur : exSteps.startTurn;
      const but = exCurrent.type === 'mat' || exCurrent.data.objectif === 'mat'
        ? 'mater le roi adverse' : 'tenir la nulle';
      return 'Position de départ — objectif des ' + (joueur === 'w' ? 'Blancs' : 'Noirs') + ' : ' + but + '. '
        + 'Le roi ' + couleur + ' dispose de ' + cases
        + ' (en bleu). Suivez la flèche orange.';
    }
    const mover = (i - 1) % 2 === 0 ? exSteps.startTurn : Chess.opposite(exSteps.startTurn);
    const san = exSteps.line[i - 1];
    const status = Chess.statusOf(game);
    let txt = (mover === 'w' ? 'Les Blancs' : 'Les Noirs') + ' jouent ' + san + '.';
    if (status.over) {
      if (status.reason === 'échec et mat') {
        txt += ' Échec et mat : toutes les cases du roi ' + couleur + ' sont couvertes, il n\'y a plus aucune case bleue !';
      } else if (status.reason === 'pat') {
        txt += ' Pat : le roi ' + couleur + ' n\'est pas en échec mais n\'a plus aucun coup légal — partie nulle.';
      } else {
        txt += ' ' + reasonLabel(status.reason) + '.';
      }
    } else if (status.check && game.turn === def) {
      txt += ' Échec ! Le roi ' + couleur + ' doit fuir : il ne lui reste que ' + cases + ' (en bleu).';
    } else if (mover === att) {
      txt += freeCount === 0
        ? ' Le roi ' + couleur + ' n\'a plus aucune case libre : attention au pat, il faut donner échec pour conclure.'
        : ' La cage se referme : il ne reste que ' + cases + ' (en bleu) au roi ' + couleur + '.';
    } else {
      txt += ' La défense répond — le roi ' + couleur + ' dispose de ' + cases + ' (en bleu).';
    }
    if (i === total && exSteps.finCaption) txt += ' ' + exSteps.finCaption;
    return txt;
  }

  exStepsBtn.addEventListener('click', enterExSteps);
  document.getElementById('ex-steps-prev').addEventListener('click', () => exSteps && exStepsGoto(exSteps.ply - 1));
  document.getElementById('ex-steps-next').addEventListener('click', () => exSteps && exStepsGoto(exSteps.ply + 1));
  document.getElementById('ex-steps-quit').addEventListener('click', () => quitExSteps(true));
  document.getElementById('ex-steps-covered').addEventListener('change', (event) => {
    if (!exSteps) return;
    exSteps.showCovered = event.target.checked;
    renderStepsOverlays();
  });

  // Navigation au clavier dans la visionneuse
  document.addEventListener('keydown', (event) => {
    if (!exSteps) return;
    if (event.key === 'ArrowRight') { exStepsGoto(exSteps.ply + 1); event.preventDefault(); }
    else if (event.key === 'ArrowLeft') { exStepsGoto(exSteps.ply - 1); event.preventDefault(); }
    else if (event.key === 'Escape') { quitExSteps(true); }
  });

  // Écouteurs des sous-onglets et de la barre d'outils
  for (const tab of document.querySelectorAll('.ex-tab')) {
    tab.addEventListener('click', () => {
      exFilter = tab.dataset.filter;
      renderExerciseCards();
    });
  }
  document.getElementById('ex-back').addEventListener('click', () => {
    exCurrent = null;
    searchToken++;
    botThinking = false;
    thinkingEl.classList.remove('on');
    switchMode('exercises');
  });
  document.getElementById('ex-prev').addEventListener('click', () => exNavigate(-1));
  document.getElementById('ex-next').addEventListener('click', () => exNavigate(1));
  document.getElementById('ex-restart').addEventListener('click', () => {
    if (exCurrent) startExercise(exCurrent.data);
  });
  document.getElementById('ex-hint').addEventListener('click', exShowHint);
  document.getElementById('ex-solution').addEventListener('click', exShowSolution);
  document.getElementById('ex-explain').addEventListener('click', exToggleExplanation);

  // ------------------------------------------------------------ navigation --

  function switchMode(next) {
    if (exSteps) quitExSteps(false);
    // Re-cliquer « Mes parties » depuis une relecture ramène à la liste
    if (next === 'games' && mode === 'games' && replay) {
      replay = null;
      replayPly = 0;
    }
    // Re-cliquer « Exercices » depuis un exercice ramène à la liste
    if (next === 'exercises' && mode === 'exercises' && exCurrent) {
      exCurrent = null;
    }
    mode = next;
    for (const btn of document.querySelectorAll('.rail-item')) {
      btn.classList.toggle('active', btn.dataset.mode === next);
    }
    closeModal();
    closePromotionPicker();
    clearAnnotations();
    searchToken++; // invalide toute recherche bot en cours
    botThinking = false;
    thinkingEl.classList.remove('on');

    const inGames = next === 'games';
    const inExercises = next === 'exercises';
    const inTrainer = next === 'trainer';
    const inMissP = next === 'misspuzzles';
    const inMissM = next === 'missmates';
    const inConfig = next === 'config';
    const inOpenings = next === 'openings';
    if (!inOpenings) {
      const opArrow = document.getElementById('op-arrow');
      if (opArrow) opArrow.remove();
    }
    for (const id of ['missp-arrow', 'missm-arrow']) {
      const arrow = document.getElementById(id);
      if (arrow) arrow.remove();
    }
    clearMoveBadge();
    clearWeakAlert();
    if (next !== 'games') analysisToken++; // stoppe une analyse Stockfish en cours
    // Quitter le trainer pendant la préparation annule la recherche en cours
    if (!inTrainer && trainer && trainer.state === 'prep') {
      trainer = null;
      trainerRequestId++;
      renderTrainerPanel();
    }
    // Idem pour Miss Puzzles et Miss Mates
    if (!inMissP && missP && missP.state === 'prep') {
      missP = null;
      trainerRequestId++;
      renderMissPPanel();
    }
    if (!inMissM && missM && missM.state === 'prep') {
      missM = null;
      missMToken++;
      renderMissMPanel();
    }
    gamesPanel.style.display = inGames && !replay ? 'block' : 'none';
    movesEl.style.display = (inGames && !replay) || (inExercises && !exCurrent) || inTrainer || inMissP || inMissM || inConfig || inOpenings ? 'none' : '';
    replayNav.style.display = inGames && replay ? 'flex' : 'none';
    btnAnalyze.style.display = inGames && replay ? '' : 'none';
    btnUndo.style.display = inGames ? 'none' : '';
    graphWrap.style.display = inGames && replay && replay.evals ? 'block' : 'none';
    analysisSummary.textContent = '';
    btnNew.textContent = inGames ? 'Importer' : 'Nouvelle partie';
    // Panneaux des exercices, du trainer et de la configuration
    document.getElementById('exercises-panel').style.display = inExercises && !exCurrent ? 'block' : 'none';
    document.getElementById('ex-toolbar').style.display = inExercises && exCurrent ? 'flex' : 'none';
    document.getElementById('ex-explanation').style.display = 'none';
    document.getElementById('controls').style.display = inExercises || inTrainer || inMissP || inMissM || inConfig || inOpenings ? 'none' : 'flex';
    trainerPanel.style.display = inTrainer ? 'flex' : 'none';
    missPPanel.style.display = inMissP ? 'flex' : 'none';
    missMPanel.style.display = inMissM ? 'flex' : 'none';
    configPanel.style.display = inConfig ? 'flex' : 'none';
    openingsPanel.style.display = inOpenings ? 'flex' : 'none';
    moveExplainEl.style.display = 'none';
    hideSignalsPanel();

    if (next === 'two') {
      startGame('w');
    } else if (next === 'bot') {
      showBotConfigModal();
    } else if (next === 'config') {
      startGame('w');
      renderConfigPanel(null, null);
      renderStatus();
    } else if (next === 'openings') {
      if (opState.ligne) {
        orientation = opState.opening.couleur;
        placeSquares();
        for (const el of pieceEls.values()) el.remove();
        pieceEls.clear();
        opGoto(opState.ply);
      } else {
        startGame(opState.couleur);
        renderOpeningsPanel();
      }
      renderStatus();
    } else if (next === 'trainer') {
      // Arriver sur le mode démarre toujours une nouvelle session : l'état
      // précédent (quiz en cours ou terminé) est abandonné
      trainer = { state: 'intro' };
      trainerRequestId++;
      startGame('w');
      renderTrainerPanel();
      renderStatus();
    } else if (next === 'misspuzzles') {
      missP = { state: 'intro' };
      trainerRequestId++;
      startGame('w');
      renderMissPPanel();
      renderStatus();
    } else if (next === 'missmates') {
      missM = { state: 'intro' };
      missMToken++;
      startGame('w');
      renderMissMPanel();
      renderStatus();
    } else if (next === 'exercises') {
      if (exCurrent) {
        // Réoriente côté joueur : un autre mode a pu retourner l'échiquier
        orientation = exPlayerColor;
        placeSquares();
        renderGame({});
      } else {
        startGame('w');
        renderExerciseCards();
        renderStatus();
      }
    } else {
      if (replay) {
        // Réoriente côté joueur : un autre mode a pu retourner l'échiquier
        orientation = replay.userColor;
        placeSquares();
        gotoPly(replayPly);
      }
      else {
        startGame('w');
        renderStatus();
        if (gamesList.length > 0) { gamesPanel.style.display = 'block'; movesEl.style.display = 'none'; renderGamesList(); }
        else showImportModal();
      }
    }
    updateSignalsButton();
    updateEvalBar();
  }

  for (const btn of document.querySelectorAll('.rail-item')) {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  }

  // ------------------------------------------------------------- contrôles --

  btnNew.addEventListener('click', newGameFlow);

  btnUndo.addEventListener('click', () => {
    if (mode === 'games' || sanHistory.length === 0) return;
    if (mode === 'bot') {
      // Annule jusqu'au trait du joueur (2 demi-coups si le bot a répondu)
      searchToken++; // abandonne une éventuelle recherche en cours
      botThinking = false;
      thinkingEl.classList.remove('on');
      let undone = 0;
      while (sanHistory.length > 0 && (undone === 0 || game.turn === botColor)) {
        Chess.undo(game);
        sanHistory.pop();
        undone++;
        if (undone > 2) break;
      }
    } else {
      Chess.undo(game);
      sanHistory.pop();
    }
    lastMove = null;
    selected = -1;
    legalTargets = [];
    gameOver = false;
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    renderGame({});
  });

  btnFlip.addEventListener('click', () => {
    orientation = orientation === 'w' ? 'b' : 'w';
    placeSquares();
    for (const el of pieceEls.values()) el.remove();
    pieceEls.clear();
    if (mode === 'games' && replay) gotoPly(replayPly);
    else renderGame({});
    redrawAnnotations(); // les centres des flèches dépendent de l'orientation
  });

  btnAnalyze.addEventListener('click', startAnalysis);

  window.addEventListener('resize', () => { fitBoard(); });

  // ---------------------------------------------------------------- départ --

  document.getElementById('user-avatar').textContent = (PSEUDO[0] || '?');
  applyAppearance();
  updateExProgress();
  buildBoard();
  fitBoard();
  startGame('w');

  // Précharge Stockfish (wasm ~7 Mo) en tâche de fond une fois l'app posée :
  // la première analyse démarre alors instantanément (fichier en cache + worker prêt).
  setTimeout(() => {
    const warm = () => { if (window.SfEngine) SfEngine.ready(); };
    if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 10000 });
    else warm();
  }, 2500);
})();
