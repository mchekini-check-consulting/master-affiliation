import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BadgeCheck, Check, FileText, Landmark,
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
import {
  INK, NAVY, TEAL, ACCENT, BODY, BODY_DARK, KEYWORD_GRADIENT,
  SectionHeading, Starfield, Pill, headingFont, bodyFont,
} from '@/components/design';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// Page de vente d'une formation, dans la grammaire « Onlineformapro » :
// héro sombre pleine largeur à titre géant centré, carte de faits clés en
// chevauchement, bandes alternées clair/sombre, pilules — le contenu suit le
// modèle « bénéfice + curiosité » (accroche, promesse, programme réécrit,
// cible, CTA) + certification Qualiopi et informations réglementaires.
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

      <main>
        {/* ---------- Héro sombre : l'accroche marketing, rien d'autre ---------- */}
        <section className="relative overflow-hidden" style={{ background: INK }}>
          <Starfield />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-44 pb-48 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-10">
                <span
                  className="text-[11px] font-extrabold uppercase tracking-[0.3em]"
                  style={{
                    background: KEYWORD_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    ...headingFont,
                  }}>
                  {formation.title}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT, ...headingFont }}>
                  <BadgeCheck className="w-4 h-4" /> Certifié Qualiopi
                </span>
              </div>

              <h1
                className="text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight leading-[1.14] text-white mb-12"
                style={headingFont}>
                {vente.accroche}
              </h1>

              <div className="flex flex-wrap justify-center gap-4">
                <Pill as={Link} to={`/inscription/${formation.id}`}>
                  Demander mon inscription <ArrowRight className="w-4 h-4" />
                </Pill>
                <Pill as="a" href={formation.pdf} target="_blank" rel="noopener noreferrer" variant="secondary" dark>
                  <FileText className="w-4 h-4" /> Programme officiel (PDF)
                </Pill>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Carte faits clés en chevauchement ---------- */}
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-20 pb-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="rounded-3xl overflow-hidden bg-white"
              style={{ border: '1px solid #e6eaf4', boxShadow: '0 24px 60px rgba(6,7,31,0.25)' }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: '#e6eaf4' }}>
                {formation.keyFacts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-5 bg-white">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,80,100,0.08)' }}>
                      <Icon className="w-4 h-4" style={{ color: TEAL }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em]" style={{ color: TEAL, ...headingFont }}>{label}</p>
                      <p className="text-xs leading-snug mt-0.5" style={{ color: NAVY, ...bodyFont }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Programme (bénéfice + curiosité) ---------- */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <SectionHeading kicker="Le programme" sub={vente.promesse}>
              Ce que vous allez apprendre — <span style={{ color: TEAL }}>et gagner</span>
            </SectionHeading>

            <div className="space-y-7">
              {vente.clusters.map((cluster) => (
                <motion.div
                  key={cluster.titre}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="rounded-3xl p-6 sm:p-8"
                  style={{ background: '#f7f9fd', border: '1px solid #e6eaf4' }}>
                  <h3 className="font-extrabold text-lg sm:text-xl mb-5" style={{ color: NAVY, ...headingFont }}>
                    <span className="mr-2">{cluster.emoji}</span>
                    {cluster.titre}
                  </h3>
                  <ul className="space-y-3.5">
                    {cluster.items.map((item) => {
                      itemNumber += 1;
                      return (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                            style={{ background: ACCENT, color: '#0b0b0b', ...headingFont }}>
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

            <p className="text-center text-sm mt-9" style={{ color: BODY, ...bodyFont }}>
              Le détail réglementaire complet (séquences, durées, modalités d'évaluation) figure dans le{' '}
              <a href={formation.pdf} target="_blank" rel="noopener noreferrer" className="underline font-bold" style={{ color: TEAL }}>
                programme officiel (PDF)
              </a>.
            </p>
          </div>
        </section>

        {/* ---------- Bande sombre : Qualiopi / financement ---------- */}
        <section className="relative overflow-hidden py-16 sm:py-20" style={{ background: INK }}>
          <Starfield />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              dark
              kicker="Qualité et financement"
              sub="Une formation certifiée, finançable et évaluée — pas une simple promesse marketing.">
              Certifié Qualiopi, <span style={{ background: KEYWORD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>finançable OPCO</span>
            </SectionHeading>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: BadgeCheck,
                  titre: 'Certification Qualiopi',
                  texte: 'Hi-Tech Academy est un organisme de formation certifié Qualiopi au titre des actions de formation — le gage d’un processus qualité audité.',
                },
                {
                  icon: Landmark,
                  titre: 'Finançable par votre OPCO',
                  texte: 'La certification Qualiopi rend cette formation éligible aux financements (OPCO, budget formation). Nous montons le dossier avec vous, avec zéro avance possible grâce à la subrogation.',
                },
                {
                  icon: Award,
                  titre: 'Acquis évalués et attestés',
                  texte: 'Test de positionnement, évaluations pendant la formation, évaluation finale : vous repartez avec une attestation qui mentionne vos résultats.',
                },
              ].map(({ icon: Icon, titre, texte }) => (
                <div key={titre} className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(248,177,2,0.15)' }}>
                    <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="font-extrabold text-base mb-2 text-white" style={headingFont}>{titre}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: BODY_DARK, ...bodyFont }}>{texte}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Pill as={Link} to="/financements" variant="secondary" dark>
                Tout savoir sur les financements <ArrowRight className="w-4 h-4" />
              </Pill>
            </div>
          </div>
        </section>

        {/* ---------- Pourquoi Hi-Tech Academy ---------- */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading kicker="Pourquoi nous">
              Une formation conçue pour que <span style={{ color: TEAL }}>vous réussissiez</span>
            </SectionHeading>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ...vente.argumentsMarketing.map((texte) => ({ icon: Sparkles, texte })),
                { icon: Users, texte: 'Sessions dès 1 participant : un accompagnement quasi individuel, en direct — pas des vidéos préenregistrées' },
                { icon: ShieldCheck, texte: 'Suivi Qualiopi complet : analyse du besoin, positionnement, évaluations, satisfaction à chaud et à froid' },
                { icon: BadgeCheck, texte: 'Accessible aux personnes en situation de handicap — référent handicap dédié' },
              ].map(({ icon: Icon, texte }) => (
                <div key={texte} className="flex items-start gap-3 rounded-2xl p-5" style={{ background: '#f7f9fd', border: '1px solid #e6eaf4' }}>
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: TEAL }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#33415e', ...bodyFont }}>{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Cible ---------- */}
        <section className="py-16 sm:py-24" style={{ background: '#f7f9fd' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading kicker="La bonne formation, pour la bonne personne">
              Est-elle faite <span style={{ color: TEAL }}>pour vous</span> ?
            </SectionHeading>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl p-6 sm:p-8 bg-white" style={{ border: '1px solid #e6eaf4' }}>
                <h3 className="font-extrabold text-base mb-5" style={{ color: TEAL, ...headingFont }}>
                  ✅ C'est fait pour vous si…
                </h3>
                <ul className="space-y-3.5">
                  {vente.cible.pour.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: TEAL }} />
                      <span className="text-sm leading-relaxed" style={{ color: '#33415e', ...bodyFont }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl p-6 sm:p-8 bg-white" style={{ border: '1px solid #e6eaf4' }}>
                <h3 className="font-extrabold text-base mb-5" style={{ color: '#a12626', ...headingFont }}>
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
                              <Link to={`/formations/${autre.id}`} className="font-bold underline" style={{ color: TEAL }}>
                                découvrez plutôt « {autre.title} »
                              </Link>
                            </>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs mt-5" style={{ color: BODY, ...bodyFont }}>
                  Un doute sur votre profil ? Le test de positionnement (non éliminatoire) et un échange avec
                  le formateur valident votre point de départ avant tout engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Informations réglementaires ---------- */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <SectionHeading kicker="Transparence Qualiopi">
              Les informations <span style={{ color: TEAL }}>réglementaires</span> complètes
            </SectionHeading>
            <div className="rounded-3xl p-6 sm:p-8" style={{ background: '#f7f9fd', border: '1px solid #e6eaf4' }}>
              <p className="text-sm mb-4" style={{ color: BODY, ...bodyFont }}>
                Action de formation concourant au développement des compétences (art. L.6313-1 du Code du travail).
                {' '}{formation.version} · Réponse sous 24 h ouvrées · Délai d'accès : 1 jour minimum.
              </p>
              <Accordion type="single" collapsible className="w-full">
                {formation.qualiopiSections.map((s) => (
                  <AccordionItem key={s.id} value={s.id}>
                    <AccordionTrigger className="text-sm font-bold text-left" style={{ color: NAVY, ...headingFont }}>
                      {s.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm leading-relaxed" style={{ color: BODY, ...bodyFont }}>{s.content}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ---------- CTA final : bande gradient pleine largeur ---------- */}
        <section style={{ background: 'linear-gradient(120deg, #06071f 0%, #005064 48%, #b7791f 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4" style={headingFont}>
              {vente.ctaProjection}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.8)', ...bodyFont }}>
              {vente.ctaUrgence}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Pill as={Link} to={`/inscription/${formation.id}`}>
                Demander mon inscription <ArrowRight className="w-4 h-4" />
              </Pill>
              <Pill as="a" href={formation.pdf} target="_blank" rel="noopener noreferrer" variant="secondary" dark>
                <FileText className="w-4 h-4" /> Télécharger le programme
              </Pill>
            </div>
            <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.55)', ...bodyFont }}>
              Organisme certifié Qualiopi · Finançable OPCO · Réponse sous 24 h ouvrées
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
