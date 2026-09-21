import React from 'react';
import { Phone } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { NAVY, MINT, headingFont, serifFont, bodyFont } from '@/components/design';

// Dernier appel de la page d'accueil : un seul bandeau marine, une promesse,
// une action. Compact — c'est un appel à l'action, pas une section de
// contenu — et détaché du pied de page par le blanc autour.

export default function CTASection() {
  return (
    <section id="commencer" className="bg-white py-14 sm:py-20">
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div
          className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-16 items-center px-7 sm:px-12 py-10 sm:py-12 text-white"
          style={{ borderRadius: 8, background: NAVY }}>
          <div>
            <h2
              className="font-serif-display text-white max-w-[22ch]"
              style={{ fontSize: 'clamp(28px, 2.8vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.02em', ...serifFont }}>
              Votre prochaine compétence commence ici.
            </h2>
            <p className="text-body-base leading-[1.55] mt-3 max-w-measure" style={{ color: '#dbebff', ...bodyFont }}>
              Choisissez votre formation et recevez programme et devis sous 24 h ouvrées. Sessions dès un participant, sans engagement.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <PrimaryButton to="/formations" size="lg" inverted>Choisir ma formation</PrimaryButton>
            <a href="tel:+33751474135" className="inline-flex items-center gap-2 text-body-sm font-semibold hover:underline" style={{ color: MINT, ...headingFont }}>
              <Phone className="w-4 h-4" /> Ou appelez-nous : 07 51 47 41 35
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
