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
  const EX_STORAGE_KEY = 'echecs360-exercices-faits';
  let exDone = new Set(JSON.parse(localStorage.getItem(EX_STORAGE_KEY) || '[]'));

  const squares = [];             // 64 éléments .sq (ordre index moteur)
  const pieceEls = new Map();     // index case → élément .piece

  // ------------------------------------------------------------------ sons --

  let audioCtx = null;
  function beep(freq, duration, type, gainValue) {
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
    if (gameOver || mode === 'games') return false;
    if (mode === 'bot') return !botThinking && game.turn !== botColor;
    if (mode === 'exercises') {
      return exCurrent !== null && !exBusy && !botThinking && game.turn === exPlayerColor;
    }
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
      userColor: meIsWhite ? 'w' : 'b', evals: null, cls: null
    };
    replayPly = 0;
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

  function startAnalysis() {
    if (!replay || replay.evals) return;
    btnAnalyze.disabled = true;
    analysisProgress.style.display = 'block';
    analysisProgress.textContent = 'Analyse en cours… 0 %';
    ensureWorker().postMessage({ type: 'analyze', sans: replay.sans });
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
  }

  function plural(n) { return n > 1 ? 's' : ''; }

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
    gamesPanel.style.display = inGames && !replay ? 'block' : 'none';
    movesEl.style.display = (inGames && !replay) || (inExercises && !exCurrent) ? 'none' : '';
    replayNav.style.display = inGames && replay ? 'flex' : 'none';
    btnAnalyze.style.display = inGames && replay ? '' : 'none';
    btnUndo.style.display = inGames ? 'none' : '';
    graphWrap.style.display = inGames && replay && replay.evals ? 'block' : 'none';
    analysisSummary.textContent = inGames && replay && replay.evals ? analysisSummary.textContent : '';
    btnNew.textContent = inGames ? 'Importer' : 'Nouvelle partie';
    // Panneaux des exercices
    document.getElementById('exercises-panel').style.display = inExercises && !exCurrent ? 'block' : 'none';
    document.getElementById('ex-toolbar').style.display = inExercises && exCurrent ? 'flex' : 'none';
    document.getElementById('ex-explanation').style.display = 'none';
    document.getElementById('controls').style.display = inExercises ? 'none' : 'flex';

    if (next === 'two') {
      startGame('w');
    } else if (next === 'bot') {
      showBotConfigModal();
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
