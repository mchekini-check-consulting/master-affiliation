import React from 'react';
import { CurrencyEur as BadgeEuro, Laptop, Lifebuoy as LifeBuoy } from '@phosphor-icons/react';

const benefits = [
  { icon: Laptop, title: '100 % à distance', description: 'Apprenez à votre rythme' },
  { icon: BadgeEuro, title: 'Finançable OPCO', description: "Jusqu'à 100 % de prise en charge" },
  { icon: LifeBuoy, title: 'Accompagnement expert', description: 'Du début à la fin' },
];

// Sous 640 px, les avantages défilent en continu et en boucle (index.css,
// `hero-benefits-loop`). La liste est rendue deux fois : la piste glisse de la
// moitié de sa largeur, puis reprend à zéro sans saut visible. La copie est
// masquée aux lecteurs d'écran, et à l'affichage dès 641 px.
function Benefit({ icon: Icon, title, description, clone = false }) {
  return (
    <div className={`academy-hero__benefit ${clone ? 'is-clone' : ''}`} aria-hidden={clone || undefined}>
      <span><Icon size={22} weight="duotone" /></span>
      <div><strong>{title}</strong><small>{description}</small></div>
    </div>
  );
}

export default function HeroBenefits() {
  return (
    <div className="academy-hero__benefits-viewport">
      <div className="academy-hero__benefits">
        {benefits.map((benefit) => <Benefit key={benefit.title} {...benefit} />)}
        {benefits.map((benefit) => <Benefit key={`clone-${benefit.title}`} {...benefit} clone />)}
      </div>
    </div>
  );
}
