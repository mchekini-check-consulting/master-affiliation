import React from 'react';
import { CurrencyEur as BadgeEuro, Laptop, Lifebuoy as LifeBuoy, Play } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import HeroCourseCarousel from '@/components/hero/HeroCourseCarousel';

const benefits = [
  { icon: Laptop, title: '100 % à distance', description: 'Apprenez à votre rythme' },
  { icon: BadgeEuro, title: 'Finançable OPCO', description: "Jusqu'à 100 % de prise en charge" },
  { icon: LifeBuoy, title: 'Accompagnement expert', description: 'Du début à la fin' },
];

// Bande de confiance : les logos seuls, en monochrome clair sur l'aplat
// marine, opacité réduite. Les fichiers `-mono.png` sont dérivés des logos
// officiels (fond blanc rendu transparent, tracé passé en blanc) : à
// remplacer par la version monochrome officielle du kit Qualiopi si elle est
// fournie.
//   ⚠ Qualiopi : les règles d'usage de la marque demandent la mention de la
//     catégorie certifiée (« actions de formation ») à côté du logo. Retirée
//     ici à la demande ; elle reste affichée dans le footer.
const trustLogos = [
  { nom: 'Qualiopi, processus certifié, République française', src: '/images/logos/qualiopi-mono.png', width: 251, height: 105 },
  { nom: 'OPCO, opérateurs de compétences', src: '/images/logos/opco-mono.png', width: 308, height: 124 },
];

export default function HeroSection() {
  return (
    <section className="academy-hero">
      <div className="academy-hero__inner">
        <div className="academy-hero__copy">
          {/* Pas de <br /> en dur : des coupures figées ne valent que pour UNE
              largeur de colonne, et c'est exactement ce qui rendait le héro
              bancal après le passage du gabarit à 1400 px — le titre tenait sur
              400 px au milieu d'une colonne de 700. `text-wrap: balance`
              (index.css) équilibre les lignes à toutes les largeurs. */}
          <h1>Formez-vous en direct, <span>repartez opérationnel.</span></h1>
          {/* Chaque affirmation est vérifiable dans les données : « en direct,
              jamais préenregistré » vient de la FAQ, « dès un participant » du
              champ Effectif des cinq formations, l'OPCO de `financementsParDefaut`. */}
          <p className="academy-hero__intro">
            Des sessions en classe virtuelle <strong>animées en direct par un formateur</strong>, jamais préenregistrées.
            Travaux pratiques sur un environnement réel, session confirmée <strong>dès un participant</strong>, et financement OPCO mobilisable.
          </p>
          <div className="academy-hero__actions">
            {/* `inverted` obligatoire : le héro est sur l'aplat #002d74, qui est
                aussi la couleur du bouton — sans inversion il disparaîtrait. */}
            <PrimaryButton to="/formations" size="lg" inverted>
              Découvrir nos formations
            </PrimaryButton>
            {/* CTA secondaire : mène à « Notre méthode » (#methode), les six
                temps du parcours. Il annonçait une vidéo qui n'existe pas. */}
            <a href="#methode" className="academy-hero__video"><span><Play size={14} weight="fill" /></span> Comment ça marche ?</a>
          </div>
          <div className="academy-hero__benefits">
            {benefits.map(({ icon: Icon, title, description }) => <div className="academy-hero__benefit" key={title}><span><Icon size={22} weight="duotone" /></span><div><strong>{title}</strong><small>{description}</small></div></div>)}
          </div>
        </div>

        {/* Bande de confiance : en pied de héro, centrée sur toute la largeur
            du cadre, sans sur-titre. Elle sort de `__copy` pour ne plus être
            contrainte à la colonne de texte. */}
        <div className="academy-hero__trust">
          {trustLogos.map(({ nom, src, width, height }) => (
            <img key={src} className="hero-trust-logo" src={src} alt={nom} width={width} height={height} loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
      {/* Colonne droite : le carrousel seul, posé sur l'aplat du héro. En
          dessous de 1280 px, ce bloc repasse dans le flux sous le texte. */}
      <div className="academy-hero__visual">
        <HeroCourseCarousel />
      </div>
    </section>
  );
}
