import React from 'react';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

export default function LegalNotices() {
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
            Mentions Légales
          </h1>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                1. Éditeur du site
              </h2>
              <p className="mb-2">
                <strong>Hi Tech Academy</strong><br />
                Siège social : 123 Rue de l'Innovation, Alger, Algérie<br />
                Téléphone : +213 00 000 00 00<br />
                Email : contact@hitechacademy.dz
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                2. Directeur de la publication
              </h2>
              <p>
                Le directeur de la publication est le représentant légal de Hi Tech Academy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                3. Hébergement
              </h2>
              <p>
                Le site est hébergé par Base44, conformément aux réglementations en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                4. Propriété intellectuelle
              </h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, marques) est la propriété exclusive de Hi Tech Academy et est protégé par les lois sur la propriété intellectuelle. Toute reproduction, distribution ou utilisation non autorisée est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                5. Responsabilité
              </h2>
              <p>
                Hi Tech Academy s'efforce de fournir des informations exactes, mais ne peut garantir l'exactitude, l'exhaustivité ou l'actualité des contenus. La responsabilité de Hi Tech Academy ne saurait être engagée pour d'éventuelles erreurs ou omissions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                6. Liens hypertextes
              </h2>
              <p>
                Le site peut contenir des liens vers d'autres sites. Hi Tech Academy n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}