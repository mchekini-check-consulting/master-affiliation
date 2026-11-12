import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Eye, Play, Plus, Send, Trash2, X } from 'lucide-react';
import {
  adminAttachToSession,
  adminCreateSession,
  adminDeleteSession,
  adminDetachFromSession,
  adminListRegistrations,
  adminListSessions,
  adminSendSatisfaction,
  adminSendSatisfactionAll,
  adminSessionRecipients,
  adminStartSession,
} from '@/api/backend';
import { formations } from '@/data/formations';
import { SATISFACTION_KINDS } from '@/data/satisfactionData';
import SatisfactionResponseModal from '@/pages/admin/SatisfactionResponseModal';
import { Badge, Card, EmptyState, ViewHeader, bodyFont, formatDate, formatDay, headingFont } from '@/pages/admin/common';

const inputClass = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-[#005064]';
const inputStyle = { borderColor: '#e0e8f4', color: '#001a4a', fontFamily: "'Inter', sans-serif" };
const labelClass = 'block text-xs font-semibold mb-1.5';
const labelStyle = { color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const KINDS = ['HOT_LEARNER', 'CLIENT', 'COLD_LEARNER'];

/** Bloc des trois questionnaires d'une session démarrée : envois et suivi. */
function RecipientsPanel({ auth, session, onError }) {
  const [recipients, setRecipients] = useState(null);
  const [busy, setBusy] = useState(null); // clé d'action en cours
  const [viewing, setViewing] = useState(null); // responseId

  const load = useCallback(() => {
    adminSessionRecipients(auth, session.id).then(setRecipients).catch((e) => onError(e.message));
  }, [auth, session.id, onError]);

  useEffect(load, [load]);

  const sendOne = async (r) => {
    const key = `${r.kind}:${r.registration_id}:${r.trainee_id ?? ''}`;
    setBusy(key);
    try {
      await adminSendSatisfaction(auth, session.id, r.kind, r.registration_id, r.trainee_id);
      load();
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const sendAllOf = async (kind) => {
    const pending = (recipients ?? []).filter((r) => r.kind === kind && !r.submitted_at);
    if (!pending.length) return;
    if (!window.confirm(`Envoyer « ${SATISFACTION_KINDS[kind].label} » par email à ${pending.length} destinataire(s) ?`)) return;
    setBusy(kind);
    try {
      setRecipients(await adminSendSatisfactionAll(auth, session.id, kind));
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (!recipients) {
    return <p className="text-sm mt-4" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement des destinataires…</p>;
  }

  return (
    <div className="mt-5 space-y-5">
      {KINDS.map((kind) => {
        const rows = recipients.filter((r) => r.kind === kind);
        if (!rows.length) return null;
        const answered = rows.filter((r) => r.submitted_at).length;
        return (
          <div key={kind} className="rounded-xl p-4" style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-sm font-bold" style={{ color: '#001a4a', ...headingFont }}>
                {SATISFACTION_KINDS[kind].label}
                <span className="font-normal text-xs ml-2" style={{ color: '#6b7a9b', ...bodyFont }}>
                  {answered}/{rows.length} réponse(s)
                </span>
              </p>
              <button
                type="button"
                disabled={busy === kind || rows.every((r) => r.submitted_at)}
                onClick={() => sendAllOf(kind)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                <Send className="w-3.5 h-3.5" />
                {busy === kind ? 'Envoi…' : 'Envoyer à tous'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: 640 }}>
                <tbody>
                  {rows.map((r) => {
                    const key = `${r.kind}:${r.registration_id}:${r.trainee_id ?? ''}`;
                    return (
                      <tr key={key} style={{ borderBottom: '1px solid #e0e8f4' }}>
                        <td className="py-2.5 pr-3">
                          <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>{r.name}</p>
                          <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{r.email} · {r.registration_label}</p>
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          {r.submitted_at ? (
                            <Badge tone="success">Répondu le {formatDay(r.submitted_at)}</Badge>
                          ) : r.invited_at ? (
                            <Badge tone="warning">Envoyé le {formatDay(r.invited_at)}</Badge>
                          ) : (
                            <Badge>Non envoyé</Badge>
                          )}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          {r.submitted_at ? (
                            <button
                              type="button"
                              onClick={() => setViewing(r.response_id)}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold"
                              style={{ color: '#005064', ...headingFont }}>
                              <Eye className="w-4 h-4" />
                              Voir la réponse
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy === key}
                              onClick={() => sendOne(r)}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-40"
                              style={{ color: '#005064', ...headingFont }}>
                              <Send className="w-4 h-4" />
                              {busy === key ? 'Envoi…' : r.invited_at ? 'Renvoyer' : 'Envoyer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {viewing && (
        <SatisfactionResponseModal auth={auth} responseId={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

export default function SessionsView({ auth }) {
  const [sessions, setSessions] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formationId, setFormationId] = useState(formations[0]?.id ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    Promise.all([adminListSessions(auth), adminListRegistrations(auth)])
      .then(([s, regs]) => {
        setSessions(s);
        setRegistrations(regs);
      })
      .catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load]);

  const patch = (updated) => setSessions((prev) => (prev ?? []).map((s) => (s.id === updated.id ? updated : s)));

  const create = async (e) => {
    e.preventDefault();
    setBusyId('create');
    setError(null);
    try {
      const formation = formations.find((f) => f.id === formationId);
      const created = await adminCreateSession(auth, {
        formation_id: formationId,
        formation_title: formation?.title ?? formationId,
        start_date: startDate,
        end_date: endDate,
      });
      setSessions((prev) => [created, ...(prev ?? [])]);
      setCreating(false);
      setStartDate('');
      setEndDate('');
      setExpanded(created.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const run = async (s, fn) => {
    setBusyId(s.id);
    setError(null);
    try {
      patch(await fn());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Supprimer la session « ${s.formation_title} » du ${formatDay(s.start_date)} ? Les demandes rattachées sont simplement détachées.`)) return;
    setBusyId(s.id);
    try {
      await adminDeleteSession(auth, s.id);
      setSessions((prev) => (prev ?? []).filter((x) => x.id !== s.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (error && !sessions) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!sessions) return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;

  const attachables = (s) => (registrations ?? []).filter(
    (r) => r.status === 'VALIDATED'
      && r.formation_id === s.formation_id
      && !s.registrations.some((x) => x.id === r.id),
  );

  return (
    <div>
      <ViewHeader
        title="Sessions de formation"
        subtitle="Rattachez les demandes validées à une session, démarrez-la, puis envoyez les questionnaires de satisfaction"
        actions={
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#005064', color: 'white', ...headingFont }}>
            <Plus className="w-4 h-4" />
            Nouvelle session
          </button>
        } />

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>{error}</p>
      )}

      {creating && (
        <Card className="mb-5">
          <form onSubmit={create} className="grid sm:grid-cols-[1fr_170px_170px_auto] gap-3 items-end">
            <label className="block">
              <span className={labelClass} style={labelStyle}>Formation</span>
              <select value={formationId} onChange={(e) => setFormationId(e.target.value)} className={inputClass} style={inputStyle}>
                {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass} style={labelStyle}>Début</span>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className={labelClass} style={labelStyle}>Fin</span>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} style={inputStyle} />
            </label>
            <button
              type="submit"
              disabled={busyId === 'create'}
              className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              Créer
            </button>
          </form>
        </Card>
      )}

      {sessions.length === 0 ? (
        <EmptyState>Aucune session. Créez-en une, rattachez les demandes validées, puis démarrez-la pour envoyer les questionnaires de satisfaction.</EmptyState>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const open = expanded === s.id;
            return (
              <Card key={s.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" onClick={() => setExpanded(open ? null : s.id)} className="text-left">
                    <p className="text-sm font-bold flex items-center gap-2" style={{ color: '#001a4a', ...headingFont }}>
                      <CalendarDays className="w-4 h-4" style={{ color: '#005064' }} />
                      {s.formation_title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
                      Du {formatDay(s.start_date)} au {formatDay(s.end_date)} · {s.registrations.length} demande(s) · créée le {formatDate(s.created_at)}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    {s.status === 'STARTED' ? (
                      <Badge tone="success">Démarrée</Badge>
                    ) : (
                      <>
                        <Badge>Planifiée</Badge>
                        <button
                          type="button"
                          disabled={busyId === s.id || s.registrations.length === 0}
                          onClick={() => run(s, () => adminStartSession(auth, s.id))}
                          title={s.registrations.length === 0 ? 'Rattachez au moins une demande' : 'Démarrer la session'}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                          style={{ background: '#005064', color: 'white', ...headingFont }}>
                          <Play className="w-3.5 h-3.5" />
                          Démarrer la session
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      title="Supprimer la session"
                      disabled={busyId === s.id}
                      onClick={() => remove(s)}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-xl disabled:opacity-40"
                      style={{ color: '#a12626' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f0f3fa' }}>
                    {/* Demandes rattachées */}
                    <div className="flex flex-wrap items-center gap-2">
                      {s.registrations.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-semibold"
                          style={{ background: '#f0f3fa', color: '#001a4a', ...headingFont }}>
                          {r.label}
                          <button
                            type="button"
                            title="Détacher de la session"
                            onClick={() => run(s, () => adminDetachFromSession(auth, s.id, r.id))}
                            className="w-5 h-5 inline-flex items-center justify-center rounded-full"
                            style={{ color: '#6b7a9b' }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                      <select
                        value=""
                        onChange={(e) => e.target.value && run(s, () => adminAttachToSession(auth, s.id, e.target.value))}
                        className="rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
                        style={{ borderColor: '#e0e8f4', color: '#005064', ...headingFont }}>
                        <option value="">+ Rattacher une demande validée…</option>
                        {attachables(s).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.company_name || [r.first_name, r.last_name].filter(Boolean).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {s.status === 'STARTED' ? (
                      <RecipientsPanel auth={auth} session={s} onError={setError} />
                    ) : (
                      <p className="text-xs mt-4" style={{ color: '#6b7a9b', ...bodyFont }}>
                        Démarrez la session pour envoyer les questionnaires de satisfaction aux participants.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
