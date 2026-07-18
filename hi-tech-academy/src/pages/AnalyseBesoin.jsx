import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRegistrationPublic, submitNeedsAnalysis } from '@/api/backend';
import { SectionTitle, Stepper, TextAreaField, TextField } from '@/pages/Inscription';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Niveaux d'auto-évaluation du questionnaire « Analyse du besoin – V1.0 »
const LEVELS = [
  { key: 'levelLinux', label: 'Linux (ligne de commande)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelDocker', label: 'Docker / conteneurs', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelKubernetes', label: 'Kubernetes', options: ['Aucune notion', 'Notions', 'Déjà utilisé'] },
];

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2" style={{ color: '#001a4a', ...headingFont }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              border: value === option ? '1.5px solid #005064' : '1px solid #e0e8f4',
              background: value === option ? '#f0f3fa' : 'white',
              color: value === option ? '#005064' : '#6b7a9b',
              ...headingFont,
            }}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const emptyAnswers = {
  companyRole: '',
  funder: '',
  activityContext: '',
  problemToSolve: '',
  expectedObjectives: '',
  levelLinux: '',
  levelDocker: '',
  levelKubernetes: '',
  specificUseCase: '',
  planningConstraints: '',
  needsAdaptation: false,
  adaptationDetails: '',
};

export default function AnalyseBesoin() {
  const { requestId } = useParams();

  const [registration, setRegistration] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Analyse du besoin — Hi-Tech Academy";
    getRegistrationPublic(requestId)
      .then(setRegistration)
      .catch((e) => setLoadError(e.status === 404 ? "Demande d'inscription introuvable." : e.message));
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [requestId]);

  const set = (field) => (value) => setAnswers((a) => ({ ...a, [field]: value }));

  const missing = useMemo(() => {
    const list = [];
    if (!answers.levelLinux) list.push('Niveau Linux');
    if (!answers.levelDocker) list.push('Niveau Docker');
    if (!answers.levelKubernetes) list.push('Niveau Kubernetes');
    return list;
  }, [answers]);

  const submit = async () => {
    if (missing.length > 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const clean = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);
      await submitNeedsAnalysis(requestId, {
        beneficiary_name: `${registration.first_name} ${registration.last_name}`,
        company_role: clean(answers.companyRole),
        funder: clean(answers.funder),
        activity_context: clean(answers.activityContext),
        problem_to_solve: clean(answers.problemToSolve),
        expected_objectives: clean(answers.expectedObjectives),
        level_linux: answers.levelLinux,
        level_docker: answers.levelDocker,
        level_kubernetes: answers.levelKubernetes,
        specific_use_case: clean(answers.specificUseCase),
        planning_constraints: clean(answers.planningConstraints),
        needs_adaptation: answers.needsAdaptation,
        adaptation_details: answers.needsAdaptation ? clean(answers.adaptationDetails) : null,
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

  if (submitted || registration.has_needs_analysis) {
    return shell(
      <>
        <Stepper current={1} />
        <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#005064' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
            {submitted ? 'Merci, vos réponses ont bien été enregistrées' : 'Ce questionnaire a déjà été renseigné'}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6b7a9b', ...bodyFont }}>
            Votre demande d'inscription à la formation <strong>{registration.formation_title}</strong> est
            en attente de validation. Nous revenons vers vous très rapidement.
          </p>
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
          Analyse du besoin
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: '#6b7a9b', ...bodyFont }}>
          À compléter avant la formation. Ce questionnaire recueille et analyse votre besoin, en lien
          avec votre entreprise et/ou votre financeur, afin de valider les objectifs et d'adapter la formation.
        </p>
      </div>

      <Stepper current={1} />

      <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid #e0e8f4' }}>

        <SectionTitle>1. Identité</SectionTitle>
        <div className="space-y-4">
          <TextField
            label="Nom et prénom du bénéficiaire"
            value={`${registration.first_name} ${registration.last_name}`}
            onChange={() => {}} />
          <TextField label="Entreprise / fonction" value={answers.companyRole} onChange={set('companyRole')}
            placeholder={registration.company_name || ''} />
          <TextField label="Financeur envisagé (OPCO Atlas / AGEFICE / autre)" value={answers.funder} onChange={set('funder')} />
        </div>

        <SectionTitle>2. Contexte et besoin</SectionTitle>
        <div className="space-y-4">
          <TextAreaField
            label="Décrivez votre activité et votre environnement technique actuel"
            value={answers.activityContext}
            onChange={set('activityContext')} />
          <TextAreaField
            label="Quel est le besoin / problème que la formation doit aider à résoudre ?"
            value={answers.problemToSolve}
            onChange={set('problemToSolve')} />
          <TextAreaField
            label="Objectifs attendus par l'entreprise à l'issue de la formation"
            value={answers.expectedObjectives}
            onChange={set('expectedObjectives')} />
        </div>

        <SectionTitle>3. Niveau de départ (auto-évaluation)</SectionTitle>
        <div className="space-y-5">
          {LEVELS.map(({ key, label, options }) => (
            <RadioGroup
              key={key}
              label={label}
              options={options}
              value={answers[key]}
              onChange={set(key)} />
          ))}
        </div>

        <SectionTitle>4. Attentes spécifiques</SectionTitle>
        <TextAreaField
          label="Avez-vous un cas d'usage précis à traiter pendant la formation ?"
          value={answers.specificUseCase}
          onChange={set('specificUseCase')} />

        <SectionTitle>5. Contraintes et accessibilité</SectionTitle>
        <div className="space-y-4">
          <TextAreaField label="Contraintes de planning" value={answers.planningConstraints} onChange={set('planningConstraints')} />
          <label className="flex items-start gap-2.5 text-sm cursor-pointer" style={{ color: '#001a4a', ...bodyFont }}>
            <input
              type="checkbox"
              checked={answers.needsAdaptation}
              onChange={(e) => set('needsAdaptation')(e.target.checked)}
              className="mt-0.5 accent-[#005064]" />
            Besoin d'aménagement lié à une situation de handicap
          </label>
          {answers.needsAdaptation && (
            <TextAreaField label="Précisez votre besoin d'aménagement" value={answers.adaptationDetails} onChange={set('adaptationDetails')} />
          )}
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
            {submitting ? 'Envoi en cours…' : 'Envoyer mes réponses'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
