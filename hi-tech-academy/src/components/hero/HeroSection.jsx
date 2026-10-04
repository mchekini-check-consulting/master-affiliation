import React from 'react';
import { Play } from '@phosphor-icons/react';
import { useMediaQuery } from '@/hooks/use-media-query';
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
          <h1>Formez-vous en direct, <span>repartez opérationnel.</span></h1>
          {/* Chaque affirmation est vérifiable dans les données : « en direct,
              jamais préenregistré » vient de la FAQ, « dès un participant » du
              champ Effectif des cinq formations, l'OPCO de `financementsParDefaut`. */}
          {/* Sous 640 px, chapô resserré : trois lignes au lieu de six, pour
              que les boutons restent visibles sans défiler. */}
          <p className="academy-hero__intro">
            <span className="sm:hidden">
              Des classes virtuelles <strong>animées en direct par un formateur</strong>. Session confirmée <strong>dès un participant</strong>, financement OPCO mobilisable.
            </span>
            <span className="hidden sm:inline">
              Des sessions en classe virtuelle <strong>animées en direct par un formateur</strong>, jamais préenregistrées.
              Travaux pratiques sur un environnement réel, session confirmée <strong>dès un participant</strong>, et financement OPCO mobilisable.
            </span>
          </p>
          <div className="academy-hero__actions">
            {/* `inverted` obligatoire : le héro est sur l'aplat #002d74, qui est
                aussi la couleur du bouton — sans inversion il disparaîtrait. */}
            {/* Sous 640 px, libellés courts : les deux actions tiennent sur
                une seule ligne, en deux pilules de même hauteur. */}
            <PrimaryButton to="/formations" size="lg" inverted className="academy-hero__cta">
              <span className="sm:hidden">Nos formations</span>
              <span className="hidden sm:inline">Découvrir nos formations</span>
            </PrimaryButton>
            {/* CTA secondaire : mène à « Notre méthode » (#methode), les six
                temps du parcours. Il annonçait une vidéo qui n'existe pas. */}
            <a href="#methode" className="academy-hero__video">
              <span className="academy-hero__video-icon"><Play size={14} weight="fill" /></span>
              <span className="sm:hidden">La méthode</span>
              <span className="hidden sm:inline">Comment ça marche ?</span>
            </a>
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
