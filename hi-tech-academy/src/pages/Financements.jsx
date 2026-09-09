import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, Banknote, Building2, CheckCircle2, ExternalLink,
  FileSignature, HandCoins, Landmark, PiggyBank, ScrollText, Search, Users,
} from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  INK, NAVY, TEAL, ACCENT, BODY, BODY_DARK, KEYWORD_GRADIENT,
  SectionHeading, Starfield, Pill, headingFont, bodyFont,
} from '@/components/design';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// Les 11 opérateurs de compétences (OPCO) et leurs branches principales
const OPCOS = [
  { nom: 'Atlas', secteur: 'Services financiers, conseil, numérique, ingénierie' },
  { nom: 'AFDAS', secteur: 'Culture, médias, loisirs, sport' },
  { nom: "L'Opcommerce", secteur: 'Commerce et distribution' },
  { nom: 'Akto', secteur: 'Services à forte intensité de main-d’œuvre (hôtellerie, propreté, sécurité…)' },
  { nom: 'Ocapiat', secteur: 'Agriculture, agroalimentaire, pêche' },
  { nom: 'Constructys', secteur: 'BTP et construction' },
  { nom: 'Opco 2i', secteur: 'Industrie' },
  { nom: 'Opco Mobilités', secteur: 'Transports, logistique, automobile' },
  { nom: 'Opco Santé', secteur: 'Santé, médico-social' },
  { nom: 'Opco EP', secteur: 'Entreprises de proximité (artisanat, professions libérales…)' },
  { nom: 'Uniformation', secteur: 'Économie sociale, habitat social, protection sociale' },
];

const ETAPES = [
  {
    icon: Users,
    titre: '1. Un échange pour cadrer',
    texte: 'On identifie la formation adaptée, votre statut (salarié, dirigeant, indépendant) et le dispositif de financement mobilisable.',
  },
  {
    icon: ScrollText,
    titre: '2. Devis + programme officiels',
    texte: 'Nous vous fournissons le devis et le programme détaillé conformes aux exigences des financeurs — les pièces maîtresses de votre dossier.',
  },
  {
    icon: FileSignature,
    titre: '3. Le dossier de prise en charge',
    texte: "Vous déposez la demande sur l'espace en ligne de votre OPCO (ou de votre fonds d'assurance formation) — nous vous guidons à chaque champ.",
  },
  {
    icon: BadgeCheck,
    titre: '4. Vous vous formez',
    texte: "Accord reçu, la formation démarre. Avec la subrogation, l'OPCO peut régler l'organisme directement : zéro avance de trésorerie.",
  },
];

const FAQ = [
  {
    q: 'Ma formation peut-elle vraiment coûter 0 € ?',
    r: "Oui, dans de nombreux cas. Si votre enveloppe de financement couvre le tarif de la formation et que la subrogation de paiement est mise en place, votre reste à charge est nul et vous n'avancez aucun frais. La prise en charge dépend toutefois de votre OPCO, de votre branche et du budget disponible : nous étudions votre situation avant tout engagement.",
  },
  {
    q: "D'où vient l'argent qui finance ma formation ?",
    r: "De vos propres cotisations. Chaque entreprise verse tous les mois à l'URSSAF la CUFPA (Contribution Unique à la Formation Professionnelle et à l'Alternance). Ces sommes sont mutualisées puis redistribuées, notamment via les OPCO — le système est particulièrement avantageux pour les entreprises de moins de 50 salariés.",
  },
  {
    q: 'Comment savoir quel est mon OPCO ?',
    r: "Votre OPCO dépend de votre convention collective (l'IDCC figure sur les bulletins de salaire). L'outil officiel de France compétences vous le donne en quelques clics à partir de votre SIRET ou de votre convention — le lien est ci-dessus. En cas de doute, envoyez-nous votre SIRET et nous vérifions pour vous.",
  },
  {
    q: 'Je suis indépendant ou dirigeant non salarié : ai-je droit à un financement ?',
    r: "Oui. Les travailleurs non salariés cotisent à un fonds d'assurance formation : AGEFICE pour les dirigeants du commerce et des services, FIF PL pour les professions libérales, FAFCEA pour les artisans. Les plafonds annuels varient selon le fonds et le type de formation — nous vous aidons à constituer la demande.",
  },
  {
    q: "Pourquoi la certification Qualiopi est-elle indispensable ?",
    r: "Depuis 2022, seuls les organismes certifiés Qualiopi peuvent faire financer leurs formations par les fonds publics et mutualisés (OPCO, FAF…). Hi-Tech Academy est certifié Qualiopi au titre des actions de formation : nos formations sont donc éligibles à ces financements.",
  },
  {
    q: 'Combien de temps prend une demande de prise en charge ?',
    r: "Comptez généralement 2 à 4 semaines entre le dépôt du dossier complet et l'accord de l'OPCO — certains dossiers passent en quelques jours. Le délai d'accès à la formation reste d'1 jour minimum une fois le financement sécurisé (ou si vous financez en direct).",
  },
];

// Onglet « Financements » : expliquer pourquoi une formation peut ne rien
// coûter à l'entreprise (CUFPA, OPCO, subrogation) et accompagner la demande
// de prise en charge — contenu inspiré des pages financement de Matchers.
export default function Financements() {
  useEffect(() => {
    document.title = 'Financements — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <main>
        {/* ---------- Hero sombre ---------- */}
        <section className="relative overflow-hidden" style={{ background: INK }}>
          <Starfield />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-40 pb-20 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em] mb-6" style={{ color: ACCENT, ...headingFont }}>
                Financements
              </span>
              <h1
                className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight leading-[1.05] text-white mb-7"
                style={headingFont}>
                Votre formation peut vous coûter{' '}
                <span style={{ background: KEYWORD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  0 €
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-base leading-relaxed mb-9" style={{ color: BODY_DARK, ...bodyFont }}>
                Nos formations ne sont pas gratuites — mais vous cotisez déjà chaque mois pour la formation
                professionnelle. Grâce à la certification Qualiopi de Hi-Tech Academy, ces financements
                peuvent couvrir jusqu'à 100 % du tarif, sans avance de trésorerie. On vous explique tout,
                et on vous accompagne.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Pill as="a" href="/#contact">Étudier mon financement</Pill>
                <Pill as={Link} to="/formations" variant="secondary" dark>Voir les formations</Pill>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- D'où vient l'argent ---------- */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker="Le système, décodé"
              sub="En France, la formation professionnelle est financée par une cotisation obligatoire, mutualisée au bénéfice des entreprises — surtout celles de moins de 50 salariés. Quand votre formation est prise en charge, c'est la contrepartie de vos cotisations.">
              D'où vient <span style={{ color: TEAL }}>l'argent</span> ?
            </SectionHeading>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: PiggyBank,
                  titre: 'La CUFPA, votre cotisation',
                  texte: "Chaque mois, l'URSSAF collecte auprès de votre entreprise la Contribution Unique à la Formation Professionnelle et à l'Alternance. Ces sommes sont mutualisées : elles financent les formations des entreprises qui en font la demande.",
                },
                {
                  icon: Landmark,
                  titre: 'France compétences, le régulateur',
                  texte: "Depuis 2019, France compétences assure le financement, la régulation et le contrôle du système de formation professionnelle et d'apprentissage — et répartit les fonds entre les acteurs.",
                },
                {
                  icon: Building2,
                  titre: 'Les OPCO, vos financeurs',
                  texte: "Onze Opérateurs de Compétences agréés par l'État accompagnent les entreprises — en priorité les TPE/PME de moins de 50 salariés — et financent leurs actions de formation.",
                },
              ].map(({ icon: Icon, titre, texte }) => (
                <motion.div
                  key={titre}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="rounded-3xl p-7"
                  style={{ background: '#f7f9fd', border: '1px solid #e6eaf4' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(0,80,100,0.08)' }}>
                    <Icon className="w-6 h-6" style={{ color: TEAL }} />
                  </div>
                  <h3 className="font-extrabold text-lg mb-3" style={{ color: NAVY, ...headingFont }}>{titre}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: BODY, ...bodyFont }}>{texte}</p>
                </motion.div>
              ))}
            </div>

            <div
              className="mt-10 rounded-3xl p-7 sm:p-9 grid sm:grid-cols-2 gap-6 items-center"
              style={{ background: '#fff8e8', border: '1px solid #f3e3b3' }}>
              <div>
                <h3 className="font-extrabold text-xl mb-2" style={{ color: NAVY, ...headingFont }}>
                  Alors pourquoi tant d'entreprises passent à côté ?
                </h3>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#5a4a1a', ...bodyFont }}>
                    <span className="font-bold">❌</span> Elles ne connaissent pas l'existence de ces dispositifs.
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: '#5a4a1a', ...bodyFont }}>
                    <span className="font-bold">❌</span> Elles sont découragées par les démarches administratives.
                  </li>
                </ul>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#5a4a1a', ...bodyFont }}>
                <strong style={headingFont}>Notre réponse :</strong> nous fournissons devis et programme
                conformes aux attentes des financeurs, nous vous guidons champ par champ dans le dossier de
                prise en charge, et nous répondons directement à votre OPCO s'il a des questions sur la
                formation. Votre seule tâche : valider.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Zéro avance de frais ---------- */}
        <section className="py-16 sm:py-24" style={{ background: INK }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              dark
              kicker="Trésorerie intacte"
              sub="Avec la subrogation de paiement, l'OPCO règle directement Hi-Tech Academy : votre entreprise n'avance pas les frais pris en charge.">
              Zéro paperasse subie, <span style={{ background: KEYWORD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>zéro avance</span>
            </SectionHeading>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: HandCoins, titre: 'Subrogation de paiement', texte: "L'OPCO verse directement le financement à l'organisme de formation : aucune avance de trésorerie de votre côté." },
                { icon: Banknote, titre: "Jusqu'à 100 % pris en charge", texte: 'Selon votre branche et votre enveloppe, la prise en charge peut couvrir la totalité du tarif — reste à charge : 0 €.' },
                { icon: CheckCircle2, titre: 'Dossier balisé', texte: 'Devis, programme officiel, convention : nous fournissons chaque pièce au bon format, du premier échange à la facturation.' },
              ].map(({ icon: Icon, titre, texte }) => (
                <div key={titre} className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <Icon className="w-7 h-7 mb-4" style={{ color: ACCENT }} />
                  <h3 className="font-extrabold text-base mb-2 text-white" style={headingFont}>{titre}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: BODY_DARK, ...bodyFont }}>{texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Les étapes ---------- */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker="Concrètement"
              sub="De l'idée à la formation financée, le parcours tient en quatre étapes — et nous sommes à vos côtés à chacune.">
              Comment se passe une <span style={{ color: TEAL }}>prise en charge</span> ?
            </SectionHeading>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ETAPES.map(({ icon: Icon, titre, texte }, i) => (
                <motion.div
                  key={titre}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-3xl p-6"
                  style={{ background: '#f7f9fd', border: '1px solid #e6eaf4' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: ACCENT }}>
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY, ...headingFont }}>{titre}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: BODY, ...bodyFont }}>{texte}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Trouver son OPCO ---------- */}
        <section className="py-16 sm:py-24" style={{ background: '#f7f9fd' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker="L'annuaire des financeurs"
              sub="Chaque entreprise est rattachée à l'un des onze OPCO selon sa convention collective (l'IDCC figure sur vos bulletins de salaire). C'est lui qui instruit votre demande de prise en charge.">
              Quel est <span style={{ color: TEAL }}>votre OPCO</span> ?
            </SectionHeading>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {OPCOS.map(({ nom, secteur }) => (
                <div key={nom} className="flex items-start gap-3 rounded-2xl p-4 bg-white" style={{ border: '1px solid #e6eaf4' }}>
                  <Building2 className="w-4 h-4 mt-1 shrink-0" style={{ color: TEAL }} />
                  <div>
                    <p className="font-extrabold text-sm" style={{ color: NAVY, ...headingFont }}>{nom}</p>
                    <p className="text-xs leading-snug" style={{ color: BODY, ...bodyFont }}>{secteur}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl p-7 sm:p-9 text-center bg-white" style={{ border: '1px solid #e6eaf4' }}>
              <Search className="w-8 h-8 mx-auto mb-4" style={{ color: TEAL }} />
              <h3 className="font-extrabold text-xl mb-2" style={{ color: NAVY, ...headingFont }}>
                Trouvez votre OPCO en moins d'une minute
              </h3>
              <p className="max-w-xl mx-auto text-sm mb-6" style={{ color: BODY, ...bodyFont }}>
                L'outil officiel de France compétences identifie votre opérateur de compétences à partir de
                votre SIRET ou de votre convention collective. Vous préférez qu'on s'en charge ?
                Envoyez-nous simplement votre SIRET.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Pill as="a" href="https://quel-est-mon-opco.francecompetences.fr/" target="_blank" rel="noopener noreferrer">
                  Trouver mon OPCO <ExternalLink className="w-4 h-4" />
                </Pill>
                <Pill as="a" href="/#contact" variant="secondary">Nous envoyer mon SIRET</Pill>
              </div>
            </div>

            {/* Indépendants */}
            <div className="mt-10 rounded-3xl p-7 sm:p-9 bg-white" style={{ border: '1px solid #e6eaf4' }}>
              <h3 className="font-extrabold text-xl mb-3" style={{ color: NAVY, ...headingFont }}>
                Indépendant, dirigeant non salarié ? Vous avez aussi vos droits.
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: BODY, ...bodyFont }}>
                Les travailleurs non salariés cotisent à un fonds d'assurance formation (FAF) qui peut
                financer tout ou partie de leur formation, selon des plafonds annuels :
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { nom: 'AGEFICE', qui: 'Dirigeants non salariés du commerce, de l’industrie et des services' },
                  { nom: 'FIF PL', qui: 'Professions libérales (hors médecins)' },
                  { nom: 'FAFCEA', qui: 'Chefs d’entreprise artisanale' },
                ].map(({ nom, qui }) => (
                  <div key={nom} className="rounded-2xl p-4" style={{ background: '#f7f9fd', border: '1px solid #e6eaf4' }}>
                    <p className="font-extrabold text-sm mb-1" style={{ color: TEAL, ...headingFont }}>{nom}</p>
                    <p className="text-xs leading-snug" style={{ color: BODY, ...bodyFont }}>{qui}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeading kicker="Vos questions">
              Financement : les <span style={{ color: TEAL }}>réponses claires</span>
            </SectionHeading>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map(({ q, r }) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-sm font-bold text-left" style={{ color: NAVY, ...headingFont }}>
                    {q}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed" style={{ color: BODY, ...bodyFont }}>{r}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section style={{ background: 'linear-gradient(120deg, #06071f 0%, #005064 48%, #b7791f 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4" style={headingFont}>
              Et si votre prochaine formation ne vous coûtait rien ?
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.8)', ...bodyFont }}>
              Un échange de 15 minutes suffit pour estimer votre prise en charge. Sans engagement.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Pill as="a" href="/#contact">Étudier mon financement <ArrowRight className="w-4 h-4" /></Pill>
              <Pill as={Link} to="/formations" variant="secondary" dark>Choisir ma formation</Pill>
            </div>
            <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.55)', ...bodyFont }}>
              Organisme certifié Qualiopi — actions de formation · Déclaration d'activité n° 11756755575
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
