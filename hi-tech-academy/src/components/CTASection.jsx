import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="w-full py-10 sm:py-12 md:py-16" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="relative w-full rounded-3xl overflow-hidden min-h-[240px] md:min-h-[280px]"
          style={{
            background: 'linear-gradient(135deg, #003040 0%, #005064 40%, #007a96 100%)'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) =>
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                background: 'radial-gradient(ellipse, rgba(248,177,2,0.08) 0%, transparent 70%)',
                width: 150 + i * 60,
                height: 150 + i * 60,
                left: `${10 + i * 20}%`,
                top: `${15 + i % 3 * 20}%`
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }} />

            )}
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-20 py-12 md:py-16">
            
            {/* Left Content - Text */}
            <motion.div
              className="w-full md:w-1/2 lg:w-3/5 mb-8 md:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              
              {/* Label with icon */}
              







              

              {/* Heading */}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                Commencez votre formation{' '}
                <span style={{ color: '#F8B102' }}>aujourd'hui !</span>
              </h2>

              {/* Body */}
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed mb-8 text-white/75 max-w-xl"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                
                Devenez un expert avec nos formations certifiantes et obtenez un emploi dans un domaine porteur.
              </p>

              {/* Trust indicators */}
              












              

              {/* CTA Button */}
              <a
                href="#programmes"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg hover:gap-3"
                style={{ backgroundColor: '#F8B102', color: 'black', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                Explorer les formations
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Right Image - Positioned at bottom */}
            <motion.div
              className="w-full md:w-1/2 lg:w-2/5 flex items-end justify-center md:justify-end"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              
              <img src="/images/b24b26313_nori-student-06.png"

              alt="Étudiant Hi Tech Academy"
              className="w-full max-w-[280px] md:max-w-[320px] h-auto object-contain drop-shadow-2xl" />
              
              
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>);

}