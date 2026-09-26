import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Bouton primaire du site public. Volontairement SIMPLE : une pilule pleine,
// un libellé, rien d'autre. Pas de pastille, pas d'icône, pas de glissement au
// survol — seulement un changement de couleur.
//
//   <PrimaryButton to="/formations">Choisir ma formation</PrimaryButton>  → lien interne
//   <PrimaryButton href="#contact">Contactez-nous</PrimaryButton>         → lien <a>
//   <PrimaryButton type="submit" onClick={fn}>Envoyer</PrimaryButton>     → <button>
//
// `inverted` : variante blanche pour les fonds sombres.
// `size`     : 'sm' (44 px, header) · 'md' (48 px, défaut) · 'lg' (56 px, héro).
//
// Les hauteurs sont des cibles tactiles : 44 px minimum partout.
const SIZES = {
  sm: 'h-11 px-6 text-body-sm',
  md: 'h-12 px-7 text-body-base',
  lg: 'h-14 px-8 text-body-base',
};

const PrimaryButton = React.forwardRef(
  ({ to, href, children, className, inverted = false, size = 'md', disabled, ...props }, ref) => {
    // `icon` est encore passé par d'anciens appels : on l'absorbe pour qu'il ne
    // se retrouve pas posé sur le DOM, sans rien en faire.
    const { icon: _ignoredIcon, ...rest } = props;

    const classes = cn(
      'inline-flex items-center justify-center w-fit rounded-full font-semibold whitespace-nowrap',
      'transition-colors duration-200 cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#002d74]',
      'disabled:pointer-events-none disabled:opacity-50',
      SIZES[size] ?? SIZES.md,
      inverted
        ? 'bg-white text-[#002d74] hover:bg-[#dbebff]'
        : 'bg-[#002d74] text-white hover:bg-[#011f55]',
      className
    );

    const style = { fontFamily: "'Inter', sans-serif", ...rest.style };

    if (to) {
      return <Link ref={ref} to={to} className={classes} {...rest} style={style}>{children}</Link>;
    }
    if (href) {
      return <a ref={ref} href={href} className={classes} {...rest} style={style}>{children}</a>;
    }
    return (
      <button ref={ref} type="button" disabled={disabled} className={classes} {...rest} style={style}>
        {children}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
