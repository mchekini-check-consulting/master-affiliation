/*
 * Échecs360 — classification des coups façon chess.com et explications.
 *
 * MoveClassifier.classify(entry)  → { kind, symbol, label, css }
 *   entry : { cpBefore, cpAfter, mateBefore, mateAfter, mover: 'w'|'b',
 *             isBest: bool }   (cp/mate perspective Blancs)
 *   kinds : best, excellent, good, inaccuracy, mistake, blunder
 *
 * MoveClassifier.explain(Chess, Signals, ctx) → texte français ou null
 *   ctx : { cls, sanPlayed, sanBest, evalBestCp, mateBefore, mateAfter,
 *           mover, stateAfter (état moteur après le coup joué),
 *           refutation { uci, san } | null }
 *
 * Seuils (en pions) : gaffe ≥ 2.0, erreur ≥ 1.0, imprécision ≥ 0.5,
 * bon ≤ 0.5, excellent ≤ 0.2, meilleur = premier choix du moteur.
 */
(function (global) {
  'use strict';

  const KINDS = {
    best:       { kind: 'best',       symbol: '★',  label: 'Meilleur coup', css: 'best' },
    excellent:  { kind: 'excellent',  symbol: '!!', label: 'Excellent',     css: 'excellent' },
    good:       { kind: 'good',       symbol: '!',  label: 'Bon coup',      css: 'good' },
    inaccuracy: { kind: 'inaccuracy', symbol: '?!', label: 'Imprécision',   css: 'inaccuracy' },
    mistake:    { kind: 'mistake',    symbol: '?',  label: 'Erreur',        css: 'mistake' },
    blunder:    { kind: 'blunder',    symbol: '??', label: 'Gaffe',         css: 'blunder' }
  };

  const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const NOM = { p: 'le pion', n: 'le cavalier', b: 'le fou', r: 'la tour', q: 'la dame', k: 'le roi' };

  /** Évaluation « effective » pour comparer avant/après (mat = ±30 pions). */
  function effective(cp, mate) {
    if (mate !== null && mate !== undefined) return mate > 0 ? 3000 : -3000;
    return cp === null || cp === undefined ? 0 : cp;
  }

  function classify(entry) {
    const sign = entry.mover === 'w' ? 1 : -1;
    const before = sign * effective(entry.cpBefore, entry.mateBefore);
    const after = sign * effective(entry.cpAfter, entry.mateAfter);
    const loss = Math.max(0, before - after);

    if (entry.isBest) return KINDS.best;
    // Rater un mat forcé, ou en permettre un : gaffe d'office
    const hadMate = entry.mateBefore !== null && entry.mateBefore !== undefined
        && (entry.mover === 'w' ? entry.mateBefore > 0 : entry.mateBefore < 0);
    const givesMate = entry.mateAfter !== null && entry.mateAfter !== undefined
        && (entry.mover === 'w' ? entry.mateAfter < 0 : entry.mateAfter > 0);
    if ((hadMate && after < 500) || givesMate) return KINDS.blunder;

    // Position déjà totalement perdue : on ne « gaffe » plus vraiment
    const alreadyLost = before < -800;
    if (loss >= 200) return alreadyLost ? KINDS.mistake : KINDS.blunder;
    if (loss >= 100) return KINDS.mistake;
    if (loss >= 50) return KINDS.inaccuracy;
    if (loss <= 20) return KINDS.excellent;
    return KINDS.good;
  }

  function formatEval(cp, mate) {
    if (mate !== null && mate !== undefined) return (mate > 0 ? '+M' : '-M') + Math.abs(mate);
    const v = cp / 100;
    return (v >= 0 ? '+' : '') + v.toFixed(1);
  }

  /** Conséquence concrète d'une faute, déduite de la réfutation du moteur. */
  function consequence(Chess, Signals, ctx) {
    // Mat manqué / mat permis
    const moverSign = ctx.mover === 'w' ? 1 : -1;
    if (ctx.mateBefore !== null && ctx.mateBefore !== undefined && moverSign * ctx.mateBefore > 0
        && !(ctx.mateAfter !== null && ctx.mateAfter !== undefined && moverSign * ctx.mateAfter > 0)) {
      return 'rate un mat forcé en ' + Math.abs(ctx.mateBefore) + ' coup' + (Math.abs(ctx.mateBefore) > 1 ? 's' : '');
    }
    if (ctx.mateAfter !== null && ctx.mateAfter !== undefined && moverSign * ctx.mateAfter < 0) {
      return 'permet un mat forcé en ' + Math.abs(ctx.mateAfter) + ' coup' + (Math.abs(ctx.mateAfter) > 1 ? 's' : '');
    }
    if (!ctx.refutation || !ctx.stateAfter) return null;

    const state = ctx.stateAfter;
    const board = state.board;
    const opp = ctx.mover === 'w' ? 'b' : 'w';
    const from = ctx.refutation.from;
    const to = ctx.refutation.to;

    // La réfutation capture-t-elle une pièce mal défendue ?
    const target = board[to];
    if (target && Signals) {
      const type = target.toLowerCase();
      if (VAL[type] >= 3) {
        const defenders = Signals.attackersOf(board, to, ctx.mover).length;
        const attackers = Signals.attackersOf(board, to, opp).length;
        if (defenders === 0 || (attackers > defenders && VAL[type] >= 3)) {
          return 'perd ' + NOM[type] + ' après ' + ctx.refutation.san;
        }
      }
    }
    // La réfutation crée-t-elle une fourchette sur deux pièces de valeur ?
    if (!target) {
      Chess.playFast(state, ctx.refutation);
      let bigTargets = 0;
      for (const sq of attackedFrom(Chess, state.board, to)) {
        const piece = state.board[sq];
        if (piece && (piece === piece.toUpperCase() ? 'w' : 'b') === ctx.mover
            && VAL[piece.toLowerCase()] >= 3) bigTargets++;
      }
      Chess.undoFast(state);
      if (bigTargets >= 2) return 'subit une fourchette après ' + ctx.refutation.san;
    }
    return null;
  }

  /** Cases attaquées par la pièce en `from` (rayons simples). */
  function attackedFrom(Chess, board, from) {
    const piece = board[from];
    if (!piece) return [];
    const t = piece.toLowerCase();
    const me = piece === piece.toUpperCase() ? 'w' : 'b';
    const row = (from / 8) | 0, col = from % 8;
    const out = [];
    const push = (r, c) => { if (r >= 0 && r < 8 && c >= 0 && c < 8) out.push(r * 8 + c); };
    if (t === 'p') {
      const dir = me === 'w' ? -1 : 1;
      push(row + dir, col - 1); push(row + dir, col + 1);
    } else if (t === 'n') {
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) push(row + dr, col + dc);
    } else if (t === 'k') {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) push(row + dr, col + dc);
    } else {
      const dirs = t === 'r' ? [[-1,0],[1,0],[0,-1],[0,1]]
        : t === 'b' ? [[-1,-1],[-1,1],[1,-1],[1,1]]
        : [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
      for (const [dr, dc] of dirs) {
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          out.push(r * 8 + c);
          if (board[r * 8 + c]) break;
          r += dr; c += dc;
        }
      }
    }
    return out;
  }

  function explain(Chess, Signals, ctx) {
    if (!ctx.cls || (ctx.cls.kind !== 'blunder' && ctx.cls.kind !== 'mistake' && ctx.cls.kind !== 'inaccuracy')) {
      return null;
    }
    const raison = consequence(Chess, Signals, ctx);
    let txt = ctx.cls.symbol + ' ' + ctx.cls.label + ' — ' + ctx.sanPlayed;
    txt += raison ? ' ' + raison + '.' : ' affaiblit la position.';
    if (ctx.sanBest) {
      txt += ' Le meilleur coup était ' + ctx.sanBest
        + (ctx.evalBestCp !== null && ctx.evalBestCp !== undefined
           ? ' (' + formatEval(ctx.evalBestCp, ctx.mateBefore) + ')' : '') + '.';
    }
    return txt;
  }

  const MoveClassifier = { classify, explain, formatEval, KINDS };
  global.MoveClassifier = MoveClassifier;
  if (typeof module !== 'undefined' && module.exports) module.exports = MoveClassifier;
})(typeof self !== 'undefined' ? self : globalThis);
