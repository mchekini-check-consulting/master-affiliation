import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Layers, Users, HeadphonesIcon, Briefcase, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const steps = [
  {
    number: '01',
    tag: 'Étape 1',
    title: 'Évaluation Personnalisée',
    description: "Chaque parcours commence par une évaluation des compétences pour personnaliser votre contenu et vous orienter vers les modules les plus pertinents.",
    icon: ClipboardList,
    span: 'col-span-2 md:col-span-1',
  },
  {
    number: '02',
    tag: 'Étape 2',
    title: 'Modules Interactifs',
    description: "Vidéos, quiz, exercices pratiques et projets réels combinés pour une compréhension approfondie et une application concrète.",
    icon: Layers,
    span: 'col-span-2 md:col-span-1',
  },
  {
    number: '03',
    tag: 'Étape 3',
    title: 'Apprentissage en Groupe',
    description: "Sessions collaboratives, forums de discussion et projets en équipe pour apprendre comme dans un environnement professionnel.",
    icon: Users,
    span: 'col-span-2 md:col-span-2',
  },
  {
    number: '04',
    tag: 'Étape 4',
    title: 'Accompagnement Continu',
    description: "Soutien constant de nos formateurs et mentors pour surmonter les défis et rester motivé tout au long de votre parcours.",
    icon: HeadphonesIcon,
    span: 'col-span-2 md:col-span-2',
  },
  {
    number: '05',
    tag: 'Étape 5',
    title: 'Projets Réels',
    description: "Projets pratiques simulant des situations réelles pour vous préparer aux défis professionnels avec confiance.",
    icon: Briefcase,
    span: 'col-span-2 md:col-span-1',
  },
  {
    number: '06',
    tag: 'Étape 6',
    title: 'Évaluation & Attestation',
    description: "Évaluation finale des acquis (QCM + mise en pratique) et attestation de fin de formation détaillant les résultats.",
    icon: Award,
    span: 'col-span-2 md:col-span-1',
  },
];

export default function TimelineSection() {
  const [active, setActive] = useState(null);

  return (
    <section style={{ background: '#005064' }} className="py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
            style={{ color: '#F8B102', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Notre Savoir Faire
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Découvrez Notre Approche{' '}
            <span style={{ color: '#F8B102' }}>d'Apprentissage Interactif</span>
          </h2>
          <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}>
            Nous structurons nos formations pour maximiser votre expérience d'apprentissage en 6 étapes clés.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = active === i;

                return (
                  <CarouselItem key={i} className="pl-4">
                    <motion.div
                      onClick={() => setActive(isActive ? null : i)}
                      className="relative cursor-pointer rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
                      style={{
                        background: isActive
                          ? 'rgba(248,177,2,0.15)'
                          : 'rgba(255,255,255,0.06)',
                        border: isActive
                          ? '1.5px solid rgba(248,177,2,0.5)'
                          : '1.5px solid rgba(255,255,255,0.08)',
                        minHeight: 180,
                        transition: 'all 0.3s ease',
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Ghost number */}
                      <span
                        className="absolute right-3 bottom-2 text-7xl font-black leading-none select-none pointer-events-none"
                        style={{ color: 'rgba(255,255,255,0.04)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {step.number}
                      </span>

                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: isActive ? '#F8B102' : 'rgba(255,255,255,0.12)' }}
                        >
                          <Icon className="w-5 h-5" style={{ color: isActive ? '#003040' : 'white' }} />
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(248,177,2,0.15)',
                            color: '#F8B102',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {step.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="font-bold text-sm text-white leading-snug mb-2 z-10 relative"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {step.title}
                      </h3>

                      {/* Description — visible on click */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="text-xs leading-relaxed z-10 relative overflow-hidden"
                            style={{ color: 'rgba(255,255,255,0.70)', fontFamily: "'Inter', sans-serif" }}
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Tap hint */}
                      {!isActive && (
                        <span className="text-[10px] mt-1 z-10 relative" style={{ color: 'rgba(255,255,255,0.30)', fontFamily: "'Inter', sans-serif" }}>
                          Appuyez pour en savoir plus →
                        </span>
                      )}
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          {/* Scroll indicator dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i === 0 ? '#F8B102' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
          <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}>
            Faites défiler pour voir les étapes
          </p>
        </div>

        {/* Desktop Bento Grid */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = active === i;

            return (
              <motion.div
                key={i}
                onClick={() => setActive(isActive ? null : i)}
                className={`relative cursor-pointer rounded-2xl p-5 flex flex-col justify-between overflow-hidden ${step.span}`}
                style={{
                  background: isActive
                    ? 'rgba(248,177,2,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  border: isActive
                    ? '1.5px solid rgba(248,177,2,0.5)'
                    : '1.5px solid rgba(255,255,255,0.08)',
                  minHeight: 160,
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.10)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Ghost number */}
                <span
                  className="absolute right-3 bottom-2 text-7xl font-black leading-none select-none pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.04)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {step.number}
                </span>

                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? '#F8B102' : 'rgba(255,255,255,0.12)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: isActive ? '#003040' : 'white' }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(248,177,2,0.15)',
                      color: '#F8B102',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {step.tag}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-bold text-sm text-white leading-snug mb-2 z-10 relative"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {step.title}
                </h3>

                {/* Description — visible on click */}
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="text-xs leading-relaxed z-10 relative overflow-hidden"
                      style={{ color: 'rgba(255,255,255,0.70)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Tap hint */}
                {!isActive && (
                  <span className="text-[10px] mt-1 z-10 relative" style={{ color: 'rgba(255,255,255,0.30)', fontFamily: "'Inter', sans-serif" }}>
                    Appuyez pour en savoir plus →
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}