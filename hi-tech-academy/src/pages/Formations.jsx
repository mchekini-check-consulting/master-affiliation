import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, BookOpen, Clock, Euro, Landmark } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formations } from '@/data/formations';
import { getVenteById } from '@/data/ventes';
import {
  NAVY, TEAL, CYAN, ACCENT, MINT, MINT_LIGHT,
  headingFont, serifFont, bodyFont,
} from '@/components/design';

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// Onglet « Formations », thème École : héro en dégradé vert avec visuel à
// formes organiques, puis grille de cartes (image sur fond menthe, titre
// serif vert, lignes durée / prérequis / financement, pilule contour).
export default function Formations() {
  useEffect(() => {
    document.title = 'Formations — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* ---------- Héro dégradé vert ---------- */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8fedca 0%, #c8f6e4 40%, #eafff6 75%, #f4fffb 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-16 lg:pt-40 lg:pb-20 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h1
                className="font-serif-display font-bold leading-[1.12] text-4xl sm:text-5xl mb-5"
                style={{ color: '#101418', ...serifFont }}>
                Découvrez nos formations Tech, IA et Gestion
              </h1>
              <p className="max-w-lg text-base leading-relaxed mb-8" style={{ color: '#2c3440', ...bodyFont }}>
                Des actions de formation intensives, 100 % à distance et animées en direct par un formateur
                expert — certifiées Qualiopi et finançables par votre OPCO.
              </p>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-[15px] text-white transition-all hover:opacity-90"
                style={{ background: NAVY, ...headingFont }}>
                Parler à un conseiller
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Visuel à formes organiques */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="hidden lg:block relative" style={{ minHeight: 340 }}>
              <div className="absolute rounded-3xl" style={{ width: 90, height: 90, left: '2%', bottom: '8%', background: CYAN }} />
              <div className="absolute rounded-3xl" style={{ width: 120, height: 150, right: '0%', top: '10%', background: NAVY }} />
              <div className="absolute overflow-hidden rounded-3xl" style={{ left: '10%', top: '0', width: '78%', height: 340, boxShadow: '0 20px 45px rgba(0,56,44,0.2)' }}>
                <img src="/images/ee46959d2_course-04.webp" alt="Formations Hi-Tech Academy" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Fil d'Ariane + grille ---------- */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-xs mb-6" style={{ color: '#6b7280', ...bodyFont }}>
              <Link to="/" className="hover:underline">Accueil</Link> » Formations
            </p>

            <h2
              className="font-serif-display font-bold text-3xl sm:text-4xl mb-3"
              style={{ color: '#101418', ...serifFont }}>
              Nos formations certifiées Qualiopi
            </h2>
            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm mb-10" style={{ color: '#4b5563', ...bodyFont }}>
              <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" style={{ color: TEAL }} /> Certifié Qualiopi</span>
              <span className="flex items-center gap-1.5"><Landmark className="w-4 h-4" style={{ color: TEAL }} /> Finançable OPCO</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" style={{ color: TEAL }} /> Attestation de fin de formation</span>
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {formations.map((formation, i) => {
                const vente = getVenteById(formation.id);
                const duree = formation.keyFacts.find((f) => f.label === 'Durée')?.value.split(' — ')[0] ?? '';
                const tarif = formation.keyFacts.find((f) => f.label === 'Tarif')?.value.split(' / ')[0].split(' — ')[0] ?? '';
                const prerequis = formation.id === 'kubernetes-fondamentaux'
                  ? 'Linux et Docker (bases)'
                  : formation.id === 'ia-for-tech'
                    ? "Pratique d'un langage"
                    : 'Ouverte à tous';
                return (
                  <motion.div
                    key={formation.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col rounded-2xl overflow-hidden bg-white"
                    style={{ border: '1px solid #e5e5e5', boxShadow: '0 2px 10px rgba(0,56,44,0.05)' }}>

                    {/* Image sur fond menthe */}
                    <Link to={`/formations/${formation.id}`} className="relative block m-3 rounded-xl overflow-hidden" style={{ background: MINT, height: 150 }}>
                      <img src={formation.image} alt={formation.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      <span
                        className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold"
                        style={{ background: '#bff4e8', color: NAVY, ...headingFont }}>
                        <BadgeCheck className="w-3 h-3" /> Certifiante
                      </span>
                    </Link>

                    <div className="flex flex-col flex-1 px-5 pb-5 pt-1">
                      <h3
                        className="font-serif-display font-bold text-lg leading-snug mb-3"
                        style={{ color: NAVY, ...serifFont }}>
                        {formation.title}
                      </h3>

                      <ul className="space-y-2 mb-5">
                        <li className="flex items-center gap-2 text-[13px]" style={{ color: '#1f2124', ...bodyFont }}>
                          <Clock className="w-4 h-4 shrink-0" style={{ color: TEAL }} />
                          Durée : {duree}
                        </li>
                        <li className="flex items-center gap-2 text-[13px]" style={{ color: '#1f2124', ...bodyFont }}>
                          <BookOpen className="w-4 h-4 shrink-0" style={{ color: TEAL }} />
                          Prérequis : {prerequis}
                        </li>
                        <li className="flex items-center gap-2 text-[13px]" style={{ color: '#1f2124', ...bodyFont }}>
                          <Euro className="w-4 h-4 shrink-0" style={{ color: TEAL }} />
                          {tarif} · finançable OPCO
                        </li>
                      </ul>

                      <Link
                        to={`/formations/${formation.id}`}
                        className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:shadow-md"
                        style={{ background: 'white', color: '#1f2124', border: '1.5px solid #c9cdd4', ...headingFont }}>
                        Voir la formation <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bandeau réassurance */}
            <div
              className="mt-14 rounded-3xl px-7 py-9 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6"
              style={{ background: MINT_LIGHT, border: '1px solid #bff4e8' }}>
              <div>
                <h3 className="font-serif-display font-bold text-xl mb-1" style={{ color: NAVY, ...serifFont }}>
                  Vous hésitez entre deux formations ?
                </h3>
                <p className="text-sm" style={{ color: '#374151', ...bodyFont }}>
                  Un conseiller étudie votre profil, votre financement et vous oriente — sans engagement.
                </p>
              </div>
              <Link
                to="/#contact"
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white"
                style={{ background: ACCENT, ...headingFont }}>
                Être conseillé <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
