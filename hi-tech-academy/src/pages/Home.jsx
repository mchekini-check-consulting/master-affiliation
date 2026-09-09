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
import { KEYWORD_GRADIENT } from '@/components/design';

export default function Home() {
  const heroData = {
    title:
    <>
        Des formations intensives{' '}
        <span
        style={{
          background: KEYWORD_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          animées en direct
        </span>
        <br />
        par des experts du terrain
      </>,

    subtitle: "Cloud, intelligence artificielle, facturation électronique : Hi Tech Academy fait monter en compétences dirigeants, salariés et développeurs — 100 % à distance, dès 1 participant, avec un suivi Qualiopi complet.",
    actions: [
    {
      text: "Explorer les formations",
      onClick: () => {
        window.location.href = '/formations';
      }
    },
    {
      text: "Financer ma formation",
      onClick: () => {
        window.location.href = '/financements';
      }
    }]
  };

  return (
    <div className="min-h-screen" style={{ background: 'white' }}>
      <Header />
      <HeroSection {...heroData} />
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
