import React from 'react';
import HeroSection from '@/components/hero/HeroSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutSection from '@/components/AboutSection';
import FormationsSection from '@/components/FormationsSection';
import WhyUsSection from '@/components/WhyUsSection';
import ResultsSection from '@/components/ResultsSection';
import TimelineSection from '@/components/TimelineSection';
import FinancementSection from '@/components/FinancementSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogSection from '@/components/BlogSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: 'transparent' }}>
      {/* Le header rend d'abord le bandeau utilitaire, qui est dans le flux
          normal : il doit donc venir AVANT le héro, sinon le bandeau se
          retrouverait sous lui. La capsule, elle, est fixe et survole le héro. */}
      <Header embedded />
      <div className="relative">
        <HeroSection />
      </div>
      <AboutSection />
      <FormationsSection />
      <WhyUsSection />
      <ResultsSection />
      <TimelineSection />
      <FinancementSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>);

}
