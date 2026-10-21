import React, { useEffect, useState } from 'react';
import { Award, DatabaseBackup, FolderOpen, GraduationCap, Handshake, Inbox, LogOut, Menu, MessageSquareWarning, ReceiptText, Rss, ShieldCheck, TrendingUp, UsersRound, Workflow, X } from 'lucide-react';
import { adminCheckCredentials, clearAuth, getStoredAuth, storeAuth } from '@/api/backend';
import { bodyFont, headingFont } from '@/pages/admin/common';
import RequestsView from '@/pages/admin/RequestsView';
import FormationsView from '@/pages/admin/FormationsView';
import LearnersView from '@/pages/admin/LearnersView';
import CertificatesView from '@/pages/admin/CertificatesView';
import BillingView from '@/pages/admin/BillingView';
import DocumentsView from '@/pages/admin/DocumentsView';
import ComplaintsView from '@/pages/admin/ComplaintsView';
import AuditQualiopiView from '@/pages/admin/AuditQualiopiView';
import ProcessQualiopiView from '@/pages/admin/ProcessQualiopiView';
import VeilleView from '@/pages/admin/VeilleView';
import SeoGeoView from '@/pages/admin/SeoGeoView';
import CrmView from '@/pages/admin/CrmView';
import BackupView from '@/pages/admin/BackupView';

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
            Hi-Tech Academy — organisme de formation
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

// --- Navigation de la sidebar ----------------------------------------
const NAV_ITEMS = [
  { key: 'formations', label: 'Formations', icon: GraduationCap },
  { key: 'requests', label: 'Demandes à traiter', icon: Inbox },
  { key: 'crm', label: 'CRM', icon: Handshake },
  { key: 'learners', label: 'Dossiers apprenants', icon: UsersRound },
  { key: 'certificates', label: 'Certificats de réalisation', icon: Award },
  { key: 'billing', label: 'Devis & Factures', icon: ReceiptText },
  { key: 'complaints', label: 'Réclamations', icon: MessageSquareWarning },
  { key: 'veille', label: 'Veille', icon: Rss },
  { key: 'seo', label: 'SEO / GEO', icon: TrendingUp },
  { key: 'documents', label: 'Documents Qualiopi', icon: FolderOpen },
  { key: 'process', label: 'Process Qualiopi', icon: Workflow },
  { key: 'audit', label: 'Audit Qualiopi', icon: ShieldCheck },
  { key: 'backup', label: 'Sauvegardes', icon: DatabaseBackup },
];

// --- Logo + intitulé (partagé sidebar / topbar / drawer) --------------
function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
        style={{ background: '#005064', color: 'white', ...headingFont }}>
        HT
      </div>
      <div>
        <p className="text-sm font-bold leading-tight" style={{ color: 'white', ...headingFont }}>
          Hi-Tech Academy
        </p>
        <p className="text-[11px]" style={{ color: '#8ba0c4', ...bodyFont }}>Administration</p>
      </div>
    </div>
  );
}

// --- Liste de navigation + pied (partagée sidebar / drawer) -----------
function NavPanel({ view, onNavigate, email, onLogout }) {
  return (
    <>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-colors"
              style={{
                background: active ? '#005064' : 'transparent',
                color: active ? 'white' : '#8ba0c4',
                ...headingFont,
              }}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid rgba(139,160,196,0.2)' }}>
        <p className="px-3.5 pb-2 text-[11px] truncate" style={{ color: '#8ba0c4', ...bodyFont }}>
          {email}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left"
          style={{ color: '#f0a5a5', ...headingFont }}>
          <LogOut className="w-[18px] h-[18px]" />
          Se déconnecter
        </button>
      </div>
    </>
  );
}

// --- Balises PWA injectées uniquement sur /admin ----------------------
// Le manifest rend l'admin installable (Android : « Installer l'application »,
// iOS : Partager → « Sur l'écran d'accueil ») sans toucher au site public.
// Pas de service worker : l'admin vit sur les données de l'API, un cache
// offline ne ferait que servir du périmé après chaque déploiement.
function useAdminPwaTags() {
  useEffect(() => {
    const tags = [
      ['link', { rel: 'manifest', href: '/admin-manifest.webmanifest' }],
      ['link', { rel: 'apple-touch-icon', href: '/images/admin-icon-180.png' }],
      ['meta', { name: 'theme-color', content: '#001a4a' }],
      ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
      ['meta', { name: 'apple-mobile-web-app-title', content: 'HTA Admin' }],
    ].map(([tag, attrs]) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      return el;
    });
    return () => tags.forEach((el) => el.remove());
  }, []);
}

// --- Page /admin ------------------------------------------------------
export default function Admin() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [view, setView] = useState('requests');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestsFormationFilter, setRequestsFormationFilter] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useAdminPwaTags();

  useEffect(() => {
    document.title = 'Administration — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  const logout = () => {
    clearAuth();
    setAuth(null);
    setView('requests');
    setSelectedRequestId(null);
    setMenuOpen(false);
  };

  const navigate = (key) => {
    setView(key);
    if (key !== 'requests') setSelectedRequestId(null);
    setMenuOpen(false);
  };

  // Depuis les autres vues : ouvrir une demande précise dans « Demandes à traiter »
  const openRequest = (id) => {
    setSelectedRequestId(id);
    setView('requests');
  };

  if (!auth) {
    return <LoginScreen onLoggedIn={setAuth} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#f7f9fd' }}>

      {/* Sidebar — desktop uniquement */}
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen"
        style={{ background: '#001a4a' }}>
        <div className="px-5 py-6">
          <Brand />
        </div>
        <NavPanel view={view} onNavigate={navigate} email={auth.email} onLogout={logout} />
      </aside>

      {/* Topbar — mobile et tablette */}
      <header
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: '#001a4a', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <Brand />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="w-11 h-11 -mr-1.5 flex items-center justify-center rounded-xl"
          style={{ color: 'white' }}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Drawer de navigation — mobile et tablette */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,26,74,0.55)' }}
            onClick={() => setMenuOpen(false)} />
          <div
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col"
            style={{ background: '#001a4a', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="px-5 py-5 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="w-11 h-11 -mr-1.5 flex items-center justify-center rounded-xl"
                style={{ color: '#8ba0c4' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavPanel view={view} onNavigate={navigate} email={auth.email} onLogout={logout} />
          </div>
        </div>
      )}

      {/* Contenu : pleine largeur à côté de la sidebar */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-5 sm:py-8 overflow-x-hidden">
        <div className="w-full">
          {view === 'formations' && (
            <FormationsView
              auth={auth}
              onOpenRequests={(formationId) => {
                setRequestsFormationFilter(formationId ?? null);
                setView('requests');
              }} />
          )}
          {view === 'requests' && (
            <RequestsView
              auth={auth}
              selectedId={selectedRequestId}
              onSelect={setSelectedRequestId}
              initialFormation={requestsFormationFilter} />
          )}
          {view === 'learners' && (
            <LearnersView auth={auth} onOpenRequest={openRequest} />
          )}
          {view === 'certificates' && (
            <CertificatesView auth={auth} />
          )}
          {view === 'billing' && (
            <BillingView auth={auth} />
          )}
          {view === 'complaints' && (
            <ComplaintsView auth={auth} />
          )}
          {view === 'documents' && (
            <DocumentsView />
          )}
          {view === 'veille' && (
            <VeilleView auth={auth} />
          )}
          {view === 'seo' && (
            <SeoGeoView auth={auth} />
          )}
          {view === 'crm' && (
            <CrmView auth={auth} />
          )}
          {view === 'process' && (
            <ProcessQualiopiView onNavigate={setView} />
          )}
          {view === 'audit' && (
            <AuditQualiopiView />
          )}
          {view === 'backup' && (
            <BackupView auth={auth} />
          )}
        </div>
      </main>
    </div>
  );
}
