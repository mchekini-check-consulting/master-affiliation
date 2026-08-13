import React, { useRef, useState } from 'react';
import JSZip from 'jszip';
import { CloudDownload, CloudUpload, TriangleAlert } from 'lucide-react';
import {
  adminExportBackup, adminGetRegistration, adminImportBackup, adminListCertificates,
  adminListRegistrations,
} from '@/api/backend';
import { certificatePdfBase64 } from '@/lib/certificatePdf';
import {
  buildFinalEvaluationPdfBase64, buildNeedsAnalysisPdfBase64,
  buildPositioningTestPdfBase64, buildSponsorSurveyPdfBase64,
} from '@/lib/surveyPdf';
import { Card, ViewHeader, bodyFont, headingFont } from '@/pages/admin/common';

// --- Arborescence du ZIP : mêmes règles de nommage que le backend -------
// (BackupService : dossier par formation, sous-dossiers par type de document)

const stripAccents = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const sanitize = (s, space) =>
  stripAccents(s).replace(/[^A-Za-z0-9 _.-]/g, ' ').trim().replace(/\s+/g, space) || 'Sans nom';
const folderName = (s) => sanitize(s, ' ');
const personName = (first, last) => sanitize(`${first ?? ''} ${last ?? ''}`, '_');
const shortId = (id) => String(id).slice(0, 8);

/**
 * Complète l'archive du backend avec les PDF des questionnaires (analyse du
 * besoin, commanditaire, tests de positionnement, évaluations finales) et
 * les certificats jamais archivés, rangés par formation puis type de
 * document. Un document illisible est ignoré (compté) : l'export des
 * données ne doit pas échouer pour un PDF.
 */
async function enrichZipWithDocuments(zip, auth) {
  let failures = 0;
  const add = (path, build) => {
    try {
      zip.file(path, build(), { base64: true });
    } catch {
      failures += 1;
    }
  };

  // Certificats déjà archivés (tels qu'envoyés) par le backend : ne pas
  // les remplacer par une version régénérée
  const manifest = JSON.parse(await zip.file('backup.json').async('string'));
  const archivedCertIds = new Set(
    (manifest.pdfs ?? []).filter((p) => p.kind === 'CERTIFICATE').map((p) => p.owner_id),
  );

  const registrations = await adminListRegistrations(auth);
  for (const item of registrations) {
    const d = await adminGetRegistration(auth, item.id);
    const dir = folderName(d.formation_title);
    const name = personName(d.first_name, d.last_name);
    const fullName = `${d.first_name} ${d.last_name}`;
    const rid = shortId(d.id);

    if (d.needs_analysis) {
      add(`${dir}/Analyse du besoin/${name}_${rid}.pdf`, () => buildNeedsAnalysisPdfBase64(
        d.needs_analysis,
        { name: fullName, context: d.company_name, formationTitle: d.formation_title },
      ));
    }
    if (d.sponsor_survey) {
      add(`${dir}/Analyse du besoin/Commanditaire_${sanitize(d.company_name, '_')}_${rid}.pdf`,
        () => buildSponsorSurveyPdfBase64(
          d.sponsor_survey,
          { company: d.company_name, formationTitle: d.formation_title },
        ));
    }
    if (d.positioning_test) {
      add(`${dir}/Test de positionnement/${name}_${rid}.pdf`, () => buildPositioningTestPdfBase64(
        d.positioning_test,
        { name: fullName, context: d.company_name, formationTitle: d.formation_title },
      ));
    }
    if (d.final_evaluation?.submitted_at) {
      add(`${dir}/Evaluation finale/${name}_${rid}.pdf`, () => buildFinalEvaluationPdfBase64(
        d.final_evaluation,
        { name: fullName, formationTitle: d.formation_title },
      ));
    }

    for (const t of d.trainees ?? []) {
      const tName = personName(t.first_name, t.last_name);
      const tFullName = `${t.first_name} ${t.last_name}`;
      const tid = shortId(t.id);
      const context = `Salarié de ${d.company_name}`;
      add(`${dir}/Analyse du besoin/${tName}_${tid}.pdf`, () => buildNeedsAnalysisPdfBase64(
        t, { name: tFullName, context, formationTitle: d.formation_title },
      ));
      if (t.positioning_test) {
        add(`${dir}/Test de positionnement/${tName}_${tid}.pdf`, () => buildPositioningTestPdfBase64(
          t.positioning_test, { name: tFullName, context, formationTitle: d.formation_title },
        ));
      }
      if (t.final_evaluation?.submitted_at) {
        add(`${dir}/Evaluation finale/${tName}_${tid}.pdf`, () => buildFinalEvaluationPdfBase64(
          t.final_evaluation, { name: tFullName, formationTitle: d.formation_title },
        ));
      }
    }
  }

  // Certificats sans copie archivée : régénérés avec le template actuel
  const certificates = await adminListCertificates(auth);
  for (const c of certificates) {
    if (archivedCertIds.has(c.id)) continue;
    add(`${folderName(c.formation_title)}/Certificats/${personName(c.first_name, c.last_name)}_${shortId(c.id)}.pdf`,
      () => certificatePdfBase64(c));
  }

  return failures;
}

// Libellés du rapport d'import renvoyé par le backend
const REPORT_LABELS = [
  ['registrations', 'demandes d’inscription'],
  ['trainees', 'apprenants salariés'],
  ['certificates', 'certificats'],
  ['complaints', 'réclamations'],
  ['veille_items', 'entrées de veille'],
  ['pdfs', 'PDF archivés'],
];

export default function BackupView({ auth }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmFile, setConfirmFile] = useState(null); // fichier en attente de confirmation
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const doExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const { blob, filename } = await adminExportBackup(auth);
      const zip = await JSZip.loadAsync(blob);
      const failures = await enrichZipWithDocuments(zip, auth);
      if (failures > 0) {
        setError(`${failures} document(s) PDF n'ont pas pu être générés — l'archive les omet mais contient toutes les données.`);
      }
      const enriched = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(enriched);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  const onFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReport(null);
      setError(null);
      setConfirmFile(file);
    }
    e.target.value = ''; // permet de re-choisir le même fichier
  };

  const doImport = async () => {
    const file = confirmFile;
    setConfirmFile(null);
    setImporting(true);
    setError(null);
    try {
      setReport(await adminImportBackup(auth, file));
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <ViewHeader
        title="Sauvegardes"
        subtitle="Exportez l'ensemble des données de l'organisme, et restaurez une sauvegarde quand vous le souhaitez." />

      {error && (
        <p className="text-xs mb-5 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <Card title="Exporter une sauvegarde">
          <p className="text-sm mb-4" style={{ color: '#6b7a9b', ...bodyFont }}>
            Télécharge une archive ZIP contenant toutes les données (demandes d'inscription,
            apprenants, questionnaires, réclamations, veille…) ainsi que tous les documents en
            PDF, rangés par formation puis par type : Analyse du besoin, Test de positionnement,
            Evaluation finale et Certificats. Les certificats et corrigés déjà envoyés aux
            apprenants y figurent tels qu'ils ont été émis.
          </p>
          <p className="text-xs mb-5" style={{ color: '#8a5a00', background: '#fdf3e2', borderRadius: 12, padding: '10px 14px', ...bodyFont }}>
            L'archive contient des données personnelles : conservez-la en lieu sûr.
          </p>
          <button
            type="button"
            disabled={exporting}
            onClick={doExport}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            <CloudDownload className="w-[18px] h-[18px]" />
            {exporting ? 'Export en cours…' : 'Télécharger la sauvegarde (.zip)'}
          </button>
        </Card>

        <Card title="Restaurer une sauvegarde">
          <p className="text-sm mb-4" style={{ color: '#6b7a9b', ...bodyFont }}>
            Réimporte une archive exportée depuis cet écran. Toutes les données actuelles sont
            remplacées par le contenu de la sauvegarde, en une seule opération : si l'import
            échoue, rien n'est modifié.
          </p>
          <p className="text-xs mb-5 flex items-start gap-2" style={{ color: '#a12626', background: '#fdecec', borderRadius: 12, padding: '10px 14px', ...bodyFont }}>
            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Les données saisies après la date de la sauvegarde seront perdues.
              Pensez à exporter l'état actuel avant de restaurer.
            </span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={onFileChosen} />
          <button
            type="button"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'white', color: '#a12626', border: '1px solid #a12626', ...headingFont }}>
            <CloudUpload className="w-[18px] h-[18px]" />
            {importing ? 'Restauration en cours…' : 'Choisir une sauvegarde à restaurer'}
          </button>

          {report && (
            <div className="mt-5 rounded-xl px-4 py-3" style={{ background: '#e5f6ec' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#116632', ...headingFont }}>
                Sauvegarde restaurée
              </p>
              <p className="text-xs" style={{ color: '#116632', ...bodyFont }}>
                {REPORT_LABELS.map(([key, label]) => `${report[key] ?? 0} ${label}`).join(', ')}.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation avant remplacement des données */}
      {confirmFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,26,74,0.55)' }}>
          <div className="w-full max-w-md rounded-3xl p-7" style={{ background: 'white' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#001a4a', ...headingFont }}>
              Remplacer toutes les données ?
            </h3>
            <p className="text-sm mb-2" style={{ color: '#6b7a9b', ...bodyFont }}>
              La sauvegarde <span className="font-semibold" style={{ color: '#001a4a' }}>{confirmFile.name}</span> va
              remplacer l'intégralité des données actuelles (demandes, apprenants, questionnaires,
              certificats, réclamations, veille, PDF archivés).
            </p>
            <p className="text-sm mb-6 font-semibold" style={{ color: '#a12626', ...bodyFont }}>
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmFile(null)}
                className="px-5 py-3 rounded-xl font-bold text-sm"
                style={{ background: '#f0f3fa', color: '#001a4a', ...headingFont }}>
                Annuler
              </button>
              <button
                type="button"
                onClick={doImport}
                className="px-5 py-3 rounded-xl font-bold text-sm"
                style={{ background: '#a12626', color: 'white', ...headingFont }}>
                Oui, tout remplacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
