/*
 * Échecs360 — Structure de pions (données).
 *
 * Trois volets :
 *   - notions     : les concepts fondamentaux, chacun illustré par une ou
 *                   plusieurs vues (FEN + cases surlignées + flèches + légende).
 *   - structures  : les grandes structures de pions types, avec les plans
 *                   des deux camps.
 *   - exercices   : QCM sur une position, avec explication et, souvent, une
 *                   séquence de coups rejouable qui montre le principe.
 *
 * Conventions visuelles :
 *   hl.verts  = atouts (pion fort, avant-poste conquis…)
 *   hl.rouges = faiblesses / cibles
 *   hl.bleus  = cases clés (blocus, trou, colonne)
 *   arrows    = [from, to, 'vert' | 'rouge' | 'orange']
 *               vert = plan des Blancs, rouge = plan des Noirs, orange = levier/poussée clé
 */
(function (global) {
  'use strict';

  const NOTIONS = [
    {
      id: 'double',
      nom: 'Pions doublés',
      resume: 'Deux pions de la même couleur sur la même colonne.',
      vues: [
        {
          titre: 'Les doublés c3-c4 (structure Nimzo)',
          fen: '6k1/ppp2ppp/4p3/8/2PP4/2P1P3/P4PPP/1R4K1 w - - 0 1',
          hl: { rouges: ['c3', 'c4'] },
          arrows: [['b1', 'b7', 'vert']],
          caption: 'Après ...Fxc3 bxc3 : les pions c3 et c4 (en rouge) ne peuvent plus se défendre entre eux — mais la colonne b est devenue semi-ouverte pour la tour. Le défaut structurel s\'achète souvent contre un avantage dynamique.'
        },
        {
          titre: 'La majorité « morte »',
          fen: '6k1/6pp/8/8/8/5P2/5PP1/6K1 w - - 0 1',
          hl: { rouges: ['f2', 'f3'] },
          caption: '3 pions contre 2… mais avec les f doublés, aucun pion passé n\'est possible si les Noirs défendent correctement : la majorité est morte. C\'est le vrai prix des pions doublés en finale.'
        }
      ],
      points: [
        { t: 'moins', txt: 'Ils ne peuvent pas se défendre mutuellement — l\'un des deux devient une cible durable.' },
        { t: 'moins', txt: 'Une majorité qui contient des doublés peine à créer un pion passé.' },
        { t: 'plus', txt: 'Ils ouvrent une colonne pour les tours (Fxc3 dans la Nimzo → colonne b).' },
        { t: 'plus', txt: 'Ils peuvent renforcer le contrôle du centre (le duo c3-c4 tient d4 et d5).' },
        { t: 'info', txt: 'Accepter des doublés contre la paire de fous ou une colonne ouverte est souvent un bon deal (Espagnole d\'échange : les Blancs jouent la structure, les Noirs les deux fous).' }
      ]
    },
    {
      id: 'isole',
      nom: 'Pion isolé',
      resume: 'Aucun pion ami sur les colonnes voisines : il ne sera plus jamais défendu par un pion.',
      vues: [
        {
          titre: 'L\'isolé d4 et sa case de blocus',
          fen: '6k1/pp3ppp/4p3/3n4/3P4/8/PP3PPP/6K1 w - - 0 1',
          hl: { rouges: ['d4'], bleus: ['d5'] },
          caption: 'Le pion d4 (rouge) doit être défendu par des pièces. La case d5 (bleu), juste devant lui, est l\'avant-poste rêvé : le cavaliér noir s\'y installe, aucun pion ne pourra jamais le chasser.'
        },
        {
          titre: 'Sa force : l\'énergie d4-d5',
          fen: '6k1/pp3ppp/4p3/8/3P4/8/PP3PPP/6K1 w - - 0 1',
          hl: { verts: ['c5', 'e5'] },
          arrows: [['d4', 'd5', 'orange']],
          caption: 'En échange, l\'isolé donne de l\'espace, les colonnes semi-ouvertes c et e, les avant-postes c5 et e5 (vert)… et la poussée d4-d5 ! qui ouvre la position au bon moment.'
        }
      ],
      points: [
        { t: 'moins', txt: 'Défendu par des pièces, jamais par un pion ; la case de blocus devant lui appartient à l\'adversaire.' },
        { t: 'plus', txt: 'Espace, colonnes semi-ouvertes, avant-postes et potentiel dynamique (d4-d5 !).' },
        { t: 'info', txt: 'Règle pratique : le camp AVEC l\'isolé veut le milieu de jeu et les pièces sur l\'échiquier ; le camp CONTRE veut échanger et aller en finale.' }
      ]
    },
    {
      id: 'passe',
      nom: 'Pion passé',
      resume: 'Aucun pion adverse ne peut l\'arrêter sur sa colonne ni sur les colonnes voisines.',
      vues: [
        {
          titre: 'Le passé simple',
          fen: '6k1/pp4pp/8/4P3/8/8/PP4PP/6K1 w - - 0 1',
          hl: { verts: ['e5'] },
          arrows: [['e5', 'e8', 'vert']],
          caption: '« Un pion passé a une âme criminelle : il veut aller à dame. » Plus rien ne peut arrêter e5 sur sa route, seule une pièce peut s\'y dévouer — et une pièce qui bloque un pion ne fait rien d\'autre.'
        },
        {
          titre: 'Le passé protégé',
          fen: '6k1/pp4pp/8/3P4/4P3/8/PP4PP/6K1 w - - 0 1',
          hl: { verts: ['d5'] },
          caption: 'd5 est défendu par e4 : quasi intouchable. Même en finale de pièces, il immobilise en permanence une pièce adverse de garde — un avantage qui ne s\'évapore jamais.'
        },
        {
          titre: 'Le passé éloigné : le leurre',
          fen: '8/5ppp/4k3/P7/8/4K3/5PPP/8 w - - 0 1',
          hl: { verts: ['a5'] },
          arrows: [['a5', 'a8', 'vert']],
          caption: 'Le pion a5 ne va peut-être jamais à dame — mais pour l\'arrêter, le roi noir doit traverser l\'échiquier… pendant que le roi blanc mange f7, g7 et h7. Décisif jusqu\'à très haut niveau.'
        },
        {
          titre: 'Le candidat : « candidate first »',
          fen: '8/8/1p2k3/8/1PP5/4K3/8/8 w - - 0 1',
          hl: { verts: ['c4'] },
          arrows: [['c4', 'c5', 'orange']],
          caption: 'Dans la majorité b4+c4 contre b6, le candidat est c4 : il n\'a pas de vis-à-vis. Règle d\'or : on pousse le candidat en premier — b4-b5 ?? laisserait la majorité se figer.',
          suite: {
            intro: 'Le candidat avance, la majorité accouche d\'un pion passé.',
            coups: [
              ['c5', 'Le candidat d\'abord ! (1.b5 ?? figerait tout : après ...b6, plus aucun passé possible.)'],
              ['bxc5', 'Forcé tôt ou tard…'],
              ['bxc5', 'Un pion passé tout neuf : la majorité a rempli son contrat.']
            ]
          }
        }
      ],
      points: [
        { t: 'plus', txt: 'L\'atout n° 1 des finales : il force l\'adversaire à monter la garde.' },
        { t: 'plus', txt: 'Passé protégé : immobilise une pièce adverse en permanence.' },
        { t: 'plus', txt: 'Passé éloigné : leurre qui détourne le roi pendant que le vôtre mange l\'autre aile.' },
        { t: 'info', txt: 'Pion candidat : dans une majorité, celui qui n\'a pas de vis-à-vis — c\'est lui qu\'on pousse en premier (« candidate first »).' }
      ]
    },
    {
      id: 'arriere',
      nom: 'Pion arriéré',
      resume: 'En retard sur ses voisins : plus défendable par un pion, et sa case d\'avance est contrôlée par l\'adversaire.',
      vues: [
        {
          titre: 'd6 arriéré, d5 troué (structure Boleslavsky)',
          fen: '6k1/pp3ppp/3p4/4p3/4P3/8/PPP2PPP/6K1 w - - 0 1',
          hl: { rouges: ['d6'], bleus: ['d5'] },
          caption: 'Après ...e5, le pion d6 (rouge) est arriéré sur une colonne semi-ouverte : cible idéale pour les tours blanches. Et la case d5 (bleu) est un trou définitif juste devant lui.'
        },
        {
          titre: 'Le cavalier s\'installe au trou',
          fen: '6k1/pp3ppp/3p4/3Np3/4P3/8/PPP2PPP/6K1 w - - 0 1',
          hl: { verts: ['d5'], rouges: ['d6'] },
          caption: 'Le cavalier en d5 domine tout : aucun pion ne le chassera jamais. La bataille entière de ces structures tourne autour du contrôle de cette case.'
        }
      ],
      points: [
        { t: 'moins', txt: 'Cible durable sur une colonne semi-ouverte, avec un trou devant lui.' },
        { t: 'info', txt: 'La faiblesse est réelle seulement si elle est attaquable : un pion arriéré sur une colonne fermée n\'est pas grave.' },
        { t: 'info', txt: 'Exemple type : d6 dans beaucoup de Siciliennes — accepté en échange d\'activité.' }
      ]
    },
    {
      id: 'pendants',
      nom: 'Pions pendants',
      resume: 'Un couple (typiquement c4-d4 ou c5-d5) sur colonnes semi-ouvertes, sans pion voisin pour les soutenir.',
      vues: [
        {
          titre: 'Le duo c4-d4',
          fen: '6k1/pp3ppp/4p3/8/2PP4/8/P4PPP/6K1 w - - 0 1',
          hl: { verts: ['c4', 'd4'] },
          arrows: [['d4', 'd5', 'orange'], ['c4', 'c5', 'orange']],
          caption: 'Force : contrôle central et deux poussées dynamiques toujours dans l\'air (d4-d5 ou c4-c5). Faiblesse : dès qu\'un des deux avance ou s\'échange, il reste des cases faibles et un pion attaquable. Les pendants exigent un jeu de pièces actif — ils punissent la passivité.'
        }
      ],
      points: [
        { t: 'plus', txt: 'Contrôle central, potentiel de poussée dynamique.' },
        { t: 'moins', txt: 'Dès qu\'un des deux bouge, cases faibles et cible durable.' },
        { t: 'info', txt: 'Structure sœur de l\'isolé : l\'IQP se transforme souvent en pendants (et inversement) après un échange.' }
      ]
    },
    {
      id: 'chaine',
      nom: 'Chaîne de pions',
      resume: 'Des pions liés en diagonale — chaque chaîne définit les plans des deux camps.',
      vues: [
        {
          titre: 'd4-e5 contre d5-e6 (Française)',
          fen: '2b3k1/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/6K1 b - - 0 1',
          hl: { rouges: ['d4'], bleus: ['e6'] },
          arrows: [['c7', 'c5', 'rouge'], ['f7', 'f6', 'rouge'], ['f2', 'f4', 'vert']],
          caption: 'Principe de Nimzowitsch : on attaque une chaîne à sa BASE. Les Noirs frappent d4 par ...c5 (puis e5 par ...f6) ; les Blancs visent e6 via f4-f5. Chacun attaque du côté où sa chaîne « pointe » : les Blancs vers l\'aile roi, les Noirs vers l\'aile dame.',
          suite: {
            intro: 'La démolition d\'une chaîne, dans les règles de l\'art : la base d4, puis l\'autre base e5.',
            coups: [
              ['c5', 'Premier levier : la base d4 est attaquée.'],
              ['c3', 'Les Blancs étayent la base…'],
              ['f6', '…mais le second levier frappe déjà e5. La chaîne est prise entre deux feux.'],
              ['exf6', 'Les Blancs cèdent le terrain (sinon ...fxe5 et tout s\'écroule)…'],
              ['gxf6', 'Plus de chaîne : d4 est seul face à c5, et la colonne g s\'est ouverte pour les Noirs. Les deux leviers ont tout dynamité.']
            ]
          }
        }
      ],
      points: [
        { t: 'info', txt: 'On attaque une chaîne à sa base : c\'est pourquoi les Noirs jouent ...c5 et ...f6 contre d4-e5.' },
        { t: 'info', txt: 'La chaîne définit les plans : on attaque du côté où pointent ses pions.' },
        { t: 'moins', txt: 'Une chaîne fige aussi ses propres fous : le fou c8 de la Française est le « mauvais fou » type.' }
      ]
    },
    {
      id: 'levier',
      nom: 'Leviers (ruptures)',
      resume: 'La poussée de pion qui crée le contact et ouvre les lignes — la notion la plus rentable en pratique.',
      vues: [
        {
          titre: 'Les leviers de la Française',
          fen: '2b3k1/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/6K1 b - - 0 1',
          arrows: [['c7', 'c5', 'orange'], ['f7', 'f6', 'orange']],
          caption: 'Chaque structure a ses leviers thématiques : ici ...c5 et ...f6 pour les Noirs. Connaître le levier de SA structure = connaître son plan. Si vous jouez la Française, ...c5/...f6 doivent être des réflexes.'
        },
        {
          titre: 'Le crochet : pourquoi h3 peut coûter cher',
          fen: '6k1/5p2/8/6pp/8/7P/5PP1/6K1 w - - 0 1',
          hl: { rouges: ['h3'] },
          arrows: [['g5', 'g4', 'rouge']],
          caption: 'Le pion h3 (rouge) est un « crochet » : la marée noire ...g5-g4 s\'y accroche pour ouvrir les lignes de force sur le roi. Chaque poussée devant son roi crée des trous — g3 affaiblit f3 et h3, h3 offre ce crochet.'
        }
      ],
      points: [
        { t: 'info', txt: 'Les leviers classiques : ...c5 et ...f6 (Française), f4-f5 (attaques de roi), b4-b5 (minorité), ...b5 et ...d5 (Sicilienne/Hérisson), e4-e5 (Benoni).' },
        { t: 'plus', txt: 'Un levier prêt mais non joué est aussi une arme : la menace pèse sur chaque décision adverse.' },
        { t: 'moins', txt: 'Ne poussez pas les pions devant votre roi sans raison : chaque pas crée un trou ou un crochet définitif.' }
      ]
    },
    {
      id: 'majorite',
      nom: 'Majorité & minorité',
      resume: 'Plus de pions d\'un côté = un futur pion passé ; moins de pions = une arme d\'attaque paradoxale.',
      vues: [
        {
          titre: 'La majorité saine',
          fen: '6k1/pp3ppp/8/8/8/8/PPP2PPP/6K1 w - - 0 1',
          hl: { verts: ['c2'] },
          arrows: [['c2', 'c4', 'orange']],
          caption: '3 contre 2 à l\'aile dame, sans pion doublé : cette majorité fabriquera un pion passé en finale. Le candidat est c2 (pas de vis-à-vis) — on le pousse en premier.',
          suite: {
            intro: 'La machine à pion passé, de bout en bout : le candidat ouvre la marche, le duo suit, la percée conclut.',
            coups: [
              ['c4', 'Le candidat d\'abord — il n\'a pas de vis-à-vis, personne ne peut l\'échanger.'],
              ['g6', 'Les Noirs ne peuvent qu\'assister : leur propre majorité est de l\'autre côté.'],
              ['c5', 'Le candidat continue sa route sans se laisser fixer.'],
              ['Kg7', 'Le roi noir se prépare… mais il est loin.'],
              ['b4', 'Le duo se forme : b4 vient épauler.'],
              ['f6', 'Trop lent pour créer du contre-jeu.'],
              ['b5', 'L\'étau : c6 et b6 sont maintenant DEUX menaces de percée.'],
              ['Kf7', 'Le roi accourt…'],
              ['c6', 'La percée !'],
              ['bxc6', 'Forcé (sinon c6-c7 suivait),'],
              ['bxc6', 'Et voilà le pion passé promis. Le roi noir est condamné à monter la garde devant c6 pendant que le roi blanc ira se servir ailleurs : la majorité a été convertie.']
            ]
          }
        },
        {
          titre: 'L\'attaque de minorité (Carlsbad)',
          fen: '6k1/pp3ppp/2p5/3p4/3P4/4P3/PP3PPP/6K1 w - - 0 1',
          hl: { rouges: ['c6'] },
          arrows: [['b2', 'b5', 'vert']],
          caption: 'Deux pions attaquent trois ! La marche a4-b4-b5 force bxc6 (ou b5xc6) et laisse c6 arriéré sur colonne ouverte : une faiblesse éternelle. La minorité ne cherche pas à passer — elle cherche à créer une cible.',
          suite: {
            intro: 'La minorité en marche : deux pions partent créer une faiblesse — pas un pion passé.',
            coups: [
              ['b4', 'La minorité s\'ébranle : b4 ne cherche pas à passer, il cherche une cible.'],
              ['g6', 'Difficile de s\'y opposer sans créer d\'autres faiblesses.'],
              ['a4', 'Le second pion soutient : la marche est méthodique.'],
              ['Kg7', 'Les Noirs préparent leur défense…'],
              ['b5', 'Le contact ! (Sur ...cxb5 axb5, même thème : le pion d5 devient l\'isolé à cibler.)'],
              ['h5', 'Retarder l\'échéance ne l\'annule pas.'],
              ['bxc6', 'L\'échange fatidique…'],
              ['bxc6', 'Voilà l\'œuvre : c6 arriéré sur colonne ouverte, indéfendable par un pion, cible ÉTERNELLE. Les tours blanches ont leur programme pour les 30 prochains coups.']
            ]
          }
        }
      ],
      points: [
        { t: 'plus', txt: 'Majorité saine = machine à pion passé pour la finale.' },
        { t: 'info', txt: 'Attaque de minorité : pousser SES pions les moins nombreux pour créer une faiblesse adverse (le c6 de la Carlsbad).' },
        { t: 'moins', txt: 'Une majorité avec pions doublés peut être incapable de produire un passé : comptez toujours en pions « utiles ».' }
      ]
    },
    {
      id: 'divers',
      nom: 'Trous, îlots & tension',
      resume: 'Les autres réflexes d\'évaluation : cases faibles, îlots, et l\'art de gérer la tension.',
      vues: [
        {
          titre: 'Le trou : une case, pas un pion',
          fen: '6k1/pp3ppp/3p4/3Np3/4P3/8/PPP2PPP/6K1 w - - 0 1',
          hl: { verts: ['d5'] },
          caption: 'Un trou est une case qui ne peut plus jamais être défendue par un pion. Un cavalier installé dessus vaut souvent un pion : à long terme, cases faibles > pions faibles.'
        },
        {
          titre: 'Les îlots de pions',
          fen: '6k1/p5pp/2p5/3p4/8/8/PPP2PPP/6K1 w - - 0 1',
          caption: 'Blancs : 2 îlots (a2-b2-c2 et f2-g2-h2). Noirs : 3 îlots (a7, c6-d5, g7-h7). Moins on a d\'îlots, plus la structure est saine — chaque îlot supplémentaire est une frontière à défendre en finale.'
        },
        {
          titre: 'La tension : prendre, pousser ou attendre ?',
          fen: '6k1/ppp2ppp/8/3p4/3PP3/8/PP3PPP/6K1 w - - 0 1',
          arrows: [['e4', 'd5', 'orange'], ['e4', 'e5', 'orange']],
          caption: 'e4 contre d5 : trois options — prendre (exd5), pousser (e5), ou maintenir la tension. Résoudre la tension est une concession : demandez-vous toujours À QUI PROFITE l\'échange ou la poussée. Relâcher trop tôt est une des plus grosses fuites de points au niveau club.'
        }
      ],
      points: [
        { t: 'info', txt: 'Pions faibles vs cases faibles : on accepte parfois l\'un pour éviter l\'autre.' },
        { t: 'info', txt: 'Îlots : moins il y en a, plus la finale est simple à tenir.' },
        { t: 'plus', txt: 'Maintenir la tension garde toutes les options ; c\'est l\'adversaire qui devra se déclarer.' },
        { t: 'moins', txt: 'Prendre ou pousser « automatiquement » sans se demander à qui ça profite.' }
      ]
    }
  ];

  const STRUCTURES = [
    {
      id: 'carlsbad',
      nom: 'Carlsbad',
      origine: 'Gambit Dame refusé, variante d\'échange',
      resume: 'LA structure-école : un plan complet du début à la finale — l\'attaque de minorité.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '6k1/pp3ppp/2p5/3p4/3P4/4P3/PP3PPP/6K1 w - - 0 1',
          hl: { rouges: ['c6'] },
          arrows: [['b2', 'b5', 'vert'], ['f7', 'f5', 'rouge']],
          caption: 'Colonne c semi-ouverte pour les Blancs, colonne e pour les Noirs. Plan blanc : la minorité a4-b4-b5 pour créer la faiblesse c6. Plan noir : le jeu de pièces à l\'aile roi (...Ce4, ...f5) — chacun sa moitié d\'échiquier.',
          suite: {
            intro: 'Le plan blanc de A à Z : l\'attaque de minorité fabrique la faiblesse c6.',
            coups: [
              ['b4', 'Coup 1 du plan : la minorité s\'ébranle.'],
              ['g6', 'Les Noirs, eux, jouent normalement à l\'aile roi.'],
              ['a4', 'Coup 2 : tout avance ensemble.'],
              ['Kg7', '…'],
              ['b5', 'Coup 3 : le contact est créé.'],
              ['h5', 'Sur ...cxb5 axb5, c\'est d5 qui devient la cible — pas d\'échappatoire.'],
              ['bxc6', 'Coup 4 : l\'échange…'],
              ['bxc6', '…et le but est atteint : c6 arriéré sur colonne ouverte. En partie réelle, les tours s\'empilent maintenant sur c6 — un plan complet, du 10e au 40e coup.']
            ]
          }
        }
      ],
      plansB: ['Attaque de minorité b4-b5 → faiblesse durable en c6', 'Ou attaque centrale f3 + e3-e4', 'Ou Ce5 et f2-f4 contre le roi'],
      plansN: ['...Ce4 et jeu de pièces à l\'aile roi', '...f5 et contre-jeu sur la colonne e', 'Neutraliser la colonne c à temps (...Cd? ...Fd7-e8)'],
      verdict: 'Force blanche : un plan clair et durable. Contrepartie : peu d\'espace, jeu lent. Idéale pour apprendre à dérouler un plan entier.'
    },
    {
      id: 'iqp',
      nom: 'Pion dame isolé (IQP)',
      origine: 'Tarrasch, Caro-Kann Panov, nombreuses lignes du Gambit Dame',
      resume: 'La structure la plus fréquente du répertoire 1.d4/1.e4 confondus : savoir jouer LES DEUX camps.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '6k1/pp3ppp/4p3/8/3P4/8/PP3PPP/6K1 w - - 0 1',
          hl: { rouges: ['d4'], bleus: ['d5'], verts: ['e5', 'c5'] },
          arrows: [['d4', 'd5', 'orange']],
          caption: 'Camp blanc : avant-postes e5/c5 (vert), espace, attaque sur le roi, et la percée d4-d5 en réserve — il doit ÉVITER les échanges. Camp noir : blocus en d5 (bleu), échanger les pièces, viser la finale où d4 (rouge) n\'est plus qu\'une faiblesse.'
        }
      ],
      plansB: ['Pièces actives : Ce5, Fg5, batteries sur le roi', 'La poussée libératrice d4-d5 au bon moment', 'Éviter les échanges, surtout des dames'],
      plansN: ['Blocus ferme de d5 (cavalier)', 'Échanger pièce par pièce', 'La finale : l\'isolé devient une cible pure'],
      verdict: 'Le milieu de jeu appartient à l\'IQP, la finale à son adversaire. Structure sœur : les pendants (l\'IQP devient c4+d4 après un échange en c3/b6).'
    },
    {
      id: 'francaise',
      nom: 'Française',
      origine: 'Chaîne d4-e5 contre e6-d5',
      resume: 'Le duel de chaînes type : chacun attaque du côté où pointent ses pions.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '2b3k1/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/6K1 w - - 0 1',
          hl: { rouges: ['c8', 'd4'] },
          arrows: [['c7', 'c5', 'rouge'], ['f7', 'f6', 'rouge'], ['f2', 'f4', 'vert']],
          caption: 'Blancs : espace et attaque à l\'aile roi (f4-f5, sacrifices sur h7/f7) — le fou c8 noir (rouge) est enfermé. Noirs : ...c5 et ...f6 contre les bases, pression sur d4 (rouge), colonne c. Si e5 tombe, les cases blanches (e4, d3) se retournent contre les Blancs.'
        }
      ],
      plansB: ['f4-f5 et l\'attaque de roi', 'Tenir d4 (c3, Cf3, parfois Ce2)', 'Exploiter le mauvais fou c8'],
      plansN: ['...c5 puis pression maximale sur d4', '...f6 pour dynamiter e5', 'Contre-jeu colonne c ; échanger ou activer le fou c8 (...b6-...Fa6)'],
      verdict: 'Faiblesse noire typique : le fou de cases blanches. Faiblesse blanche : d4 surchargé dès que ...c5 et ...f6 tombent ensemble.'
    },
    {
      id: 'siciliennes',
      nom: 'Siciliennes ouvertes',
      origine: 'Najdorf, Scheveningen, Boleslavsky, Maroczy',
      resume: 'Le déséquilibre par excellence : colonne c contre espace central.',
      vues: [
        {
          titre: 'Najdorf / Scheveningen — le petit centre',
          fen: '6k1/1p3ppp/p2pp3/8/4P3/8/PPP2PPP/6K1 w - - 0 1',
          arrows: [['d6', 'd5', 'rouge'], ['b7', 'b5', 'rouge'], ['e4', 'e5', 'vert'], ['f2', 'f4', 'vert'], ['g2', 'g4', 'vert']],
          caption: 'Les Noirs ont la colonne c semi-ouverte et deux leviers : ...d5 (l\'égalisation centrale) et ...b5-b4 (l\'assaut de l\'aile dame). Les Blancs ont l\'espace et les avalanches e5 ou f4-f5-g4. Bataille type : attaques sur ailes opposées, la vitesse prime.'
        },
        {
          titre: 'Boleslavsky — ...e5 et le trou d5',
          fen: '6k1/pp3ppp/3p4/4p3/4P3/8/PPP2PPP/6K1 w - - 0 1',
          hl: { rouges: ['d6'], bleus: ['d5'] },
          caption: 'Les Noirs acceptent d6 arriéré et le trou d5 contre de l\'activité de pièces et le contrôle de d4. Toute la bataille se joue sur d5 : si les Blancs y installent durablement un cavalier, ils sont mieux ; si les Noirs le neutralisent, l\'activité l\'emporte.'
        },
        {
          titre: 'Maroczy Bind — l\'étau c4+e4',
          fen: '6k1/pp2pp1p/3p2p1/8/2P1P3/8/PP3PPP/6K1 w - - 0 1',
          hl: { bleus: ['d5', 'b5'], rouges: ['d4'] },
          arrows: [['b7', 'b5', 'rouge'], ['f7', 'f5', 'rouge']],
          caption: 'Les pions c4+e4 verrouillent d5 et b5 (bleu) : les Noirs étouffent. Leurs espoirs : arracher ...b5 ou ...f5, ou la forteresse d\'échanges (fou de cases noires contre cavalier). Force blanche : l\'espace éternel ; sa dette : les cases noires, d4 en tête (rouge), si les fous s\'échangent.'
        }
      ],
      plansB: ['Espace : e5 ou f4-f5, g4 dans les lignes d\'attaque', 'Contrôle de d5 (Boleslavsky/Maroczy)', 'Attaques de roi sur ailes opposées'],
      plansN: ['La colonne c : pression et sacrifices d\'échange en c3', 'Les leviers ...d5 et ...b5-b4', 'Maroczy : patience, ...b5/...f5 ou la forteresse'],
      verdict: 'Structures dynamiques : celui qui connaît son levier et va le plus vite gagne. Le matériel compte moins que le temps.'
    },
    {
      id: 'estindienne',
      nom: 'Est-Indienne / Mar del Plata',
      origine: 'Centre bloqué d5 blanc contre e5 noir',
      resume: 'La course la plus pure des échecs : aile dame contre aile roi.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '6k1/ppp2p1p/3p2p1/3Pp3/2P1P3/5P2/PP4PP/6K1 w - - 0 1',
          arrows: [['c4', 'c5', 'vert'], ['f7', 'f5', 'rouge']],
          caption: 'Règle d\'or des centres bloqués : on attaque du côté où pointent ses pions. Blancs : c4-c5, ouverture de la colonne c, invasion à l\'aile dame. Noirs : ...f5-f4 puis l\'avalanche g5-g4-g3 et le mat. C\'est une course : vitesse > matériel — chaque tempo défensif est un tempo perdu.',
          suite: {
            intro: 'Les deux courses lancées en parallèle : chacun fonce du côté où pointent ses pions — et personne ne défend.',
            coups: [
              ['c5', 'Départ de la course blanche, côté aile dame.'],
              ['f5', 'Départ de la course noire, côté aile roi. Aucun des deux ne regarde l\'autre.'],
              ['cxd6', 'Les Blancs ouvrent la colonne c…'],
              ['cxd6', '…c\'est par là que leurs tours envahiront (c7 !).'],
              ['b4', 'Et déjà la suite : b4-b5, l\'aile dame noire va craquer.'],
              ['f4', 'Les Noirs ne prennent même pas en e4 : ...f4 fige et prépare l\'avalanche.'],
              ['b5', 'Chaque coup blanc gagne un mètre à l\'aile dame…'],
              ['g5', '…chaque coup noir un mètre vers le roi blanc.'],
              ['a4', 'Personne ne freine :'],
              ['g4', 'l\'avalanche approche…'],
              ['a5', 'Les files a et b vont s\'ouvrir —'],
              ['g3', '— et g3 frappe à la porte du roi. En partie réelle, tout se joue à UN tempo près : défendre, c\'est déjà perdre. Vitesse > matériel.']
            ]
          }
        }
      ],
      plansB: ['c4-c5 et cxd6 / c6 : ouvrir la colonne c', 'Invasion par c7 avec tours et cavaliers', 'Défense minimale à l\'aile roi (souvent : fuir en cas d\'urgence)'],
      plansN: ['...f5-f4 puis ...g5-g4 : l\'avalanche', 'Tout sacrifier pour ouvrir la colonne g ou h', 'Ne PAS échanger les pièces d\'attaque'],
      verdict: 'Le laboratoire des attaques mutuelles. À jouer pour apprendre la valeur du temps ; à éviter si on aime la sécurité.'
    },
    {
      id: 'benoni',
      nom: 'Benoni',
      origine: 'Pions blancs d5-e4 contre c5-d6 noirs',
      resume: 'Majorité de dame noire contre rouleau central blanc : dynamite pure.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '6k1/pp3p1p/3p2p1/2pP4/4P3/8/PP3PPP/6K1 w - - 0 1',
          hl: { verts: ['c5'] },
          arrows: [['b7', 'b5', 'rouge'], ['e4', 'e5', 'vert']],
          caption: 'Noirs : majorité à l\'aile dame (le levier ...b5), colonne e semi-ouverte, et le fou g7 qui rayonne sur la grande diagonale. Blancs : le rouleau central — e4-e5 est LE levier thématique, souvent décisif quand il tombe au bon moment. Structure qui punit les joueurs passifs des deux côtés.'
        }
      ],
      plansB: ['Le rouleau e4-e5 (préparé par f4 ou Cc4)', 'Contenir ...b5 (a4 !)', 'Espace et clouages sur la colonne e après e5'],
      plansN: ['...b5 : la majorité en marche', 'Pression sur e4 et la colonne e', 'Le fou g7 + sacrifices thématiques (...Cxe4 !)' ],
      verdict: 'Chaque camp joue contre la montre : e4-e5 contre ...b5-b4. L\'évaluation bascule d\'un seul levier réussi.'
    },
    {
      id: 'stonewall',
      nom: 'Stonewall',
      origine: 'f5-e6-d5-c6 (Hollandaise) — ou f4-e3-d4-c3 en miroir',
      resume: 'Un mur qui verrouille e4/e5 — au prix d\'un fou muré et d\'un trou éternel.',
      vues: [
        {
          titre: 'Le mur hollandais',
          fen: '2b3k1/pp4pp/2p1p3/3p1p2/2PP4/4P3/PP3PPP/6K1 w - - 0 1',
          hl: { bleus: ['e4'], rouges: ['c8'] },
          caption: 'Le mur c6-d5-e6-f5 contrôle e4… mais le laisse creux : e4 (bleu) est le trou permanent du camp noir, et le fou c8 (rouge) est muré derrière ses propres pions. Plan noir : l\'attaque de roi (...Ce4, montée de dame via e8-h5). Plan blanc : échanger le BON fou noir (celui des cases noires), s\'installer en e5, jouer sur les cases noires.'
        }
      ],
      plansB: ['Échanger le fou de cases noires adverse (Fa3 ou Fd2-e1-h4)', 'Occuper e5, préparer f3 ou g4 au bon moment', 'Finale : le mauvais fou c8 est un demi-pion de moins'],
      plansN: ['...Ce4 soutenu par le mur', 'Montée de dame (…De8-h5) et attaque directe', 'Activer coûte que coûte le fou c8 (...b6-...Fa6 ou ...Fd7-e8-h5)'],
      verdict: 'Attaque directe clé en main, mais chaque échange de pièces d\'attaque rapproche une finale structurellement inférieure.'
    },
    {
      id: 'herisson',
      nom: 'Hérisson (Hedgehog)',
      origine: 'a6-b6-d6-e6 noirs contre c4+e4 blancs',
      resume: 'La structure élastique : recroquevillé sur trois rangées, mais deux ressorts toujours armés.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '6k1/5ppp/pp1pp3/8/2P1P3/8/PP3PPP/6K1 w - - 0 1',
          arrows: [['b6', 'b5', 'rouge'], ['d6', 'd5', 'rouge']],
          caption: 'Les Noirs vivent sur trois rangées, sans faiblesse attaquable, avec les ressorts ...b5 et ...d5 toujours dans l\'air. Les Blancs ont tout l\'espace — mais chaque poussée pour « conclure » crée la faiblesse que le hérisson attend pour contre-attaquer. Exigeante en compréhension : déconseillée avant ~1800-2000.'
        }
      ],
      plansB: ['Occuper l\'espace sans rien pousser d\'irréversible', 'Doubler sur la colonne d, contrôler b5/d5', 'La bonne poussée (b4, f4 ou e5) au moment où elle ne crée rien de faible'],
      plansN: ['Attendre en s\'améliorant (...Te8, ...Ff8, ...Dc7)', 'Le ressort ...b5 dès que c4 se dégarnit', 'Le ressort ...d5 dès que e4 se dégarnit'],
      verdict: 'Le camp qui craque en premier est celui qui joue une poussée de trop. Patience contre patience.'
    },
    {
      id: 'symetriques',
      nom: 'Structures symétriques',
      origine: 'Slave d\'échange, Berlinoise, colonnes ouvertes miroir',
      resume: 'Symétrie ≠ nulle : le premier déséquilibre — ou la simple initiative — compte double.',
      vues: [
        {
          titre: 'Slave d\'échange',
          fen: '6k1/pp2pppp/8/3p4/3P4/8/PP2PPPP/6K1 w - - 0 1',
          hl: { bleus: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] },
          caption: 'Structure miroir, colonne c ouverte pour les deux camps (bleu). Tout se joue sur l\'activité : premier arrivé sur la colonne, premier avant-poste, première majorité mobilisée. Danger mortel : croire que symétrie = nulle et jouer des coups « neutres » — l\'initiative se prend coup par coup.'
        }
      ],
      plansB: ['Prendre la colonne c en premier (Tc1 avant l\'adversaire)', 'Créer le premier déséquilibre : avant-poste e5, minorité, majorité mobile', 'Convertir un petit mieux en finale sans risque'],
      plansN: ['Neutraliser la colonne (échanger les tours au bon moment)', 'Symétriser tant que c\'est sans danger, dévier dès que ça paie', 'Ne jamais copier un coup qui permet une combinaison au centre'],
      verdict: 'Les positions « nulles » se gagnent : un tempo d\'activité y vaut plus qu\'un pion ailleurs.'
    },
    {
      id: 'caro',
      nom: 'Caro-Kann / Slave',
      origine: 'Le triangle c6-d5 solide',
      resume: 'Le squelette le plus sain du jeu — à condition de sortir le fou c8 à temps.',
      vues: [
        {
          titre: 'Le squelette',
          fen: '6k1/pp2pppp/2p5/3p1b2/3P4/8/PPP2PPP/6K1 w - - 0 1',
          hl: { verts: ['f5'] },
          caption: 'c6-d5 : aucune faiblesse, un excellent squelette de finale. La règle vitale : le fou c8 SORT (en f5 ou g4 — ici en vert) AVANT de jouer ...e6, sinon il devient le mauvais fou de la Française. Les Blancs jouent l\'espace et l\'aile roi ; les Noirs la solidité et les finales.'
        }
      ],
      plansB: ['Gagner de l\'espace (e5, parfois g4 contre le fou f5)', 'Attaque d\'aile roi à structure stable', 'Empêcher les libérations ...c5 et ...e5'],
      plansN: ['Fou c8 dehors, PUIS ...e6 : l\'ordre sacré', 'Les libérations thématiques ...c5 ou ...e5', 'Viser des finales où la structure paie'],
      verdict: 'Force : solidité maximale, très peu de défaites. Faiblesse : passivité si les libérations n\'arrivent jamais — les Blancs jouent alors « gratuitement ».'
    }
  ];

  const EXERCICES = [
    {
      id: 'faiblesses',
      titre: 'Chasse aux faiblesses',
      niveau: 1,
      fen: '6k1/pp3pp1/5p2/3p4/8/2P1P3/PP3PPP/6K1 w - - 0 1',
      question: 'Photographiez la structure noire : quel pion est ISOLÉ ?',
      choix: ['Le pion d5', 'Le pion f6', 'Le pion b7'],
      bonne: 0,
      explication: 'd5 n\'a aucun pion ami sur les colonnes c et e : isolé, il ne sera plus jamais défendu par un pion — cible n° 1 sur la colonne d semi-ouverte. f6-f7 sont doublés mais PAS isolés (g7 est voisin) ; b7 a son voisin a7. Reconnaître isolé / doublé / arriéré à vue est le premier réflexe : beaucoup de parties se gagnent juste en fixant puis attaquant une faiblesse.',
      hlApres: { rouges: ['d5', 'f6', 'f7'] }
    },
    {
      id: 'fixer',
      titre: 'Fixer, puis attaquer',
      niveau: 1,
      fen: '6k1/5ppp/p1p5/3p4/3P4/4P3/P4PPP/2R3K1 w - - 0 1',
      question: 'L\'attaque de minorité a fait son œuvre : c6 est arriéré sur colonne ouverte. Quel est le bon plan blanc ?',
      choix: ['Empiler tours (et dame) sur c6 en l\'empêchant d\'avancer', 'Pousser e3-e4 pour ouvrir le centre', 'Lancer g4-h4 contre le roi'],
      bonne: 0,
      explication: 'Le principe : on FIXE la faiblesse (c6 ne doit jamais pouvoir avancer en c5), puis on empile dessus. Chaque pièce noire condamnée à défendre c6 est une pièce en moins partout ailleurs — l\'avantage grandit tout seul. Ouvrir le centre ou attaquer le roi disperserait l\'effort et offrirait du contre-jeu.',
      hlApres: { rouges: ['c6'], bleus: ['c5'] }
    },
    {
      id: 'passe-eloigne',
      titre: 'Le pion passé éloigné',
      niveau: 2,
      fen: '8/5p2/4k1p1/P6p/4K2P/6P1/5P2/8 w - - 0 1',
      question: 'Finale de pions avec le passé a5. Quel plan gagne ?',
      choix: ['Pousser le pion a : le roi noir devra courir, le roi blanc mangera l\'aile roi', 'Garder le pion a en réserve et avancer le roi vers l\'aile roi', 'Échanger le plus de pions possible à l\'aile roi'],
      bonne: 0,
      explication: 'Le passé éloigné est un LEURRE : il ne va pas à dame, il détourne. Pendant que le roi noir traverse tout l\'échiquier pour l\'arrêter, le roi blanc dévore f7-g6-h5 et promeut de l\'autre côté. C\'est LA technique de finale la plus rentable qui soit — décisive jusqu\'à très haut niveau.',
      suite: {
        intro: 'Déroulez la démonstration : le pion a aimante le roi noir, le roi blanc mange l\'autre aile.',
        coups: [
          ['a6', 'Le leurre s\'élance. Le roi noir doit s\'en occuper — personne d\'autre ne peut.'],
          ['Kd6', 'Le roi noir court vers la case de promotion…'],
          ['a7', '…et le pion l\'oblige à aller jusqu\'au bout du monde.'],
          ['Kc7', 'Toujours plus loin de son aile roi.'],
          ['Ke5', 'Pendant ce temps : le roi blanc entre dans le garde-manger.'],
          ['Kb7', 'Le roi noir arrive enfin sur le pion…'],
          ['Kf6', '…mais le roi blanc est déjà à table.'],
          ['Kxa7', 'Le leurre est mangé — mission accomplie : regardez où sont les deux rois.'],
          ['Kxf7', 'Premier service.'],
          ['g5', 'Désespoir : les pions noirs tentent de fuir.'],
          ['hxg5', 'Deuxième service.'],
          ['h4', 'Dernier espoir noir…'],
          ['gxh4', 'Et les pions g5 et h4 filent à dame. Le roi noir est à des années-lumière.']
        ]
      }
    },
    {
      id: 'candidat',
      titre: '« Candidate first »',
      niveau: 2,
      fen: '8/8/1p2k3/8/1PP5/4K3/8/8 w - - 0 1',
      question: 'Majorité b4+c4 contre b6 : quel pion pousser en premier pour créer un passé ?',
      choix: ['c4-c5 : le candidat d\'abord', 'b4-b5 : sécuriser l\'espace d\'abord'],
      bonne: 0,
      explication: 'Le CANDIDAT est le pion sans vis-à-vis : ici c4 (les Noirs n\'ont plus de pion c). Règle absolue : « candidate first ». 1.b5 ?? fige la majorité : après ce coup, c5 se heurte à bxc5 et il ne reste rien. 1.c5 ! force l\'échange et b4 récupère un passé propre.',
      suite: {
        intro: 'La bonne exécution : le candidat avance, la majorité accouche d\'un passé.',
        coups: [
          ['c5', 'Le candidat d\'abord ! (1.b5?? figerait tout : plus aucun passé possible.)'],
          ['bxc5', 'Forcé tôt ou tard…'],
          ['bxc5', 'Et voilà un pion passé tout neuf : la majorité a rempli son contrat.']
        ]
      }
    },
    {
      id: 'roi',
      titre: 'Les pions du roi sont sacrés',
      niveau: 1,
      fen: '6k1/5ppp/3q4/8/8/5N2/5PPP/6K1 w - - 0 1',
      question: 'La dame noire lorgne h2 depuis d6. Faut-il jouer h3 « par sécurité » ?',
      choix: ['Oui : h3, on ne sait jamais', 'Non : h2 est déjà défendu — et chaque poussée crée un trou ou un crochet'],
      bonne: 1,
      explication: 'h2 est défendu par le roi (et le cavalier f3 garde les entrées). h3 « préventif » créerait un CROCHET permanent : le jour où l\'adversaire lance ...g5-g4, la poussée s\'accroche à h3 pour ouvrir les lignes. De même g3 troue f3 et h3. On ne touche aux pions du roi que pour une raison concrète — jamais « au cas où ».',
      hlApres: { rouges: ['h3'], verts: ['g2', 'h2', 'f2'] }
    },
    {
      id: 'tension',
      titre: 'À qui profite la résolution ?',
      niveau: 2,
      fen: '6k1/ppp2ppp/4p3/3p4/2PP4/8/PP3PPP/6K1 w - - 0 1',
      question: 'Tension c4/d5. Faut-il jouer cxd5 tout de suite ?',
      choix: ['Oui : ouvrir la colonne c immédiatement', 'Non : maintenir la tension et développer — se demander d\'abord à qui profite l\'échange'],
      bonne: 1,
      explication: 'Après cxd5 exd5, le fou c8 respire enfin et les Noirs obtiennent une structure Carlsbad confortable : l\'échange PROFITE AUX NOIRS — donc on ne le joue pas sans raison. Maintenir la tension garde toutes les options (cxd5 au moment utile, c5 pour fermer, ou laisser l\'adversaire se déclarer). Résoudre la tension trop tôt est une des plus grosses fuites de points au niveau club.',
      suite: {
        intro: 'Regardez ce que l\'échange automatique offre aux Noirs.',
        coups: [
          ['cxd5', 'L\'échange « naturel »…'],
          ['exd5', '…et le fou c8 est libéré, la structure noire est saine : les Noirs disent merci. La tension était une arme — elle vient d\'être rendue.']
        ]
      }
    },
    {
      id: 'transformation',
      titre: 'Transformation : IQP → pendants',
      niveau: 3,
      fen: '6k1/pp3ppp/4p3/8/3P4/2P5/P4PPP/6K1 w - - 0 1',
      question: 'Après la poussée c3-c4, quelle structure obtient-on, et qui en profite ?',
      choix: ['Les pions pendants c4-d4 : excellent si vos pièces sont actives, faible sinon', 'Toujours un pion isolé : rien ne change', 'Une structure perdante : il ne faut jamais jouer c4'],
      bonne: 0,
      explication: 'Anticiper les TRANSFORMATIONS 2-3 coups à l\'avance est un marqueur de niveau : IQP → pendants (c4), Carlsbad → colonne e ouverte, pendants → isolé après une poussée… Chaque transformation a un bénéficiaire. Les pendants c4-d4 sont plus dynamiques que l\'isolé (deux poussées possibles) mais plus exposés : ils exigent des pièces actives. La question n\'est jamais « bonne ou mauvaise structure ? » mais « bonne pour QUI, avec CES pièces ? ».',
      suite: {
        intro: 'La métamorphose en direct.',
        coups: [
          ['c4', 'L\'isolé d4 devient le duo pendant c4-d4 : plus d\'énergie (d5 et c5 dans l\'air), plus de responsabilités (deux cibles sur colonnes semi-ouvertes).']
        ]
      }
    },
    {
      id: 'iqp-contre',
      titre: 'Jouer CONTRE l\'isolé',
      niveau: 2,
      fen: '6k1/pp3ppp/4p3/8/3P4/8/PP3PPP/6K1 w - - 0 1',
      question: 'Vous jouez contre l\'IQP d4. Le plan correct ?',
      choix: ['Blocus ferme en d5, échanger les pièces, viser la finale', 'Attaquer d4 immédiatement avec toutes les pièces', 'Pousser ses propres pions de l\'aile roi'],
      bonne: 0,
      explication: 'Contre l\'isolé, l\'ordre des opérations est immuable : 1) BLOQUER d5 (sinon la poussée d4-d5 libère tout), 2) ÉCHANGER — chaque échange éteint l\'activité qui compense le pion, 3) la FINALE, où l\'isolé n\'est plus qu\'une cible. Attaquer d4 frontalement trop tôt échoue : il est facile à défendre tant que les pièces blanches sont actives. Le camp de l\'isolé veut le milieu de jeu ; privez-l\'en.',
      hlApres: { bleus: ['d5'], rouges: ['d4'] }
    },
    {
      id: 'chaine-base',
      titre: 'La chaîne se casse par la base',
      niveau: 1,
      fen: '6k1/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/6K1 b - - 0 1',
      question: 'Chaîne blanche d4-e5 (Française). Où les Noirs doivent-ils frapper ?',
      choix: ['La base : ...c5 contre d4 (puis ...f6 contre e5)', 'L\'aile : ...g5 pour gagner de l\'espace', 'Nulle part : attendre et développer'],
      bonne: 0,
      explication: 'Principe de Nimzowitsch : une chaîne s\'attaque à sa BASE. Détruisez d4 et e5 tombe tout seul — l\'inverse n\'est pas vrai. C\'est exactement pourquoi ...c5 et ...f6 sont LES réflexes de la Française. Corollaire : chacun attaque du côté où pointe sa chaîne.',
      suite: {
        intro: 'Le plan noir en action : la base d4, puis l\'autre base e5.',
        coups: [
          ['c5', 'Premier coup de boutoir sur la base d4.'],
          ['c3', 'Les Blancs étayent…'],
          ['f6', '…mais le second levier frappe déjà e5 : la chaîne craque des deux bouts.']
        ]
      }
    },
    {
      id: 'fous',
      titre: 'Bon fou, mauvais fou',
      niveau: 2,
      fen: '2b3k1/pp4pp/2p1p3/3p1p2/3P4/3BP3/PP3PPP/6K1 w - - 0 1',
      question: 'Deux fous de cases blanches. Lequel est le « mauvais » ?',
      choix: ['Le fou c8 : muré derrière ses pions c6-d5-e6-f5', 'Le fou d3 : bloqué par d4', 'Aucun : les fous se valent toujours'],
      bonne: 0,
      explication: 'Un fou est « mauvais » quand SES PROPRES pions fixes vivent sur sa couleur : c6, d5, e6 et f5 sont tous sur cases blanches — le fou c8 est en prison à perpétuité. Le fou d3, lui, circule librement (les pions blancs d4-e3 sont sur cases noires). Conséquences pratiques : le camp au mauvais fou doit l\'échanger (...b6-...Fa6) ou le sortir AVANT de fermer la structure ; le camp adverse refuse cet échange et vise la finale « bon fou contre mauvais fou », gagnante presque toute seule.',
      hlApres: { rouges: ['c8'], verts: ['d3'] }
    },
    {
      id: 'trou',
      titre: 'Une case vaut un pion',
      niveau: 1,
      fen: '6k1/pp3ppp/3p4/4p3/4P3/2N5/PPP2PPP/6K1 w - - 0 1',
      question: 'Structure Boleslavsky : où va le cavalier c3 ?',
      choix: ['d5 : le trou — plus aucun pion ne pourra jamais le chasser', 'b5 : attaquer a7 et d6', 'a4 : viser la case b6'],
      bonne: 0,
      explication: 'd5 est un TROU : ...e5 est passé, aucun pion noir ne contrôle plus jamais cette case. Un cavalier qui s\'y installe domine l\'échiquier en permanence — à long terme, les cases faibles pèsent plus lourd que les pions faibles, et un avant-poste pareil vaut souvent un pion entier. b5 et a4 se font chasser d\'un simple ...a6 ou ...b5 : éphémère contre éternel.',
      suite: {
        intro: 'Installation définitive.',
        coups: [
          ['Nd5', 'Intouchable. Chaque pièce noire devra désormais compter avec lui — et l\'échanger laisserait un pion blanc passé protégé en d5 ou une invasion sur la colonne.']
        ]
      }
    },
    {
      id: 'percee',
      titre: 'La percée b6 !',
      niveau: 3,
      fen: '6k1/ppp5/8/PPP5/8/8/6K1/8 w - - 0 1',
      question: '3 pions contre 3, rois éloignés. Comment les Blancs forcent-ils un pion à dame ?',
      choix: ['1.b6 ! — le sacrifice de percée', '1.a6 — gagner de l\'espace d\'abord', 'Impossible sans l\'aide du roi'],
      bonne: 0,
      explication: 'LA percée classique, à connaître par cœur : 1.b6 ! Sur 1...axb6 vient 2.c6 ! bxc6 3.a6 et le pion a court à dame ; sur 1...cxb6, c\'est 2.a6 ! bxa6 3.c6 — symétrique. Deux pions sacrifiés pour un passé inarrêtable : ça ne marche que parce que le roi noir est hors du carré. Toute évaluation de structure repose sur la finale qu\'elle promet — et cette finale-là, il faut la voir en une seconde.',
      suite: {
        intro: 'La démonstration, branche 1...axb6.',
        coups: [
          ['b6', 'Le bélier. Les trois pions noirs ne peuvent pas tout garder.'],
          ['axb6', 'Sur 1...cxb6, le miroir : 2.a6 ! bxa6 3.c6 et c\'est le pion c qui passe.'],
          ['c6', 'Deuxième sacrifice : le pion b7 est débordé.'],
          ['bxc6', 'Forcé…'],
          ['a6', 'Et plus personne ne peut arrêter le pion a : le roi noir est hors du carré.'],
          ['c5', 'Trop tard, dans tous les sens du terme.'],
          ['a7', 'Une case du but.'],
          ['c4', 'La course est perdue d\'une pleine longueur…'],
          ['a8=Q+', 'Dame — avec échec en prime. La percée b6/c6/a6 : un réflexe à graver.']
        ]
      }
    },
    {
      id: 'carre',
      titre: 'La règle du carré',
      niveau: 1,
      fen: '8/5k2/8/8/P7/8/7K/8 b - - 0 1',
      question: 'Trait aux Noirs. Le roi f7 rattrape-t-il le pion a4 ?',
      choix: ['Oui : en entrant dans le carré a4-a8-e8-e4', 'Non : le pion est trop loin', 'Seulement si le roi blanc n\'aide pas'],
      bonne: 0,
      explication: 'Le carré du pion a4 va de a4 à e8 : si le roi entre dans ce carré à son tour de jeu, il rattrape le pion — sans calculer une seule variante. 1...Ke6 ! entre dans le carré (colonne e) : quel que soit le sprint du pion, le roi arrive à temps. Astuce : diagonale = la ligne la plus rapide. Ces automatismes de finale de pions (carré, opposition, percée) sont le socle : toute évaluation de structure finit par la question « et si tout s\'échange ? ».',
      hlApres: { bleus: ['a4', 'b4', 'c4', 'd4', 'e4', 'e5', 'e6', 'e7', 'e8', 'a8', 'b8', 'c8', 'd8', 'a5', 'a6', 'a7', 'b5', 'c5', 'd5', 'b6', 'c6', 'd6', 'b7', 'c7', 'd7'] },
      suite: {
        intro: 'Le roi plonge dans le carré et cueille le fuyard.',
        coups: [
          ['Ke6', 'Dans le carré ! À partir d\'ici c\'est mathématique.'],
          ['a5', 'Le pion sprinte…'],
          ['Kd5', '…le roi coupe par la diagonale — le chemin le plus court.'],
          ['a6', 'Encore deux cases…'],
          ['Kc6', 'Le filet se referme.'],
          ['a7', 'Une seule case du but !'],
          ['Kb7', 'Et le pion tombe. Aucun calcul : juste le carré, vu en une seconde.']
        ]
      }
    }
  ];

  global.PAWNS = { notions: NOTIONS, structures: STRUCTURES, exercices: EXERCICES };
})(typeof window !== 'undefined' ? window : globalThis);
