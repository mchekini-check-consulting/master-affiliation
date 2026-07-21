import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Download, Eye, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  adminGetRegistration, adminListRegistrations, adminSendFinalEvaluation,
  adminSendFinalEvaluationCorrection, adminSendTraineeFinalEvaluation,
  adminSendTraineeFinalEvaluationCorrection, adminUpdateStatus,
} from '@/api/backend';
import { certificatePdfBlobUrl, downloadCertificatePdf } from '@/lib/certificatePdf';
import {
  buildFinalEvaluationCorrectionPdf, exportFinalEvaluationPdf, exportNeedsAnalysisPdf,
  exportPositioningTestPdf, exportSponsorSurveyPdf,
} from '@/lib/surveyPdf';
import PdfViewer from './PdfViewer';
import SurveyModal, { Answer, LevelAnswer, QcmAnswer, SurveySection } from './SurveyModal';
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
      onExportPdf={() => exportNeedsAnalysisPdf(na, {
        name: `${detail.first_name} ${detail.last_name}`,
        context: detail.company_name,
        formationTitle: detail.formation_title,
      })}
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

// --- Réponses du représentant de l'entreprise, grand format ------------
function SponsorSurveyModal({ detail, onClose }) {
  const s = detail.sponsor_survey;
  return (
    <SurveyModal
      title="Analyse du besoin — représentant de l'entreprise"
      subtitle={`${detail.company_name} — ${detail.formation_title}`}
      submittedAt={s.submitted_at}
      onExportPdf={() => exportSponsorSurveyPdf(s, {
        company: detail.company_name,
        formationTitle: detail.formation_title,
      })}
      onClose={onClose}>

      <SurveySection title="1. Le projet de formation">
        <Answer question="Contexte et objectif de la formation pour l'entreprise" answer={s.training_reason} />
        <Answer question="Comment le besoin de formation a été identifié" answer={s.need_origin} />
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

// --- Réponses d'un apprenant salarié, grand format ---------------------
function TraineeModal({ detail, trainee, onClose }) {
  return (
    <SurveyModal
      title={`Analyse du besoin — ${trainee.first_name} ${trainee.last_name}`}
      subtitle={`Salarié de ${detail.company_name} — ${detail.formation_title}`}
      submittedAt={trainee.submitted_at}
      onExportPdf={() => exportNeedsAnalysisPdf(trainee, {
        name: `${trainee.first_name} ${trainee.last_name}`,
        context: `Salarié de ${detail.company_name}`,
        formationTitle: detail.formation_title,
      })}
      badge={
        <span
          className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#F8B102', color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Note de positionnement : {trainee.score} / {trainee.max_score}
        </span>
      }
      onClose={onClose}>

      <SurveySection title="1. Identité">
        <Answer question="Nom et prénom" answer={`${trainee.first_name} ${trainee.last_name}`} />
        <Answer question="Adresse email" answer={trainee.email} />
        <Answer question="Poste occupé" answer={trainee.job_title} />
      </SurveySection>

      <SurveySection title="2. Contexte et besoin">
        <Answer question="Activité et environnement technique actuel" answer={trainee.activity_context} />
        <Answer question="Besoin / problème que la formation doit aider à résoudre" answer={trainee.problem_to_solve} />
        <Answer question="Attentes personnelles vis-à-vis de la formation" answer={trainee.expected_objectives} />
      </SurveySection>

      <SurveySection title="3. Niveau de départ (auto-évaluation)">
        <LevelAnswer
          question="Linux (ligne de commande)"
          options={['Débutant', 'Intermédiaire', 'Confirmé']}
          value={trainee.level_linux} />
        <LevelAnswer
          question="Docker / conteneurs"
          options={['Débutant', 'Intermédiaire', 'Confirmé']}
          value={trainee.level_docker} />
        <LevelAnswer
          question="Kubernetes"
          options={['Aucune notion', 'Notions', 'Déjà utilisé']}
          value={trainee.level_kubernetes} />
      </SurveySection>

      <SurveySection title="4. Attentes et besoins spécifiques">
        <Answer question="Cas d'usage précis à traiter pendant la formation" answer={trainee.specific_use_case} />
        <Answer question="Situation de handicap nécessitant un aménagement" answer={trainee.needs_adaptation} />
        {trainee.needs_adaptation && (
          <Answer question="Besoins d'aménagement précisés" answer={trainee.adaptation_details} />
        )}
      </SurveySection>

      <SurveySection title="5. Contraintes">
        <Answer question="Contraintes de planning" answer={trainee.planning_constraints} />
      </SurveySection>
    </SurveyModal>
  );
}

// --- Détail d'une demande --------------------------------------------
export function RegistrationDetail({ auth, id, onBack, onStatusChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [openSurvey, setOpenSurvey] = useState(null); // 'needs' | 'sponsor' | 'test' | 'finalEval' | null
  const [openTrainee, setOpenTrainee] = useState(null); // analyse du besoin d'un salarié
  const [openTraineeTest, setOpenTraineeTest] = useState(null); // test d'un salarié
  const [openTraineeFinalEval, setOpenTraineeFinalEval] = useState(null); // évaluation finale d'un salarié
  const [sendingEval, setSendingEval] = useState(null); // 'self' | traineeId | null
  const [sendingCorrection, setSendingCorrection] = useState(null); // 'self' | traineeId | null
  const [correctionSentFor, setCorrectionSentFor] = useState(null); // clé envoyée avec succès
  const [certViewerOpen, setCertViewerOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Envoi (ou renvoi) du QCM d'évaluation finale par email
  const sendFinalEval = async (traineeId) => {
    setSendingEval(traineeId ?? 'self');
    setError(null);
    try {
      const updated = traineeId
        ? await adminSendTraineeFinalEvaluation(auth, id, traineeId)
        : await adminSendFinalEvaluation(auth, id);
      setDetail(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingEval(null);
    }
  };

  // Envoi en un clic du corrigé (PDF généré côté front) à l'apprenant
  const sendCorrection = async (traineeId, evaluation) => {
    const key = traineeId ?? 'self';
    setSendingCorrection(key);
    setError(null);
    try {
      const pdfBase64 = buildFinalEvaluationCorrectionPdf(evaluation, {
        formationTitle: detail.formation_title,
      });
      if (traineeId) {
        await adminSendTraineeFinalEvaluationCorrection(auth, id, traineeId, pdfBase64);
      } else {
        await adminSendFinalEvaluationCorrection(auth, id, pdfBase64);
      }
      setCorrectionSentFor(key);
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingCorrection(null);
    }
  };

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

  // COMPANY = entreprise inscrivant ses salariés (questionnaire représentant
  // + apprenants). L'indépendant a des infos entreprise mais reste l'apprenant :
  // il a sa propre analyse du besoin, pas de salariés.
  const isCompany = detail.applicant_type === 'COMPANY';
  const hasCompanyInfo = detail.applicant_type !== 'INDIVIDUAL';
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
        {hasCompanyInfo && (
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

        <Card title={
          isCompany
            ? "Référent de l'entreprise"
            : detail.applicant_type === 'INDEPENDENT'
              ? "Dirigeant (apprenant)"
              : 'Informations personnelles'
        }>
          <div className="space-y-3">
            <Field label="Civilité" value={detail.civility} />
            <Field label="Prénom" value={detail.first_name} />
            <Field label="Nom" value={detail.last_name} />
            <Field label="Adresse email" value={detail.email} />
            <Field label="N° de téléphone" value={detail.phone} />
            <Field label="Fonction" value={detail.job_title} />
            {!hasCompanyInfo && <Field label="Adresse" value={address} />}
            <Field label="Notes complémentaires" value={detail.notes} />
          </div>
        </Card>

        {!hasCompanyInfo && (
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

        {!isCompany && (
          <Card title={
            detail.applicant_type === 'INDEPENDENT'
              ? "Analyse du besoin — dirigeant (apprenant)"
              : "Analyse du besoin — apprenant"
          }>
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
        )}

        {!isCompany && (
          <Card title={
            detail.applicant_type === 'INDEPENDENT'
              ? "Test de positionnement — dirigeant (apprenant)"
              : "Test de positionnement — apprenant"
          }>
            {detail.positioning_test ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-xl px-4 py-2.5 text-sm font-bold inline-block"
                    style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                    Note : {detail.positioning_test.score} / {detail.positioning_test.max_score}
                  </span>
                  <Badge tone="success">Passé le {formatDate(detail.positioning_test.submitted_at)}</Badge>
                </div>
                {detail.positioning_test.self_level && (
                  <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                    Auto-évaluation : {detail.positioning_test.self_level}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setOpenSurvey('test')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: '#005064', color: 'white', ...headingFont }}>
                  <Eye className="w-4 h-4" />
                  Voir les réponses du test
                </button>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
                Le test n'a pas encore été passé par l'apprenant.
              </p>
            )}
          </Card>
        )}

        {!isCompany && (
          <Card title="Évaluation finale (QCM)">
            <div className="space-y-3">
              <FinalEvaluationStatus
                evaluation={detail.final_evaluation}
                canSend={detail.status === 'VALIDATED'}
                sending={sendingEval === 'self'}
                onSend={() => sendFinalEval(null)}
                onView={() => setOpenSurvey('finalEval')}
                onSendCorrection={() => sendCorrection(null, detail.final_evaluation)}
                sendingCorrection={sendingCorrection === 'self'}
                correctionSent={correctionSentFor === 'self'} />
              {detail.final_evaluation?.submitted_at && (
                <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                  Passée le {formatDate(detail.final_evaluation.submitted_at)} — la partie mise en
                  pratique est évaluée par le formateur.
                </p>
              )}
            </div>
          </Card>
        )}

        {isCompany && (
          <Card title="Analyse du besoin — représentant de l'entreprise">
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

        {isCompany && (
          <Card title="Apprenants (salariés) — analyses du besoin individuelles" className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge tone={detail.trainees.length > 0 ? 'success' : 'warning'}>
                {detail.trainees.length}
                {detail.sponsor_survey?.trainee_count ? ` / ${detail.sponsor_survey.trainee_count}` : ''} salarié{detail.trainees.length > 1 ? 's ont' : ' a'} répondu
              </Badge>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`${window.location.origin}/inscription/demande/${detail.id}/apprenant`);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 3000);
                  } catch { /* clipboard indisponible */ }
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: '#005064', ...headingFont }}>
                <Copy className="w-4 h-4" />
                {linkCopied ? 'Lien copié !' : 'Copier le lien du questionnaire salarié'}
              </button>
            </div>

            {detail.trainees.length === 0 ? (
              <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
                Aucun salarié n'a encore rempli son questionnaire — partagez le lien ci-dessus à l'entreprise.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                    {['Salarié', 'Poste', 'Analyse du besoin', 'Test de positionnement', 'Évaluation finale', ''].map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-[11px] uppercase tracking-wide font-semibold"
                        style={{ color: '#6b7a9b', ...headingFont }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.trainees.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                          {t.first_name} {t.last_name}
                          {t.needs_adaptation && (
                            <span className="ml-2 align-middle"><Badge tone="warning">Aménagement</Badge></span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{t.email}</p>
                      </td>
                      <td className="px-3 py-3 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                        {t.job_title || '—'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2">
                          <Badge tone="info">{t.score}/{t.max_score}</Badge>
                          <button
                            type="button"
                            onClick={() => setOpenTrainee(t)}
                            className="inline-flex items-center gap-1 text-sm font-semibold"
                            style={{ color: '#005064', ...headingFont }}>
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {t.positioning_test ? (
                          <span className="inline-flex items-center gap-2">
                            <Badge tone="info">{t.positioning_test.score}/{t.positioning_test.max_score}</Badge>
                            <button
                              type="button"
                              onClick={() => setOpenTraineeTest(t)}
                              className="inline-flex items-center gap-1 text-sm font-semibold"
                              style={{ color: '#005064', ...headingFont }}>
                              <Eye className="w-4 h-4" />
                              Voir
                            </button>
                          </span>
                        ) : (
                          <Badge>Non passé</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <FinalEvaluationStatus
                          evaluation={t.final_evaluation}
                          canSend={detail.status === 'VALIDATED'}
                          sending={sendingEval === t.id}
                          onSend={() => sendFinalEval(t.id)}
                          onView={() => setOpenTraineeFinalEval(t)}
                          onSendCorrection={() => sendCorrection(t.id, t.final_evaluation)}
                          sendingCorrection={sendingCorrection === t.id}
                          correctionSent={correctionSentFor === t.id}
                          compact />
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap text-right" style={{ color: '#6b7a9b', ...bodyFont }}>
                        {formatDate(t.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        <Card title="Certificat de réalisation">
          {certificate ? (
            <div className="space-y-3">
              <Field label="Émis le" value={formatDate(certificate.issued_at)} />
              <Field
                label="Session"
                value={`du ${formatDay(certificate.session_start_date)} au ${formatDay(certificate.session_end_date)} — ${certificate.duration_hours} h${certificate.attended_hours != null ? ` (réalisées : ${certificate.attended_hours} h)` : ''}`} />
              {certificate.total_score !== null && certificate.total_score !== undefined && (
                <Field
                  label="Évaluation des acquis"
                  value={`QCM ${certificate.qcm_score}/10 · Pratique ${certificate.practical_score}/10 · Total ${certificate.total_score}/20 — objectifs ${certificate.objectives_achieved ? 'atteints' : 'non atteints'}`} />
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCertViewerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: '#005064', color: 'white', ...headingFont }}>
                  <Eye className="w-4 h-4" />
                  Visualiser le PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadCertificatePdf(certificate)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: '#f0f3fa', color: '#005064', border: '1.5px solid #005064', ...headingFont }}>
                  <Download className="w-4 h-4" />
                  Télécharger le PDF
                </button>
              </div>
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
      {openSurvey === 'test' && detail.positioning_test && (
        <PositioningTestModal
          test={detail.positioning_test}
          subjectName={`${detail.first_name} ${detail.last_name}`}
          formationTitle={detail.formation_title}
          onClose={() => setOpenSurvey(null)} />
      )}
      {openTrainee && (
        <TraineeModal detail={detail} trainee={openTrainee} onClose={() => setOpenTrainee(null)} />
      )}
      {openTraineeTest?.positioning_test && (
        <PositioningTestModal
          test={openTraineeTest.positioning_test}
          subjectName={`${openTraineeTest.first_name} ${openTraineeTest.last_name} (salarié de ${detail.company_name})`}
          formationTitle={detail.formation_title}
          onClose={() => setOpenTraineeTest(null)} />
      )}
      {openSurvey === 'finalEval' && detail.final_evaluation?.questions && (
        <FinalEvaluationModal
          evaluation={detail.final_evaluation}
          subjectName={`${detail.first_name} ${detail.last_name}`}
          formationTitle={detail.formation_title}
          onClose={() => setOpenSurvey(null)} />
      )}
      {openTraineeFinalEval?.final_evaluation?.questions && (
        <FinalEvaluationModal
          evaluation={openTraineeFinalEval.final_evaluation}
          subjectName={`${openTraineeFinalEval.first_name} ${openTraineeFinalEval.last_name} (salarié de ${detail.company_name})`}
          formationTitle={detail.formation_title}
          onClose={() => setOpenTraineeFinalEval(null)} />
      )}
      {certViewerOpen && certificate && (
        <PdfViewer
          title={`Certificat de réalisation — ${certificate.first_name} ${certificate.last_name}`}
          url={certificatePdfBlobUrl(certificate)}
          onDownload={() => downloadCertificatePdf(certificate)}
          onClose={() => setCertViewerOpen(false)} />
      )}
    </div>
  );
}

// --- Réponses au test de positionnement, grand format ------------------
// subjectName : demandeur (particulier / indépendant) ou salarié
function PositioningTestModal({ test, subjectName, formationTitle, onClose }) {
  const sections = test.questions.reduce((acc, q) => {
    (acc[q.section] = acc[q.section] ?? []).push(q);
    return acc;
  }, {});
  return (
    <SurveyModal
      title={`Test de positionnement — ${subjectName}`}
      subtitle={formationTitle}
      submittedAt={test.submitted_at}
      onExportPdf={() => exportPositioningTestPdf(test, { name: subjectName, formationTitle })}
      badge={
        <span
          className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#F8B102', color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Note : {test.score} / {test.max_score}
        </span>
      }
      onClose={onClose}>

      <SurveySection title="A. Auto-évaluation Kubernetes">
        <Answer question="Maîtrise actuelle de Kubernetes (déclarée)" answer={test.self_level} />
      </SurveySection>

      {Object.entries(sections).map(([sectionTitle, questions]) => (
        <SurveySection key={sectionTitle} title={sectionTitle}>
          {questions.map((q) => (
            <QcmAnswer key={q.id} item={q} />
          ))}
        </SurveySection>
      ))}

      <SurveySection title="D. Connaissances Kubernetes (facultatif)">
        <Answer question="Selon vous, à quoi sert Kubernetes ?" answer={test.kubernetes_purpose} />
        <Answer
          question="Termes connus"
          answer={test.known_terms?.length ? test.known_terms.join(', ') : null} />
      </SurveySection>

      <SurveySection title="E. Attentes">
        <Answer question="Cas d'usage ou objectif précis pour cette formation" answer={test.expectations} />
      </SurveySection>
    </SurveyModal>
  );
}

// --- Résultats de l'évaluation finale, grand format --------------------
function FinalEvaluationModal({ evaluation, subjectName, formationTitle, onClose }) {
  return (
    <SurveyModal
      title={`Évaluation finale — ${subjectName}`}
      subtitle={formationTitle}
      submittedAt={evaluation.submitted_at}
      onExportPdf={() => exportFinalEvaluationPdf(evaluation, { name: subjectName, formationTitle })}
      badge={
        <span
          className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#F8B102', color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Note au QCM : {evaluation.score} / {evaluation.max_score}
        </span>
      }
      onClose={onClose}>
      <SurveySection title={`Partie A — QCM (${evaluation.questions.length} questions)`}>
        {evaluation.questions.map((q) => (
          <QcmAnswer key={q.id} item={q} />
        ))}
      </SurveySection>
      <p className="text-xs mb-6" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
        La partie B (mise en pratique sur AKS) est évaluée par le formateur pendant la session ;
        le total /20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).
      </p>
    </SurveyModal>
  );
}

// État + actions d'une évaluation finale (carte demandeur ou ligne salarié)
function FinalEvaluationStatus({
  evaluation, canSend, sending, onSend, onView, compact = false,
  onSendCorrection, sendingCorrection, correctionSent,
}) {
  if (evaluation?.submitted_at) {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <Badge tone="info">{evaluation.score}/{evaluation.max_score}</Badge>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1 text-sm font-semibold"
          style={{ color: '#005064', ...headingFont }}>
          <Eye className="w-4 h-4" />
          Voir
        </button>
        {onSendCorrection && (correctionSent ? (
          <span
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: '#116632', ...headingFont }}>
            <CheckCircle2 className="w-4 h-4" />
            Corrigé envoyé
          </span>
        ) : (
          <button
            type="button"
            disabled={sendingCorrection}
            onClick={onSendCorrection}
            className="inline-flex items-center gap-1 text-sm font-semibold disabled:opacity-50"
            style={{ color: '#005064', ...headingFont }}>
            <Send className="w-4 h-4" />
            {sendingCorrection ? 'Envoi…' : (compact ? 'Corrigé' : 'Envoyer le corrigé')}
          </button>
        ))}
      </span>
    );
  }
  if (evaluation) {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <Badge tone="warning">Envoyée le {formatDay(evaluation.invited_at)}</Badge>
        <button
          type="button"
          disabled={sending}
          onClick={onSend}
          className="inline-flex items-center gap-1 text-sm font-semibold disabled:opacity-50"
          style={{ color: '#005064', ...headingFont }}>
          <Send className="w-4 h-4" />
          Renvoyer
        </button>
      </span>
    );
  }
  if (!canSend) {
    return <Badge>{compact ? '—' : 'Envoyable après validation de la demande'}</Badge>;
  }
  return (
    <button
      type="button"
      disabled={sending}
      onClick={onSend}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
      style={{ background: '#005064', color: 'white', ...headingFont }}>
      <Send className="w-4 h-4" />
      {sending ? 'Envoi…' : compact ? 'Envoyer' : 'Envoyer le quiz par email'}
    </button>
  );
}

// --- Liste des demandes ----------------------------------------------
export default function RequestsView({ auth, selectedId, onSelect, initialFormation }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formationFilter, setFormationFilter] = useState(initialFormation ?? 'ALL');
  const [reloadKey, setReloadKey] = useState(0);

  // La vue Formations peut ouvrir les demandes pré-filtrées sur une formation
  useEffect(() => {
    if (initialFormation) setFormationFilter(initialFormation);
  }, [initialFormation]);

  const load = useCallback(() => {
    setError(null);
    adminListRegistrations(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load, reloadKey]);

  const formations = useMemo(() => {
    const byId = new Map();
    for (const i of items ?? []) byId.set(i.formation_id, i.formation_title);
    return [...byId.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const filtered = useMemo(
    () => (items ?? []).filter((i) =>
      (statusFilter === 'ALL' || i.status === statusFilter) &&
      (formationFilter === 'ALL' || i.formation_id === formationFilter)),
    [items, statusFilter, formationFilter]
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

      <div className="flex flex-wrap items-center gap-2 mb-5">
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
        {formations.length > 1 && (
          <select
            value={formationFilter}
            onChange={(e) => setFormationFilter(e.target.value)}
            className="ml-auto px-3.5 py-1.5 rounded-full text-xs font-semibold outline-none"
            style={{ border: '1px solid #e0e8f4', background: 'white', color: '#005064', ...headingFont }}>
            <option value="ALL">Toutes les formations</option>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
        )}
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
                      <div className="flex flex-wrap gap-1.5">
                        {item.has_sponsor_survey ? (
                          <Badge tone="success">Représentant ✓</Badge>
                        ) : (
                          <Badge>Représentant : non répondu</Badge>
                        )}
                        <Badge tone={item.trainees_count > 0 ? 'success' : 'warning'}>
                          {item.trainees_count}{item.expected_trainees_count ? `/${item.expected_trainees_count}` : ''} salarié{item.trainees_count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ) : item.has_needs_analysis ? (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="success">AB {item.needs_analysis_score}/{item.needs_analysis_max_score}</Badge>
                        {item.positioning_test_score !== null && item.positioning_test_score !== undefined ? (
                          <Badge tone="success">Test {item.positioning_test_score}/{item.positioning_test_max_score}</Badge>
                        ) : (
                          <Badge>Test non passé</Badge>
                        )}
                      </div>
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
