/*
 * Test perft du moteur de règles — validation obligatoire.
 * Depuis la position initiale, le nombre de positions atteignables doit être
 * exactement 20 / 400 / 8 902 / 197 281 aux profondeurs 1 à 4.
 *
 * Exécution : node tests/perft.test.js
 */
const Chess = require('../src/main/resources/static/app/js/engine.js');

const EXPECTED = { 1: 20, 2: 400, 3: 8902, 4: 197281 };

let failed = false;
const state = Chess.newGame();
for (const depth of [1, 2, 3, 4]) {
  const start = Date.now();
  const nodes = Chess.perft(state, depth);
  const ms = Date.now() - start;
  const ok = nodes === EXPECTED[depth];
  if (!ok) failed = true;
  console.log(
    `perft(${depth}) = ${nodes.toLocaleString('fr-FR')} ` +
    `(attendu ${EXPECTED[depth].toLocaleString('fr-FR')}) ` +
    `${ok ? 'OK' : 'ÉCHEC'} — ${ms} ms`
  );
}

// Vérifications complémentaires : SAN et statut sur quelques coups connus
const s = Chess.newGame();
const e4 = Chess.legalMoves(s).find(m => Chess.algebraic(m.to) === 'e4' && m.piece === 'P');
const sanE4 = Chess.sanOf(s, e4);
if (sanE4 !== 'e4') { console.log(`SAN e4 incorrect : ${sanE4}`); failed = true; }
Chess.play(s, e4);
const nf6 = Chess.legalMoves(s).find(m => m.piece === 'n' && Chess.algebraic(m.to) === 'f6');
const sanNf6 = Chess.sanOf(s, nf6);
if (sanNf6 !== 'Nf6') { console.log(`SAN Nf6 incorrect : ${sanNf6}`); failed = true; }
console.log('SAN de base : OK');

// Mat du berger : la partie doit se terminer par échec et mat
const mate = Chess.newGame();
for (const sanTarget of ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#']) {
  const move = Chess.legalMoves(mate).find(m => Chess.sanOf(mate, m) === sanTarget);
  if (!move) { console.log(`Coup introuvable : ${sanTarget}`); failed = true; break; }
  Chess.play(mate, move);
}
const status = Chess.statusOf(mate);
if (!status.over || status.result !== '1-0' || status.reason !== 'échec et mat') {
  console.log(`Statut du mat du berger incorrect :`, status);
  failed = true;
} else {
  console.log('Mat du berger : OK (1-0, échec et mat)');
}

process.exit(failed ? 1 : 0);
