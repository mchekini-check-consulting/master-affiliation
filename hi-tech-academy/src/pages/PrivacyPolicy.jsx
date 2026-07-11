import React from 'react';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
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
            Politique de Confidentialité
          </h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                1. Collecte des données
              </h2>
              <p className="mb-2">
                Hi Tech Academy collecte les données personnelles suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Informations relatives à votre parcours de formation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                2. Finalité du traitement
              </h2>
              <p className="mb-2">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Gérer votre inscription et votre suivi de formation</li>
                <li>Vous envoyer des informations relatives à nos services</li>
                <li>Améliorer la qualité de nos formations</li>
                <li>Répondre à vos demandes de contact</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                3. Durée de conservation
              </h2>
              <p>
                Vos données sont conservées pendant la durée de votre formation et jusqu'à 3 ans après la fin de celle-ci, ou jusqu'à ce que vous demandiez leur suppression.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                4. Destinataires des données
              </h2>
              <p>
                Vos données sont accessibles uniquement au personnel autorisé de Hi Tech Academy et ne sont jamais vendues ou partagées avec des tiers à des fins commerciales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                5. Vos droits
              </h2>
              <p className="mb-2">
                Conformément à la réglementation, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, contactez-nous à : contact@hitechacademy.dz
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                6. Sécurité
              </h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}