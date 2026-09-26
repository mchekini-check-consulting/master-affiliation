import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Certificate, FileText, Wheelchair, ChatCircleText, Target, Wrench, SealCheck,
} from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ResultsSection from '@/components/ResultsSection';
import TimelineSection from '@/components/TimelineSection';
import CTASection from '@/components/CTASection';
import { Bande, SectionTitle, RADIUS } from '@/components/vente/atomes';
import { formations } from '@/data/formations';
import { NAVY, LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// Page « À propos ». QUALIOPI : tout ce qui est affiché ici doit être
// justifiable. Aucune date de création, aucun effectif, aucun portrait ni
// chiffre qui ne soit déjà sourcé ailleurs sur le site :
//   · identité légale → Mentions légales ;
//   · méthode → TimelineSection, résultats → ResultsSection (réutilisées
//     telles quelles, pour qu'une mise à jour vaille partout) ;
//   · domaines → comptés dans le catalogue (data/formations).

// La signature de marque, reprise de l'ancien logo : trois noms, trois preuves.
const PILIERS = [
  {
    icon: Target,
    titre: 'Exigence',
    texte: "Des prérequis vérifiés par un test de positionnement, un programme tenu de bout en bout et un effectif restreint, pour que le formateur s'adapte réellement à votre niveau.",
  },
  {
    icon: Wrench,
    titre: 'Terrain',
    texte: "Chaque participant travaille sur son propre environnement, face aux situations qui posent problème en production. Des compétences recherchées par les entreprises, pas des notions qui datent déjà.",
  },
  {
    icon: SealCheck,
    titre: 'Résultat',
    texte: "Une évaluation finale des acquis (QCM et mise en pratique), puis une attestation de fin de formation qui détaille vos résultats. On juge sur pièces.",
  },
];

const ENGAGEMENTS = [
  {
    icon: Certificate,
    titre: 'Certification Qualiopi',
    texte: "La certification qualité a été délivrée au titre de la catégorie d'action suivante : actions de formation. Nos formations sont donc éligibles aux financements OPCO.",
    lien: { label: 'Financer sa formation', to: '/financements' },
  },
  {
    icon: Wheelchair,
    titre: 'Accessibilité',
    texte: "Une situation de handicap ? Signalez-la dès votre demande : nous étudions avec vous les adaptations possibles du parcours.",
    lien: { label: "Politique d'accessibilité", href: '/documents/qualiopi/Accessibilite_handicap_V1.0.pdf' },
  },
  {
    icon: ChatCircleText,
    titre: 'Écoute et réclamations',
    texte: "Questionnaire de satisfaction en fin de session, point à froid ensuite, et une procédure de réclamation ouverte à tous.",
    lien: { label: 'Déposer une réclamation', to: '/reclamations' },
  },
  {
    icon: FileText,
    titre: 'Documents publics',
    texte: "Livret d'accueil et règlement intérieur sont consultables avant toute inscription.",
    lien: { label: "Livret d'accueil", href: '/documents/qualiopi/Livret_accueil_V1.0.pdf' },
  },
];

const IDENTITE = [
  ['Raison sociale', 'Hi-Tech Academy, organisme de formation'],
  ['Siège', '73 rue de Reuilly, 75012 Paris'],
  ['SIRET', '922 695 648 00027'],
  ['Déclaration d’activité', 'N° 11756755575, enregistrée auprès du préfet de la région Île-de-France (cet enregistrement ne vaut pas agrément de l’État)'],
  ['Représentant légal', 'Mahdi Chekini'],
];

/** Domaines du catalogue, dans l'ordre d'apparition, avec leurs formations. */
function domaines() {
  const parTag = new Map();
  formations.forEach((f) => {
    if (!parTag.has(f.tag)) parTag.set(f.tag, []);
    parTag.get(f.tag).push(f);
  });
  return [...parTag.entries()];
}

function LienEngagement({ lien }) {
  const classe = 'inline-flex items-center gap-1 mt-5 text-body-sm font-semibold hover:underline';
  const style = { color: NAVY, ...headingFont };
  return lien.to
    ? <Link to={lien.to} className={classe} style={style}>{lien.label} <ArrowRight className="w-4 h-4" /></Link>
    : <a href={lien.href} target="_blank" rel="noopener noreferrer" className={classe} style={style}>{lien.label} <ArrowRight className="w-4 h-4" /></a>;
}

export default function About() {
  useEffect(() => {
    document.title = 'À propos : Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  const groupes = domaines();

  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      <Header embedded />

      <main>
        <PageHero
          kicker="À propos"
          title={<>Former sur le terrain, <span>juger sur pièces</span></>}
          intro="Hi-Tech Academy forme salariés, indépendants et entreprises aux compétences numériques qui comptent aujourd'hui : intelligence artificielle, cloud et facturation électronique. En classe virtuelle, en direct avec un formateur, sur des environnements réels.">
          <ul className="flex flex-wrap gap-x-10 gap-y-3 pt-6" style={{ borderTop: '1px solid #1d4a8f' }}>
            {['Certifié Qualiopi, actions de formation', `${formations.length} formations au catalogue`, '100 % à distance, en direct', 'Session confirmée dès 1 participant'].map((f) => (
              <li key={f} className="text-body-sm font-medium text-white" style={bodyFont}>{f}</li>
            ))}
          </ul>
        </PageHero>

        {/* ── Signature : Exigence, Terrain, Résultat ── */}
        <Bande>
          <SectionTitle kicker="Ce qui nous définit" sub="Trois mots qui guident chaque formation, de la première question à l'attestation finale.">
            Exigence, terrain, résultat
          </SectionTitle>
          <div className="grid md:grid-cols-3 gap-6">
            {PILIERS.map(({ icon: Icon, titre, texte }) => (
              <div key={titre} className="p-7 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
                <span className="grid place-items-center w-12 h-12" style={{ borderRadius: RADIUS, background: MINT_LIGHT, color: NAVY }}>
                  <Icon size={24} />
                </span>
                <h3 className="font-serif-display text-h3 mt-6" style={{ color: '#243037', ...serifFont }}>{titre}</h3>
                <p className="text-body-base leading-[1.6] mt-3" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
              </div>
            ))}
          </div>
        </Bande>

        {/* ── Ce que nous enseignons : lu dans le catalogue ── */}
        <Bande tone="pale">
          <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-20 items-start">
            <div>
              <SectionTitle kicker="Ce que nous enseignons" sub="Des formations courtes et intensives, pensées pour être appliquées dès le lendemain dans votre poste.">
                {groupes.length} domaines, un même niveau d&apos;exigence
              </SectionTitle>
              <Link to="/formations" className="inline-flex items-center gap-1 text-body-base font-semibold hover:underline" style={{ color: NAVY, ...headingFont }}>
                Voir tout le catalogue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {groupes.map(([tag, liste]) => (
                <div key={tag} className="p-6 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif-display text-h4" style={{ color: '#243037', ...serifFont }}>{tag}</h3>
                    <span className="text-body-sm shrink-0" style={{ color: BODY_MUTED, ...bodyFont }}>
                      {liste.length} formation{liste.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="mt-3">
                    {liste.map((f) => (
                      <li key={f.id} style={{ borderTop: `1px solid ${LINE}` }}>
                        <Link to={`/formations/${f.id}`} className="group flex items-center justify-between gap-4 py-3 text-body-base hover:underline" style={{ color: BODY, ...bodyFont }}>
                          {f.title}
                          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: NAVY }} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Bande>

        <TimelineSection />
        <ResultsSection />

        {/* ── Engagements qualité ── */}
        <Bande>
          <SectionTitle kicker="Nos engagements" sub="Ce que la certification Qualiopi exige, et ce que nous nous imposons en plus.">
            Transparence et qualité, documents à l&apos;appui
          </SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ENGAGEMENTS.map(({ icon: Icon, titre, texte, lien }) => (
              <div key={titre} className="flex flex-col p-6 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
                <Icon size={28} style={{ color: NAVY }} />
                <h3 className="font-serif-display text-h4 mt-5" style={{ color: '#243037', ...serifFont }}>{titre}</h3>
                <p className="text-body-sm leading-[1.6] mt-2 flex-1" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
                <LienEngagement lien={lien} />
              </div>
            ))}
          </div>

          {/* Carte d'identité : les mêmes mentions que la page légale. */}
          <div className="mt-16 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-20 items-start">
            <div>
              <p className="text-body-sm font-semibold mb-3" style={{ color: NAVY, ...headingFont }}>L&apos;organisme en bref</p>
              <h2 className="font-serif-display text-h2" style={{ color: '#243037', ...serifFont }}>Qui sommes-nous, officiellement</h2>
              <p className="text-body-base leading-[1.6] mt-4 max-w-measure" style={{ color: BODY_MUTED, ...bodyFont }}>
                Les informations légales de l&apos;organisme, telles qu&apos;elles figurent dans nos{' '}
                <Link to="/mentions-legales" className="font-semibold underline" style={{ color: NAVY }}>mentions légales</Link>.
              </p>
            </div>
            <dl style={{ borderTop: `1px solid ${LINE}` }}>
              {IDENTITE.map(([cle, valeur]) => (
                <div key={cle} className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-x-8 gap-y-1 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <dt className="text-body-sm font-semibold" style={{ color: BODY, ...headingFont }}>{cle}</dt>
                  <dd className="text-body-base" style={{ color: BODY_MUTED, ...bodyFont }}>
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Bande>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
