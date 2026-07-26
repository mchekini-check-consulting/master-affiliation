/*
 * Échecs360 — données du répertoire d'ouvertures.
 *
 * OPENINGS : [{ id, nom, couleur: 'w'|'b', apercu, description, lignes }]
 * Chaque ligne : { id, titre, type: 'ligne'|'piege', resume,
 *                  coups: [[san, commentaire], ...] }
 * Les coups alternent Blancs/Noirs depuis la position initiale ; chaque SAN
 * est validé par tests/openings.test.js (légalité + notation canonique).
 */
(function (global) {
  'use strict';

  const OPENINGS = [
    {
      id: 'londres',
      nom: 'Système de Londres',
      couleur: 'w',
      apercu: '1.d4 puis Ff4 : le même schéma solide et facile à retenir, contre presque toutes les défenses.',
      description: 'Le Londres est un « système » : au lieu d\'apprendre des variantes par cœur, '
        + 'les Blancs installent toujours la même structure — pions c3/d4/e3 en pyramide, '
        + 'fou en f4 AVANT de fermer la diagonale avec e3, cavaliers en f3 et d2, fou en d3, '
        + 'petit roque. Solide, sans grand risque, avec un plan d\'attaque clair sur l\'aile roi.',
      lignes: [
        {
          id: 'londres-classique',
          titre: 'La structure classique',
          type: 'ligne',
          resume: 'Le schéma de base : la pyramide c3-d4-e3, le fou sorti en f4 avant e3, et le petit roque.',
          coups: [
            ['d4', 'Les Blancs prennent le centre. Tout le Londres part de ce coup.'],
            ['d5', 'Les Noirs répondent symétriquement, la réponse la plus courante.'],
            ['Bf4', 'La marque du Londres : le fou sort AVANT de jouer e3, sinon il resterait enfermé derrière ses pions.'],
            ['Nf6', 'Développement naturel du cavalier.'],
            ['e3', 'Le deuxième étage de la pyramide : d4 est soutenu et la diagonale du fou f1 s\'ouvre.'],
            ['c5', 'Les Noirs attaquent la base du centre blanc, le plan le plus actif.'],
            ['c3', 'La pyramide est complète : c3-d4-e3. Le centre blanc est indestructible.'],
            ['Nc6', 'Les Noirs continuent leur développement en pressant d4.'],
            ['Nd2', 'Le cavalier dame va en d2 : il soutient le futur Ce5 et laisse la colonne c au pion.'],
            ['e6', 'Les Noirs libèrent leur fou roi.'],
            ['Ngf3', 'Le cavalier roi complète le dispositif. Toutes les pièces blanches ont leur case attitrée.'],
            ['Bd6', 'Les Noirs défient le fou f4 : ils veulent échanger la meilleure pièce blanche.'],
            ['Bg3', 'On recule ! Garder ce fou est essentiel : s\'il est pris en g3, le pion h ouvrira la colonne h.'],
            ['O-O', 'Les Noirs mettent leur roi à l\'abri.'],
            ['Bd3', 'Le fou vise h7 : c\'est lui qui mènera l\'attaque sur le roi noir.'],
            ['b6', 'Les Noirs préparent le fianchetto du fou dame.'],
            ['Ne5', 'Le coup thématique du Londres : le cavalier s\'installe au centre, soutenu par d4, et regarde f7 et g6.'],
            ['Bb7', 'Le fou noir se développe, mais les Blancs ont déjà leur plan d\'attaque.'],
            ['O-O', 'Le schéma est complet : roi en sécurité, centre verrouillé, cavalier dominant en e5. Les Blancs sont prêts à attaquer.']
          ]
        },
        {
          id: 'londres-attaque',
          titre: 'Le plan d\'attaque : Ce5 puis f4',
          type: 'ligne',
          resume: 'Une fois le schéma installé, les Blancs lancent le « mur de pierre » : f4, transfert de la dame vers l\'aile roi.',
          coups: [
            ['d4', 'Le début habituel.'],
            ['d5', ''],
            ['Bf4', 'Le fou d\'abord.'],
            ['Nf6', ''],
            ['e3', ''],
            ['c5', ''],
            ['c3', 'La pyramide.'],
            ['Nc6', ''],
            ['Nd2', ''],
            ['e6', ''],
            ['Ngf3', ''],
            ['Bd6', ''],
            ['Bg3', ''],
            ['O-O', ''],
            ['Bd3', ''],
            ['b6', ''],
            ['Ne5', 'Le cavalier central : point de départ de toutes les attaques du Londres.'],
            ['Bb7', ''],
            ['f4', 'Le mur de pierre : f4 cimente le cavalier e5. L\'attaque sur le roi peut commencer.'],
            ['Ne7', 'Les Noirs réorganisent leur défense vers g6/f5.'],
            ['Qf3', 'La dame entre dans l\'attaque : elle vise f7 et prépare son transfert vers l\'aile roi (Dh5 ou Dh3).'],
            ['Nf5', 'Les Noirs harcèlent le fou g3 pour désamorcer l\'attaque.'],
            ['Bf2', 'On préserve le fou ! Le plan continue tout seul : g4 pour chasser le cavalier, puis Dh3, Tf3-h3 ou g5. L\'attaque du mur de pierre est lente… mais presque imparable.']
          ]
        },
        {
          id: 'londres-fianchetto',
          titre: 'Contre le fianchetto (…g6)',
          type: 'ligne',
          resume: 'Face au fou en g7, le Londres garde le même schéma : pyramide, h3, et un jeu tranquille d\'espace.',
          coups: [
            ['d4', ''],
            ['Nf6', 'Les Noirs retardent d5 : ils visent un fianchetto à la « est-indienne ».'],
            ['Bf4', 'Aucune importance : le Londres se joue pareil.'],
            ['g6', 'Le fianchetto annoncé.'],
            ['e3', ''],
            ['Bg7', 'Le fou g7 vise d4… mais la pyramide c3 le neutralisera.'],
            ['Nf3', ''],
            ['O-O', ''],
            ['Be2', 'Contre le fianchetto, le fou est mieux en e2 qu\'en d3 : h7 n\'est plus une cible, inutile de le viser.'],
            ['d6', 'Les Noirs préparent e5, la poussée thématique de leur système.'],
            ['h3', 'Petit coup très utile : le fou f4 garde une case de repli en h2 et …Cg4/…Fg4 sont interdits.'],
            ['Nbd7', 'Les Noirs soutiennent la poussée e5.'],
            ['O-O', ''],
            ['c5', ''],
            ['c3', 'Toujours la pyramide : le fou g7 mord sur du granit. Les Blancs joueront ensuite a4, Fh2 et un jeu d\'espace patient.']
          ]
        },
        {
          id: 'londres-piege-b2',
          titre: 'Piège : le pion b2 empoisonné',
          type: 'piege',
          resume: 'Le piège le plus célèbre du Londres : …Db6 attaque b2, on l\'offre avec Cc3 ! La dame qui accepte le cadeau se fait piéger par Cb5.',
          coups: [
            ['d4', ''],
            ['d5', ''],
            ['Bf4', ''],
            ['c5', ''],
            ['e3', ''],
            ['Qb6', 'L\'attaque « réfutation » que tous les joueurs de Londres rencontrent : la dame vise b2, qui semble indéfendable.'],
            ['Nc3', 'Le piège se tend : les Blancs IGNORENT b2 et développent avec menace sur d5. Le pion est empoisonné.'],
            ['Qxb2', 'Les Noirs mordent à l\'hameçon…'],
            ['Nb5', 'Le couperet : menace Cc7+ (fourchette roi-tour) ET Tb1 qui enferme la dame. Les Noirs ne peuvent pas tout parer.'],
            ['Na6', 'Les Noirs couvrent c7 — la seule tentative.'],
            ['Rb1', 'La chasse commence : la dame n\'a que des cases perdantes.'],
            ['Qxa2', 'La dame fuit en croquant un second pion — trop gourmand.'],
            ['Ra1', 'Et retour ! La dame noire fait la navette pendant que les Blancs gagnent des temps.'],
            ['Qb2', ''],
            ['Rxa6', 'Le coup libérateur : on élimine le défenseur de c7. La tour est intouchable un instant…'],
            ['bxa6', '…et si les Noirs reprennent :'],
            ['Nc7+', 'La fourchette royale : échec au roi et attaque sur la tour a8.'],
            ['Kd7', ''],
            ['Nxa8', 'Bilan : une tour et une qualité de mieux. Le pion b2 coûte très cher dans le Londres !']
          ]
        },
        {
          id: 'londres-defense-qb6',
          titre: 'Piège : la bonne réponse à …Db6',
          type: 'piege',
          resume: 'Si vous ne voulez pas sacrifier b2 : Db3 ! propose l\'échange des dames et désamorce toute l\'idée noire.',
          coups: [
            ['d4', ''],
            ['d5', ''],
            ['Bf4', ''],
            ['Nf6', ''],
            ['e3', ''],
            ['c5', ''],
            ['c3', ''],
            ['Qb6', 'Encore l\'attaque sur b2. Surtout ne pas jouer b3 ?, qui affaiblit les cases c3 et a3 pour toujours.'],
            ['Qb3', 'La réponse simple et forte : b2 est défendu et l\'échange des dames est proposé — favorable aux Blancs, mieux développés.'],
            ['c4', 'Les Noirs chassent la dame en gagnant de l\'espace… en apparence.'],
            ['Qxb6', 'On échange quand même :'],
            ['axb6', 'La structure noire est abîmée : pions b6 doublés, et le pion c4 est une cible.'],
            ['Na3', 'Le cavalier vise c4 : le pion avancé tombera. Fin d\'ouverture idéale pour les Blancs, sans aucun risque.']
          ]
        },
        {
          id: 'londres-piege-nb4',
          titre: 'Piège à éviter : …Cb4 !',
          type: 'piege',
          resume: 'L\'ordre des coups compte : sortir le fou en d3 avant d\'avoir joué c3 permet …Cb4 et les Noirs prennent l\'initiative.',
          coups: [
            ['d4', ''],
            ['d5', ''],
            ['Bf4', ''],
            ['c5', ''],
            ['e3', ''],
            ['Nc6', ''],
            ['Bd3', 'L\'erreur d\'ordre : le fou sort trop tôt. Il fallait d\'abord jouer c3 pour donner une retraite au fou et tenir b4.'],
            ['cxd4', 'Les Noirs commencent par échanger…'],
            ['exd4', ''],
            ['Nb4', 'Le coup gênant : le cavalier attaque le fou d3 et lorgne c2. Les Blancs perdent du temps ou la paire de fous.'],
            ['Be2', 'Le fou bat en retraite, penaud : deux temps de perdus.'],
            ['Bf5', 'Les Noirs s\'emparent des cases claires : la fourchette …Cc2+ reste dans l\'air et leur position est déjà plus agréable. Retenez : c3 AVANT Fd3 !']
          ]
        }
      ]
    }
  ];

  global.OPENINGS = OPENINGS;
  if (typeof module !== 'undefined' && module.exports) module.exports = { OPENINGS };
})(typeof self !== 'undefined' ? self : globalThis);
