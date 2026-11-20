// Questionnaires de satisfaction Qualiopi, transcription fidèle des trois
// documents de référence (public/documents/qualiopi/Evaluation_satisfaction_*.pdf).
// Consommés par la page publique de réponse et par l'admin (visualisation).
//
// Types de questions : radio (options), scale (1-10), checkboxes (choix
// multiples), text (réponse libre).

const SATISFAIT_4 = ['Très satisfait', 'Satisfait', 'Mécontent', 'Très mécontent'];
const OUI_NON = ['Oui', 'Non'];
const OUI_PARTIEL_NON = ['Oui', 'Partiellement', 'Non'];

export const SATISFACTION_KINDS = {
  HOT_LEARNER: {
    label: 'Satisfaction à chaud de l’apprenant',
    shortLabel: 'À chaud',
    audience: 'learner',
    title: "Évaluation de la satisfaction à chaud de l'apprenant",
    intro:
      "Bonjour,\n\nVous venez de vivre une formation avec nous et nous vous en remercions.\n\n"
      + "Dans le cadre du suivi qualité et d'une recherche constante d'amélioration de nos prestations, "
      + "nous aimerions avoir votre retour « à chaud » sur cette formation et sur son intérêt dans le cadre "
      + 'de vos activités professionnelles.\n\nBien cordialement,',
    questions: [
      { key: 'infos_avant', type: 'radio', label: 'Qualité des informations fournies avant la formation', options: SATISFAIT_4 },
      { key: 'contenu', type: 'radio', label: 'Contenu de la formation', options: SATISFAIT_4 },
      { key: 'pedagogie', type: 'radio', label: 'Pédagogie et accompagnement du formateur', options: SATISFAIT_4 },
      { key: 'rythme', type: 'radio', label: 'Rythme de la formation', options: SATISFAIT_4 },
      { key: 'logistique', type: 'radio', label: 'Logistique et supports concernant la formation', options: SATISFAIT_4 },
      { key: 'infos_autres_formations', type: 'radio', label: 'Souhaitez-vous obtenir des informations sur les autres formations que nous proposons ?', options: OUI_NON },
      { key: 'citation', type: 'radio', label: 'Nous autorisez-vous à citer vos remarques et votre nom pour la promotion de nos formations ?', options: ['Oui', 'Oui mais anonymement', 'Non'] },
      { key: 'objectifs_atteints', type: 'radio', label: "Est-ce que cette formation vous a permis d'atteindre les objectifs pédagogiques visés par le programme de formation ?", options: ['Oui totalement', 'Oui en partie', 'Partiellement', 'Non pas du tout'] },
      { key: 'satisfaction', type: 'scale', label: 'Votre satisfaction', hint: '1 = très insatisfait, 10 = très satisfait' },
      { key: 'recommandation', type: 'radio', label: 'Taux de recommandation', hint: 'Est-ce que vous nous recommanderiez ?', options: OUI_NON },
      { key: 'remarques', type: 'text', label: 'Vos remarques et observations complémentaires', optional: true },
    ],
  },

  CLIENT: {
    label: 'Satisfaction du client suite à la formation',
    shortLabel: 'Client',
    audience: 'client',
    title: 'Évaluation de la satisfaction du client suite à la formation',
    intro:
      'Bonjour,\n\nVous nous avez fait confiance pour assurer une formation auprès des salariés de votre '
      + "organisation et nous vous en remercions.\n\nDans le cadre d'une recherche constante d'amélioration de "
      + "nos prestations, nous aimerions avoir votre évaluation de l'impact de cette formation sur votre "
      + 'entreprise et de son intérêt dans le cadre de vos activités professionnelles.\n\nBien cordialement,',
    questions: [
      { key: 'attentes', type: 'radio', label: 'La formation a-t-elle répondu à vos attentes ?', options: ['Très satisfaisant', 'Satisfaisant', 'Insatisfaisant', 'Très insatisfaisant'] },
      { key: 'retour_equipe', type: 'radio', label: "À l'issue de la formation, avez-vous eu un retour satisfaisant de votre équipe ?", options: ['Oui totalement', 'Oui partiellement', 'Non', 'Je ne sais pas'] },
      { key: 'niveau_adapte', type: 'radio', label: 'Le niveau de la formation était-il adapté à votre équipe ?', options: ['Oui totalement', 'Oui partiellement', 'Non', 'Je ne sais pas'] },
      { key: 'apprecie', type: 'text', label: "Qu'avez-vous apprécié dans notre prestation ?", optional: true },
      { key: 'ameliorations', type: 'text', label: 'Avez-vous des améliorations à nous conseiller ?', optional: true },
      { key: 'comparaison', type: 'radio', label: "Comparé à d'autres organismes de formation que vous connaissez, vous diriez que la qualité de notre intervention est :", options: ['Meilleure', 'Identique', 'Moins bien'] },
      { key: 'nouvel_appel', type: 'radio', label: "À l'avenir, ferez-vous de nouveau appel à nous si l'occasion se présente ?", options: OUI_NON },
      { key: 'citation', type: 'radio', label: 'Nous autorisez-vous à citer vos commentaires sur notre site web pour promouvoir nos formations ?', options: [
        'Oui et vous pouvez indiquer mon nom et celui de mon entreprise',
        'Oui mais sans indiquer mon nom (vous pouvez indiquer celui de mon entreprise)',
        'Oui mais en anonyme (ni mon nom ni celui de mon entreprise)',
        "Non, je préfère qu'ils restent entre nous",
      ] },
      { key: 'infos_formations', type: 'radio', label: 'Souhaitez-vous obtenir des informations sur les formations que nous proposons ?', options: OUI_NON },
      { key: 'satisfaction', type: 'scale', label: 'Votre satisfaction', hint: 'Notez de 1 à 10 votre satisfaction vis-à-vis de la formation' },
      { key: 'remarques', type: 'text', label: 'Avez-vous des remarques ou des observations complémentaires à nous communiquer ?', optional: true },
    ],
  },

  COLD_LEARNER: {
    label: 'Satisfaction à froid de l’apprenant',
    shortLabel: 'À froid',
    audience: 'learner',
    title: "Évaluation de la satisfaction à froid de l'apprenant",
    intro:
      'Bonjour,\n\nVous avez vécu une formation avec nous il y a quelques semaines et nous vous en remercions.'
      + "\n\nDans le cadre du suivi qualité et d'une recherche constante d'amélioration de nos prestations, nous "
      + 'aimerions avoir votre retour « à froid » sur cette formation et sur son intérêt dans le cadre de vos '
      + 'activités professionnelles.\n\nBien cordialement,',
    questions: [
      { key: 'attentes', type: 'radio', label: 'La formation a-t-elle répondu à vos attentes ?', options: OUI_PARTIEL_NON },
      { key: 'competences', type: 'radio', label: "La formation vous a-t-elle permis d'acquérir de nouvelles compétences ?", options: OUI_PARTIEL_NON },
      { key: 'pourquoi', type: 'text', label: 'Si vous avez répondu « Non » ou « Partiellement », pouvez-vous nous dire pourquoi ?', optional: true },
      { key: 'mise_en_pratique', type: 'radio', label: 'Depuis la fin de la formation, avez-vous pu mettre en pratique les compétences acquises ?', options: OUI_PARTIEL_NON },
      { key: 'pratique_freins', type: 'checkboxes', label: 'Si vous avez répondu « Non » ou « Partiellement », à quoi cela est-il dû ?', optional: true, options: [
        "L'opportunité ne s'est pas présentée",
        "L'opportunité ne s'est pas encore présentée, mais je devrais en avoir l'occasion",
        "La formation dispensée n'était pas adaptée à mes besoins",
        "La formation n'a pas eu lieu au bon moment (trop tôt ou trop tard)",
        "Le niveau de formation n'était pas adapté à mon propre niveau",
        "Les points abordés en formation n'ont pas de lien avec mes missions dans l'entreprise",
        "J'ai changé de fonction entre temps",
        'Autre',
      ] },
      { key: 'favoriser_pratique', type: 'text', label: "Selon vous, qu'est-ce qui pourrait favoriser la mise en pratique de votre formation ?", hint: 'Par exemple disposer de plus de temps pour la mettre en pratique, être guidé par son manager ou un collègue…', optional: true },
      { key: 'entretien_manager', type: 'radio', label: "À l'issue de votre formation, avez-vous eu un entretien avec votre manager pour faire le point sur l'apport de cette formation ?", options: OUI_NON },
      { key: 'comparaison', type: 'radio', label: "Comparé à d'autres formations que vous avez suivies dans d'autres organismes de formation, vous diriez que la qualité de cette formation est :", options: ['Meilleure', 'Identique', 'Moins bonne'] },
      { key: 'nouvel_appel', type: 'radio', label: 'Seriez-vous disposé à faire de nouveau appel à nous pour une autre formation ?', options: OUI_NON },
      { key: 'remarques', type: 'text', label: 'Avez-vous des remarques ou des observations complémentaires à nous communiquer ?', optional: true },
      { key: 'infos_formations', type: 'radio', label: 'Souhaitez-vous obtenir des informations sur les autres formations que nous proposons ?', options: OUI_NON },
      { key: 'citation', type: 'radio', label: 'Nous autorisez-vous à citer vos commentaires sur notre site web pour promouvoir nos formations ?', options: [
        'Oui et vous pouvez indiquer mon nom et celui de mon entreprise',
        'Oui mais sans indiquer mon nom et mon entreprise',
        "Non, je préfère qu'ils restent entre nous",
      ] },
    ],
  },
};

export function getSatisfactionKind(kind) {
  return SATISFACTION_KINDS[kind] ?? null;
}
