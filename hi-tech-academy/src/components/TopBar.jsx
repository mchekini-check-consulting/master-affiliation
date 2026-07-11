import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
        {/* Left — contact info */}
        <div className="hidden md:flex items-center gap-6">
          <a href="tel:+213000000000" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">
            <Phone className="w-3 h-3" />
            +213 00 000 00 00
          </a>
          <a href="mailto:contact@hitechacademy.dz" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">
            <Mail className="w-3 h-3" />
            contact@hitechacademy.dz
          </a>
        </div>

        {/* Right — quick links */}
        <div className="flex items-center gap-5 ml-auto">
          <a href="#about" className="text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">À propos</a>
          <a href="#programmes" className="text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">Blog</a>
          <a href="#contact" className="text-xs text-gray-500 hover:text-gray-800 transition-colors [font-family:'Inter',sans-serif]">Contact</a>
          
          
        </div>
      </div>
    </div>);

}