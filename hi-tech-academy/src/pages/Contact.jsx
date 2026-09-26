import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, CalendarBlank, ChatText, CheckCircle, Clock, EnvelopeSimple, MapPin, Phone, VideoCamera,
} from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import PrimaryButton from '@/components/ui/primary-button';
import { Bande, RADIUS } from '@/components/vente/atomes';
import { formations } from '@/data/formations';
import { sendContactRequest } from '@/api/backend';
import { NAVY, LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// Page Contact : deux entrées, un seul formulaire. « Envoyer un message » pour
// une question, « Prendre rendez-vous » pour un échange de 30 minutes. Le
// rendez-vous est une DEMANDE (jour + créneau souhaités) confirmée ensuite par
// email : rien n'est réservé automatiquement, la page ne promet donc pas un
// créneau garanti. Tout arrive dans le CRM de l'admin (ContactLeadController).
//
// Liens profonds : /contact?mode=rendez-vous, ?sujet=financement|devis|formation,
// ?formation=<id du catalogue>.

const PHONE = { label: '07 51 47 41 35', href: 'tel:+33751474135' };
const EMAIL = 'contact@hi-techacademy.fr';

const PROFILS = [
  { key: 'COMPANY', label: 'Entreprise' },
  { key: 'INDEPENDENT', label: 'Indépendant' },
  { key: 'INDIVIDUAL', label: 'Particulier' },
];

const SUJETS = [
  { key: 'formation', label: 'Choisir une formation' },
  { key: 'financement', label: 'Financement, OPCO' },
  { key: 'devis', label: 'Devis pour une équipe' },
  { key: 'autre', label: 'Autre question' },
];

const FORMATS = [
  { key: 'PHONE', label: 'Téléphone', detail: 'Nous vous appelons', icon: Phone },
  { key: 'VISIO', label: 'Visio', detail: 'Lien envoyé par email', icon: VideoCamera },
];

// À garder alignés avec ContactLeadController.SLOTS côté back.
const CRENEAUX = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
const NB_JOURS = 10;

const ETAPES = [
  { titre: 'Nous lisons votre demande', texte: 'Un conseiller la prend en charge, pas un robot.' },
  { titre: 'Réponse sous 24 h ouvrées', texte: 'Par email ou au téléphone, selon ce que vous préférez.' },
  { titre: 'Programme et devis si besoin', texte: 'Prêts pour votre financeur, sans engagement de votre part.' },
];

/** Date locale au format yyyy-mm-dd (pas toISOString, qui repasse en UTC). */
function isoLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Les N prochains jours ouvrés, à partir de demain. */
function prochainsJoursOuvres(n) {
  const jours = [];
  const d = new Date();
  while (jours.length < n) {
    d.setDate(d.getDate() + 1);
    const j = d.getDay();
    if (j !== 0 && j !== 6) jours.push(new Date(d));
  }
  return jours;
}

const fmtJourCourt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const fmtMoisCourt = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const fmtJourLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const heure = (slot) => `${Number(slot.slice(0, 2))} h`;

function valider(f, mode) {
  const e = {};
  if (!f.firstName.trim()) e.firstName = 'Votre prénom est requis.';
  if (!f.lastName.trim()) e.lastName = 'Votre nom est requis.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Adresse email invalide.';
  const chiffres = f.phone.replace(/\D/g, '').length;
  if (mode === 'rdv' && f.format === 'PHONE' && chiffres === 0) e.phone = 'Indiquez le numéro auquel vous rappeler.';
  else if (chiffres > 0 && chiffres < 10) e.phone = 'Numéro de téléphone incomplet.';
  if (mode === 'message' && !f.message.trim()) e.message = 'Écrivez votre message.';
  if (mode === 'rdv' && !f.date) e.date = 'Choisissez un jour.';
  if (mode === 'rdv' && !f.slot) e.slot = 'Choisissez un créneau.';
  if (!f.consent) e.consent = 'Nécessaire pour vous répondre.';
  return e;
}

// 16 px partout : en dessous, iOS zoome sur le champ au focus.
const inputClass = 'w-full h-[52px] rounded-[8px] border px-4 text-base outline-none transition-colors bg-white focus:border-[#002d74]';
const inputStyle = { borderColor: LINE, color: BODY, ...bodyFont };

function Champ({ id, label, facultatif, erreur, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-body-sm font-semibold mb-1.5" style={{ color: BODY, ...headingFont }}>
        {label}
        {facultatif && <span className="font-normal" style={{ color: BODY_MUTED }}> (facultatif)</span>}
      </label>
      {children}
      {erreur && <p id={`${id}-err`} className="text-caption mt-1" style={{ color: '#a12626', ...bodyFont }}>{erreur}</p>}
    </div>
  );
}

/** Petite étiquette de groupe (format, jour, créneau). */
function Groupe({ label, erreur, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-body-sm font-semibold mb-2" style={{ color: BODY, ...headingFont }}>{label}</legend>
      {children}
      {erreur && <p className="text-caption mt-1.5" style={{ color: '#a12626', ...bodyFont }}>{erreur}</p>}
    </fieldset>
  );
}

/** Pastille sélectionnable : aplat marine quand elle est choisie. */
function Choix({ actif, onClick, children, className = '', ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`transition-colors cursor-pointer ${className}`}
      style={{
        borderRadius: RADIUS,
        border: `1px solid ${actif ? NAVY : LINE}`,
        background: actif ? NAVY : '#ffffff',
        color: actif ? '#ffffff' : BODY,
        ...bodyFont,
      }}
      {...props}>
      {children}
    </button>
  );
}

function Canal({ icon: Icon, titre, children }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
      <span className="grid place-items-center shrink-0 w-11 h-11" style={{ borderRadius: RADIUS, background: MINT_LIGHT, color: NAVY }}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-body-sm" style={{ color: BODY_MUTED, ...bodyFont }}>{titre}</p>
        <div className="text-body-base font-semibold mt-0.5 break-words" style={{ color: BODY, ...headingFont }}>{children}</div>
      </div>
    </div>
  );
}

export default function Contact() {
  const [params] = useSearchParams();
  const jours = useMemo(() => prochainsJoursOuvres(NB_JOURS), []);

  const sujetInitial = SUJETS.some((s) => s.key === params.get('sujet')) ? params.get('sujet') : 'formation';
  const formationInitiale = formations.some((f) => f.id === params.get('formation')) ? params.get('formation') : '';

  const [mode, setMode] = useState(params.get('mode') === 'rendez-vous' ? 'rdv' : 'message');
  const [form, setForm] = useState({
    applicantType: 'COMPANY', company: '', firstName: '', lastName: '', email: '', phone: '',
    subject: sujetInitial, formationId: formationInitiale, message: '',
    format: 'PHONE', date: '', slot: '', consent: false,
  });
  const [erreurs, setErreurs] = useState({});
  const [etat, setEtat] = useState('idle'); // idle | sending | sent | error
  const [messageErreur, setMessageErreur] = useState('');

  useEffect(() => {
    document.title = 'Contact : Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  const maj = (champ, valeur) => {
    setForm((f) => ({ ...f, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((e) => ({ ...e, [champ]: undefined }));
  };
  const set = (champ) => (e) => maj(champ, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const changerMode = (m) => { setMode(m); setErreurs({}); setEtat('idle'); };

  const formation = formations.find((f) => f.id === form.formationId);
  const jourChoisi = jours.find((d) => isoLocal(d) === form.date);
  const resumeRdv = jourChoisi && form.slot
    ? `${fmtJourLong.format(jourChoisi)} à ${heure(form.slot)}, ${form.format === 'PHONE' ? 'par téléphone' : 'en visio'}`
    : null;

  const envoyer = async (e) => {
    e.preventDefault();
    const er = valider(form, mode);
    setErreurs(er);
    if (Object.keys(er).length > 0) {
      // Amène la première erreur sous les yeux (formulaire long sur mobile).
      requestAnimationFrame(() => document.querySelector('[data-erreur="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      return;
    }
    setEtat('sending');
    setMessageErreur('');
    const rdv = mode === 'rdv';
    try {
      await sendContactRequest({
        kind: rdv ? 'APPOINTMENT' : 'MESSAGE',
        applicantType: form.applicantType,
        company: form.applicantType !== 'INDIVIDUAL' ? form.company.trim() || null : null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: rdv ? null : SUJETS.find((s) => s.key === form.subject)?.label,
        formationId: formation?.id || null,
        formationTitle: formation?.title || null,
        message: form.message.trim() || null,
        appointmentFormat: rdv ? form.format : null,
        appointmentDate: rdv ? form.date : null,
        appointmentSlot: rdv ? form.slot : null,
      });
      setEtat('sent');
      window.scrollTo({ top: document.getElementById('formulaire')?.offsetTop - 96 || 0, behavior: 'smooth' });
    } catch (err) {
      setEtat('error');
      setMessageErreur(err?.message || `L'envoi a échoué. Réessayez, ou appelez-nous au ${PHONE.label}.`);
    }
  };

  const err = (champ) => (erreurs[champ] ? { 'aria-invalid': true, 'aria-describedby': `${champ}-err`, 'data-erreur': true } : {});

  return (
    <div className="min-h-screen bg-white">
      <Header embedded />

      <main>
        <PageHero
          kicker="Contact"
          title={<>Parlons de votre <span>projet de formation</span></>}
          intro="Une question sur une formation, un financement ou un devis pour votre équipe ? Écrivez-nous, ou réservez un échange de 30 minutes avec un conseiller. Nous répondons sous 24 h ouvrées.">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <PrimaryButton href="#formulaire" size="lg" inverted onClick={() => changerMode('rdv')}>
              Prendre rendez-vous
            </PrimaryButton>
            <a href={PHONE.href} className="inline-flex items-center gap-2 text-body-base font-semibold text-white hover:underline" style={headingFont}>
              <Phone size={18} /> {PHONE.label}
            </a>
          </div>
        </PageHero>

        <Bande id="formulaire">
          <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20 items-start">

            {/* ── Colonne gauche : canaux directs et suite de la demande ── */}
            <div className="lg:sticky lg:top-28 space-y-10">
              <div>
                <h2 className="font-serif-display text-h2" style={{ color: '#243037', ...serifFont }}>Nous joindre directement</h2>
                <div className="grid gap-3 mt-6">
                  <Canal icon={Phone} titre="Téléphone">
                    <a href={PHONE.href} className="hover:underline">{PHONE.label}</a>
                  </Canal>
                  <Canal icon={EnvelopeSimple} titre="Email">
                    <a href={`mailto:${EMAIL}`} className="hover:underline">{EMAIL}</a>
                  </Canal>
                  <Canal icon={MapPin} titre="Siège">
                    73 rue de Reuilly, 75012 Paris
                    <span className="block text-body-sm font-normal mt-1" style={{ color: BODY_MUTED, ...bodyFont }}>
                      Nos formations se déroulent 100 % à distance, en classe virtuelle.
                    </span>
                  </Canal>
                </div>
              </div>

              <div>
                <h2 className="font-serif-display text-h3" style={{ color: '#243037', ...serifFont }}>Et ensuite ?</h2>
                <ol className="mt-5" style={{ borderTop: `1px solid ${LINE}` }}>
                  {ETAPES.map((etape, i) => (
                    <li key={etape.titre} className="flex gap-4 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
                      <span className="font-serif-display text-h4 w-6 shrink-0" style={{ color: NAVY, ...serifFont }}>{i + 1}</span>
                      <div>
                        <p className="text-body-base font-semibold" style={{ color: BODY, ...headingFont }}>{etape.titre}</p>
                        <p className="text-body-sm mt-0.5" style={{ color: BODY_MUTED, ...bodyFont }}>{etape.texte}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="text-body-sm mt-5" style={{ color: BODY_MUTED, ...bodyFont }}>
                  Une réclamation sur une formation suivie ?{' '}
                  <Link to="/reclamations" className="font-semibold hover:underline" style={{ color: NAVY }}>Déposer une réclamation</Link>
                </p>
              </div>
            </div>

            {/* ── Colonne droite : le formulaire ── */}
            {etat === 'sent' ? (
              <div className="p-8 sm:p-10 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }} role="status">
                <CheckCircle weight="fill" className="w-10 h-10 mb-4" style={{ color: NAVY }} />
                <h2 className="font-serif-display text-h2" style={{ color: '#243037', ...serifFont }}>
                  {mode === 'rdv' ? 'Demande de rendez-vous envoyée' : 'Message bien reçu'}
                </h2>
                <p className="text-body-base leading-[1.6] mt-3 max-w-measure" style={{ color: BODY_MUTED, ...bodyFont }}>
                  {mode === 'rdv'
                    ? <>Merci {form.firstName}. Vous avez demandé un échange le <strong style={{ color: BODY }}>{resumeRdv}</strong>. Nous vous le confirmons par email à {form.email} sous 24 h ouvrées, ou vous proposons un autre créneau s&apos;il n&apos;est plus libre.</>
                    : <>Merci {form.firstName}. Nous vous répondons sous 24 h ouvrées à {form.email}. Un accusé de réception vient de vous être envoyé.</>}
                </p>
                <div className="flex flex-wrap items-center gap-x-7 gap-y-4 mt-8">
                  <PrimaryButton to="/formations">Voir les formations</PrimaryButton>
                  <Link to="/financements" className="inline-flex items-center gap-1 text-body-sm font-semibold hover:underline" style={{ color: NAVY, ...headingFont }}>
                    Comprendre le financement <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={envoyer} noValidate className="p-6 sm:p-8 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>

                {/* Bascule message / rendez-vous : deux grandes cibles, l'icône
                    et le libellé disent ce qui se passe avant le clic. */}
                <div role="tablist" aria-label="Comment souhaitez-vous nous contacter ?" className="grid grid-cols-2 gap-1 p-1" style={{ borderRadius: RADIUS + 4, background: MINT_LIGHT }}>
                  {[
                    { key: 'message', label: 'Envoyer un message', court: 'Message', icon: ChatText },
                    { key: 'rdv', label: 'Prendre rendez-vous', court: 'Rendez-vous', icon: CalendarBlank },
                  ].map(({ key, label, court, icon: Icon }) => {
                    const actif = mode === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={actif}
                        onClick={() => changerMode(key)}
                        className="h-12 inline-flex items-center justify-center gap-2 px-3 text-body-sm sm:text-body-base font-semibold transition-colors cursor-pointer"
                        style={{ borderRadius: RADIUS, background: actif ? '#ffffff' : 'transparent', color: actif ? NAVY : BODY_MUTED, boxShadow: actif ? '0 6px 18px -10px rgba(0,45,116,.16)' : 'none', ...headingFont }}>
                        <Icon size={18} weight={actif ? 'fill' : 'regular'} /> <span className="sm:hidden">{court}</span><span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-body-sm mt-4" style={{ color: BODY_MUTED, ...bodyFont }}>
                  {mode === 'rdv'
                    ? 'Un échange de 30 minutes avec un conseiller, gratuit et sans engagement. Choisissez un moment, nous vous le confirmons par email.'
                    : 'Posez votre question, nous vous répondons sous 24 h ouvrées.'}
                </p>

                {mode === 'rdv' && (
                  <div className="mt-8 space-y-7 pb-8" style={{ borderBottom: `1px solid ${LINE}` }}>
                    <Groupe label="Format">
                      <div className="grid grid-cols-2 gap-3">
                        {FORMATS.map(({ key, label, detail, icon: Icon }) => (
                          <Choix key={key} actif={form.format === key} onClick={() => maj('format', key)} className="flex items-center gap-3 p-4 text-left">
                            <Icon size={22} className="shrink-0" />
                            <span>
                              <span className="block text-body-base font-semibold">{label}</span>
                              <span className="block text-body-sm" style={{ opacity: 0.8 }}>{detail}</span>
                            </span>
                          </Choix>
                        ))}
                      </div>
                    </Groupe>

                    <Groupe label="Jour" erreur={erreurs.date}>
                      {/* Défilement horizontal sur mobile, grille sur ordinateur. */}
                      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:grid sm:grid-cols-5 sm:overflow-visible" data-erreur={!!erreurs.date}>
                        {jours.map((d) => {
                          const iso = isoLocal(d);
                          return (
                            <Choix key={iso} actif={form.date === iso} onClick={() => maj('date', iso)} className="shrink-0 w-[68px] sm:w-auto py-2.5 text-center" aria-label={fmtJourLong.format(d)}>
                              <span className="block text-caption capitalize" style={{ opacity: 0.8 }}>{fmtJourCourt.format(d).replace('.', '')}</span>
                              <span className="block text-h4 font-semibold leading-tight" style={serifFont}>{d.getDate()}</span>
                              <span className="block text-caption" style={{ opacity: 0.8 }}>{fmtMoisCourt.format(d).replace('.', '')}</span>
                            </Choix>
                          );
                        })}
                      </div>
                    </Groupe>

                    <Groupe label="Créneau (heure de Paris)" erreur={erreurs.slot}>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" data-erreur={!!erreurs.slot}>
                        {CRENEAUX.map((s) => (
                          <Choix key={s} actif={form.slot === s} onClick={() => maj('slot', s)} className="h-11 text-body-sm font-semibold">
                            {heure(s)}
                          </Choix>
                        ))}
                      </div>
                    </Groupe>

                    {resumeRdv && (
                      <p className="flex items-center gap-2.5 px-4 py-3 text-body-sm" style={{ borderRadius: RADIUS, background: MINT_LIGHT, color: BODY, ...bodyFont }}>
                        <Clock size={18} className="shrink-0" style={{ color: NAVY }} />
                        <span><strong className="font-semibold">{resumeRdv.charAt(0).toUpperCase() + resumeRdv.slice(1)}</strong>, 30 min</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-8 space-y-5">
                  <div role="radiogroup" aria-label="Vous êtes" className="flex flex-wrap gap-2">
                    {PROFILS.map(({ key, label }) => (
                      <Choix key={key} actif={form.applicantType === key} onClick={() => maj('applicantType', key)} role="radio" aria-checked={form.applicantType === key} className="h-10 px-5 text-body-sm font-semibold !rounded-full">
                        {label}
                      </Choix>
                    ))}
                  </div>

                  {form.applicantType !== 'INDIVIDUAL' && (
                    <Champ id="company" label={form.applicantType === 'COMPANY' ? 'Entreprise' : 'Activité ou raison sociale'} facultatif>
                      <input id="company" className={inputClass} style={inputStyle} value={form.company} onChange={set('company')} autoComplete="organization" />
                    </Champ>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Champ id="firstName" label="Prénom" erreur={erreurs.firstName}>
                      <input id="firstName" className={inputClass} style={inputStyle} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" {...err('firstName')} />
                    </Champ>
                    <Champ id="lastName" label="Nom" erreur={erreurs.lastName}>
                      <input id="lastName" className={inputClass} style={inputStyle} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" {...err('lastName')} />
                    </Champ>
                    <Champ id="email" label="Email" erreur={erreurs.email}>
                      <input id="email" type="email" inputMode="email" className={inputClass} style={inputStyle} value={form.email} onChange={set('email')} autoComplete="email" {...err('email')} />
                    </Champ>
                    <Champ id="phone" label="Téléphone" facultatif={!(mode === 'rdv' && form.format === 'PHONE')} erreur={erreurs.phone}>
                      <input id="phone" type="tel" inputMode="tel" className={inputClass} style={inputStyle} value={form.phone} onChange={set('phone')} autoComplete="tel" {...err('phone')} />
                    </Champ>
                  </div>

                  {mode === 'message' && (
                    <Champ id="subject" label="Sujet">
                      <select id="subject" className={`${inputClass} cursor-pointer`} style={inputStyle} value={form.subject} onChange={set('subject')}>
                        {SUJETS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </Champ>
                  )}

                  <Champ id="formationId" label="Formation qui vous intéresse" facultatif>
                    <select id="formationId" className={`${inputClass} cursor-pointer`} style={inputStyle} value={form.formationId} onChange={set('formationId')}>
                      <option value="">Je ne sais pas encore</option>
                      {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
                    </select>
                  </Champ>

                  <Champ id="message" label={mode === 'rdv' ? 'De quoi souhaitez-vous parler ?' : 'Votre message'} facultatif={mode === 'rdv'} erreur={erreurs.message}>
                    <textarea
                      id="message"
                      rows={mode === 'rdv' ? 3 : 5}
                      maxLength={3000}
                      className="w-full min-h-[120px] rounded-[8px] border px-4 py-3 text-base outline-none transition-colors bg-white focus:border-[#002d74] resize-y"
                      style={inputStyle}
                      value={form.message}
                      onChange={set('message')}
                      placeholder={mode === 'rdv' ? 'Votre projet, votre équipe, votre financement…' : 'Votre question, le nombre de personnes à former, vos dates…'}
                      {...err('message')} />
                  </Champ>

                  <div data-erreur={!!erreurs.consent}>
                    <label className="flex items-start gap-3 cursor-pointer text-body-sm" style={{ color: BODY_MUTED, ...bodyFont }}>
                      <input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer" style={{ accentColor: NAVY }} />
                      <span>
                        J&apos;accepte que Hi-Tech Academy utilise ces informations pour me répondre. Voir notre{' '}
                        <Link to="/politique-confidentialite" className="font-semibold underline" style={{ color: NAVY }}>politique de confidentialité</Link>.
                      </span>
                    </label>
                    {erreurs.consent && <p className="text-caption mt-1 ml-8" style={{ color: '#a12626', ...bodyFont }}>{erreurs.consent}</p>}
                  </div>

                  {etat === 'error' && (
                    <p role="alert" className="px-4 py-3 text-body-sm" style={{ borderRadius: RADIUS, background: '#fdecec', color: '#a12626', ...bodyFont }}>
                      {messageErreur}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                    <PrimaryButton type="submit" size="lg" disabled={etat === 'sending'}>
                      {etat === 'sending' ? 'Envoi en cours…' : mode === 'rdv' ? 'Demander ce rendez-vous' : 'Envoyer mon message'}
                    </PrimaryButton>
                    <span className="text-body-sm" style={{ color: BODY_MUTED, ...bodyFont }}>Réponse sous 24 h ouvrées</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Bande>
      </main>

      <Footer />
    </div>
  );
}
