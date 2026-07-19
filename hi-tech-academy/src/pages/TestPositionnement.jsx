import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  getPositioningTestContent,
  getRegistrationPublic,
  submitPositioningTest,
  submitTraineePositioningTest,
} from '@/api/backend';
import { SectionTitle, Stepper, TextAreaField } from '@/pages/Inscription';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Test de positionnement (document V1.0) : passé après l'analyse du besoin
// par le demandeur (particulier / indépendant) ou par chaque salarié
// (?trainee=<id> pour les demandes entreprise). Le QCM est corrigé côté
// serveur ; le test n'est pas éliminatoire.
export default function TestPositionnement() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const traineeId = searchParams.get('trainee');
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [selfLevel, setSelfLevel] = useState('');
  const [answers, setAnswers] = useState({});          // question id -> index choisi
  const [knownTerms, setKnownTerms] = useState([]);
  const [kubernetesPurpose, setKubernetesPurpose] = useState('');
  const [expectations, setExpectations] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Test de positionnement — Hi-Tech Academy';
    Promise.all([getRegistrationPublic(requestId), getPositioningTestContent()])
      .then(([reg, testContent]) => {
        setRegistration(reg);
        setContent(testContent);
      })
      .catch((e) => setLoadError(e.status === 404 ? "Demande d'inscription introuvable." : e.message));
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [requestId]);

  // Une entreprise (représentant) ne passe pas le test : seuls ses salariés
  // le font, via le lien avec ?trainee=
  useEffect(() => {
    if (registration && registration.applicant_type === 'COMPANY' && !traineeId) {
      navigate(`/inscription/demande/${requestId}/questionnaire-commanditaire`, { replace: true });
    }
  }, [registration, traineeId, requestId, navigate]);

  const isTrainee = Boolean(traineeId);

  const missing = useMemo(() => {
    const list = [];
    if (!selfLevel) list.push('Auto-évaluation Kubernetes');
    for (const q of content?.questions ?? []) {
      if (answers[q.id] === undefined) list.push(`Question ${q.id}`);
    }
    return list;
  }, [selfLevel, answers, content]);

  const toggleTerm = (term) =>
    setKnownTerms((terms) => (terms.includes(term) ? terms.filter((t) => t !== term) : [...terms, term]));

  const submit = async () => {
    if (missing.length > 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const clean = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);
      const payload = {
        self_level: selfLevel,
        answers: content.questions.map((q) => answers[q.id]),
        kubernetes_purpose: clean(kubernetesPurpose),
        known_terms: knownTerms,
        expectations: clean(expectations),
      };
      if (isTrainee) {
        await submitTraineePositioningTest(requestId, traineeId, payload);
      } else {
        await submitPositioningTest(requestId, payload);
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <div className="min-h-screen" style={{ background: '#f7f9fd' }}>
      <TopBar />
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">{children}</div>
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

  if (!registration || !content) {
    return shell(
      <p className="text-center text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>
    );
  }

  // Écran final — pour le demandeur : la demande est maintenant transmise ;
  // pour un salarié : simple confirmation.
  if (submitted || (!isTrainee && registration.has_positioning_test)) {
    return shell(
      <>
        {!isTrainee && <Stepper current={1} />}
        <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#005064' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
            {isTrainee ? 'Merci, votre test a bien été enregistré' : 'Votre demande a bien été envoyée'}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6b7a9b', ...bodyFont }}>
            {isTrainee ? (
              <>Vos réponses au questionnaire et au test de positionnement sont enregistrées : le
              formateur adaptera la session « <strong>{registration.formation_title}</strong> » en conséquence.
              Vous recevrez votre convocation avant le début de la formation.</>
            ) : (
              <>Merci d'avoir complété le questionnaire d'analyse du besoin et le test de positionnement.
              Votre demande d'inscription à la formation <strong>{registration.formation_title}</strong> est
              maintenant transmise et en attente de validation. Nous revenons vers vous sous 24 h ouvrées.</>
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isTrainee && (
              <Link
                to={`/inscription/demande/${requestId}/apprenant`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#f0f3fa', color: '#005064', border: '1.5px solid #005064', ...headingFont }}>
                <UserPlus className="w-4 h-4" />
                Questionnaire d'un autre salarié
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold"
              style={{ color: '#005064', ...headingFont }}>
              Retour à l'accueil
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Regroupe les questions par section (Prérequis Linux, Docker…)
  const sections = content.questions.reduce((acc, q) => {
    (acc[q.section] = acc[q.section] ?? []).push(q);
    return acc;
  }, {});

  return shell(
    <>
      <div className="text-center mb-8">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
          style={{ color: '#002d74', ...headingFont }}>
          {registration.formation_title}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#001a4a', ...headingFont }}>
          Test de positionnement
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: '#6b7a9b', ...bodyFont }}>
          Ce test vérifie vos prérequis (Linux, Docker), situe votre niveau de départ et permet
          d'adapter l'animation à vos besoins. <strong>Il n'est pas éliminatoire.</strong>
        </p>
      </div>

      {!isTrainee && <Stepper current={0} />}

      <p
        className="text-sm rounded-xl px-4 py-3.5 mb-6"
        style={{ background: '#fdf3e2', color: '#8a5a00', ...bodyFont }}>
        <strong>{isTrainee ? 'Étape 2/2 :' : 'Dernière étape obligatoire (2/2) :'}</strong>{' '}
        {isTrainee
          ? "après votre questionnaire d'analyse du besoin, ce test complète votre dossier."
          : "votre demande d'inscription ne sera transmise qu'une fois ce test complété et envoyé."}
      </p>

      <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid #e0e8f4' }}>

        <SectionTitle>A. Auto-évaluation</SectionTitle>
        <p className="text-sm font-semibold mb-2" style={{ color: '#001a4a', ...headingFont }}>
          Comment évaluez-vous votre maîtrise actuelle de Kubernetes ?
        </p>
        <div className="space-y-2">
          {content.self_levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelfLevel(level)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                border: selfLevel === level ? '1.5px solid #005064' : '1px solid #e0e8f4',
                background: selfLevel === level ? '#f0f3fa' : 'white',
                color: selfLevel === level ? '#005064' : '#6b7a9b',
                ...headingFont,
              }}>
              {level}
            </button>
          ))}
        </div>

        {Object.entries(sections).map(([sectionTitle, questions], sectionIndex) => (
          <React.Fragment key={sectionTitle}>
            <SectionTitle>{String.fromCharCode(66 + sectionIndex)}. {sectionTitle}</SectionTitle>
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#001a4a', ...headingFont }}>
                    {q.id}. {q.text}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: index }))}
                        className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          border: answers[q.id] === index ? '1.5px solid #005064' : '1px solid #e0e8f4',
                          background: answers[q.id] === index ? '#f0f3fa' : 'white',
                          color: answers[q.id] === index ? '#005064' : '#6b7a9b',
                          fontFamily: "'Inter', sans-serif",
                        }}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}

        <SectionTitle>D. Connaissances Kubernetes (facultatif)</SectionTitle>
        <div className="space-y-4">
          <TextAreaField
            label="Selon vous, à quoi sert Kubernetes ?"
            value={kubernetesPurpose}
            onChange={setKubernetesPurpose} />
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: '#001a4a', ...headingFont }}>
              Connaissez-vous l'un de ces termes ? (cochez)
            </p>
            <div className="flex flex-wrap gap-2">
              {content.known_terms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => toggleTerm(term)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    border: knownTerms.includes(term) ? '1.5px solid #005064' : '1px solid #e0e8f4',
                    background: knownTerms.includes(term) ? '#f0f3fa' : 'white',
                    color: knownTerms.includes(term) ? '#005064' : '#6b7a9b',
                    ...headingFont,
                  }}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SectionTitle>E. Vos attentes</SectionTitle>
        <TextAreaField
          label="Avez-vous un cas d'usage ou un objectif précis pour cette formation ?"
          value={expectations}
          onChange={setExpectations} />

        <div className="mt-8">
          {missing.length > 0 && (
            <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdf3e2', color: '#8a5a00', ...bodyFont }}>
              <strong>À compléter :</strong> {missing.join(', ')}
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
            {submitting
              ? 'Envoi en cours…'
              : isTrainee ? 'Envoyer mon test' : 'Envoyer mon test et transmettre ma demande'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
