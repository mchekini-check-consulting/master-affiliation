import React from 'react';
import { Link } from 'react-router-dom';
import LogoMark from '@/components/LogoMark';
import { ArrowRight, FacebookLogo as Facebook, InstagramLogo as Instagram, LinkedinLogo as Linkedin, YoutubeLogo as Youtube } from '@phosphor-icons/react';
import { formations as catalogue } from '@/data/formations';
import { openCookieSettings } from '@/lib/cookieConsent';
import '@/styles/footer.css';

// Pied de page : registre institutionnel (grande école) — un aplat marine,
// le nom de l'organisme en grand, quatre colonnes de liens, la certification
// officielle et les mentions réglementaires. Pas de newsletter (rien ne la
// reçoit), pas de bandeau de promesses : ce qui reste est utile ou obligatoire.

const columns = [
  {
    title: 'Formations',
    links: [
      ...catalogue.map((f) => ({ label: f.title, href: `/formations/${f.id}` })),
      { label: 'Tout le catalogue', href: '/formations', arrow: true },
    ],
  },
  {
    title: "L'organisme",
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'À propos', href: '/#about' },
      { label: 'Financer sa formation', href: '/financements' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Documents',
    links: [
      { label: "Livret d'accueil", href: '/documents/qualiopi/Livret_accueil_V1.0.pdf', file: true },
      { label: 'Règlement intérieur', href: '/documents/qualiopi/Reglement_interieur_V1.0.pdf', file: true },
      { label: "Politique d'accessibilité", href: '/documents/qualiopi/Accessibilite_handicap_V1.0.pdf', file: true },
      { label: 'Déposer une réclamation', href: '/reclamations' },
    ],
  },
  {
    title: 'Informations légales',
    links: [
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
      { label: 'Politique de cookies', href: '/politique-cookies' },
      { label: 'Gestion des cookies', action: 'cookies' },
      { label: 'Conditions générales de vente', href: '/conditions-vente' },
    ],
  },
];

const socials = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

// Lien interne (react-router), externe/fichier (<a>), ou action (bouton).
function FooterLink({ link }) {
  // « Gestion des cookies » rouvre le panneau de consentement : c'est une
  // action, pas une page, mais elle doit rester dans la colonne légale car
  // la CNIL impose un accès permanent au retrait du consentement.
  if (link.action === 'cookies') {
    return (
      <button type="button" onClick={openCookieSettings}>
        {link.label}
      </button>
    );
  }

  if (link.file || link.href.startsWith('http')) {
    return <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>;
  }
  if (link.href.startsWith('/#')) {
    return <a href={link.href}>{link.label}</a>;
  }
  return (
    <Link to={link.href}>
      {link.label}
      {link.arrow && <ArrowRight />}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__inner">
        {/* ── En-tête : nom, promesse, contact ── */}
        <div className="ftr__head">
          <div>
            <LogoMark size={72} rotate={-7} className="ftr__logo" voidColor="#000c5b" />
            <p className="ftr__name">Hi-Tech Academy</p>
            <p className="ftr__claim">Apprendre aujourd&apos;hui. Construire demain.</p>
          </div>
          <address className="ftr__contact">
            <a href="tel:+33751474135">07 51 47 41 35</a>
            <a href="mailto:contact@hi-techacademy.fr">contact@hi-techacademy.fr</a>
            <span>73 rue de Reuilly, 75012 Paris</span>
          </address>
        </div>

        {/* ── Colonnes de liens ── */}
        <nav className="ftr__nav" aria-label="Pied de page">
          {columns.map((column) => (
            <div className="ftr__column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}><FooterLink link={link} /></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Certification et enregistrement ── */}
        <div className="ftr__cert">
          <a className="ftr__cert-badge" href="/documents/qualiopi/Certificat_Qualiopi_RNQ.pdf" target="_blank" rel="noreferrer">
            <img
              src="/images/qualiopi-certification.webp"
              alt="Certification Qualiopi, processus certifié, République française : délivrée au titre des actions de formation"
              width="580"
              height="106"
              loading="lazy"
            />
          </a>
          <p className="ftr__cert-text">
            Organisme de formation enregistré sous le n° 11756755575 auprès du préfet de la région
            Île-de-France (cet enregistrement ne vaut pas agrément de l&apos;État). SIRET 922 695 648 00027.
          </p>
        </div>
      </div>

      {/* ── Barre légale ── */}
      <div className="ftr__legal">
        <div className="ftr__legal-inner">
          <p>© {new Date().getFullYear()} Hi-Tech Academy. Tous droits réservés.</p>
          <ul className="ftr__socials" aria-label="Réseaux sociaux">
            {socials.map(({ icon: Icon, href, label }) => (
              <li key={label}><a href={href} aria-label={label}><Icon /></a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
