import React from 'react';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-8"
            style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Conditions Générales de Vente
          </h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                1. Objet
              </h2>
              <p>
                Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Hi Tech Academy et ses clients pour toutes nos formations et services associés.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                2. Inscription
              </h2>
              <p>
                L'inscription à une formation se fait via notre site web ou directement dans nos locaux. Elle est confirmée après réception du paiement et de l'ensemble des documents requis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                3. Tarifs et modalités de paiement
              </h2>
              <p className="mb-2">
                Les tarifs sont indiqués en dinars algériens (DZD) et sont TTC. Plusieurs modalités de paiement sont possibles :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Paiement comptant</li>
                <li>Paiement en plusieurs échéances (selon accord préalable)</li>
                <li>Financement par organisme tiers (si applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                4. Rétractation et annulation
              </h2>
              <p className="mb-2">
                Conformément à la réglementation en vigueur, vous disposez d'un délai de rétractation de 14 jours après votre inscription. Passé ce délai :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Annulation avant le début de la formation : remboursement intégral</li>
                <li>Annulation après le début de la formation : aucun remboursement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                5. Déroulement de la formation
              </h2>
              <p>
                Hi Tech Academy s'engage à fournir les moyens pédagogiques nécessaires au bon déroulement de la formation. En cas de force majeure, nous nous réservons le droit de modifier les dates ou le format de la formation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                6. Certification
              </h2>
              <p>
                Une attestation de fin de formation est délivrée aux stagiaires ayant suivi l'intégralité du programme et validé les évaluations requises.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                7. Responsabilité
              </h2>
              <p>
                Hi Tech Academy ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation des services fournis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                8. Droit applicable
              </h2>
              <p>
                Les présentes CGV sont soumises au droit algérien. Tout litige sera de la compétence des tribunaux d'Alger.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}