/*
 * Échecs360 — données des « Exercices intensifs ».
 *
 * Séparées du code UI pour faciliter l'ajout d'exercices.
 *
 * MATS (type 'mat') :
 *   { id, titre, difficulte, fen, solution: [SAN...], explication }
 *   La solution alterne coups du joueur et réponses adverses scriptées ;
 *   elle se termine toujours par un mat (vérifié par tests/exercises.test.js).
 *
 * FINALES (type 'finale') — jouées contre le bot :
 *   { id, titre, difficulte, fen, joueur: 'w'|'b', objectif: 'mat'|'nulle',
 *     demo: [SAN...], demoFin?, indice, plan, explication }
 *   `demo` est la ligne des « étapes de résolution » (visionneuse pédagogique) :
 *   elle va jusqu'au mat pour les finales gagnantes, ou s'arrête sur la position
 *   clé (pat, forteresse, échec perpétuel...) avec `demoFin` en légende finale.
 *
 * explication = { idee, mecanisme, reconnaitre, erreur } — en français.
 */
(function (global) {
  'use strict';

  // ======================================================================
  // SECTION 1 — MATS CÉLÈBRES (« trouve le mat »)
  // ======================================================================
  const MATS = [
    {
      id: 'mat-berger',
      titre: 'Mat du berger',
      difficulte: 'facile',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
      solution: ['Qxf7#'],
      explication: {
        idee: "Le mat du berger vise la case f7, le point le plus faible du camp noir en début de partie : elle n'est défendue que par le roi. La dame et le fou convergent dessus dès les premiers coups.",
        mecanisme: "La dame capture en f7 en étant protégée par le fou c4 : le roi ne peut ni la prendre, ni fuir — d8 et f8 sont occupées par ses propres pièces, e7 est contrôlée par la dame.",
        reconnaitre: "Un adversaire qui ne pare pas la double attaque dame + fou sur f7 (par exemple avec g6 ou Fe7 au bon moment). Attention : contre une défense correcte, la sortie précoce de la dame fait perdre du temps.",
        erreur: "Croire que ce plan « marche toujours » : après 3...g6 !, la dame doit reculer et les Noirs développent en gagnant des temps. C'est un piège à connaître, pas une ouverture à adopter."
      }
    },
    {
      id: 'mat-sot',
      titre: 'Mat du sot (mat en 2 coups)',
      difficulte: 'facile',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2',
      solution: ['Qh4#'],
      explication: {
        idee: "Le mat le plus rapide possible aux échecs : deux coups. Les Blancs ont affaibli fatalement la diagonale e1-h4 avec f3 et g4, et la dame noire s'y engouffre.",
        mecanisme: "La dame en h4 attaque le roi e1 le long de la diagonale h4-e1. Aucune pièce blanche ne peut s'interposer en f2 ou g3, et le roi n'a aucune case de fuite : e2, d2 et f2 sont occupées ou contrôlées.",
        reconnaitre: "Des pions f et g avancés très tôt devant un roi non roqué : la diagonale du roi est ouverte. Regardez systématiquement si votre dame peut s'y installer.",
        erreur: "Affaiblir soi-même cette diagonale en début de partie : f3/g4 (ou f6/g5 pour les Noirs) sans raison est presque toujours une faute grave."
      }
    },
    {
      id: 'mat-legal',
      titre: 'Mat de Légal',
      difficulte: 'moyen',
      fen: 'rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
      solution: ['Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'],
      explication: {
        idee: "Un sacrifice de dame thématique : le cavalier prend en e5 en laissant la dame en prise. Si l'adversaire gagne la dame, il se fait mater par trois pièces mineures coordonnées.",
        mecanisme: "Après Cxe5 Fxd1 ?? , Fxf7+ force le roi en e7 (sa seule case), et Cd5 est mat : le fou f7 contrôle e8 et e6, le cavalier e5 contrôle d7, et les propres pièces noires enferment leur roi.",
        reconnaitre: "Un fou adverse cloue votre cavalier f3 (ou f6) alors que la « clouade » n'est pas réelle : si votre cavalier peut prendre un pion central en découvrant une attaque sur f7, calculez le sacrifice.",
        erreur: "Côté défense : prendre la dame par réflexe. Après Cxe5, le bon coup était dxe5 (en ne gagnant qu'un pion), pas Fxd1 qui perd la partie sur-le-champ."
      }
    },
    {
      id: 'mat-couloir',
      titre: 'Mat du couloir',
      difficulte: 'facile',
      fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
      solution: ['Re8#'],
      explication: {
        idee: "Le mat le plus fréquent de tous : une tour (ou une dame) s'infiltre sur la dernière rangée, où le roi est prisonnier de ses propres pions de roque.",
        mecanisme: "La tour contrôle toute la 8e rangée. Les pions f7, g7, h7 — normalement protecteurs — bloquent toutes les cases de fuite du roi : le rempart devient une prison.",
        reconnaitre: "Une dernière rangée adverse mal défendue (aucune tour ou dame ne la surveille) et un roi sans « luft » (trou d'aération). Comptez les défenseurs de la rangée avant tout échange de tours.",
        erreur: "Oublier de créer une case de fuite (h3/h6) quand les tours quittent la première rangée. Un coup de pion « inutile » vaut mieux qu'un mat du couloir subi."
      }
    },
    {
      id: 'mat-etouffe',
      titre: "Mat à l'étouffée",
      difficulte: 'difficile',
      fen: '5r1k/pp4pp/8/q5N1/8/1Q6/5PPP/6K1 w - - 0 1',
      solution: ['Nf7+', 'Kg8', 'Nh6+', 'Kh8', 'Qg8+', 'Rxg8', 'Nf7#'],
      explication: {
        idee: "Le joyau des mats : le cavalier mate seul un roi entièrement enfermé par ses propres pièces. La séquence complète (échange de checks, sacrifice de dame Dg8+ !, puis Cf7#) est connue depuis Philidor.",
        mecanisme: "L'échec double Ch6+ force le roi en h8 (sa tour f8 lui bloque f8). Dg8+ !! force Txg8 — le roi ne peut pas prendre, le cavalier h6 protège g8. Le cavalier revient en f7 : le roi est « étouffé » par sa tour g8 et ses pions g7/h7.",
        reconnaitre: "Roi adverse en g8/h8, dame à distance sur la diagonale a2-g8, votre cavalier pouvant atteindre f7 puis h6. Si une tour adverse peut être attirée en g8, la combinaison est en l'air.",
        erreur: "Jouer Cf7+ en oubliant l'ordre des coups : sans l'échec double préalable ni le sacrifice de dame, l'adversaire glisse son roi ou prend le cavalier. La force de la séquence est que chaque coup est forcé."
      }
    },
    {
      id: 'mat-boden',
      titre: 'Mat de Boden',
      difficulte: 'difficile',
      fen: '2kr4/pp1p2pp/2n5/8/Q4B2/8/4BPPP/6K1 w - - 0 1',
      solution: ['Qxc6+', 'bxc6', 'Ba6#'],
      explication: {
        idee: "Deux fous en ciseaux matent un roi qui a roqué long. Un sacrifice de dame arrache d'abord la couverture de pions.",
        mecanisme: "Dxc6+ ! force bxc6 : la colonne b s'ouvre… mais surtout la diagonale a6-c8. Fa6 mate : le fou de cases noires (f4) contrôle b8 et c7, la tour d8 et le pion d7 bloquent le reste. Chaque fuite est couverte par exactement une pièce : c'est le « ciseau ».",
        reconnaitre: "Roi adverse en c8 après un grand roque, pion b7 ne pouvant capturer qu'en ouvrant la diagonale fatale, et vos deux fous braqués sur l'aile dame. Le sacrifice sur c6 (ou c3 pour les Noirs) est la clé d'entrée classique.",
        erreur: "Compter les défenseurs de c6 sans compter les CASES : même si la prise bxc6 « gagne la dame », c'est le réseau de mat qui décide. Côté défense, éviter de laisser b7/g2 comme seul rempart capturant."
      }
    },
    {
      id: 'mat-anastasie',
      titre: "Mat d'Anastasie",
      difficulte: 'difficile',
      fen: '1rb3k1/p2p1ppp/8/3N3Q/8/R7/5PP1/6K1 w - - 0 1',
      solution: ['Ne7+', 'Kh8', 'Qxh7+', 'Kxh7', 'Rh3#'],
      explication: {
        idee: "Un cavalier en e7 prive le roi des cases g8 et g6, puis un sacrifice de dame en h7 attire le roi sur la colonne h où la tour l'exécute.",
        mecanisme: "Ce7+ chasse le roi en h8. Dxh7+ !! force Rxh7 (la dame se sacrifie pour ouvrir la colonne). Th3 mate : la tour contrôle la colonne h, le cavalier e7 verrouille g8 ET g6, le pion g7 bloque la dernière fuite.",
        reconnaitre: "Roi adverse au bord, votre cavalier pouvant atteindre e7 (ou e2 pour les Noirs) avec échec, une tour mobilisable sur la colonne h et un pion h adverse capturable par la dame. Le trio cavalier-dame-tour est la signature.",
        erreur: "Sacrifier la dame AVANT d'avoir installé le cavalier : sans Ce7, le roi s'échappe par g8 ou g6 et le sacrifice n'est qu'un cadeau."
      }
    },
    {
      id: 'mat-arabe',
      titre: 'Mat des Arabes',
      difficulte: 'facile',
      fen: 'r6k/pp1R4/5N2/8/8/8/5PPK/8 w - - 0 1',
      solution: ['Rh7#'],
      explication: {
        idee: "Le plus ancien mat répertorié (manuscrits arabes du IXe siècle) : tour et cavalier, le duo le plus harmonieux, matent un roi dans le coin.",
        mecanisme: "La tour vient en h7, collée au roi, PROTÉGÉE par le cavalier f6 — c'est le point clé. Le même cavalier contrôle aussi g8 : le roi n'a ni prise ni fuite.",
        reconnaitre: "Roi adverse dans le coin, votre cavalier en f6 (ou f3, c6, c3 selon le coin) : toute tour qui atteint la colonne ou la rangée du bord mate. Le cavalier « f6 » vaut de l'or dans les attaques de grand format.",
        erreur: "Échanger ce cavalier f6 contre une pièce passive « pour simplifier » : sans lui, ni h7 ni g8 ne sont contrôlées et l'attaque s'éteint."
      }
    },
    {
      id: 'mat-greco',
      titre: 'Mat de Gréco',
      difficulte: 'moyen',
      fen: '5r1k/pp4p1/8/8/2B3Q1/8/5PPP/6K1 w - - 0 1',
      solution: ['Qh4#'],
      explication: {
        idee: "Décrit par Gioachino Greco au XVIIe siècle : le fou verrouille la case g8 à distance, et la dame mate sur la colonne h ouverte.",
        mecanisme: "Le pion g7 emprisonne son propre roi en h8. Le fou c4 contrôle g8 depuis l'autre bout de l'échiquier. Il suffit à la dame d'occuper la colonne h — ici Dh4# — pour que tout soit couvert.",
        reconnaitre: "Colonne h ouverte (le pion h adverse a disparu ou avancé), roi en h8 derrière son pion g7, et votre fou de cases blanches actif sur la diagonale a2-g8. La dame n'a plus qu'à basculer.",
        erreur: "Laisser l'adversaire jouer ...Tf8-f7 ou ...d5 à temps pour couper la diagonale du fou : le mat repose entièrement sur le contrôle de g8."
      }
    },
    {
      id: 'mat-escalier',
      titre: "Mat de l'escalier (deux tours)",
      difficulte: 'moyen',
      fen: '1K6/7R/3k4/8/8/8/8/6R1 w - - 0 1',
      solution: ['Rg6+', 'Kd5', 'Rh5+', 'Kd4', 'Rg4+', 'Kd3', 'Rh3+', 'Kd2', 'Rg2+', 'Kd1', 'Rh1#'],
      explication: {
        idee: "Deux tours suffisent à mater sans l'aide du roi : elles descendent l'échiquier comme un rouleau compresseur, rangée par rangée.",
        mecanisme: "Une tour donne échec sur une rangée, forçant le roi à reculer ; l'autre tour contrôle la rangée qu'il vient de quitter. On alterne — c'est « l'escalier » — jusqu'à la dernière rangée où l'échec devient mat.",
        reconnaitre: "Dès que vous avez deux tours (ou dame + tour) contre un roi nu ou presque : inutile d'approcher votre roi, l'escalier mate en quelques coups. Gardez simplement les tours éloignées du roi adverse (sur les colonnes lointaines).",
        erreur: "Laisser le roi adverse s'approcher d'une tour et la gagner. Si le roi attaque une tour, déplacez-la à l'autre bout de sa rangée : l'escalier continue."
      }
    },
    {
      id: 'mat-lolli',
      titre: 'Mat de Lolli',
      difficulte: 'moyen',
      fen: '5rk1/pp3p1p/5P2/8/8/8/3Q2PP/6K1 w - - 0 1',
      solution: ['Qh6', 'Re8', 'Qg7#'],
      explication: {
        idee: "Un pion avancé en f6 (ou f3) est un poignard planté dans le roque : il suffit d'amener la dame en g7, protégée par ce pion, pour mater.",
        mecanisme: "Le pion f6 contrôle g7. La dame s'infiltre par h6 (menaçant déjà le mat), puis se pose en g7 : le roi ne peut pas la prendre (pion f6), et toutes ses cases — f8, h8, h7 — sont couvertes ou bloquées.",
        reconnaitre: "Votre pion atteint f6 face à un roque où g7 a disparu ou est affaibli, et la dame a un chemin vers h6/g7. C'est aussi le signal d'alarme côté défense : un pion adverse en f6 est presque toujours une urgence absolue.",
        erreur: "Tarder à exploiter le pion f6 et laisser l'adversaire jouer ...Tf8-e8 puis ...Ff8, le seul regroupement défensif. La fenêtre de tir est courte."
      }
    },
    {
      id: 'mat-damiano',
      titre: 'Mat de Damiano',
      difficulte: 'moyen',
      fen: '5rk1/pp3pp1/6P1/8/8/8/5PPP/3Q2K1 w - - 0 1',
      solution: ['Qh5', 'b5', 'Qh7#'],
      explication: {
        idee: "Publié par Damiano en… 1512 : un pion en g6 soutient l'entrée décisive de la dame en h7. L'un des schémas d'attaque les plus anciens et les plus actuels.",
        mecanisme: "Le pion g6 fait deux choses : il contrôle h7 (protégeant la dame qui s'y pose) et il enferme le roi. Dh5 menace le mat imparable ; Dh7 est mat car f8 et f7 sont bloquées par les propres pièces noires.",
        reconnaitre: "Un pion qui peut se fixer en g6 (souvent après h5-h6xg7 ou un sacrifice sur g6), la colonne h accessible à la dame. Dans la version historique complète, deux tours se sacrifient en h8 pour ouvrir la colonne — l'idée finale reste celle-ci.",
        erreur: "Pousser g6 sans plan de suivi : si la dame ne peut pas rejoindre la colonne h rapidement, le pion g6 peut devenir une simple faiblesse."
      }
    },
    {
      id: 'mat-opera',
      titre: "Mat de l'opéra (Morphy)",
      difficulte: 'moyen',
      fen: '4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16',
      solution: ['Qb8+', 'Nxb8', 'Rd8#'],
      explication: {
        idee: "La conclusion de la plus célèbre partie de l'histoire (Morphy contre le duc de Brunswick et le comte Isouard, opéra de Paris, 1858) : sacrifice de dame pour dévier le dernier défenseur, puis mat de la tour soutenue par le fou.",
        mecanisme: "Db8+ !! oblige le cavalier d7 — seul défenseur de la case d8 — à quitter son poste (Cxb8). Td8 mate alors : la tour est protégée par le fou g5 via la diagonale d8-g5, et le fou contrôle aussi e7. Le roi est cloué sur place par ses propres pièces.",
        reconnaitre: "Roi adverse resté au centre, colonne d (ou e) ouverte pour votre tour, et un défenseur unique surchargé. Cherchez le coup qui DÉVIE ce défenseur, même au prix de la dame : comptez les cases, pas le matériel.",
        erreur: "Développer lentement quand l'adversaire est en retard de développement : Morphy a gagné parce que chaque coup créait une menace. L'erreur inverse — côté défense — est de grappiller des pions avec la dame en laissant son roi au centre."
      }
    },
    {
      id: 'mat-pillsbury',
      titre: 'Mat de Pillsbury',
      difficulte: 'moyen',
      fen: '5rk1/pp3p1p/8/8/8/8/PB3P1P/2KR4 w - - 0 1',
      solution: ['Bf6', 'a5', 'Rg1#'],
      explication: {
        idee: "Le duo fou sur la grande diagonale + tour sur la colonne g démolit un roque dont le pion g a disparu. Signature de Harry Nelson Pillsbury, attaquant redoutable des années 1890.",
        mecanisme: "Le fou en f6 verrouille g7 et h8 : le roi g8 n'a plus une seule case sombre. La tour arrive en g1 : échec sur la colonne g — et c'est déjà mat, car f8 et f7 sont occupées par les propres pièces noires.",
        reconnaitre: "Colonne g ouverte face au roque adverse et votre fou de cases noires pouvant s'ancrer en f6 (souvent via un sacrifice d'échange en g7 dans la version complète). Fou f6 + tour g = réseau de mat quasi automatique.",
        erreur: "Inverser l'ordre : la tour en g1 sans le fou en f6 laisse le roi fuir en h8 puis g7. Installez d'abord le verrou, ensuite l'échec."
      }
    },
    {
      id: 'mat-epaulettes',
      titre: 'Mat des épaulettes',
      difficulte: 'facile',
      fen: '3rkr2/pp4pp/8/8/8/7Q/5PPP/6K1 w - - 0 1',
      solution: ['Qe6#'],
      explication: {
        idee: "Le roi porte ses deux tours comme des épaulettes : elles occupent les cases d8 et f8, et deviennent ses geôlières. La dame mate seule, face à lui.",
        mecanisme: "Dg4-e6 : échec sur la colonne e. Le roi ne peut pas s'écarter (d8 et f8 sont prises par ses tours), ni avancer (d7, e7, f7 sont contrôlées par la dame). Aucune pièce ne peut s'interposer en e7.",
        reconnaitre: "Un roi adverse flanqué de ses propres pièces sur les deux cases latérales — souvent après une fuite précipitée ou des tours passives en d8/f8. La dame cherche alors la case frontale à distance de deux (e6 contre e8).",
        erreur: "Donner l'échec depuis une case adjacente non protégée : la dame doit frapper à DISTANCE (e6, pas e7) pour ne pas être capturée par le roi."
      }
    },
    {
      id: 'mat-blackburne',
      titre: 'Mat de Blackburne',
      difficulte: 'difficile',
      fen: '5rk1/pp3p2/8/6N1/8/3B4/PB3PPP/6K1 w - - 0 1',
      solution: ['Bh7#'],
      explication: {
        idee: "Trois pièces mineures seulement — deux fous et un cavalier — étranglent un roque. L'un des rares mats où la dame est inutile, popularisé par Joseph Blackburne.",
        mecanisme: "Le fou d3 se pose en h7, protégé par le cavalier g5 : échec. Le second fou, en b2, contrôle toute la grande diagonale, donc g7 et h8. Le cavalier verrouille en plus f7. Chaque pièce couvre exactement les cases que les autres laissent.",
        reconnaitre: "La colonne ou diagonale vers h7 dégagée (pion h adverse disparu), votre cavalier en g5 et un fou fianchetté en b2. Ce trio apparaît souvent après un sacrifice ...Fxh7 refusé ou un roque affaibli par ...g6xf5.",
        erreur: "Sous-estimer les pièces mineures coordonnées : on cherche « la dame qui mate » alors que fou + fou + cavalier suffisent. Côté défense : l'échange du fianchetto adverse (Fb2) désamorce tout."
      }
    },
    {
      id: 'mat-baiser',
      titre: 'Mat du baiser de la mort',
      difficulte: 'facile',
      fen: '6k1/3Q4/5K2/8/8/8/8/8 w - - 0 1',
      solution: ['Qg7#'],
      explication: {
        idee: "LE mat fondamental de la finale dame contre roi : la dame vient s'installer au contact du roi adverse — le « baiser » — protégée par son propre roi.",
        mecanisme: "La dame collée au roi (g7 contre g8) contrôle les huit cases qui l'entourent. Le roi adverse ne peut pas la capturer : le roi f6 la protège. Toutes les fuites sont couvertes par la seule dame.",
        reconnaitre: "En finale D+R contre R : amenez d'abord votre roi au contact (à une case du roi adverse acculé au bord), PUIS collez la dame. C'est la conclusion standard de la technique de la boîte.",
        erreur: "Donner des échecs sans plan avec la dame seule : sans le soutien du roi, le baiser est impossible — et à force d'échecs au hasard, on finit par faire pat."
      }
    },
    {
      id: 'mat-reti',
      titre: 'Mat de Réti',
      difficulte: 'difficile',
      fen: 'rnb1kb1r/pp3ppp/2p5/4q3/4n3/3Q4/PPPB1PPP/2KR1BNR w kq - 0 9',
      solution: ['Qd8+', 'Kxd8', 'Bg5+', 'Kc7', 'Bd8#'],
      explication: {
        idee: "Richard Réti contre Savielly Tartakower (Vienne, 1910) : un sacrifice de dame ATTIRE le roi en d8, où un échec double fou + tour le conduit à un mat en trois coups seulement.",
        mecanisme: "Dd8+ !! Rxd8 (forcé). Fg5+ : échec DOUBLE — le fou depuis g5 et la tour d1 dont la ligne vient de s'ouvrir. Sur échec double, le roi doit bouger : Rc7. Fd8 revient alors mater, protégé par la tour d1, tandis que le cavalier b8 et le fou c8 noirs bloquent leurs propres cases de fuite.",
        reconnaitre: "Un roi adverse au centre avec votre tour sur la colonne d derrière un fou en d2 : la « batterie » d'échec double est armée. Cherchez le coup — même un sacrifice de dame — qui attire le roi sur la ligne de la batterie.",
        erreur: "Oublier la règle de l'échec double : on ne peut NI prendre NI s'interposer, seul le roi bouge. C'est ce qui rend ces combinaisons implacables — et incalculables si on ne connaît pas le motif."
      }
    },
    {
      id: 'mat-moulin',
      titre: 'Le moulin (Torre – Lasker)',
      difficulte: 'difficile',
      fen: 'r2q2k1/pp3pp1/4PB2/7p/8/6R1/5PPP/6K1 w - - 0 1',
      solution: ['Rxg7+', 'Kh8', 'Rxf7+', 'Kg8', 'Rg7+', 'Kh8', 'Rxb7+', 'Kg8', 'Rg7+', 'Kh8', 'Rg5+', 'Kh7', 'Rxh5+', 'Kg8', 'Rh8#'],
      explication: {
        idee: "Le « moulin » rendu célèbre par Torre contre Lasker (Moscou, 1925) : une tour et un fou enchaînent échecs à la découverte et échecs directs, dévorant une pièce adverse à chaque tour de manivelle.",
        mecanisme: "La tour prend en g7 avec échec (protégée par le fou f6). Quand elle s'écarte, le fou f6 donne un échec À LA DÉCOUVERTE sur h8 : le roi ne fait qu'osciller entre g8 et h8 pendant que la tour rafle f7, b7, h5… puis revient conclure en h8, toujours soutenue par le fou.",
        reconnaitre: "Fou ancré sur la grande diagonale visant h8, tour pouvant s'installer en g7, roi adverse enfermé dans le coin : chaque retrait de tour est un échec découvert « gratuit ». Comptez alors tout ce que la tour peut manger.",
        erreur: "Interrompre le moulin pour prendre la « grosse » pièce au mauvais moment : l'ordre des prises est dicté par le maintien des échecs. Ici, dévier vers la dame d8 trop tôt laisserait le roi s'échapper."
      }
    }
  ];

  // ======================================================================
  // SECTION 2 — FINALES DE BASE (guidées contre le bot)
  // ======================================================================
  const FINALES = [
    {
      id: 'fin-dame-roi',
      titre: 'Dame + Roi contre Roi',
      sousTitre: 'La technique de la boîte',
      difficulte: 'facile',
      fen: '8/8/3k4/8/8/4KQ2/8/8 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Kd4', 'Ke6', 'Qf8', 'Kd7', 'Kd5', 'Kc7', 'Qe8', 'Kb6', 'Qd7', 'Ka6', 'Kc5', 'Ka5', 'Qa7#'],
      indice: "Placez la dame à distance de cavalier du roi adverse et rétrécissez sa « boîte » sans jamais donner d'échec.",
      plan: "1) La dame se place à une distance de cavalier du roi adverse et le suit, coup après coup : la boîte rétrécit. 2) Quand le roi adverse est confiné au bord, STOP : n'approchez plus la dame (danger de pat). 3) Amenez votre roi à une case du roi adverse. 4) Concluez par le baiser de la mort ou un échec perpendiculaire au bord.",
      explication: {
        idee: "La finale gagnante la plus simple : la dame seule enferme le roi dans une boîte de plus en plus petite, le roi allié ne venant qu'à la fin pour soutenir le mat.",
        mecanisme: "Placée à distance de cavalier, la dame coupe TOUTES les lignes de fuite sans donner d'échec inutile. Le roi adverse recule forcément vers le bord ; les échecs n'interviennent qu'au dernier coup.",
        reconnaitre: "Toute finale où vous venez de promouvoir une dame : appliquez la boîte mécaniquement, en moins de 10 coups le mat tombe.",
        erreur: "Le pat ! Une dame trop proche d'un roi acculé (à une case du coin) supprime tous ses coups sans le mettre en échec. Gardez toujours une case libre au roi tant que le vôtre n'est pas en place."
      }
    },
    {
      id: 'fin-tour-roi',
      titre: 'Tour + Roi contre Roi',
      sousTitre: "L'opposition et l'escalier",
      difficulte: 'facile',
      fen: '8/8/4k3/8/8/8/4K3/6R1 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Ke3', 'Kd5', 'Rg5+', 'Kd6', 'Ke4', 'Kd7', 'Kd5', 'Ke7', 'Rg6', 'Ke8', 'Ke6', 'Kd8', 'Kd6', 'Ke8', 'Rg7', 'Kf8', 'Re7', 'Kg8', 'Ke6', 'Kf8', 'Rc7', 'Kg8', 'Kf6', 'Kh8', 'Kg6', 'Kg8', 'Rc8#'],
      indice: "La tour coupe une rangée ; votre roi prend l'opposition (face à face) et la tour donne échec pour faire reculer le roi adverse.",
      plan: "1) La tour coupe le roi adverse sur une rangée. 2) Votre roi avance face au roi adverse. 3) Quand les rois sont en OPPOSITION (face à face, une case d'écart), la tour donne échec : le roi adverse recule d'une rangée. 4) Répétez jusqu'à la dernière rangée : l'échec y est mat. Si le roi adverse attaque la tour, glissez-la à l'autre bout de la rangée.",
      explication: {
        idee: "La finale à maîtriser absolument : tour + roi matent toujours, mais la tour ne peut pas le faire seule — c'est un travail d'équipe où le roi force le recul.",
        mecanisme: "La tour est un mur horizontal. Le roi adverse ne recule que si le vôtre lui fait face (opposition) au moment de l'échec : sinon il glisse sur le côté indéfiniment.",
        reconnaitre: "Chaque fois qu'il vous reste une tour en fin de partie : cette technique transforme l'avantage en point entier, en 15 coups maximum depuis n'importe où.",
        erreur: "Donner des échecs sans opposition : le roi adverse zigzague et le compteur des 50 coups tourne. L'échec ne sert QUE lorsque les rois se font face."
      }
    },
    {
      id: 'fin-deux-tours',
      titre: 'Deux Tours contre Roi',
      sousTitre: "L'escalier automatique",
      difficulte: 'facile',
      fen: '8/8/4k3/8/8/8/8/R5RK w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Rg5', 'Kd6', 'Ra6+', 'Kd7', 'Rg7+', 'Kd8', 'Ra8#'],
      indice: "Une tour coupe, l'autre donne échec sur la rangée suivante : alternez sans jamais bouger votre roi.",
      plan: "1) Une tour donne échec sur une rangée : le roi recule. 2) L'autre tour donne échec sur la rangée suivante. 3) Alternez — l'escalier — jusqu'au bord. Votre roi ne sert à rien : laissez-le où il est. Si le roi adverse approche d'une tour, déplacez-la horizontalement à l'autre bord.",
      explication: {
        idee: "Le mat « automatique » : deux tours se relaient pour repousser le roi rangée par rangée, sans aucune aide du roi allié.",
        mecanisme: "Chaque tour contrôle une rangée entière ; celle qui vient de donner échec devient le mur derrière lequel le roi ne peut plus revenir. Le roi adverse descend l'escalier jusqu'au mat du bord.",
        reconnaitre: "Deux tours (ou dame + tour) contre roi dépouillé : ne cherchez rien de plus malin, l'escalier mate en 7-8 coups.",
        erreur: "Laisser les deux tours sur des colonnes proches du roi adverse : il en attaque une et gagne un temps précieux à chaque fois. Écartez-les au maximum."
      }
    },
    {
      id: 'fin-deux-fous',
      titre: 'Deux Fous + Roi contre Roi',
      difficulte: 'moyen',
      fen: '8/8/3k4/8/8/2BB4/8/4K3 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Ke2', 'Kc6', 'Ke3', 'Kc5', 'Ke4', 'Kd6', 'Bd4', 'Kc6', 'Ke5', 'Kd7', 'Bc4', 'Kd8', 'Kd6', 'Ke8', 'Bf6', 'Kf8', 'Bd5', 'Ke8', 'Ke6', 'Kf8', 'Bc6', 'Kg8', 'Ke7', 'Kh7', 'Ke6', 'Kg6', 'Ke5', 'Kf7', 'Kf5', 'Kg8', 'Kg6', 'Kf8', 'Bg5', 'Kg8', 'Bh6', 'Kh8', 'Bg7+', 'Kg8', 'Bd5#'],
      indice: "Les fous côte à côte forment une double barrière diagonale ; le roi adverse doit être poussé dans un coin (n'importe lequel).",
      plan: "1) Placez les fous côte à côte (par exemple c3/d3) : ils dressent deux diagonales infranchissables. 2) Avancez votre roi pour soutenir la poussée. 3) Faites glisser la barrière pour repousser le roi adverse vers un coin. 4) Au bord, un fou coupe la fuite, l'autre donne le mat, le roi contrôlant les cases restantes.",
      explication: {
        idee: "Les deux fous couvrent les deux couleurs de cases : ensemble ils forment un mur diagonal mobile qui pousse le roi vers n'importe quel coin.",
        mecanisme: "Fous adjacents = deux diagonales parallèles = couloir infranchissable. Le roi allié escorte la barrière ; au coin, les trois pièces couvrent les six cases nécessaires au mat.",
        reconnaitre: "La paire de fous contre roi nu (après une promotion refusée en dame pour éviter un pat, par exemple). Gagnant à coup sûr, mais exige de la méthode : environ 18 coups.",
        erreur: "Séparer les fous ou les avancer sans le roi : le roi adverse se faufile entre les diagonales et tout est à recommencer — gare à la règle des 50 coups."
      }
    },
    {
      id: 'fin-fou-cavalier',
      titre: 'Fou + Cavalier + Roi contre Roi',
      sousTitre: 'La technique du W',
      difficulte: 'difficile',
      fen: '8/8/8/4k3/8/8/8/1B2K1N1 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Ke2', 'Kf6', 'Ke3', 'Kg7', 'Ke4', 'Kg8', 'Ke5', 'Kg7', 'Ke6', 'Kg8', 'Kf6', 'Kh8', 'Ba2', 'Kh7', 'Nf3', 'Kh8', 'Ne5', 'Kh7', 'Kf7', 'Kh8', 'Ng6+', 'Kh7', 'Kf6', 'Kh6', 'Bg8', 'Kh5', 'Ne5', 'Kh6', 'Ng4+', 'Kh5', 'Kf5', 'Kh4', 'Kf4', 'Kh5', 'Bf7+', 'Kh4', 'Be8', 'Kh3', 'Ne3', 'Kh4', 'Ng2+', 'Kh3', 'Kf3', 'Kh2', 'Bd7', 'Kg1', 'Ne3', 'Kh1', 'Kf2', 'Kh2', 'Nf1+', 'Kh1', 'Bc6#'],
      indice: "Le mat n'est possible que dans un coin DE LA COULEUR DU FOU. Le cavalier dessine un « W » pour barrer la fuite le long du bord.",
      plan: "1) Repoussez d'abord le roi vers n'importe quel bord (roi + pièces ensemble). 2) S'il file vers le mauvais coin (couleur opposée au fou), escortez-le le long du bord vers le bon coin : le cavalier suit le trajet en W (par exemple c7-e6-d8… côté dame) pour boucher les trous. 3) Dans le bon coin : fou et cavalier verrouillent, le roi mate.",
      explication: {
        idee: "La plus difficile des finales élémentaires : mat possible uniquement dans un coin de la couleur du fou, ce qui oblige à escorter le roi adverse d'un coin à l'autre sans le laisser filer.",
        mecanisme: "Le fou ne contrôlera jamais le coin de l'autre couleur : dans ce coin-là, pas de mat. Le fameux « W » du cavalier comble méthodiquement les cases que le fou ne voit pas pendant le voyage forcé le long du bord.",
        reconnaitre: "Il reste fou + cavalier après liquidation : sachez qu'elle se gagne (en 30 coups et quelques), mais entraînez-la AVANT qu'elle n'arrive en partie lente… ou en blitz.",
        erreur: "Gaspiller des coups au début : la limite des 50 coups est une vraie contrainte ici. Autre piège : laisser une case de fuite au moment du virage vers le bon coin — tout le trajet est à refaire."
      }
    },
    {
      id: 'fin-roi-pion',
      titre: 'Roi + pion contre Roi',
      sousTitre: 'Opposition, règle du carré, cases clés',
      difficulte: 'facile',
      fen: '3k4/8/3K4/4P3/8/8/8/8 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['e6', 'Ke8', 'e7', 'Kf7', 'Kd7', 'Kf6', 'e8=Q', 'Kf5', 'Qe3', 'Kg4', 'Ke6', 'Kh4', 'Kf5', 'Kh5', 'Qh3#'],
      indice: "Le roi passe DEVANT son pion. Gagnez l'opposition : quand les rois se font face et que l'adversaire doit jouer, il cède le passage.",
      plan: "1) Le roi avance DEVANT le pion (jamais l'inverse). 2) Prenez l'opposition : rois face à face, l'adversaire au trait doit s'écarter. 3) Le roi escorte alors le pion case après case ; le pion n'avance que quand sa route est sûre. 4) Promotion en dame, puis mat élémentaire. Attention au pat près du coin de promotion.",
      explication: {
        idee: "La finale la plus importante des échecs : roi devant son pion + opposition = victoire ; pion poussé trop tôt = nulle. Tout le jeu de pions se ramène à elle.",
        mecanisme: "L'opposition est un duel de zugzwang : celui qui doit jouer recule. Le roi qui contrôle les « cases clés » devant le pion garantit la promotion quelle que soit la défense.",
        reconnaitre: "Toute simplification vers une finale de pions : AVANT d'échanger la dernière pièce, vérifiez qui aura l'opposition et si le défenseur entre dans le « carré » du pion.",
        erreur: "Pousser le pion avec enthousiasme : chaque poussée prématurée peut transformer un gain en nulle (pat ou perte de l'opposition). Le ROI d'abord, le pion ensuite."
      }
    },
    {
      id: 'fin-pion-tour',
      titre: 'Pion tour : la nulle du coin',
      difficulte: 'facile',
      fen: '1k6/8/1K6/P7/8/8/8/8 b - - 0 1',
      joueur: 'b', objectif: 'nulle',
      demo: ['Ka8', 'a6', 'Kb8', 'a7+', 'Ka8', 'Ka6'],
      demoFin: "Le coin a8 est une forteresse : avec un pion tour, si le roi défenseur atteint le coin, l'attaquant ne peut plus gagner — le pat est inévitable.",
      indice: "Vous défendez : foncez dans le coin a8 et n'en sortez plus. Le camp fort ne pourra jamais vous en déloger.",
      plan: "1) Votre roi rejoint le coin de promotion (a8) ou les cases adjacentes. 2) Oscillez entre a8 et b8 (ou a7/b7 selon les coups adverses). 3) Deux issues, toutes deux nulles : le pion arrive en a7 avec votre roi en a8 → pat ; ou le roi blanc s'approche trop → pat également. Ne quittez JAMAIS la zone du coin.",
      explication: {
        idee: "L'exception salvatrice des finales de pions : le pion de la colonne a (ou h) ne gagne PAS si le roi défenseur atteint le coin de promotion.",
        mecanisme: "Contrairement aux autres colonnes, le roi attaquant ne peut pas déborder « de l'autre côté » du pion : le bord de l'échiquier l'en empêche. Résultat : pat inévitable, quelle que soit la manœuvre.",
        reconnaitre: "En défense d'une finale perdue, orientez les échanges pour ne laisser QUE le pion tour adverse — puis courez au coin (vérifiez avec la règle du carré que vous y arrivez).",
        erreur: "Se laisser couper du coin : la nulle n'existe que si votre roi y parvient. Autre confusion : avec un FOU de la mauvaise couleur en plus, c'est aussi nulle — mais avec tout autre pion, c'est perdu."
      }
    },
    {
      id: 'fin-triangulation',
      titre: 'Triangulation et zugzwang',
      difficulte: 'moyen',
      fen: '8/3k4/8/3PK3/8/8/8/8 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Kd4', 'Kd6', 'Ke4', 'Kd7', 'Ke5', 'Kd8', 'Kd6', 'Ke8', 'Kc7', 'Ke7', 'd6+', 'Ke8', 'd7+', 'Ke7', 'd8=Q+', 'Ke6', 'Qg5', 'Kf7', 'Kd7', 'Kf8', 'Ke6', 'Ke8', 'Qg8#'],
      indice: "Cette position vous est favorable… si c'était aux Noirs de jouer ! Votre roi décrit un triangle (e5-d4-e4-e5) pour « perdre » un temps.",
      plan: "1) Constatez le zugzwang réciproque : Noirs au trait, ils doivent céder du terrain. 2) Votre roi triangule : Rd4, puis Re4, puis retour Re5 — trois coups là où le roi noir n'en a que deux. 3) La même position revient, trait aux Noirs : leur roi s'écarte. 4) Votre roi passe devant le pion (d6/e6) et escorte la promotion, puis matez.",
      explication: {
        idee: "L'arme secrète des finales de rois : quand la position est gagnante seulement « avec le trait à l'adversaire », le roi fait un détour triangulaire pour lui repasser l'obligation de jouer.",
        mecanisme: "Le roi fort dispose de trois cases équivalentes formant un triangle ; le roi défenseur n'en a que deux. Après le tour complet, position identique, trait inversé : c'est le zugzwang.",
        reconnaitre: "Finale de pions bloquée où chaque camp « tient » tant qu'il ne bouge pas : comptez les cases de manœuvre. Si vous en avez trois et lui deux, la triangulation gagne.",
        erreur: "Trianguler avec le mauvais pied : pendant le détour, votre roi ne doit jamais lâcher la défense du pion ni laisser le roi adverse s'infiltrer. Vérifiez chaque étape du triangle."
      }
    },
    {
      id: 'fin-lucena',
      titre: 'Position de Lucena',
      sousTitre: 'La construction du pont',
      difficulte: 'moyen',
      fen: '6K1/4kP2/8/8/8/8/r7/2R5 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Rc4', 'Ra1', 'Kh7', 'Rh1+', 'Kg6', 'Rg1+', 'Kf5', 'Rf1+', 'Rf4', 'Ra1', 'f8=Q+'],
      demoFin: "Le « pont » est construit : la tour en f4 bloque les échecs et la dame est faite. Dame + tour contre tour, le gain est désormais élémentaire.",
      indice: "Votre roi est enfermé devant son pion : construisez un « pont » — la tour va en c4 pour abriter le roi des échecs à la quatrième rangée.",
      plan: "1) Tc1-c4 ! : la tour prépare le pont sur la 4e rangée. 2) Le roi sort (Rg8-g7 n'est pas possible ici : sortez par e8/d7 selon les échecs)… en pratique : écartez le roi adverse (Tc1-e1+ d'abord si utile), sortez le roi des échecs de la tour noire. 3) Quand la tour noire donne échec sur la colonne g/h, interposez la tour EN C4 → plus d'échecs : le pion promeut. 4) Concluez avec la dame.",
      explication: {
        idee: "LA position gagnante de référence des finales de tours : pion en 7e, roi fort devant lui, roi faible coupé. Le gain passe par le célèbre « pont » décrit dès 1497.",
        mecanisme: "Le problème : le roi sort de devant le pion et se fait mitrailler d'échecs par derrière. La solution : la tour se poste à la QUATRIÈME rangée ; le roi redescend vers elle et s'abrite derrière — l'échec suivant est bloqué par l'interposition, la promotion est imparable.",
        reconnaitre: "Vous avez tour + pion contre tour et votre pion atteint la 7e avec le roi devant : cherchez Lucena. En défense : tout faire (Philidor !) pour ne jamais laisser cette position s'installer.",
        erreur: "Sortir le roi sans préparation : la tour adverse le repousse indéfiniment devant le pion. Le pont d'abord (tour 4e rangée), la sortie ensuite."
      }
    },
    {
      id: 'fin-philidor',
      titre: 'Position de Philidor',
      sousTitre: 'La défense en 6e rangée',
      difficulte: 'moyen',
      fen: '4k3/R7/1r6/4K3/4P3/8/8/8 b - - 0 1',
      joueur: 'b', objectif: 'nulle',
      demo: ['Rc6', 'Kf5', 'Rb6', 'e5', 'Rc6', 'e6', 'Rc1', 'Kf6', 'Rf1+', 'Ke5', 'Re1+', 'Kd6', 'Rd1+', 'Ke5', 'Re1+'],
      demoCouleur: 'b',  // on visualise la couverture de la tour noire
      demoFin: "Le roi blanc n'a aucun abri : les échecs par derrière ne s'arrêteront jamais. C'est l'idée de Philidor — tour sur la 6e rangée tant que le pion n'a pas avancé, puis échecs infinis par derrière. Nulle.",
      indice: "Vous défendez : gardez votre tour sur VOTRE 3e rangée (la 6e ici) tant que le pion n'a pas avancé. Dès qu'il pose le pied dessus, filez donner des échecs par derrière.",
      plan: "1) Tour sur la 6e rangée (b6-h6) : elle interdit l'avance du roi blanc. 2) Ne bougez la tour de cette rangée sous aucun prétexte (des coups d'attente : Tb6-c6-a6…). 3) Dès que le pion joue e5-e6, la rangée ne sert plus : Tb6-b1 ! et échecs perpétuels par derrière — le roi blanc n'a plus d'abri. 4) Roi collé à la case de promotion.",
      explication: {
        idee: "LA défense de référence des finales de tours, décrite par Philidor en 1749 : la tour patrouille sa 3e rangée et rend l'avance adverse inoffensive. À connaître par cœur : elle sauve des dizaines de demi-points.",
        mecanisme: "Tant que la tour tient la 6e rangée, le roi fort ne peut pas s'y installer pour préparer l'avance. Si le pion avance quand même, il prive SON PROPRE roi d'abri : les échecs par derrière deviennent perpétuels.",
        reconnaitre: "Tour contre tour + pion, votre roi devant le pion adverse : courez placer la tour sur la rangée critique AVANT que le roi adverse ne s'y ancre. Un temps de retard et c'est Lucena — perdu.",
        erreur: "Donner des échecs trop tôt ou « activer » la tour pendant que le pion est encore en e4 : le roi blanc s'abrite derrière son pion et la défense s'écroule. La passivité de la tour sur la 6e est ici une vertu."
      }
    },
    {
      id: 'fin-tour-pion',
      titre: 'Tour contre pion',
      sousTitre: 'La course à la promotion',
      difficulte: 'moyen',
      fen: '8/6K1/8/8/2p5/2k5/8/7R w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Rd1', 'Kc2', 'Rd5', 'c3', 'Kf6', 'Kc1', 'Kf5', 'Kc2', 'Ke5', 'Kc1', 'Kd4', 'c2', 'Kc3', 'Kb1', 'Rb5+', 'Kc1', 'Rb2', 'Kd1', 'Rxc2', 'Ke1', 'Kd3', 'Kd1', 'Rc4', 'Ke1', 'Rf4', 'Kd1', 'Rf1#'],
      indice: "Coupez le pion par derrière (Th1-h4 ou h1-c1 ?) et ramenez votre roi au galop : c'est une course chronométrée.",
      plan: "1) La tour se place DERRIÈRE le pion (colonne c) ou le coupe sur sa rangée. 2) Le roi blanc accourt en diagonale (chaque coup compte). 3) Le duo roi noir + pion ne peut promouvoir que si votre roi reste hors jeu : ici il arrive à temps. 4) Pion capturé → finale tour contre roi : matez à l'escalier + opposition.",
      explication: {
        idee: "Tour contre pion passé soutenu par son roi : tout est affaire de tempo. La tour seule ne stoppe pas toujours un pion en 6e/7e — c'est la distance du roi fort qui décide.",
        mecanisme: "La tour harcèle par derrière : chaque poussée du pion coûte un temps de protection au roi faible. Pendant ce temps, le roi fort traverse en diagonale (le chemin diagonal ne perd aucun temps).",
        reconnaitre: "Sacrifice de tour adverse pour lancer un pion, ou finale liquidée en T contre P : comptez précisément les temps (règle : la tour gagne si son roi atteint le pion ou si le pion n'a pas dépassé sa 5e rangée avec roi devant).",
        erreur: "Donner des échecs latéraux qui ESCORTENT le roi adverse vers l'avant : chaque échec mal placé lui fait gagner un rang. Derrière le pion, la tour ; devant, le roi."
      }
    },
    {
      id: 'fin-fous-opposes',
      titre: 'Fous de couleurs opposées',
      sousTitre: 'La forteresse',
      difficulte: 'moyen',
      fen: '3k4/8/3PK3/8/5B2/8/2b5/8 b - - 0 1',
      joueur: 'b', objectif: 'nulle',
      demo: ['Bb3+', 'Kf6', 'Kd7', 'Ke5', 'Bc4', 'Bg5', 'Bb3', 'Bf4', 'Bc4'],
      demoFin: "Forteresse : le roi noir bloque le pion depuis d7, une case claire que le fou blanc (cases foncées) ne contrôlera jamais, et le fou noir chasse le roi blanc dès qu'il approche. Nulle.",
      indice: "Vous défendez : votre roi bloque la case de promotion (case BLANCHE, celle de votre fou) et votre fou de cases blanches surveille les diagonales d'escorte (b1-h7 puis a2-g8). Le fou adverse ne pourra jamais vous chasser.",
      plan: "1) Roi vissé sur d8/e8 : il bloque le pion sur sa case claire — que le fou noir adverse ne contrôlera jamais. 2) Le fou c2 patrouille b1-h7 et bascule sur a2-g8 dès que le roi blanc tente le détour par f7 : échec ou prise du pion à chaque essai. 3) Oscillez sur les cases blanches : cinquante coups et c'est nul.",
      explication: {
        idee: "Le grand paradoxe des finales : avec des fous de couleurs opposées, même DEUX pions de plus ne gagnent souvent pas. Chaque camp vit sur sa couleur, et le défenseur y construit une forteresse imprenable.",
        mecanisme: "Le fou attaquant (cases noires ici) ne pourra JAMAIS déloger un roi installé sur case blanche ni contester la diagonale blanche du défenseur : il joue littéralement sur un autre échiquier. Sans zugzwang possible, aucune progression n'existe.",
        reconnaitre: "En difficulté avec un pion de moins : liquidez vers les fous opposés, c'est la bouée classique. Côté fort : gardez d'autres pièces (tours !) sur l'échiquier — avec elles, les fous opposés AVANTAGENT l'attaquant.",
        erreur: "Défendre avec le roi du mauvais côté ou poser sa forteresse sur la couleur du fou ADVERSE. La forteresse se construit sur VOTRE couleur, roi sur la case d'arrêt, fou sur la diagonale de contrôle."
      }
    },
    {
      id: 'fin-dame-pion7',
      titre: 'Dame contre pion en 7e rangée',
      difficulte: 'moyen',
      fen: '8/8/1K6/7Q/8/8/4pk2/8 w - - 0 1',
      joueur: 'w', objectif: 'mat',
      demo: ['Qh4+', 'Kf1', 'Qf4+', 'Ke1', 'Kc5', 'Kd1', 'Qd4+', 'Ke1', 'Kc4', 'Kf1', 'Qf4+', 'Ke1', 'Kd3', 'Kd1', 'Qd2#'],
      indice: "Pion central (e) : c'est GAGNÉ. Série d'échecs pour forcer le roi DEVANT son pion (e1), et chaque fois qu'il y est, votre roi avance d'une case.",
      plan: "1) Échecs en rafale (Dh4+, Df4+, De3…) pour zigzaguer vers le roi. 2) Dès que le roi noir est forcé de se placer DEVANT son pion (e1), il ne menace plus de promouvoir : votre roi gagne un temps et avance. 3) Répétez le cycle : échecs → roi noir en e1 → pas de roi blanc. 4) Le roi arrive : prise du pion et mat rapide. (Contre un pion a, c, f ou h, ce mécanisme échoue : pat ou coin — c'est nul.)",
      explication: {
        idee: "Course gagnée d'un cheveu : la dame seule ne prend pas un pion en 7e défendu par son roi — elle a besoin du sien. Le gain repose sur un cycle de temps volés, qui ne fonctionne qu'avec les pions centraux et cavaliers (b, d, e, g).",
        mecanisme: "La dame force le roi défenseur à occuper LA case de promotion : ce coup-là ne menace rien, et le roi fort en profite pour approcher d'une case. Pion fou (c/f) : le roi se jette en prise (pat après capture) ; pion tour (a/h) : il s'enferme au coin (pat aussi). D'où les cas nuls.",
        reconnaitre: "Toute course de promotion qui finit dame contre pion en 7e : AVANT de liquider, identifiez la colonne du pion. b/d/e/g = gain ; a/c/f/h = nulle si le roi fort est loin. Ce simple savoir décide du résultat des finales de pions rapides.",
        erreur: "Donner des échecs « pour donner des échecs » sans le cycle roi-devant-le-pion : la position tourne en rond. Et côté défense d'un pion fou/tour : PROMOUVOIR est parfois une erreur — c'est le pion en 7e qui fait la nulle."
      }
    },
    {
      id: 'fin-reti-etude',
      titre: 'Étude de Réti',
      sousTitre: 'Le roi aux deux objectifs',
      difficulte: 'difficile',
      fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1',
      joueur: 'w', objectif: 'nulle',
      demo: ['Kg7', 'h4', 'Kf6', 'Kb6', 'Ke5', 'h3', 'Kd6', 'h2', 'c7', 'Kb7', 'Kd7', 'h1=Q', 'c8=Q+'],
      demoFin: "Le miracle de Réti : en marchant sur la diagonale, le roi blanc poursuit deux menaces à la fois — rattraper le pion h et soutenir c7. Les deux camps font dame : nulle.",
      indice: "Votre roi semble hors-jeu face au pion h… mais la diagonale h8-e5 poursuit DEUX objectifs à la fois : rattraper le pion h ET soutenir votre pion c.",
      plan: "1) Rg7 ! : le roi entre dans la diagonale magique. 2) Chaque coup menace double : se rapprocher du pion h ET du pion c6. 3) Si les Noirs poussent h4 : Rf6 → e5 et le roi rejoint le carré du pion h en soutenant c7 en chemin. 4) Si le roi noir prend en c6 : Rf6-g5 et le pion h tombe. Nulle dans toutes les variantes.",
      explication: {
        idee: "La plus célèbre étude de l'histoire (Réti, 1921) : un roi apparemment perdu sauve la partie en marchant « entre deux objectifs ». La géométrie de l'échiquier défie l'intuition : la diagonale n'est pas plus longue que la ligne droite.",
        mecanisme: "En diagonale, le roi gagne du terrain sur DEUX fronts simultanément : chaque pas vers le pion adverse est aussi un pas vers le sien. L'adversaire ne peut parer les deux menaces : traiter l'une donne le tempo qui sauve l'autre.",
        reconnaitre: "Roi « hors du carré » d'un pion passé : ne rendez pas les armes. Cherchez un trajet diagonal créant une menace secondaire (soutien de votre propre pion, attaque d'un pion adverse) : les miracles de Réti se produisent en vraie partie.",
        erreur: "Courir en ligne droite derrière le pion (Rh7-h6 ? : perdu d'un temps) ou pousser son propre pion trop tôt. La force du trajet est justement son ambiguïté : ne la levez qu'au dernier moment."
      }
    },
    {
      id: 'fin-vancura',
      titre: 'Position de Vancura',
      difficulte: 'difficile',
      fen: 'R7/6k1/P4r2/K7/8/8/8/8 b - - 0 1',
      joueur: 'b', objectif: 'nulle',
      demo: ['Rf5+', 'Kb6', 'Rf6+', 'Kb7', 'Rf7+', 'Kb8', 'Rf6', 'a7', 'Rf8+', 'Kb7', 'Rf7+', 'Kb6', 'Rf6+'],
      demoCouleur: 'b',  // on visualise la couverture de la tour noire
      demoFin: "Position de Vancura : la tour blanche est enfermée devant son propre pion, et le roi blanc ne peut ni échapper aux échecs latéraux, ni trouver d'abri. Nulle.",
      indice: "Vous défendez contre le pion a : votre tour attaque le pion LATÉRALEMENT depuis la 6e rangée (f6 !) et y reste, prête à mitrailler le roi d'échecs de flanc.",
      plan: "1) La tour reste sur la 6e rangée en visant a6 (f6, g6, h6) : le pion est cloué sur place — s'il avance en a7, Ta6 ! le bloque définitivement... déjà fait ici : il est en a6. 2) Si le roi blanc vient le défendre (Rb5-b6), échecs latéraux : Tf6-f5+, f6+… il n'a aucun abri. 3) Votre roi reste collé à g7/h7, hors de portée. 4) La tour ne quitte la 6e que pour des échecs — et y revient.",
      explication: {
        idee: "Le pendant « pion tour » de Philidor : contre un pion a en 6e, la défense passive perd, mais l'attaque LATÉRALE du pion depuis la 6e rangée (Vancura, 1924) tient la nulle éternellement.",
        mecanisme: "La tour attaque a6 de flanc : la tour blanche a8 est condamnée à la défense passive devant son pion. Si le roi blanc approche pour la relayer, il entre dans le champ des échecs latéraux — et n'a pas d'abri, le pion a n'en offrant aucun. Cercle vicieux pour l'attaquant.",
        reconnaitre: "Tour contre tour + pion A (ou H) : la position de Vancura est votre destination de sauvetage dès que votre roi est du bon côté. Mémorisez le dessin : pion a6, tour défensive f6, roi g7.",
        erreur: "Passer derrière le pion (Ta1 ?) : contre le pion TOUR c'est justement perdant ici, car le roi fort s'abrite en b7 et la tour a8 se libère. Vancura = échecs de CÔTÉ, pas par derrière."
      }
    }
  ];

  const EXERCISES = { MATS, FINALES };
  global.EXERCISES = EXERCISES;
  if (typeof module !== 'undefined' && module.exports) module.exports = EXERCISES;
})(typeof self !== 'undefined' ? self : globalThis);
