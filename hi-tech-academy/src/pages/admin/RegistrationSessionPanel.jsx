import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Eye, Send } from 'lucide-react';
import { adminRegistrationSessionInfo, adminSendSatisfaction } from '@/api/backend';
import { SATISFACTION_KINDS } from '@/data/satisfactionData';
import SatisfactionResponseModal from '@/pages/admin/SatisfactionResponseModal';
import { Badge, Card, bodyFont, formatDay, headingFont } from '@/pages/admin/common';

/**
 * Détail d'une demande : session de formation à laquelle elle est rattachée et
 * suivi des trois questionnaires de satisfaction (envoi individuel par
 * apprenant, visualisation des réponses). Les envois exigent une session
 * démarrée, comme dans l'onglet Sessions.
 */
export default function RegistrationSessionPanel({ auth, registrationId }) {
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    adminRegistrationSessionInfo(auth, registrationId).then(setInfo).catch((e) => setError(e.message));
  }, [auth, registrationId]);

  useEffect(load, [load]);

  if (!info) return null;
  const session = info.session;
  const started = session?.status === 'STARTED';

  const sendOne = async (r) => {
    const key = `${r.kind}:${r.trainee_id ?? ''}`;
    setBusy(key);
    setError(null);
    try {
      await adminSendSatisfaction(auth, session.id, r.kind, registrationId, r.trainee_id);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Session et satisfaction">
      {session ? (
        <p className="text-sm flex items-center gap-2" style={{ color: '#001a4a', ...bodyFont }}>
          <CalendarDays className="w-4 h-4 shrink-0" style={{ color: '#005064' }} />
          Session « {session.formation_title} » du {formatDay(session.start_date)} au {formatDay(session.end_date)}
          <span className="ml-1">
            {started ? <Badge tone="success">Démarrée</Badge> : <Badge>Planifiée</Badge>}
          </span>
        </p>
      ) : (
        <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
          Cette demande n'est rattachée à aucune session : faites-le depuis l'onglet Sessions.
        </p>
      )}

      {error && (
        <p className="text-xs mt-3 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>{error}</p>
      )}

      <div className="mt-4 space-y-2">
        {(info.recipients ?? []).map((r) => {
          const key = `${r.kind}:${r.trainee_id ?? ''}`;
          return (
            <div
              key={key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5"
              style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                  {SATISFACTION_KINDS[r.kind]?.label ?? r.kind}
                </p>
                <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{r.name} · {r.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {r.submitted_at ? (
                  <>
                    <Badge tone="success">Répondu le {formatDay(r.submitted_at)}</Badge>
                    <button
                      type="button"
                      onClick={() => setViewing(r.response_id)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: '#005064', ...headingFont }}>
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                  </>
                ) : (
                  <>
                    {r.invited_at ? <Badge tone="warning">Envoyé le {formatDay(r.invited_at)}</Badge> : <Badge>Non envoyé</Badge>}
                    <button
                      type="button"
                      disabled={!started || busy === key}
                      title={started ? undefined : 'Rattachez la demande à une session démarrée'}
                      onClick={() => sendOne(r)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-40"
                      style={{ color: '#005064', ...headingFont }}>
                      <Send className="w-4 h-4" />
                      {busy === key ? 'Envoi…' : r.invited_at ? 'Renvoyer' : 'Envoyer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {viewing && (
        <SatisfactionResponseModal auth={auth} responseId={viewing} onClose={() => setViewing(null)} />
      )}
    </Card>
  );
}
