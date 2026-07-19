import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Copy, Users } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRegistrationPublic, submitSponsorSurvey } from '@/api/backend';
import { SectionTitle, SelectField, Stepper, TextAreaField, TextField } from '@/pages/Inscription';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const FUNDING_OPTIONS = [
  'OPCO (Atlas ou autre)',
  "Fonds propres de l'entreprise",
  'Autre / à définir',
];

const emptyAnswers = {
  trainingReason: '',
  needOrigin: '',
  traineeCount: '',
  traineeProfiles: '',
  expectedSkills: '',
  successCriteria: '',
  applicationProject: '',
  planningConstraints: '',
  funding: '',
  needsAdaptation: false,
  adaptationDetails: '',
  comments: '',
};

// Questionnaire des attentes du commanditaire : rempli par l'entreprise qui
// inscrit ses salariés, obligatoire avant transmission de la demande.
export default function QuestionnaireCommanditaire() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    document.title = 'Questionnaire commanditaire — Hi-Tech Academy';
    getRegistrationPublic(requestId)
      .then(setRegistration)
      .catch((e) => setLoadError(e.status === 404 ? "Demande d'inscription introuvable." : e.message));
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [requestId]);

  // Ce questionnaire est réservé aux demandes d'entreprise ; les autres
  // profils répondent à l'analyse du besoin.
  useEffect(() => {
    if (registration && registration.applicant_type !== 'COMPANY') {
      navigate(`/inscription/demande/${requestId}/questionnaire`, { replace: true });
    }
  }, [registration, requestId, navigate]);

  const set = (field) => (value) => setAnswers((a) => ({ ...a, [field]: value }));

  const missing = useMemo(() => {
    const list = [];
    if (!answers.trainingReason.trim()) list.push('Contexte et objectif de la formation');
    if (!answers.traineeCount || Number(answers.traineeCount) < 1) list.push('Nombre de salariés concernés');
    if (!answers.expectedSkills.trim()) list.push('Compétences attendues');
    return list;
  }, [answers]);

  const submit = async () => {
    if (missing.length > 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const clean = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);
      await submitSponsorSurvey(requestId, {
        training_reason: answers.trainingReason.trim(),
        need_origin: clean(answers.needOrigin),
        trainee_count: Number(answers.traineeCount),
        trainee_profiles: clean(answers.traineeProfiles),
        expected_skills: answers.expectedSkills.trim(),
        success_criteria: clean(answers.successCriteria),
        application_project: clean(answers.applicationProject),
        planning_constraints: clean(answers.planningConstraints),
        funding: clean(answers.funding),
        needs_adaptation: answers.needsAdaptation,
        adaptation_details: answers.needsAdaptation ? clean(answers.adaptationDetails) : null,
        comments: clean(answers.comments),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (content) => (
    <div className="min-h-screen" style={{ background: '#f7f9fd' }}>
      <TopBar />
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">{content}</div>
      </main>
      <Footer />
    </div>
  );

  if (loadError) {
    return shell(
      <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <p className="mb-4" style={{ color: '#001a4a', ...headingFont }}>{loadError}</p>
        <Link to="/" className="underline text-sm" style={{ color: '#005064', ...bodyFont }}>Retour à l'accueil</Link>
      </div>
    );
  }

  if (!registration) {
    return shell(
      <p className="text-center text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>
    );
  }

  if (submitted || registration.has_sponsor_survey) {
    const traineeLink = `${window.location.origin}/inscription/demande/${requestId}/apprenant`;
    const copyTraineeLink = async () => {
      try {
        await navigator.clipboard.writeText(traineeLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      } catch { /* clipboard indisponible : le lien reste sélectionnable */ }
    };

    return shell(
      <>
        <Stepper current={1} />
        <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#005064' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
            Votre demande a bien été envoyée
          </h1>
          <p className="text-sm mb-2" style={{ color: '#6b7a9b', ...bodyFont }}>
            {submitted
              ? 'Merci, vos réponses au questionnaire ont bien été enregistrées.'
              : 'Le questionnaire a déjà été renseigné pour cette demande.'}
          </p>
          <p className="text-sm mb-6" style={{ color: '#6b7a9b', ...bodyFont }}>
            La demande d'inscription de <strong>{registration.company_name}</strong> à la formation{' '}
            <strong>{registration.formation_title}</strong> est maintenant transmise et en attente de
            validation. Nous revenons vers vous sous 24 h ouvrées.
          </p>

          {/* Lien à partager aux salariés : chacun remplit son analyse du besoin */}
          <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: '#f0f3fa', border: '1px solid #e0e8f4' }}>
            <p className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: '#001a4a', ...headingFont }}>
              <Users className="w-4 h-4" style={{ color: '#005064' }} />
              Dernière chose : le questionnaire de vos salariés
            </p>
            <p className="text-sm mb-3" style={{ color: '#6b7a9b', ...bodyFont }}>
              Chaque salarié inscrit doit remplir son propre questionnaire d'analyse du besoin
              (niveau de départ, attentes — 5 minutes). Transmettez-leur ce lien :
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code
                className="flex-1 min-w-0 truncate text-xs px-3 py-2.5 rounded-lg"
                style={{ background: 'white', color: '#005064', border: '1px solid #e0e8f4' }}>
                {traineeLink}
              </code>
              <button
                type="button"
                onClick={copyTraineeLink}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold shrink-0"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                <Copy className="w-4 h-4" />
                {linkCopied ? 'Copié !' : 'Copier le lien'}
              </button>
            </div>
            {registration.trainees_count > 0 && (
              <p className="text-xs mt-3" style={{ color: '#116632', ...bodyFont }}>
                ✓ {registration.trainees_count} salarié{registration.trainees_count > 1 ? 's ont' : ' a'} déjà répondu.
              </p>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: '#005064', ...headingFont }}>
            Retour à l'accueil
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </>
    );
  }

  return shell(
    <>
      <div className="text-center mb-8">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
          style={{ color: '#002d74', ...headingFont }}>
          {registration.formation_title}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#001a4a', ...headingFont }}>
          Vos attentes en tant que commanditaire
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: '#6b7a9b', ...bodyFont }}>
          Vous inscrivez des salariés de <strong>{registration.company_name}</strong> à cette formation.
          Ce court questionnaire nous permet de comprendre vos attentes et d'adapter la session.
        </p>
      </div>

      <Stepper current={0} />

      <p
        className="text-sm rounded-xl px-4 py-3.5 mb-6"
        style={{ background: '#fdf3e2', color: '#8a5a00', ...bodyFont }}>
        <strong>Dernière étape obligatoire :</strong> votre demande d'inscription ne sera transmise
        qu'une fois ce questionnaire complété et envoyé.
      </p>

      <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid #e0e8f4' }}>

        <SectionTitle>1. Votre projet de formation</SectionTitle>
        <div className="space-y-4">
          <TextAreaField
            label="Dans quel contexte s'inscrit cette formation et quel objectif poursuivez-vous ? *"
            placeholder="Ex : montée en compétences de l'équipe avant la migration de nos applications vers Kubernetes…"
            value={answers.trainingReason}
            onChange={set('trainingReason')} />
          <TextAreaField
            label="Comment ce besoin de formation a-t-il été identifié ?"
            placeholder="Ex : entretiens annuels, plan de développement des compétences, nouveau projet, évolution technologique…"
            value={answers.needOrigin}
            onChange={set('needOrigin')} />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label="Nombre de salariés concernés"
              required
              type="number"
              value={answers.traineeCount}
              onChange={set('traineeCount')} />
            <TextField
              label="Profils / fonctions des salariés"
              placeholder="Ex : développeurs backend, ingénieurs DevOps…"
              value={answers.traineeProfiles}
              onChange={set('traineeProfiles')} />
          </div>
        </div>

        <SectionTitle>2. Vos attentes</SectionTitle>
        <div className="space-y-4">
          <TextAreaField
            label="Quelles compétences vos salariés doivent-ils maîtriser à l'issue de la formation ? *"
            value={answers.expectedSkills}
            onChange={set('expectedSkills')} />
          <TextAreaField
            label="À quoi jugerez-vous que la formation est une réussite pour l'entreprise ?"
            value={answers.successCriteria}
            onChange={set('successCriteria')} />
          <TextAreaField
            label="Y a-t-il un projet concret sur lequel les acquis seront appliqués après la formation ?"
            value={answers.applicationProject}
            onChange={set('applicationProject')} />
        </div>

        <SectionTitle>3. Organisation et financement</SectionTitle>
        <div className="space-y-4">
          <TextAreaField
            label="Contraintes de planning ou d'organisation (périodes à éviter, disponibilité des équipes…)"
            value={answers.planningConstraints}
            onChange={set('planningConstraints')} />
          <SelectField
            label="Mode de financement envisagé"
            value={answers.funding}
            onChange={set('funding')}
            options={FUNDING_OPTIONS} />
          <label className="flex items-start gap-2.5 text-sm cursor-pointer" style={{ color: '#001a4a', ...bodyFont }}>
            <input
              type="checkbox"
              checked={answers.needsAdaptation}
              onChange={(e) => set('needsAdaptation')(e.target.checked)}
              className="mt-0.5 accent-[#005064]" />
            Un ou plusieurs salariés sont en situation de handicap nécessitant un aménagement
          </label>
          {answers.needsAdaptation && (
            <TextAreaField
              label="Précisez les besoins d'aménagement"
              value={answers.adaptationDetails}
              onChange={set('adaptationDetails')} />
          )}
          <TextAreaField
            label="Autres remarques ou attentes"
            value={answers.comments}
            onChange={set('comments')} />
        </div>

        <div className="mt-8">
          {missing.length > 0 && (
            <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdf3e2', color: '#8a5a00', ...bodyFont }}>
              <strong>Champs manquants :</strong> {missing.join(', ')}
            </p>
          )}
          {submitError && (
            <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
              {submitError}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={missing.length > 0 || submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            {submitting ? 'Envoi en cours…' : 'Envoyer mes réponses et transmettre ma demande'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
