// Appel découverte : le CTA unique du tunnel de vente (30 minutes, gratuit).
// Un seul endroit pour brancher Calendly : renseigner CALENDLY_URL et tous
// les boutons du site ouvrent Calendly dans un nouvel onglet. Tant qu'elle
// est vide, ils retombent sur le formulaire interne de demande de rendez-vous
// (/contact?mode=rendez-vous), qui fonctionne déjà.
export const CALENDLY_URL = 'https://calendly.com/contact-hi-techacademy/point-strategique';

/**
 * Props à étaler sur un <PrimaryButton> ou un <Link> : `{ href, target, rel }`
 * vers Calendly si l'URL est renseignée, sinon `{ to }` vers le formulaire
 * interne (préfiltré sur la formation).
 */
export function rdvProps(formationId) {
  if (CALENDLY_URL) {
    return { href: CALENDLY_URL, target: '_blank', rel: 'noreferrer' };
  }
  return { to: `/contact?mode=rendez-vous${formationId ? `&formation=${formationId}` : ''}` };
}
