import React from 'react';
import {
  CalendarCheck, ClipboardList, FileSignature, FileText, GraduationCap,
  Inbox, LineChart, ListChecks, MailCheck, PhoneCall, ShieldCheck, Target,
} from 'lucide-react';
import { bodyFont, headingFont, Badge, ViewHeader } from '@/pages/admin/common';

// Documentation du process Qualiopi de l'organisme : la chronologie complète
// d'un dossier, de la demande entrante au suivi à froid, avec pour chaque
// étape ce qu'il faut faire, les documents à produire et l'onglet admin où
// agir. Vue statique : c'est le mode d'emploi, les dossiers vivent dans
// « Demandes à traiter », « Dossiers apprenants », etc.

const DOCS = '/documents/qualiopi';

// `tabs` référence les clés de NAV_ITEMS (Admin.jsx) : boutons de navigation.
const PHASES = [
  {
    titre: 'Avant la formation',
    sousTitre: "De la demande entrante à l'entrée en formation : tout est tracé, chaque étape conditionne la suivante.",
    etapes: [
      {
        icon: Inbox,
        titre: 'Demande entrante',
        quand: 'J0',
        acteur: 'Prospect / Admin',
        texte: "Le prospect arrive par le site (demande d'inscription), le point stratégique Calendly, le téléphone ou l'email. La demande est enregistrée et visible dans « Demandes à traiter » ; un contact commercial se suit dans le CRM. L'information publique (programme, tarif, durée, délais d'accès, accessibilité) est déjà conforme sur la fiche formation du site.",
        documents: [
          { label: 'Fiche formation publiée (site)', href: '/formations' },
        ],
        tabs: [['requests', 'Demandes à traiter'], ['crm', 'CRM']],
        critere: 'Critère 1 — Information du public',
      },
      {
        icon: PhoneCall,
        titre: 'Appel découverte et devis',
        quand: 'Sous 24 h ouvrées',
        acteur: 'Admin',
        texte: "Point de 30 minutes : besoin, niveau de départ, situation de financement (OPCO, FAF, personnel). À l'issue : devis, programme et convention envoyés au format attendu par le financeur. L'enquête financeur est renseignée pour le dossier de prise en charge.",
        documents: [
          { label: 'Convention de formation', href: `${DOCS}/Convention_de_formation_professionnelle.pdf` },
        ],
        tabs: [['billing', 'Devis & Factures']],
        critere: 'Critère 1 et 4 — Devis, convention',
      },
      {
        icon: ClipboardList,
        titre: "Analyse du besoin",
        quand: 'Avant la session',
        acteur: 'Bénéficiaire',
        texte: "Le lien du questionnaire est envoyé depuis la demande : contexte, besoin et objectifs attendus, auto-évaluation des niveaux (propre à chaque formation), cas d'usage, contraintes de planning et situation de handicap. Si un aménagement est demandé, le référent handicap étudie les adaptations avant l'entrée en formation. Les réponses arrivent dans le dossier de la demande.",
        documents: [
          { label: "Politique d'accessibilité handicap", href: `${DOCS}/Accessibilite_handicap_V1.0.pdf` },
        ],
        tabs: [['requests', 'Demandes à traiter']],
        critere: "Critère 2 — Analyse du besoin ; Critère 6 — Handicap",
      },
      {
        icon: Target,
        titre: 'Test de positionnement',
        quand: 'Avant la session',
        acteur: 'Bénéficiaire',
        texte: "Test en ligne propre à la formation (QCM corrigé côté serveur, non éliminatoire) : il vérifie les prérequis et situe le niveau réel pour adapter l'animation. Le score et les réponses sont archivés dans le dossier ; le PDF du test est versionné dans les documents Qualiopi.",
        documents: [
          { label: 'Tests de positionnement (par formation)', tab: 'documents' },
        ],
        tabs: [['requests', 'Demandes à traiter'], ['documents', 'Documents Qualiopi']],
        critere: 'Critère 2 — Positionnement et prérequis',
      },
      {
        icon: FileSignature,
        titre: 'Validation et prise en charge',
        quand: "À l'accord",
        acteur: 'Admin / Financeur',
        texte: "Accord de prise en charge reçu (ou financement personnel confirmé, avec délai de rétractation pour un particulier), convention signée, demande passée au statut « Validée ». Les dates de session sont posées avec le participant (délai d'accès : 1 jour minimum).",
        documents: [],
        tabs: [['requests', 'Demandes à traiter'], ['billing', 'Devis & Factures']],
        critere: 'Critère 1 — Délais d\'accès',
      },
      {
        icon: MailCheck,
        titre: "Convocation et accueil",
        quand: 'Avant J',
        acteur: 'Admin',
        texte: "Envoi de la convocation avec les accès à la classe virtuelle, du livret d'accueil et du règlement intérieur. Les aménagements handicap convenus sont en place.",
        documents: [
          { label: 'Convocation', href: `${DOCS}/Convocation.pdf` },
          { label: "Livret d'accueil", href: `${DOCS}/Livret_accueil_V1.0.pdf` },
          { label: 'Règlement intérieur', href: `${DOCS}/Reglement_interieur_V1.0.pdf` },
        ],
        tabs: [['learners', 'Dossiers apprenants']],
        critere: 'Critère 3 — Accueil et conditions de déroulement',
      },
    ],
  },
  {
    titre: 'Pendant la formation',
    sousTitre: "La traçabilité de la réalisation : assiduité, adaptation, évaluation des acquis.",
    etapes: [
      {
        icon: GraduationCap,
        titre: 'Réalisation et assiduité',
        quand: 'Jour(s) J',
        acteur: 'Formateur',
        texte: "Classe virtuelle en direct (Google Meet), déroulé pédagogique suivi, travaux pratiques corrigés au fil de la session. Assiduité tracée : émargement par demi-journée et rapport de connexion. L'animation s'adapte aux niveaux constatés dans les tests de positionnement.",
        documents: [
          { label: 'Déroulés pédagogiques (par formation)', tab: 'documents' },
        ],
        tabs: [['documents', 'Documents Qualiopi']],
        critere: 'Critère 3 et 4 — Déroulement, moyens',
      },
      {
        icon: ListChecks,
        titre: 'Évaluation finale et satisfaction à chaud',
        quand: 'Dernière séance',
        acteur: 'Bénéficiaire / Formateur',
        texte: "Évaluation finale des acquis : QCM en ligne (corrigé côté serveur) + partie pratique notée par le formateur, total /20 reporté sur l'attestation (seuil indicatif 60 %). Questionnaire de satisfaction à chaud renseigné par chaque bénéficiaire : il alimente les indicateurs publiés (satisfaction, recommandation).",
        documents: [
          { label: 'Évaluations finales (par formation)', tab: 'documents' },
        ],
        tabs: [['requests', 'Demandes à traiter'], ['documents', 'Documents Qualiopi']],
        critere: 'Critère 2 — Évaluation des acquis',
      },
    ],
  },
  {
    titre: 'Après la formation',
    sousTitre: "Clôture du dossier et amélioration continue : c'est ici que se jouent les indicateurs publiés.",
    etapes: [
      {
        icon: FileText,
        titre: 'Attestation, certificat et facturation',
        quand: 'Sous quelques jours',
        acteur: 'Admin',
        texte: "Attestation de fin de formation (art. L.6353-1) mentionnant objectifs, nature, durée et résultats de l'évaluation ; certificat de réalisation pour le financeur ; facturation du dossier.",
        documents: [
          { label: 'Certificat de réalisation (modèle)', href: `${DOCS}/Certificat_de_realisation.pdf` },
        ],
        tabs: [['certificates', 'Certificats de réalisation'], ['billing', 'Devis & Factures']],
        critere: 'Critère 1 — Sanction de la formation',
      },
      {
        icon: CalendarCheck,
        titre: 'Suivi à froid',
        quand: 'Quelques semaines après',
        acteur: 'Admin / Formateur',
        texte: "Questionnaire à froid pour mesurer ce qui a été mis en œuvre, et suivi individuel de 30 minutes avec le formateur (inclus dans le tarif). Les retours alimentent l'amélioration continue des programmes.",
        documents: [],
        tabs: [['learners', 'Dossiers apprenants']],
        critere: 'Critère 7 — Recueil des appréciations',
      },
      {
        icon: LineChart,
        titre: 'Réclamations, indicateurs et veille',
        quand: 'En continu',
        acteur: 'Admin',
        texte: "Les réclamations déposées via le site sont traitées et tracées. Les indicateurs de résultats (satisfaction, recommandation, assiduité) sont mis à jour et publiés sur le site. La veille (réglementaire, métier, handicap) est consignée, et l'audit interne vérifie l'ensemble du dispositif.",
        documents: [
          { label: 'Certificat Qualiopi (RNQ)', href: `${DOCS}/Certificat_Qualiopi_RNQ.pdf` },
        ],
        tabs: [['complaints', 'Réclamations'], ['veille', 'Veille'], ['audit', 'Audit Qualiopi']],
        critere: 'Critères 6 et 7 — Veille, réclamations, amélioration continue',
      },
    ],
  },
];

function Etape({ etape, numero, dernier, onNavigate }) {
  const Icon = etape.icon;
  return (
    <li className="relative pl-14 pb-8">
      {/* Fil vertical de la timeline, interrompu après la dernière étape. */}
      {!dernier && (
        <span aria-hidden="true" className="absolute left-[19px] top-10 bottom-0 w-0.5" style={{ background: '#e0e8f4' }} />
      )}
      <span
        className="absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: '#001a4a', color: 'white' }}>
        <Icon className="w-5 h-5" />
      </span>

      <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
            Étape {numero}
          </span>
          <h4 className="font-bold text-sm" style={{ color: '#001a4a', ...headingFont }}>{etape.titre}</h4>
          <span className="ml-auto flex items-center gap-2">
            <Badge tone="info">{etape.quand}</Badge>
            <Badge>{etape.acteur}</Badge>
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: '#3d4a66', ...bodyFont }}>{etape.texte}</p>

        {(etape.documents.length > 0 || etape.tabs.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {etape.documents.map((doc) => (
              doc.href ? (
                <a
                  key={doc.label}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                  <FileText className="w-3.5 h-3.5" /> {doc.label}
                </a>
              ) : (
                <button
                  key={doc.label}
                  type="button"
                  onClick={() => onNavigate(doc.tab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                  <FileText className="w-3.5 h-3.5" /> {doc.label}
                </button>
              )
            ))}
            {etape.tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                Ouvrir : {label}
              </button>
            ))}
          </div>
        )}

        <p className="text-[11px] mt-3 pt-3 font-semibold" style={{ color: '#6b7a9b', borderTop: '1px solid #f0f3fa', ...headingFont }}>
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          {etape.critere}
        </p>
      </div>
    </li>
  );
}

export default function ProcessQualiopiView({ onNavigate }) {
  let numero = 0;
  return (
    <div>
      <ViewHeader
        title="Process Qualiopi"
        subtitle="La chronologie complète d'un dossier, de la demande entrante au suivi à froid : ce qu'il faut faire, les documents à produire et où agir dans l'admin. Chaque étape doit être tracée pour rester conforme." />

      {PHASES.map((phase) => (
        <section key={phase.titre} className="mb-10">
          <div className="mb-5">
            <h3 className="text-base font-bold" style={{ color: '#001a4a', ...headingFont }}>{phase.titre}</h3>
            <p className="text-sm mt-0.5" style={{ color: '#6b7a9b', ...bodyFont }}>{phase.sousTitre}</p>
          </div>
          <ol>
            {phase.etapes.map((etape, i) => {
              numero += 1;
              return (
                <Etape
                  key={etape.titre}
                  etape={etape}
                  numero={numero}
                  dernier={i === phase.etapes.length - 1}
                  onNavigate={onNavigate}
                />
              );
            })}
          </ol>
        </section>
      ))}

      <p className="text-xs rounded-2xl p-4" style={{ background: '#f0f3fa', color: '#6b7a9b', ...bodyFont }}>
        Rappel : les documents de référence (programmes, déroulés, tests, évaluations, tableaux croisés,
        plaquettes, supports) sont versionnés dans « Documents Qualiopi » ; l'onglet « Audit Qualiopi »
        permet de vérifier point par point la conformité du dispositif avant un audit.
      </p>
    </div>
  );
}
