import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintsSection from '@/components/ComplaintsSection';

// Page dédiée au dépôt de réclamation (indicateur Qualiopi 31). Le formulaire
// vivait auparavant en bas de la home ; il est ici seul sur sa page, ce que le
// lien « Déposer une réclamation » du footer vise directement.
export default function Reclamations() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24">
        <ComplaintsSection />
      </main>
      <Footer />
    </div>
  );
}
