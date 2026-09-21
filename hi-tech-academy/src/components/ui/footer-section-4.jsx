import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

// Footer en deux cartes : carte verte de marque à gauche, carte claire avec
// les colonnes de liens et la newsletter à droite.
// Adapté de « footer-section-4 » (21st.dev) : JSX, react-router au lieu de
// next/link, framer-motion, couleurs Hi-Tech Academy.

const PRIMARY = '#000c5b';

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube, twitter: Twitter };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/** Lien interne, ancre, lien externe ou PDF selon la cible. */
function FooterLink({ href, children, className }) {
  const external = href.startsWith('http') || href.endsWith('.pdf');
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  }
  if (href.includes('#')) {
    return <a href={href} className={className}>{children}</a>;
  }
  return <Link to={href} className={className}>{children}</Link>;
}

export default function Footer4({
  brand,
  tagline,
  columns = [],
  socials = [],
  contact,
  legal = [],
  onNewsletterSubmit,
  className,
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    onNewsletterSubmit?.(email);
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section className={cn('w-full', className)}>
      <motion.div
        className="w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}>

        {/* Bande pleine largeur : les cartes touchent les bords, mais leur
            contenu reste aligné sur la largeur du header (1500 px). */}
        <div className="flex h-full flex-col md:flex-row">

          {/* Carte de marque */}
          <motion.div
            variants={itemVariants}
            className="relative flex min-h-[300px] w-full flex-col justify-between overflow-hidden py-10 md:min-h-[520px] md:w-1/3"
            style={{
              background: PRIMARY,
              paddingLeft: 'max(1.5rem, calc((100vw - 1500px) / 2))',
              paddingRight: '2rem',
            }}>

            {/* Grain très léger */}
            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.18] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <filter id="footerNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter="url(#footerNoise)" />
            </svg>

            <div className="relative z-10">
              <Link to="/" className="flex items-center gap-2.5 text-white">
                <span
                  className="flex size-9 items-center justify-center rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.14)' }}>
                  HT
                </span>
                <span className="text-xl font-bold tracking-tight">{brand}</span>
              </Link>
            </div>

            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-bold text-white">{tagline}</h3>

              {contact && (
                <ul className="space-y-2.5 text-sm" style={{ color: '#9cbdff' }}>
                  {contact.address && (
                    <li className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      <span>{contact.address}</span>
                    </li>
                  )}
                  {contact.phone && (
                    <li className="flex items-center gap-2.5">
                      <Phone className="size-4 shrink-0" />
                      <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-white">
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {contact.email && (
                    <li className="flex items-center gap-2.5">
                      <Mail className="size-4 shrink-0" />
                      <a href={`mailto:${contact.email}`} className="transition-colors hover:text-white">
                        {contact.email}
                      </a>
                    </li>
                  )}
                </ul>
              )}

              {socials.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socials.map(({ name, href, label }) => {
                    const Icon = SOCIAL_ICONS[name];
                    return (
                      <a
                        key={name}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-9 items-center justify-center rounded-full text-white transition-colors hover:text-white"
                        style={{ background: 'rgba(255,255,255,0.10)' }}>
                        {Icon && <Icon className="size-4" />}
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="space-y-1 text-xs text-white">
                {legal.map((line) => <p key={line}>{line}</p>)}
                <p>© {new Date().getFullYear()} {brand}. Tous droits réservés.</p>
              </div>
            </div>
          </motion.div>

          {/* Carte des liens */}
          <motion.div
            variants={itemVariants}
            className="flex min-h-[460px] w-full flex-col justify-between bg-white py-10 md:min-h-[520px] md:w-2/3 md:py-12"
            style={{
              paddingLeft: '2rem',
              paddingRight: 'max(1.5rem, calc((100vw - 1500px) / 2))',
            }}>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
              {columns.map((section) => (
                <div key={section.title} className="flex flex-col space-y-5">
                  <h4 className="text-base font-bold" style={{ color: '#243037' }}>{section.title}</h4>
                  <ul className="flex flex-col space-y-3 text-sm font-medium" style={{ color: '#5f6568' }}>
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <FooterLink href={link.href} className="transition-colors hover:text-[#000c5b]">
                          {link.label}
                        </FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 space-y-4 md:mt-10">
              <h4 className="text-base font-bold" style={{ color: '#243037' }}>Newsletter</h4>
              <p className="text-sm" style={{ color: '#5f6568' }}>
                Recevez nos conseils, offres de formation et événements directement dans votre boîte mail.
              </p>
              <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <label htmlFor="footer-newsletter" className="sr-only">Votre adresse e-mail</label>
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  className="flex-1 rounded-full border bg-transparent px-5 py-3 text-sm outline-none transition-colors focus:border-[#000c5b]"
                  style={{ borderColor: '#dbebff', color: '#243037' }} />
                <button
                  type="submit"
                  className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: PRIMARY }}>
                  {sent ? 'Merci !' : "S'abonner"}
                </button>
              </form>
              <p aria-live="polite" className="min-h-5 text-xs" style={{ color: '#002d74' }}>
                {sent ? 'Votre inscription a bien été prise en compte.' : ''}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
