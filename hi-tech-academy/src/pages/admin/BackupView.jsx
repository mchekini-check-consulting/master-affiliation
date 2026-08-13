import React, { useRef, useState } from 'react';
import { CloudDownload, CloudUpload, TriangleAlert } from 'lucide-react';
import { adminExportBackup, adminImportBackup } from '@/api/backend';
import { Card, ViewHeader, bodyFont, headingFont } from '@/pages/admin/common';

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
      const url = URL.createObjectURL(blob);
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
            Télécharge une archive ZIP contenant toutes les données : demandes d'inscription,
            apprenants, questionnaires (analyse du besoin, commanditaire), tests de positionnement,
            évaluations finales, certificats de réalisation, réclamations, veille — ainsi que les
            PDF (certificats, corrigés) tels qu'ils ont été envoyés aux apprenants.
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
