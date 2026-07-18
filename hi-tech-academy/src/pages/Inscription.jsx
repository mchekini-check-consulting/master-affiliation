import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, UserRound, BriefcaseBusiness, ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFormationById } from '@/data/formations';
import { createRegistration } from '@/api/backend';

// Options identiques au formulaire d'inscription Qualiobee
export const CLIENT_TYPOLOGIES = [
  'Entreprise (formant ses salariés)',
  'Pouvoirs publics (formant ses agents)',
  'Gestionnaire de fonds',
  'Pouvoirs publics (formant un public spécifique)',
  'Autre organisme (dont CFA)',
  'Autre',
];

export const LEGAL_FORMS = ['SARL', 'SAS', 'SASU', 'SA', 'EURL', 'EI', 'Association', 'Collectivité', 'Autre'];

export const CIVILITIES = ['Monsieur', 'Madame', 'Non précisé'];

export const TRAINEE_TYPES = [
  "Salarié d'employeurs privés hors apprentis",
  'Apprenti',
  "Personne en recherche d'emploi",
  'Particulier à ses propres frais',
  'Autre',
];

export const DIPLOMA_LEVELS = [
  'Doctorat',
  'Master',
  "Diplôme d'ingénieur",
  "Diplôme d'école de commerce",
  'Autre diplôme ou titre de niveau bac+5 ou plus',
  'Licence professionnelle',
  'Licence générale',
  'Bachelor universitaire de technologie (BUT)',
  'Autre diplôme ou titre de niveau bac+3 ou 4',
  'Brevet de Technicien Supérieur (BTS)',
  'Diplôme Universitaire de Technologie (DUT)',
  'Autre diplôme ou titre de niveau bac+2',
  'Baccalauréat professionnel',
  'Baccalauréat général',
  'Baccalauréat technologique',
  'Diplôme de spécialisation professionnelle',
  'Autre diplôme ou titre de niveau bac',
  'CAP',
  'BEP',
];

export const NATIONALITIES = [
  'Française', 'Allemande', 'Algérienne', 'Américaine', 'Belge', 'Britannique', 'Camerounaise',
  'Canadienne', 'Chinoise', 'Espagnole', 'Indienne', 'Italienne', 'Ivoirienne', 'Libanaise',
  'Malgache', 'Marocaine', 'Portugaise', 'Roumaine', 'Sénégalaise', 'Suisse', 'Tunisienne', 'Autre',
];

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const inputClass =
  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ' +
  'focus:border-[#005064] bg-white';
const inputStyle = { borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont };

export function TextField({ label, value, onChange, required, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
        {label} {required && <span style={{ color: '#c2410c' }}>*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle} />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, required, placeholder = '—' }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
        {label} {required && <span style={{ color: '#c2410c' }}>*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function TextAreaField({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle} />
    </label>
  );
}

export function SectionTitle({ children }) {
  return (
    <h3 className="font-bold text-base mt-8 mb-4" style={{ color: '#001a4a', ...headingFont }}>
      {children}
    </h3>
  );
}

// Stepper repris du parcours Qualiobee : envoi > attente > validation
export function Stepper({ current }) {
  const steps = ['Envoyer ma demande', 'Demande en attente', 'Demande validée'];
  return (
    <div className="rounded-2xl p-5 mb-8" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
      <div className="grid grid-cols-3 gap-4">
        {steps.map((label, i) => {
          const active = i <= current;
          return (
            <div key={label} className="text-center">
              <div
                className="w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-2"
                style={{
                  background: active ? '#005064' : '#f0f3fa',
                  color: active ? 'white' : '#6b7a9b',
                  ...headingFont,
                }}>
                {i + 1}
              </div>
              <p className="text-xs sm:text-sm font-semibold" style={{ color: active ? '#001a4a' : '#6b7a9b', ...headingFont }}>
                {label}
              </p>
              <div className="h-1 rounded-full mt-3" style={{ background: active ? '#005064' : '#e0e8f4' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const APPLICANT_MODES = [
  { key: 'COMPANY', label: 'Je suis une entreprise', icon: Building2 },
  { key: 'INDEPENDENT', label: 'Je suis un indépendant', icon: BriefcaseBusiness },
  { key: 'INDIVIDUAL', label: 'Je suis un particulier', icon: UserRound },
];

const emptyForm = {
  // Entreprise
  companyName: '', siret: '', naf: '', clientTypology: '', legalForm: '', billingEmail: '',
  // Adresse
  addressLine: '', addressComplement: '', postalCode: '', city: '', country: '',
  // Référent / apprenant
  civility: '', firstName: '', lastName: '', email: '', phone: '', jobTitle: '', notes: '',
  // Particulier
  phone2: '', traineeType: 'Particulier à ses propres frais', birthDate: '', birthCity: '',
  birthDepartment: '', nationality: '', socialSecurityNumber: '', diplomaLevel: '',
  diplomaTitle: '', currentPosition: '', needsAdaptation: false,
};

export default function Inscription() {
  const { formationId } = useParams();
  const formation = getFormationById(formationId);

  const [mode, setMode] = useState('COMPANY');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    document.title = "Demande d'inscription — Hi-Tech Academy";
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const isCompanyMode = mode !== 'INDIVIDUAL';

  const missingFields = useMemo(() => {
    const missing = [];
    if (isCompanyMode && !form.companyName.trim()) missing.push("Nom de l'entreprise");
    if (!form.firstName.trim()) missing.push('Prénom');
    if (!form.lastName.trim()) missing.push('Nom');
    if (!form.email.trim()) missing.push('Adresse email');
    if (!form.phone.trim()) missing.push('N° de téléphone');
    return missing;
  }, [form, isCompanyMode]);

  if (!formation) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <Header />
        <main className="pt-32 pb-20 text-center">
          <p style={{ color: '#001a4a', ...headingFont }}>Formation introuvable.</p>
          <Link to="/" className="underline text-sm" style={{ color: '#005064', ...bodyFont }}>Retour à l'accueil</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const submit = async () => {
    if (missingFields.length > 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const clean = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);
      const payload = {
        formation_id: formation.id,
        formation_title: formation.title,
        applicant_type: mode,
        company_name: isCompanyMode ? clean(form.companyName) : null,
        siret: isCompanyMode ? clean(form.siret) : null,
        naf: isCompanyMode ? clean(form.naf) : null,
        client_typology: isCompanyMode ? clean(form.clientTypology) : null,
        legal_form: isCompanyMode ? clean(form.legalForm) : null,
        billing_email: isCompanyMode ? clean(form.billingEmail) : null,
        address_line: clean(form.addressLine),
        address_complement: clean(form.addressComplement),
        postal_code: clean(form.postalCode),
        city: clean(form.city),
        country: clean(form.country),
        civility: !isCompanyMode ? clean(form.civility) : null,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        job_title: isCompanyMode ? clean(form.jobTitle) : null,
        notes: clean(form.notes),
        phone2: !isCompanyMode ? clean(form.phone2) : null,
        trainee_type: !isCompanyMode ? clean(form.traineeType) : null,
        birth_date: !isCompanyMode ? clean(form.birthDate) : null,
        birth_city: !isCompanyMode ? clean(form.birthCity) : null,
        birth_department: !isCompanyMode ? clean(form.birthDepartment) : null,
        nationality: !isCompanyMode ? clean(form.nationality) : null,
        social_security_number: !isCompanyMode ? clean(form.socialSecurityNumber) : null,
        diploma_level: !isCompanyMode ? clean(form.diplomaLevel) : null,
        diploma_title: !isCompanyMode ? clean(form.diplomaTitle) : null,
        current_position: !isCompanyMode ? clean(form.currentPosition) : null,
        needs_adaptation: !isCompanyMode ? form.needsAdaptation : false,
      };
      const result = await createRegistration(payload);
      setCreated(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Écran de confirmation (étape 2 : demande en attente) -----------
  if (created) {
    return (
      <div className="min-h-screen" style={{ background: '#f7f9fd' }}>
        <TopBar />
        <Header />
        <main className="pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Stepper current={1} />
            <div className="rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#005064' }} />
              <h1 className="text-2xl font-bold mb-3" style={{ color: '#001a4a', ...headingFont }}>
                Votre demande a bien été envoyée
              </h1>
              <p className="text-sm mb-2" style={{ color: '#6b7a9b', ...bodyFont }}>
                Votre demande d'inscription à la formation <strong>{formation.title}</strong> est en attente
                de validation. Nous revenons vers vous sous 24 h ouvrées.
              </p>
              <p className="text-sm mb-8" style={{ color: '#6b7a9b', ...bodyFont }}>
                Pour préparer au mieux votre formation, merci de compléter dès maintenant le
                questionnaire d'analyse du besoin (5 minutes).
              </p>
              <Link
                to={`/inscription/demande/${created.id}/questionnaire`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                <ClipboardList className="w-4 h-4" />
                Répondre au questionnaire d'analyse du besoin
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Formulaire (étape 1) -------------------------------------------
  return (
    <div className="min-h-screen" style={{ background: '#f7f9fd' }}>
      <TopBar />
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-8">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
              style={{ color: '#002d74', ...headingFont }}>
              {formation.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#001a4a', ...headingFont }}>
              Émettre une demande d'inscription
            </h1>
          </div>

          <Stepper current={0} />

          <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
            <h2 className="font-bold text-lg mb-4" style={{ color: '#001a4a', ...headingFont }}>
              Mes informations
            </h2>

            {/* Choix du profil */}
            <div className="grid sm:grid-cols-3 gap-3 mb-2">
              {APPLICANT_MODES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className="rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all"
                  style={{
                    border: mode === key ? '1.5px solid #005064' : '1px solid #e0e8f4',
                    background: mode === key ? '#f0f3fa' : 'white',
                    color: mode === key ? '#005064' : '#6b7a9b',
                    ...headingFont,
                  }}>
                  <Icon className="w-4 h-4 mb-1.5" />
                  {label}
                </button>
              ))}
            </div>

            {mode === 'INDEPENDENT' && (
              <p
                className="text-xs rounded-xl px-4 py-3 mt-3"
                style={{ background: '#f0f3fa', color: '#005064', ...bodyFont }}>
                Vous serez automatiquement ajouté en tant qu'apprenant dans la suite de cette demande
                d'inscription : la formation est destinée au président / gérant de l'entreprise.
              </p>
            )}

            {isCompanyMode ? (
              <>
                <SectionTitle>Informations de l'entreprise</SectionTitle>
                <div className="space-y-4">
                  <TextField label="Nom de l'entreprise" required value={form.companyName} onChange={set('companyName')} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Adresse" value={form.addressLine} onChange={set('addressLine')} />
                    <TextField label="Complément d'adresse" value={form.addressComplement} onChange={set('addressComplement')} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <TextField label="Code postal" value={form.postalCode} onChange={set('postalCode')} />
                    <TextField label="Ville" value={form.city} onChange={set('city')} />
                    <TextField label="Pays" value={form.country} onChange={set('country')} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="N° SIRET" value={form.siret} onChange={set('siret')} />
                    <TextField label="NAF" value={form.naf} onChange={set('naf')} />
                  </div>
                  <SelectField label="Typologie du client" value={form.clientTypology} onChange={set('clientTypology')} options={CLIENT_TYPOLOGIES} />
                  <SelectField label="Forme juridique" value={form.legalForm} onChange={set('legalForm')} options={LEGAL_FORMS} />
                  <TextField label="Email de facturation" type="email" value={form.billingEmail} onChange={set('billingEmail')} />
                </div>

                <SectionTitle>{mode === 'INDEPENDENT' ? "Référent de l'entreprise (vous-même)" : "Référent de l'entreprise"}</SectionTitle>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Prénom" required value={form.firstName} onChange={set('firstName')} />
                    <TextField label="Nom" required value={form.lastName} onChange={set('lastName')} />
                  </div>
                  <TextField label="Adresse email" required type="email" value={form.email} onChange={set('email')} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Fonction" value={form.jobTitle} onChange={set('jobTitle')} placeholder={mode === 'INDEPENDENT' ? 'Président, gérant…' : ''} />
                    <TextField label="N° de téléphone" required value={form.phone} onChange={set('phone')} />
                  </div>
                  <TextAreaField label="Notes complémentaires" value={form.notes} onChange={set('notes')} />
                </div>
              </>
            ) : (
              <>
                <SectionTitle>Informations personnelles</SectionTitle>
                <div className="space-y-4">
                  <SelectField label="Civilité" value={form.civility} onChange={set('civility')} options={CIVILITIES} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Prénom" required value={form.firstName} onChange={set('firstName')} />
                    <TextField label="Nom" required value={form.lastName} onChange={set('lastName')} />
                  </div>
                  <TextField label="Adresse email" required type="email" value={form.email} onChange={set('email')} />
                  <TextField label="N° de téléphone" required value={form.phone} onChange={set('phone')} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Adresse" value={form.addressLine} onChange={set('addressLine')} />
                    <TextField label="Complément d'adresse" value={form.addressComplement} onChange={set('addressComplement')} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <TextField label="Code postal" value={form.postalCode} onChange={set('postalCode')} />
                    <TextField label="Ville" value={form.city} onChange={set('city')} />
                    <TextField label="Pays" value={form.country} onChange={set('country')} />
                  </div>
                </div>

                <SectionTitle>Informations complémentaires</SectionTitle>
                <div className="space-y-4">
                  <TextField label="N° de téléphone 2" value={form.phone2} onChange={set('phone2')} />
                  <SelectField label="Type de stagiaire" value={form.traineeType} onChange={set('traineeType')} options={TRAINEE_TYPES} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <TextField label="Date de naissance" type="date" value={form.birthDate} onChange={set('birthDate')} />
                    <TextField label="Ville de naissance" value={form.birthCity} onChange={set('birthCity')} />
                    <TextField label="Département de naissance" value={form.birthDepartment} onChange={set('birthDepartment')} />
                  </div>
                  <SelectField label="Nationalité" value={form.nationality} onChange={set('nationality')} options={NATIONALITIES} />
                  <TextField label="N° de sécurité sociale" value={form.socialSecurityNumber} onChange={set('socialSecurityNumber')} />
                  <SelectField label="Niveau de diplôme" value={form.diplomaLevel} onChange={set('diplomaLevel')} options={DIPLOMA_LEVELS} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Intitulé du diplôme" value={form.diplomaTitle} onChange={set('diplomaTitle')} />
                    <TextField label="Poste occupé" value={form.currentPosition} onChange={set('currentPosition')} />
                  </div>
                  <TextAreaField label="Notes complémentaires" value={form.notes} onChange={set('notes')} />
                  <label className="flex items-start gap-2.5 text-sm cursor-pointer" style={{ color: '#001a4a', ...bodyFont }}>
                    <input
                      type="checkbox"
                      checked={form.needsAdaptation}
                      onChange={(e) => set('needsAdaptation')(e.target.checked)}
                      className="mt-0.5 accent-[#005064]" />
                    A des besoins d'adaptation (handicap, contraintes...)
                  </label>
                </div>
              </>
            )}

            {/* Envoi */}
            <div className="mt-8">
              {missingFields.length > 0 && (
                <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdf3e2', color: '#8a5a00', ...bodyFont }}>
                  <strong>Champs manquants :</strong> {missingFields.join(', ')}
                </p>
              )}
              {submitError && (
                <p className="text-xs mb-3 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
                  {submitError}
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={missingFields.length > 0 || submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#005064', color: 'white', ...headingFont }}>
                {submitting ? 'Envoi en cours…' : 'Émettre ma demande'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center mt-6" style={{ color: '#6b8a8b', ...bodyFont }}>
            HI-TECH ACADEMY — Siret 92269564800027 — NAF 85.59A — Déclaration d'activité n° 11756755575
            (préfet de région d'Île-de-France). Les informations recueillies servent uniquement au
            traitement de votre demande d'inscription.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
