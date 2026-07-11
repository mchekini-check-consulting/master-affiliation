import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
{ label: 'Programmes', href: '#programmes' },
{ label: 'À propos', href: '#about' },
{ label: 'Mentors', href: '#mentors' },
{ label: 'Contact', href: '#contact' }];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center px-4 sm:px-6 transition-all duration-300"
      style={{
        top: scrolled ? '10px' : '10px',
        paddingTop: scrolled ? '0' : '16px'
      }}>
      
      <header
        className="w-full max-w-7xl transition-all duration-300"
        style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: scrolled ?
          '0 4px 16px rgba(0,0,0,0.10)' :
          '0 1px 6px rgba(0,0,0,0.06)'
        }}>
        
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-white text-xs sm:text-sm"
              style={{ background: 'linear-gradient(135deg, #005064, #007a96)' }}>
              
              HT
            </div>
            <span className="font-bold text-gray-900 text-sm sm:text-base tracking-tight [font-family:'Plus_Jakarta_Sans',_sans-serif]">
              Hi Tech Academy
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors [font-family:'Plus_Jakarta_Sans',_sans-serif]">
              
                {link.label}
              </a>
            )}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            




            
            <a
              href="#programmes"
              className="h-9 px-5 text-sm font-bold text-black rounded-lg flex items-center transition-all duration-200 hover:opacity-90 hover:shadow-lg [font-family:'Plus_Jakarta_Sans',_sans-serif]"
              style={{ backgroundColor: '#F8B102' }}>
              
              Commencer
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu">
            
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen &&
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) =>
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors [font-family:'Plus_Jakarta_Sans',_sans-serif]">
            
                {link.label}
              </a>
          )}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <a
              href="#contact"
              className="text-sm font-semibold text-gray-700 text-center py-2 [font-family:'Plus_Jakarta_Sans',_sans-serif]">
              
                Se connecter
              </a>
              <a
              href="#programmes"
              className="h-10 px-5 text-sm font-bold text-black rounded-lg flex items-center justify-center [font-family:'Plus_Jakarta_Sans',_sans-serif]"
              style={{ backgroundColor: '#F8B102' }}>
              
                Commencer
              </a>
            </div>
          </div>
        }
      </header>
    </div>);

}