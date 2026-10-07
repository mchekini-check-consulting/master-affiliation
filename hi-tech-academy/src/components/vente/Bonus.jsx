import React from 'react';
import { Link } from 'react-router-dom';
import { Bank, FileText, Monitor, PhoneCall } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, IconTile, RADIUS } from './atomes';

// « Vous repartez avec plus que la formation » : les quatre compléments inclus
// dans le tarif, sur la bande marine de la formation (même gabarit d'en-tête
// que les autres bandes sombres de la page). Rien de gonflé artificiellement
// (pas de « valeur 497 € ») : des compléments réels, chacun levant une
// objection d'achat (temps, abandon, administratif, outillage).

const BONUS = [
  {
    icon: FileText,
    titre: 'Le pack fiches réflexes et prompts',
    texte:
      "Des fiches PDF prêtes à l'emploi et une bibliothèque de prompts et de modèles à réutiliser au quotidien. Vous les gardez à vie et vous en servez dès le lendemain.",
  },
  {
    icon: PhoneCall,
    titre: 'Un suivi individuel de 30 minutes',
    texte:
      "Quelques semaines après la session, un point en tête à tête avec votre formateur : ce que vous avez mis en place, ce qui bloque, et comment avancer. C'est souvent là que tout s'ancre.",
  },
  {
    icon: Bank,
    titre: 'Le montage du dossier de financement',
    texte:
      "Devis, programme et convention au format attendu par votre OPCO ou votre fonds d'assurance formation : nous préparons chaque pièce avec vous et restons disponibles jusqu'à l'accord.",
  },
  {
    icon: Monitor,
    titre: "Le support de cours et l'environnement de travaux pratiques",
    texte:
      'Le support complet en PDF, conservé après la session, et un environnement de travaux pratiques prêt à l\'emploi : vous manipulez dès la première heure.',
  },
];

export default function Bonus({ couleur, rdvAction, inscriptionTo }) {
  return (
    <Bande id="bonus" tone="navy">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-20 items-end pb-10 sm:pb-12 text-white" style={{ borderBottom: `1px solid ${couleur.trait}` }}>
        <div>
          <p className="text-body-sm font-semibold mb-3" style={{ color: couleur.accent, ...headingFont }}>Inclus dans le tarif, sans supplément</p>
          <h2 className="font-serif-display text-white max-w-[18ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', ...serifFont }}>
            Vous repartez avec plus que la formation
          </h2>
        </div>
        <p className="text-body-lg leading-[1.6] max-w-measure lg:pb-2" style={{ color: '#dbebff', ...bodyFont }}>
          Une formation ne vaut que par ce qu'il en reste un mois plus tard. Ces quatre compléments
          sont compris dans le tarif affiché et servent exactement à ça.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 sm:pt-12">
        {BONUS.map(({ icon, titre, texte }) => (
          <div key={titre} className="p-6 sm:p-7 bg-white" style={{ borderRadius: RADIUS }}>
            <IconTile icon={icon} size={48} />
            <h3 className="font-serif-display text-h4 mt-5" style={{ color: '#243037', ...serifFont }}>{titre}</h3>
            <p className="text-body-sm leading-[1.55] mt-2" style={{ color: '#5f6568', ...bodyFont }}>{texte}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 mt-12 pt-8 text-white" style={{ borderTop: `1px solid ${couleur.trait}` }}>
        <p className="text-body-base max-w-measure" style={bodyFont}>
          Tout est compris dans le tarif affiché, finançable jusqu'à 100 % selon votre situation.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <PrimaryButton {...rdvAction} size="lg" inverted style={{ color: couleur.fond }}>Réserver mon appel gratuit</PrimaryButton>
          <Link to={inscriptionTo} className="inline-flex items-center min-h-[44px] text-body-sm font-semibold text-white underline underline-offset-4" style={headingFont}>
            Demander une inscription
          </Link>
        </div>
      </div>
    </Bande>
  );
}
