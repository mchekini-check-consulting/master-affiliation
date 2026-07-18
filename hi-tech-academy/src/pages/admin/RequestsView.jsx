import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, RefreshCw, XCircle } from 'lucide-react';
import { adminGetRegistration, adminListRegistrations, adminUpdateStatus } from '@/api/backend';
import { downloadCertificatePdf } from '@/lib/certificatePdf';
import {
  APPLICANT_LABELS, Badge, Card, EmptyState, Field, StatusBadge, ViewHeader,
  bodyFont, formatDate, formatDay, headingFont,
} from './common';

// --- Détail d'une demande --------------------------------------------
export function RegistrationDetail({ auth, id, onBack, onStatusChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    adminGetRegistration(auth, id).then(setDetail).catch((e) => setError(e.message));
  }, [auth, id]);

  useEffect(load, [load]);

  const decide = async (status) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await adminUpdateStatus(auth, id, status);
      setDetail(updated);
      onStatusChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (error && !detail) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!detail) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  const isCompany = detail.applicant_type !== 'INDIVIDUAL';
  const na = detail.needs_analysis;
  const certificate = detail.certificate;
  const address = [detail.address_line, detail.address_complement, detail.postal_code, detail.city, detail.country]
    .filter(Boolean).join(', ');

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold mb-5"
        style={{ color: '#005064', ...headingFont }}>
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#001a4a', ...headingFont }}>
            {detail.first_name} {detail.last_name}
            {detail.company_name ? ` — ${detail.company_name}` : ''}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
            {APPLICANT_LABELS[detail.applicant_type]} · Demande du {formatDate(detail.created_at)} ·
            Formation : <strong>{detail.formation_title}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={detail.status} />
          {detail.status === 'PENDING' && (
            <>
              <button
                type="button"
                disabled={updating}
                onClick={() => decide('VALIDATED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: '#116632', color: 'white', ...headingFont }}>
                <CheckCircle2 className="w-4 h-4" />
                Valider
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => decide('REFUSED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: '#a12626', color: 'white', ...headingFont }}>
                <XCircle className="w-4 h-4" />
                Refuser
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {isCompany && (
          <Card title="Informations de l'entreprise">
            <div className="space-y-3">
              <Field label="Nom de l'entreprise" value={detail.company_name} />
              <Field label="Adresse" value={address} />
              <Field label="N° SIRET" value={detail.siret} />
              <Field label="NAF" value={detail.naf} />
              <Field label="Typologie du client" value={detail.client_typology} />
              <Field label="Forme juridique" value={detail.legal_form} />
              <Field label="Email de facturation" value={detail.billing_email} />
            </div>
          </Card>
        )}

        <Card title={isCompany ? "Référent de l'entreprise" : 'Informations personnelles'}>
          <div className="space-y-3">
            <Field label="Civilité" value={detail.civility} />
            <Field label="Prénom" value={detail.first_name} />
            <Field label="Nom" value={detail.last_name} />
            <Field label="Adresse email" value={detail.email} />
            <Field label="N° de téléphone" value={detail.phone} />
            <Field label="Fonction" value={detail.job_title} />
            {!isCompany && <Field label="Adresse" value={address} />}
            <Field label="Notes complémentaires" value={detail.notes} />
          </div>
        </Card>

        {!isCompany && (
          <Card title="Informations complémentaires">
            <div className="space-y-3">
              <Field label="N° de téléphone 2" value={detail.phone2} />
              <Field label="Type de stagiaire" value={detail.trainee_type} />
              <Field label="Date de naissance" value={detail.birth_date} />
              <Field label="Ville de naissance" value={detail.birth_city} />
              <Field label="Département de naissance" value={detail.birth_department} />
              <Field label="Nationalité" value={detail.nationality} />
              <Field label="N° de sécurité sociale" value={detail.social_security_number} />
              <Field label="Niveau de diplôme" value={detail.diploma_level} />
              <Field label="Intitulé du diplôme" value={detail.diploma_title} />
              <Field label="Poste occupé" value={detail.current_position} />
              <Field label="Besoins d'adaptation (handicap, contraintes...)" value={detail.needs_adaptation} />
            </div>
          </Card>
        )}

        <Card title="Questionnaire d'analyse du besoin">
          {na ? (
            <div className="space-y-3">
              <div
                className="rounded-xl px-4 py-3 text-sm font-bold inline-block"
                style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                Note de positionnement : {na.score} / {na.max_score}
              </div>
              <Field label="Répondu le" value={formatDate(na.submitted_at)} />
              <Field label="Entreprise / fonction" value={na.company_role} />
              <Field label="Financeur envisagé" value={na.funder} />
              <Field label="Activité et environnement technique" value={na.activity_context} />
              <Field label="Besoin / problème à résoudre" value={na.problem_to_solve} />
              <Field label="Objectifs attendus" value={na.expected_objectives} />
              <Field label="Niveau Linux" value={na.level_linux} />
              <Field label="Niveau Docker / conteneurs" value={na.level_docker} />
              <Field label="Niveau Kubernetes" value={na.level_kubernetes} />
              <Field label="Cas d'usage à traiter" value={na.specific_use_case} />
              <Field label="Contraintes de planning" value={na.planning_constraints} />
              <Field label="Besoin d'aménagement (handicap)" value={na.needs_adaptation} />
              <Field label="Précisions sur l'aménagement" value={na.adaptation_details} />
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
              Le questionnaire n'a pas encore été renseigné par l'apprenant.
            </p>
          )}
        </Card>

        <Card title="Certificat de réalisation">
          {certificate ? (
            <div className="space-y-3">
              <Field label="Émis le" value={formatDate(certificate.issued_at)} />
              <Field
                label="Session"
                value={`du ${formatDay(certificate.session_start_date)} au ${formatDay(certificate.session_end_date)} — ${certificate.duration_hours} h`} />
              <button
                type="button"
                onClick={() => downloadCertificatePdf(certificate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                <Download className="w-4 h-4" />
                Télécharger le PDF
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
              {detail.status === 'VALIDATED'
                ? 'Aucun certificat émis — rendez-vous dans « Certificats de réalisation ».'
                : 'Le certificat ne peut être émis que pour une demande validée.'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// --- Liste des demandes ----------------------------------------------
export default function RequestsView({ auth, selectedId, onSelect }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    setError(null);
    adminListRegistrations(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load, reloadKey]);

  const filtered = useMemo(
    () => (items ?? []).filter((i) => statusFilter === 'ALL' || i.status === statusFilter),
    [items, statusFilter]
  );
  const pendingCount = useMemo(() => (items ?? []).filter((i) => i.status === 'PENDING').length, [items]);

  if (selectedId) {
    return (
      <RegistrationDetail
        auth={auth}
        id={selectedId}
        onBack={() => onSelect(null)}
        onStatusChanged={() => setReloadKey((k) => k + 1)} />
    );
  }

  if (error) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!items) return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;

  const FILTERS = [
    { key: 'ALL', label: 'Toutes' },
    { key: 'PENDING', label: 'En attente' },
    { key: 'VALIDATED', label: 'Validées' },
    { key: 'REFUSED', label: 'Refusées' },
  ];

  return (
    <div>
      <ViewHeader
        title="Demandes à traiter"
        subtitle={`${items.length} demande${items.length > 1 ? 's' : ''} reçue${items.length > 1 ? 's' : ''} — ${pendingCount} en attente`}
        actions={
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#005064', ...headingFont }}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        } />

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              border: statusFilter === key ? '1.5px solid #005064' : '1px solid #e0e8f4',
              background: statusFilter === key ? '#f0f3fa' : 'white',
              color: statusFilter === key ? '#005064' : '#6b7a9b',
              ...headingFont,
            }}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Aucune demande d'inscription pour ce filtre.</EmptyState>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <table className="w-full text-left" style={{ minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                {['Date', 'Demandeur', 'Profil', 'Formation', 'Questionnaire', 'Statut'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: '#6b7a9b', ...headingFont }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="cursor-pointer transition-colors hover:bg-[#f7f9fd]"
                  style={{ borderBottom: '1px solid #f0f3fa' }}>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                      {item.company_name || item.email}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {APPLICANT_LABELS[item.applicant_type]}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {item.formation_title}
                  </td>
                  <td className="px-4 py-3.5">
                    {item.has_needs_analysis ? (
                      <Badge tone="success">Répondu — {item.needs_analysis_score}/{item.needs_analysis_max_score}</Badge>
                    ) : (
                      <Badge>Non répondu</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
