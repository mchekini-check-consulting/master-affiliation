import React from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { rdvProps } from '@/lib/rendezVous';
import PrimaryButton from '@/components/ui/primary-button';
import HeroBenefits from '@/components/hero/HeroBenefits';
import HeroCourseCarousel from '@/components/hero/HeroCourseCarousel';
import HeroCourseRail from '@/components/hero/HeroCourseRail';

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

// Même seuil que le `sm:` de Tailwind et que le bloc `max-width: 639px` de
// index.css : sous 640 px, le carrousel 3D cède la place au rail tactile.
const REQUETE_MOBILE = '(max-width: 639px)';

export default function HeroSection() {
  const mobile = useMediaQuery(REQUETE_MOBILE);
  return (
    <section className="academy-hero">
      <div className="academy-hero__inner">
        <div className="academy-hero__copy">
          {/* Pas de <br /> en dur : des coupures figées ne valent que pour UNE
              largeur de colonne, et c'est exactement ce qui rendait le héro
              bancal après le passage du gabarit à 1400 px — le titre tenait sur
              400 px au milieu d'une colonne de 700. `text-wrap: balance`
              (index.css) équilibre les lignes à toutes les largeurs. */}
          <h1>Formez-vous par la pratique, <span>repartez opérationnel.</span></h1>
          {/* Chaque affirmation est vérifiable dans les données : « en direct,
              jamais préenregistré » vient de la FAQ, le « jusqu'à 100 % » des
              dispositifs OPCO/FAF détaillés sur /financements. */}
          {/* Sous 640 px, chapô resserré : trois lignes au lieu de six, pour
              que les boutons restent visibles sans défiler. */}
          <p className="academy-hero__intro">
            <span className="sm:hidden">
              Des classes virtuelles <strong>animées en direct par un formateur</strong>. Formation <strong>finançable jusqu'à 100 %</strong>.
            </span>
            <span className="hidden sm:inline">
              Des sessions en classe virtuelle <strong>animées en direct par un formateur</strong>, jamais préenregistrées.
              Travaux pratiques sur un environnement réel, formation <strong>finançable jusqu'à 100 %</strong> (OPCO, FAF) avec un dossier monté avec vous.
            </span>
          </p>
          <div className="academy-hero__actions">
            {/* `inverted` obligatoire : le héro est sur l'aplat #002d74, qui est
                aussi la couleur du bouton — sans inversion il disparaîtrait. */}
            {/* Sous 640 px, libellés courts : les deux actions tiennent sur
                une seule ligne, en deux pilules de même hauteur. */}
            {/* CTA principal : l'appel découverte (Calendly via rdvProps), qui
                vérifie le besoin, le niveau et la prise en charge financière. */}
            <PrimaryButton {...rdvProps()} size="lg" inverted className="academy-hero__cta">
              <span className="sm:hidden">Appel gratuit</span>
              <span className="hidden sm:inline">Réserver mon appel gratuit</span>
            </PrimaryButton>
            {/* Action secondaire : pilule fantôme, même gabarit que le bouton
                primaire mais contour clair sur fond transparent. Libellé court
                sous 640 px : les deux pilules tiennent côte à côte à 320 px. */}
            <Link to="/formations" className="academy-hero__secondary">
              <span className="sm:hidden">Formations</span>
              <span className="hidden sm:inline">Découvrir nos formations</span>
            </Link>
          </div>
          {/* Grille à trois colonnes, bandeau en boucle sous 640 px. */}
          <HeroBenefits />
        </div>

        {/* Sous 640 px, les formations passent ici, dans le flux, sous forme
            de rail au balayage. Une seule version est montée à la fois. */}
        {mobile && <HeroCourseRail />}

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
      {!mobile && (
        <div className="academy-hero__visual">
          <HeroCourseCarousel />
        </div>
      )}
    </section>
  );
}
