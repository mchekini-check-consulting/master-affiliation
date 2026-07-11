import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "Quels sont les prérequis pour rejoindre une formation ?",
    answer: "La plupart de nos formations ne nécessitent aucun prérequis technique. Une simple motivation et un ordinateur suffisent pour commencer. Certaines formations avancées peuvent nécessiter des bases en programmation — cela est précisé sur chaque fiche de formation.",
  },
  {
    question: "Les formations sont-elles reconnues par les entreprises ?",
    answer: "Oui. Nos certifications sont reconnues par un large réseau de partenaires entreprises. Elles attestent de compétences concrètes et sont valorisées lors des recrutements dans le secteur tech.",
  },
  {
    question: "Est-ce que les formations se font en ligne ou en présentiel ?",
    answer: "Nous proposons les deux formats. Vous pouvez suivre nos formations entièrement en ligne à votre rythme, ou opter pour des sessions en présentiel disponibles dans nos centres. Des formats hybrides sont également disponibles.",
  },
  {
    question: "Quelle est la durée moyenne d'une formation ?",
    answer: "La durée varie selon le programme : de 3 mois pour des formations courtes ciblées, jusqu'à 6 mois pour des parcours complets comme le Développement Full Stack. Chaque formation précise sa durée et le volume horaire.",
  },
  {
    question: "Y a-t-il un accompagnement après la formation ?",
    answer: "Absolument. Nous proposons un accompagnement carrière post-formation incluant la préparation CV, la simulation d'entretiens, et une mise en relation avec notre réseau d'entreprises partenaires.",
  },
  {
    question: "Comment se déroule le paiement et y a-t-il des facilités ?",
    answer: "Nous proposons plusieurs options de paiement : paiement comptant, paiement en plusieurs fois sans frais, et des solutions de financement selon votre situation. Contactez notre équipe pour trouver la formule adaptée.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8" style={{ background: 'white' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
            style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            FAQ
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4"
            style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Questions{' '}
            <span style={{ color: '#005064' }}>Fréquentes</span>
          </h2>
          <p className="text-sm" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            Tout ce que vous devez savoir avant de commencer votre parcours.
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12" style={{ background: '#c0d4d8' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#F8B102' }} />
            <div className="h-px w-12" style={{ background: '#c0d4d8' }} />
          </div>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: isOpen ? '1.5px solid #005064' : '1.5px solid #e8edf6',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  style={{ background: isOpen ? '#f5f7fc' : 'white', transition: 'background 0.3s ease' }}
                >
                  <span
                    className="font-semibold text-sm md:text-base leading-snug"
                    style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {faq.question}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: isOpen ? '#005064' : '#f0f3fa', transition: 'background 0.3s ease' }}
                  >
                    {isOpen
                      ? <Minus className="w-4 h-4 text-white" />
                      : <Plus className="w-4 h-4" style={{ color: '#005064' }} />
                    }
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden', background: '#f5f7fc' }}
                    >
                      <p
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-sm mb-4" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            Vous avez d'autres questions ?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90"
            style={{ backgroundColor: '#F8B102', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Contactez-nous
          </a>
        </div>

      </div>
    </section>
  );
}