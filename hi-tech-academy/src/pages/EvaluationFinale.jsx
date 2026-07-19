import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  getFinalEvaluationContent,
  getRegistrationPublic,
  submitFinalEvaluation,
  submitTraineeFinalEvaluation,
} from '@/api/backend';
import { SectionTitle } from '@/pages/Inscription';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// QCM d'évaluation finale : accessible via le lien envoyé par email par
// l'organisme (une seule tentative, corrigé côté serveur). La partie
// « mise en pratique » est évaluée par le formateur pendant la session.
export default function EvaluationFinale() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const traineeId = searchParams.get('trainee');

  const [registration, setRegistration] = useState(null);
  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null); // { score, max_score }

  useEffect(() => {
    document.title = 'Évaluation finale — Hi-Tech Academy';
    Promise.all([getRegistrationPublic(requestId), getFinalEvaluationContent()])
      .then(([reg, evalContent]) => {
        setRegistration(reg);
        setContent(evalContent);
      })
      .catch((e) => setLoadError(e.status === 404 ? 'Demande introuvable.' : e.message));
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [requestId]);

  const missing = useMemo(
    () => (content?.questions ?? []).filter((q) => answers[q.id] === undefined).map((q) => `Question ${q.id}`),
    [answers, content]
  );

  const submit = async () => {
    if (missing.length > 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = { answers: content.questions.map((q) => answers[q.id]) };
      const res = traineeId
        ? await submitTraineeFinalEvaluation(requestId, traineeId, payload)
        : await submitFinalEvaluation(requestId, payload);
      setResult(res);
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

  // Déjà passée (rechargement de la page après soumission)
  if (!traineeId && registration.final_evaluation_submitted && !result) {
    return shell(
      <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#005064' }} />
        <h1 className="text-2xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
          Cette évaluation a déjà été passée
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6b7a9b', ...bodyFont }}>
          Une seule tentative est autorisée. Le résultat sera reporté sur votre attestation de fin
          de formation.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: '#005064', ...headingFont }}>
          Retour à l'accueil
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (result) {
    return shell(
      <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#F8B102' }} />
        <h1 className="text-2xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
          Merci, votre évaluation est enregistrée
        </h1>
        <div
          className="inline-block px-6 py-3 rounded-2xl text-lg font-bold mb-4"
          style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
          Votre note au QCM : {result.score} / {result.max_score}
        </div>
        <p className="text-sm mb-6" style={{ color: '#6b7a9b', ...bodyFont }}>
          Ce résultat, complété par la mise en pratique évaluée par le formateur, sera reporté sur
          votre attestation de fin de formation.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: '#005064', ...headingFont }}>
          Retour à l'accueil
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
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
          Évaluation finale — QCM
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: '#6b7a9b', ...bodyFont }}>
          Ce QCM évalue les acquis de la formation ({content.questions.length} questions,
          <strong> une seule tentative</strong>). Le résultat est reporté sur votre attestation
          de fin de formation.
        </p>
      </div>

      <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <SectionTitle>Partie A — QCM ({content.questions.length} questions)</SectionTitle>
        <div className="space-y-6">
          {content.questions.map((q) => (
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
            {submitting ? 'Envoi en cours…' : 'Valider définitivement mes réponses'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
