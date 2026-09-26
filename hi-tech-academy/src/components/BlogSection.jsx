import PrimaryButton from '@/components/ui/primary-button';
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from '@phosphor-icons/react';
import { blogPosts } from '@/data/blogPosts';

const FONT = "'Inter', sans-serif";
const HEADING_FONT = "'DM Sans', sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
};

// Carte d'article. Mise en page éditoriale : image en 4/3, étiquette de
// rubrique posée dans l'angle, numéro d'ordre en filigrane, puis titre,
// chapô et pied de carte (lien « Lire l'article » + date sur un filet).
function ArticleCard({ post, index }) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <motion.article
      className="group h-full"
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}>

      <Link
        to={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl cursor-pointer"
        style={{
          background: '#ffffff',
          border: '1.5px solid #f0f7ff',
          transition: 'border-color 0.3s ease, transform 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#002d74'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0f7ff'; }}>

        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />

          {/* Rubrique */}
          <span
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ background: '#002d74', color: '#ffffff', fontFamily: FONT }}>
            {post.category}
          </span>

          {/* Durée de lecture */}
          <span
            className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{ background: '#ffffff', color: '#002d74', fontFamily: FONT }}>
            <Clock size={13} weight="bold" />
            {post.readTime}
          </span>
        </div>

        {/* Contenu */}
        <div className="flex flex-1 flex-col gap-3 px-5 pt-5 pb-5">
          <div className="flex items-baseline gap-3">
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: '#9cbdff', fontFamily: HEADING_FONT }}>
              {number}
            </span>
            <h3
              className="text-lg leading-snug transition-colors duration-200 group-hover:text-[#002d74]"
              style={{ color: '#243037', fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '-0.015em' }}>
              {post.title}
            </h3>
          </div>

          <p
            className="text-sm leading-relaxed line-clamp-3"
            style={{ color: '#5f6568', fontFamily: FONT }}>
            {post.excerpt}
          </p>

          {/* Pied de carte */}
          <div className="mt-auto pt-4 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid #f0f7ff' }}>

            <span
              className="inline-flex items-center gap-2.5 text-sm font-semibold"
              style={{ color: '#002d74', fontFamily: FONT }}>

              {/* Pastille plate : une flèche fixe, sans animation. */}
              <span className="grid place-items-center w-9 h-9 rounded-full shrink-0" style={{ background: '#f0f7ff' }}>
                <ArrowRight size={16} weight="bold" style={{ color: '#002d74' }} />
              </span>
              Lire l'article
            </span>

            <span className="flex items-center gap-2 shrink-0">
              <span className="h-px w-6" style={{ background: '#dbebff' }} />
              <time
                dateTime={post.dateISO}
                className="text-xs"
                style={{ color: '#8c8c8c', fontFamily: FONT }}>
                {post.date}
              </time>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function BlogSection() {
  return (
    <section className="w-full py-16 sm:py-20 md:py-24" style={{ background: 'transparent' }}>
      <div className="max-w-site mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

          <div>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
              style={{ color: '#002d74', fontFamily: FONT }}>
              Blog & Actualités
            </span>
            <h2
              className="text-h2"
              style={{ color: '#243037', fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '-0.015em' }}>
              Nos Derniers{' '}
              <span style={{ color: '#002d74' }}>Articles</span>
            </h2>
            <p className="mt-4 text-sm max-w-md" style={{ color: '#5f6568', fontFamily: FONT }}>
              Veille, retours de terrain et repères pratiques pour choisir votre prochaine compétence.
            </p>
          </div>

        </motion.div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 items-stretch">
          {blogPosts.map((post, i) => (
            <ArticleCard key={post.slug} post={post} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>

          <PrimaryButton to="/blog" className="mx-auto">Voir tous les articles</PrimaryButton>
        </motion.div>

      </div>
    </section>);

}
