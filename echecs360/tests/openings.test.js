/*
 * Validation du répertoire d'ouvertures : chaque ligne se rejoue coup par
 * coup depuis la position initiale (SAN légal et canonique).
 * Exécution : node tests/openings.test.js
 */
const Chess = require('../src/main/resources/static/app/js/engine.js');
const Pgn = require('../src/main/resources/static/app/js/pgn.js');
const { OPENINGS } = require('../src/main/resources/static/app/js/openings-data.js');

let failures = 0;
function fail(label, detail) {
  console.log('ÉCHEC  ' + label + (detail ? ' — ' + detail : ''));
  failures++;
}

let total = 0;
for (const opening of OPENINGS) {
  if (opening.couleur !== 'w' && opening.couleur !== 'b') {
    fail(opening.id, 'couleur invalide');
    continue;
  }
  for (const ligne of opening.lignes) {
    total++;
    const label = opening.id + ' / ' + ligne.id;
    if (ligne.type !== 'ligne' && ligne.type !== 'piege') {
      fail(label, 'type invalide : ' + ligne.type);
      continue;
    }
    const state = Chess.newGame();
    let valid = true;
    for (let i = 0; i < ligne.coups.length; i++) {
      const san = ligne.coups[i][0];
      const move = Pgn.sanToMove(Chess, state, san);
      if (!move) {
        fail(label, 'coup ' + (i + 1) + ' (« ' + san + ' ») introuvable/illégal');
        valid = false;
        break;
      }
      const engineSan = Chess.sanOf(state, move);
      if (engineSan !== san) {
        fail(label, 'coup ' + (i + 1) + ' : SAN « ' + san + ' » ≠ moteur « ' + engineSan + ' »');
        valid = false;
        break;
      }
      Chess.play(state, move);
    }
    if (valid) console.log('OK     ' + label + ' (' + ligne.coups.length + ' demi-coups)');
  }
}

const ids = OPENINGS.flatMap(o => [o.id].concat(o.lignes.map(l => l.id)));
if (new Set(ids).size !== ids.length) fail('ids', 'identifiants en double');

console.log(failures === 0
  ? '\nTOUT EST VALIDE : ' + OPENINGS.length + ' ouverture(s), ' + total + ' lignes.'
  : '\n' + failures + ' ÉCHEC(S).');
process.exit(failures ? 1 : 0);
