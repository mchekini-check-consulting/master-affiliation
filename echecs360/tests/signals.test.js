/*
 * Validation du module signals.js : explications de coups et signaux faibles.
 * Exécution : node tests/signals.test.js
 */
const Chess = require('../src/main/resources/static/app/js/engine.js');
const Pgn = require('../src/main/resources/static/app/js/pgn.js');
const Signals = require('../src/main/resources/static/app/js/signals.js');

let failures = 0;
function check(label, condition, detail) {
  if (condition) console.log('OK     ' + label);
  else { console.log('ÉCHEC  ' + label + (detail ? ' — ' + detail : '')); failures++; }
}

function reasonsFor(fen, san) {
  const s = fen ? Chess.fromFen(fen) : Chess.newGame();
  const move = Pgn.sanToMove(Chess, s, san);
  return Signals.explainMove(Chess, s, move).join(' | ');
}

// --------------------------------------------------------- explications --
check('e4 : centre + diagonale du fou',
  reasonsFor(null, 'e4').includes('centre') && reasonsFor(null, 'e4').includes('diagonale du fou'));
check('Nf3 : développement', reasonsFor(null, 'Nf3').includes('développe'));
check('O-O : roque',
  reasonsFor('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', 'O-O').includes('roque'));
check('Qxf7# : capture + mat',
  reasonsFor('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', 'Qxf7#').includes('mat'));
check('e4 ne mentionne pas le luft (roi au centre)',
  !reasonsFor(null, 'e4').includes('air'));

// -------------------------------------------------------------- signaux --
// Tour blanche a1 attaquée par la dame d1... construisons : dame noire attaque une tour non défendue
const s1 = Chess.fromFen('4k3/8/8/8/3q4/8/5PPP/R5K1 w - - 0 30');
const sig1 = Signals.detectSignals(Chess, s1);
check('tour a1 non défendue détectée',
  sig1.tactiques.some(t => t.camp === 'w' && t.titre.includes('a1')),
  JSON.stringify(sig1.tactiques.map(t => t.titre)));

// Pion passé + colonne ouverte
const s2 = Chess.fromFen('4k3/8/8/4P3/8/8/8/R3K3 w - - 0 40');
const sig2 = Signals.detectSignals(Chess, s2);
check('pion passé e5 détecté', sig2.positionnels.some(p => p.titre.includes('pion passé en e5')));

// Retard de développement
const s3 = Chess.fromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 10');
const sig3 = Signals.detectSignals(Chess, s3);
check('retard de développement détecté',
  sig3.positionnels.some(p => p.titre.includes('retard de développement')));

// Fourchette : roi e8 et tour a8 noirs, à distance de cavalier de c7, cavalier blanc en jeu
const s4 = Chess.fromFen('r3k3/8/8/8/4N3/8/8/4K3 b - - 0 30');
const sig4 = Signals.detectSignals(Chess, s4);
check('géométrie de fourchette détectée',
  sig4.tactiques.some(t => t.camp === 'b' && t.titre.includes('fourchette')),
  JSON.stringify(sig4.tactiques.map(t => t.titre)));

console.log(failures === 0 ? '\nTOUT EST VALIDE (signals).' : '\n' + failures + ' ÉCHEC(S).');
process.exit(failures ? 1 : 0);
