import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, HeadphonesIcon, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const features = [
{
  icon: GraduationCap,
  title: 'Formateurs Experts',
  description: 'Apprenez auprès de professionnels ayant une expérience significative dans l\'industrie.'
},
{
  icon: Award,
  title: 'Attestation de Formation',
  description: 'Recevez une attestation de fin de formation détaillant les acquis évalués.'
},
{
  icon: HeadphonesIcon,
  title: 'Support Continu',
  description: 'Profitez d\'un accompagnement personnalisé tout au long de votre formation.'
},
{
  icon: CalendarDays,
  title: 'Programme Flexible',
  description: 'Nos programmes sont conçus pour s\'adapter à votre emploi du temps, en ligne et en présentiel.'
}];


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] } })
};

const IMG1 = '/images/d72ad55e5_benefit-img-2.png';
const IMG2 = '/images/664c12fd3_benefit-img-31.png';
const IMG3 = '/images/53aa683f2_benefit-img-1.png';

export default function WhyUsSection() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Text content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
              style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              
              Pourquoi nous Choisir !
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3"
              style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              
              Rendre votre Apprentissage{' '}
              <span style={{ color: '#005064' }}>plus Agréable</span>
            </h2>
            <p className="text-sm mb-8" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
              Apprenez plus de compétences, soyez plus compétitif.
            </p>

            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-12" style={{ background: '#c0d4d8' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#F8B102' }} />
              <div className="h-px w-12" style={{ background: '#c0d4d8' }} />
            </div>

            {/* Feature list - Carousel on mobile with scroll indicators, grid on larger screens */}
            <div className="lg:hidden">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {features.map((feature, i) =>
                    <CarouselItem key={i} className="pl-4">
                      <motion.div
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="flex gap-4 p-5 rounded-2xl"
                        style={{ background: 'white', border: '1px solid #e8edf6' }}>
                        
                        <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#eef1fa' }}>
                        
                          <feature.icon className="w-5 h-5" style={{ color: '#005064' }} />
                        </div>
                        <div>
                          <h3
                          className="font-bold text-sm mb-1"
                          style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                                    {feature.title}
                          </h3>
                          <p className="text-xs leading-relaxed" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
              
              {/* Scroll indicator dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full" style={{ background: '#005064' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#c0d4d8' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#c0d4d8' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#c0d4d8' }} />
              </div>
              <p className="text-center text-xs mt-2" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
                Faites défiler pour voir plus
              </p>
            </div>
            
            <div className="hidden sm:grid grid-cols-2 gap-5">
              {features.map((feature, i) =>
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-4 p-5 rounded-2xl"
                style={{ background: 'white', border: '1px solid #e8edf6' }}>
                
                  <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#eef1fa' }}>
                  
                    <feature.icon className="w-5 h-5" style={{ color: '#005064' }} />
                  </div>
                  <div>
                    <h3
                    className="font-bold text-sm mb-1"
                    style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* RIGHT — Bento puzzle grid */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative">
            
            {/* Bento grid — 2 cols, hauteur fixe et alignée */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '200px 200px', gap: '12px' }}>

              {/* Col gauche — image tall sur les 2 rangées */}
              <div
                className="overflow-hidden"
                style={{ gridColumn: '1', gridRow: '1 / 3', borderRadius: '80px 16px 16px 16px' }}>
                <img
                  src="/images/dccb1c49d_feature-11.jpg"
                  alt="Diplômée"
                  className="w-full h-full object-cover object-top" />
              </div>

              {/* Col droite haut */}
              <div
                className="overflow-hidden"
                style={{ gridColumn: '2', gridRow: '1', borderRadius: '16px 80px 16px 16px' }}>
                <img
                  src={IMG1}
                  alt="Étudiants en formation"
                  className="w-full h-full object-cover" />
              </div>

              {/* Col droite bas */}
              <div
                className="overflow-hidden"
                style={{ gridColumn: '2', gridRow: '2', borderRadius: '16px 16px 80px 16px' }}>
                <img
                  src={IMG3}
                  alt="Étudiante en ligne"
                  className="w-full h-full object-cover" />
              </div>

            </div>

            {/* Floating accent dot */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full hidden"
              style={{ background: '#F8B102' }} />
            
          </motion.div>

        </div>
      </div>
    </section>);

}