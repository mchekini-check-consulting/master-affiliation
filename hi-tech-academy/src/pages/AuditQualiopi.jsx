import React, { useEffect } from 'react';
import { Award } from 'lucide-react';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import AuditQualiopiContent from '@/components/AuditQualiopiContent';
import { AUDIT_STATS } from '@/data/auditQualiopi';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Page publique du dossier d'audit Qualiopi : critères, indicateurs et
// documents de preuve, consultables par tous (auditeur, financeurs, publics).
export default function AuditQualiopi() {
  useEffect(() => {
    document.title = 'Audit Qualiopi — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />

      {/* Bandeau d'introduction */}
      <section
        className="pt-32 pb-12"
        style={{ background: 'linear-gradient(135deg, #001a4a 0%, #005064 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-5"
            style={{ background: 'rgba(248,177,2,0.15)', color: '#F8B102', ...headingFont }}>
            <Award className="w-4 h-4" />
            Référentiel National Qualité
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'white', ...headingFont }}>
            Audit Qualiopi
          </h1>
          <p className="text-sm mt-4 max-w-3xl mx-auto leading-relaxed" style={{ color: '#c0d4d8', ...bodyFont }}>
            HI-TECH ACADEMY — Déclaration d'activité n° 11756755575 (préfet de région d'Île-de-France).
            Dossier de preuves organisé selon les 7 critères du Référentiel National Qualité.
            Périmètre de certification : <strong style={{ color: 'white' }}>Actions de formation</strong> (art.
            L.6313-1 du Code du travail) — les indicateurs propres aux autres catégories de prestations
            sont affichés grisés.
          </p>

          {/* Chiffres clés */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8">
            {[
              ['7', 'critères'],
              [`${AUDIT_STATS.applicable}/${AUDIT_STATS.indicators}`, 'indicateurs applicables'],
              [`${AUDIT_STATS.documents}`, 'documents de preuve'],
            ].map(([value, label]) => (
              <div key={label} className="text-center px-4">
                <p className="text-3xl font-bold" style={{ color: '#F8B102', ...headingFont }}>{value}</p>
                <p className="text-xs uppercase tracking-wide mt-1" style={{ color: '#c0d4d8', ...bodyFont }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Critères, indicateurs et preuves */}
      <main className="py-12 sm:py-16" style={{ background: '#f7f9fd' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <AuditQualiopiContent />
        </div>
      </main>

      <Footer />
    </div>
  );
}
