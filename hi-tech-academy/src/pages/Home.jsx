import React from 'react';
import { GraduationCap, Code, Users } from 'lucide-react';
import HeroSection from '@/components/hero/HeroSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarqueeStrip from '@/components/MarqueeStrip';
import AboutSection from '@/components/AboutSection';
import FormationsSection from '@/components/FormationsSection';
import WhyUsSection from '@/components/WhyUsSection';
import TimelineSection from '@/components/TimelineSection';
import BlogSection from '@/components/BlogSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';

const HERO_IMAGES = [
"/images/cbdcfde73_generated_f57bba76.png",
"/images/3611d0da4_generated_60e6197e.png",
"/images/ce6db5335_generated_76fdd024.png"];


export default function Home() {
  const heroData = {
    title:
    <>
        Transformez Votre Avenir avec Nos <span className="text-[#f8b102]">Programmes de Formation</span>
      </>,

    subtitle: "Hi Tech Academy forme la prochaine génération d'ingénieurs logiciels, de data scientists et de leaders technologiques à travers des programmes intensifs et un mentorat d'élite.",
    actions: [
    {
      text: "Explorer les formations",
      onClick: () => {
        window.location.href = '#programmes';
      }
    },
    {
      text: "À propos de nous",
      onClick: () => {
        window.location.href = '#about';
      }
    }],

    stats: [
    { value: "2K+", label: "Étudiants Formés", icon: <GraduationCap className="h-4 w-4" /> },
    { value: "95%", label: "Taux d'Insertion", icon: <Code className="h-4 w-4" /> },
    { value: "50+", label: "Mentors Experts", icon: <Users className="h-4 w-4" /> }],

    images: HERO_IMAGES
  };

  return (
    <div className="min-h-screen" style={{ background: 'white' }}>
<Header />
      <HeroSection {...heroData} />
      <AboutSection />
      <FormationsSection />
      <WhyUsSection />
      <TimelineSection />
      <BlogSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>);

}