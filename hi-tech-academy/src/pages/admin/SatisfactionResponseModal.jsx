import React, { useEffect, useState } from 'react';
import { adminGetSatisfactionResponse } from '@/api/backend';
import { getSatisfactionKind } from '@/data/satisfactionData';
import SurveyModal, { Answer } from '@/pages/admin/SurveyModal';
import { bodyFont } from '@/pages/admin/common';

/**
 * Visualisation d'une réponse à un questionnaire de satisfaction : les
 * réponses brutes (JSON clé → valeur) sont réassociées aux questions de
 * src/data/satisfactionData.js.
 */
export default function SatisfactionResponseModal({ auth, responseId, onClose }) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetSatisfactionResponse(auth, responseId).then(setResponse).catch((e) => setError(e.message));
  }, [auth, responseId]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,26,74,0.35)' }} onClick={onClose}>
        <p className="rounded-xl px-5 py-4 text-sm" style={{ background: 'white', color: '#a12626', ...bodyFont }}>{error}</p>
      </div>
    );
  }
  if (!response) return null;

  const kind = getSatisfactionKind(response.kind);
  const answers = response.answers ?? {};
  const format = (q) => {
    const v = answers[q.key];
    if (v === undefined || v === null || v === '') return null;
    if (Array.isArray(v)) return v.join('\n');
    if (q.type === 'scale') return `${v} / 10`;
    return String(v);
  };

  return (
    <SurveyModal
      title={kind?.label ?? response.kind}
      subtitle={`${response.recipient_name} (${response.recipient_email}) — ${response.formation_title}`}
      submittedAt={response.submitted_at}
      onClose={onClose}>
      {(kind?.questions ?? []).map((q) => (
        <Answer key={q.key} question={q.label} answer={format(q)} />
      ))}
    </SurveyModal>
  );
}
