import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, BadgeCheck, Clock, Euro, Landmark } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formations } from '@/data/formations';
import { getVenteById } from '@/data/ventes';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Onglet « Formations » : le catalogue complet, chaque carte mène à la page
// de vente dédiée (/formations/<id>).
export default function Formations() {
  useEffect(() => {
    document.title = 'Formations — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#f7f9fd' }}>
      <TopBar />
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* En-tête */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
              style={{ color: '#002d74', ...headingFont }}>
              Le catalogue
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] mb-4"
              style={{ color: '#001a4a', ...headingFont }}>
              Des formations qui changent <span style={{ color: '#005064' }}>votre quotidien</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base" style={{ color: '#6b7a9b', ...bodyFont }}>
              100 % à distance, animées en direct par un formateur expert, dès 1 participant.
              Choisissez la vôtre — chaque page vous dit exactement ce que vous allez y gagner.
            </p>

            {/* Bandeau Qualiopi */}
            <div
              className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 px-6 py-3 rounded-2xl"
              style={{ background: 'white', border: '1px solid #e0e8f4' }}>
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#005064', ...headingFont }}>
                <BadgeCheck className="w-4 h-4" /> Organisme certifié Qualiopi
              </span>
              <span className="flex items-center gap-2 text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
                <Landmark className="w-4 h-4" style={{ color: '#005064' }} /> Finançable OPCO
              </span>
              <span className="flex items-center gap-2 text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
                <Award className="w-4 h-4" style={{ color: '#005064' }} /> Attestation de fin de formation
              </span>
            </div>
          </motion.div>

          {/* Cartes */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {formations.map((formation, i) => {
              const vente = getVenteById(formation.id);
              const duree = formation.keyFacts.find((f) => f.label === 'Durée')?.value ?? '';
              const tarif = formation.keyFacts.find((f) => f.label === 'Tarif')?.value ?? '';
              return (
                <motion.div
                  key={formation.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col rounded-3xl overflow-hidden bg-white"
                  style={{ border: '1px solid #e0e8f4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                  <Link to={`/formations/${formation.id}`} className="relative block overflow-hidden" style={{ height: 180, background: '#edf6f6' }}>
                    <img src={formation.image} alt={formation.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#005064', backdropFilter: 'blur(8px)', ...headingFont }}>
                      {formation.tag}
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1 p-6">
                    <h2 className="font-bold text-xl mb-2" style={{ color: '#001a4a', ...headingFont }}>
                      {formation.title}
                    </h2>
                    {vente && (
                      <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: '#005064', ...bodyFont }}>
                        {vente.accroche}
                      </p>
                    )}

                    <div className="mt-auto space-y-2 mb-5">
                      <p className="flex items-center gap-2 text-xs" style={{ color: '#0f2e2f', ...bodyFont }}>
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#005064' }} /> {duree}
                      </p>
                      <p className="flex items-center gap-2 text-xs" style={{ color: '#0f2e2f', ...bodyFont }}>
                        <Euro className="w-3.5 h-3.5 shrink-0" style={{ color: '#005064' }} /> {tarif}
                      </p>
                    </div>

                    <Link
                      to={`/formations/${formation.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                      style={{ background: '#005064', color: 'white', ...headingFont }}>
                      Découvrir la formation
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/inscription/${formation.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl font-bold text-sm"
                      style={{ background: '#f0f3fa', color: '#005064', border: '1.5px solid #005064', ...headingFont }}>
                      Demander une inscription
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA bas de page */}
          <div className="text-center mt-14">
            <p className="text-sm mb-3" style={{ color: '#6b7a9b', ...bodyFont }}>
              Vous hésitez entre deux formations, ou une question sur votre financement ?
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 text-sm font-bold"
              style={{ color: '#005064', ...headingFont }}>
              Parlez à un conseiller
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
