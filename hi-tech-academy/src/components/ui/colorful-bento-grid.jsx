import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Grille « bento » : tuiles colorées de hauteur égale, pastilles inclinées,
// légère rotation et ombre au survol.
// Adapté de « colorful-bento-grid » (21st.dev) : JSX, react-router au lieu de
// next/link, teintes de la palette Hi-Tech Academy.
//
//   <BentoGrid items={[{ kicker, title, description, icon, tone, span, href }]} />
//
// tone : 'mint' | 'soft' | 'pale' | 'deep' (fonds dérivés de la palette)
const TONES = {
  mint: '#dbebff',
  soft: '#f0f7ff',
  pale: '#f0f7ff',
  deep: '#9cbdff',
};

// Classes écrites en clair : Tailwind ne génère pas les classes construites
// dynamiquement (lg:grid-cols-${n} ne fonctionnerait pas).
const COLUMN_CLASS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };

const TILT = ['', '', '', ''];
const HOVER_TILT = ['', '', '', ''];

function Tile({ item, index, height }) {
  const { kicker, title, description, icon: Icon, tone = 'soft', span, href } = item;
  const Tag = href ? (href.includes('#') ? 'a' : Link) : 'div';
  const linkProps = href ? (href.includes('#') ? { href } : { to: href }) : {};

  return (
    <Tag
      {...linkProps}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl px-5 py-6',
        'transition-all duration-200 ease-in-out',
        'md:hover:scale-[1.02]',
        HOVER_TILT[index % HOVER_TILT.length],
        href && 'cursor-pointer',
        span
      )}
      style={{ background: TONES[tone], height }}>

      <div className="flex flex-col items-start gap-1">
        <p
          className={cn('mb-1 text-sm font-medium', TILT[index % TILT.length])}
          style={{ color: '#002d74', fontFamily: "'Inter', sans-serif" }}>
          {kicker}
        </p>
        <h3
          className={cn(
            'rounded-full px-6 py-2 text-xl font-semibold text-white',
            TILT[index % TILT.length]
          )}
          style={{ background: '#002d74', fontFamily: "var(--font-heading)" }}>
          {title}
        </h3>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="max-w-md text-sm leading-relaxed" style={{ color: '#243037', fontFamily: "'Inter', sans-serif" }}>
          {description}
        </p>
        {Icon && (
          <Icon
            className="size-10 shrink-0 transition-transform duration-200"
            strokeWidth={1.5}
            style={{ color: '#0066b0' }} />
        )}
      </div>
    </Tag>
  );
}

export default function BentoGrid({ kicker, title, titleIcon: TitleIcon, description, stats = [], items, columns = 3, tileHeight = 330, className }) {
  return (
    <section className={cn('mx-auto w-full max-w-site rounded-3xl px-4 sm:px-6', className)}>
      <div className="mb-12 flex w-full flex-col items-start justify-start gap-4">
        <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            {kicker && (
              <span
                className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.22em]"
                style={{ color: '#002d74', fontFamily: "'Inter', sans-serif" }}>
                {kicker}
              </span>
            )}
            <h2
              className="max-w-xl text-left text-4xl font-semibold leading-[1.1] md:text-5xl"
              style={{ color: '#243037', fontFamily: 'var(--font-heading)', letterSpacing: '-0.015em' }}>
              {title}
              {TitleIcon && (
                <TitleIcon className="ml-3 inline-flex" size={40} strokeWidth={2} style={{ color: '#0066b0' }} />
              )}
            </h2>
          </div>
          {description && (
            <p className="max-w-sm text-base font-medium" style={{ color: '#5f6568', fontFamily: "'Inter', sans-serif" }}>
              {description}
            </p>
          )}
        </div>

        {stats.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-6">
            {stats.map((s) => (
              <p
                key={s}
                className="whitespace-nowrap text-base font-medium"
                style={{ color: '#002d74', fontFamily: "'Inter', sans-serif" }}>
                {s}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', COLUMN_CLASS[columns] || COLUMN_CLASS[3])}>
        {items.map((item, i) => <Tile key={item.title} item={item} index={i} height={tileHeight} />)}
      </div>
    </section>
  );
}
