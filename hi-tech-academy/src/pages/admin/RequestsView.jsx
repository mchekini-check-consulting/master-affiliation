import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, Eye, RefreshCw, XCircle } from 'lucide-react';
import { adminGetRegistration, adminListRegistrations, adminUpdateStatus } from '@/api/backend';
import { downloadCertificatePdf } from '@/lib/certificatePdf';
import SurveyModal, { Answer, LevelAnswer, SurveySection } from './SurveyModal';
import {
  APPLICANT_LABELS, Badge, Card, EmptyState, Field, StatusBadge, ViewHeader,
  bodyFont, formatDate, formatDay, headingFont,
} from './common';

// --- Réponses de l'analyse du besoin, grand format --------------------
function NeedsAnalysisModal({ detail, onClose }) {
  const na = detail.needs_analysis;
  return (
    <SurveyModal
      title="Analyse du besoin"
      subtitle={`${detail.first_name} ${detail.last_name} — ${detail.formation_title}`}
      submittedAt={na.submitted_at}
      badge={
        <span
          className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#F8B102', color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Note de positionnement : {na.score} / {na.max_score}
        </span>
      }
      onClose={onClose}>

      <SurveySection title="1. Identité">
        <Answer question="Nom et prénom du bénéficiaire" answer={na.beneficiary_name} />
        <Answer question="Entreprise / fonction" answer={na.company_role} />
        <Answer question="Financeur envisagé (OPCO Atlas / AGEFICE / autre)" answer={na.funder} />
      </SurveySection>

      <SurveySection title="2. Contexte et besoin">
        <Answer question="Activité et environnement technique actuel" answer={na.activity_context} />
        <Answer question="Besoin / problème que la formation doit aider à résoudre" answer={na.problem_to_solve} />
        <Answer question="Objectifs attendus à l'issue de la formation" answer={na.expected_objectives} />
      </SurveySection>

      <SurveySection title="3. Niveau de départ (auto-évaluation)">
        <LevelAnswer
          question="Linux (ligne de commande)"
          options={['Débutant', 'Intermédiaire', 'Confirmé']}
          value={na.level_linux} />
        <LevelAnswer
          question="Docker / conteneurs"
          options={['Débutant', 'Intermédiaire', 'Confirmé']}
          value={na.level_docker} />
        <LevelAnswer
          question="Kubernetes"
          options={['Aucune notion', 'Notions', 'Déjà utilisé']}
          value={na.level_kubernetes} />
      </SurveySection>

      <SurveySection title="4. Attentes et besoins spécifiques">
        <Answer question="Cas d'usage précis à traiter pendant la formation" answer={na.specific_use_case} />
        <Answer question="Situation de handicap nécessitant un aménagement" answer={na.needs_adaptation} />
        {na.needs_adaptation && (
          <Answer question="Besoins d'aménagement précisés" answer={na.adaptation_details} />
        )}
      </SurveySection>

      <SurveySection title="5. Contraintes">
        <Answer question="Contraintes de planning" answer={na.planning_constraints} />
      </SurveySection>
    </SurveyModal>
  );
}

// --- Réponses du questionnaire commanditaire, grand format -------------
function SponsorSurveyModal({ detail, onClose }) {
  const s = detail.sponsor_survey;
  return (
    <SurveyModal
      title="Attentes du commanditaire"
      subtitle={`${detail.company_name} — ${detail.formation_title}`}
      submittedAt={s.submitted_at}
      onClose={onClose}>

      <SurveySection title="1. Le projet de formation">
        <Answer question="Contexte et objectif de la formation pour l'entreprise" answer={s.training_reason} />
        <Answer question="Nombre de salariés concernés" answer={s.trainee_count} />
        <Answer question="Profils / fonctions des salariés à former" answer={s.trainee_profiles} />
      </SurveySection>

      <SurveySection title="2. Les attentes de l'entreprise">
        <Answer question="Compétences attendues à l'issue de la formation" answer={s.expected_skills} />
        <Answer question="Critères de réussite pour l'entreprise" answer={s.success_criteria} />
        <Answer question="Projet concret d'application des acquis" answer={s.application_project} />
      </SurveySection>

      <SurveySection title="3. Organisation et financement">
        <Answer question="Contraintes de planning ou d'organisation" answer={s.planning_constraints} />
        <Answer question="Mode de financement envisagé" answer={s.funding} />
        <Answer question="Salarié(s) en situation de handicap nécessitant un aménagement" answer={s.needs_adaptation} />
        {s.needs_adaptation && (
          <Answer question="Besoins d'aménagement précisés" answer={s.adaptation_details} />
        )}
        <Answer question="Autres remarques ou attentes" answer={s.comments} />
      </SurveySection>
    </SurveyModal>
  );
}

// --- Détail d'une demande --------------------------------------------
export function RegistrationDetail({ auth, id, onBack, onStatusChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [openSurvey, setOpenSurvey] = useState(null); // 'needs' | 'sponsor' | null

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
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="rounded-xl px-4 py-2.5 text-sm font-bold inline-block"
                  style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                  Note : {na.score} / {na.max_score}
                </span>
                <Badge tone="success">Répondu le {formatDate(na.submitted_at)}</Badge>
              </div>
              <button
                type="button"
                onClick={() => setOpenSurvey('needs')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                <Eye className="w-4 h-4" />
                Voir les réponses du questionnaire
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
              Le questionnaire n'a pas encore été renseigné par l'apprenant.
            </p>
          )}
        </Card>

        {isCompany && (
          <Card title="Questionnaire des attentes du commanditaire">
            {detail.sponsor_survey ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="success">Répondu le {formatDate(detail.sponsor_survey.submitted_at)}</Badge>
                  {detail.sponsor_survey.trainee_count && (
                    <Badge tone="info">{detail.sponsor_survey.trainee_count} salarié{detail.sponsor_survey.trainee_count > 1 ? 's' : ''} concerné{detail.sponsor_survey.trainee_count > 1 ? 's' : ''}</Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenSurvey('sponsor')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: '#005064', color: 'white', ...headingFont }}>
                  <Eye className="w-4 h-4" />
                  Voir les réponses du questionnaire
                </button>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
                Le questionnaire n'a pas encore été renseigné par l'entreprise.
              </p>
            )}
          </Card>
        )}

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

      {openSurvey === 'needs' && na && (
        <NeedsAnalysisModal detail={detail} onClose={() => setOpenSurvey(null)} />
      )}
      {openSurvey === 'sponsor' && detail.sponsor_survey && (
        <SponsorSurveyModal detail={detail} onClose={() => setOpenSurvey(null)} />
      )}
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
                    {item.applicant_type === 'COMPANY' ? (
                      item.has_sponsor_survey ? (
                        <Badge tone="success">Commanditaire — répondu</Badge>
                      ) : (
                        <Badge>Non répondu</Badge>
                      )
                    ) : item.has_needs_analysis ? (
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
