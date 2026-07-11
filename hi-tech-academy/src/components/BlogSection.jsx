import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const blogPosts = [
{
  title: 'Les 10 compétences tech les plus demandées en 2024',
  excerpt: 'Découvrez les compétences essentielles pour réussir dans le secteur technologique cette année.',
  date: '15 Juin 2024',
  readTime: '5 min',
  image: '/images/c3290df03_feature-2.webp',
  category: 'Carrière'
},
{
  title: 'Comment devenir développeur full-stack en 6 mois',
  excerpt: 'Un guide complet pour maîtriser le développement web moderne et lancer votre carrière.',
  date: '10 Juin 2024',
  readTime: '8 min',
  image: '/images/df0155452_istock-2177184303.jpg',
  category: 'Formation'
},
{
  title: 'L\'intelligence artificielle dans l\'éducation',
  excerpt: 'Comment l\'IA transforme l\'apprentissage et la formation professionnelle.',
  date: '5 Juin 2024',
  readTime: '6 min',
  image: '/images/cbdcfde73_generated_f57bba76.png',
  category: 'Innovation'
}];


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function BlogSection() {
  return (
    <section className="w-full py-16 sm:py-20 md:py-24" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            Blog & Actualités
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            Nos Derniers{' '}
            <span style={{ color: '#005064' }}>Articles</span>
          </h2>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, i) =>
          <motion.article
            key={i}
            className="group cursor-pointer"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}>
            
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[4/3]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
                {/* Category Badge */}
                <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#F8B102', color: 'black', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span style={{ fontFamily: "'Inter', sans-serif" }}>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span style={{ fontFamily: "'Inter', sans-serif" }}>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                className="text-lg font-bold leading-snug group-hover:text-[#005064] transition-colors"
                style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p
                className="text-sm leading-relaxed line-clamp-2"
                style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
                
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <a
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
                style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                  Lire l'article
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.article>
          )}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          
          <a
            href="#"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg"
            style={{
              backgroundColor: '#005064',
              color: 'white',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
            
            Voir tous les articles
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>);

}