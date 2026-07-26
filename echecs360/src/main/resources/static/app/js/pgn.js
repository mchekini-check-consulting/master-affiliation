/*
 * Échecs360 — parseur PGN tolérant (JS pur, testable sous Node).
 *
 * Tolère : commentaires { … } (dont horloges chess.com {[%clk 0:02:58.6]}),
 * variantes ( … ) imbriquées, annotations $n / !? / ?!, numéros de coups,
 * résultats, en-têtes multi-lignes.
 *
 * Le SAN est apparié par composants (pièce, départ partiel, arrivée,
 * promotion) contre les coups légaux du moteur — jamais par égalité de
 * chaîne — pour absorber les SAN sur-désambiguïsés (ex. « Ngf3 » alors que
 * « Nf3 » suffirait).
 */
(function (global) {
  'use strict';

  /** Découpe un PGN complet en { headers, sans }. */
  function parsePgn(text) {
    const headers = {};
    let body = text;

    // En-têtes [Clé "Valeur"] — retirés ligne à ligne : les commentaires
    // d'horloge {[%clk …]} contiennent aussi des crochets, un découpage
    // au dernier « ] » serait faux.
    const headerRe = /^\s*\[(\w+)\s+"([^"]*)"\]\s*$/gm;
    let match;
    while ((match = headerRe.exec(text)) !== null) {
      headers[match[1]] = match[2];
    }
    body = text.replace(headerRe, ' ');

    // Retire commentaires { … } puis variantes ( … ) imbriquées
    body = body.replace(/\{[^}]*\}/g, ' ');
    let depth = 0;
    let stripped = '';
    for (const ch of body) {
      if (ch === '(') depth++;
      else if (ch === ')') { if (depth > 0) depth--; }
      else if (depth === 0) stripped += ch;
    }

    // Tokens restants : coups, numéros, NAG, résultat
    const sans = [];
    for (const token of stripped.split(/\s+/)) {
      if (!token) continue;
      if (/^\d+\.+$/.test(token)) continue;                       // « 12. » ou « 12... »
      if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) continue;       // résultat
      if (/^\$\d+$/.test(token)) continue;                        // NAG
      // « 12.e4 » collé : retire le préfixe numérique
      const cleaned = token.replace(/^\d+\.+/, '');
      if (!cleaned) continue;
      sans.push(cleaned);
    }
    return { headers, sans };
  }

  /**
   * Décompose un SAN en composants :
   * { castle?, piece, fromFile?, fromRank?, to, promo?, capture? } ou null.
   */
  function sanComponents(san) {
    // Nettoie suffixes d'échec/annotations : + # ! ?
    const clean = san.replace(/[+#!?]+$/g, '');
    if (/^O-O(-O)?$/.test(clean.replace(/0/g, 'O'))) {
      return { castle: clean.replace(/0/g, 'O') === 'O-O' ? 'K' : 'Q' };
    }
    const re = /^([NBRQK]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])(?:=?([NBRQ]))?$/;
    const m = re.exec(clean);
    if (!m) return null;
    return {
      piece: m[1] || 'P',
      fromFile: m[2] || null,
      fromRank: m[3] || null,
      capture: m[4] === 'x',
      to: m[5],
      promo: m[6] ? m[6].toLowerCase() : null
    };
  }

  /**
   * Trouve le coup légal correspondant à un SAN dans la position donnée.
   * `Chess` est le moteur de règles ; retourne le coup ou null.
   */
  function sanToMove(Chess, state, san) {
    const parts = sanComponents(san);
    if (!parts) return null;
    const legal = Chess.legalMoves(state);

    if (parts.castle) {
      return legal.find(m => m.castle === parts.castle) || null;
    }
    const matches = legal.filter(m => {
      if (m.piece.toUpperCase() !== parts.piece) return false;
      if (Chess.algebraic(m.to) !== parts.to) return false;
      if (parts.promo && m.promo !== parts.promo) return false;
      if (!parts.promo && m.promo) return false;
      // Désambiguïsation partielle éventuelle (tolère le superflu)
      const fromAlg = Chess.algebraic(m.from);
      if (parts.fromFile && fromAlg[0] !== parts.fromFile) return false;
      if (parts.fromRank && fromAlg[1] !== parts.fromRank) return false;
      return true;
    });
    return matches.length >= 1 ? matches[0] : null;
  }

  const Pgn = { parsePgn, sanComponents, sanToMove };
  global.Pgn = Pgn;
  if (typeof module !== 'undefined' && module.exports) module.exports = Pgn;
})(typeof self !== 'undefined' ? self : globalThis);
