import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ACCENT, headingFont } from '@/components/design';

// Barre de navigation pleine largeur (grammaire Onlineformapro) : fond blanc
// collé en haut, liens compacts en majuscules, CTA en pilule ambre.
const navLinks = [
{ label: 'Formations', href: '/formations' },
{ label: 'Financements', href: '/financements' },
{ label: 'Programmes', href: '/#programmes' },
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
        boxShadow: scrolled ? '0 4px 18px rgba(6,7,31,0.12)' : '0 1px 0 rgba(6,7,31,0.06)'
      }}>

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #005064, #007a96)', ...headingFont }}>
            HT
          </div>
          <span className="font-extrabold text-gray-900 text-base tracking-tight" style={headingFont}>
            Hi Tech Academy
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) =>
          <a
            key={link.label}
            href={link.href}
            className="text-[12px] font-extrabold uppercase tracking-wider text-gray-800 hover:text-black transition-colors"
            style={headingFont}>
              {link.label}
            </a>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center">
          <a
            href="/formations"
            className="px-6 py-2.5 text-[12px] font-extrabold uppercase tracking-wider text-black rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: ACCENT, ...headingFont }}>
            S'inscrire
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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
          className="text-sm font-bold uppercase tracking-wider text-gray-800"
          style={headingFont}>
              {link.label}
            </a>
        )}
          <a
          href="/formations"
          onClick={() => setMenuOpen(false)}
          className="mt-2 py-3 text-sm font-extrabold uppercase tracking-wider text-black rounded-full flex items-center justify-center"
          style={{ backgroundColor: ACCENT, ...headingFont }}>
            S'inscrire
          </a>
        </div>
      }
    </header>);
}
