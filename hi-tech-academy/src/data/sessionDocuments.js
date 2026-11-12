import { formations } from './formations';

// Documents envoyés aux apprenants d'une session, en trois vagues (avant la
// formation, accueil, pendant). Le programme et le support de cours dépendent
// de la formation de la session.
//
// ATTENTION : le document CGV n'existe pas encore dans le projet — déposer le
// PDF à public/documents/qualiopi/CGV_V1.0.pdf avant tout envoi de ce document.

const Q = '/documents/qualiopi';

const SUPPORTS = {
  'kubernetes-fondamentaux': `${Q}/Support_de_cours_Kubernetes_V1.0.pdf`,
  'facturation-electronique-pennylane': `${Q}/Support_de_cours_Facturation_Pennylane_V1.0.pdf`,
  'ia-pour-tous': `${Q}/Support_de_cours_IA_Pour_Tous_V1.1.pdf`,
  'essentiel-ia': `${Q}/Support_de_cours_Essentiel_IA_V1.1.pdf`,
  'ia-for-business': `${Q}/Support_de_cours_IA_For_Business_V1.1.pdf`,
  'ia-for-tech': `${Q}/Support_de_cours_IA_For_Tech_V1.1.pdf`,
  'management-processus-ia': `${Q}/Support_de_cours_Management_IA_V1.1.pdf`,
};

/** Documents d'une session, dans l'ordre d'envoi, groupés par vague. */
export function sessionDocumentsFor(formationId) {
  const programme = formations.find((f) => f.id === formationId)?.pdf ?? null;
  return [
    {
      group: 'Avant la formation',
      docs: [
        { key: 'REGLEMENT', label: 'Règlement intérieur', url: `${Q}/Reglement_interieur_V1.0.pdf` },
        { key: 'CGV', label: 'Conditions générales de vente', url: `${Q}/CGV_V1.0.pdf` },
        { key: 'PROGRAMME', label: 'Programme de la formation', url: programme },
      ],
    },
    {
      group: 'Accueil',
      docs: [
        { key: 'LIVRET', label: "Livret d'accueil", url: `${Q}/Livret_accueil_V1.0.pdf` },
        // Convocation générée par apprenant (nom, dates, horaires, lien Meet) :
        // plus de PDF statique, le document part en pièce jointe personnalisée.
        { key: 'CONVOCATION', label: 'Convocation', url: null, generated: true },
      ],
    },
    {
      group: 'Pendant la formation',
      docs: [
        { key: 'SUPPORT', label: 'Support de cours', url: SUPPORTS[formationId] ?? null },
      ],
    },
  ];
}
