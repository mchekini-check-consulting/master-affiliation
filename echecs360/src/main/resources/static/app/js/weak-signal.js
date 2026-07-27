/*
 * Échecs360 — détection de « signal faible » : un coup adverse anodin en
 * apparence mais qui peut cacher une idée (piège, préparation d'attaque).
 *
 * WeakSignalDetector.detect(Chess, Signals, ctx) → null ou
 *   { reason, message, watchSquares: [index...] }
 *
 * ctx : {
 *   move           : le coup joué (objet moteur, AVANT de le jouer),
 *   stateBefore    : état moteur avant le coup (sera restauré),
 *   topUci         : les 5 meilleurs coups (uci) de la position avant,
 *   cpBefore, cpAfter : évals Stockfish perspective Blancs,
 *   mover          : 'w'|'b' (l'adversaire),
 *   player         : couleur de l'utilisateur
 * }
 *
 * Critères : coup hors du top 5 SANS perte d'évaluation (idée cachée),
 * sacrifice apparent qui ne perd rien, repli sans raison visible.
 */
(function (global) {
  'use strict';

  const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  function sqName(sq) {
    return 'abcdefgh'[sq % 8] + (8 - ((sq / 8) | 0));
  }

  function detect(Chess, Signals, ctx) {
    const sign = ctx.mover === 'w' ? 1 : -1;
    const before = sign * (ctx.cpBefore || 0);
    const after = sign * (ctx.cpAfter || 0);
    const loss = before - after;
    if (loss > 60) return null;             // le coup est simplement moyen/mauvais

    const move = ctx.move;
    const uci = moveUci(Chess, move);
    const inTop = (ctx.topUci || []).includes(uci);
    const board = ctx.stateBefore.board;
    const piece = move.piece;
    const type = piece.toLowerCase();

    let reason = null;

    // 1. Hors des 5 meilleures lignes, sans rien perdre : idée cachée probable
    if (!inTop && (ctx.topUci || []).length >= 3) {
      reason = 'coup hors des lignes principales, sans perte d\'évaluation';
    }

    // 2. Sacrifice apparent : la pièce arrive sur une case contrôlée par
    //    une pièce adverse moins chère, sans que l'évaluation ne bouge
    if (!reason && type !== 'k' && type !== 'p') {
      Chess.playFast(ctx.stateBefore, move);
      const cheap = Signals.attackersOf(ctx.stateBefore.board, move.to, ctx.player)
        .some(a => VAL[ctx.stateBefore.board[a].toLowerCase()] < VAL[type]);
      Chess.undoFast(ctx.stateBefore);
      if (cheap) reason = 'la pièce se met « en prise » sans que rien ne le justifie en apparence';
    }

    // 3. Repli sans capture ni menace visible d'une pièce développée
    if (!reason && (type === 'n' || type === 'b' || type === 'q') && !board[move.to] && !move.ep) {
      const fromRow = (move.from / 8) | 0;
      const toRow = (move.to / 8) | 0;
      const backwards = ctx.mover === 'w' ? toRow > fromRow : toRow < fromRow;
      if (backwards && !inTop) reason = 'une pièce active recule sans raison apparente';
    }

    if (!reason) return null;

    // Cases à surveiller : pièces du joueur nouvellement attaquées par le coup
    const watchSquares = [];
    Chess.playFast(ctx.stateBefore, move);
    const boardAfter = ctx.stateBefore.board;
    for (let sq = 0; sq < 64; sq++) {
      const p = boardAfter[sq];
      if (!p) continue;
      const color = p === p.toUpperCase() ? 'w' : 'b';
      if (color !== ctx.player) continue;
      const nowAttacked = Signals.attackersOf(boardAfter, sq, ctx.mover).length > 0;
      if (nowAttacked) {
        Chess.undoFast(ctx.stateBefore);
        const wasAttacked = board[sq] && Signals.attackersOf(board, sq, ctx.mover).length > 0;
        Chess.playFast(ctx.stateBefore, move);
        if (!wasAttacked) watchSquares.push(sq);
      }
    }
    Chess.undoFast(ctx.stateBefore);

    const zone = watchSquares.length > 0
      ? watchSquares.slice(0, 3).map(sqName).join(', ')
      : sqName(move.to) + ' et les cases voisines';
    return {
      reason,
      watchSquares: watchSquares.length > 0 ? watchSquares : [move.to],
      message: '⚠️ Signal faible — ' + reason + '. Ce coup semble anodin mais prépare peut-être '
        + 'quelque chose : vérifiez les menaces sur ' + zone + '.'
    };
  }

  function moveUci(Chess, move) {
    return Chess.algebraic(move.from) + Chess.algebraic(move.to) + (move.promo || '');
  }

  const WeakSignalDetector = { detect, moveUci };
  global.WeakSignalDetector = WeakSignalDetector;
  if (typeof module !== 'undefined' && module.exports) module.exports = WeakSignalDetector;
})(typeof self !== 'undefined' ? self : globalThis);
