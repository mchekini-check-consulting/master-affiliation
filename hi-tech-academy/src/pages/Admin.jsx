import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, LogOut, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import {
  adminCheckCredentials,
  adminGetRegistration,
  adminListRegistrations,
  adminUpdateStatus,
  clearAuth,
  getStoredAuth,
  storeAuth,
} from '@/api/backend';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const APPLICANT_LABELS = {
  COMPANY: 'Entreprise',
  INDEPENDENT: 'Indépendant',
  INDIVIDUAL: 'Particulier',
};

const STATUS_META = {
  PENDING: { label: 'En attente', background: '#fdf3e2', color: '#8a5a00' },
  VALIDATED: { label: 'Validée', background: '#e5f6ec', color: '#116632' },
  REFUSED: { label: 'Refusée', background: '#fdecec', color: '#a12626' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, background: '#f0f3fa', color: '#6b7a9b' };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: meta.background, color: meta.color, ...headingFont }}>
      {meta.label}
    </span>
  );
}

function Field({ label, value }) {
  if (value === null || value === undefined || value === '' || value === false) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#6b7a9b', ...headingFont }}>{label}</p>
      <p className="text-sm" style={{ color: '#001a4a', ...bodyFont }}>{value === true ? 'Oui' : value}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
      <h3 className="font-bold text-sm mb-4" style={{ color: '#001a4a', ...headingFont }}>{title}</h3>
      {children}
    </div>
  );
}

// --- Écran de connexion (basic auth) ---------------------------------
function LoginScreen({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const auth = { email: email.trim(), password };
    try {
      await adminCheckCredentials(auth);
      storeAuth(auth);
      onLoggedIn(auth);
    } catch (err) {
      setError(err.status === 401 ? 'Identifiants incorrects.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f7f9fd' }}>
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl p-8"
        style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <div className="text-center mb-6">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: '#005064' }} />
          <h1 className="text-xl font-bold" style={{ color: '#001a4a', ...headingFont }}>
            Administration
          </h1>
          <p className="text-xs mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
            Hi-Tech Academy — demandes d'inscription
          </p>
        </div>

        <label className="block mb-4">
          <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>Adresse email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#005064]"
            style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
        </label>
        <label className="block mb-6">
          <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#005064]"
            style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
        </label>

        {error && (
          <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{ background: '#005064', color: 'white', ...headingFont }}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

// --- Détail d'une demande --------------------------------------------
function RegistrationDetail({ auth, id, onBack, onStatusChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    adminGetRegistration(auth, id).then(setDetail).catch((e) => setError(e.message));
  }, [auth, id]);

  useEffect(load, [load]);

  const decide = async (status) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await adminUpdateStatus(auth, id, status);
      setDetail(updated);
      onStatusChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (error && !detail) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!detail) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  const isCompany = detail.applicant_type !== 'INDIVIDUAL';
  const na = detail.needs_analysis;
  const address = [detail.address_line, detail.address_complement, detail.postal_code, detail.city, detail.country]
    .filter(Boolean).join(', ');

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold mb-5"
        style={{ color: '#005064', ...headingFont }}>
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#001a4a', ...headingFont }}>
            {detail.first_name} {detail.last_name}
            {detail.company_name ? ` — ${detail.company_name}` : ''}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
            {APPLICANT_LABELS[detail.applicant_type]} · Demande du {formatDate(detail.created_at)} ·
            Formation : <strong>{detail.formation_title}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={detail.status} />
          {detail.status === 'PENDING' && (
            <>
              <button
                type="button"
                disabled={updating}
                onClick={() => decide('VALIDATED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: '#116632', color: 'white', ...headingFont }}>
                <CheckCircle2 className="w-4 h-4" />
                Valider
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => decide('REFUSED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: '#a12626', color: 'white', ...headingFont }}>
                <XCircle className="w-4 h-4" />
                Refuser
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs mb-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {isCompany && (
          <Card title="Informations de l'entreprise">
            <div className="space-y-3">
              <Field label="Nom de l'entreprise" value={detail.company_name} />
              <Field label="Adresse" value={address} />
              <Field label="N° SIRET" value={detail.siret} />
              <Field label="NAF" value={detail.naf} />
              <Field label="Typologie du client" value={detail.client_typology} />
              <Field label="Forme juridique" value={detail.legal_form} />
              <Field label="Email de facturation" value={detail.billing_email} />
            </div>
          </Card>
        )}

        <Card title={isCompany ? "Référent de l'entreprise" : 'Informations personnelles'}>
          <div className="space-y-3">
            <Field label="Civilité" value={detail.civility} />
            <Field label="Prénom" value={detail.first_name} />
            <Field label="Nom" value={detail.last_name} />
            <Field label="Adresse email" value={detail.email} />
            <Field label="N° de téléphone" value={detail.phone} />
            <Field label="Fonction" value={detail.job_title} />
            {!isCompany && <Field label="Adresse" value={address} />}
            <Field label="Notes complémentaires" value={detail.notes} />
          </div>
        </Card>

        {!isCompany && (
          <Card title="Informations complémentaires">
            <div className="space-y-3">
              <Field label="N° de téléphone 2" value={detail.phone2} />
              <Field label="Type de stagiaire" value={detail.trainee_type} />
              <Field label="Date de naissance" value={detail.birth_date} />
              <Field label="Ville de naissance" value={detail.birth_city} />
              <Field label="Département de naissance" value={detail.birth_department} />
              <Field label="Nationalité" value={detail.nationality} />
              <Field label="N° de sécurité sociale" value={detail.social_security_number} />
              <Field label="Niveau de diplôme" value={detail.diploma_level} />
              <Field label="Intitulé du diplôme" value={detail.diploma_title} />
              <Field label="Poste occupé" value={detail.current_position} />
              <Field label="Besoins d'adaptation (handicap, contraintes...)" value={detail.needs_adaptation} />
            </div>
          </Card>
        )}

        <Card title="Questionnaire d'analyse du besoin">
          {na ? (
            <div className="space-y-3">
              <div
                className="rounded-xl px-4 py-3 text-sm font-bold inline-block"
                style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                Note de positionnement : {na.score} / {na.max_score}
              </div>
              <Field label="Répondu le" value={formatDate(na.submitted_at)} />
              <Field label="Entreprise / fonction" value={na.company_role} />
              <Field label="Financeur envisagé" value={na.funder} />
              <Field label="Activité et environnement technique" value={na.activity_context} />
              <Field label="Besoin / problème à résoudre" value={na.problem_to_solve} />
              <Field label="Objectifs attendus" value={na.expected_objectives} />
              <Field label="Niveau Linux" value={na.level_linux} />
              <Field label="Niveau Docker / conteneurs" value={na.level_docker} />
              <Field label="Niveau Kubernetes" value={na.level_kubernetes} />
              <Field label="Cas d'usage à traiter" value={na.specific_use_case} />
              <Field label="Contraintes de planning" value={na.planning_constraints} />
              <Field label="Besoin d'aménagement (handicap)" value={na.needs_adaptation} />
              <Field label="Précisions sur l'aménagement" value={na.adaptation_details} />
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
              Le questionnaire n'a pas encore été renseigné par l'apprenant.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// --- Liste des demandes ----------------------------------------------
function RegistrationList({ auth, onSelect }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    adminListRegistrations(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load]);

  const pendingCount = useMemo(
    () => (items ?? []).filter((i) => i.status === 'PENDING').length,
    [items]
  );

  if (error) {
    return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  }
  if (!items) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
          {items.length} demande{items.length > 1 ? 's' : ''} — {pendingCount} en attente
        </p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: '#005064', ...headingFont }}>
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
            Aucune demande d'inscription reçue pour le moment.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <table className="w-full text-left" style={{ minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                {['Date', 'Demandeur', 'Profil', 'Formation', 'Questionnaire', 'Statut'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: '#6b7a9b', ...headingFont }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="cursor-pointer transition-colors hover:bg-[#f7f9fd]"
                  style={{ borderBottom: '1px solid #f0f3fa' }}>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                      {item.company_name || item.email}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {APPLICANT_LABELS[item.applicant_type]}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {item.formation_title}
                  </td>
                  <td className="px-4 py-3.5">
                    {item.has_needs_analysis ? (
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: '#e5f6ec', color: '#116632', ...headingFont }}>
                        Répondu — {item.needs_analysis_score}/{item.needs_analysis_max_score}
                      </span>
                    ) : (
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: '#f0f3fa', color: '#6b7a9b', ...headingFont }}>
                        Non répondu
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Page /admin ------------------------------------------------------
export default function Admin() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [selectedId, setSelectedId] = useState(null);
  const [listVersion, setListVersion] = useState(0);

  useEffect(() => {
    document.title = 'Administration — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  const logout = () => {
    clearAuth();
    setAuth(null);
    setSelectedId(null);
  };

  if (!auth) {
    return <LoginScreen onLoggedIn={setAuth} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#f7f9fd' }}>
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between" style={{ background: 'white', borderBottom: '1px solid #e0e8f4' }}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6" style={{ color: '#005064' }} />
          <div>
            <h1 className="text-base font-bold leading-tight" style={{ color: '#001a4a', ...headingFont }}>
              Administration — Demandes d'inscription
            </h1>
            <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{auth.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: '#a12626', ...headingFont }}>
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {selectedId ? (
          <RegistrationDetail
            auth={auth}
            id={selectedId}
            onBack={() => setSelectedId(null)}
            onStatusChanged={() => setListVersion((v) => v + 1)} />
        ) : (
          <RegistrationList key={listVersion} auth={auth} onSelect={setSelectedId} />
        )}
      </main>
    </div>
  );
}
