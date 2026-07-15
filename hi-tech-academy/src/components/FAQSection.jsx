import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "Quels sont les prérequis pour rejoindre la formation Kubernetes ?",
    answer: "La formation Kubernetes – Fondamentaux nécessite la maîtrise des bases de la ligne de commande Linux et des fondamentaux des conteneurs et de Docker. Ces prérequis sont vérifiés à l'entrée via un test de positionnement, et le programme détaillé les précise.",
  },
  {
    question: "Quel document est délivré à l'issue de la formation ?",
    answer: "La formation donne lieu à une attestation de fin de formation (art. L.6353-1 du Code du travail) mentionnant les objectifs, la nature, la durée et les résultats de l'évaluation des acquis.",
  },
  {
    question: "Est-ce que la formation se fait en ligne ou en présentiel ?",
    answer: "La formation se déroule 100 % à distance, en classe virtuelle synchrone (Google Meet), animée en direct par le formateur, avec des travaux pratiques sur un cluster Kubernetes réel (Azure AKS).",
  },
  {
    question: "Quelle est la durée de la formation ?",
    answer: "La formation Kubernetes – Fondamentaux dure 7 heures, sur 1 journée : 3 h 30 le matin (9 h 00–12 h 30) et 3 h 30 l'après-midi (13 h 30–17 h 00).",
  },
  {
    question: "Sous quel délai puis-je commencer la formation ?",
    answer: "Le délai d'accès est de 1 jour minimum entre votre demande et le début de la formation (hors délais de prise en charge par un financeur). La session ouvre à partir de 1 participant.",
  },
  {
    question: "La formation est-elle accessible aux personnes en situation de handicap ?",
    answer: "Oui. Nos formations à distance peuvent être adaptées aux personnes en situation de handicap. Lors de l'inscription, notre référent handicap (Mahdi CHEKINI — contact@hi-techacademy.fr — 07 51 47 41 35) étudie avec vous les aménagements nécessaires.",
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