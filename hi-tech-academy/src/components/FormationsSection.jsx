import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Layers, Award, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const formations = [
{
  id: 1,
  tag: 'Qualité & Fiabilité',
  title: 'Test Logiciel & Introduction aux Tests Automatisés',
  description: 'Maîtrisez les techniques de test, la détection de bugs et l\'automatisation avec des outils industry-standard utilisés par les grandes entreprises tech.',
  duree: '3 mois',
  heures: '120h',
  sections: 8,
  certifie: true,
  color: '#005064',
  accent: '#F8B102',
  image: '/images/3ec49cd4c_course-09.webp'
},
{
  id: 2,
  tag: 'Le Plus Populaire',
  title: 'Développement Full Stack',
  description: 'Du frontend au backend, créez des applications web complètes et modernes. React, Node.js, bases de données et déploiement cloud en un seul parcours.',
  duree: '6 mois',
  heures: '240h',
  sections: 14,
  certifie: true,
  color: '#003040',
  accent: '#F8B102',
  image: '/images/ee46959d2_course-04.webp'

},
{
  id: 3,
  tag: 'Infrastructure & Cloud',
  title: 'Ingénierie DevOps',
  description: 'CI/CD, Docker, Kubernetes, AWS — devenez l\'expert qui fait le pont entre développement et infrastructure pour des déploiements fiables et rapides.',
  duree: '4 mois',
  heures: '160h',
  sections: 10,
  certifie: true,
  color: '#005064',
  accent: '#F8B102',
  image: '/images/0002848c7_istock-2177184303.jpg'
}];


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  })
};

function FormationCard({ formation, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: 'white',
        border: '1px solid #e0e8f4',
        boxShadow: hovered ?
        '0 8px 24px rgba(0,80,100,0.10)' :
        '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)'
      }}>
      


      {/* Image area */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 200, background: '#edf6f6' }}>
        
        {formation.image ?
        <img src={formation.image} alt={formation.title} className="w-full h-full object-cover" /> :

        <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div
              className="w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center text-2xl font-black"
              style={{ background: '#005064', color: '#F8B102', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              
                {formation.id < 10 ? `0${formation.id}` : formation.id}
              </div>
              <p className="text-xs text-[#196164]/40" style={{ fontFamily: "'Inter', sans-serif" }}>
                Photo de la formation
              </p>
            </div>
          </div>
        }

        {/* Gradient overlay bottom */}
        

        
        

        {/* Tag */}
        <div
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-[hsl(var(--card))]"
          style={{
            background: 'rgba(0,80,100,0.10)',
            color: '#005064',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backdropFilter: 'blur(8px)'
          }}>
          
          {formation.tag}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Title */}
        <h3
          className="font-bold text-lg leading-snug mb-3"
          style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          
          {formation.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed mb-5 flex-1"
          style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
          
          {formation.description}
        </p>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-2xl"
          style={{ background: '#f0f3fa' }}>

          <div className="flex flex-col items-center gap-1">
          <Clock className="w-4 h-4" style={{ color: '#005064' }} />
            <span className="text-xs font-bold" style={{ color: '#0f2e2f', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {formation.duree}
            </span>
            <span className="text-[10px]" style={{ color: '#6b8a8b', fontFamily: "'Inter', sans-serif" }}>
              Durée
            </span>
          </div>
          <div className="flex flex-col items-center gap-1" style={{ borderLeft: '1px solid #c0d4d8', borderRight: '1px solid #c0d4d8' }}>
            <BookOpen className="w-4 h-4" style={{ color: '#005064' }} />
            <span className="text-xs font-bold" style={{ color: '#0f2e2f', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {formation.heures}
            </span>
            <span className="text-[10px]" style={{ color: '#6b8a8b', fontFamily: "'Inter', sans-serif" }}>
              de cours
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Layers className="w-4 h-4" style={{ color: '#005064' }} />
            <span className="text-xs font-bold" style={{ color: '#0f2e2f', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {formation.sections}
            </span>
            <span className="text-[10px]" style={{ color: '#6b8a8b', fontFamily: "'Inter', sans-serif" }}>
              Modules
            </span>
          </div>
        </div>

        {/* Certifié badge */}
        {formation.certifie &&
        <div className="flex items-center gap-2 mb-5">
            <Award className="w-4 h-4" style={{ color: '#F8B102' }} />
            <span
            className="text-xs font-semibold"
            style={{ color: '#196164', fontFamily: "'Inter', sans-serif" }}>
            
              Formation certifiante reconnue
            </span>
          </div>
        }

        {/* CTA Button */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all [font-family:'Plus_Jakarta_Sans',_sans-serif]"
          style={{
            background: hovered ? '#005064' : '#f0f3fa',
            color: hovered ? 'white' : '#005064',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            border: formation.featured || hovered ? 'none' : '1.5px solid #005064',
            transition: 'all 0.3s ease'
          }}>
          
          Découvrir la formation
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>);

}

export default function FormationsSection() {
  return (
    <section
      id="programmes"
      className="w-full py-16 sm:py-20 lg:py-24"
      style={{ background: 'white' }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            Découvrir notre Catalogue
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            Explorer nos{' '}
            <span style={{ color: '#002d74' }}>Formations</span>
          </h2>
          <p
            className="max-w-xl mx-auto text-base"
            style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            
            Des parcours intensifs, certifiants et pensés pour vous faire décrocher un emploi dans le secteur tech.
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16" style={{ background: '#c0d4d8' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#F8B102' }} />
            <div className="h-px w-16" style={{ background: '#c0d4d8' }} />
          </div>


        </motion.div>

        {/* Cards - Carousel on mobile, grid on larger screens */}
        <div className="md:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {formations.map((f, i) =>
                <CarouselItem key={f.id} className="pl-4">
                  <FormationCard formation={f} index={i} />
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
          </div>
          <p className="text-center text-xs mt-2" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            Faites défiler pour voir plus
          </p>
        </div>
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
          {formations.map((f, i) =>
          <FormationCard key={f.id} formation={f} index={i} />
          )}
        </div>

        {/* Browse button */}
        <div className="flex justify-center mt-10">
          <a
            href="#programmes"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: '#F8B102', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            Parcourir nos formations
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}>
          
          <p
            className="text-sm mb-4"
            style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            
            Vous ne savez pas quelle formation choisir ?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
            style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            Parlez à un conseiller
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>);

}