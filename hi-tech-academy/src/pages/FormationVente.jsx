import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BadgeCheck, BookOpen, Check, Clock, FileText,
  Landmark, ShieldCheck, Sparkles, Star, Users, X,
} from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formations, getFormationById } from '@/data/formations';
import { getVenteById } from '@/data/ventes';
import PageNotFound from '@/lib/PageNotFound';
import {
  NAVY, TEAL, ACCENT, MINT, MINT_LIGHT,
  headingFont, serifFont, bodyFont,
} from '@/components/design';

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function KickerPill({ children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full mb-4"
      style={{ background: MINT, color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <span className="inline-block rounded-full" style={{ width: 5, height: 5, background: '#00d1a5' }} />
      {children}
    </span>
  );
}

// Page de vente d'une formation, gabarit « École » : héro en dégradé vert →
// bleu avec carte « L'essentiel de la formation », barre CTA collante en bas,
// programme en accordéons numérotés — contenu bénéfice + curiosité et
// conformité Qualiopi conservés à l'identique.
export default function FormationVente() {
  const { formationId } = useParams();
  const formation = getFormationById(formationId);
  const vente = getVenteById(formationId);

  useEffect(() => {
    if (formation) document.title = `${formation.title} — Hi-Tech Academy`;
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [formation]);

  if (!formation || !vente) return <PageNotFound />;

  const fact = (label) => formation.keyFacts.find((f) => f.label === label)?.value ?? '';
  const duree = fact('Durée').split(' — ')[0];
  const tarif = fact('Tarif').split(' / ')[0].split(' — ')[0];
  const prerequis = formation.id === 'kubernetes-fondamentaux'
    ? 'Linux et Docker (bases)'
    : formation.id === 'ia-for-tech'
      ? "Pratique d'un langage de programmation"
      : 'Aucun — ouverte à tous';

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: 76 }}>
      <Header />

      <main>
        {/* ---------- Héro dégradé vert → bleu ---------- */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(115deg, #8fedca 0%, #d8f8ea 30%, #ffffff 58%, #cce2ff 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-16 lg:pt-40 lg:pb-24 grid lg:grid-cols-2 gap-12 items-start">

            {/* Colonne gauche */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <p className="flex flex-wrap items-center gap-2 text-sm mb-5" style={{ color: '#1f2124', fontFamily: "'Roboto', sans-serif" }}>
                <span className="flex items-center gap-1 font-bold" style={headingFont}>
                  <Star className="w-4 h-4" style={{ color: TEAL, fill: TEAL }} />
                  Certifié Qualiopi
                </span>
                <span style={{ color: '#5a6478' }}>· {formation.tag} · sessions dès 1 participant</span>
              </p>

              <h1
                className="font-serif-display font-bold leading-[1.1] text-4xl sm:text-5xl mb-6"
                style={{ color: '#101418', ...serifFont }}>
                {formation.title}
              </h1>

              <p className="max-w-lg text-base leading-relaxed mb-8" style={{ color: '#2c3440', ...bodyFont }}>
                {vente.accroche}
              </p>

              <div className="flex flex-wrap gap-3 mb-9">
                <Link
                  to="/financements"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: ACCENT, ...headingFont }}>
                  Simuler mon financement <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={formation.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:shadow-md"
                  style={{ background: 'white', color: NAVY, border: `1.5px solid ${NAVY}`, ...headingFont }}>
                  <FileText className="w-4 h-4" /> Programme (PDF)
                </a>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-white" style={{ border: '1px solid #e5e5e5' }}>
                  <Clock className="w-4 h-4 mt-0.5" style={{ color: TEAL }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#1f2124', ...headingFont }}>Durée</p>
                    <p className="text-xs" style={{ color: '#4b5563', ...bodyFont }}>{duree}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-white" style={{ border: '1px solid #e5e5e5' }}>
                  <BookOpen className="w-4 h-4 mt-0.5" style={{ color: TEAL }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#1f2124', ...headingFont }}>Niveau</p>
                    <p className="text-xs" style={{ color: '#4b5563', ...bodyFont }}>{prerequis}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Carte « L'essentiel de la formation » */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="rounded-3xl bg-white p-6 sm:p-7" style={{ boxShadow: '0 24px 55px rgba(0,56,44,0.18)' }}>
                <p className="flex items-center gap-2 font-bold text-sm mb-4 pb-4" style={{ color: '#1f2124', borderBottom: '1px solid #ececec', ...headingFont }}>
                  <Sparkles className="w-4 h-4" style={{ color: TEAL }} />
                  L'essentiel de la formation
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { titre: 'Prérequis', texte: prerequis },
                    { titre: 'Financement', texte: 'Fonds propres · OPCO' },
                    { titre: 'Accompagnement', texte: 'Formateur expert en direct, suivi individualisé' },
                    { titre: 'Tarif', texte: `${tarif} — attestation de fin de formation` },
                  ].map(({ titre, texte }) => (
                    <div key={titre} className="rounded-xl px-4 py-3" style={{ background: '#fafafa', border: '1px solid #ececec' }}>
                      <p className="text-[12px] font-bold mb-0.5" style={{ color: '#1f2124', ...headingFont }}>{titre}</p>
                      <p className="text-[12px] leading-snug" style={{ color: '#4b5563', ...bodyFont }}>{texte}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
                  <a href={formation.pdf} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold underline" style={{ color: NAVY, ...headingFont }}>
                    Obtenir le programme →
                  </a>
                  <a href="/#contact" className="text-[13px] font-bold underline" style={{ color: NAVY, ...headingFont }}>
                    Je souhaite être guidé par un conseiller →
                  </a>
                </div>
                <Link
                  to={`/inscription/${formation.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: NAVY, ...headingFont }}>
                  Se former à nos côtés →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Promesse + objectifs ---------- */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <KickerPill>Pourquoi cette formation</KickerPill>
              <h2 className="font-serif-display font-bold text-3xl sm:text-4xl leading-[1.15] mb-5" style={{ color: '#101418', ...serifFont }}>
                Ce que vous allez y gagner
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: '#374151', ...bodyFont }}>
                {vente.promesse}
              </p>
            </div>
            <div className="rounded-3xl p-6 sm:p-8" style={{ background: MINT_LIGHT, border: '1px solid #bff4e8' }}>
              <h3 className="font-bold text-base mb-4" style={{ color: NAVY, ...headingFont }}>
                Les objectifs, concrètement :
              </h3>
              <ul className="space-y-3 mb-6">
                {vente.argumentsMarketing.map((texte) => (
                  <li key={texte} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: '#1f2124', ...bodyFont }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                    <span>{texte}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: '#1f2124', ...bodyFont }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                  <span>Sessions dès 1 participant, en direct — pas des vidéos préenregistrées.</span>
                </li>
              </ul>
              <Link
                to={`/inscription/${formation.id}`}
                className="w-full flex items-center justify-center py-3.5 rounded-full font-bold text-sm text-white"
                style={{ background: NAVY, ...headingFont }}>
                Se former à nos côtés →
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- Programme en accordéons numérotés ---------- */}
        <section className="py-14 sm:py-20" style={{ background: '#fafcfb', borderTop: '1px solid #eef1ef' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <KickerPill>Le programme</KickerPill>
            <h2 className="font-serif-display font-bold text-3xl sm:text-4xl leading-[1.15] mb-3" style={{ color: '#101418', ...serifFont }}>
              Le programme de la formation {formation.title}
            </h2>
            <p className="text-sm mb-2" style={{ color: '#374151', ...bodyFont }}>
              <strong style={headingFont}>{fact('Durée')}.</strong> {fact('Modalité')}.
            </p>
            <p className="text-sm mb-8" style={{ color: '#374151', ...bodyFont }}>
              <a href={formation.pdf} target="_blank" rel="noopener noreferrer" className="underline font-bold" style={{ color: NAVY }}>
                Téléchargez le programme officiel (PDF)
              </a>{' '}
              — il détaille les séquences, durées et modalités d'évaluation réglementaires.
            </p>

            <Accordion type="single" collapsible className="w-full space-y-3">
              {vente.clusters.map((cluster, i) => (
                <AccordionItem
                  key={cluster.titre}
                  value={cluster.titre}
                  className="rounded-2xl bg-white px-5"
                  style={{ border: '1px solid #e5e5e5' }}>
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0"
                        style={{ background: '#f2f2f2', color: '#1f2124', ...headingFont }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-[15px] uppercase tracking-wide" style={{ color: '#1f2124', ...headingFont }}>
                        {cluster.emoji} {cluster.titre}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2.5 pb-2 pl-11">
                      {cluster.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: '#374151', ...bodyFont }}>
                          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ---------- Financement ---------- */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <KickerPill>Financements</KickerPill>
            <h2 className="font-serif-display font-bold text-3xl sm:text-4xl leading-[1.15] mb-8" style={{ color: '#101418', ...serifFont }}>
              Une formation finançable — parfois à 100 %
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: BadgeCheck, titre: 'Certification Qualiopi', texte: "Hi-Tech Academy est certifié Qualiopi au titre des actions de formation : cette formation est éligible aux financements mutualisés." },
                { icon: Landmark, titre: 'OPCO et subrogation', texte: "Votre OPCO peut prendre en charge tout ou partie du tarif et régler directement l'organisme — sans avance de trésorerie." },
                { icon: Award, titre: 'Acquis évalués et attestés', texte: 'Test de positionnement, évaluations, attestation de fin de formation mentionnant vos résultats.' },
              ].map(({ icon: Icon, titre, texte }) => (
                <div key={titre} className="rounded-2xl p-6" style={{ background: MINT_LIGHT, border: '1px solid #bff4e8' }}>
                  <Icon className="w-6 h-6 mb-3" style={{ color: TEAL }} />
                  <h3 className="font-bold text-[15px] mb-2" style={{ color: NAVY, ...headingFont }}>{titre}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#374151', ...bodyFont }}>{texte}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/financements"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white"
                style={{ background: ACCENT, ...headingFont }}>
                Tout savoir sur les financements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- Cible ---------- */}
        <section className="py-14 sm:py-20" style={{ background: '#fafcfb', borderTop: '1px solid #eef1ef' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <KickerPill>La bonne formation, pour la bonne personne</KickerPill>
            <h2 className="font-serif-display font-bold text-3xl sm:text-4xl leading-[1.15] mb-8" style={{ color: '#101418', ...serifFont }}>
              Est-elle faite pour vous ?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 sm:p-7 bg-white" style={{ border: '1px solid #e5e5e5' }}>
                <h3 className="font-bold text-[15px] mb-4" style={{ color: TEAL, ...headingFont }}>✅ C'est fait pour vous si…</h3>
                <ul className="space-y-3">
                  {vente.cible.pour.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: '#374151', ...bodyFont }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-6 sm:p-7 bg-white" style={{ border: '1px solid #e5e5e5' }}>
                <h3 className="font-bold text-[15px] mb-4" style={{ color: '#b23b3b', ...headingFont }}>❌ Ce n'est pas pour vous si…</h3>
                <ul className="space-y-3.5">
                  {vente.cible.pasPour.map(({ texte, redirige }) => {
                    const autre = redirige ? formations.find((f) => f.id === redirige) : null;
                    return (
                      <li key={texte} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: '#374151', ...bodyFont }}>
                        <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#b23b3b' }} />
                        <span>
                          {texte}
                          {autre && (
                            <>
                              {' — '}
                              <Link to={`/formations/${autre.id}`} className="font-bold underline" style={{ color: NAVY }}>
                                découvrez plutôt « {autre.title} »
                              </Link>
                            </>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs mt-4" style={{ color: '#6b7280', ...bodyFont }}>
                  Un doute ? Le test de positionnement (non éliminatoire) et un échange avec le formateur
                  valident votre point de départ avant tout engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Informations réglementaires Qualiopi ---------- */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <KickerPill>Transparence Qualiopi</KickerPill>
            <h2 className="font-serif-display font-bold text-3xl sm:text-4xl leading-[1.15] mb-4" style={{ color: '#101418', ...serifFont }}>
              Les informations réglementaires complètes
            </h2>
            <p className="text-sm mb-6" style={{ color: '#4b5563', ...bodyFont }}>
              Action de formation concourant au développement des compétences (art. L.6313-1 du Code du travail).
              {' '}{formation.version} · Réponse sous 24 h ouvrées · Délai d'accès : 1 jour minimum.
            </p>
            <div className="rounded-2xl px-6 py-2" style={{ background: '#fafcfb', border: '1px solid #e5e5e5' }}>
              <Accordion type="single" collapsible className="w-full">
                {formation.qualiopiSections.map((s) => (
                  <AccordionItem key={s.id} value={s.id}>
                    <AccordionTrigger className="text-sm font-bold text-left" style={{ color: NAVY, ...headingFont }}>
                      {s.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm leading-relaxed" style={{ color: '#4b5563', ...bodyFont }}>{s.content}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: '#6b7280', ...bodyFont }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: TEAL }} />
              Suivi Qualiopi complet : analyse du besoin, positionnement, évaluations, satisfaction à chaud et à froid.
              <Users className="w-3.5 h-3.5 ml-2" style={{ color: TEAL }} />
              Accessible aux personnes en situation de handicap — référent handicap dédié.
            </p>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section style={{ background: 'linear-gradient(135deg, #dff7ec, #bff4e8)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center">
            <h2 className="font-serif-display font-bold text-2xl sm:text-3xl leading-[1.2] mb-3" style={{ color: NAVY, ...serifFont }}>
              {vente.ctaProjection}
            </h2>
            <p className="text-sm mb-7" style={{ color: '#2c5548', ...bodyFont }}>{vente.ctaUrgence}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={`/inscription/${formation.id}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white"
                style={{ background: ACCENT, ...headingFont }}>
                Demander mon inscription <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={formation.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm"
                style={{ background: 'white', color: NAVY, border: `1.5px solid ${NAVY}`, ...headingFont }}>
                <FileText className="w-4 h-4" /> Télécharger le programme
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Barre CTA collante en bas ---------- */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white"
        style={{ borderTop: '1px solid #e5e5e5', boxShadow: '0 -6px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#1f2124', ...headingFont }}>Envie de vous lancer ?</p>
            <p className="text-xs truncate hidden sm:block" style={{ color: '#6b7280', ...bodyFont }}>
              Échangez avec un conseiller pour construire votre projet, sans engagement.
            </p>
          </div>
          <Link
            to={`/inscription/${formation.id}`}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white"
            style={{ background: ACCENT, ...headingFont }}>
            Commencer la formation →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
