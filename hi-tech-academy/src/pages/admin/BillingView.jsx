import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeEuro, CheckCircle2, Download, Eye, FilePlus2, Plus, ReceiptText, RefreshCw, Send, Trash2, X,
} from 'lucide-react';
import {
  adminArchiveBillingPdf, adminConvertQuoteToInvoice, adminCreateBillingDocument, adminGetRegistration,
  adminListBillingDocuments, adminListRegistrations, adminSendBillingDocument, adminUpdateBillingStatus,
} from '@/api/backend';
import { billingPdfBase64, billingPdfBlobUrl, downloadBillingPdf } from '@/lib/billingPdf';
import PdfViewer from './PdfViewer';
import { Badge, Card, EmptyState, ViewHeader, bodyFont, formatDay, headingFont } from './common';

const TYPE_META = {
  QUOTE: { label: 'Devis', background: '#f0f3fa', color: '#002d74' },
  INVOICE: { label: 'Facture', background: '#e4f2f4', color: '#005064' },
};

const STATUS_META = {
  ISSUED: { label: 'Émis', background: '#f0f3fa', color: '#6b7a9b' },
  SENT: { label: 'Envoyé', background: '#fdf3e2', color: '#8a5a00' },
  ACCEPTED: { label: 'Accepté', background: '#e5f6ec', color: '#116632' },
  REFUSED: { label: 'Refusé', background: '#fdecec', color: '#a12626' },
  PAID: { label: 'Payée', background: '#e5f6ec', color: '#116632' },
};

function money(n) {
  return `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

const emptyLine = () => ({ description: '', quantity: '1', unit_price_ht: '', vat_rate: '20' });

// Archive la copie du PDF côté serveur (sans email) pour qu'elle parte dans
// les sauvegardes — silencieux : la visualisation ne doit pas échouer si
// l'archivage rate (il se refera à la prochaine ouverture).
function archiveBillingPdf(auth, doc) {
  adminArchiveBillingPdf(auth, doc.id, billingPdfBase64(doc)).catch(() => {});
}

// Formulaire de création d'un devis ou d'une facture, préremplissable
// depuis une demande d'inscription validée.
function CreateForm({ auth, type, registrations, onClose, onCreated }) {
  const [clientName, setClientName] = useState('');
  const [clientContactName, setClientContactName] = useState('');
  const [clientAddressLine, setClientAddressLine] = useState('');
  const [clientPostalCode, setClientPostalCode] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientSiret, setClientSiret] = useState('');
  const [clientVatNumber, setClientVatNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceStartDate, setServiceStartDate] = useState('');
  const [serviceEndDate, setServiceEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [registrationId, setRegistrationId] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isInvoice = type === 'INVOICE';

  // Aperçu du document tel qu'il sera émis (numéro et dates simulés :
  // ils sont attribués par le serveur à l'émission).
  const openPreview = () => {
    const today = new Date();
    const limit = new Date(today.getTime() + 30 * 24 * 3600 * 1000);
    const iso = (d) => d.toISOString().slice(0, 10);
    setPreviewUrl(billingPdfBlobUrl({
      type,
      number: isInvoice ? 'FA-APERÇU' : 'DE-APERÇU',
      issue_date: iso(today),
      due_date: iso(limit),
      valid_until: iso(limit),
      service_start_date: serviceStartDate || null,
      service_end_date: serviceEndDate || serviceStartDate || null,
      client_name: clientName || '—',
      client_contact_name: clientContactName || null,
      client_address_line: clientAddressLine || '—',
      client_postal_code: clientPostalCode || '',
      client_city: clientCity || '',
      client_country: 'France',
      client_siret: clientSiret || null,
      client_vat_number: clientVatNumber || null,
      notes: notes || null,
      lines: lines.map((l) => ({
        description: l.description || '—',
        quantity: Number(l.quantity) || 0,
        unit_price_ht: Number(l.unit_price_ht) || 0,
        vat_rate: Number(l.vat_rate) || 0,
      })),
      total_ht: totals.ht,
      total_vat: totals.vat,
      total_ttc: totals.ttc,
    }));
  };

  // Préremplissage depuis une demande validée (détail chargé à la sélection)
  const prefill = async (regId) => {
    setRegistrationId(regId);
    if (!regId) return;
    try {
      const r = await adminGetRegistration(auth, regId);
      const person = [r.first_name, r.last_name].filter(Boolean).join(' ');
      setClientName(r.company_name || person);
      setClientContactName(r.company_name ? person : '');
      setClientAddressLine([r.address_line, r.address_complement].filter(Boolean).join(', '));
      setClientPostalCode(r.postal_code || '');
      setClientCity(r.city || '');
      setClientSiret(r.siret || '');
      setClientEmail(r.billing_email || r.email || '');
      setLines((prev) => {
        const first = { ...prev[0] };
        if (!first.description) first.description = `Formation « ${r.formation_title} »`;
        return [first, ...prev.slice(1)];
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const setLine = (i, patch) => {
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  };

  const totals = useMemo(() => {
    let ht = 0;
    let vat = 0;
    for (const l of lines) {
      const lineHt = (Number(l.quantity) || 0) * (Number(l.unit_price_ht) || 0);
      ht += lineHt;
      vat += lineHt * ((Number(l.vat_rate) || 0) / 100);
    }
    return { ht, vat, ttc: ht + vat };
  }, [lines]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const doc = await adminCreateBillingDocument(auth, {
        type,
        registration_id: registrationId || null,
        client_name: clientName,
        client_contact_name: clientContactName || null,
        client_address_line: clientAddressLine,
        client_postal_code: clientPostalCode,
        client_city: clientCity,
        client_siret: clientSiret || null,
        client_vat_number: clientVatNumber || null,
        client_email: clientEmail || null,
        service_start_date: serviceStartDate || null,
        service_end_date: serviceEndDate || serviceStartDate || null,
        notes: notes || null,
        lines: lines.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unit_price_ht: Number(l.unit_price_ht),
          vat_rate: Number(l.vat_rate),
        })),
      });
      downloadBillingPdf(doc);
      archiveBillingPdf(auth, doc);
      onCreated();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#005064]';
  const inputStyle = { borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont };
  const labelClass = 'block text-xs font-semibold mb-1.5';
  const labelStyle = { color: '#002d74', ...headingFont };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: 'rgba(0,26,74,0.35)' }}>
      <form
        onSubmit={submit}
        className="w-full max-w-2xl max-h-full overflow-y-auto rounded-2xl p-6"
        style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-base" style={{ color: '#001a4a', ...headingFont }}>
            {isInvoice ? 'Nouvelle facture' : 'Nouveau devis'}
          </h3>
          <button type="button" onClick={onClose} aria-label="Fermer">
            <X className="w-5 h-5" style={{ color: '#6b7a9b' }} />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: '#6b7a9b', ...bodyFont }}>
          Numérotation automatique ({isInvoice ? 'FA' : 'DE'}-AAAA-NNNN) —
          {isInvoice ? ' paiement par virement à 30 jours' : ' validité de 30 jours'}
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Préremplir depuis une demande validée</span>
            <select
              value={registrationId}
              onChange={(e) => prefill(e.target.value)}
              className={inputClass} style={inputStyle}>
              <option value="">— Saisie libre —</option>
              {registrations.filter((r) => r.status === 'VALIDATED').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.company_name ? `${r.company_name} — ` : ''}{r.first_name} {r.last_name} · {r.formation_title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass} style={labelStyle}>
                Client (raison sociale ou nom) <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input required value={clientName} onChange={(e) => setClientName(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className={labelClass} style={labelStyle}>Contact (si entreprise)</span>
              <input value={clientContactName} onChange={(e) => setClientContactName(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
          </div>

          <label className="block">
            <span className={labelClass} style={labelStyle}>
              Adresse <span style={{ color: '#c2410c' }}>*</span>
            </span>
            <input required value={clientAddressLine} onChange={(e) => setClientAddressLine(e.target.value)}
              className={inputClass} style={inputStyle} />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className={labelClass} style={labelStyle}>
                Code postal <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input required value={clientPostalCode} onChange={(e) => setClientPostalCode(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block col-span-2">
              <span className={labelClass} style={labelStyle}>
                Ville <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input required value={clientCity} onChange={(e) => setClientCity(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className={labelClass} style={labelStyle}>SIRET (entreprise)</span>
              <input value={clientSiret} onChange={(e) => setClientSiret(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className={labelClass} style={labelStyle}>TVA intracom. (entreprise)</span>
              <input value={clientVatNumber} onChange={(e) => setClientVatNumber(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className={labelClass} style={labelStyle}>Email (pour l'envoi)</span>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass} style={labelStyle}>Début de la prestation</span>
              <input type="date" value={serviceStartDate} onChange={(e) => setServiceStartDate(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className={labelClass} style={labelStyle}>Fin de la prestation</span>
              <input type="date" value={serviceEndDate} onChange={(e) => setServiceEndDate(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
          </div>

          {/* Lignes de prestation */}
          <div>
            <span className={labelClass} style={labelStyle}>
              Prestations <span style={{ color: '#c2410c' }}>*</span>
            </span>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    required placeholder="Désignation"
                    value={l.description} onChange={(e) => setLine(i, { description: e.target.value })}
                    className={`${inputClass} flex-1`} style={inputStyle} />
                  <input
                    required type="number" min="0.01" step="0.01" placeholder="Qté" title="Quantité"
                    value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })}
                    className={`${inputClass} w-20`} style={inputStyle} />
                  <input
                    required type="number" min="0" step="0.01" placeholder="PU HT €" title="Prix unitaire HT"
                    value={l.unit_price_ht} onChange={(e) => setLine(i, { unit_price_ht: e.target.value })}
                    className={`${inputClass} w-28`} style={inputStyle} />
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                    disabled={lines.length === 1}
                    className="p-2.5 disabled:opacity-30" aria-label="Supprimer la ligne">
                    <Trash2 className="w-4 h-4" style={{ color: '#a12626' }} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, emptyLine()])}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold"
              style={{ color: '#005064', ...headingFont }}>
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          <label className="block">
            <span className={labelClass} style={labelStyle}>Remarques (reprises sur le PDF)</span>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className={inputClass} style={inputStyle} />
          </label>

          <p
            className="text-sm rounded-xl px-4 py-3 font-semibold"
            style={{ background: '#f0f3fa', color: '#001a4a', ...headingFont }}>
            Total HT : {money(totals.ht)} — TVA 20 % : {money(totals.vat)} — Total TTC : {money(totals.ttc)}
          </p>
        </div>

        {error && (
          <p className="text-xs mt-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={openPreview}
            className="flex-1 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-1.5"
            style={{ background: 'white', color: '#005064', border: '1px solid #005064', ...headingFont }}>
            <Eye className="w-4 h-4" />
            Prévisualiser
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            {submitting
              ? 'Émission…'
              : isInvoice ? 'Émettre la facture' : 'Émettre le devis'}
          </button>
        </div>
        <p className="text-[11px] mt-2 text-center" style={{ color: '#6b7a9b', ...bodyFont }}>
          L'émission attribue le numéro définitif et télécharge le PDF ; l'envoi par email se fait ensuite
          depuis la liste, après vérification dans la visionneuse.
        </p>
      </form>

      {previewUrl && (
        <PdfViewer
          title={`Aperçu avant émission — ${isInvoice ? 'facture' : 'devis'} (numéro et dates attribués à l'émission)`}
          url={previewUrl}
          onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}

export default function BillingView({ auth }) {
  const [documents, setDocuments] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [error, setError] = useState(null);
  const [createType, setCreateType] = useState(null); // 'QUOTE' | 'INVOICE'
  const [viewerDoc, setViewerDoc] = useState(null);
  const [sendCandidate, setSendCandidate] = useState(null); // document à vérifier avant envoi
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null); // action en cours sur un document
  const [sentIds, setSentIds] = useState(() => new Set());

  const load = useCallback(() => {
    setError(null);
    Promise.all([adminListBillingDocuments(auth), adminListRegistrations(auth)])
      .then(([docs, regs]) => {
        setDocuments(docs);
        setRegistrations(regs);
      })
      .catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load, reloadKey]);

  const run = async (doc, action) => {
    setBusyId(doc.id);
    setError(null);
    try {
      await action();
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  // Envoi en deux temps : « Envoyer » ouvre d'abord la visionneuse avec le
  // PDF exact qui partira, la confirmation se fait depuis sa barre d'actions.
  const confirmSend = async () => {
    const doc = sendCandidate;
    setBusyId(doc.id);
    setError(null);
    try {
      await adminSendBillingDocument(auth, doc.id, billingPdfBase64(doc));
      setSentIds((prev) => new Set(prev).add(doc.id));
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
      setSendCandidate(null);
    }
  };

  const convertToInvoice = (doc) => run(doc, async () => {
    const invoice = await adminConvertQuoteToInvoice(auth, doc.id);
    downloadBillingPdf(invoice);
    archiveBillingPdf(auth, invoice);
  });

  const setStatus = (doc, status) => run(doc, () => adminUpdateBillingStatus(auth, doc.id, status));

  if (error && !documents) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!documents || !registrations) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  const invoices = documents.filter((d) => d.type === 'INVOICE');
  const quotes = documents.filter((d) => d.type === 'QUOTE');

  return (
    <div>
      <ViewHeader
        title="Devis & Factures"
        subtitle={`${quotes.length} devis — ${invoices.length} facture${invoices.length > 1 ? 's' : ''}`}
        actions={
          <span className="inline-flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#005064', ...headingFont }}>
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => setCreateType('QUOTE')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#002d74', color: 'white', ...headingFont }}>
              <FilePlus2 className="w-4 h-4" />
              Nouveau devis
            </button>
            <button
              type="button"
              onClick={() => setCreateType('INVOICE')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              <ReceiptText className="w-4 h-4" />
              Nouvelle facture
            </button>
          </span>
        } />

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
          {error}
        </p>
      )}

      <Card className="mb-6">
        <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
          Documents émis avec numérotation séquentielle annuelle (sans trou) et mentions légales complètes :
          EURL au capital de 100 € — RCS Paris 922 695 648 — TVA FR90922695648 (20 %) — paiement par virement
          à 30 jours (pénalités de retard et indemnité forfaitaire de 40 € rappelées sur chaque facture).
          Une facture émise ne se supprime pas ; chaque PDF envoyé est archivé tel quel et inclus dans les sauvegardes.
        </p>
      </Card>

      {documents.length === 0 ? (
        <EmptyState>Aucun devis ni facture pour le moment.</EmptyState>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <table className="w-full text-left" style={{ minWidth: 780 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                {['N°', 'Date', 'Client', 'Total TTC', 'Statut', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: '#6b7a9b', ...headingFont }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const type = TYPE_META[d.type];
                const status = STATUS_META[d.status] ?? { label: d.status, background: '#f0f3fa', color: '#6b7a9b' };
                const busy = busyId === d.id;
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mr-2"
                        style={{ background: type.background, color: type.color, ...headingFont }}>
                        {type.label}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                        {d.number}
                      </span>
                      {d.source_quote_number && (
                        <span className="block text-[11px] mt-0.5" style={{ color: '#6b7a9b', ...bodyFont }}>
                          Suivant devis {d.source_quote_number}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                      {formatDay(d.issue_date)}
                      {d.type === 'INVOICE' && d.due_date && (
                        <span className="block">Échéance {formatDay(d.due_date)}</span>
                      )}
                      {d.type === 'QUOTE' && d.valid_until && (
                        <span className="block">Valide jusqu'au {formatDay(d.valid_until)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                        {d.client_name}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                        {d.client_email || d.client_contact_name || `${d.client_postal_code} ${d.client_city}`}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap" style={{ color: '#001a4a', ...headingFont }}>
                      {money(d.total_ttc)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: status.background, color: status.color, ...headingFont }}>
                        {status.label}
                      </span>
                      {d.status === 'PAID' && d.paid_at && (
                        <span className="block text-[11px] mt-0.5" style={{ color: '#6b7a9b', ...bodyFont }}>
                          le {formatDay(d.paid_at)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewerDoc(d);
                            archiveBillingPdf(auth, d);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: '#005064', ...headingFont }}>
                          <Eye className="w-4 h-4" />
                          Visualiser
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadBillingPdf(d);
                            archiveBillingPdf(auth, d);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: '#005064', ...headingFont }}>
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                        {sentIds.has(d.id) ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: '#116632', ...headingFont }}>
                            <CheckCircle2 className="w-4 h-4" />
                            Envoyé
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setSendCandidate(d)}
                            title="Vérifier le PDF dans la visionneuse puis confirmer l'envoi"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50"
                            style={{ color: '#005064', ...headingFont }}>
                            <Send className="w-4 h-4" />
                            {busy ? 'Envoi…' : d.status === 'SENT' ? 'Renvoyer' : 'Envoyer'}
                          </button>
                        )}
                        {d.type === 'QUOTE' && d.status !== 'REFUSED' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => convertToInvoice(d)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50"
                            style={{ color: '#002d74', ...headingFont }}>
                            <ReceiptText className="w-4 h-4" />
                            Facturer
                          </button>
                        )}
                        {d.type === 'INVOICE' && d.status !== 'PAID' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setStatus(d, 'PAID')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50"
                            style={{ color: '#116632', ...headingFont }}>
                            <BadgeEuro className="w-4 h-4" />
                            Payée
                          </button>
                        )}
                        {d.type === 'QUOTE' && (d.status === 'ISSUED' || d.status === 'SENT') && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setStatus(d, 'REFUSED')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50"
                            style={{ color: '#a12626', ...headingFont }}>
                            <X className="w-4 h-4" />
                            Refusé
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {createType && (
        <CreateForm
          auth={auth}
          type={createType}
          registrations={registrations}
          onClose={() => setCreateType(null)}
          onCreated={() => {
            setCreateType(null);
            setReloadKey((k) => k + 1);
          }} />
      )}

      {viewerDoc && (
        <PdfViewer
          title={`${TYPE_META[viewerDoc.type].label} ${viewerDoc.number} — ${viewerDoc.client_name}`}
          url={billingPdfBlobUrl(viewerDoc)}
          onDownload={() => downloadBillingPdf(viewerDoc)}
          onClose={() => setViewerDoc(null)} />
      )}

      {sendCandidate && (
        <PdfViewer
          title={`Vérifier avant envoi — ${TYPE_META[sendCandidate.type].label} ${sendCandidate.number} — ${sendCandidate.client_name}`}
          url={billingPdfBlobUrl(sendCandidate)}
          onDownload={() => downloadBillingPdf(sendCandidate)}
          onClose={() => setSendCandidate(null)}
          actions={
            <button
              type="button"
              disabled={busyId === sendCandidate.id || !sendCandidate.client_email}
              onClick={confirmSend}
              title={sendCandidate.client_email
                ? undefined
                : "Renseignez l'email du client pour pouvoir envoyer"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: '#116632', color: 'white', ...headingFont }}>
              <Send className="w-4 h-4" />
              {busyId === sendCandidate.id
                ? 'Envoi…'
                : `Envoyer à ${sendCandidate.client_email || '…'}`}
            </button>
          } />
      )}
    </div>
  );
}
