import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareWarning, Send, CheckCircle2 } from 'lucide-react';
import { formations } from '@/data/formations';
import { createComplaint } from '@/api/backend';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const COMPLAINANT_TYPES = [
  { key: 'COMPANY', label: 'Entreprise' },
  { key: 'INDEPENDENT', label: 'Indépendant' },
  { key: 'INDIVIDUAL', label: 'Particulier' },
];

const inputClass = 'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#005064] bg-white';
const inputStyle = { borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont };

const emptyForm = {
  formationId: formations[0]?.id ?? '',
  complainantType: 'PARTICULIER_DEFAULT',
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  message: '',
};

export default function ComplaintsSection() {
  const [form, setForm] = useState({ ...emptyForm, complainantType: 'INDIVIDUAL' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const isCompany = form.complainantType !== 'INDIVIDUAL';

  const missing = useMemo(() => {
    const list = [];
    if (!form.formationId) list.push('Formation concernée');
    if (!form.firstName.trim()) list.push('Prénom');
    if (!form.lastName.trim()) list.push('Nom');
    if (!form.email.trim()) list.push('Adresse email');
    if (!form.message.trim()) list.push('Votre réclamation');
    return list;
  }, [form]);

  const submit = async (e) => {
    e.preventDefault();
    if (missing.length > 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const formation = formations.find((f) => f.id === form.formationId);
      await createComplaint({
        formation_id: form.formationId,
        formation_title: formation?.title ?? form.formationId,
        complainant_type: form.complainantType,
        company_name: isCompany ? (form.companyName.trim() || null) : null,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reclamations" className="w-full py-16 sm:py-20" style={{ background: '#f7f9fd' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] mb-3"
            style={{ color: '#002d74', ...headingFont }}>
            <MessageSquareWarning className="w-4 h-4" />
            Votre avis compte
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#001a4a', ...headingFont }}>
            Déposer une <span style={{ color: '#005064' }}>réclamation</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6b7a9b', ...bodyFont }}>
            Une remarque, un désaccord ou une insatisfaction concernant l'une de nos formations ?
            Faites-le nous savoir : chaque réclamation est enregistrée, accusée de réception et traitée.
          </p>
        </motion.div>

        {sent ? (
          <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#005064' }} />
            <h3 className="text-xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
              Votre réclamation a bien été enregistrée
            </h3>
            <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
              Vous allez recevoir un accusé de réception par email. Une réponse vous sera apportée
              sous 15 jours ouvrés.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-3xl p-6 sm:p-8"
            style={{ background: 'white', border: '1px solid #e0e8f4' }}>

            <label className="block mb-4">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Formation concernée <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <select value={form.formationId} onChange={(e) => set('formationId')(e.target.value)} className={inputClass} style={inputStyle}>
                {formations.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </label>

            <div className="mb-4">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Vous êtes <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {COMPLAINANT_TYPES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('complainantType')(key)}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                    style={{
                      border: form.complainantType === key ? '1.5px solid #005064' : '1px solid #e0e8f4',
                      background: form.complainantType === key ? '#f0f3fa' : 'white',
                      color: form.complainantType === key ? '#005064' : '#6b7a9b',
                      ...headingFont,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isCompany && (
              <label className="block mb-4">
                <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                  Nom de l'entreprise
                </span>
                <input value={form.companyName} onChange={(e) => set('companyName')(e.target.value)} className={inputClass} style={inputStyle} />
              </label>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                  Prénom <span style={{ color: '#c2410c' }}>*</span>
                </span>
                <input value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} className={inputClass} style={inputStyle} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                  Nom <span style={{ color: '#c2410c' }}>*</span>
                </span>
                <input value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} className={inputClass} style={inputStyle} />
              </label>
            </div>

            <label className="block mb-4">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Adresse email <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} className={inputClass} style={inputStyle} />
            </label>

            <label className="block mb-5">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Votre réclamation <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => set('message')(e.target.value)}
                placeholder="Décrivez l'objet de votre réclamation avec le plus de précisions possible…"
                className={inputClass}
                style={inputStyle} />
            </label>

            {missing.length > 0 && (
              <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdf3e2', color: '#8a5a00', ...bodyFont }}>
                <strong>Champs manquants :</strong> {missing.join(', ')}
              </p>
            )}
            {error && (
              <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={missing.length > 0 || submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              {submitting ? 'Envoi en cours…' : 'Envoyer ma réclamation'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
