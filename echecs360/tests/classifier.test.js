/*
 * Validation des modules move-classifier et weak-signal.
 * Exécution : node tests/classifier.test.js
 */
const Chess = require('../src/main/resources/static/app/js/engine.js');
const Pgn = require('../src/main/resources/static/app/js/pgn.js');
const Signals = require('../src/main/resources/static/app/js/signals.js');
const MoveClassifier = require('../src/main/resources/static/app/js/move-classifier.js');
const WeakSignalDetector = require('../src/main/resources/static/app/js/weak-signal.js');

let failures = 0;
function check(label, condition, detail) {
  if (condition) console.log('OK     ' + label);
  else { console.log('ÉCHEC  ' + label + (detail ? ' — ' + detail : '')); failures++; }
}

// ------------------------------------------------------ classification --
const c = (cpBefore, cpAfter, mover, extra) => MoveClassifier.classify(
  Object.assign({ cpBefore, cpAfter, mateBefore: null, mateAfter: null, mover, isBest: false }, extra));

check('gaffe : -250 cp pour les Blancs', c(50, -200, 'w').kind === 'blunder');
check('erreur : -120 cp', c(0, -120, 'w').kind === 'mistake');
check('imprécision : -60 cp', c(0, -60, 'w').kind === 'inaccuracy');
check('bon coup : -30 cp', c(0, -30, 'w').kind === 'good');
check('excellent : -5 cp', c(0, -5, 'w').kind === 'excellent');
check('meilleur coup : isBest', c(0, 0, 'w', { isBest: true }).kind === 'best');
check('perspective noire : gaffe noire = éval qui monte', c(-50, 250, 'b').kind === 'blunder');
check('mat permis = gaffe', c(0, 0, 'w', { mateAfter: -3 }).kind === 'blunder');
check('mat raté = gaffe', c(900, 300, 'w', { mateBefore: 2 }).kind === 'blunder');
check('déjà perdu : pas pire qu\'erreur', c(-900, -1200, 'w').kind === 'mistake');

// ------------------------------------------------------- explication --
// Dame blanche pendue en e5 : la réfutation Cxe5 la ramasse
const state = Chess.fromFen('4k3/8/2n5/4Q3/8/8/8/4K3 b - - 0 30');
const refut = Chess.legalMoves(state).find(m => Chess.sanOf(state, m) === 'Nxe5');
const txt = MoveClassifier.explain(Chess, Signals, {
  cls: MoveClassifier.KINDS.blunder,
  sanPlayed: 'Qe5',
  sanBest: 'Qd4',
  evalBestCp: 120,
  mateBefore: null, mateAfter: null,
  mover: 'w',
  stateAfter: state,
  refutation: Object.assign({}, refut, { san: 'Nxe5' })
});
check('explication : perd la dame après Nxe5',
  txt.includes('Gaffe') && txt.includes('perd la dame après Nxe5') && txt.includes('Qd4'), txt);

// Mat raté
const txt2 = MoveClassifier.explain(Chess, Signals, {
  cls: MoveClassifier.KINDS.blunder, sanPlayed: 'Rb1', sanBest: 'Qg7#',
  evalBestCp: null, mateBefore: 1, mateAfter: null, mover: 'w',
  stateAfter: null, refutation: null
});
check('explication : mat raté', txt2.includes('rate un mat forcé en 1 coup'), txt2);

// ------------------------------------------------------ signal faible --
// Coup hors top 5 sans perte d'éval : alerte
const s2 = Chess.fromFen('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1R1 b Qkq - 5 4');
const na5 = Chess.legalMoves(s2).find(m => Chess.sanOf(s2, m) === 'Na5');
const alerte = WeakSignalDetector.detect(Chess, Signals, {
  move: na5, stateBefore: s2,
  topUci: ['g8f6', 'f8c5', 'd7d6', 'h7h6', 'd8e7'],
  cpBefore: 30, cpAfter: 25, mover: 'b', player: 'w'
});
check('signal faible : coup hors top 5 sans perte', alerte !== null && alerte.message.includes('Signal faible'),
  JSON.stringify(alerte));

// Coup DANS le top 5 : pas d'alerte
const nf6 = Chess.legalMoves(s2).find(m => Chess.sanOf(s2, m) === 'Nf6');
const rien = WeakSignalDetector.detect(Chess, Signals, {
  move: nf6, stateBefore: s2,
  topUci: ['g8f6', 'f8c5', 'd7d6', 'h7h6', 'd8e7'],
  cpBefore: 30, cpAfter: 28, mover: 'b', player: 'w'
});
check('pas d\'alerte pour un coup principal', rien === null, JSON.stringify(rien));

// Coup hors top 5 MAIS qui perd beaucoup : pas un signal, juste mauvais
const mauvais = WeakSignalDetector.detect(Chess, Signals, {
  move: na5, stateBefore: s2,
  topUci: ['g8f6', 'f8c5', 'd7d6', 'h7h6', 'd8e7'],
  cpBefore: 30, cpAfter: 180, mover: 'b', player: 'w'
});
check('pas d\'alerte pour un coup simplement mauvais', mauvais === null, JSON.stringify(mauvais));

console.log(failures === 0 ? '\nTOUT EST VALIDE (classifier + weak-signal).' : '\n' + failures + ' ÉCHEC(S).');
process.exit(failures ? 1 : 0);
