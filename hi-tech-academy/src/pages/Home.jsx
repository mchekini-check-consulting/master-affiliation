import React from 'react';
import HeroSection from '@/components/hero/HeroSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutSection from '@/components/AboutSection';
import FormationsSection from '@/components/FormationsSection';
import WhyUsSection from '@/components/WhyUsSection';
import ResultsSection from '@/components/ResultsSection';
import TimelineSection from '@/components/TimelineSection';
import BlogSection from '@/components/BlogSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import ComplaintsSection from '@/components/ComplaintsSection';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'white' }}>
      <Header />
      <HeroSection />
      <AboutSection />
      <FormationsSection />
      <WhyUsSection />
      <ResultsSection />
      <TimelineSection />
      <BlogSection />
      <FAQSection />
      <ComplaintsSection />
      <CTASection />
      <Footer />
    </div>);

}
