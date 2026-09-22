import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, ChevronDown, Database, Download, ExternalLink, FileText, FolderOpen, MinusCircle,
} from 'lucide-react';
import PdfViewer from '@/pages/admin/PdfViewer';
import { AUDIT_CRITERIA, OTHER_DOCUMENTS, auditDocUrl, isViewable } from '@/data/auditQualiopi';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Contenu du dossier d'audit Qualiopi (critères → indicateurs → preuves),
// affiché dans l'onglet « Audit Qualiopi » de l'espace admin.

// Pastille document : PDF → visionneuse intégrée ; xlsx → téléchargement ;
// lien site → nouvel onglet ; preuve interface admin → pastille informative.
function DocumentChip({ doc, onView }) {
  const base =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors';
  if (doc.adminTool) {
    return (
      <span
        className={base}
        title="Preuve consultable dans l'interface d'administration du site"
        style={{ background: '#f3effc', color: '#5b3fa8', border: '1px solid #ddd2f3', ...headingFont }}>
        <Database className="w-3.5 h-3.5 shrink-0" />
        Interface admin — {doc.label}
      </span>
    );
  }
  if (doc.href) {
    return (
      <Link
        to={doc.href}
        target="_blank"
        className={base}
        style={{ background: '#eef7f2', color: '#116632', border: '1px solid #bfe3cf', ...headingFont }}>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        {doc.label}
      </Link>
    );
  }
  if (!isViewable(doc)) {
    return (
      <a
        href={auditDocUrl(doc)}
        download
        className={base}
        style={{ background: '#f7f9fd', color: '#005064', border: '1px solid #d5deee', ...headingFont }}>
        <Download className="w-3.5 h-3.5 shrink-0" />
        {doc.label}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onView(doc)}
      className={`${base} hover:brightness-95`}
      style={{ background: '#f0f3fa', color: '#002d74', border: '1px solid #ccd9ef', ...headingFont }}>
      <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: '#005064' }} />
      {doc.label}
    </button>
  );
}

function IndicatorRow({ indicator, onView }) {
  if (!indicator.applicable) {
    return (
      <div
        className="rounded-2xl px-5 py-4 flex items-start gap-3"
        style={{ background: '#f5f6f8', border: '1px dashed #d8dde8', opacity: 0.65 }}>
        <span
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
          style={{ background: '#e6e9f0', color: '#8a94ab', ...headingFont }}>
          {indicator.number}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#8a94ab', ...headingFont }}>
            Indicateur {indicator.number}
            <span
              className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide align-middle"
              style={{ background: '#e6e9f0', color: '#8a94ab' }}>
              <MinusCircle className="w-3 h-3" />
              Non applicable — {indicator.reason}
            </span>
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#a3aab9', ...bodyFont }}>
            {indicator.title}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ background: 'white', border: '1px solid #e0e8f4' }}>
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
          style={{ background: '#005064', color: 'white', ...headingFont }}>
          {indicator.number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: '#001a4a', ...headingFont }}>
            Indicateur {indicator.number}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#44506b', ...bodyFont }}>
            {indicator.title}
          </p>
          {indicator.proofs && (
            <p className="text-xs mt-2 leading-relaxed rounded-xl px-3 py-2" style={{ background: '#f7f9fd', color: '#44506b', ...bodyFont }}>
              <span className="font-bold" style={{ color: '#005064', ...headingFont }}>Preuves disponibles : </span>
              {indicator.proofs}
            </p>
          )}
          {indicator.documents?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {indicator.documents.map((doc) => (
                <DocumentChip key={doc.label} doc={doc} onView={onView} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CriterionCard({ criterion, open, onToggle, onView }) {
  const applicable = criterion.indicators.filter((i) => i.applicable).length;
  const total = criterion.indicators.length;
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: 'white', border: `1.5px solid ${open ? '#005064' : '#e0e8f4'}` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-5 sm:px-7 py-5 text-left">
        <span
          className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: open ? '#005064' : '#f0f3fa', color: open ? 'white' : '#005064', ...headingFont }}>
          {criterion.number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base sm:text-lg font-bold" style={{ color: '#001a4a', ...headingFont }}>
            Critère {criterion.number} — {criterion.title}
          </span>
          <span className="block text-xs mt-0.5 leading-relaxed" style={{ color: '#6b7a9b', ...bodyFont }}>
            {criterion.description}
          </span>
        </span>
        <span
          className="hidden sm:inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: '#eef7f2', color: '#116632', ...headingFont }}>
          {applicable}/{total} applicables
        </span>
        <ChevronDown
          className="w-5 h-5 shrink-0 transition-transform"
          style={{ color: '#005064', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="px-5 sm:px-7 pb-6 space-y-3" style={{ background: '#fbfcfe' }}>
          <div className="pt-4 space-y-3">
            {criterion.indicators.map((indicator) => (
              <IndicatorRow key={indicator.number} indicator={indicator} onView={onView} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditQualiopiContent() {
  const [openCriterion, setOpenCriterion] = useState(null);
  const [viewedDoc, setViewedDoc] = useState(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#116632' }} />
        Cliquez sur un critère pour consulter ses indicateurs et les documents de preuve associés
        (visionneuse intégrée). Les indicateurs propres aux autres catégories de prestations
        (certifiantes, CFA, alternance) sont grisés. Les preuves marquées « Interface admin » sont
        consultables dans l'interface d'administration du site (démonstration en séance d'audit).
      </div>

      <div className="space-y-4">
        {AUDIT_CRITERIA.map((criterion) => (
          <CriterionCard
            key={criterion.number}
            criterion={criterion}
            open={openCriterion === criterion.number}
            onToggle={() => setOpenCriterion(openCriterion === criterion.number ? null : criterion.number)}
            onView={setViewedDoc} />
        ))}

        {/* Documents transverses, non rattachés à un critère */}
        <div
          className="rounded-3xl px-5 sm:px-7 py-5"
          style={{ background: 'white', border: '1.5px solid #e0e8f4' }}>
          <div className="flex items-center gap-4">
            <span
              className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#f0f3fa' }}>
              <FolderOpen className="w-6 h-6" style={{ color: '#005064' }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base sm:text-lg font-bold" style={{ color: '#001a4a', ...headingFont }}>
                {OTHER_DOCUMENTS.title}
              </span>
              <span className="block text-xs mt-0.5 leading-relaxed" style={{ color: '#6b7a9b', ...bodyFont }}>
                {OTHER_DOCUMENTS.description}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 sm:pl-16">
            {OTHER_DOCUMENTS.documents.map((doc) => (
              <DocumentChip key={doc.label} doc={doc} onView={setViewedDoc} />
            ))}
          </div>
        </div>
      </div>

      {viewedDoc && (
        <PdfViewer
          title={viewedDoc.label}
          url={auditDocUrl(viewedDoc)}
          onDownload={() => window.open(auditDocUrl(viewedDoc), '_blank')}
          onClose={() => setViewedDoc(null)} />
      )}
    </div>
  );
}
