import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
        {/* Left — contact info */}
        <div className="hidden md:flex items-center gap-6">
          <a href="tel:+33751474135" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">
            <Phone className="w-3 h-3" />
            07 51 47 41 35
          </a>
          <a href="mailto:contact@hi-techacademy.fr" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">
            <Mail className="w-3 h-3" />
            contact@hi-techacademy.fr
          </a>
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 [font-family:'Inter',sans-serif]">
            <MapPin className="w-3 h-3" />
            73 Rue de Reuilly, 75012 Paris
          </span>
        </div>

        {/* Right — quick links */}
        <div className="flex items-center gap-5 ml-auto">
          <a href="#about" className="text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">À propos</a>
          <a href="/blog" className="text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">Blog</a>
          <a href="#contact" className="text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">Contact</a>
          
          
        </div>
      </div>
    </div>);

}