import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const highlights = [
'Devenez un Expert',
'Développez vos compétences',
'Transformez votre passion'];


const highlights_sub = [
'Une formation concrète et intensive dans un domaine porteur.',
'Compétences numériques concrètes pour booster votre carrière dès aujourd\'hui.',
'De la passion à la profession, nos formateurs experts vous guident pas à pas.'];


const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] } })
};

export default function AboutSection() {
  return (
    <section
      id="about"
      className="w-full py-16 sm:py-20 lg:py-24"
      style={{ background: 'white' }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

        {/* ── Top Feature Cards ── */}
        















































        

        {/* ── About Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Image Stack */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ minHeight: 480 }}>
            
            {/* Decorative bg blob */}
            <div
              className="absolute -bottom-8 -left-8 w-72 h-72 rounded-full z-0"
              style={{ background: 'radial-gradient(ellipse, rgba(0,80,100,0.10) 0%, transparent 70%)' }} />
            

            {/* Main Image — tall portrait */}
            <div
              className="relative z-10 overflow-hidden w-full"
              style={{ height: 520 }}>
              <img src="/images/59dbb28b3_left-video.jpg"

              alt="Étudiants en formation"
              className="w-full h-full object-cover object-top" />
            </div>



            {/* Floating badge */}
            <div
              className="absolute z-30 top-6 right-0 rounded-2xl px-4 py-3 flex flex-col items-center"
              style={{
                background: '#F8B102',
                boxShadow: '0 4px 12px rgba(248,177,2,0.20)'
              }}>
              
              <span
                className="text-2xl font-black text-black leading-none"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                +2K
              </span>
              <span
                className="text-xs font-semibold text-black/70 text-center leading-tight mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                
                Étudiants<br />formés
              </span>
            </div>
          </motion.div>

          {/* Right — Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            
            {/* Label */}
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.22em] mb-4"
              style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              
              À propos de nous
            </span>

            {/* Heading */}
            <h2
              className="text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              
              Votre Porte d'Entrée vers une Carrière{' '}
              <span style={{ color: '#005064' }}>Technologique</span>{' '}
              Réussie
            </h2>

            {/* Body */}
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
              
              Notre organisme de formation est dédié à fournir des programmes de formation de haute qualité dans le domaine des technologies de l'information. Nous nous engageons à aider nos étudiants à atteindre leurs objectifs professionnels grâce à des parcours d'apprentissage adaptés et des formateurs experts.
            </p>

            {/* Checklist */}
            <ul className="space-y-3 mb-10">
              {[
              'Formateurs certifiés & expérimentés en industrie',
              'Projets réels dès la première semaine',
              'Accompagnement carrière jusqu\'à l\'emploi'].
              map((item, i) =>
              <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#005064' }} />
                  <span
                  className="text-sm"
                  style={{ color: '#2d4a4e', fontFamily: "'Inter', sans-serif" }}>
                  
                    {item}
                  </span>
                </li>
              )}
            </ul>

            {/* CTA */}
            <a
              href="#programmes"
              className="inline-flex items-center gap-2 h-13 px-8 py-4 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: '#F8B102', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              
              Se Lancer !
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>);

}