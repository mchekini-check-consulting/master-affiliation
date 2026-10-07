import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { headingFont, serifFont, bodyFont } from '@/components/design';

// Dernier appel de la page de vente, après la FAQ : les objections sont
// traitées, il reste à proposer l'action la moins engageante, l'appel
// découverte. Même gabarit que le bandeau final de l'accueil (CTASection).

export default function CtaFinal({ couleur, rdvAction, inscriptionTo }) {
  return (
    <section id="rendez-vous" className="bg-white py-14 sm:py-20">
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div
          className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-16 items-center px-7 sm:px-12 py-10 sm:py-12 text-white"
          style={{ borderRadius: 8, background: couleur.fond }}>
          <div>
            <h2
              className="font-serif-display text-white max-w-[24ch]"
              style={{ fontSize: 'clamp(28px, 2.8vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.02em', ...serifFont }}>
              Vérifions ensemble votre prise en charge
            </h2>
            <p className="text-body-base leading-[1.55] mt-3 max-w-measure" style={{ color: '#dbebff', ...bodyFont }}>
              Un point stratégique de 30 minutes en visio : votre besoin, votre niveau de départ et votre
              financement, jusqu'à 100 % selon votre situation. Gratuit et sans engagement.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <PrimaryButton {...rdvAction} size="lg" inverted style={{ color: couleur.fond }}>Réserver mon appel gratuit</PrimaryButton>
            <Link
              to={inscriptionTo}
              className="inline-flex items-center min-h-[44px] text-body-sm font-semibold underline underline-offset-4"
              style={{ color: couleur.accent, ...headingFont }}>
              Ou demander une inscription directement
            </Link>
            <a href="tel:+33751474135" className="inline-flex items-center gap-2 text-body-sm font-semibold hover:underline" style={{ color: couleur.accent, ...headingFont }}>
              <Phone className="w-4 h-4" /> Ou appelez-nous : 07 51 47 41 35
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
