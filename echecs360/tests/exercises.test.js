/*
 * Validation des données des « Exercices intensifs ».
 *
 * Pour chaque MAT :
 *  - la FEN se charge (position légale, un roi par camp, roi non-au-trait
 *    pas en prise) ;
 *  - la solution se rejoue coup par coup (chaque SAN correspond à un coup
 *    légal unique via le moteur) ;
 *  - le dernier coup délivre bien un échec et mat.
 *
 * Pour chaque FINALE :
 *  - la FEN se charge, la partie n'est pas terminée, le trait est au joueur ;
 *  - l'objectif est cohérent (mat/nulle) et les textes sont complets.
 *
 * Exécution : node tests/exercises.test.js
 */
const Chess = require('../src/main/resources/static/app/js/engine.js');
const Pgn = require('../src/main/resources/static/app/js/pgn.js');
const { MATS, FINALES } = require('../src/main/resources/static/app/js/exercises-data.js');

let failures = 0;
function fail(label, detail) {
  console.log('ÉCHEC  ' + label + (detail ? ' — ' + detail : ''));
  failures++;
}
function ok(label) {
  console.log('OK     ' + label);
}

// ----------------------------------------------------------------- mats --

console.log('=== Mats célèbres (' + MATS.length + ') ===');
for (const exercise of MATS) {
  const label = exercise.id;
  let state;
  try {
    state = Chess.fromFen(exercise.fen);
  } catch (e) {
    fail(label, 'FEN invalide : ' + e.message);
    continue;
  }
  if (Chess.statusOf(state).over) {
    fail(label, 'la position de départ est déjà terminée');
    continue;
  }
  // Rejoue la solution
  let valid = true;
  for (let i = 0; i < exercise.solution.length; i++) {
    const san = exercise.solution[i];
    const move = Pgn.sanToMove(Chess, state, san);
    if (!move) {
      fail(label, 'coup ' + (i + 1) + ' (« ' + san + ' ») introuvable/illégal');
      valid = false;
      break;
    }
    // Le SAN régénéré par le moteur doit correspondre (mêmes suffixes +/#)
    const engineSan = Chess.sanOf(state, move);
    if (engineSan !== san) {
      fail(label, 'coup ' + (i + 1) + ' : SAN « ' + san + ' » ≠ moteur « ' + engineSan + ' »');
      valid = false;
      break;
    }
    Chess.play(state, move);
  }
  if (!valid) continue;
  const status = Chess.statusOf(state);
  if (!status.over || status.reason !== 'échec et mat') {
    fail(label, 'la solution ne se termine pas par un mat (' + JSON.stringify(status) + ')');
    continue;
  }
  // Le gagnant doit être le camp au trait au départ
  const first = Chess.fromFen(exercise.fen);
  const expectedResult = first.turn === 'w' ? '1-0' : '0-1';
  if (status.result !== expectedResult) {
    fail(label, 'mauvais vainqueur : ' + status.result);
    continue;
  }
  // Explications complètes
  const rubriques = ['idee', 'mecanisme', 'reconnaitre', 'erreur'];
  const manquantes = rubriques.filter(r => !exercise.explication || !exercise.explication[r]);
  if (manquantes.length > 0) {
    fail(label, 'explication incomplète : ' + manquantes.join(', '));
    continue;
  }
  ok(label + ' (' + exercise.solution.length + ' demi-coups, mat vérifié)');
}

// -------------------------------------------------------------- finales --

console.log('=== Finales de base (' + FINALES.length + ') ===');
for (const exercise of FINALES) {
  const label = exercise.id;
  let state;
  try {
    state = Chess.fromFen(exercise.fen);
  } catch (e) {
    fail(label, 'FEN invalide : ' + e.message);
    continue;
  }
  const status = Chess.statusOf(state);
  if (status.over) {
    fail(label, 'la position de départ est déjà terminée : ' + status.reason);
    continue;
  }
  if (state.turn !== exercise.joueur) {
    fail(label, 'le trait (' + state.turn + ') n\'est pas au joueur (' + exercise.joueur + ')');
    continue;
  }
  if (exercise.objectif !== 'mat' && exercise.objectif !== 'nulle') {
    fail(label, 'objectif inconnu : ' + exercise.objectif);
    continue;
  }
  if (!exercise.indice || !exercise.plan) {
    fail(label, 'indice ou plan manquant');
    continue;
  }
  const rubriques = ['idee', 'mecanisme', 'reconnaitre', 'erreur'];
  const manquantes = rubriques.filter(r => !exercise.explication || !exercise.explication[r]);
  if (manquantes.length > 0) {
    fail(label, 'explication incomplète : ' + manquantes.join(', '));
    continue;
  }
  // Démo des « étapes de résolution » : chaque coup légal (SAN canonique) ;
  // fin en mat du joueur pour l'objectif mat, sinon nulle atteinte ou
  // position ouverte accompagnée d'une légende finale (demoFin).
  if (!Array.isArray(exercise.demo) || exercise.demo.length === 0) {
    fail(label, 'demo manquante');
    continue;
  }
  let demoValid = true;
  const demoState = Chess.fromFen(exercise.fen);
  for (let i = 0; i < exercise.demo.length; i++) {
    const san = exercise.demo[i];
    const move = Pgn.sanToMove(Chess, demoState, san);
    if (!move) {
      fail(label, 'demo coup ' + (i + 1) + ' (« ' + san + ' ») introuvable/illégal');
      demoValid = false;
      break;
    }
    const engineSan = Chess.sanOf(demoState, move);
    if (engineSan !== san) {
      fail(label, 'demo coup ' + (i + 1) + ' : SAN « ' + san + ' » ≠ moteur « ' + engineSan + ' »');
      demoValid = false;
      break;
    }
    Chess.play(demoState, move);
  }
  if (!demoValid) continue;
  const demoStatus = Chess.statusOf(demoState);
  if (exercise.objectif === 'mat') {
    const expected = exercise.joueur === 'w' ? '1-0' : '0-1';
    const mate = demoStatus.over && demoStatus.reason === 'échec et mat' && demoStatus.result === expected;
    if (!mate && !exercise.demoFin) {
      fail(label, 'la demo ne mate pas et n\'a pas de demoFin (' + JSON.stringify(demoStatus) + ')');
      continue;
    }
  } else {
    const draw = demoStatus.over && demoStatus.result === '1/2-1/2';
    if (!draw && !exercise.demoFin) {
      fail(label, 'la demo (nulle) doit finir nulle ou porter une demoFin');
      continue;
    }
    if (demoStatus.over && demoStatus.result !== '1/2-1/2') {
      fail(label, 'la demo (nulle) se termine par ' + demoStatus.result);
      continue;
    }
  }
  ok(label + ' (objectif : ' + exercise.objectif + ', demo : ' + exercise.demo.length + ' demi-coups, fin : '
      + (demoStatus.over ? demoStatus.reason : 'position ouverte + légende') + ')');
}

// ------------------------------------------------------------- unicité --

const ids = [...MATS, ...FINALES].map(e => e.id);
if (new Set(ids).size !== ids.length) fail('ids', 'identifiants en double');
else ok('identifiants uniques (' + ids.length + ' exercices)');

console.log(failures === 0
  ? '\nTOUT EST VALIDE : ' + MATS.length + ' mats + ' + FINALES.length + ' finales.'
  : '\n' + failures + ' ÉCHEC(S).');
process.exit(failures === 0 ? 1 * (failures > 0) : 0);
