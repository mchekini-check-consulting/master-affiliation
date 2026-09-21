import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChartBar as BarChart3, Clock as Clock3, Cpu, StackSimple as Layers, Receipt } from '@phosphor-icons/react';
import { formations } from '@/data/formations';

// Habillage de chaque formation du catalogue : accroche courte (2 lignes sur la
// carte) et teinte de la pastille de catégorie. Le titre, l'image, la catégorie
// et la durée viennent de src/data/formations.jsx.
const presentation = {
  'kubernetes-fondamentaux': {
    pitch: 'Pods, Deployments et Services : déployez vos conteneurs sur un cluster réel.',
    icon: Layers,
  },
  'facturation-electronique-pennylane': {
    pitch: 'Anticipez la réforme et pilotez votre comptabilité dans Pennylane.',
    icon: Receipt,
  },
  'ia-pour-tous': {
    pitch: 'ChatGPT, Claude, Gemini : gagnez du temps au quotidien, sans prérequis.',
    icon: Cpu,
  },
  'ia-for-business': {
    pitch: 'Automatisez vos processus et industrialisez l’IA dans votre organisation.',
    icon: BarChart3,
  },
  'ia-for-tech': {
    pitch: 'Génération, revue et documentation de code assistées par l’IA.',
    icon: Cpu,
  },
};

// « 7 h — 1 journée (…) » → « 7h ». Seule la durée brute tient dans la pastille.
const shortDuration = (formation) => {
  const hours = formation.keyFacts
    ?.find((fact) => fact.label === 'Durée')
    ?.value?.match(/^\s*(\d+)\s*h/)?.[1];
  return hours ? `${hours}h` : '';
};

const slides = formations
  .filter((formation) => presentation[formation.id])
  .map((formation) => ({
    id: formation.id,
    category: formation.tag,
    title: formation.title,
    image: formation.image,
    duration: shortDuration(formation),
    ...presentation[formation.id],
  }));

const count = slides.length;

// Distance signée la plus courte entre une carte et la carte active : -1 à
// gauche, 0 au centre, 1 à droite. C'est elle qui décide de la position, donc
// une carte qui passe de « dernière » à « première » glisse d'un seul cran au
// lieu de traverser tout le carrousel.
const offsetOf = (index, active) => {
  let distance = index - active;
  if (distance > count / 2) distance -= count;
  if (distance < -count / 2) distance += count;
  return distance;
};

// Les cartes latérales ne sont pas « réduites » : elles sont posées en arrière
// dans une scène en perspective (translateZ). La réduction vient donc de la
// profondeur, et surtout le navigateur trie lui-même l'ordre d'affichage selon
// la position réelle en 3D — la carte de derrière passe devant en glissant,
// sans le saut d'un z-index qui bascule d'un coup.
//
// Avec `perspective: 1200px`, un z de -330 donne une échelle de 1200/1530 ≈
// 0,78. Le x est divisé par cette même échelle, d'où 245 pour un décalage
// apparent de ~192px.
const layout = {
  '-1': { x: -245, z: -330, rotateY: 10, opacity: 1 },
  0: { x: 0, z: 0, rotateY: 0, opacity: 1 },
  1: { x: 245, z: -330, rotateY: -10, opacity: 1 },
};

function Card({ slide, offset, spring }) {
  const Icon = slide.icon;
  const active = offset === 0;
  return (
    <motion.article
      className={`hcc-card ${active ? 'is-active' : ''}`}
      initial={false}
      animate={layout[offset]}
      transition={spring}
      aria-hidden={!active}
    >
      <div className="hcc-card__media">
        <img src={slide.image} alt="" />
        <span className="hcc-card__tag">
          <Icon /> {slide.category}
        </span>
        {slide.duration && (
          <span className="hcc-card__time">
            <Clock3 /> {slide.duration}
          </span>
        )}
      </div>
      <div className="hcc-card__body">
        <h3>{slide.title}</h3>
        <p>{slide.pitch}</p>
        <Link to={`/formations/${slide.id}`} tabIndex={active ? 0 : -1}>
          Voir la formation <ArrowRight />
        </Link>
      </div>
    </motion.article>
  );
}

export default function HeroCourseCarousel() {
  const [active, setActive] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const reduced = useReducedMotion();
  const previous = () => setActive((current) => (current - 1 + count) % count);
  const next = () => setActive((current) => (current + 1) % count);

  // Ressort plutôt qu'une durée fixe : la carte arrive et se pose sans rebond
  // visible, et un clic en cours d'animation repart de la vitesse courante au
  // lieu de casser le mouvement.
  const spring = reduced
    ? { duration: 0 }
    : { type: 'spring', stiffness: 210, damping: 30, mass: 0.9 };

  // Le défilement s'arrête au survol et dès qu'un élément du bloc prend le
  // focus clavier : sans cela, la carte change sous le curseur au moment du
  // clic, et un utilisateur au clavier voit le contenu bouger pendant qu'il
  // le parcourt. Il est désactivé pour qui demande moins d'animation.
  useEffect(() => {
    if (enPause || reduced) return undefined;
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [enPause, reduced]);

  return (
    <div
      className="hcc"
      aria-label="Formations mises en avant"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocusCapture={() => setEnPause(true)}
      onBlurCapture={() => setEnPause(false)}>
      {/* Accroche manuscrite + flèche vers le carrousel, dans le même esprit que
          celle de la section « Explorer nos Formations ». */}
      <p className="hcc__hint">
        Votre prochaine<br />compétence<br />commence ici
        <svg viewBox="0 0 115 94" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M103 5c5 35-9 64-49 78" />
          <path d="M54 83 70 64M54 83l25 3" />
        </svg>
      </p>
      <div className="hcc__stage">
        {slides.map((slide, index) => {
          const offset = offsetOf(index, active);
          if (Math.abs(offset) > 1) return null;
          return <Card key={slide.id} slide={slide} offset={offset} spring={spring} />;
        })}
      </div>
      <div className="hcc__controls">
        <button type="button" onClick={previous} aria-label="Formation précédente">
          <ArrowLeft />
        </button>
        <div>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? 'is-active' : ''}
              onClick={() => setActive(index)}
              aria-label={`Aller à ${slide.title}`}
            />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Formation suivante">
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
