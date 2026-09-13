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

// Contrôles de format côté client (le backend revalide)
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Numéro français (06 12 34 56 78, +33 6 12 34 56 78…) — espaces/points/tirets tolérés
const isValidPhone = (value) => /^(?:\+33|0)[1-9]\d{8}$/.test(value.replace(/[\s.\-()]/g, ''));

// --- Modale : coordonnées → « Recevoir le livre par mail » ----------------
function BookModal({ articleSlug, onClose }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Renseignez votre prénom et votre nom.');
      return;
    }
    if (!email.trim()) {
      setError('Votre adresse email est nécessaire pour recevoir le livre.');
      return;
    }
    if (!EMAIL_FORMAT.test(email.trim())) {
      setError('Le format de l\'adresse email est invalide (ex. vous@exemple.fr).');
      return;
    }
    if (phone.trim() && !isValidPhone(phone.trim())) {
      setError('Le format du numéro de téléphone est invalide (ex. 06 12 34 56 78).');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitBookLead({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        articleSlug,
      });
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

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="block text-xs font-semibold mb-1.5" style={{ color: '#004c3c', ...headingFont }}>
                  Prénom *
                </span>
                <input
                  type="text"
                  value={firstName}
                  required
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Marie"
                  autoComplete="given-name"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#007f64]"
                  style={{ borderColor: '#e5e5e5', color: '#004c3c', ...bodyFont }} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold mb-1.5" style={{ color: '#004c3c', ...headingFont }}>
                  Nom *
                </span>
                <input
                  type="text"
                  value={lastName}
                  required
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Durand"
                  autoComplete="family-name"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#007f64]"
                  style={{ borderColor: '#e5e5e5', color: '#004c3c', ...bodyFont }} />
              </label>
            </div>

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

/** Durée et tarif courts extraits des faits clés d'une formation. */
function shortFacts(formation) {
  const fact = (label) => formation.keyFacts?.find((f) => f.label === label)?.value ?? '';
  return {
    duration: fact('Durée').split('—')[0].trim(),
    price: fact('Tarif').split('(')[0].trim(),
  };
}

// --- Bloc de fin d'article ---------------------------------------------------
export default function BookOffer({ articleSlug }) {
  const [modalOpen, setModalOpen] = useState(false);
  const chained = CHAINED_FORMATION_IDS
    .map((id) => formations.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div className="mt-16">
      {/* Livre offert : section éditoriale épurée, sans fond */}
      <div className="pt-12" style={{ borderTop: '1px solid #e5e5e5' }}>
        <div className="grid sm:grid-cols-[220px_1fr] gap-8 sm:gap-12 items-center">
          <img
            src={BOOK.image}
            alt={`Livre ${BOOK.title} — ${BOOK.subtitle}`}
            className="w-48 sm:w-full h-auto mx-auto"
            style={{ filter: 'drop-shadow(0 24px 32px rgba(0,56,44,0.22))' }} />

          <div className="text-center sm:text-left">
            <p
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: '#007f64', ...headingFont }}>
              <BookOpen className="w-4 h-4" />
              Livre offert
            </p>
            <h2 className="font-serif-display text-2xl sm:text-[2rem] font-bold leading-tight mb-1.5" style={{ color: '#00382c', ...serifFont }}>
              {BOOK.title}
            </h2>
            <p className="text-sm font-semibold mb-4" style={{ color: '#007f64', ...headingFont }}>
              {BOOK.subtitle}
            </p>
            <ul className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1.5 mb-7">
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
      </div>

      {/* Enchaînement : du livre aux formations — bande sombre signature */}
      <div
        className="relative overflow-hidden rounded-3xl mt-14 px-6 sm:px-10 py-10 sm:py-12"
        style={{ background: '#00382c' }}>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 50% 60% at 12% 0%, rgba(0,209,165,0.16) 0, transparent 70%),
              radial-gradient(ellipse 45% 55% at 95% 100%, rgba(0,127,100,0.28) 0, transparent 70%)
            `,
          }} />

        <div className="relative">
          <p
            className="text-center text-xs font-bold uppercase tracking-[0.22em] mb-3"
            style={{ color: '#7fe6c3', ...headingFont }}>
            Passer à la pratique
          </p>
          <h2
            className="font-serif-display text-2xl sm:text-3xl font-bold text-center leading-tight mb-3"
            style={{ color: 'white', ...serifFont }}>
            Le livre vous donne les idées,
            <br className="hidden sm:block" />
            {' '}nos formations vous donnent la pratique
          </h2>
          <p className="text-sm text-center max-w-xl mx-auto mb-9" style={{ color: '#b9d9cc', ...bodyFont }}>
            Des sessions en direct avec un formateur expert, sur vos cas d'usage —
            et un financement OPCO qui couvre souvent 100 % du tarif.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-9">
            {chained.map((formation) => {
              const facts = shortFacts(formation);
              return (
                <Link
                  key={formation.id}
                  to={`/formations/${formation.id}`}
                  className="group flex flex-col rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.055)',
                    border: '1px solid rgba(255,255,255,0.13)',
                  }}>
                  <span
                    className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{ background: 'rgba(0,209,165,0.14)', color: '#7fe6c3', ...headingFont }}>
                    {formation.tag}
                  </span>
                  <p className="text-base font-bold mb-1.5" style={{ color: 'white', ...headingFont }}>
                    {formation.title}
                  </p>
                  <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: '#b9d9cc', ...bodyFont }}>
                    {formation.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-[11px] font-semibold" style={{ color: '#8fd0ba', ...headingFont }}>
                      {[facts.duration, facts.price].filter(Boolean).join(' · ')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#00d1a5', ...headingFont }}>
                      Découvrir
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-5">
            <Link
              to="/formations"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'white', color: '#00382c', ...headingFont }}>
              Toutes nos formations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1.5">
              {['Certifié Qualiopi', 'Finançable OPCO', '100 % à distance, en direct'].map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-xs" style={{ color: '#9fc6b6', ...bodyFont }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d1a5' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {modalOpen && <BookModal articleSlug={articleSlug} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
