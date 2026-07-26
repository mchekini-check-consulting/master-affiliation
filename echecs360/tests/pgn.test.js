/*
 * Test du parseur PGN tolérant : rejeu complet d'un PGN au format chess.com
 * (en-têtes, commentaires d'horloge {[%clk]}, variantes, NAG, SAN
 * sur-désambiguïsés). La partie témoin est la « partie de l'Opéra »
 * (Morphy, 1858), qui se termine par échec et mat.
 *
 * Exécution : node tests/pgn.test.js
 */
const Chess = require('../src/main/resources/static/app/js/engine.js');
const Pgn = require('../src/main/resources/static/app/js/pgn.js');

// PGN au format d'export chess.com : horloges, NAG, une variante, et
// « Ngf3 » volontairement sur-désambiguïsé (seul le cavalier g1 va en f3).
const PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.07.20"]
[Round "-"]
[White "morphy_fan"]
[WhiteElo "1856"]
[Black "duke_karl"]
[BlackElo "1432"]
[Result "1-0"]
[TimeControl "600"]
[Termination "morphy_fan a gagné par échec et mat"]

1. e4 {[%clk 0:09:58.1]} 1... e5 {[%clk 0:09:57.3]} 2. Ngf3 {[%clk 0:09:55]}
2... d6 {[%clk 0:09:50.2]} 3. d4 {[%clk 0:09:52]} 3... Bg4 $2 {[%clk 0:09:41]}
4. dxe5 {[%clk 0:09:47.7]} 4... Bxf3 {[%clk 0:09:33.9]} 5. Qxf3 {[%clk 0:09:45]}
5... dxe5 {[%clk 0:09:30]} 6. Bc4 {[%clk 0:09:43.5]} 6... Nf6 (6... Qe7 7. Nc3)
7. Qb3 {[%clk 0:09:40]} 7... Qe7 {[%clk 0:09:11.6]} 8. Nc3 {[%clk 0:09:35.2]}
8... c6 {[%clk 0:09:05]} 9. Bg5 {[%clk 0:09:31]} 9... b5 $4 {[%clk 0:08:52.8]}
10. Nxb5 {[%clk 0:09:27.4]} 10... cxb5 {[%clk 0:08:47]} 11. Bxb5+ {[%clk 0:09:24]}
11... Nbd7 {[%clk 0:08:39.5]} 12. O-O-O {[%clk 0:09:20.9]} 12... Rd8 {[%clk 0:08:30]}
13. Rxd7 {[%clk 0:09:15]} 13... Rxd7 {[%clk 0:08:24.1]} 14. Rd1 {[%clk 0:09:11.8]}
14... Qe6 {[%clk 0:08:11]} 15. Bxd7+ {[%clk 0:09:07]} 15... Nxd7 {[%clk 0:08:05.6]}
16. Qb8+ {[%clk 0:09:02.3]} 16... Nxb8 {[%clk 0:08:01]} 17. Rd8# {[%clk 0:08:58]} 1-0`;

let failed = false;
function check(label, condition) {
  console.log((condition ? 'OK    ' : 'ÉCHEC ') + label);
  if (!condition) failed = true;
}

const { headers, sans } = Pgn.parsePgn(PGN);
check('En-têtes : White = morphy_fan', headers.White === 'morphy_fan');
check('En-têtes : Result = 1-0', headers.Result === '1-0');
check('33 demi-coups extraits (variante et horloges ignorées)', sans.length === 33);
check('Le SAN sur-désambiguïsé « Ngf3 » est conservé tel quel', sans[2] === 'Ngf3');

// Rejeu complet sur le moteur : chaque SAN doit correspondre à un coup légal
const state = Chess.newGame();
let replayed = 0;
for (const san of sans) {
  const move = Pgn.sanToMove(Chess, state, san);
  if (!move) { console.log('ÉCHEC coup introuvable : ' + san + ' (demi-coup ' + (replayed + 1) + ')'); failed = true; break; }
  Chess.play(state, move);
  replayed++;
}
check('Les 33 demi-coups sont rejoués sans erreur', replayed === 33);

const status = Chess.statusOf(state);
check('Position finale : échec et mat, victoire des Blancs',
    status.over && status.result === '1-0' && status.reason === 'échec et mat');

// Robustesse : SAN avec suffixes et roque en notation « 0-0 »
check('sanComponents tolère les suffixes (Qxf7#!?)',
    JSON.stringify(Pgn.sanComponents('Qxf7#!?')) === JSON.stringify({
      piece: 'Q', fromFile: null, fromRank: null, capture: true, to: 'f7', promo: null
    }));
check('sanComponents comprend « 0-0-0 »', Pgn.sanComponents('0-0-0').castle === 'Q');
check('sanComponents comprend la promotion « e8=Q »', Pgn.sanComponents('e8=Q').promo === 'q');

process.exit(failed ? 1 : 0);
