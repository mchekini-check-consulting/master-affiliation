import React from 'react';
import { Link } from 'react-router-dom';
import { FilePdf } from '@phosphor-icons/react';
import { TEAL, LINE, BODY_MUTED, bodyFont } from '@/components/design';

// Bandeau utilitaire, collé en haut de la fenêtre au-dessus de la capsule de
// navigation. Il est fixe parce qu'il vit dans le `<header>`, lui-même en
// `position: fixed`.
//
// Contenu : trois raccourcis, alignés à droite. Ce ne sont pas des doublons de
// la navigation principale — « Livret d'accueil » est un PDF qui n'y figure
// pas, et les deux autres sont les destinations qu'un visiteur cherche en
// premier. Les coordonnées de contact qui étaient à gauche sont retirées : le
// téléphone est déjà dans la capsule juste en dessous.
//
// Chaque cible existe : les deux routes sont déclarées dans App.jsx, et le PDF
// est celui que le footer référence déjà.
const LIENS = [
  { label: 'Catalogue des formations', to: '/formations' },
  { label: 'Financer sa formation', to: '/financements' },
  { label: "Livret d'accueil", href: '/documents/qualiopi/Livret_accueil_V1.0.pdf', pdf: true },
];

export default function TopBar() {
  return (
    <div className="w-full bg-white" style={{ borderBottom: `1px solid ${LINE}` }}>
      <div className="max-w-site mx-auto px-4 sm:px-6">
        {/* Défilement horizontal sur écran étroit plutôt qu'un retour à la
            ligne, qui ferait grandir le bandeau et décalerait tout le header. */}
        <nav
          aria-label="Liens utiles"
          className="h-9 flex items-center justify-end gap-6 overflow-x-auto no-scrollbar"
          style={{ ...bodyFont }}>
          {LIENS.map(({ label, to, href, pdf }) => {
            const classes = 'inline-flex items-center gap-2 h-9 whitespace-nowrap text-body-sm transition-colors hover:text-[#000c5b]';
            const contenu = (
              <>
                {pdf && <FilePdf className="w-4 h-4 shrink-0" style={{ color: TEAL }} />}
                {label}
              </>
            );
            return href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
                style={{ color: BODY_MUTED }}>
                {contenu}
              </a>
            ) : (
              <Link key={label} to={to} className={classes} style={{ color: BODY_MUTED }}>
                {contenu}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
