import React from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { TEAL, MINT, LINE, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// « Pourquoi nous choisir » — six arguments de positionnement, présentés
// simplement (icône + titre + phrase), photo unique à droite.
//
// Retiré par rapport à la version précédente : les statistiques flottantes
// (+70 %, +2 000 apprenants, 4,8/5) n'étaient sourcées nulle part et
// contredisaient les indicateurs Qualiopi réels affichés dans la section
// « Résultats » (95 % / 100 %, eux sourcés) ; le témoignage réutilisait
// « Yanis K. » avec un rôle inventé (« Développeur Web ») alors que son avis
// réel est déjà affiché ailleurs pour Kubernetes ; et les logos « Google,
// Microsoft, Deloitte, aws, UBISOFT » sous « Ils nous font confiance »
// laissaient croire à un partenariat ou une clientèle qui n'est étayée par
// rien — une affirmation de ce type est un vrai risque, pas un détail de
// mise en forme.
//
// Les six arguments sont présentés en liste éditoriale (titre bref + phrase,
// filet fin, pas d'icône ni de carte) plutôt qu'en grille de pastilles :
// c'est ce dernier motif — carré arrondi bleu pâle + glyphe centré, répété
// six fois à l'identique — qui donne l'aspect « gabarit généré ».
const PERKS = [
  {
    title: 'Le terrain avant la théorie',
    description: "Des compétences concrètes, recherchées par les entreprises, pas des notions qui datent déjà de trois ans.",
  },
  {
    title: 'Une équipe, pas un ticket',
    description: "Un contact humain à chaque étape : avant la session pour cadrer votre projet, pendant pour vous débloquer, après pour faire le point.",
  },
  {
    title: 'Votre rythme, notre cadre',
    description: 'Formez-vous où vous voulez, quand vous voulez, sans que la rigueur du programme en pâtisse.',
  },
  {
    title: 'Une attestation qui compte',
    description: "Délivrée par un organisme certifié Qualiopi, reconnue dans vos démarches de financement, pas un certificat de complaisance.",
  },
  {
    title: 'On juge sur pièces',
    description: 'Chaque session se termine par un projet ou une mise en situation réelle, pas un questionnaire à choix multiples.',
  },
  {
    title: 'Un groupe, pas un amphithéâtre',
    description: "Un effectif assez restreint pour que le formateur s'adapte réellement à votre niveau.",
  },
];

export default function WhyUsSection() {
  return (
    <section id="whyus" className="bg-white py-20 sm:py-28" aria-labelledby="whyus-title">
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 lg:gap-20">
          <div>
            <p className="text-body-sm font-semibold mb-3" style={{ color: TEAL, ...headingFont }}>Pourquoi nous choisir</p>
            <h2
              id="whyus-title"
              className="font-serif-display max-w-[18ch]"
              style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
              Bien plus qu'une formation, un vrai tremplin pour votre avenir
            </h2>
            <p className="text-body-lg leading-[1.6] mt-5 max-w-measure" style={{ color: BODY_MUTED, ...bodyFont }}>
              Nous vous donnons les compétences, l'accompagnement et le cadre pour atteindre vos objectifs
              professionnels, à votre rythme.
            </p>

            {/* Liste de principes, pas de fonctionnalités : un titre bref en DM
                Sans, une phrase qui le justifie, un filet pour respirer entre
                les deux. Aucune icône — la typographie porte la hiérarchie. */}
            <ul className="mt-12" style={{ borderTop: `1px solid ${LINE}` }}>
              {PERKS.map(({ title, description }) => (
                <li
                  key={title}
                  className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-x-10 gap-y-2 py-7"
                  style={{ borderBottom: `1px solid ${LINE}` }}>
                  <h3 className="font-serif-display text-h3 leading-[1.3]" style={{ color: '#243037', ...serifFont }}>
                    {title}
                  </h3>
                  <p className="text-body-base leading-[1.6]" style={{ color: BODY_MUTED, ...bodyFont }}>
                    {description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <PrimaryButton to="/formations" size="lg">Découvrir nos formations</PrimaryButton>
            </div>
          </div>

          {/* Panneau de conviction plutôt qu'une photo : un aplat dégradé dans
              les deux teintes du primaire (#002d74 → #002d74 — pas de couleur
              hors charte), une grande flèche et une citation de marque.
              La cellule de droite est étirée à la hauteur de la colonne de
              gauche (plus haute depuis le passage en liste éditoriale) et le
              panneau est `sticky` : il reste sous les yeux tout le temps que
              la colonne de gauche défile, au lieu de s'arrêter tôt et de
              laisser un couloir de page vide en dessous. */}
          <div className="hidden lg:block">
            {/* Le panneau fait la hauteur de la fenêtre, moins le header
                flottant au-dessus (112 px) et une marge de 24 px en bas : collé
                en `sticky`, il remplit l'écran pendant que seul le texte de
                gauche défile, sans laisser de vide sous lui. `--screen-h` et
                non `100vh`, pour rester juste sous le zoom des grands écrans. */}
            <div className="lg:sticky" style={{ top: 112 }}>
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: 8,
                  height: 'calc(var(--screen-h) - 136px)',
                  minHeight: 480,
                  background: 'linear-gradient(155deg, #002d74 0%, #002d74 100%)',
                }}>
                {/* Photo en fond, opacité légère : même principe que le voile de
                    marque du héro de l'accueil (`.academy-hero::before`) — le
                    dégradé reste la couche dominante, la photo n'y ajoute
                    qu'une texture, jamais de contraste à rattraper pour le texte. */}
                <img
                  src="/images/whyus-panel.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.22 }}
                />

                <div className="relative z-[1] flex flex-col justify-between h-full p-10">
                  <ArrowUpRight aria-hidden="true" className="w-16 h-16 self-end text-white" weight="bold" />

                  <blockquote className="m-0">
                    <p
                      className="font-serif-display text-white"
                      style={{ fontSize: 'clamp(24px, 2vw, 30px)', lineHeight: 1.25, letterSpacing: '-0.01em', ...serifFont }}>
                      On ne choisit pas seulement une formation. On choisit la suite de sa carrière.
                    </p>
                    <footer className="text-body-sm font-semibold mt-6" style={{ color: MINT, ...headingFont }}>
                      L&apos;équipe Hi-Tech Academy
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
