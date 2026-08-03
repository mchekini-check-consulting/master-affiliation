// Atelier « Le parcours de soins » : on suit une patiente concrète, étape
// par étape, de l'inscription à l'Assurance maladie jusqu'au remboursement.
// Schéma animé + règle générale + ce qui arrive à notre patiente d'exemple.
import './parcours-soins.css';

const ETAPES = [
  {
    lieu: 'Assurance maladie',
    icone: '🪪',
    titre: "S'inscrire à l'Assurance maladie",
    regle: "L'inscription à l'Assurance maladie est obligatoire : c'est une branche de la Sécurité sociale, créée en 1945 et financée par les cotisations des travailleurs. On s'inscrit à la CPAM (Caisse primaire d'assurance maladie) et on reçoit un numéro de sécurité sociale, identifiant unique et personnel à 15 chiffres, ainsi que la carte Vitale, qui prouve les droits à l'Assurance maladie.",
    exemple: "Mme Diallo, installée en France depuis plus de 3 mois, s'inscrit à la CPAM avec ses justificatifs de résidence et d'identité. Elle reçoit son numéro de sécurité sociale à 15 chiffres et sa carte Vitale.",
  },
  {
    lieu: 'Médecin traitant',
    icone: '👨‍⚕️',
    titre: 'Déclarer un médecin traitant',
    regle: "Le médecin traitant est le médecin généraliste que l'on a déclaré : il connaît le dossier médical, assure la prévention et oriente vers un spécialiste si nécessaire. C'est le « parcours de soins coordonnés », et pour être bien remboursé, il faut avoir déclaré son médecin traitant.",
    exemple: 'Mme Diallo choisit librement le docteur Martin, médecin généraliste de son quartier, et le déclare comme médecin traitant à l\'Assurance maladie.',
  },
  {
    lieu: 'Consultation',
    icone: '🤒',
    titre: 'La consultation chez le médecin',
    regle: "Pour un problème de santé courant, on commence par consulter son médecin traitant. On prend rendez-vous en appelant le cabinet ou en ligne (par exemple sur Doctolib), on présente sa carte Vitale et on paie la consultation. La nuit et le week-end, il existe des médecins de garde.",
    exemple: "Mme Diallo a mal à la gorge et de la fièvre : une angine. Elle prend rendez-vous en ligne chez le docteur Martin, présente sa carte Vitale et paie la consultation. Il lui prescrit des médicaments sur une ordonnance.",
  },
  {
    lieu: 'Pharmacie',
    icone: '💊',
    titre: "La pharmacie et l'ordonnance",
    regle: "Le pharmacien délivre les médicaments prescrits sur ordonnance et conseille pour les petits problèmes du quotidien. Les médicaments prescrits sont remboursés en partie par l'Assurance maladie. La nuit et le week-end, il existe des pharmacies de garde.",
    exemple: "Mme Diallo apporte son ordonnance à la pharmacie avec sa carte Vitale. Le pharmacien lui délivre le traitement contre l'angine et lui explique comment le prendre.",
  },
  {
    lieu: 'Remboursement',
    icone: '💶',
    titre: "Le remboursement par l'Assurance maladie",
    regle: "L'Assurance maladie rembourse la plus grande partie des frais de santé. Grâce à la carte Vitale, le remboursement est automatique, sans papier à envoyer, et le tiers payant permet même de ne pas avancer l'argent chez certains professionnels. Le compte ameli (sur ameli.fr) permet de suivre ses remboursements.",
    exemple: "Quelques jours plus tard, l'Assurance maladie rembourse automatiquement à Mme Diallo la plus grande partie de la consultation et des médicaments. Elle suit ses remboursements sur son compte ameli.",
  },
  {
    lieu: 'Mutuelle',
    icone: '🛡️',
    titre: 'La mutuelle (complémentaire santé)',
    regle: "La complémentaire santé (mutuelle) n'est pas obligatoire mais elle est recommandée : elle rembourse la partie non prise en charge par l'Assurance maladie. Les employeurs du secteur privé doivent en proposer une à leurs salariés. Pour les revenus modestes, la Complémentaire santé solidaire (C2S) est gratuite ou coûte moins de 1 euro par jour.",
    exemple: "La mutuelle proposée par l'employeur de Mme Diallo rembourse le reste des frais : au final, son angine ne lui a presque rien coûté.",
  },
  {
    lieu: 'Urgences / 15',
    icone: '🚨',
    titre: 'Les urgences et le 15 (SAMU)',
    regle: "En cas de situation grave (accident, douleurs violentes, malaise), on va directement aux urgences de l'hôpital, sans passer par le médecin traitant. On appelle le 15 (SAMU, urgence médicale) ou le 112 (numéro d'urgence européen) : ces numéros sont gratuits et joignables 24h/24 et 7j/7.",
    exemple: "Quelques mois plus tard, le voisin de Mme Diallo fait un malaise. Elle appelle immédiatement le 15 : le SAMU intervient et le conduit aux urgences. Elle connaît maintenant tout le parcours de soins !",
  },
];

export default {
  slug: 'parcours-soins',
  thematique: 'vivre-en-france',
  titre: 'Le parcours de soins, pas à pas',
  description: "Suivez un patient de l'inscription à la Sécurité sociale jusqu'au remboursement.",
  icone: '🩺',
  rendre(conteneur) {
    let etape = 0;

    const dessiner = () => {
      const e = ETAPES[etape];
      conteneur.innerHTML = `
        <div class="at-ps">
          <div class="at-ps-schema" role="list">
            ${ETAPES.map(
              (s, i) => `
              <button type="button" role="listitem"
                class="at-ps-station ${i === etape ? 'active' : ''} ${i < etape ? 'faite' : ''}"
                data-etape="${i}" title="${s.lieu}">
                <span class="at-ps-station-icone">${s.icone}</span>
                <span class="at-ps-station-nom">${s.lieu}</span>
              </button>
              ${i < ETAPES.length - 1 ? `<span class="at-ps-lien ${i < etape ? 'fait' : ''}" aria-hidden="true"></span>` : ''}`
            ).join('')}
          </div>

          <div class="at-ps-carte" key="${etape}">
            <p class="at-ps-avancement">Étape ${etape + 1} / ${ETAPES.length}</p>
            <h3>${e.icone} ${e.titre}</h3>
            <p class="at-ps-regle">${e.regle}</p>
            <div class="at-ps-exemple">
              <span class="at-ps-exemple-badge">🧕 Notre patiente d'exemple</span>
              <p>${e.exemple}</p>
            </div>
            <div class="at-ps-nav">
              <button type="button" class="at-ps-bouton at-ps-bouton--retour" data-nav="-1" ${etape === 0 ? 'disabled' : ''}>← Étape précédente</button>
              ${
                etape < ETAPES.length - 1
                  ? '<button type="button" class="at-ps-bouton" data-nav="1">Étape suivante →</button>'
                  : '<button type="button" class="at-ps-bouton" data-nav="reset">🔁 Revoir le parcours</button>'
              }
            </div>
          </div>
        </div>
      `;

      conteneur.querySelectorAll('.at-ps-station').forEach((b) =>
        b.addEventListener('click', () => {
          etape = Number(b.dataset.etape);
          dessiner();
        })
      );
      conteneur.querySelectorAll('[data-nav]').forEach((b) =>
        b.addEventListener('click', () => {
          if (b.dataset.nav === 'reset') etape = 0;
          else etape = Math.min(ETAPES.length - 1, Math.max(0, etape + Number(b.dataset.nav)));
          dessiner();
        })
      );
    };

    dessiner();
  },
};
