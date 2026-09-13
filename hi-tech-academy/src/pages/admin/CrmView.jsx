import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarClock, Mail, MessageSquare, Pencil, Phone, Plus, RefreshCw,
  Save, Search, StickyNote, Trash2, Video, X,
} from 'lucide-react';
import {
  adminCreateCrmActivity, adminCreateCrmContact, adminDeleteCrmActivity,
  adminDeleteCrmContact, adminListCrmActivities, adminListCrmContacts,
  adminUpdateCrmContact,
} from '@/api/backend';
import { formations } from '@/data/formations';
import { ViewHeader, bodyFont, formatDate, headingFont } from './common';

// CRM : kanban de suivi des prospects — drag & drop entre les colonnes du
// parcours, fiche contact complète, notes et historique des conversations
// (les déplacements de colonne sont tracés automatiquement).

const STAGES = [
  { key: 'TO_CONTACT', label: 'À contacter', color: '#005064' },
  { key: 'CONTACTED', label: 'Contacté', color: '#2451a6' },
  { key: 'VALIDATED', label: 'Validé', color: '#116632' },
  { key: 'REJECTED', label: 'Rejeté', color: '#a12626' },
  { key: 'FILE_SUBMITTED', label: 'Dossier déposé', color: '#b7791f' },
  { key: 'FILE_VALIDATED', label: 'Dossier validé', color: '#0f766e' },
  { key: 'FILE_REFUSED', label: 'Dossier refusé', color: '#9f1239' },
];

const SOURCES = ['Site web', 'Téléphone', 'Email', 'LinkedIn', 'Recommandation', 'Salon', 'Autre'];

const ACTIVITY_TYPES = {
  NOTE: { label: 'Note', icon: StickyNote, color: '#6b7a9b' },
  CALL: { label: 'Appel', icon: Phone, color: '#116632' },
  EMAIL: { label: 'Email', icon: Mail, color: '#2451a6' },
  SMS: { label: 'SMS', icon: MessageSquare, color: '#b7791f' },
  MEETING: { label: 'Rendez-vous', icon: Video, color: '#7c3aed' },
  STAGE_CHANGE: { label: 'Déplacement', icon: ArrowRight, color: '#6b7a9b' },
};

const COMPOSER_TYPES = ['NOTE', 'CALL', 'EMAIL', 'SMS', 'MEETING'];

const formationTitle = (id) => formations.find((f) => f.id === id)?.title ?? null;

const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(`${dateStr}T23:59:59`) < new Date();
};

const formatDay = (dateStr) => {
  if (!dateStr) return '';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// --- Formulaire de fiche (création et édition) --------------------------
const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '',
  formationId: '', source: '', stage: 'TO_CONTACT', nextFollowUpAt: '',
};

function FieldInput({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1" style={{ color: '#002d74', ...headingFont }}>
        {label}{required && ' *'}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#005064]"
        style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
    </label>
  );
}

function FieldSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1" style={{ color: '#002d74', ...headingFont }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#005064] bg-white"
        style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }}>
        {children}
      </select>
    </label>
  );
}

function ContactForm({ form, setForm }) {
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Prénom" required value={form.firstName} onChange={set('firstName')} />
        <FieldInput label="Nom" required value={form.lastName} onChange={set('lastName')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Email" type="email" value={form.email} onChange={set('email')} />
        <FieldInput label="Téléphone" type="tel" value={form.phone} onChange={set('phone')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Entreprise" value={form.company} onChange={set('company')} />
        <FieldInput label="Poste" value={form.jobTitle} onChange={set('jobTitle')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect label="Formation d'intérêt" value={form.formationId} onChange={set('formationId')}>
          <option value="">—</option>
          {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </FieldSelect>
        <FieldSelect label="Source" value={form.source} onChange={set('source')}>
          <option value="">—</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </FieldSelect>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect label="Colonne" value={form.stage} onChange={set('stage')}>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </FieldSelect>
        <FieldInput label="Prochaine relance" type="date" value={form.nextFollowUpAt} onChange={set('nextFollowUpAt')} />
      </div>
    </div>
  );
}

const formToPayload = (form) => ({
  first_name: form.firstName.trim(),
  last_name: form.lastName.trim(),
  email: form.email.trim() || null,
  phone: form.phone.trim() || null,
  company: form.company.trim() || null,
  job_title: form.jobTitle.trim() || null,
  formation_id: form.formationId || null,
  source: form.source || null,
  stage: form.stage,
  ...(form.nextFollowUpAt
    ? { next_follow_up_at: form.nextFollowUpAt }
    : { clear_follow_up: true }),
});

const contactToForm = (c) => ({
  firstName: c.first_name ?? '',
  lastName: c.last_name ?? '',
  email: c.email ?? '',
  phone: c.phone ?? '',
  company: c.company ?? '',
  jobTitle: c.job_title ?? '',
  formationId: c.formation_id ?? '',
  source: c.source ?? '',
  stage: c.stage,
  nextFollowUpAt: c.next_follow_up_at ?? '',
});

// --- Carte du kanban ------------------------------------------------------
function ContactCard({ contact, onOpen }) {
  const overdue = isOverdue(contact.next_follow_up_at);
  const formation = formationTitle(contact.formation_id);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/crm-id', contact.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onOpen(contact)}
      className="rounded-xl px-3.5 py-3 cursor-pointer space-y-1.5"
      style={{ background: 'white', border: `1px solid ${overdue ? '#f0b9b9' : '#e0e8f4'}` }}>
      <p className="text-sm font-bold leading-tight" style={{ color: '#001a4a', ...headingFont }}>
        {contact.first_name} {contact.last_name}
      </p>
      {(contact.company || contact.job_title) && (
        <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
          {[contact.job_title, contact.company].filter(Boolean).join(' · ')}
        </p>
      )}
      {formation && (
        <p
          className="inline-block max-w-full truncate text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
          {formation}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="flex items-center gap-2">
          {contact.phone && (
            <a href={`tel:${contact.phone}`} onClick={(e) => e.stopPropagation()} title={contact.phone}>
              <Phone className="w-3.5 h-3.5" style={{ color: '#116632' }} />
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()} title={contact.email}>
              <Mail className="w-3.5 h-3.5" style={{ color: '#2451a6' }} />
            </a>
          )}
        </span>
        {contact.next_follow_up_at && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md"
            title={overdue ? 'Relance dépassée' : 'Prochaine relance'}
            style={{
              background: overdue ? '#fdecec' : '#f0f3fa',
              color: overdue ? '#a12626' : '#6b7a9b',
              ...headingFont,
            }}>
            <CalendarClock className="w-3 h-3" />
            {formatDay(contact.next_follow_up_at)}
          </span>
        )}
      </div>
    </div>
  );
}

// --- Fiche contact : profil + historique -----------------------------------
function ContactModal({ auth, contact, onClose, onSaved, onDeleted, setGlobalError }) {
  const [form, setForm] = useState(() => contactToForm(contact));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState(null);
  const [composerType, setComposerType] = useState('NOTE');
  const [composerText, setComposerText] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);

  useEffect(() => {
    setForm(contactToForm(contact));
  }, [contact]);

  useEffect(() => {
    adminListCrmActivities(auth, contact.id).then(setActivities).catch((e) => setGlobalError(e.message));
  }, [auth, contact.id, setGlobalError]);

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSaving(true);
    try {
      const updated = await adminUpdateCrmContact(auth, contact.id, formToPayload(form));
      onSaved(updated);
      setEditing(false);
    } catch (e) {
      setGlobalError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await adminDeleteCrmContact(auth, contact.id);
      onDeleted(contact);
      onClose();
    } catch (e) {
      setGlobalError(e.message);
    }
  };

  const addActivity = async (e) => {
    e.preventDefault();
    if (!composerText.trim()) return;
    setAddingActivity(true);
    try {
      const created = await adminCreateCrmActivity(auth, contact.id, {
        type: composerType, content: composerText.trim(),
      });
      setActivities((prev) => [created, ...(prev ?? [])]);
      setComposerText('');
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setAddingActivity(false);
    }
  };

  const removeActivity = async (activity) => {
    try {
      await adminDeleteCrmActivity(auth, activity.id);
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
    } catch (e) {
      setGlobalError(e.message);
    }
  };

  const stageMeta = STAGES.find((s) => s.key === contact.stage);
  const formation = formationTitle(contact.formation_id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,26,74,0.45)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-full flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'white' }}
        onClick={(e) => e.stopPropagation()}>

        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 px-6 py-4" style={{ borderBottom: '1px solid #e0e8f4' }}>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold" style={{ color: '#001a4a', ...headingFont }}>
                {contact.first_name} {contact.last_name}
              </h3>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${stageMeta.color}18`, color: stageMeta.color, ...headingFont }}>
                {stageMeta.label}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
              Créé le {formatDate(contact.created_at)} · mis à jour le {formatDate(contact.updated_at)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={remove}
              title="Supprimer le contact et son historique"
              className="inline-flex items-center gap-1.5 text-xs font-bold"
              style={{ color: '#a12626', ...headingFont }}>
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
            <button type="button" onClick={onClose} aria-label="Fermer" style={{ color: '#6b7a9b' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 overflow-y-auto">
          {/* Profil */}
          <div className="p-6" style={{ borderRight: '1px solid #f0f3fa' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold" style={{ color: '#001a4a', ...headingFont }}>Profil</h4>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: '#005064', ...headingFont }}>
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setForm(contactToForm(contact)); setEditing(false); }}
                    className="text-xs font-semibold"
                    style={{ color: '#6b7a9b', ...headingFont }}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving || !form.firstName.trim() || !form.lastName.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                    style={{ background: '#005064', color: 'white', ...headingFont }}>
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <ContactForm form={form} setForm={setForm} />
            ) : (
              <dl className="space-y-3 text-sm" style={bodyFont}>
                {[
                  ['Email', contact.email
                    ? <a href={`mailto:${contact.email}`} className="underline" style={{ color: '#005064' }}>{contact.email}</a>
                    : '—'],
                  ['Téléphone', contact.phone
                    ? <a href={`tel:${contact.phone}`} className="underline" style={{ color: '#005064' }}>{contact.phone}</a>
                    : '—'],
                  ['Entreprise', contact.company ?? '—'],
                  ['Poste', contact.job_title ?? '—'],
                  ['Formation d\'intérêt', formation ?? '—'],
                  ['Source', contact.source ?? '—'],
                  ['Prochaine relance', contact.next_follow_up_at
                    ? <span style={{ color: isOverdue(contact.next_follow_up_at) ? '#a12626' : '#001a4a' }}>
                        {formatDay(contact.next_follow_up_at)}
                        {isOverdue(contact.next_follow_up_at) && ' — dépassée'}
                      </span>
                    : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[140px_1fr] gap-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide pt-0.5" style={{ color: '#6b7a9b', ...headingFont }}>{label}</dt>
                    <dd style={{ color: '#001a4a' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Historique */}
          <div className="p-6">
            <h4 className="text-sm font-bold mb-4" style={{ color: '#001a4a', ...headingFont }}>
              Notes & historique
            </h4>

            <form onSubmit={addActivity} className="mb-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMPOSER_TYPES.map((type) => {
                  const meta = ACTIVITY_TYPES[type];
                  const active = composerType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setComposerType(type)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        background: active ? meta.color : '#f0f3fa',
                        color: active ? 'white' : '#6b7a9b',
                        ...headingFont,
                      }}>
                      <meta.icon className="w-3 h-3" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                rows={3}
                placeholder={composerType === 'NOTE'
                  ? 'Nouvelle note…'
                  : `Compte rendu (${ACTIVITY_TYPES[composerType].label.toLowerCase()})…`}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#005064] resize-none"
                style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
              <button
                type="submit"
                disabled={addingActivity || !composerText.trim()}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                <Plus className="w-3.5 h-3.5" />
                {addingActivity ? 'Ajout…' : 'Ajouter'}
              </button>
            </form>

            {!activities ? (
              <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>
            ) : activities.length === 0 ? (
              <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                Aucune entrée — notes, comptes rendus d'appels et déplacements de colonne apparaîtront ici.
              </p>
            ) : (
              <ul className="space-y-3">
                {activities.map((activity) => {
                  const meta = ACTIVITY_TYPES[activity.type] ?? ACTIVITY_TYPES.NOTE;
                  const isTrace = activity.type === 'STAGE_CHANGE';
                  return (
                    <li key={activity.id} className="flex gap-3 group">
                      <span
                        className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}18` }}>
                        <meta.icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px]" style={{ color: '#6b7a9b', ...headingFont }}>
                          <span className="font-bold">{meta.label}</span> · {formatDate(activity.created_at)}
                        </p>
                        <p
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${isTrace ? 'italic' : ''}`}
                          style={{ color: isTrace ? '#6b7a9b' : '#1a1a2e', ...bodyFont }}>
                          {activity.content}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(activity)}
                        aria-label="Supprimer l'entrée"
                        className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1"
                        style={{ color: '#a12626' }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Modale de création -----------------------------------------------------
function CreateModal({ auth, onClose, onCreated, setGlobalError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      delete payload.clear_follow_up; // création : pas de date = simplement absente
      const created = await adminCreateCrmContact(auth, payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,26,74,0.45)' }}
      onClick={onClose}>
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: 'white' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: '#001a4a', ...headingFont }}>Nouveau contact</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" style={{ color: '#6b7a9b' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <ContactForm form={form} setForm={setForm} />
        <button
          type="submit"
          disabled={saving || !form.firstName.trim() || !form.lastName.trim()}
          className="mt-5 w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{ background: '#005064', color: 'white', ...headingFont }}>
          {saving ? 'Création…' : 'Créer le contact'}
        </button>
      </form>
    </div>
  );
}

// --- Vue principale -----------------------------------------------------------
export default function CrmView({ auth }) {
  const [contacts, setContacts] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [openContact, setOpenContact] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const load = useCallback(() => {
    adminListCrmContacts(auth).then(setContacts).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    if (!contacts) return null;
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [`${c.first_name} ${c.last_name}`, c.email, c.phone, c.company]
          .some((v) => v && v.toLowerCase().includes(q)));
  }, [contacts, query]);

  const overdueCount = useMemo(() =>
    (contacts ?? []).filter((c) => isOverdue(c.next_follow_up_at)
        && !['REJECTED', 'FILE_REFUSED'].includes(c.stage)).length,
  [contacts]);

  const upsert = (contact) => {
    setContacts((prev) => {
      const exists = prev.some((c) => c.id === contact.id);
      return exists ? prev.map((c) => (c.id === contact.id ? contact : c)) : [...prev, contact];
    });
    setOpenContact((current) => (current?.id === contact.id ? contact : current));
  };

  const dropOn = async (stage, e) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/crm-id');
    if (!id) return;
    const contact = contacts.find((c) => c.id === id);
    if (!contact || contact.stage === stage) return;
    // Mise à jour optimiste, rollback si l'API échoue
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    try {
      upsert(await adminUpdateCrmContact(auth, id, { stage }));
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  if (error && !contacts) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!filtered) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  return (
    <div>
      <ViewHeader
        title="CRM"
        subtitle={`Suivi des prospects — glissez-déposez les cartes le long du parcours${overdueCount > 0 ? ` · ${overdueCount} relance(s) dépassée(s)` : ''}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7a9b' }} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (nom, email, entreprise…)"
                className="rounded-xl border pl-9 pr-3 py-2 text-sm outline-none focus:border-[#005064] w-64"
                style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
            </div>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              <Plus className="w-4 h-4" />
              Nouveau contact
            </button>
            <button
              type="button"
              onClick={load}
              title="Actualiser"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#005064', ...headingFont }}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        } />

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
          {error}
        </p>
      )}

      {/* Kanban : 7 colonnes, défilement horizontal */}
      <div className="flex gap-4 items-start overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = filtered
              .filter((c) => c.stage === stage.key)
              .sort((a, b) => a.position - b.position);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(stage.key); }}
              onDragLeave={() => setDragOver((c) => (c === stage.key ? null : c))}
              onDrop={(e) => dropOn(stage.key, e)}
              className="w-64 shrink-0 rounded-2xl p-3 transition-colors"
              style={{
                background: dragOver === stage.key ? '#e8f0fe' : '#f0f3fa',
                border: `1.5px solid ${dragOver === stage.key ? stage.color : 'transparent'}`,
              }}>
              <div className="flex items-center justify-between gap-2 px-1.5 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: stage.color, ...headingFont }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  {stage.label}
                </h3>
                <span
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold"
                  style={{ background: 'white', color: stage.color, ...headingFont }}>
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[40px]">
                {cards.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} onOpen={setOpenContact} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {creating && (
        <CreateModal
          auth={auth}
          onClose={() => setCreating(false)}
          onCreated={upsert}
          setGlobalError={setError} />
      )}

      {openContact && (
        <ContactModal
          auth={auth}
          contact={openContact}
          onClose={() => setOpenContact(null)}
          onSaved={upsert}
          onDeleted={(contact) => setContacts((prev) => prev.filter((c) => c.id !== contact.id))}
          setGlobalError={setError} />
      )}
    </div>
  );
}
