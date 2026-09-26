import PrimaryButton from '@/components/ui/primary-button';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, GraduationCap, Wallet, Lifebuoy, ThumbsUp, ThumbsDown } from '@phosphor-icons/react';

// FAQ organisée par thème : un rail de catégories à gauche (colonne sur
// desktop, ligne défilante sur mobile) et l'accordéon correspondant à droite.
// Un seul panneau ouvert à la fois, par catégorie.
const CATEGORIES = [
  {
    id: 'formation',
    label: 'La formation',
    icon: GraduationCap,
    items: [
      {
        id: 'f1',
        question: "Quels sont les prérequis pour rejoindre la formation Kubernetes ?",
        answer: "La formation Kubernetes – Fondamentaux nécessite la maîtrise des bases de la ligne de commande Linux et des fondamentaux des conteneurs et de Docker. Ces prérequis sont vérifiés à l'entrée via un test de positionnement, et le programme détaillé les précise.",
      },
      {
        id: 'f2',
        question: "Quelle est la durée de la formation ?",
        answer: "La formation Kubernetes – Fondamentaux dure 7 heures, sur 1 journée : 3 h 30 le matin (9 h 00–12 h 30) et 3 h 30 l'après-midi (13 h 30–17 h 00).",
      },
      {
        id: 'f3',
        question: "Est-ce que la formation se fait en ligne ou en présentiel ?",
        answer: "La formation se déroule 100 % à distance, en classe virtuelle synchrone (Google Meet), animée en direct par le formateur, avec des travaux pratiques sur un cluster Kubernetes réel (Azure AKS).",
      },
      {
        id: 'f4',
        question: "Quel document est délivré à l'issue de la formation ?",
        answer: "La formation donne lieu à une attestation de fin de formation (art. L.6353-1 du Code du travail) mentionnant les objectifs, la nature, la durée et les résultats de l'évaluation des acquis.",
      },
    ],
  },
  {
    id: 'financement',
    label: 'Financement',
    icon: Wallet,
    items: [
      {
        id: 'p1',
        question: "Qui peut financer ma formation ?",
        answer: "La plupart de nos participants ne paient pas leur formation eux-mêmes : salarié, votre entreprise mobilise son plan de développement des compétences et son OPCO ; travailleur non salarié, votre fonds de formation (AGEFICE, FIF PL, FAFCEA) prend en charge tout ou partie du coût, dans la limite de son plafond annuel.",
      },
      {
        id: 'p2',
        question: "Quels documents fournissez-vous pour le dossier ?",
        answer: "Nous remettons devis, programme et convention de formation au format attendu par votre OPCO ou votre fonds, à votre nom. Vous déposez la demande, nous complétons chaque pièce demandée.",
      },
      {
        id: 'p3',
        question: "Et si je finance moi-même ?",
        answer: "Si vous vous formez à titre personnel, le prix affiché est le prix final. Un devis et une convention vous sont remis avant tout engagement, avec délai de rétractation.",
      },
    ],
  },
  {
    id: 'acces',
    label: 'Accès & accompagnement',
    icon: Lifebuoy,
    items: [
      {
        id: 'a1',
        question: "Sous quel délai puis-je commencer la formation ?",
        answer: "Le délai d'accès est de 1 jour minimum entre votre demande et le début de la formation (hors délais de prise en charge par un financeur). La session ouvre à partir de 1 participant.",
      },
      {
        id: 'a2',
        question: "La formation est-elle accessible aux personnes en situation de handicap ?",
        answer: "Oui. Nos formations à distance peuvent être adaptées aux personnes en situation de handicap. Lors de l'inscription, notre référent handicap (Mahdi CHEKINI, contact@hi-techacademy.fr, 07 51 47 41 35) étudie avec vous les aménagements nécessaires.",
      },
    ],
  },
];

const FONT = "'Inter', sans-serif";
const HEADING_FONT = "'DM Sans', sans-serif";

function FeedbackRow() {
  const [vote, setVote] = useState(null);

  const base =
    'inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs mr-1" style={{ color: '#8c8c8c', fontFamily: FONT }}>
        Cette réponse vous a-t-elle aidé ?
      </span>
      <button
        type="button"
        onClick={() => setVote('up')}
        aria-pressed={vote === 'up'}
        className={base}
        style={{
          fontFamily: FONT,
          border: '1px solid #dbebff',
          background: vote === 'up' ? '#002d74' : '#ffffff',
          color: vote === 'up' ? '#ffffff' : '#002d74',
        }}
      >
        <ThumbsUp className="w-3.5 h-3.5" weight={vote === 'up' ? 'fill' : 'regular'} />
        Oui
      </button>
      <button
        type="button"
        onClick={() => setVote('down')}
        aria-pressed={vote === 'down'}
        className={base}
        style={{
          fontFamily: FONT,
          border: '1px solid #dbebff',
          background: vote === 'down' ? '#002d74' : '#ffffff',
          color: vote === 'down' ? '#ffffff' : '#002d74',
        }}
      >
        <ThumbsDown className="w-3.5 h-3.5" weight={vote === 'down' ? 'fill' : 'regular'} />
        Non
      </button>
      {vote && (
        <span className="text-xs" style={{ color: '#5f6568', fontFamily: FONT }}>
          Merci pour votre retour.
        </span>
      )}
    </div>
  );
}

export default function FAQSection() {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [openId, setOpenId] = useState(CATEGORIES[0].items[0].id);

  const active = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  const selectCategory = (c) => {
    setCategory(c.id);
    setOpenId(c.items[0].id);
  };

  return (
    <section className="w-full py-16 sm:py-20" style={{ background: 'transparent' }}>
      {/* Même gabarit que toutes les sections : `max-w-site` + `px-4 sm:px-6`
          SUR LE CONTENEUR, soit 1400 px utiles. Le padding posé sur la section
          laissait le contenu s'étaler sur les 1448 px du conteneur. */}
      <div className="max-w-site mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
            style={{ color: '#002d74', fontFamily: FONT }}
          >
            FAQ
          </span>
          <h2
            className="text-h2 mb-4"
            style={{ color: '#243037', fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '-0.015em' }}
          >
            Questions{' '}
            <span style={{ color: '#002d74' }}>Fréquentes</span>
          </h2>
          <p className="text-sm" style={{ color: '#5f6568', fontFamily: FONT }}>
            Choisissez un thème, puis ouvrez la question qui vous concerne.
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12" style={{ background: '#dbebff' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#002d74' }} />
            <div className="h-px w-12" style={{ background: '#dbebff' }} />
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-10">

          {/* Rail de catégories */}
          <div
            role="tablist"
            aria-label="Thèmes de la FAQ"
            className="flex flex-row gap-2 overflow-x-auto md:w-72 md:shrink-0 md:flex-col md:overflow-visible"
          >
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectCategory(c)}
                  className="flex items-center gap-2.5 shrink-0 rounded-xl px-4 py-3 text-left text-sm font-semibold whitespace-nowrap md:whitespace-normal cursor-pointer"
                  style={{
                    fontFamily: FONT,
                    background: isActive ? '#f0f7ff' : '#ffffff',
                    color: isActive ? '#002d74' : '#5f6568',
                    border: isActive ? '1.5px solid #002d74' : '1.5px solid #f0f7ff',
                    transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                  }}
                >
                  <Icon
                    className="shrink-0" size={18}
                    weight={isActive ? 'fill' : 'regular'}
                    style={{ color: isActive ? '#002d74' : '#8c8c8c' }}
                  />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Accordéon */}
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                {active.items.map((item) => {
                  const isOpen = openId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden"
                      style={{
                        border: isOpen ? '1.5px solid #002d74' : '1.5px solid #f0f7ff',
                        transition: 'border-color 0.3s ease',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                        style={{ background: isOpen ? '#f0f7ff' : '#ffffff', transition: 'background 0.3s ease' }}
                      >
                        <span
                          className="font-semibold text-sm md:text-base leading-snug"
                          style={{ color: '#002d74', fontFamily: FONT }}
                        >
                          {item.question}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: isOpen ? '#002d74' : '#f0f7ff', transition: 'background 0.3s ease' }}
                        >
                          {isOpen
                            ? <Minus className="w-4 h-4" style={{ color: '#ffffff' }} />
                            : <Plus className="w-4 h-4" style={{ color: '#002d74' }} />
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
                            style={{ overflow: 'hidden', background: '#f0f7ff' }}
                          >
                            <div className="px-5 pb-5 flex flex-col gap-3">
                              <p className="text-sm leading-relaxed max-w-measure" style={{ color: '#5f6568', fontFamily: FONT }}>
                                {item.answer}
                              </p>
                              <FeedbackRow key={item.id} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Bas de colonne : CTA */}
            <div
              className="mt-6 flex flex-col items-start gap-4 rounded-2xl px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: '#f0f7ff' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#002d74', fontFamily: FONT }}>
                  Vous avez d'autres questions ?
                </p>
                <p className="text-sm mt-1" style={{ color: '#5f6568', fontFamily: FONT }}>
                  Nous répondons sous 24 h ouvrées, avant tout engagement.
                </p>
              </div>
              <PrimaryButton to="/contact">Contactez-nous</PrimaryButton>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
