import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BadgeCheck, Check, ChevronLeft, FileText, Landmark,
  ShieldCheck, Sparkles, Users, X,
} from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formations, getFormationById } from '@/data/formations';
import { getVenteById } from '@/data/ventes';
import PageNotFound from '@/lib/PageNotFound';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function SectionTitle({ kicker, children }) {
  return (
    <div className="text-center mb-10">
      {kicker && (
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: '#002d74', ...headingFont }}>
          {kicker}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: '#001a4a', ...headingFont }}>
        {children}
      </h2>
    </div>
  );
}

// Page de vente d'une formation (modèle « bénéfice + curiosité ») :
// accroche, promesse, programme réécrit, cible, CTA — plus la certification
// Qualiopi et les informations réglementaires officielles.
export default function FormationVente() {
  const { formationId } = useParams();
  const formation = getFormationById(formationId);
  const vente = getVenteById(formationId);

  useEffect(() => {
    if (formation) document.title = `${formation.title} — Hi-Tech Academy`;
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [formation]);

  if (!formation || !vente) return <PageNotFound />;

  // Numérotation continue des éléments du programme sur toute la page
  let itemNumber = 0;

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <main className="pt-32 pb-0">

        {/* ---------- Hero : accroche + promesse + CTA ---------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <Link
            to="/formations"
            className="inline-flex items-center gap-1 text-sm font-semibold mb-6"
            style={{ color: '#6b7a9b', ...headingFont }}>
            <ChevronLeft className="w-4 h-4" /> Toutes les formations
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                  {formation.tag}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#005064', ...headingFont }}>
                  <BadgeCheck className="w-4 h-4" /> Certifié Qualiopi
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold tracking-tight leading-[1.08] mb-5" style={{ color: '#001a4a', ...headingFont }}>
                {vente.accroche}
              </h1>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#4a5b7a', ...bodyFont }}>
                {vente.promesse}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/inscription/${formation.id}`}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: '#F8B102', ...headingFont }}>
                  Demander mon inscription
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={formation.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-sm"
                  style={{ background: 'white', color: '#005064', border: '1.5px solid #005064', ...headingFont }}>
                  <FileText className="w-4 h-4" />
                  Programme officiel (PDF)
                </a>
              </div>
              <p className="text-xs mt-4" style={{ color: '#6b7a9b', ...bodyFont }}>
                Réponse sous 24 h ouvrées · Délai d'accès : 1 jour minimum · {formation.version}
              </p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid #e0e8f4', boxShadow: '0 8px 24px rgba(0,80,100,0.10)' }}>
                <img src={formation.image} alt={formation.title} className="w-full object-cover" style={{ height: 260 }} />
                <div className="grid grid-cols-2 gap-px" style={{ background: '#e0e8f4' }}>
                  {formation.keyFacts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2.5 p-4 bg-white">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#005064' }} />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#005064', ...headingFont }}>{label}</p>
                        <p className="text-xs leading-snug" style={{ color: '#0f2e2f', ...bodyFont }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Bandeau Qualiopi / financement ---------- */}
        <section style={{ background: '#001a4a' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: BadgeCheck,
                titre: 'Certification Qualiopi',
                texte: 'Hi-Tech Academy est un organisme de formation certifié Qualiopi au titre des actions de formation — le gage d’un processus qualité audité.',
              },
              {
                icon: Landmark,
                titre: 'Finançable par votre OPCO',
                texte: 'La certification Qualiopi rend cette formation éligible aux financements (OPCO, budget formation de votre entreprise). Nous vous aidons à monter le dossier.',
              },
              {
                icon: Award,
                titre: 'Acquis évalués et attestés',
                texte: 'Test de positionnement, évaluations pendant la formation, évaluation finale : vous repartez avec une attestation qui mentionne vos résultats.',
              },
            ].map(({ icon: Icon, titre, texte }) => (
              <div key={titre} className="flex gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(248,177,2,0.15)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#F8B102' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1 text-white" style={headingFont}>{titre}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#c9d6ee', ...bodyFont }}>{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Programme (bénéfice + curiosité) ---------- */}
        <section className="py-16 sm:py-20" style={{ background: '#f7f9fd' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <SectionTitle kicker="Le programme">Ce que vous allez apprendre — et gagner</SectionTitle>

            <div className="space-y-8">
              {vente.clusters.map((cluster) => (
                <motion.div
                  key={cluster.titre}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="rounded-3xl p-6 sm:p-8 bg-white"
                  style={{ border: '1px solid #e0e8f4' }}>
                  <h3 className="font-bold text-lg mb-5" style={{ color: '#001a4a', ...headingFont }}>
                    <span className="mr-2">{cluster.emoji}</span>
                    {cluster.titre}
                  </h3>
                  <ul className="space-y-3.5">
                    {cluster.items.map((item) => {
                      itemNumber += 1;
                      return (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                            style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
                            {itemNumber}
                          </span>
                          <span className="text-sm leading-relaxed" style={{ color: '#33415e', ...bodyFont }}>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm mt-8" style={{ color: '#6b7a9b', ...bodyFont }}>
              Le détail réglementaire complet (séquences, durées, modalités d'évaluation) figure dans le{' '}
              <a href={formation.pdf} target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#005064' }}>
                programme officiel (PDF)
              </a>.
            </p>
          </div>
        </section>

        {/* ---------- Pourquoi Hi-Tech Academy (arguments marketing) ---------- */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionTitle kicker="Pourquoi nous">Une formation conçue pour que vous réussissiez</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ...vente.argumentsMarketing.map((texte) => ({ icon: Sparkles, texte })),
                { icon: Users, texte: 'Sessions dès 1 participant : un accompagnement quasi individuel, en direct — pas des vidéos préenregistrées' },
                { icon: ShieldCheck, texte: 'Suivi Qualiopi complet : analyse du besoin, positionnement, évaluations, satisfaction à chaud et à froid' },
                { icon: BadgeCheck, texte: 'Accessible aux personnes en situation de handicap — référent handicap dédié' },
              ].map(({ icon: Icon, texte }) => (
                <div key={texte} className="flex items-start gap-3 rounded-2xl p-5" style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#005064' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#33415e', ...bodyFont }}>{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Cible ---------- */}
        <section className="py-16 sm:py-20" style={{ background: '#f7f9fd' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionTitle kicker="La bonne formation, pour la bonne personne">Est-elle faite pour vous ?</SectionTitle>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl p-6 sm:p-8 bg-white" style={{ border: '1px solid #e0e8f4' }}>
                <h3 className="font-bold text-base mb-5" style={{ color: '#005064', ...headingFont }}>
                  ✅ C'est fait pour vous si…
                </h3>
                <ul className="space-y-3.5">
                  {vente.cible.pour.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#005064' }} />
                      <span className="text-sm leading-relaxed" style={{ color: '#33415e', ...bodyFont }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl p-6 sm:p-8 bg-white" style={{ border: '1px solid #e0e8f4' }}>
                <h3 className="font-bold text-base mb-5" style={{ color: '#a12626', ...headingFont }}>
                  ❌ Ce n'est PAS pour vous si…
                </h3>
                <ul className="space-y-4">
                  {vente.cible.pasPour.map(({ texte, redirige }) => {
                    const autre = redirige ? formations.find((f) => f.id === redirige) : null;
                    return (
                      <li key={texte} className="flex items-start gap-3">
                        <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#a12626' }} />
                        <span className="text-sm leading-relaxed" style={{ color: '#33415e', ...bodyFont }}>
                          {texte}
                          {autre && (
                            <>
                              {' — '}
                              <Link to={`/formations/${autre.id}`} className="font-semibold underline" style={{ color: '#005064' }}>
                                découvrez plutôt « {autre.title} »
                              </Link>
                            </>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs mt-5" style={{ color: '#6b7a9b', ...bodyFont }}>
                  Un doute sur votre profil ? Le test de positionnement (non éliminatoire) et un échange avec
                  le formateur valident votre point de départ avant tout engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Informations réglementaires ---------- */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <SectionTitle kicker="Transparence Qualiopi">Les informations réglementaires complètes</SectionTitle>
            <div className="rounded-3xl p-6 sm:p-8" style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
              <p className="text-sm mb-4" style={{ color: '#6b7a9b', ...bodyFont }}>
                Action de formation concourant au développement des compétences (art. L.6313-1 du Code du travail).
              </p>
              <Accordion type="single" collapsible className="w-full">
                {formation.qualiopiSections.map((s) => (
                  <AccordionItem key={s.id} value={s.id}>
                    <AccordionTrigger className="text-sm font-semibold text-left" style={{ color: '#002d74', ...headingFont }}>
                      {s.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm leading-relaxed" style={{ color: '#6b7a9b', ...bodyFont }}>{s.content}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section style={{ background: '#001a4a' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={headingFont}>
              {vente.ctaProjection}
            </h2>
            <p className="text-sm mb-8" style={{ color: '#c9d6ee', ...bodyFont }}>
              {vente.ctaUrgence}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/inscription/${formation.id}`}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90"
                style={{ background: '#F8B102', ...headingFont }}>
                Demander mon inscription
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={formation.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white"
                style={{ border: '1.5px solid rgba(255,255,255,0.4)', ...headingFont }}>
                <FileText className="w-4 h-4" />
                Télécharger le programme
              </a>
            </div>
            <p className="text-xs mt-6" style={{ color: '#8aa0c8', ...bodyFont }}>
              Organisme certifié Qualiopi · Finançable OPCO · Réponse sous 24 h ouvrées
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
