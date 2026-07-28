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

  // Réglages persistés : sons, aides (badges, alertes, explications)
  // et moteur d'analyse ('stockfish' | 'maison')
  const SETTINGS_KEY = 'echecs360-reglages';
  let settings = Object.assign({ sons: true, aides: true, moteur: 'stockfish' },
      JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  const EX_STORAGE_KEY = 'echecs360-exercices-faits';
  let exDone = new Set(JSON.parse(localStorage.getItem(EX_STORAGE_KEY) || '[]'));

  const squares = [];             // 64 éléments .sq (ordre index moteur)
  const pieceEls = new Map();     // index case → élément .piece

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
    const size = Math.max(320, Math.min(zone.clientHeight - 96, zone.clientWidth - 24));
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
      setTimeout(() => syncPieces(game.board), 190);
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

  /** Tente de jouer de `from` vers `to` (gère le choix de promotion). */
  function tryMove(from, to) {
    const candidates = legalTargets.filter(m => m.from === from && m.to === to);
    if (candidates.length === 0) return false;
    // Blunder Trainer : le coup est une réponse au quiz, pas une partie
    if (mode === 'trainer') {
      if (trainer && trainer.state === 'guess') return trainerTryMove(from, to, candidates);
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

  // -------------------------------------------------- interactions (clic + drag) --

  let dragging = null; // { el, from, moved, startX, startY }

  function humanCanMove() {
    if (gameOver || mode === 'games' || exSteps) return false;
    if (mode === 'bot') return !botThinking && game.turn !== botColor;
    if (mode === 'exercises') {
      return exCurrent !== null && !exBusy && !botThinking && game.turn === exPlayerColor;
    }
    if (mode === 'trainer') return trainer !== null && trainer.state === 'guess';
    if (mode === 'openings') return false;
    return true;
  }

  boardEl.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
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
    if (over >= 0 && legalTargets.some(m => m.to === over)) {
      squares[over].classList.add('drag-over');
    }
  });

  boardEl.addEventListener('pointerup', (event) => {
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
      + '<label>Votre couleur</label>'
      + '<div class="color-choice">'
      + '<button type="button" data-color="w" class="selected">Blancs</button>'
      + '<button type="button" data-color="random">Aléatoire</button>'
      + '<button type="button" data-color="b">Noirs</button>'
      + '</div></div>'
      + '<div class="actions">'
      + '<button type="button" class="btn btn-primary" id="bot-start">Commencer</button>'
      + '</div>');
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
      elo: botElo
    });
    worker._pending = { token, startedAt };
  }

  function onWorkerMessage(event) {
    const msg = event.data;
    if (msg.type === 'move') {
      const pending = worker._pending || { token: -1, startedAt: 0 };
      if (pending.token !== searchToken) return; // recherche annulée
      // Rythme naturel : réponse jamais avant 500 ms
      const wait = Math.max(0, 500 - (Date.now() - pending.startedAt));
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
    } else if (msg.type === 'blunders') {
      onBlundersFound(msg);
    }
  }

  // -------------------------------------------------- démarrage de partie --

  function startGame(bottomColor) {
    game = Chess.newGame();
    sanHistory = [];
    lastMove = null;
    selected = -1;
    legalTargets = [];
    gameOver = false;
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
    orientation = replay.userColor; // échiquier orienté du côté de l'utilisateur
    placeSquares();
    gamesPanel.style.display = 'none';
    movesEl.style.display = '';
    replayNav.style.display = 'flex';
    btnAnalyze.style.display = '';
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
    if (!replay || replay.evals) return;
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
    // Analyse de chaque position : MultiPV 5, profondeur 18 bornée en temps
    const infos = [];
    for (let i = 0; i < fens.length; i++) {
      if (token !== analysisToken || !replay) return;
      const pos = Chess.fromFen(fens[i]);
      const status = Chess.statusOf(pos);
      if (status.over) {
        infos.push({ over: true, result: status.result, lines: [] });
      } else {
        const lines = await SfEngine.analyze(fens[i], { multipv: 5, movetime: 450, depth: 18 });
        if (token !== analysisToken || !replay) return;
        infos.push({ over: false, lines: lines || [] });
      }
      analysisProgress.textContent = 'Analyse Stockfish… ' + Math.round(((i + 1) / fens.length) * 100) + ' %';
    }
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
    analysisSummary.innerHTML =
      'Blancs : ' + counts.w.blunder + ' gaffe' + plural(counts.w.blunder)
      + ' · ' + counts.w.mistake + ' erreur' + plural(counts.w.mistake)
      + ' · ' + counts.w.inaccuracy + ' imprécision' + plural(counts.w.inaccuracy) + '<br>'
      + 'Noirs : ' + counts.b.blunder + ' gaffe' + plural(counts.b.blunder)
      + ' · ' + counts.b.mistake + ' erreur' + plural(counts.b.mistake)
      + ' · ' + counts.b.inaccuracy + ' imprécision' + plural(counts.b.inaccuracy)
      + '<br><span style="color:var(--green);font-weight:700">Analyse Stockfish 18 · MultiPV 5</span>';
    graphWrap.style.display = 'block';
    renderMoves(replay.sans, replayPly, cls);
    drawEvalGraph();
    updateEvalBar();
    gotoPly(replayPly);
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
    analysisSummary.innerHTML =
      'Blancs : ' + counts.w.blunder + ' gaffe' + plural(counts.w.blunder)
      + ' · ' + counts.w.mistake + ' erreur' + plural(counts.w.mistake)
      + ' · ' + counts.w.inaccuracy + ' imprécision' + plural(counts.w.inaccuracy) + '<br>'
      + 'Noirs : ' + counts.b.blunder + ' gaffe' + plural(counts.b.blunder)
      + ' · ' + counts.b.mistake + ' erreur' + plural(counts.b.mistake)
      + ' · ' + counts.b.inaccuracy + ' imprécision' + plural(counts.b.inaccuracy);
    graphWrap.style.display = 'block';
    renderMoves(replay.sans, replayPly, cls);
    drawEvalGraph();
    updateEvalBar();
  }

  function plural(n) { return n > 1 ? 's' : ''; }

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
  }

  function updateSignalsButton() {
    const available = (mode === 'games' && replay)
        || (mode === 'trainer' && trainer && (trainer.state === 'guess' || trainer.state === 'feedback'));
    btnSignals.style.display = available ? '' : 'none';
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
    // Ordre aléatoire des parties : les positions varient à chaque session
    trainer.order = [...Array(gamesList.length).keys()];
    for (let i = trainer.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trainer.order[i], trainer.order[j]] = [trainer.order[j], trainer.order[i]];
    }
    trainerScanNext();
  }

  /** Analyse la partie suivante (dans le worker) jusqu'à avoir 10 positions. */
  function trainerScanNext() {
    if (!trainer || trainer.state !== 'prep') return;
    // Au plus 40 parties analysées par session : la préparation reste courte
    if (trainer.puzzles.length >= TRAINER_SIZE || trainer.oi >= trainer.order.length
        || trainer.gamesScanned >= 40) {
      trainerBegin();
      return;
    }
    const g = gamesList[trainer.order[trainer.oi++]];
    const meIsWhite = (g.white.username || '').toLowerCase() === chesscomUsername.toLowerCase();
    const parsed = Pgn.parsePgn(g.pgn || '');
    if (parsed.sans.length < 10) { trainerScanNext(); return; }
    trainer.currentGame = {
      sans: parsed.sans,
      userColor: meIsWhite ? 'w' : 'b',
      opponent: (meIsWhite ? g.black.username : g.white.username) || 'Adversaire'
    };
    const requestId = ++trainerRequestId;
    trainer.requestId = requestId;
    ensureWorker().postMessage({
      type: 'blunders', sans: parsed.sans,
      userColor: trainer.currentGame.userColor, requestId
    });
    renderTrainerPanel();
  }

  function onBlundersFound(msg) {
    if (!trainer || trainer.state !== 'prep' || msg.requestId !== trainer.requestId) return;
    const found = msg.items.slice();
    // Au plus 2 positions par partie, pour varier les contextes
    while (found.length > 2) found.splice(Math.floor(Math.random() * found.length), 1);
    for (const item of found) {
      if (trainer.puzzles.length >= TRAINER_SIZE) break;
      trainer.puzzles.push({
        ...item,
        sans: trainer.currentGame.sans,
        userColor: trainer.currentGame.userColor,
        opponent: trainer.currentGame.opponent
      });
    }
    trainer.gamesScanned++;
    trainerScanNext();
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
    trainerReplayPrefix(p);
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

  /** Position du puzzle rejouée dans `game` (préfixe de la partie). */
  function trainerReplayPrefix(p) {
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
        trainerReplayPrefix(p);
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
    searchToken++; // invalide toute recherche bot en cours
    botThinking = false;
    thinkingEl.classList.remove('on');

    const inGames = next === 'games';
    const inExercises = next === 'exercises';
    const inTrainer = next === 'trainer';
    const inConfig = next === 'config';
    const inOpenings = next === 'openings';
    if (!inOpenings) {
      const opArrow = document.getElementById('op-arrow');
      if (opArrow) opArrow.remove();
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
    gamesPanel.style.display = inGames && !replay ? 'block' : 'none';
    movesEl.style.display = (inGames && !replay) || (inExercises && !exCurrent) || inTrainer || inConfig || inOpenings ? 'none' : '';
    replayNav.style.display = inGames && replay ? 'flex' : 'none';
    btnAnalyze.style.display = inGames && replay ? '' : 'none';
    btnUndo.style.display = inGames ? 'none' : '';
    graphWrap.style.display = inGames && replay && replay.evals ? 'block' : 'none';
    analysisSummary.textContent = inGames && replay && replay.evals ? analysisSummary.textContent : '';
    btnNew.textContent = inGames ? 'Importer' : 'Nouvelle partie';
    // Panneaux des exercices, du trainer et de la configuration
    document.getElementById('exercises-panel').style.display = inExercises && !exCurrent ? 'block' : 'none';
    document.getElementById('ex-toolbar').style.display = inExercises && exCurrent ? 'flex' : 'none';
    document.getElementById('ex-explanation').style.display = 'none';
    document.getElementById('controls').style.display = inExercises || inTrainer || inConfig || inOpenings ? 'none' : 'flex';
    trainerPanel.style.display = inTrainer ? 'flex' : 'none';
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
      if (trainer && trainer.state === 'guess') {
        trainerShowPuzzle();
      } else if (trainer && trainer.state === 'feedback') {
        trainerNext();
      } else {
        if (!trainer || (trainer.state !== 'done' && trainer.state !== 'empty' && trainer.state !== 'error')) {
          trainer = { state: 'intro' };
        }
        startGame('w');
        renderTrainerPanel();
        renderStatus();
      }
    } else if (next === 'exercises') {
      if (exCurrent) {
        renderGame({});
      } else {
        startGame('w');
        renderExerciseCards();
        renderStatus();
      }
    } else {
      if (replay) { gotoPly(replayPly); }
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
  });

  btnAnalyze.addEventListener('click', startAnalysis);

  window.addEventListener('resize', () => { fitBoard(); });

  // ---------------------------------------------------------------- départ --

  document.getElementById('user-avatar').textContent = (PSEUDO[0] || '?');
  updateExProgress();
  buildBoard();
  fitBoard();
  startGame('w');
})();
