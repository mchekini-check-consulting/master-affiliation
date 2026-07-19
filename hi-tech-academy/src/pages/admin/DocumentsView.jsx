import React from 'react';
import { Accessibility, BookOpen, Download, ExternalLink, FileText, MessageSquareWarning, Network, Scale } from 'lucide-react';
import { Badge, Card, ViewHeader, bodyFont, headingFont } from './common';

// Documents Qualiopi génériques : identiques pour toutes les formations et
// sans variables (les documents nominatifs — convention, convocation,
// attestation… — sont générés par ailleurs). Fichiers servis statiquement
// depuis public/documents/qualiopi/.
const DOCUMENTS = [
  {
    title: "Livret d'accueil",
    description:
      "Remis à chaque apprenant avant l'entrée en formation : présentation de l'organisme, déroulement d'une formation à distance, interlocuteurs et informations pratiques.",
    file: '/documents/qualiopi/Livret_accueil_V1.0.pdf',
    version: 'V1.0',
    icon: BookOpen,
  },
  {
    title: 'Règlement intérieur',
    description:
      "Règles d'hygiène, de sécurité et de discipline applicables aux stagiaires, ainsi que les modalités de représentation (art. L.6352-3 du Code du travail).",
    file: '/documents/qualiopi/Reglement_interieur_V1.0.pdf',
    version: 'V1.0',
    icon: Scale,
  },
  {
    title: 'Accessibilité — situation de handicap',
    description:
      "Procédure d'accueil et d'adaptation pour les personnes en situation de handicap, coordonnées du référent handicap et réseau de partenaires mobilisables.",
    file: '/documents/qualiopi/Accessibilite_handicap_V1.0.pdf',
    version: 'V1.0',
    icon: Accessibility,
  },
  {
    title: 'Réclamations — procédure, formulaire et registre',
    description:
      "Procédure de traitement des réclamations et des aléas, formulaire de dépôt et registre de suivi (délais de réponse et actions correctives).",
    file: '/documents/qualiopi/Reclamations_procedure_formulaire_registre_V1.0.pdf',
    version: 'V1.0',
    icon: MessageSquareWarning,
  },
  {
    title: 'Organigramme',
    description:
      "Organisation de Hi-Tech Academy : rôles et responsabilités au sein de l'organisme de formation.",
    file: '/documents/qualiopi/Organigramme_V1.0.pdf',
    version: 'V1.0',
    icon: Network,
  },
];

export default function DocumentsView() {
  return (
    <div>
      <ViewHeader
        title="Documents Qualiopi"
        subtitle={`${DOCUMENTS.length} documents génériques — communs à toutes les formations, sans variables`} />

      <div className="grid md:grid-cols-2 gap-5">
        {DOCUMENTS.map(({ title, description, file, version, icon: Icon }) => (
          <Card key={file}>
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#f0f3fa' }}>
                <Icon className="w-5 h-5" style={{ color: '#005064' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm" style={{ color: '#001a4a', ...headingFont }}>
                    {title}
                  </h3>
                  <Badge tone="info">{version}</Badge>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#6b7a9b', ...bodyFont }}>
                  {description}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: '#005064', ...headingFont }}>
                    <ExternalLink className="w-4 h-4" />
                    Consulter
                  </a>
                  <a
                    href={file}
                    download
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: '#005064', ...headingFont }}>
                    <Download className="w-4 h-4" />
                    Télécharger
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs mt-6 flex items-center gap-2" style={{ color: '#6b7a9b', ...bodyFont }}>
        <FileText className="w-4 h-4 shrink-0" />
        Les documents nominatifs (convention, contrat, convocation, attestation…) et les documents propres
        à une formation (programme, support, évaluations) ne figurent pas ici.
      </p>
    </div>
  );
}
