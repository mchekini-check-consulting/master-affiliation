import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { createRegistration } from '@/api/backend';
import { LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, RADIUS } from './atomes';

// Formulaire de demande de devis : LA conversion de la page. Volontairement
// court — six champs, un message facultatif replié — et posé sur fond blanc :
// un grand aplat sombre ici écrasait le reste de la page. Il dépose une
// demande `quoteRequest: true`, transmise aussitôt à l'admin (PENDING + e-mail)
// sans questionnaire préalable — voir RegistrationController.create.

const PROFILS = [
  { key: 'COMPANY', label: 'Entreprise' },
  { key: 'INDEPENDENT', label: 'Indépendant' },
  { key: 'INDIVIDUAL', label: 'Particulier' },
];

// 16 px sous sm : en dessous, iOS Safari zoome toute la page au focus du champ.
const inputClass = 'w-full h-12 rounded-[8px] border px-4 text-base sm:text-sm outline-none transition-colors bg-white';
const inputStyle = { borderColor: LINE, color: '#243037', ...bodyFont };

const VIDE = { applicantType: 'COMPANY', companyName: '', firstName: '', lastName: '', email: '', phone: '', message: '', consent: false };

function valider(f) {
  const erreurs = {};
  const isCompany = f.applicantType !== 'INDIVIDUAL';
  if (isCompany && !f.companyName.trim()) erreurs.companyName = "Le nom de l'entreprise est requis.";
  if (!f.firstName.trim()) erreurs.firstName = 'Votre prénom est requis.';
  if (!f.lastName.trim()) erreurs.lastName = 'Votre nom est requis.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) erreurs.email = 'Adresse e-mail invalide.';
  if (f.phone.replace(/\D/g, '').length < 10) erreurs.phone = 'Numéro de téléphone incomplet.';
  if (!f.consent) erreurs.consent = 'Nécessaire pour vous recontacter.';
  return erreurs;
}

function Champ({ id, label, erreur, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-body-sm font-semibold mb-1.5" style={{ color: BODY, ...headingFont }}>{label}</label>
      {children}
      {erreur && <p className="text-caption mt-1" style={{ color: '#a12626', ...bodyFont }}>{erreur}</p>}
    </div>
  );
}

export default function FormulaireDevis({ formation, couleur }) {
  const [form, setForm] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [etat, setEtat] = useState('idle'); // idle | sending | sent | error
  const [messageErreur, setMessageErreur] = useState('');
  const [messageOuvert, setMessageOuvert] = useState(false);
  const accent = couleur.fond;

  const set = (champ) => (e) => {
    const valeur = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((er) => ({ ...er, [champ]: undefined }));
  };
  const isCompany = form.applicantType !== 'INDIVIDUAL';
  const inscriptionTo = `/inscription/${formation.id}`;

  const envoyer = async (e) => {
    e.preventDefault();
    const er = valider(form);
    setErreurs(er);
    if (Object.keys(er).length > 0) return;

    setEtat('sending');
    setMessageErreur('');
    try {
      await createRegistration({
        formationId: formation.id,
        formationTitle: formation.title,
        applicantType: form.applicantType,
        companyName: isCompany ? form.companyName.trim() : null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        notes: form.message.trim() || null,
        quoteRequest: true,
      });
      setEtat('sent');
    } catch (err) {
      setEtat('error');
      setMessageErreur(err?.message || "L'envoi a échoué. Réessayez ou appelez-nous au 07 51 47 41 35.");
    }
  };

  return (
    <Bande id="devis" tone="pale">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-20 items-start">
        <div className="lg:pt-2">
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>Demande de devis</p>
          <h2 className="font-serif-display max-w-[16ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            Recevez le programme et votre devis sous 24 h
          </h2>
          <ul className="mt-7 space-y-3">
            {[
              'Un appel de 15 minutes pour valider votre projet et votre niveau',
              'Devis, programme officiel et convention, prêts pour votre financeur',
              'Sans engagement : vous décidez après avoir tout en main',
            ].map((r) => (
              <li key={r} className="flex items-start gap-3 text-body-base leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                <Check weight="bold" className="w-4 h-4 mt-1 shrink-0" style={{ color: accent }} />{r}
              </li>
            ))}
          </ul>
          <p className="text-body-sm mt-8 pt-6" style={{ color: BODY_MUTED, borderTop: `1px solid ${LINE}`, ...bodyFont }}>
            Déjà décidé ?{' '}
            <Link to={inscriptionTo} className="inline-flex items-center gap-1 font-semibold hover:underline" style={{ color: accent, ...headingFont }}>
              Je préfère m'inscrire directement <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>

        {etat === 'sent' ? (
          <div className="p-8 sm:p-10 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }} role="status">
            <CheckCircle weight="fill" className="w-10 h-10 mb-4" style={{ color: accent }} />
            <h3 className="font-serif-display text-h2" style={{ color: '#243037', ...serifFont }}>Demande bien reçue</h3>
            <p className="text-body-base leading-[1.6] mt-3 max-w-measure" style={{ color: BODY_MUTED, ...bodyFont }}>
              Merci {form.firstName}. Nous vous rappelons sous 24 h ouvrées au {form.phone} et vous adressons
              le programme et votre devis à {form.email}.
            </p>
            <Link to={inscriptionTo} className="inline-flex items-center gap-1 mt-6 text-body-sm font-semibold hover:underline" style={{ color: accent, ...headingFont }}>
              Aller plus loin : déposer ma demande d'inscription <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={envoyer} noValidate className="p-6 sm:p-8 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
            <div role="radiogroup" aria-label="Vous êtes" className="inline-flex flex-wrap gap-1 p-1" style={{ borderRadius: 999, background: MINT_LIGHT }}>
              {PROFILS.map(({ key, label }) => {
                const actif = form.applicantType === key;
                return (
                  <label
                    key={key}
                    className="h-10 px-5 inline-flex items-center rounded-full text-body-sm font-semibold cursor-pointer transition-colors"
                    style={{ background: actif ? accent : 'transparent', color: actif ? '#ffffff' : BODY, ...headingFont }}>
                    <input type="radio" name="applicantType" value={key} checked={actif} onChange={set('applicantType')} className="sr-only" />
                    {label}
                  </label>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4 mt-6">
              {isCompany && (
                <div className="sm:col-span-2">
                  <Champ id="devis-entreprise" label="Entreprise" erreur={erreurs.companyName}>
                    <input id="devis-entreprise" className={inputClass} style={inputStyle} value={form.companyName} onChange={set('companyName')} autoComplete="organization" />
                  </Champ>
                </div>
              )}
              <Champ id="devis-prenom" label="Prénom" erreur={erreurs.firstName}>
                <input id="devis-prenom" className={inputClass} style={inputStyle} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
              </Champ>
              <Champ id="devis-nom" label="Nom" erreur={erreurs.lastName}>
                <input id="devis-nom" className={inputClass} style={inputStyle} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
              </Champ>
              <Champ id="devis-email" label="E-mail" erreur={erreurs.email}>
                <input id="devis-email" type="email" className={inputClass} style={inputStyle} value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" />
              </Champ>
              <Champ id="devis-tel" label="Téléphone" erreur={erreurs.phone}>
                <input id="devis-tel" type="tel" className={inputClass} style={inputStyle} value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" />
              </Champ>
            </div>

            {messageOuvert ? (
              <div className="mt-4">
                <Champ id="devis-message" label="Votre contexte">
                  <textarea
                    id="devis-message"
                    rows={3}
                    className={`${inputClass} h-auto py-3 resize-y`}
                    style={inputStyle}
                    placeholder="Nombre de participants, date souhaitée, financement envisagé…"
                    value={form.message}
                    onChange={set('message')}
                  />
                </Champ>
              </div>
            ) : (
              <button type="button" onClick={() => setMessageOuvert(true)} className="mt-4 text-body-sm font-semibold hover:underline" style={{ color: accent, ...headingFont }}>
                + Préciser mon contexte (facultatif)
              </button>
            )}

            <label className="flex items-start gap-3 mt-5 cursor-pointer">
              <input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: accent }} />
              <span className="text-caption leading-[1.5]" style={{ color: BODY_MUTED, ...bodyFont }}>
                J'accepte d'être recontacté au sujet de cette formation. Données utilisées uniquement pour traiter ma demande
                (<Link to="/politique-confidentialite" className="underline">confidentialité</Link>).
              </span>
            </label>
            {erreurs.consent && <p className="text-caption mt-1" style={{ color: '#a12626', ...bodyFont }}>{erreurs.consent}</p>}

            {etat === 'error' && (
              <p role="alert" className="text-body-sm mt-4 rounded-[8px] px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
                {messageErreur}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6">
              <PrimaryButton type="submit" disabled={etat === 'sending'} style={{ background: accent }}>
                {etat === 'sending' ? 'Envoi en cours…' : 'Recevoir mon devis'}
              </PrimaryButton>
              <span className="text-caption" style={{ color: BODY_MUTED, ...bodyFont }}>Réponse sous 24 h ouvrées · Sans engagement</span>
            </div>
          </form>
        )}
      </div>
    </Bande>
  );
}
