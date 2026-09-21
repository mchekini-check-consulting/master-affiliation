import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Certificate, Clock, Monitor, UsersThree, VideoCamera } from '@phosphor-icons/react';
import { formations } from '@/data/formations';

// Catalogue de la page d'accueil.
//
// Les catégories viennent des `tag` réels du catalogue et le filtre filtre
// vraiment. La version précédente affichait une catégorie tirée de l'INDEX de
// la carte (« Bureautique » sur la formation Kubernetes) et un niveau de
// difficulté calculé en `index % 2` — deux données qui n'existent nulle part
// dans `formations.jsx`. Le filtre, lui, changeait un état que rien ne lisait.

const TOUTES = 'Toutes les formations';

/** « 7 h, 1 journée (…) » → « 7 h ». */
const dureeDe = (formation) =>
  formation.keyFacts?.find((fait) => fait.label.includes('Durée'))?.value?.split(',')[0]?.trim() || '';

function CarteFormation({ formation }) {
  const duree = dureeDe(formation);
  return (
    <article className="catalogue-card">
      <div className="catalogue-card__image">
        <img src={formation.image} alt="" loading="lazy" />
        <span className="catalogue-card__tag">{formation.tag}</span>
      </div>
      <div className="catalogue-card__body">
        <h3>{formation.title}</h3>
        <p>{formation.description}</p>
        {/* Uniquement des faits vérifiables dans le catalogue. */}
        <div className="catalogue-card__meta">
          {duree && <span><Clock size={16} /> {duree}</span>}
          <span><Monitor size={16} /> À distance</span>
          <span><VideoCamera size={16} /> En direct</span>
        </div>
        <Link to={`/formations/${formation.id}`} className="catalogue-card__link">
          Voir la formation <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function FormationsSection() {
  // Catégories déduites du catalogue : pas de liste écrite à la main qui
  // finirait par ne plus correspondre aux formations publiées.
  const categories = useMemo(
    () => [TOUTES, ...Array.from(new Set(formations.map((f) => f.tag)))],
    []
  );
  const [categorieActive, setCategorieActive] = useState(TOUTES);

  const cartes = useMemo(() => {
    const liste = categorieActive === TOUTES
      ? formations
      : formations.filter((f) => f.tag === categorieActive);
    return liste.slice(0, 4);
  }, [categorieActive]);

  return (
    <section id="programmes" className="catalogue-section">
      <div className="catalogue-section__inner">

        <header className="catalogue-header">
          <p className="catalogue-eyebrow"><i />Nos formations</p>
          <h2>Explorer nos <span>formations</span></h2>
          <p>
            Des actions de formation intensives, 100 % à distance, animées en direct par un
            formateur expert, avec toutes les informations utiles avant votre inscription.
          </p>

          {/* Accroche manuscrite. La phrase leve l'objection la plus courante
              avant une inscription — « ma session va etre annulee faute
              d'inscrits » — et elle est exacte : les cinq formations du
              catalogue portent « A partir de 1 participant » en effectif. */}
          <div className="catalogue-handwriting" aria-hidden="true">
            Même seul inscrit,<br />votre session<br />a bien lieu.
            {/* Courbe : part sous la fin du texte (84,8), descend vers la
                gauche et se termine en (30,82). Les deux barbes sont calculees
                sur la tangente de sortie (126 deg) a plus ou moins 26 deg, donc
                la pointe est bien dans l'axe de la courbe.
                AUCUNE rotation sur le svg : seul le <p> tourne (-8 deg). La
                direction finale est donc 126 - 8 = 118 deg, vers le bas a
                gauche, c'est-a-dire les cartes. */}
            <svg viewBox="0 0 88 104" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M74 3C86 34 57 58 33 97" />
              <path d="M33 97 47 89M33 97 33 81" />
            </svg>
          </div>
        </header>

        <nav className="catalogue-filters" aria-label="Filtrer par catégorie">
          {categories.map((categorie) => (
            <button
              key={categorie}
              type="button"
              aria-pressed={categorieActive === categorie}
              onClick={() => setCategorieActive(categorie)}
              className={categorieActive === categorie ? 'is-active' : ''}>
              {categorie}
            </button>
          ))}
        </nav>

        <div className="catalogue-grid">
          {cartes.map((formation) => <CarteFormation key={formation.id} formation={formation} />)}
        </div>

        <footer className="catalogue-footer">
          <div className="catalogue-promises">
            <span><Certificate size={28} /><b>Attestation de formation<small>Remise à l&apos;issue de la session</small></b></span>
            <span><Monitor size={28} /><b>100 % à distance<small>En classe virtuelle</small></b></span>
            <span><UsersThree size={28} /><b>Dès un participant<small>La session est confirmée</small></b></span>
          </div>
          <Link to="/formations" className="catalogue-footer__cta">
            Voir toutes nos formations <ArrowRight size={16} />
          </Link>
        </footer>
      </div>
    </section>
  );
}
