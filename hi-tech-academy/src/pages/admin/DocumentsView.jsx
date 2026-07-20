import React, { useState } from 'react';
import {
  Accessibility, Award, BookOpen, ClipboardCheck, ClipboardList, Download, Eye, FileBadge,
  FileSignature, FileText, GraduationCap, LayoutList, Mail, MessageSquareWarning, Network,
  Presentation, Repeat, Scale, SearchCheck, Sparkles, UserCheck, UserX, Users,
} from 'lucide-react';
import { Badge, Card, ViewHeader, bodyFont, headingFont } from './common';
import PdfViewer from './PdfViewer';

const BASE = '/documents/qualiopi';

// L'intégralité des documents finaux Qualiopi, servis statiquement depuis
// public/documents/qualiopi/ et organisés par thème. Visualisation dans la
// visionneuse intégrée ou téléchargement.
const SECTIONS = [
  {
    title: 'Accueil et information des apprenants',
    documents: [
      { title: "Livret d'accueil", file: `${BASE}/Livret_accueil_V1.0.pdf`, icon: BookOpen },
      { title: 'Règlement intérieur', file: `${BASE}/Reglement_interieur_V1.0.pdf`, icon: Scale },
      { title: "Politique d'accessibilité — handicap", file: `${BASE}/Accessibilite_handicap_V1.0.pdf`, icon: Accessibility },
      { title: 'Organigramme', file: `${BASE}/Organigramme_V1.0.pdf`, icon: Network },
      { title: "Processus d'accueil des apprenants", file: `${BASE}/Processus_accueil_apprenants_V1.0.pdf`, icon: Users },
      { title: 'Convocation (modèle)', file: `${BASE}/Convocation.pdf`, icon: Mail },
      { title: 'Plaquette et page web', file: `${BASE}/Plaquette_et_page_web_V1.0.pdf`, icon: Presentation },
    ],
  },
  {
    title: 'Formation Kubernetes — Fondamentaux',
    documents: [
      { title: 'Programme de formation', file: `${BASE}/Programme_Kubernetes_Fondamentaux_V1.0.pdf`, icon: GraduationCap },
      { title: 'Déroulé pédagogique', file: `${BASE}/Deroule_pedagogique_V1.0.pdf`, icon: LayoutList },
      { title: 'Support de cours', file: `${BASE}/Support_de_cours_Kubernetes_V1.0.pdf`, icon: FileText },
      { title: 'Test de positionnement', file: `${BASE}/Test_positionnement_Kubernetes.pdf`, icon: SearchCheck },
      { title: 'Évaluation finale (QCM)', file: `${BASE}/Evaluation_finale_QCM_Kubernetes.pdf`, icon: ClipboardCheck },
      { title: 'Tableau croisé objectifs / contenus / évaluations', file: `${BASE}/Tableau_croise_objectifs_contenus_evaluations_V1.0.pdf`, icon: ClipboardList },
    ],
  },
  {
    title: 'Contractualisation (modèles)',
    documents: [
      { title: 'Convention de formation professionnelle', file: `${BASE}/Convention_de_formation_professionnelle.pdf`, icon: FileSignature },
      { title: 'Certificat de réalisation (modèle)', file: `${BASE}/Certificat_de_realisation.pdf`, icon: Award },
    ],
  },
  {
    title: 'Satisfaction, réclamations et amélioration continue',
    documents: [
      { title: 'Évaluation de satisfaction à chaud (apprenant)', file: `${BASE}/Evaluation_satisfaction_chaud_apprenant.pdf`, icon: ClipboardCheck },
      { title: 'Évaluation de satisfaction à froid (apprenant)', file: `${BASE}/Evaluation_satisfaction_froid_apprenant.pdf`, icon: ClipboardCheck },
      { title: 'Évaluation de satisfaction client', file: `${BASE}/Evaluation_satisfaction_client.pdf`, icon: ClipboardCheck },
      { title: 'Réclamations — procédure, formulaire et registre', file: `${BASE}/Reclamations_procedure_formulaire_registre_V1.0.pdf`, icon: MessageSquareWarning },
      { title: 'Processus de suivi des réclamations', file: `${BASE}/Processus_suivi_reclamations_V1.0.pdf`, icon: Repeat },
      { title: "Processus d'amélioration continue", file: `${BASE}/Processus_amelioration_continue_V1.0.pdf`, icon: Sparkles },
      { title: 'Processus de gestion des absences et abandons', file: `${BASE}/Processus_gestion_absences_abandons_V1.0.pdf`, icon: UserX },
      { title: 'Plan de veille', file: `${BASE}/Plan_de_veille_V1.1.pdf`, icon: SearchCheck },
    ],
  },
  {
    title: 'Formateur',
    documents: [
      { title: 'CV — Mahdi CHEKINI', file: `${BASE}/CV_Mahdi_CHEKINI.pdf`, icon: UserCheck },
      { title: 'Diplôme — Mahdi CHEKINI', file: `${BASE}/Diplome_Mahdi_CHEKINI.pdf`, icon: FileBadge },
      { title: 'Auto-évaluation du formateur', file: `${BASE}/Auto_evaluation_formateur.pdf`, icon: ClipboardList },
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.documents.length, 0);

function downloadFile(file) {
  const a = document.createElement('a');
  a.href = file;
  a.download = file.split('/').pop();
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function DocumentsView() {
  const [viewer, setViewer] = useState(null); // { title, file }

  return (
    <div>
      <ViewHeader
        title="Documents Qualiopi"
        subtitle={`${TOTAL} documents finaux — visualisation dans l'application ou téléchargement`} />

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-base" style={{ color: '#001a4a', ...headingFont }}>
                {section.title}
              </h3>
              <Badge tone="info">{section.documents.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.documents.map(({ title, file, icon: Icon }) => (
                <Card key={file}>
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: '#f0f3fa' }}>
                      <Icon className="w-5 h-5" style={{ color: '#005064' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm leading-snug" style={{ color: '#001a4a', ...headingFont }}>
                        {title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2.5">
                        <button
                          type="button"
                          onClick={() => setViewer({ title, file })}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: '#005064', ...headingFont }}>
                          <Eye className="w-4 h-4" />
                          Visualiser
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(file)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: '#005064', ...headingFont }}>
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs mt-8 flex items-center gap-2" style={{ color: '#6b7a9b', ...bodyFont }}>
        <FileText className="w-4 h-4 shrink-0" />
        Documents issus de la base documentaire Qualiopi de l'organisme (documents finaux). Les
        documents nominatifs générés par l'application (certificats de réalisation…) vivent dans
        leurs onglets respectifs.
      </p>

      {viewer && (
        <PdfViewer
          title={viewer.title}
          url={viewer.file}
          onDownload={() => downloadFile(viewer.file)}
          onClose={() => setViewer(null)} />
      )}
    </div>
  );
}
