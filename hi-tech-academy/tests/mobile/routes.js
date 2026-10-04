// Routes publiques vérifiées à chaque lot. Les pages du parcours après
// inscription (/inscription/demande/:id/...) dépendent du back : elles sont
// ajoutées par le plan du lot 4, avec leurs réponses simulées.
export const ROUTES = [
  { nom: 'accueil', chemin: '/' },
  { nom: 'formations', chemin: '/formations' },
  { nom: 'vente-kubernetes', chemin: '/formations/kubernetes-fondamentaux' },
  { nom: 'vente-management-ia', chemin: '/formations/management-processus-ia' },
  { nom: 'financements', chemin: '/financements' },
  { nom: 'contact', chemin: '/contact' },
  { nom: 'contact-rdv', chemin: '/contact?mode=rendez-vous' },
  { nom: 'a-propos', chemin: '/a-propos' },
  { nom: 'reclamations', chemin: '/reclamations' },
  { nom: 'blog', chemin: '/blog' },
  { nom: 'article', chemin: '/blog/demarrer-avec-kubernetes-sans-se-perdre' },
  { nom: 'inscription', chemin: '/inscription/kubernetes-fondamentaux' },
  { nom: 'mentions-legales', chemin: '/mentions-legales' },
  { nom: 'confidentialite', chemin: '/politique-confidentialite' },
  { nom: 'cookies', chemin: '/politique-cookies' },
  { nom: 'conditions-vente', chemin: '/conditions-vente' },
  { nom: 'introuvable', chemin: '/page-qui-n-existe-pas' },
];

export const LARGEURS_MOBILE = [320, 375, 414, 768];
export const LARGEUR_DESKTOP = 1280;
