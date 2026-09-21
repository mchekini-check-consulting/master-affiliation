// Consentement aux cookies (CNIL, article 82 de la loi Informatique et Libertés).
//
// Trois règles tenues par ce module :
//   1. rien n'est déposé avant un choix explicite : tant que le visiteur n'a
//      pas tranché, `analytics` et `ads` valent false ;
//   2. refuser est aussi simple qu'accepter : les deux se font en un clic
//      depuis le bandeau ;
//   3. le choix est révocable à tout moment (lien du pied de page) et
//      réexpire au bout de six mois, durée recommandée par la CNIL.

const STORAGE_KEY = 'hta.cookie-consent.v1';
const CONSENT_MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 mois
export const CONSENT_EVENT = 'hta:cookie-consent';

/** Catégories affichées dans le panneau de réglages. */
export const CATEGORIES = [
  {
    id: 'necessary',
    label: 'Strictement nécessaires',
    required: true,
    description:
      "Session de connexion et préférences d'affichage. Sans eux, l'inscription et l'espace apprenant ne fonctionnent pas. Exemptés de consentement.",
  },
  {
    id: 'analytics',
    label: "Mesure d'audience",
    required: false,
    description:
      'Nombre de visites, pages consultées, parcours sur le site. Ces statistiques nous servent à améliorer le catalogue et les pages de formation.',
  },
  {
    id: 'ads',
    label: 'Publicité et réseaux sociaux',
    required: false,
    description:
      "Mesure de l'efficacité de nos campagnes et affichage d'annonces adaptées à vos centres d'intérêt sur d'autres sites.",
  },
];

const DENY_ALL = { necessary: true, analytics: false, ads: false };
const ALLOW_ALL = { necessary: true, analytics: true, ads: true };

export const denyAll = () => ({ ...DENY_ALL });
export const allowAll = () => ({ ...ALLOW_ALL });

/**
 * Choix enregistré, ou null si le visiteur n'a pas encore tranché.
 * Un choix de plus de six mois est traité comme absent : le bandeau revient.
 */
export function readConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.date !== 'number') return null;
    if (Date.now() - parsed.date > CONSENT_MAX_AGE_MS) return null;

    return {
      ...DENY_ALL,
      analytics: parsed.analytics === true,
      ads: parsed.ads === true,
    };
  } catch {
    // Navigation privée ou stockage bloqué : on retombe sur « pas de choix »,
    // donc sur le refus par défaut.
    return null;
  }
}

/** Enregistre un choix et prévient le reste de l'application. */
export function writeConsent(choice) {
  const value = { ...DENY_ALL, ...choice, necessary: true };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...value, date: Date.now() }));
  } catch {
    // Le choix vaut pour la session en cours même si l'écriture échoue.
  }

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}

/** Efface le choix : le bandeau réapparaît au prochain rendu. */
export function clearConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sans stockage, il n'y a rien à effacer.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/** Ouvre le panneau de réglages depuis n'importe où (pied de page, page cookies). */
export const OPEN_SETTINGS_EVENT = 'hta:cookie-settings';
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

/**
 * true si la catégorie a été acceptée. À appeler avant de charger le moindre
 * script de mesure ou de publicité.
 */
export function hasConsent(category) {
  const consent = readConsent();
  return consent ? consent[category] === true : false;
}
