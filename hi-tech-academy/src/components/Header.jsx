import React, { useState, useEffect } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { NAVY, ACCENT, headingFont } from '@/components/design';

// Barre de navigation du thème « École » : toujours blanche (ombre douce au
// défilement). Liens sobres, pilule téléphone et pilule « S'inscrire » en
// vert forêt.
const navLinks = [
{ label: 'Formations', href: '/formations' },
{ label: 'Financements', href: '/financements' },
{ label: 'Blog', href: '/blog' },
{ label: 'À propos', href: '/#about' },
{ label: 'Contact', href: '/#contact' }];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        background: 'white',
        boxShadow: scrolled || menuOpen ? '0 4px 18px rgba(0,76,60,0.10)' : '0 1px 0 rgba(0,76,60,0.06)'
      }}>

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl font-bold text-white text-sm"
            style={{ background: NAVY, ...headingFont }}>
            HT
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: NAVY, ...headingFont }}>
            Hi Tech Academy
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((link) =>
          <a
            key={link.label}
            href={link.href}
            className="text-[14px] font-medium transition-opacity hover:opacity-70"
            style={{ color: '#1f2124', ...headingFont }}>
              {link.label}
            </a>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+33751474135"
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: NAVY, ...headingFont }}>
            <Phone className="w-3.5 h-3.5" />
            07 51 47 41 35
          </a>
          <a
            href="/formations"
            className="px-5 py-2.5 text-[13px] font-bold text-white rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: ACCENT, ...headingFont }}>
            S'inscrire
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: NAVY }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen &&
      <div className="lg:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-white">
          {navLinks.map((link) =>
        <a
          key={link.label}
          href={link.href}
          onClick={() => setMenuOpen(false)}
          className="text-sm font-semibold"
          style={{ color: '#1f2124', ...headingFont }}>
              {link.label}
            </a>
        )}
          <a
          href="/formations"
          onClick={() => setMenuOpen(false)}
          className="mt-2 py-3 text-sm font-bold text-white rounded-full flex items-center justify-center"
          style={{ backgroundColor: ACCENT, ...headingFont }}>
            S'inscrire
          </a>
          <a
          href="tel:+33751474135"
          className="py-3 text-sm font-bold text-white rounded-full flex items-center justify-center gap-2"
          style={{ backgroundColor: NAVY, ...headingFont }}>
            <Phone className="w-4 h-4" /> 07 51 47 41 35
          </a>
        </div>
      }
    </header>);
}
