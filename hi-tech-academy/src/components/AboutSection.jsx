import React from 'react';
import { ArrowRight, Briefcase, CheckCircle as CheckCircle2, FileText, GraduationCap, Heart, Star } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

// Trois profils d'audience, repris de la maquette. Les puces vivent dans la
// donnée plutôt que dans une cascade de ternaires au moment du rendu.
const profiles = [
  {
    title: 'Étudiants',
    description: 'Acquérez des compétences concrètes pour booster votre avenir.',
    icon: GraduationCap,
    tone: 'mint',
    cta: 'Découvrir nos formations',
    href: '/formations',
    imageClass: 'student',
    image: '/images/profil-etudiants.jpg',
    bullets: ['Formations certifiantes', 'Projets pratiques', 'Accompagnement personnalisé'],
    // Accroche manuscrite posée sur la photo, comme sur la maquette.
    scribble: 'Apprendre\naujourd’hui,\nconstruire\ndemain.',
  },
  {
    title: 'Professionnels',
    description: 'Développez vos compétences et faites évoluer votre carrière.',
    icon: Briefcase,
    tone: 'lavender',
    cta: 'Explorer nos parcours',
    href: '/formations',
    imageClass: 'professional',
    image: '/images/profil-professionnels.jpg',
    bullets: ['Montée en compétences', 'Reconversions accompagnées', 'Formations 100 % en ligne'],
    scribble: 'Évoluer.\nSe réinventer.\nAvancer.',
  },
  {
    title: 'Entreprises',
    description: 'Formez vos équipes avec des programmes sur mesure et adaptés à vos enjeux.',
    icon: FileText,
    tone: 'mint',
    cta: 'Solutions entreprises',
    href: '/contact?sujet=devis',
    imageClass: 'business',
    image: '/images/profil-entreprises.webp',
    bullets: ['Formations personnalisées', 'Suivi et reporting', 'Compétences directement applicables'],
    scribble: 'Des talents\npour aller\nplus loin.',
  },
];

// QUALIOPI : aucun chiffre non justifiable. Les deux taux sont ceux publiés
// dans « Nos résultats » (ResultsSection.jsx), issus des questionnaires de
// satisfaction : les modifier ici ET là-bas, jamais l'un sans l'autre.
// Anciennement « +2K apprenants » et « +70 % en emploi sous 6 mois », que rien
// n'étayait : retirés.
const stats = [
  { icon: Star, value: '95%', label: 'Taux de satisfaction' },
  { icon: Heart, value: '100%', label: 'Taux de recommandation' },
];

/** Emplacement de photo laissé vide : déposer l'image puis remplacer par <img>. */
// Visuel de carte. Avec `src`, une vraie photo ; sans, l'aplat d'attente.
// `has-photo` bascule l'accroche manuscrite en blanc et ajoute un voile
// sombre en haut de l'image : mesure sur la photo fournie, ce coin est a
// 54/255 de luminance, ou le #002d74 de l'accroche serait invisible.
function VisuelCarte({ className, scribble, src }) {
  return (
    <div
      className={`audience-card__image ${className}${src ? ' has-photo' : ''}`}
      {...(src ? {} : { role: 'img', 'aria-label': "Emplacement image a importer" })}>
      {src && <img src={src} alt="" loading="lazy" />}
      <span className="audience-card__scribble">
        {scribble.split('\n').map((line) => <span key={line}>{line}</span>)}
      </span>
    </div>
  );
}

function ProfileCard({ profile }) {
  const Icon = profile.icon;
  return (
    <article className="audience-card">
      <VisuelCarte className={profile.imageClass} scribble={profile.scribble} src={profile.image} />
      <div className="audience-card__body">
        <span className={`audience-card__icon is-${profile.tone}`}><Icon /></span>
        <h3>{profile.title}</h3>
        <p>{profile.description}</p>
        <ul>
          {profile.bullets.map((bullet) => <li key={bullet}><CheckCircle2 /> {bullet}</li>)}
        </ul>
        <Link to={profile.href} className={`audience-card__cta is-${profile.tone}`}>
          {profile.cta}<span><ArrowRight /></span>
        </Link>
      </div>
    </article>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="audience-section">
      <div className="audience-section__inner">
        <div className="audience-section__intro">
          {/* Maquette : première ligne en noir, seconde en vert. */}
          <h2>Des parcours adaptés<br /><span>à chaque profil</span></h2>
          <p className="audience-lead">Que vous soyez étudiant, professionnel en reconversion ou entreprise, nous avons la formation qu&apos;il vous faut pour atteindre vos objectifs et développer des compétences durables et recherchées.</p>

          <div className="audience-stats">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <span><Icon /></span>
                <b>{value}</b>
                <small>{label}</small>
              </div>
            ))}
          </div>

        </div>

        <div className="audience-section__profiles">
          <div className="audience-cards">
            {profiles.map((profile) => <ProfileCard profile={profile} key={profile.title} />)}
          </div>
        </div>

      </div>

      {/* Accroche en haut à droite : la flèche part du texte et redescend vers
          les cartes, en bas à gauche — d'où la courbe et la pointe inversées
          par rapport à la version posée en bas de section. */}
      <p className="audience-bottom-note">
        <svg viewBox="0 0 60 78" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M54 3C58 38 46 64 16 73" />
          <path d="M30 74H14V57" />
        </svg>
        À chacun sa voie,<br />à tous la même exigence.
      </p>
    </section>
  );
}
