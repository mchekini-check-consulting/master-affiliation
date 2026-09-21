import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quotes, Star } from '@phosphor-icons/react';
import { getTousLesTemoignages } from '@/data/ventes';
import { getFormationById } from '@/data/formations';
import { NAVY, TEAL, MINT, MINT_LIGHT, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// Avis des participants — accueil, juste avant le blog. Même registre que la
// section « Avis » des pages formation : la note moyenne en très gros à
// gauche, les avis en cartes à droite, chacun rattaché à sa formation.
//
// Pas de photo : les avis réellement recueillis n'en ont pas, et coller un
// portrait d'inconnu sur un nom réel fabriquerait un faux témoignage. Une
// pastille d'initiale tient ce rôle.

// Avis réels de toutes les formations (ventes.js → `preuves.temoignages`).
const temoignagesReels = getTousLesTemoignages();

// ─────────────────────────────────────────────────────────────────────────
// Avis d'exemple, POUR JUGER LA MISE EN FORME UNIQUEMENT.
// Ajoutés seulement si `import.meta.env.DEV` est vrai : visibles avec
// `npm run dev`, **jamais** dans le site construit. Marqués « Exemple ».
// Un faux avis publié sur le site d'un organisme certifié Qualiopi est une
// fausse preuve sociale. Pour promouvoir un avis en avis réel, le déplacer
// dans le bloc `preuves.temoignages` de sa formation (src/data/ventes.js).
// ─────────────────────────────────────────────────────────────────────────
const apercuMiseEnForme = [
  { apercu: true, formationId: 'kubernetes-fondamentaux', note: 5, texte: "Le format en petit groupe change tout : on pose ses questions au fil de l'eau et le formateur adapte le rythme. J'ai déployé ma première application en production la semaine suivante.", nom: 'Camille D.', role: 'Ingénieure DevOps' },
  { apercu: true, formationId: 'ia-pour-tous', note: 4, texte: "J'appréhendais le distanciel. En réalité, avec l'environnement fourni et les travaux pratiques guidés, on est plus concentré qu'en salle.", nom: 'Thomas R.', role: 'Administrateur systèmes' },
  { apercu: true, formationId: 'facturation-electronique-pennylane', note: 5, texte: 'Programme dense mais très bien construit. Les notions sont amenées dans le bon ordre, sans jargon inutile.', nom: 'Nadia B.', role: 'Responsable administrative' },
];

function getAvis() {
  return import.meta.env.DEV ? [...temoignagesReels, ...apercuMiseEnForme] : temoignagesReels;
}

function Etoiles({ note, taille = 18 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} weight={n <= note ? 'fill' : 'regular'} style={{ width: taille, height: taille, color: n <= note ? NAVY : '#adaaaa' }} />
      ))}
    </span>
  );
}

export default function TestimonialsSection() {
  const avis = getAvis();
  if (!avis.length) return null;

  const notes = avis.map((a) => a.note).filter((n) => typeof n === 'number');
  const moyenne = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null;
  const formationsNotees = new Set(avis.map((a) => a.formationId).filter(Boolean)).size;

  return (
    <section id="avis" className="py-20 sm:py-28" style={{ background: MINT_LIGHT }}>
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12 lg:gap-20 items-start">
          {/* Colonne collante : titre + note moyenne */}
          <div className="lg:sticky lg:top-28">
            <p className="text-body-sm font-semibold mb-3" style={{ color: TEAL, ...headingFont }}>Avis des participants</p>
            <h2
              className="font-serif-display max-w-[14ch]"
              style={{ fontSize: 'clamp(32px, 3.6vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
              Ce qu'en disent ceux qui ont suivi nos formations
            </h2>

            {moyenne !== null && (
              <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
                <p className="flex items-baseline gap-2">
                  <span className="font-serif-display tabular-nums" style={{ fontSize: 'clamp(56px, 5.5vw, 80px)', lineHeight: 1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
                    {moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                  <span className="text-h4" style={{ color: BODY_MUTED, ...headingFont }}>/ 5</span>
                </p>
                <div className="mt-3"><Etoiles note={Math.round(moyenne)} taille={24} /></div>
                <p className="text-body-sm leading-[1.5] mt-3 max-w-[30ch]" style={{ color: BODY_MUTED, ...bodyFont }}>
                  {avis.length} avis sur {formationsNotees} formation{formationsNotees > 1 ? 's' : ''}, recueillis
                  lors des évaluations de satisfaction en fin de session.
                </p>
              </div>
            )}

            <Link to="/formations" className="inline-flex items-center gap-2 mt-8 text-body-base font-semibold hover:underline" style={{ color: TEAL, ...headingFont }}>
              Voir les formations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Les avis */}
          <ul className="grid md:grid-cols-2 gap-4">
            {avis.map((a) => {
              const formation = a.formationId ? getFormationById(a.formationId) : null;
              return (
                <li
                  key={a.nom + a.role}
                  className="flex flex-col bg-white p-6 sm:p-7"
                  style={{ borderRadius: 8, border: `1px solid ${LINE}` }}>
                  <div className="flex items-center justify-between gap-4">
                    {typeof a.note === 'number' ? <Etoiles note={a.note} /> : <span />}
                    <span className="flex items-center gap-3">
                      {a.apercu && (
                        <span className="inline-flex items-center h-6 px-2.5 rounded-full text-caption font-semibold" style={{ background: '#fdf3e2', color: '#8a5a00', ...headingFont }}>
                          Exemple
                        </span>
                      )}
                      <Quotes weight="fill" className="w-6 h-6 shrink-0" style={{ color: LINE }} />
                    </span>
                  </div>
                  <blockquote className="flex-1 text-body-base leading-[1.6] m-0 mt-4" style={{ color: BODY, ...bodyFont }}>
                    « {a.texte} »
                  </blockquote>
                  <div className="flex items-center justify-between gap-4 mt-6 pt-5" style={{ borderTop: `1px solid ${LINE}` }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0 text-body-base font-bold text-white"
                        style={{ background: NAVY, ...headingFont }}>
                        {a.nom.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body-base font-semibold leading-tight" style={{ color: BODY, ...headingFont }}>{a.nom}</span>
                        <span className="block text-body-sm mt-0.5 truncate" style={{ color: BODY_MUTED, ...bodyFont }}>{a.role}</span>
                      </span>
                    </div>
                    {formation && (
                      <Link
                        to={`/formations/${formation.id}`}
                        className="hidden sm:inline-flex items-center h-7 px-3 rounded-full text-caption font-semibold whitespace-nowrap hover:underline"
                        style={{ background: MINT, color: NAVY, ...headingFont }}>
                        {formation.title.split(' –')[0]}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
