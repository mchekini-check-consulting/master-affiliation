/*
 * Échecs360 — moteur de règles (JS pur, sans DOM, testable sous Node).
 *
 * Représentation : plateau de 64 cases, index 0 = a8, 7 = h8, 56 = a1, 63 = h1.
 * Pièces : caractères FEN ('P','N','B','R','Q','K' blancs ; minuscules noirs),
 * case vide = null.
 *
 * API publique (objet Chess) :
 *   newGame()            → état initial
 *   legalMoves(s)        → tous les coups légaux du camp au trait
 *   movesFrom(s, from)   → coups légaux depuis une case
 *   play(s, move)        → joue un coup (mute l'état, alimente l'historique)
 *   undo(s)              → annule le dernier coup
 *   sanOf(s, move)       → notation SAN du coup dans la position courante
 *   statusOf(s)          → statut (échec, mat, pat, nulles) avec raison
 *   attacked(s, sq, by)  → la case est-elle attaquée par le camp `by` ?
 *   perft(s, depth)      → dénombrement des feuilles (validation des règles)
 *
 * Un coup est un objet { from, to, piece, capture?, promo?, castle?, ep? }.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- utils --

  const WHITE = 'w';
  const BLACK = 'b';

  function colorOf(piece) { return piece === piece.toUpperCase() ? WHITE : BLACK; }
  function isColor(piece, color) { return piece !== null && colorOf(piece) === color; }
  function opposite(color) { return color === WHITE ? BLACK : WHITE; }

  function fileOf(sq) { return sq % 8; }            // 0 = colonne a
  function rankOf(sq) { return 8 - ((sq / 8) | 0); } // 1..8 (rangée échiquéenne)
  function algebraic(sq) {
    return 'abcdefgh'[fileOf(sq)] + rankOf(sq);
  }
  function squareOf(file, rankRow) { return rankRow * 8 + file; } // rankRow = ligne 0..7 (0 = 8e rangée)

  // Directions (dLigne, dColonne) — la ligne 0 est la 8e rangée (haut).
  const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const KING_DIRS = ROOK_DIRS.concat(BISHOP_DIRS);
  const KNIGHT_JUMPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

  // ------------------------------------------------------------- position --

  function newGame() {
    const board = new Array(64).fill(null);
    const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let f = 0; f < 8; f++) {
      board[squareOf(f, 0)] = back[f];               // pièces noires (8e rangée)
      board[squareOf(f, 1)] = 'p';
      board[squareOf(f, 6)] = 'P';
      board[squareOf(f, 7)] = back[f].toUpperCase(); // pièces blanches (1re rangée)
    }
    const state = {
      board,
      turn: WHITE,
      // Droits de roque : roi/tour jamais bougés
      castling: { wK: true, wQ: true, bK: true, bQ: true },
      ep: -1,          // case de prise en passant (index) ou -1
      halfmove: 0,     // compteur de la règle des 50 coups
      fullmove: 1,
      history: [],     // pile pour undo (coup + droits + ep + halfmove + capture)
      keys: []         // clés de position pour la triple répétition
    };
    state.keys.push(positionKey(state));
    return state;
  }

  /** Clé de position (répétition) : pièces + trait + roques + case e.p. utile. */
  function positionKey(s) {
    let key = '';
    for (let i = 0; i < 64; i++) key += s.board[i] === null ? '.' : s.board[i];
    key += s.turn;
    key += (s.castling.wK ? 'K' : '') + (s.castling.wQ ? 'Q' : '')
        + (s.castling.bK ? 'k' : '') + (s.castling.bQ ? 'q' : '');
    // La case e.p. ne compte que si une prise en passant est réellement possible
    if (s.ep >= 0 && epCapturePossible(s)) key += algebraic(s.ep);
    return key;
  }

  function epCapturePossible(s) {
    const color = s.turn;
    const pawn = color === WHITE ? 'P' : 'p';
    const row = (s.ep / 8) | 0;
    const fromRow = color === WHITE ? row + 1 : row - 1;
    for (const df of [-1, 1]) {
      const f = fileOf(s.ep) + df;
      if (f < 0 || f > 7) continue;
      if (s.board[squareOf(f, fromRow)] === pawn) return true;
    }
    return false;
  }

  // -------------------------------------------------------------- attaque --

  /** La case `sq` est-elle attaquée par le camp `by` ? */
  function attacked(s, sq, by) {
    const row = (sq / 8) | 0;
    const col = sq % 8;
    // Pions : un pion blanc attaque vers le haut (lignes décroissantes)
    const pawnRow = by === WHITE ? row + 1 : row - 1;
    if (pawnRow >= 0 && pawnRow < 8) {
      const pawn = by === WHITE ? 'P' : 'p';
      for (const dc of [-1, 1]) {
        const c = col + dc;
        if (c >= 0 && c < 8 && s.board[pawnRow * 8 + c] === pawn) return true;
      }
    }
    // Cavaliers
    const knight = by === WHITE ? 'N' : 'n';
    for (const [dr, dc] of KNIGHT_JUMPS) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && s.board[r * 8 + c] === knight) return true;
    }
    // Roi
    const king = by === WHITE ? 'K' : 'k';
    for (const [dr, dc] of KING_DIRS) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && s.board[r * 8 + c] === king) return true;
    }
    // Glisseurs : tour/dame puis fou/dame
    const rook = by === WHITE ? 'R' : 'r';
    const bishop = by === WHITE ? 'B' : 'b';
    const queen = by === WHITE ? 'Q' : 'q';
    for (const [dr, dc] of ROOK_DIRS) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = s.board[r * 8 + c];
        if (piece !== null) {
          if (piece === rook || piece === queen) return true;
          break;
        }
        r += dr; c += dc;
      }
    }
    for (const [dr, dc] of BISHOP_DIRS) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = s.board[r * 8 + c];
        if (piece !== null) {
          if (piece === bishop || piece === queen) return true;
          break;
        }
        r += dr; c += dc;
      }
    }
    return false;
  }

  function kingSquare(s, color) {
    const king = color === WHITE ? 'K' : 'k';
    for (let i = 0; i < 64; i++) if (s.board[i] === king) return i;
    return -1;
  }

  function inCheck(s, color) {
    return attacked(s, kingSquare(s, color), opposite(color));
  }

  // ------------------------------------------------------ coups pseudo-légaux --

  function pseudoMoves(s) {
    const moves = [];
    const color = s.turn;
    for (let from = 0; from < 64; from++) {
      const piece = s.board[from];
      if (piece === null || colorOf(piece) !== color) continue;
      const type = piece.toUpperCase();
      const row = (from / 8) | 0;
      const col = from % 8;

      if (type === 'P') {
        const dir = color === WHITE ? -1 : 1;            // les Blancs montent
        const startRow = color === WHITE ? 6 : 1;
        const promoRow = color === WHITE ? 0 : 7;
        const oneRow = row + dir;
        // Avancée simple (et double depuis la rangée initiale)
        if (oneRow >= 0 && oneRow < 8 && s.board[oneRow * 8 + col] === null) {
          pushPawnMove(moves, piece, from, oneRow * 8 + col, null, oneRow === promoRow);
          const twoRow = row + 2 * dir;
          if (row === startRow && s.board[twoRow * 8 + col] === null) {
            moves.push({ from, to: twoRow * 8 + col, piece, double: true });
          }
        }
        // Captures (y compris en passant)
        for (const dc of [-1, 1]) {
          const c = col + dc;
          if (c < 0 || c > 7 || oneRow < 0 || oneRow > 7) continue;
          const to = oneRow * 8 + c;
          const target = s.board[to];
          if (target !== null && colorOf(target) !== color) {
            pushPawnMove(moves, piece, from, to, target, oneRow === promoRow);
          } else if (to === s.ep) {
            const capturedPawn = color === WHITE ? 'p' : 'P';
            moves.push({ from, to, piece, capture: capturedPawn, ep: true });
          }
        }
      } else if (type === 'N') {
        for (const [dr, dc] of KNIGHT_JUMPS) {
          const r = row + dr, c = col + dc;
          if (r < 0 || r > 7 || c < 0 || c > 7) continue;
          const to = r * 8 + c;
          const target = s.board[to];
          if (target === null || colorOf(target) !== color) {
            moves.push({ from, to, piece, capture: target || undefined });
          }
        }
      } else if (type === 'K') {
        for (const [dr, dc] of KING_DIRS) {
          const r = row + dr, c = col + dc;
          if (r < 0 || r > 7 || c < 0 || c > 7) continue;
          const to = r * 8 + c;
          const target = s.board[to];
          if (target === null || colorOf(target) !== color) {
            moves.push({ from, to, piece, capture: target || undefined });
          }
        }
        // Roques : droits conservés, cases vides, roi jamais en prise sur le trajet
        const home = color === WHITE ? 60 : 4; // e1 / e8
        if (from === home && !inCheck(s, color)) {
          const enemy = opposite(color);
          const kingSide = color === WHITE ? s.castling.wK : s.castling.bK;
          const queenSide = color === WHITE ? s.castling.wQ : s.castling.bQ;
          if (kingSide
              && s.board[home + 1] === null && s.board[home + 2] === null
              && !attacked(s, home + 1, enemy) && !attacked(s, home + 2, enemy)) {
            moves.push({ from, to: home + 2, piece, castle: 'K' });
          }
          if (queenSide
              && s.board[home - 1] === null && s.board[home - 2] === null && s.board[home - 3] === null
              && !attacked(s, home - 1, enemy) && !attacked(s, home - 2, enemy)) {
            moves.push({ from, to: home - 2, piece, castle: 'Q' });
          }
        }
      } else {
        // Glisseurs : fou, tour, dame
        const dirs = type === 'R' ? ROOK_DIRS : type === 'B' ? BISHOP_DIRS : KING_DIRS;
        for (const [dr, dc] of dirs) {
          let r = row + dr, c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const to = r * 8 + c;
            const target = s.board[to];
            if (target === null) {
              moves.push({ from, to, piece });
            } else {
              if (colorOf(target) !== color) moves.push({ from, to, piece, capture: target });
              break;
            }
            r += dr; c += dc;
          }
        }
      }
    }
    return moves;
  }

  /** Ajoute un coup de pion — décliné en 4 coups si promotion. */
  function pushPawnMove(moves, piece, from, to, capture, isPromo) {
    if (isPromo) {
      for (const promo of ['q', 'r', 'b', 'n']) {
        moves.push({ from, to, piece, capture: capture || undefined, promo });
      }
    } else {
      moves.push({ from, to, piece, capture: capture || undefined });
    }
  }

  // -------------------------------------------------------- make / unmake --

  /** Applique un coup sans vérifier sa légalité (usage interne). */
  function makeMove(s, move) {
    const color = colorOf(move.piece);
    const undoInfo = {
      move,
      castling: { ...s.castling },
      ep: s.ep,
      halfmove: s.halfmove
    };

    s.board[move.from] = null;
    // Promotion : la pièce posée change de nature
    s.board[move.to] = move.promo
        ? (color === WHITE ? move.promo.toUpperCase() : move.promo)
        : move.piece;

    if (move.ep) {
      // La prise en passant retire le pion situé derrière la case d'arrivée
      const capturedSq = color === WHITE ? move.to + 8 : move.to - 8;
      s.board[capturedSq] = null;
    }
    if (move.castle) {
      // Déplace la tour correspondante
      const row = color === WHITE ? 7 : 0;
      if (move.castle === 'K') {
        s.board[squareOf(5, row)] = s.board[squareOf(7, row)];
        s.board[squareOf(7, row)] = null;
      } else {
        s.board[squareOf(3, row)] = s.board[squareOf(0, row)];
        s.board[squareOf(0, row)] = null;
      }
    }

    // Mise à jour des droits de roque (roi ou tour qui bouge, tour capturée)
    if (move.piece === 'K') { s.castling.wK = s.castling.wQ = false; }
    if (move.piece === 'k') { s.castling.bK = s.castling.bQ = false; }
    if (move.from === 63 || move.to === 63) s.castling.wK = false; // h1
    if (move.from === 56 || move.to === 56) s.castling.wQ = false; // a1
    if (move.from === 7 || move.to === 7) s.castling.bK = false;   // h8
    if (move.from === 0 || move.to === 0) s.castling.bQ = false;   // a8

    // Case de prise en passant pour le coup suivant
    s.ep = move.double ? (color === WHITE ? move.from - 8 : move.from + 8) : -1;

    // Règle des 50 coups : remise à zéro sur coup de pion ou capture
    s.halfmove = (move.piece.toUpperCase() === 'P' || move.capture) ? 0 : s.halfmove + 1;
    if (color === BLACK) s.fullmove++;
    s.turn = opposite(s.turn);

    s.history.push(undoInfo);
  }

  /** Défait le dernier coup joué par makeMove. */
  function unmakeMove(s) {
    const undoInfo = s.history.pop();
    const move = undoInfo.move;
    const color = colorOf(move.piece);

    s.board[move.from] = move.piece;
    s.board[move.to] = null;
    if (move.ep) {
      const capturedSq = color === WHITE ? move.to + 8 : move.to - 8;
      s.board[capturedSq] = move.capture;
    } else if (move.capture) {
      s.board[move.to] = move.capture;
    }
    if (move.castle) {
      const row = color === WHITE ? 7 : 0;
      if (move.castle === 'K') {
        s.board[squareOf(7, row)] = s.board[squareOf(5, row)];
        s.board[squareOf(5, row)] = null;
      } else {
        s.board[squareOf(0, row)] = s.board[squareOf(3, row)];
        s.board[squareOf(3, row)] = null;
      }
    }

    s.castling = undoInfo.castling;
    s.ep = undoInfo.ep;
    s.halfmove = undoInfo.halfmove;
    if (color === BLACK) s.fullmove--;
    s.turn = color;
  }

  // --------------------------------------------------------- coups légaux --

  /** Coups légaux = pseudo-coups qui ne laissent pas son propre roi en échec. */
  function legalMoves(s) {
    const moves = [];
    for (const move of pseudoMoves(s)) {
      makeMove(s, move);
      if (!inCheck(s, colorOf(move.piece))) moves.push(move);
      unmakeMove(s);
    }
    return moves;
  }

  function movesFrom(s, from) {
    return legalMoves(s).filter(m => m.from === from);
  }

  // ------------------------------------------------------------- jeu public --

  /** Joue un coup légal : l'applique et enregistre la clé de répétition. */
  function play(s, move) {
    makeMove(s, move);
    s.keys.push(positionKey(s));
  }

  /** Annule le dernier coup joué via play. */
  function undo(s) {
    if (s.history.length === 0) return false;
    s.keys.pop();
    unmakeMove(s);
    return true;
  }

  // ------------------------------------------------------------------ SAN --

  /** Notation SAN du coup dans la position courante (avant de le jouer). */
  function sanOf(s, move) {
    let san;
    if (move.castle === 'K') san = 'O-O';
    else if (move.castle === 'Q') san = 'O-O-O';
    else {
      const type = move.piece.toUpperCase();
      if (type === 'P') {
        san = move.capture ? 'abcdefgh'[fileOf(move.from)] + 'x' : '';
        san += algebraic(move.to);
        if (move.promo) san += '=' + move.promo.toUpperCase();
      } else {
        // Désambiguïsation minimale : autres pièces identiques atteignant la case
        const rivals = legalMoves(s).filter(m =>
            m.piece === move.piece && m.to === move.to && m.from !== move.from);
        let disambiguation = '';
        if (rivals.length > 0) {
          const sameFile = rivals.some(m => fileOf(m.from) === fileOf(move.from));
          const sameRank = rivals.some(m => rankOf(m.from) === rankOf(move.from));
          if (!sameFile) disambiguation = 'abcdefgh'[fileOf(move.from)];
          else if (!sameRank) disambiguation = String(rankOf(move.from));
          else disambiguation = algebraic(move.from);
        }
        san = type + disambiguation + (move.capture ? 'x' : '') + algebraic(move.to);
      }
    }
    // Suffixe échec / mat
    makeMove(s, move);
    if (inCheck(s, s.turn)) {
      san += legalMoves(s).length === 0 ? '#' : '+';
    }
    unmakeMove(s);
    return san;
  }

  // ---------------------------------------------------------------- statut --

  /**
   * Statut de la position : { over, check, result?, reason? }.
   * result : '1-0', '0-1' ou '1/2-1/2' ; reason en français.
   */
  function statusOf(s) {
    const check = inCheck(s, s.turn);
    const hasMoves = legalMoves(s).length > 0;

    if (!hasMoves) {
      if (check) {
        return {
          over: true, check,
          result: s.turn === WHITE ? '0-1' : '1-0',
          reason: 'échec et mat'
        };
      }
      return { over: true, check: false, result: '1/2-1/2', reason: 'pat' };
    }
    if (s.halfmove >= 100) {
      return { over: true, check, result: '1/2-1/2', reason: 'règle des 50 coups' };
    }
    // Triple répétition de la position
    const current = s.keys[s.keys.length - 1];
    let repetitions = 0;
    for (const key of s.keys) if (key === current) repetitions++;
    if (repetitions >= 3) {
      return { over: true, check, result: '1/2-1/2', reason: 'triple répétition' };
    }
    if (insufficientMaterial(s)) {
      return { over: true, check, result: '1/2-1/2', reason: 'matériel insuffisant' };
    }
    return { over: false, check };
  }

  /** Nulles par matériel : R c. R, R+F c. R, R+C c. R, R+F c. R+F (fous de même couleur). */
  function insufficientMaterial(s) {
    const minors = []; // { type, squareColor }
    for (let i = 0; i < 64; i++) {
      const piece = s.board[i];
      if (piece === null) continue;
      const type = piece.toUpperCase();
      if (type === 'K') continue;
      if (type === 'P' || type === 'R' || type === 'Q') return false;
      minors.push({ type, sqColor: (((i / 8) | 0) + i % 8) % 2 });
    }
    if (minors.length <= 1) return true;
    if (minors.length === 2 && minors[0].type === 'B' && minors[1].type === 'B'
        && minors[0].sqColor === minors[1].sqColor) return true;
    return false;
  }

  // ---------------------------------------------------------------- perft --

  /** Dénombrement des feuilles de l'arbre des coups (validation du moteur). */
  function perft(s, depth) {
    if (depth === 0) return 1;
    let nodes = 0;
    for (const move of pseudoMoves(s)) {
      makeMove(s, move);
      if (!inCheck(s, colorOf(move.piece))) {
        nodes += perft(s, depth - 1);
      }
      unmakeMove(s);
    }
    return nodes;
  }

  // ----------------------------------------------------------------- export --

  const Chess = {
    WHITE, BLACK,
    newGame, legalMoves, movesFrom, play, undo, sanOf, statusOf,
    attacked, inCheck, kingSquare, perft,
    fileOf, rankOf, algebraic, colorOf, opposite,
    // Variantes rapides sans suivi de répétition (recherche du bot)
    playFast: makeMove, undoFast: unmakeMove
  };

  global.Chess = Chess;
  if (typeof module !== 'undefined' && module.exports) module.exports = Chess;
})(typeof self !== 'undefined' ? self : globalThis);
