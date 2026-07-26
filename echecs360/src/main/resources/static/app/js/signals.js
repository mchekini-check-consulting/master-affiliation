/*
 * Échecs360 — explications « humaines » des coups et signaux faibles.
 *
 * explainMove(Chess, state, move)  → phrases simples expliquant l'intérêt
 *   d'un coup (développement, roque, colonne ouverte, diagonale du fou...).
 * detectSignals(Chess, state)      → { tactiques: [...], positionnels: [...] }
 *   chaque signal : { camp: 'w'|'b', titre, detail, cases: [index...] }.
 *
 * Tout est heuristique et volontairement pédagogique : on cherche des
 * repères simples à comprendre, pas une vérité de moteur.
 */
(function (global) {
  'use strict';

  const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const NOM = { p: 'pion', n: 'cavalier', b: 'fou', r: 'tour', q: 'dame', k: 'roi' };
  const FEM = { q: true, r: true };
  function leNom(t) { return (FEM[t] ? 'la ' : 'le ') + NOM[t]; }
  function LeNom(t) { return (FEM[t] ? 'La ' : 'Le ') + NOM[t]; }

  function colorOf(piece) { return piece === piece.toUpperCase() ? 'w' : 'b'; }
  function typeOf(piece) { return piece.toLowerCase(); }
  function row(sq) { return (sq / 8) | 0; }        // 0 = 8e rangée
  function col(sq) { return sq % 8; }
  function rank(sq) { return 8 - row(sq); }        // rangée échecs 1-8
  function fileName(sq) { return 'abcdefgh'[col(sq)]; }
  function sqName(sq) { return fileName(sq) + rank(sq); }
  function inBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  const KNIGHT_D = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const KING_D = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  const ROOK_D = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const BISHOP_D = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  /** Toutes les pièces du camp `by` qui attaquent la case `sq`. */
  function attackersOf(board, sq, by) {
    const result = [];
    const tr = row(sq), tc = col(sq);
    for (let from = 0; from < 64; from++) {
      const piece = board[from];
      if (!piece || colorOf(piece) !== by || from === sq) continue;
      const t = typeOf(piece);
      const fr = row(from), fc = col(from);
      const dr = tr - fr, dc = tc - fc;
      if (t === 'p') {
        // Pions blancs attaquent vers le haut (row décroissante)
        const dir = by === 'w' ? -1 : 1;
        if (dr === dir && Math.abs(dc) === 1) result.push(from);
      } else if (t === 'n') {
        if (KNIGHT_D.some(d => d[0] === dr && d[1] === dc)) result.push(from);
      } else if (t === 'k') {
        if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) result.push(from);
      } else {
        const dirs = t === 'r' ? ROOK_D : t === 'b' ? BISHOP_D : ROOK_D.concat(BISHOP_D);
        for (const d of dirs) {
          let r = fr + d[0], c = fc + d[1], blocked = false;
          while (inBoard(r, c)) {
            const cur = r * 8 + c;
            if (cur === sq) { if (!blocked) result.push(from); break; }
            if (board[cur]) { blocked = true; break; }
            r += d[0]; c += d[1];
          }
        }
      }
    }
    return result;
  }

  function kingSquareOf(board, color) {
    const king = color === 'w' ? 'K' : 'k';
    for (let i = 0; i < 64; i++) if (board[i] === king) return i;
    return -1;
  }

  function piecesOf(board, color) {
    const list = [];
    for (let i = 0; i < 64; i++) {
      if (board[i] && colorOf(board[i]) === color) list.push(i);
    }
    return list;
  }

  const CAMP = { w: 'Blancs', b: 'Noirs' };

  // ==================================================================
  // Explication d'un coup (avant qu'il soit joué : state = position, move)
  // ==================================================================

  function explainMove(Chess, state, move) {
    const reasons = [];
    const board = state.board;
    const me = colorOf(move.piece);
    const opp = me === 'w' ? 'b' : 'w';
    const t = typeOf(move.piece);

    // Roque
    if (t === 'k' && Math.abs(col(move.to) - col(move.from)) === 2) {
      reasons.push('met le roi à l\'abri (roque) et connecte les tours');
    }

    // Capture
    const captured = board[move.to];
    if (captured || move.ep) {
      const what = move.ep ? 'pion' : NOM[typeOf(captured)];
      const defended = attackersOf(board, move.to, opp).length > 0;
      reasons.push('capture ' + (what === 'dame' || what === 'tour' ? 'la ' : 'le ') + what
        + (!defended && !move.ep ? ' — gratuitement, la pièce n\'était pas défendue' : ''));
    }

    // Promotion
    if (move.promo) reasons.push('promeut le pion en ' + (NOM[move.promo] || 'dame'));

    // Joue le coup pour observer les conséquences
    Chess.playFast(state, move);
    const after = state.board;

    // Échec / mat
    if (Chess.inCheck(state, opp)) {
      const noMoves = Chess.legalMoves(state).length === 0;
      reasons.push(noMoves ? 'échec et mat !' : 'donne échec et force la réponse adverse');
    }

    // Attaque une pièce de valeur après le coup
    if (!move.promo && t !== 'k') {
      let bestTarget = null;
      for (const sq of attacksFrom(after, move.to)) {
        const target = after[sq];
        if (target && colorOf(target) === opp && typeOf(target) !== 'k') {
          const tv = VAL[typeOf(target)];
          const undefended = attackersOf(after, sq, opp).length === 0;
          if (tv > VAL[t] || undefended) {
            if (!bestTarget || tv > bestTarget.v) bestTarget = { sq, v: tv, nom: NOM[typeOf(target)] };
          }
        }
      }
      if (bestTarget) {
        reasons.push('attaque ' + (bestTarget.nom === 'dame' || bestTarget.nom === 'tour' ? 'la ' : 'le ')
          + bestTarget.nom + ' en ' + sqName(bestTarget.sq));
      }
    }

    Chess.undoFast(state);

    // Développement d'une pièce mineure depuis sa case initiale
    const homeRow = me === 'w' ? 7 : 0;
    if ((t === 'n' || t === 'b') && row(move.from) === homeRow && !captured) {
      reasons.push('développe une pièce vers le jeu');
    }

    // Occupation / contrôle du centre
    const CENTER = [27, 28, 35, 36]; // d5 e5 d4 e4
    if (CENTER.includes(move.to) && !captured && t !== 'k') {
      reasons.push(t === 'p' ? 'occupe le centre' : 'centralise la pièce');
    }

    // Coups de pion : lignes ouvertes et air pour le roi
    if (t === 'p') {
      // Ouvre la diagonale d'un fou encore chez lui (e4/d4, e3/d3...)
      const fromC = col(move.from);
      if (fromC === 3 || fromC === 4) {
        const bishops = me === 'w' ? [58, 61] : [2, 5]; // c1/f1 ou c8/f8
        for (const bsq of bishops) {
          if (board[bsq] && typeOf(board[bsq]) === 'b' && colorOf(board[bsq]) === me) {
            reasons.push('ouvre la diagonale du fou ' + sqName(bsq) + ' pour qu\'il rayonne');
            break;
          }
        }
      }
      // Luft : petite case d'air devant le roi roqué (pas le roi au centre)
      const ksq = kingSquareOf(board, me);
      if (ksq >= 0 && row(ksq) === homeRow && (col(ksq) >= 5 || col(ksq) <= 2)
          && Math.abs(col(move.from) - col(ksq)) <= 1
          && row(move.from) === (me === 'w' ? 6 : 1) && !captured) {
        reasons.push('donne une case d\'air au roi (contre le mat de la dernière rangée)');
      }
      // Capture de pion qui ouvre une colonne
      if (captured && typeOf(captured) === 'p') {
        let ownPawnLeft = false;
        for (let r = 0; r < 8; r++) {
          const p2 = board[r * 8 + col(move.from)];
          if (p2 && typeOf(p2) === 'p' && colorOf(p2) === me && r * 8 + col(move.from) !== move.from) ownPawnLeft = true;
        }
        if (!ownPawnLeft) reasons.push('ouvre la colonne ' + fileName(move.from) + ' pour les tours');
      }
      // Avance d'un pion passé
      if (isPassed(board, move.from, me)) reasons.push('avance un pion passé vers la promotion');
    }

    // Tour vers une colonne ouverte
    if (t === 'r' && !captured) {
      let pawns = 0;
      for (let r = 0; r < 8; r++) {
        const p2 = board[r * 8 + col(move.to)];
        if (p2 && typeOf(p2) === 'p') pawns++;
      }
      if (pawns === 0) reasons.push('place la tour sur la colonne ouverte ' + fileName(move.to));
    }

    // Fuite d'une pièce attaquée
    if (!captured && attackersOf(board, move.from, opp).length > 0
        && attackersOf(board, move.from, me).length === 0 && t !== 'k' && t !== 'p') {
      reasons.push('met à l\'abri une pièce qui était attaquée');
    }

    return reasons.slice(0, 3);
  }

  /** Cases attaquées par la pièce située sur `from`. */
  function attacksFrom(board, from) {
    const piece = board[from];
    if (!piece) return [];
    const t = typeOf(piece), me = colorOf(piece);
    const fr = row(from), fc = col(from);
    const result = [];
    if (t === 'p') {
      const dir = me === 'w' ? -1 : 1;
      for (const dc of [-1, 1]) {
        if (inBoard(fr + dir, fc + dc)) result.push((fr + dir) * 8 + fc + dc);
      }
    } else if (t === 'n' || t === 'k') {
      for (const d of (t === 'n' ? KNIGHT_D : KING_D)) {
        if (inBoard(fr + d[0], fc + d[1])) result.push((fr + d[0]) * 8 + fc + d[1]);
      }
    } else {
      const dirs = t === 'r' ? ROOK_D : t === 'b' ? BISHOP_D : ROOK_D.concat(BISHOP_D);
      for (const d of dirs) {
        let r = fr + d[0], c = fc + d[1];
        while (inBoard(r, c)) {
          result.push(r * 8 + c);
          if (board[r * 8 + c]) break;
          r += d[0]; c += d[1];
        }
      }
    }
    return result;
  }

  function isPassed(board, sq, me) {
    const dir = me === 'w' ? -1 : 1;
    const c0 = col(sq);
    for (let c = Math.max(0, c0 - 1); c <= Math.min(7, c0 + 1); c++) {
      for (let r = row(sq) + dir; r >= 0 && r < 8; r += dir) {
        const p2 = board[r * 8 + c];
        if (p2 && typeOf(p2) === 'p' && colorOf(p2) !== me) return false;
      }
    }
    return true;
  }

  // ==================================================================
  // Signaux faibles de la position
  // ==================================================================

  function detectSignals(Chess, state) {
    const board = state.board;
    const tactiques = [];
    const positionnels = [];

    for (const camp of ['w', 'b']) {
      const opp = camp === 'w' ? 'b' : 'w';

      // --- T1 : pièces en prise / défenseur unique + T2 : surcharge ---
      const unique = {}; // défenseur -> pièces qu'il est seul à défendre
      for (const sq of piecesOf(board, camp)) {
        const t = typeOf(board[sq]);
        if (t === 'k') continue;
        const att = attackersOf(board, sq, opp);
        if (att.length === 0) continue;
        const def = attackersOf(board, sq, camp);
        if (def.length === 0) {
          tactiques.push({
            camp, titre: NOM[t] + ' ' + sqName(sq) + ' attaqué' + (t === 'r' || t === 'q' ? 'e' : '') + ' et non défendu' + (t === 'r' || t === 'q' ? 'e' : ''),
            detail: 'Une pièce attaquée sans défenseur est une cible immédiate.',
            cases: [sq].concat(att)
          });
        } else if (def.length === 1) {
          tactiques.push({
            camp, titre: 'défenseur unique ' + (FEM[t] ? 'de la ' : 'du ') + NOM[t] + ' ' + sqName(sq),
            detail: LeNom(typeOf(board[def[0]])) + ' ' + sqName(def[0])
              + ' est l\'unique défenseur : capturez, clouez ou chassez cette pièce.',
            cases: [sq, def[0]]
          });
          (unique[def[0]] = unique[def[0]] || []).push(sq);
        }
      }
      for (const [defSq, protectedSqs] of Object.entries(unique)) {
        if (protectedSqs.length >= 2) {
          tactiques.push({
            camp, titre: NOM[typeOf(board[defSq])] + ' ' + sqName(+defSq) + ' surchargé',
            detail: 'Il défend seul plusieurs cibles : obligez-le à choisir et l\'une tombera.',
            cases: [+defSq].concat(protectedSqs)
          });
        }
      }

      // --- T3 : géométrie de fourchette de cavalier ---
      const hasKnight = piecesOf(board, opp).some(sq => typeOf(board[sq]) === 'n');
      if (hasKnight) {
        const bigs = piecesOf(board, camp).filter(sq => 'kqr'.includes(typeOf(board[sq])));
        outer:
        for (let x = 0; x < 64; x++) {
          if (board[x] && colorOf(board[x]) === opp) continue;
          const touched = bigs.filter(sq => KNIGHT_D.some(d => {
            const r = row(x) + d[0], c = col(x) + d[1];
            return inBoard(r, c) && r * 8 + c === sq;
          }));
          if (touched.length >= 2 && attackersOf(board, x, camp).length === 0) {
            tactiques.push({
              camp, titre: 'fourchette de cavalier possible en ' + sqName(x),
              detail: 'Un cavalier adverse y toucherait ' + touched.map(sq => NOM[typeOf(board[sq])] + ' ' + sqName(sq)).join(' et ') + '.',
              cases: [x].concat(touched)
            });
            break outer; // une seule géométrie signalée par camp
          }
        }
      }

      // --- T4 : dernière rangée sans luft ---
      const ksq = kingSquareOf(board, camp);
      const homeRow = camp === 'w' ? 7 : 0;
      if (ksq >= 0 && row(ksq) === homeRow && col(ksq) >= 5) {
        const frontRow = camp === 'w' ? 6 : 1;
        const front = [];
        for (let c = Math.max(0, col(ksq) - 1); c <= Math.min(7, col(ksq) + 1); c++) front.push(frontRow * 8 + c);
        const sealed = front.every(sq => board[sq] && colorOf(board[sq]) === camp);
        const heavy = piecesOf(board, opp).some(sq => 'qr'.includes(typeOf(board[sq])));
        if (sealed && heavy) {
          tactiques.push({
            camp, titre: 'dernière rangée fragile (pas de luft)',
            detail: 'Le roi ' + sqName(ksq) + ' est enfermé derrière ses pions : gare aux mats du couloir.',
            cases: [ksq].concat(front)
          });
        }
      }

      // --- T5 : dame exposée ---
      for (const sq of piecesOf(board, camp)) {
        if (typeOf(board[sq]) !== 'q') continue;
        const cheap = attackersOf(board, sq, opp).filter(a => VAL[typeOf(board[a])] < 9);
        if (cheap.length > 0) {
          tactiques.push({
            camp, titre: 'dame ' + sqName(sq) + ' exposée',
            detail: 'Chaque attaque sur elle fait gagner un tempo à l\'adversaire.',
            cases: [sq].concat(cheap)
          });
        }
      }

      // --- P1/P2 : pions isolés et doublés ---
      const pawnCols = {};
      for (const sq of piecesOf(board, camp)) {
        if (typeOf(board[sq]) === 'p') (pawnCols[col(sq)] = pawnCols[col(sq)] || []).push(sq);
      }
      for (const [c, sqs] of Object.entries(pawnCols)) {
        const ci = +c;
        if (sqs.length >= 2) {
          positionnels.push({
            camp, titre: 'pions doublés colonne ' + 'abcdefgh'[ci],
            detail: 'Deux pions sur la même colonne se gênent et deviennent des cibles durables.',
            cases: sqs
          });
        }
        if (!pawnCols[ci - 1] && !pawnCols[ci + 1]) {
          positionnels.push({
            camp, titre: 'pion isolé en ' + sqName(sqs[0]),
            detail: 'Aucun pion voisin ne peut le défendre ; la case devant lui est un point d\'ancrage adverse.',
            cases: sqs
          });
        }
      }

      // --- P4 : pions passés ---
      for (const sq of piecesOf(board, camp)) {
        if (typeOf(board[sq]) === 'p' && isPassed(board, sq, camp)) {
          positionnels.push({
            camp, titre: 'pion passé en ' + sqName(sq),
            detail: 'Aucun pion adverse ne peut l\'arrêter : sa force grandit à chaque échange.',
            cases: [sq]
          });
        }
      }

      // --- P5 : retard de développement / roi au centre ---
      if (state.fullmove >= 8) {
        const homeSquares = camp === 'w' ? [57, 58, 61, 62] : [1, 2, 5, 6];
        const initial = camp === 'w' ? ['N', 'B', 'B', 'N'] : ['n', 'b', 'b', 'n'];
        let undeveloped = 0;
        homeSquares.forEach((sq, i) => { if (board[sq] === initial[i]) undeveloped++; });
        const kingHome = ksq === (camp === 'w' ? 60 : 4);
        if (undeveloped >= 2 && kingHome) {
          positionnels.push({
            camp, titre: 'retard de développement, roi au centre',
            detail: 'Plusieurs pièces dorment et le roi n\'est pas roqué : l\'adversaire doit ouvrir le centre maintenant.',
            cases: homeSquares.filter((sq, i) => board[sq] === initial[i]).concat([ksq])
          });
        }
      }

      // --- P6 : cavalier au bord ---
      for (const sq of piecesOf(board, camp)) {
        if (typeOf(board[sq]) === 'n' && (col(sq) === 0 || col(sq) === 7)) {
          positionnels.push({
            camp, titre: 'cavalier au bord en ' + sqName(sq),
            detail: 'Un cavalier sur la bande contrôle deux fois moins de cases : il est temporairement hors jeu.',
            cases: [sq]
          });
        }
      }

      // --- P7 : majorité de pions par aile ---
      const wing = side => piecesOf(board, side).filter(sq => typeOf(board[sq]) === 'p');
      const myPawns = wing(camp), oppPawns = wing(opp);
      for (const [nom, test] of [['dame (a-d)', c => c <= 3], ['roi (e-h)', c => c >= 4]]) {
        const mine = myPawns.filter(sq => test(col(sq)));
        const theirs = oppPawns.filter(sq => test(col(sq)));
        if (mine.length > theirs.length && theirs.length > 0) {
          positionnels.push({
            camp, titre: 'majorité de pions à l\'aile ' + nom,
            detail: mine.length + ' pions contre ' + theirs.length + ' : la promesse d\'un pion passé en finale.',
            cases: mine
          });
        }
      }
    }

    // --- P3 : colonnes ouvertes (signal commun, seulement si des tours restent
    //     et si la position n'est pas déjà toute ouverte) ---
    const anyRook = board.some(p2 => p2 && 'rq'.includes(typeOf(p2)));
    const openCols = [];
    for (let c = 0; c < 8; c++) {
      let pawns = 0;
      for (let r = 0; r < 8; r++) {
        const p2 = board[r * 8 + c];
        if (p2 && typeOf(p2) === 'p') pawns++;
      }
      if (pawns === 0) openCols.push(c);
    }
    if (anyRook && openCols.length > 0 && openCols.length <= 3) {
      for (const c of openCols) {
        positionnels.push({
          camp: null, titre: 'colonne ' + 'abcdefgh'[c] + ' ouverte',
          detail: 'L\'autoroute des tours : qui la contrôle vise l\'invasion de la 7e rangée.',
          cases: Array.from({ length: 8 }, (_, r) => r * 8 + c)
        });
      }
    }

    return { tactiques, positionnels };
  }

  const Signals = { explainMove, detectSignals, attackersOf, CAMP };
  global.Signals = Signals;
  if (typeof module !== 'undefined' && module.exports) module.exports = Signals;
})(typeof self !== 'undefined' ? self : globalThis);
