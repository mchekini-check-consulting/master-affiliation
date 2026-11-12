import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSatisfactionContext, submitSatisfaction } from '@/api/backend';
import { getSatisfactionKind } from '@/data/satisfactionData';
import PrimaryButton from '@/components/ui/primary-button';

// Page publique de réponse aux questionnaires de satisfaction. Le lien emailé
// porte l'UUID de l'invitation ; le type de questionnaire vient du serveur et
// les questions de src/data/satisfactionData.js.

const cardStyle = { background: 'white', border: '1px solid #dbebff' };

function Question({ q, value, onChange }) {
  return (
    <div className="rounded-lg p-5 sm:p-6" style={cardStyle}>
      <p className="font-semibold text-body-base mb-1" style={{ color: '#243037' }}>
        {q.label}
        {q.optional ? <span className="font-normal text-body-sm" style={{ color: '#5f6568' }}> (facultatif)</span> : null}
      </p>
      {q.hint && <p className="text-body-sm mb-2" style={{ color: '#5f6568' }}>{q.hint}</p>}

      {q.type === 'radio' && (
        <div className="space-y-2 mt-3">
          {q.options.map((opt) => (
            <label key={opt} className="flex items-start gap-2.5 cursor-pointer text-body-base" style={{ color: '#243037' }}>
              <input type="radio" name={q.key} className="mt-1" checked={value === opt} onChange={() => onChange(opt)} />
              {opt}
            </label>
          ))}
        </div>
      )}

      {q.type === 'checkboxes' && (
        <div className="space-y-2 mt-3">
          {q.options.map((opt) => {
            const list = Array.isArray(value) ? value : [];
            const checked = list.includes(opt);
            return (
              <label key={opt} className="flex items-start gap-2.5 cursor-pointer text-body-base" style={{ color: '#243037' }}>
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() => onChange(checked ? list.filter((o) => o !== opt) : [...list, opt])} />
                {opt}
              </label>
            );
          })}
        </div>
      )}

      {q.type === 'scale' && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="w-11 h-11 rounded-lg font-semibold"
              style={value === n
                ? { background: '#002d74', color: 'white' }
                : { background: '#f0f7ff', color: '#002d74', border: '1px solid #dbebff' }}>
              {n}
            </button>
          ))}
        </div>
      )}

      {q.type === 'text' && (
        <textarea
          rows={4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-3 rounded-lg border px-4 py-3 text-body-base outline-none"
          style={{ borderColor: '#dbebff', color: '#243037' }} />
      )}
    </div>
  );
}

export default function Satisfaction() {
  const { responseId } = useParams();
  const [context, setContext] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Questionnaire de satisfaction — Hi-Tech Academy';
    getSatisfactionContext(responseId).then(setContext).catch((e) => setError(e.message));
  }, [responseId]);

  const kind = context ? getSatisfactionKind(context.kind) : null;

  const submit = async (e) => {
    e.preventDefault();
    const missing = kind.questions.filter((q) => {
      if (q.optional) return false;
      const v = answers[q.key];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (missing.length) {
      setError('Merci de répondre à toutes les questions obligatoires avant d\'envoyer.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitSatisfaction(responseId, answers);
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <div className="min-h-screen" style={{ background: '#f0f7ff' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="font-bold text-h3 mb-8" style={{ color: '#002d74' }}>HI-TECH ACADEMY</p>
        {children}
      </div>
    </div>
  );

  if (error && !context) {
    return shell(<p className="text-body-base" style={{ color: '#a12626' }}>{error}</p>);
  }
  if (!context) {
    return shell(<p className="text-body-base" style={{ color: '#5f6568' }}>Chargement…</p>);
  }

  if (done || context.submitted) {
    return shell(
      <div className="rounded-lg p-8 text-center" style={cardStyle}>
        <h1 className="text-h2 font-bold mb-3" style={{ color: '#243037' }}>Merci !</h1>
        <p className="text-body-base measure mx-auto" style={{ color: '#5f6568' }}>
          {done
            ? 'Votre questionnaire a bien été enregistré. Merci d\'avoir pris le temps de répondre : vos retours nous permettent d\'améliorer la qualité de nos prestations.'
            : 'Ce questionnaire a déjà été renseigné. Merci pour votre participation !'}
        </p>
      </div>,
    );
  }

  return shell(
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg p-6 sm:p-8" style={cardStyle}>
        <h1 className="text-h2 font-bold mb-2" style={{ color: '#243037' }}>{kind.title}</h1>
        <p className="text-body-sm mb-4" style={{ color: '#5f6568' }}>
          {context.recipient_name} — Formation « {context.formation_title} »
        </p>
        <p className="text-body-base whitespace-pre-line measure" style={{ color: '#243037' }}>{kind.intro}</p>
      </div>

      {error && (
        <p className="text-body-sm rounded-lg px-4 py-3" style={{ background: '#fdecec', color: '#a12626' }}>{error}</p>
      )}

      {kind.questions.map((q) => (
        <Question key={q.key} q={q} value={answers[q.key]} onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} />
      ))}

      <div className="pt-2 pb-10">
        <PrimaryButton type="submit" disabled={submitting} block>
          {submitting ? 'Envoi…' : 'Envoyer mes réponses'}
        </PrimaryButton>
      </div>
    </form>,
  );
}
