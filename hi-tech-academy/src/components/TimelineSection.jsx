import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { NAVY, TEAL, MINT, MINT_LIGHT, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// « Notre méthode » en six temps. Registre éditorial : une colonne collante
// à gauche (promesse + photo), les six temps à droite en grande
// typographie, numérotés parce que c'est une chronologie — la colonne reste
// épinglée pendant qu'on les fait défiler. La version
// précédente épinglait trois écrans pleins avec GSAP (~300 vh à traverser) :
// spectaculaire, mais un visiteur venu d'une publicité ne traverse pas trois
// écrans pour lire trois paragraphes.
const TEMPS = [
  {
    titre: 'Évaluer, puis construire',
    texte: "Chaque parcours commence par une évaluation des compétences, qui oriente le contenu vers les modules les plus pertinents pour vous. Démonstrations, exercices pratiques et projets réels sont ensuite combinés pour une compréhension solide et une application concrète.",
    reperes: ['Évaluation personnalisée', 'Modules interactifs'],
  },
  {
    titre: 'Préparer le terrain',
    texte: "Avant le jour J, tout est prêt : convocation, lien de connexion, accès à votre environnement de travail et vérification technique. Si un aménagement est nécessaire, notre référent handicap le cale avec vous dès l'inscription. Le délai d'accès est d'un jour minimum entre votre demande et le démarrage.",
    reperes: ['Accès vérifiés avant la session', 'Aménagements possibles'],
  },
  {
    titre: 'Apprendre entouré',
    texte: "Sessions en direct, échanges et projets en groupe : on apprend comme dans un environnement professionnel. Le formateur assure un soutien constant pour surmonter les difficultés et garder le rythme tout au long du parcours.",
    reperes: ['Apprentissage en groupe', 'Accompagnement continu'],
  },
  {
    titre: 'Pratiquer en conditions réelles',
    texte: "La théorie ne tient que si elle résiste à la pratique. Chaque participant travaille sur son propre environnement, pour Kubernetes un cluster Azure AKS réel, et affronte les situations qui posent problème en production : un déploiement qui reste en attente, un service qui ne répond pas, une configuration à corriger.",
    reperes: ['Environnement individuel', 'Cas de production'],
  },
  {
    titre: 'Prouver ses acquis',
    texte: "Des projets pratiques simulant des situations réelles vous préparent aux défis du poste. Le parcours se termine par une évaluation finale des acquis (QCM et mise en pratique) et une attestation de fin de formation détaillant vos résultats.",
    reperes: ['Projets réels', 'Évaluation et attestation'],
  },
  {
    titre: 'Garder le lien après',
    texte: "La formation ne s'arrête pas à la dernière heure. Vous conservez vos supports, un questionnaire de satisfaction recueille votre retour à chaud, et un point à distance permet de mesurer ce que vous avez réellement transposé dans votre poste. Nous restons joignables pour la suite de votre parcours.",
    reperes: ['Supports conservés', 'Retour à chaud et à froid'],
  },
];

export default function TimelineSection() {
  return (
    <section id="methode" className="bg-white py-20 sm:py-28" aria-label="Notre méthode, en six temps">
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20 items-start">
          {/* Colonne collante : promesse + photo */}
          <div className="lg:sticky lg:top-28">
            <p className="text-body-sm font-semibold mb-4" style={{ color: TEAL, ...headingFont }}>Notre méthode</p>
            <h2
              className="font-serif-display max-w-[14ch]"
              style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
              Opérationnel à la fin. Pas seulement diplômé.
            </h2>
            <p className="text-body-lg leading-[1.6] mt-6 max-w-[38ch]" style={{ color: BODY_MUTED, ...bodyFont }}>
              Six temps, les mêmes pour toutes nos formations : on mesure d'où vous partez, on prépare votre
              environnement, on vous fait pratiquer en direct, on atteste ce que vous savez faire,
              et on garde le lien ensuite.
            </p>

            <figure className="relative overflow-hidden m-0 mt-10 hidden lg:block" style={{ borderRadius: 8, aspectRatio: '4 / 3', background: NAVY }}>
              <img
                src="/images/timeline-classe-virtuelle.webp"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Filtre de marque : un aplat navy en légère opacité posé sur la
                  photo (pas un dégradé, pas de blanc translucide) — la teinte
                  unifie la photo avec la palette du site tout en la gardant
                  lisible sous la légende. */}
              <div aria-hidden="true" className="absolute inset-0" style={{ background: NAVY, opacity: 0.32 }} />
              <figcaption className="absolute left-0 right-0 bottom-0 px-5 py-4 text-white" style={{ background: NAVY }}>
                <span className="block text-body-sm font-semibold" style={{ color: MINT, ...headingFont }}>Classe virtuelle en direct</span>
                <span className="block text-body-sm mt-1" style={bodyFont}>Chaque participant travaille sur son propre environnement.</span>
              </figcaption>
            </figure>
          </div>

          {/* Les six temps */}
          <ol style={{ borderTop: `1px solid ${LINE}` }}>
            {TEMPS.map(({ titre, texte, reperes }, i) => (
              <li
                key={titre}
                className="grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[88px_minmax(0,1fr)] gap-x-4 py-8 sm:py-10"
                style={{ borderBottom: `1px solid ${LINE}` }}>
                <span
                  className="font-serif-display tabular-nums leading-none pt-1"
                  style={{ fontSize: 'clamp(28px, 2.6vw, 40px)', letterSpacing: '-0.02em', color: TEAL, ...serifFont }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3
                    className="font-serif-display"
                    style={{ fontSize: 'clamp(24px, 2.4vw, 34px)', lineHeight: 1.15, letterSpacing: '-0.015em', color: '#243037', ...serifFont }}>
                    {titre}
                  </h3>
                  <p className="text-body-lg leading-[1.6] mt-4 max-w-measure" style={{ color: BODY, ...bodyFont }}>{texte}</p>
                  <ul className="flex flex-wrap gap-2 mt-5">
                    {reperes.map((r) => (
                      <li key={r} className="inline-flex items-center h-8 px-3.5 rounded-full text-body-sm font-medium" style={{ background: MINT_LIGHT, color: NAVY, ...headingFont }}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 mt-12 sm:mt-16">
          <p className="text-h4 max-w-[40ch]" style={{ color: '#243037', ...headingFont }}>
            La méthode est la même partout. Reste à choisir la formation.
          </p>
          <Link to="/formations" className="inline-flex items-center gap-2 text-body-base font-semibold hover:underline" style={{ color: TEAL, ...headingFont }}>
            Voir les formations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
