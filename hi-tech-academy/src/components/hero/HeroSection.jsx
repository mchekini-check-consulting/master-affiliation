import React from 'react';
import { CurrencyEur as BadgeEuro, Laptop, Lifebuoy as LifeBuoy, Play } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import HeroCourseCarousel from '@/components/hero/HeroCourseCarousel';

const benefits = [
  { icon: Laptop, title: '100 % à distance', description: 'Apprenez à votre rythme' },
  { icon: BadgeEuro, title: 'Finançable OPCO', description: "Jusqu'à 100 % de prise en charge" },
  { icon: LifeBuoy, title: 'Accompagnement expert', description: 'Du début à la fin' },
];

// Bande de confiance. `src` attend un fichier déposé dans public/images/logos/.
// Tant qu'il est vide, le nom s'affiche en toutes lettres : aucun logo n'est
// fabriqué ni imité — on met le vrai fichier, ou rien.
// N'y faire figurer QUE ce que le site peut justifier. L'ancienne bande
// affichait « pôle emploi » et le bloc-marque « République Française », que
// rien dans le catalogue n'étaye — et que la charte de l'État réserve de toute
// façon à ses propres services. Les deux sont retirés.
//   · Qualiopi : la mention du champ certifié est OBLIGATOIRE à côté du logo.
//     Le nom de l'organisme certificateur doit y être ajouté dès qu'il est
//     connu (`mention`).
//   · OPCO n'est pas une marque unique mais une catégorie : onze opérateurs,
//     onze logos. Reste donc en toutes lettres, sauf à nommer un OPCO précis.
const trustLogos = [
  { nom: 'Qualiopi', src: '', mention: 'Actions de formation' },
  { nom: 'OPCO', src: '', mention: 'Financement mobilisable' },
];

function TrustLogo({ nom, src, mention }) {
  return (
    <div className="hero-trust-logo">
      {src
        ? <img src={src} alt={nom} loading="lazy" />
        : <span className="hero-trust-logo__nom">{nom}</span>}
      {mention && <small>{mention}</small>}
    </div>
  );
}

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
            {/* `inverted` obligatoire : le héro est sur l'aplat #000c5b, qui est
                aussi la couleur du bouton — sans inversion il disparaîtrait. */}
            <PrimaryButton to="/formations" size="lg" inverted>
              Découvrir nos formations
            </PrimaryButton>
            <button type="button" className="academy-hero__video"><span><Play size={14} weight="fill" /></span> Voir la vidéo (1 min)</button>
          </div>
          <div className="academy-hero__benefits">
            {benefits.map(({ icon: Icon, title, description }) => <div className="academy-hero__benefit" key={title}><span><Icon size={22} weight="duotone" /></span><div><strong>{title}</strong><small>{description}</small></div></div>)}
          </div>
        </div>

        {/* Bande de confiance : en pied de héro, centrée sur toute la largeur
            du cadre, sans sur-titre. Elle sort de `__copy` pour ne plus être
            contrainte à la colonne de texte. */}
        <div className="academy-hero__trust">
          {trustLogos.map(({ nom, src, mention }) => (
            <TrustLogo key={nom} nom={nom} src={src} mention={mention} />
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
