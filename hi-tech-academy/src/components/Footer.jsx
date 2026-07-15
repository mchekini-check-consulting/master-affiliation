import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import MarqueeStrip from '@/components/MarqueeStrip';

const BRAND_COLOR = '#005064';
const CTA_COLOR = '#F8B102';

const formations = [
  'Kubernetes – Fondamentaux et introduction au GitOps',
];

const liens = [
  { label: 'Accueil', href: '#' },
  { label: 'À propos', href: '#about' },
  { label: 'Nos formations', href: '#programmes' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
  { label: 'Conditions générales de vente', href: '/conditions-vente' },
];

const socials = [
  { icon: Facebook,  href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin,  href: '#', label: 'LinkedIn' },
  { icon: Youtube,   href: '#', label: 'YouTube' },
  { icon: Twitter,   href: '#', label: 'Twitter / X' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <footer
      style={{
        background: '#002f3a',
        fontFamily: "'Inter', sans-serif",
        backgroundImage: `url('/images/bfbbe912e_footer-bg-05.png')`,
        backgroundSize: '400px 400px',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
        opacity: 0.95,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3), 0 -2px 10px rgba(0,0,0,0.15)'
      }}
    >
      {/* ── Marquee ── */}
      <MarqueeStrip />

      {/* ── Main Footer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-12">
        
        {/* Newsletter Section - Integrated */}
        <div className="mb-10 sm:mb-12 pb-10 sm:pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3
                className="text-lg sm:text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Restez informé de nos actualités
              </h3>
              <p className="text-white/70 text-xs sm:text-sm">
                Recevez nos conseils, offres de formation et événements directement dans votre boîte mail.
              </p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full max-w-lg gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-white/50 transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <button
                type="submit"
                className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm text-black flex items-center gap-2 shrink-0 transition-all hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: CTA_COLOR, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {sent ? 'Envoyé ✓' : <><Send className="w-4 h-4" /> S'abonner</>}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* 1 — À propos */}
          <div>
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 mb-4 sm:mb-5">
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-bold text-white text-xs sm:text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #005064, #007a96)' }}
              >
                HT
              </div>
              <span
                className="font-bold text-white text-sm sm:text-base tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Hi Tech Academy
              </span>
            </a>
            <p className="text-white/55 text-xs sm:text-sm leading-relaxed mb-6">
              Nous formons la prochaine génération d'ingénieurs logiciels, de data scientists et de leaders technologiques à travers des programmes intensifs et un mentorat d'élite.
            </p>

          </div>

          {/* 2 — Nos formations */}
          <div>
            <h4
              className="text-white font-semibold text-xs sm:text-sm uppercase tracking-widest mb-5 sm:mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Nos formations
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {formations.map(f => (
                <li key={f}>
                  <a
                    href="#programmes"
                    className="text-white/55 text-xs sm:text-sm hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                      style={{ background: 'rgba(248,177,2,0.4)' }}
                    />
                    {f}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 — Liens utiles */}
          <div>
            <h4
              className="text-white font-semibold text-xs sm:text-sm uppercase tracking-widest mb-5 sm:mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Liens utiles
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {liens.map(l => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/55 text-xs sm:text-sm hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: 'rgba(248,177,2,0.4)' }}
                    />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4 — Nous contacter */}
          <div>
            <h4
              className="text-white font-semibold text-xs sm:text-sm uppercase tracking-widest mb-5 sm:mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Nous contacter
            </h4>
            <ul className="space-y-4 sm:space-y-5">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"                 style={{ background: 'rgba(0,80,100,0.5)' }}>
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </div>
                <div>
                  <p className="text-white/80 text-xs sm:text-sm font-medium">Adresse</p>
                  <p className="text-white/45 text-xs mt-0.5 leading-relaxed">73 Rue de Reuilly, 75012 Paris</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"                 style={{ background: 'rgba(0,80,100,0.5)' }}>
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </div>
                <div>
                  <p className="text-white/80 text-xs sm:text-sm font-medium">Téléphone</p>
                  <a href="tel:+33751474135" className="text-white/45 text-xs mt-0.5 hover:text-white transition-colors">07 51 47 41 35</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"                 style={{ background: 'rgba(0,80,100,0.5)' }}>
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </div>
                <div>
                  <p className="text-white/80 text-xs sm:text-sm font-medium">Email</p>
                  <a href="mailto:contact@hi-techacademy.fr" className="text-white/45 text-xs mt-0.5 hover:text-white transition-colors">contact@hi-techacademy.fr</a>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ background: 'white', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-gray-600 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
              © {new Date().getFullYear()} Hi-Tech Academy. Tous droits réservés. — SIRET 922 695 648 00027
            </p>
            <p className="text-gray-500 text-[11px] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              Déclaration d'activité enregistrée sous le n° 11756755575 auprès du préfet de la région Île-de-France.
              Cet enregistrement ne vaut pas agrément de l'État.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-black transition-all duration-200"
                style={{ background: '#f0f0f0', border: '1px solid #e0e0e0' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#005064'; e.currentTarget.style.borderColor = BRAND_COLOR; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#6b7280'; }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}