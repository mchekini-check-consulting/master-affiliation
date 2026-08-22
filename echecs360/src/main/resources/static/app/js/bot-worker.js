/*
 * Échecs360 — Web Worker : moteur de jeu du bot et analyse de parties.
 *
 * Recherche : negamax alpha-bêta + quiescence sur les captures,
 * évaluation matériel + tables de position (évaluation simplifiée de
 * Michniewski), tri des coups MVV-LVA.
 *
 * L'Elo (400–2200) module trois curseurs :
 *  - la profondeur de recherche (1 à 5) ;
 *  - la température softmax de sélection parmi les coups proches du meilleur
 *    (~200 cp à 400 Elo → ~8 cp à 2200) ;
 *  - la probabilité d'un coup aléatoire (~18 % à 400 Elo, 0 dès 1300).
 *
 * Messages reçus :
 *  { type:'search', position, elo }        → { type:'move', move }
 *  { type:'analyze', sans }                → progression + { type:'analysis', evals }
 *  { type:'blunders', sans, userColor, requestId }
 *      → { type:'blunders', requestId, items } (Blunder Trainer :
 *        gaffes/erreurs du joueur avec meilleur coup et coups acceptés)
 */
'use strict';

importScripts('engine.js');
importScripts('pgn.js');

// ------------------------------------------------------------- évaluation --

const PIECE_VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

/* Tables de position (perspective blanche, index 0 = a8) —
   évaluation simplifiée de Tomasz Michniewski. */
const PST = {
  P: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
  ],
  N: [
   -50,-40,-30,-30,-30,-30,-40,-50,
   -40,-20,  0,  0,  0,  0,-20,-40,
   -30,  0, 10, 15, 15, 10,  0,-30,
   -30,  5, 15, 20, 20, 15,  5,-30,
   -30,  0, 15, 20, 20, 15,  0,-30,
   -30,  5, 10, 15, 15, 10,  5,-30,
   -40,-20,  0,  5,  5,  0,-20,-40,
   -50,-40,-30,-30,-30,-30,-40,-50
  ],
  B: [
   -20,-10,-10,-10,-10,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5, 10, 10,  5,  0,-10,
   -10,  5,  5, 10, 10,  5,  5,-10,
   -10,  0, 10, 10, 10, 10,  0,-10,
   -10, 10, 10, 10, 10, 10, 10,-10,
   -10,  5,  0,  0,  0,  0,  5,-10,
   -20,-10,-10,-10,-10,-10,-10,-20
  ],
  R: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
  ],
  Q: [
   -20,-10,-10, -5, -5,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
     0,  0,  5,  5,  5,  5,  0, -5,
   -10,  5,  5,  5,  5,  5,  0,-10,
   -10,  0,  5,  0,  0,  0,  0,-10,
   -20,-10,-10, -5, -5,-10,-10,-20
  ],
  K: [
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -20,-30,-30,-40,-40,-30,-30,-20,
   -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
  ]
};

/** Évaluation statique en centipions, du point de vue du camp au trait. */
function evaluate(s) {
  let score = 0; // perspective Blancs
  for (let i = 0; i < 64; i++) {
    const piece = s.board[i];
    if (piece === null) continue;
    const type = piece.toUpperCase();
    if (piece === type) {
      score += PIECE_VALUES[type] + PST[type][i];
    } else {
      // Noirs : table miroir verticale (l'index 0 est déjà a8)
      const mirror = (7 - ((i / 8) | 0)) * 8 + (i % 8);
      score -= PIECE_VALUES[type] + PST[type][mirror];
    }
  }
  return s.turn === Chess.WHITE ? score : -score;
}

// --------------------------------------------------------------- recherche --

/** Tri MVV-LVA : victime la plus chère d'abord, agresseur le moins cher. */
function orderMoves(moves) {
  return moves.sort((a, b) => scoreMove(b) - scoreMove(a));
}
function scoreMove(m) {
  if (!m.capture) return 0;
  const victim = PIECE_VALUES[m.capture.toUpperCase()] || 0;
  const attacker = PIECE_VALUES[m.piece.toUpperCase()] || 0;
  return 10000 + victim * 10 - attacker;
}

const MATE = 100000;

/** Quiescence : ne considère que les captures pour stabiliser l'évaluation. */
function quiescence(s, alpha, beta) {
  const standPat = evaluate(s);
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  const captures = orderMoves(Chess.legalMoves(s).filter(m => m.capture));
  for (const move of captures) {
    Chess.playFast(s, move);
    const score = -quiescence(s, -beta, -alpha);
    Chess.undoFast(s);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(s, depth, alpha, beta) {
  const moves = Chess.legalMoves(s);
  if (moves.length === 0) {
    // Mat (préférer les mats rapides) ou pat
    return Chess.inCheck(s, s.turn) ? -MATE - depth : 0;
  }
  if (s.halfmove >= 100) return 0;
  if (depth === 0) return quiescence(s, alpha, beta);

  orderMoves(moves);
  let best = -Infinity;
  for (const move of moves) {
    Chess.playFast(s, move);
    const score = -negamax(s, depth - 1, -beta, -alpha);
    Chess.undoFast(s);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/** Évalue chaque coup racine (pour la sélection softmax du bot). */
function searchRoot(s, depth) {
  const moves = orderMoves(Chess.legalMoves(s));
  const scored = [];
  let best = -Infinity;
  for (const move of moves) {
    // Borne basse : seuls les coups à moins de ~260 cp du meilleur ont besoin
    // d'un score exact (sélection softmax) ; en dessous, coupure autorisée.
    const floor = best === -Infinity ? -Infinity : best - 260;
    Chess.playFast(s, move);
    const score = -negamax(s, depth - 1, -Infinity, floor === -Infinity ? Infinity : -floor);
    Chess.undoFast(s);
    scored.push({ move, score });
    if (score > best) best = score;
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// -------------------------------------------------- modulation par l'Elo --

function depthForElo(elo) {
  if (elo < 700) return 1;
  if (elo < 1100) return 2;
  if (elo < 1500) return 3;
  if (elo < 1900) return 4;
  return 5;
}

/** Température softmax : ~200 cp à 400 Elo → ~8 cp à 2200. */
function temperatureForElo(elo) {
  const t = (elo - 400) / 1800;
  return Math.max(8, 200 - t * 192);
}

/** Probabilité d'un coup aléatoire : ~18 % à 400 Elo, 0 dès 1300. */
function randomProbForElo(elo) {
  if (elo >= 1300) return 0;
  return 0.18 * (1300 - elo) / 900;
}

/** Choisit le coup du bot : softmax parmi les coups à ≤ 250 cp du meilleur. */
function pickMove(scored, elo) {
  if (Math.random() < randomProbForElo(elo)) {
    return scored[Math.floor(Math.random() * scored.length)].move;
  }
  const best = scored[0].score;
  const candidates = scored.filter(entry => best - entry.score <= 250);
  const temperature = temperatureForElo(elo);
  const weights = candidates.map(entry => Math.exp((entry.score - best) / temperature));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i].move;
  }
  return candidates[candidates.length - 1].move;
}

// ------------------------------------------------- reconstruction d'état --

/** Reconstruit un état moteur depuis la version sérialisée envoyée par l'UI. */
function restoreState(position) {
  const s = Chess.newGame();
  s.board = position.board.slice();
  s.turn = position.turn;
  s.castling = { ...position.castling };
  s.ep = position.ep;
  s.halfmove = position.halfmove;
  s.fullmove = position.fullmove;
  s.history = [];
  s.keys = [];
  return s;
}

// ------------------------------------------------------------- messages --

self.onmessage = function (event) {
  const msg = event.data;

  if (msg.type === 'search') {
    const s = restoreState(msg.position);
    // Temps de réflexion maxi (option du bot) : approfondissement itératif
    // au-delà de la profondeur liée à l'Elo, tant que le budget le permet.
    // Chaque profondeur coûte grossièrement 5 à 10 fois la précédente : on
    // ne relance que si le temps déjà écoulé laisse une vraie marge.
    let depth = depthForElo(msg.elo);
    let scored = searchRoot(s, depth);
    const budget = msg.timeMs || 0;
    if (budget > 0) {
      const start = Date.now();
      while (depth < 6 && scored.length > 1 && (Date.now() - start) * 5 < budget) {
        depth++;
        scored = searchRoot(s, depth);
      }
    }
    if (scored.length === 0) { self.postMessage({ type: 'move', move: null }); return; }
    const move = pickMove(scored, msg.elo);
    self.postMessage({ type: 'move', move });
    return;
  }

  if (msg.type === 'blunders') {
    // Blunder Trainer : repère les gaffes/erreurs du joueur (perte >= 150 cp
    // à profondeur 3) et calcule le meilleur coup (profondeur 5) sur chacune.
    const DEPTH = 3;
    const BEST_DEPTH = 4;
    const BOUND = 1200;
    const s = Chess.newGame();
    const evals = [];
    const positions = []; // état sérialisé avant chaque demi-coup

    const record = () => {
      const status = Chess.statusOf(s);
      if (status.over) {
        evals.push(status.result === '1-0' ? BOUND : status.result === '0-1' ? -BOUND : 0);
        return;
      }
      const score = negamax(s, DEPTH, -Infinity, Infinity);
      const white = s.turn === Chess.WHITE ? score : -score;
      evals.push(Math.max(-BOUND, Math.min(BOUND, white)));
    };

    record();
    const played = [];
    for (let i = 0; i < msg.sans.length; i++) {
      positions.push({
        board: s.board.slice(), turn: s.turn, castling: { ...s.castling },
        ep: s.ep, halfmove: s.halfmove, fullmove: s.fullmove
      });
      const move = Pgn.sanToMove(Chess, s, msg.sans[i]);
      if (!move) break;
      played.push(msg.sans[i]);
      Chess.play(s, move);
      record();
    }

    const items = [];
    for (let i = 0; i < played.length && i + 1 < evals.length; i++) {
      const mover = i % 2 === 0 ? 'w' : 'b';
      if (mover !== msg.userColor) continue;
      if (i < 4) continue;                                  // bruit d'ouverture
      const before = mover === 'w' ? evals[i] : -evals[i];  // perspective joueur
      if (before <= -1100 || before >= 1100) continue;      // partie déjà pliée
      const loss = mover === 'w' ? evals[i] - evals[i + 1] : evals[i + 1] - evals[i];
      if (loss < 150) continue;
      // Meilleur coup dans la position fautive, à profondeur supérieure
      const pos = restoreState(positions[i]);
      const scored = searchRoot(pos, BEST_DEPTH);
      if (scored.length === 0) continue;
      const best = scored[0];
      // Coups acceptés : à moins de 30 cp du meilleur. S'ils sont trop
      // nombreux, la position est molle (tout se vaut) : pas un bon quiz.
      const nearBest = scored.filter(entry => best.score - entry.score <= 30);
      if (nearBest.length > 4) continue;
      const acceptable = nearBest
        .map(entry => ({
          from: entry.move.from, to: entry.move.to, promo: entry.move.promo || null,
          san: Chess.sanOf(restoreState(positions[i]), entry.move)
        }));
      items.push({
        ply: i,
        played: played[i],
        loss,
        before,                                             // éval avant le coup (perspective joueur)
        after: mover === 'w' ? evals[i + 1] : -evals[i + 1],
        bestSan: acceptable[0].san,
        evalBest: Math.round(best.score),
        acceptable
      });
    }
    self.postMessage({ type: 'blunders', requestId: msg.requestId, items });
    return;
  }

  if (msg.type === 'analyze') {
    // Rejoue la partie et évalue chaque position à profondeur 3.
    // Score en centipions, perspective Blancs, borné à ±1200.
    const DEPTH = 3;
    const BOUND = 1200;
    const s = Chess.newGame();
    const evals = [];

    const record = () => {
      const status = Chess.statusOf(s);
      let cp;
      if (status.over) {
        if (status.result === '1-0') cp = BOUND;
        else if (status.result === '0-1') cp = -BOUND;
        else cp = 0;
      } else {
        const score = negamax(s, DEPTH, -Infinity, Infinity); // camp au trait
        const white = s.turn === Chess.WHITE ? score : -score;
        cp = Math.max(-BOUND, Math.min(BOUND, white));
      }
      evals.push(cp);
    };

    record();
    for (let i = 0; i < msg.sans.length; i++) {
      const move = Pgn.sanToMove(Chess, s, msg.sans[i]);
      if (!move) break; // PGN inattendu : on s'arrête proprement
      Chess.play(s, move);
      record();
      self.postMessage({
        type: 'analysisProgress',
        percent: Math.round(((i + 1) / msg.sans.length) * 100)
      });
    }
    self.postMessage({ type: 'analysis', evals });
  }
};
