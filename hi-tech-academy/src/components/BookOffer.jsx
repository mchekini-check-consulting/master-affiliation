import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Download, GraduationCap, Mail, X } from 'lucide-react';
import { submitBookLead } from '@/api/backend';
import { formations } from '@/data/formations';

// Fin d'article de blog : le livre offert (visuel PNG transparent + bouton
// Télécharger → modale email/téléphone → envoi du livre par email + lead
// CRM), puis l'enchaînement vers les formations.
const BOOK = {
  title: 'IA et Opportunités',
  subtitle: "Transformer les défis d'aujourd'hui en succès de demain",
  image: '/images/livre-ia.png', // PNG détouré (transparent)
  arguments: ['Des idées concrètes', 'Des opportunités réelles', 'Un monde plus humain'],
};

/** Formations mises en avant dans l'enchaînement (les 3 IA du catalogue). */
const CHAINED_FORMATION_IDS = ['ia-pour-tous', 'ia-for-business', 'ia-for-tech'];

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const serifFont = { fontFamily: "'Source Serif 4', Georgia, serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// --- Modale : coordonnées → « Recevoir le livre par mail » ----------------
function BookModal({ articleSlug, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Votre adresse email est nécessaire pour recevoir le livre.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitBookLead({ email: email.trim(), phone: phone.trim(), articleSlug });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,56,44,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl p-7 sm:p-8 relative"
        style={{ background: 'white' }}
        onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4"
          style={{ color: '#8a9a93' }}>
          <X className="w-5 h-5" />
        </button>

        <img
          src={BOOK.image}
          alt={`Livre ${BOOK.title}`}
          className="w-28 h-auto mx-auto -mt-16 drop-shadow-xl" />

        {sent ? (
          <div className="text-center mt-4">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: '#007f64' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#004c3c', ...headingFont }}>
              Le livre est en route !
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#5f6b66', ...bodyFont }}>
              Vérifiez votre boîte mail : votre exemplaire d'« {BOOK.title} » vous attend
              (pensez aux courriers indésirables).
            </p>
            <p className="text-sm font-semibold mb-3" style={{ color: '#004c3c', ...headingFont }}>
              Et pour transformer la lecture en compétences :
            </p>
            <Link
              to="/formations"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: '#004c3c', ...headingFont }}>
              <GraduationCap className="w-4 h-4" />
              Découvrir nos formations IA
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4">
            <h3 className="text-xl font-bold text-center mb-1" style={{ color: '#004c3c', ...headingFont }}>
              Recevez « {BOOK.title} »
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: '#5f6b66', ...bodyFont }}>
              Laissez-nous votre email, le livre arrive directement dans votre boîte.
            </p>

            <label className="block mb-3">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#004c3c', ...headingFont }}>
                Email *
              </span>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#007f64]"
                style={{ borderColor: '#e5e5e5', color: '#004c3c', ...bodyFont }} />
            </label>
            <label className="block mb-4">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#004c3c', ...headingFont }}>
                Téléphone <span className="font-normal" style={{ color: '#8a9a93' }}>(optionnel)</span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#007f64]"
                style={{ borderColor: '#e5e5e5', color: '#004c3c', ...bodyFont }} />
            </label>

            {error && (
              <p className="text-xs mb-3 rounded-lg px-3 py-2" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: '#004c3c', ...headingFont }}>
              <Mail className="w-4 h-4" />
              {sending ? 'Envoi…' : 'Recevoir le livre par mail'}
            </button>
            <p className="text-[11px] text-center mt-3" style={{ color: '#8a9a93', ...bodyFont }}>
              Vos coordonnées ne servent qu'à vous envoyer le livre et, si vous le
              souhaitez, à vous parler de nos formations.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// --- Bloc de fin d'article ---------------------------------------------------
export default function BookOffer({ articleSlug }) {
  const [modalOpen, setModalOpen] = useState(false);
  const chained = CHAINED_FORMATION_IDS
    .map((id) => formations.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div className="mt-14">
      {/* Livre offert : visuel détouré + bouton Télécharger */}
      <div
        className="rounded-3xl px-6 sm:px-10 py-8 sm:py-10 grid sm:grid-cols-[200px_1fr] gap-8 items-center overflow-visible"
        style={{ background: 'linear-gradient(120deg, #eafff6 0%, #dff7ec 55%, #f4fffb 100%)', border: '1px solid #dff7ec' }}>
        <img
          src={BOOK.image}
          alt={`Livre ${BOOK.title} — ${BOOK.subtitle}`}
          className="w-44 sm:w-full h-auto mx-auto drop-shadow-2xl sm:-my-16" />

        <div className="text-center sm:text-left">
          <p
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: '#007f64', ...headingFont }}>
            <BookOpen className="w-4 h-4" />
            Livre offert
          </p>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: '#004c3c', ...serifFont }}>
            {BOOK.title}
          </h2>
          <p className="text-sm font-semibold mb-4" style={{ color: '#007f64', ...headingFont }}>
            {BOOK.subtitle}
          </p>
          <ul className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1.5 mb-6">
            {BOOK.arguments.map((argument) => (
              <li key={argument} className="flex items-center gap-1.5 text-sm" style={{ color: '#004c3c', ...bodyFont }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#00d1a5' }} />
                {argument}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: '#004c3c', ...headingFont }}>
            <Download className="w-4 h-4" />
            Télécharger le livre
          </button>
        </div>
      </div>

      {/* Enchaînement : du livre aux formations */}
      <div className="mt-6 rounded-3xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid #e5e5e5' }}>
        <p className="text-center text-sm mb-1" style={{ color: '#007f64', ...headingFont }}>
          Le livre vous donne les idées —
        </p>
        <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: '#004c3c', ...serifFont }}>
          nos formations vous donnent la pratique
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {chained.map((formation) => (
            <Link
              key={formation.id}
              to={`/formations/${formation.id}`}
              className="group rounded-2xl p-4 transition-all hover:shadow-md"
              style={{ background: '#f4fffb', border: '1px solid #dff7ec' }}>
              <p className="text-sm font-bold mb-1 group-hover:underline" style={{ color: '#004c3c', ...headingFont }}>
                {formation.title}
              </p>
              <p className="text-xs line-clamp-2" style={{ color: '#5f6b66', ...bodyFont }}>
                {formation.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold mt-2" style={{ color: '#007f64', ...headingFont }}>
                Voir la formation
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
        <p className="text-center">
          <Link
            to="/formations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
            style={{ background: 'white', color: '#004c3c', border: '1.5px solid #004c3c', ...headingFont }}>
            Toutes nos formations certifiées Qualiopi
            <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>

      {modalOpen && <BookModal articleSlug={articleSlug} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
