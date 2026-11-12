import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ban, Download, Eye, FileUp, Plus, RefreshCw, Send, X } from 'lucide-react';
import {
  adminCancelConvention,
  adminCreateConvention,
  adminDownloadSignedConvention,
  adminGetIndicators,
  adminGetRegistration,
  adminListConventions,
  adminListRegistrations,
  adminRefreshConvention,
  adminSendConventionForSignature,
  adminUpdateConventionStatus,
  adminUpdateIndicators,
  adminUploadSignedConvention,
} from '@/api/backend';
import { formations } from '@/data/formations';
import { getConventionData } from '@/data/conventionData';
import { conventionPdfBlobUrl, conventionPdfForSignature, downloadConventionPdf } from '@/lib/conventionPdf';
import { Card, EmptyState, ViewHeader, bodyFont, formatDay, headingFont } from '@/pages/admin/common';
import PdfViewer from '@/pages/admin/PdfViewer';

// Formations couvertes par un contenu de convention (pour l'instant :
// L'essentiel de l'IA ; les autres s'ajoutent dans conventionData.js).
const conventionFormations = formations.filter((f) => getConventionData(f.id));

/** « 2 400 € HT (2 880 € TTC) … » → { ht: 2400, ttc: 2880 } */
function tarifOf(formation) {
  const fact = formation?.keyFacts?.find((k) => k.label === 'Tarif')?.value ?? '';
  const m = fact.replace(/[  ]/g, '').match(/([\d]+)€HT\(([\d]+)€TTC\)/);
  return m ? { ht: Number(m[1]), ttc: Number(m[2]) } : { ht: '', ttc: '' };
}

const STATUS_META = {
  DRAFT: { label: 'Brouillon', background: '#f0f3fa', color: '#6b7a9b' },
  SENT: { label: 'En signature', background: '#fdf3e2', color: '#8a5a00' },
  SIGNED: { label: 'Signée', background: '#e5f6ec', color: '#116632' },
  DECLINED: { label: 'Refusée', background: '#fdecec', color: '#a12626' },
  EXPIRED: { label: 'Expirée', background: '#fdecec', color: '#a12626' },
  CANCELED: { label: 'Annulée', background: '#f0f0f0', color: '#8c8c8c' },
};

/**
 * Statut éditable à la main : tant que la signature électronique n'est pas
 * systématique, l'admin peut acter lui-même « Envoyée », « Signée »… pour les
 * conventions traitées hors Yousign.
 */
function ConventionStatusSelect({ status, disabled, onChange }) {
  const meta = STATUS_META[status] ?? STATUS_META.DRAFT;
  return (
    <select
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      title="Changer le statut"
      className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50"
      style={{ background: meta.background, color: meta.color, border: 'none', appearance: 'auto', ...headingFont }}>
      {Object.entries(STATUS_META).map(([value, m]) => (
        <option key={value} value={value}>{m.label}</option>
      ))}
    </select>
  );
}

const inputClass = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-[#005064]';
const inputStyle = { borderColor: '#e0e8f4', color: '#001a4a', fontFamily: "'Inter', sans-serif" };
const labelClass = 'block text-xs font-semibold mb-1.5';
const labelStyle = { color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" };

/**
 * Indicateurs de résultats globaux de l'organisme (Qualiopi, indicateur 2) :
 * imprimés dans l'article 1 des conventions, figés sur chacune à sa création.
 * Vides = repli sur la mention « nouvel entrant ».
 */
function IndicatorsCard({ auth, indicators, onSaved }) {
  const [satisfaction, setSatisfaction] = useState(indicators?.satisfaction_rate ?? '');
  const [recommendation, setRecommendation] = useState(indicators?.recommendation_rate ?? '');
  const [basis, setBasis] = useState(indicators?.basis ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      onSaved(await adminUpdateIndicators(auth, {
        satisfaction_rate: satisfaction === '' ? null : Number(satisfaction),
        recommendation_rate: recommendation === '' ? null : Number(recommendation),
        basis: basis || null,
      }));
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Indicateurs de résultats de l'organisme" className="mb-5">
      <p className="text-xs mb-3" style={{ color: '#6b7a9b', ...bodyFont }}>
        Imprimés dans l'article 1 des nouvelles conventions (les conventions déjà créées ne bougent pas).
        Qualiopi admet des indicateurs globaux de l'organisme à condition d'en préciser la base de mesure.
        Laisser vide pour la mention « nouvel entrant ».
      </p>
      <div className="grid sm:grid-cols-[150px_170px_1fr_auto] gap-3 items-end">
        <label className="block">
          <span className={labelClass} style={labelStyle}>Satisfaction (%)</span>
          <input type="number" min="0" max="100" step="0.1" value={satisfaction}
            onChange={(e) => { setSatisfaction(e.target.value); setSaved(false); }}
            className={inputClass} style={inputStyle} />
        </label>
        <label className="block">
          <span className={labelClass} style={labelStyle}>Recommandation (%)</span>
          <input type="number" min="0" max="100" step="0.1" value={recommendation}
            onChange={(e) => { setRecommendation(e.target.value); setSaved(false); }}
            className={inputClass} style={inputStyle} />
        </label>
        <label className="block">
          <span className={labelClass} style={labelStyle}>Base de mesure</span>
          <input value={basis} placeholder="toutes formations confondues, sessions 2026, 14 répondants"
            onChange={(e) => { setBasis(e.target.value); setSaved(false); }}
            className={inputClass} style={inputStyle} />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
          style={{ background: '#005064', color: 'white', ...headingFont }}>
          {saving ? 'Enregistrement…' : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </div>
      {error && (
        <p className="text-xs mt-3 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>{error}</p>
      )}
    </Card>
  );
}

/** Formulaire de création : identité du client, session, et question OPCO. */
function CreateForm({ auth, registrations, indicators, onClose, onCreated }) {
  const [formationId, setFormationId] = useState(conventionFormations[0]?.id ?? '');
  const [registrationId, setRegistrationId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRepresentativeName, setClientRepresentativeName] = useState('');
  const [clientAddressLine, setClientAddressLine] = useState('');
  const [clientPostalCode, setClientPostalCode] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientSiret, setClientSiret] = useState('');
  const [signerFirstName, setSignerFirstName] = useState('');
  const [signerLastName, setSignerLastName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [scheduleText, setScheduleText] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [priceHt, setPriceHt] = useState(tarifOf(conventionFormations[0]).ht);
  const [priceTtc, setPriceTtc] = useState(tarifOf(conventionFormations[0]).ttc);
  // Question posée avant toute génération : financement OPCO ? null = pas encore répondu.
  const [opcoFunded, setOpcoFunded] = useState(null);
  const [opcoName, setOpcoName] = useState('');
  const [opcoDeadline, setOpcoDeadline] = useState('');
  const [opcoPartialMode, setOpcoPartialMode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formation = conventionFormations.find((f) => f.id === formationId);

  const pickFormation = (id) => {
    setFormationId(id);
    const t = tarifOf(conventionFormations.find((f) => f.id === id));
    setPriceHt(t.ht);
    setPriceTtc(t.ttc);
  };

  const prefill = async (regId) => {
    setRegistrationId(regId);
    if (!regId) return;
    try {
      const r = await adminGetRegistration(auth, regId);
      const person = [r.first_name, r.last_name].filter(Boolean).join(' ');
      setClientName(r.company_name || person);
      setClientRepresentativeName(r.company_name ? person : '');
      setClientAddressLine([r.address_line, r.address_complement].filter(Boolean).join(', '));
      setClientPostalCode(r.postal_code || '');
      setClientCity(r.city || '');
      setClientSiret(r.siret || '');
      setSignerFirstName(r.first_name || '');
      setSignerLastName(r.last_name || '');
      setSignerEmail(r.billing_email || r.email || '');
      if (r.formation_id && conventionFormations.some((f) => f.id === r.formation_id)) {
        pickFormation(r.formation_id);
      }
      // Article 3 : les participants sont les apprenants qui suivent la
      // formation. Pour une entreprise, ce sont les salariés déclarés via le
      // questionnaire (jamais le dirigeant signataire) ; s'ils ne sont pas
      // encore connus, on laisse vide (« à confirmer » dans le PDF).
      const trainees = (r.trainees ?? [])
        .map((t) => [t.first_name, t.last_name].filter(Boolean).join(' '))
        .filter(Boolean);
      setParticipantsText(r.applicant_type === 'COMPANY' ? trainees.join('\n') : person);
    } catch (e) {
      setError(e.message);
    }
  };

  const draft = () => ({
    number: 'CV-APERÇU',
    issue_date: new Date().toISOString().slice(0, 10),
    formation_id: formationId,
    formation_title: formation?.title ?? '',
    client_name: clientName || '—',
    client_representative_name: clientRepresentativeName || null,
    client_address_line: clientAddressLine || '—',
    client_postal_code: clientPostalCode || '',
    client_city: clientCity || '',
    client_siret: clientSiret || null,
    session_start_date: sessionStartDate || new Date().toISOString().slice(0, 10),
    session_end_date: sessionEndDate || sessionStartDate || new Date().toISOString().slice(0, 10),
    schedule_text: scheduleText || null,
    participants: participantsText.split('\n').map((l) => l.trim()).filter(Boolean),
    price_ht: Number(priceHt) || 0,
    price_ttc: Number(priceTtc) || 0,
    opco_funded: opcoFunded === true,
    opco_name: opcoName || null,
    opco_deadline: opcoDeadline || sessionStartDate || new Date().toISOString().slice(0, 10),
    opco_partial_mode: opcoPartialMode || null,
    // Aperçu avec la configuration courante ; le back fige ces valeurs à la création
    satisfaction_rate: indicators?.satisfaction_rate ?? null,
    recommendation_rate: indicators?.recommendation_rate ?? null,
    indicators_basis: indicators?.basis ?? null,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (opcoFunded === null) {
      setError('Répondez à la question du financement OPCO avant de générer la convention.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await adminCreateConvention(auth, {
        formation_id: formationId,
        formation_title: formation?.title ?? '',
        client_name: clientName,
        client_representative_name: clientRepresentativeName || null,
        client_address_line: clientAddressLine,
        client_postal_code: clientPostalCode,
        client_city: clientCity,
        client_siret: clientSiret || null,
        signer_first_name: signerFirstName,
        signer_last_name: signerLastName,
        signer_email: signerEmail,
        session_start_date: sessionStartDate,
        session_end_date: sessionEndDate,
        schedule_text: scheduleText || null,
        participants: participantsText.split('\n').map((l) => l.trim()).filter(Boolean),
        price_ht: Number(priceHt),
        price_ttc: Number(priceTtc),
        opco_funded: opcoFunded === true,
        opco_name: opcoFunded ? opcoName : null,
        opco_deadline: opcoFunded ? opcoDeadline : null,
        opco_partial_mode: opcoFunded ? opcoPartialMode : null,
        registration_id: registrationId || null,
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ background: 'rgba(0,26,74,0.35)' }}>
      <form
        onSubmit={submit}
        className="w-full max-w-2xl max-h-full overflow-y-auto rounded-2xl p-6 space-y-4"
        style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-base" style={{ color: '#001a4a', ...headingFont }}>Nouvelle convention de formation</h3>
            <p className="text-xs mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
              Signature électronique des deux parties via Yousign après génération.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ color: '#6b7a9b' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Formation</span>
            <select value={formationId} onChange={(e) => pickFormation(e.target.value)} className={inputClass} style={inputStyle}>
              {conventionFormations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Préremplir depuis une demande</span>
            <select value={registrationId} onChange={(e) => prefill(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">—</option>
              {(registrations ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {[r.company_name || [r.first_name, r.last_name].filter(Boolean).join(' '), r.formation_title].filter(Boolean).join(' — ')}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Client (raison sociale ou nom) <span style={{ color: '#c2410c' }}>*</span></span>
            <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Représentant (si société)</span>
            <input value={clientRepresentativeName} onChange={(e) => setClientRepresentativeName(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
        </div>
        <label className="block">
          <span className={labelClass} style={labelStyle}>Adresse <span style={{ color: '#c2410c' }}>*</span></span>
          <input required value={clientAddressLine} onChange={(e) => setClientAddressLine(e.target.value)} className={inputClass} style={inputStyle} />
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Code postal <span style={{ color: '#c2410c' }}>*</span></span>
            <input required value={clientPostalCode} onChange={(e) => setClientPostalCode(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Ville <span style={{ color: '#c2410c' }}>*</span></span>
            <input required value={clientCity} onChange={(e) => setClientCity(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>SIRET (si société)</span>
            <input value={clientSiret} onChange={(e) => setClientSiret(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
        </div>

        <p className="text-xs font-semibold pt-1" style={{ color: '#005064', ...headingFont }}>Signataire côté client (reçoit l'invitation Yousign)</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Prénom <span style={{ color: '#c2410c' }}>*</span></span>
            <input required value={signerFirstName} onChange={(e) => setSignerFirstName(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Nom <span style={{ color: '#c2410c' }}>*</span></span>
            <input required value={signerLastName} onChange={(e) => setSignerLastName(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Email <span style={{ color: '#c2410c' }}>*</span></span>
            <input type="email" required value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Début de session <span style={{ color: '#c2410c' }}>*</span></span>
            <input type="date" required value={sessionStartDate} onChange={(e) => setSessionStartDate(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Fin de session <span style={{ color: '#c2410c' }}>*</span></span>
            <input type="date" required value={sessionEndDate} onChange={(e) => setSessionEndDate(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
        </div>
        <label className="block">
          <span className={labelClass} style={labelStyle}>Planning des séances (une par ligne)</span>
          <textarea
            rows={3}
            value={scheduleText}
            onChange={(e) => setScheduleText(e.target.value)}
            placeholder={'Le 12/01/2027 de 09:00 à 12:30 - En distanciel : Google Meet\nLe 12/01/2027 de 13:30 à 17:00 - En distanciel : Google Meet'}
            className={inputClass}
            style={inputStyle} />
        </label>
        <label className="block">
          <span className={labelClass} style={labelStyle}>Apprenants (un par ligne — les stagiaires qui suivent la formation, pas le signataire)</span>
          <textarea rows={2} value={participantsText} onChange={(e) => setParticipantsText(e.target.value)} className={inputClass} style={inputStyle} />
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass} style={labelStyle}>Prix HT (€) <span style={{ color: '#c2410c' }}>*</span></span>
            <input type="number" min="0" step="0.01" required value={priceHt} onChange={(e) => setPriceHt(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
          <label className="block">
            <span className={labelClass} style={labelStyle}>Prix TTC (€) <span style={{ color: '#c2410c' }}>*</span></span>
            <input type="number" min="0" step="0.01" required value={priceTtc} onChange={(e) => setPriceTtc(e.target.value)} className={inputClass} style={inputStyle} />
          </label>
        </div>

        {/* Question OPCO : obligatoire avant génération */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
          <p className="text-sm font-bold" style={{ color: '#001a4a', ...headingFont }}>
            Cette formation sera-t-elle financée par un OPCO ?
          </p>
          <div className="flex gap-4">
            {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(({ v, l }) => (
              <label key={l} className="inline-flex items-center gap-2 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                <input type="radio" name="opco" checked={opcoFunded === v} onChange={() => setOpcoFunded(v)} />
                {l}
              </label>
            ))}
          </div>
          {opcoFunded && (
            <>
              <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                La convention inclura une clause suspensive : sans accord de prise en charge à la date butoir, elle est caduque de plein droit.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass} style={labelStyle}>OPCO <span style={{ color: '#c2410c' }}>*</span></span>
                  <input required={opcoFunded} value={opcoName} onChange={(e) => setOpcoName(e.target.value)} placeholder="OPCO Atlas" className={inputClass} style={inputStyle} />
                </label>
                <label className="block">
                  <span className={labelClass} style={labelStyle}>Date butoir de l'accord <span style={{ color: '#c2410c' }}>*</span></span>
                  <input type="date" required={opcoFunded} value={opcoDeadline} onChange={(e) => setOpcoDeadline(e.target.value)} className={inputClass} style={inputStyle} />
                </label>
              </div>
              <div className="space-y-1.5">
                <span className={labelClass} style={labelStyle}>En cas de prise en charge partielle <span style={{ color: '#c2410c' }}>*</span></span>
                {[
                  { v: 'CLIENT_PAYS_REMAINDER', l: 'Le client s’engage à régler le reliquat restant à sa charge' },
                  { v: 'VOID_IF_PARTIAL', l: 'La convention est caduque de plein droit (condition non réalisée)' },
                ].map(({ v, l }) => (
                  <label key={v} className="flex items-start gap-2 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    <input type="radio" name="opco_partial" className="mt-1" checked={opcoPartialMode === v} onChange={() => setOpcoPartialMode(v)} required={opcoFunded} />
                    {l}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-xs rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>{error}</p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => setPreviewUrl(conventionPdfBlobUrl(draft()))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ color: '#005064', border: '1px solid #e0e8f4', ...headingFont }}>
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            {submitting ? 'Création…' : 'Créer la convention'}
          </button>
        </div>

        {previewUrl && (
          <PdfViewer title="Aperçu de la convention" url={previewUrl} onClose={() => setPreviewUrl(null)} />
        )}
      </form>
    </div>
  );
}

export default function ConventionsView({ auth }) {
  const [conventions, setConventions] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewer, setViewer] = useState(null); // { title, url, convention, confirmSend }
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    Promise.all([adminListConventions(auth), adminListRegistrations(auth), adminGetIndicators(auth)])
      .then(([convs, regs, inds]) => {
        setConventions(convs);
        setRegistrations(regs);
        setIndicators(inds);
      })
      .catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load]);

  const patch = (updated) => {
    setConventions((prev) => (prev ?? []).map((c) => (c.id === updated.id ? updated : c)));
  };

  // Envoi en signature : vérification visuelle du PDF, puis confirmation.
  const openSendConfirmation = (c) => {
    setViewer({
      title: `Vérifier avant envoi — ${c.number}`,
      url: conventionPdfBlobUrl(c),
      convention: c,
      confirmSend: true,
    });
  };

  const confirmSend = async (c) => {
    setBusyId(c.id);
    setError(null);
    try {
      const { pdfBase64, signatureFields } = conventionPdfForSignature(c);
      patch(await adminSendConventionForSignature(auth, c.id, pdfBase64, signatureFields));
      setViewer(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  // Dépôt manuel du document signé : input fichier caché, partagé par toutes
  // les lignes ; la convention ciblée est mémorisée au clic sur le bouton.
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const pickSignedPdf = (c) => {
    uploadTargetRef.current = c;
    fileInputRef.current?.click();
  };

  const uploadSignedPdf = async (file) => {
    const c = uploadTargetRef.current;
    if (!c || !file) return;
    setBusyId(c.id);
    setError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = '';
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      patch(await adminUploadSignedConvention(auth, c.id, btoa(binary)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
      uploadTargetRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const setStatus = async (c, status) => {
    setBusyId(c.id);
    setError(null);
    try {
      patch(await adminUpdateConventionStatus(auth, c.id, status));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const refresh = async (c) => {
    setBusyId(c.id);
    setError(null);
    try {
      patch(await adminRefreshConvention(auth, c.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (c) => {
    if (!window.confirm(`Annuler la convention ${c.number} ?`)) return;
    setBusyId(c.id);
    setError(null);
    try {
      patch(await adminCancelConvention(auth, c.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const downloadSigned = async (c) => {
    setBusyId(c.id);
    setError(null);
    try {
      const blob = await adminDownloadSignedConvention(auth, c.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Convention_${c.number}_signee.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (error && !conventions) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!conventions) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  const iconButton = 'inline-flex items-center justify-center w-9 h-9 rounded-xl disabled:opacity-40';

  return (
    <div>
      <ViewHeader
        title="Conventions de formation"
        subtitle="Génération par formation et signature électronique des deux parties via Yousign"
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            <Plus className="w-4 h-4" />
            Nouvelle convention
          </button>
        } />

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>{error}</p>
      )}

      <IndicatorsCard key={indicators?.updated_at ?? 'init'} auth={auth} indicators={indicators} onSaved={setIndicators} />

      {conventions.length === 0 ? (
        <EmptyState>
          Aucune convention pour l'instant. Créez la première : formation, client,
          question du financement OPCO, puis envoi en signature aux deux parties.
        </EmptyState>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 860 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                  {['N°', 'Formation', 'Client', 'Session', 'OPCO', 'Statut', ''].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#6b7a9b', ...headingFont }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {conventions.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                    <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: '#001a4a', ...headingFont }}>
                      {c.number}
                    </td>
                    <td className="px-3 py-3 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                      {c.formation_title}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm" style={{ color: '#001a4a', ...bodyFont }}>{c.client_name}</p>
                      <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{c.signer_email}</p>
                    </td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                      {formatDay(c.session_start_date)} → {formatDay(c.session_end_date)}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                      {c.opco_funded ? `${c.opco_name} (butoir ${formatDay(c.opco_deadline)})` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <ConventionStatusSelect
                        status={c.status}
                        disabled={busyId === c.id}
                        onChange={(status) => setStatus(c, status)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Visualiser"
                          onClick={() => setViewer({ title: `Convention ${c.number}`, url: conventionPdfBlobUrl(c), convention: c })}
                          className={iconButton}
                          style={{ color: '#005064' }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title={c.status === 'SIGNED' ? 'Télécharger la version signée' : 'Télécharger (non signée)'}
                          disabled={busyId === c.id}
                          onClick={() => (c.status === 'SIGNED' && c.has_signed_pdf ? downloadSigned(c) : downloadConventionPdf(c))}
                          className={iconButton}
                          style={{ color: '#005064' }}>
                          <Download className="w-4 h-4" />
                        </button>
                        {c.status === 'DRAFT' && (
                          <button
                            type="button"
                            title="Envoyer en signature (Yousign)"
                            disabled={busyId === c.id}
                            onClick={() => openSendConfirmation(c)}
                            className={iconButton}
                            style={{ color: '#005064' }}>
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {c.status === 'SENT' && (
                          <button
                            type="button"
                            title="Actualiser le statut de signature"
                            disabled={busyId === c.id}
                            onClick={() => refresh(c)}
                            className={iconButton}
                            style={{ color: '#005064' }}>
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title={c.has_signed_pdf ? 'Remplacer le document signé (PDF)' : 'Déposer le document signé (PDF)'}
                          disabled={busyId === c.id}
                          onClick={() => pickSignedPdf(c)}
                          className={iconButton}
                          style={{ color: '#005064' }}>
                          <FileUp className="w-4 h-4" />
                        </button>
                        {(c.status === 'DRAFT' || c.status === 'SENT') && (
                          <button
                            type="button"
                            title="Annuler"
                            disabled={busyId === c.id}
                            onClick={() => cancel(c)}
                            className={iconButton}
                            style={{ color: '#a12626' }}>
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => uploadSignedPdf(e.target.files?.[0])} />

      {creating && (
        <CreateForm
          auth={auth}
          registrations={registrations}
          indicators={indicators}
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false);
            setConventions((prev) => [created, ...(prev ?? [])]);
          }} />
      )}

      {viewer && (
        <PdfViewer
          title={viewer.title}
          url={viewer.url}
          onDownload={() => downloadConventionPdf(viewer.convention)}
          onClose={() => setViewer(null)}
          actions={viewer.confirmSend ? (
            <button
              type="button"
              disabled={busyId === viewer.convention.id}
              onClick={() => confirmSend(viewer.convention)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              <Send className="w-4 h-4" />
              {busyId === viewer.convention.id ? 'Envoi…' : 'Envoyer en signature'}
            </button>
          ) : undefined} />
      )}
    </div>
  );
}
