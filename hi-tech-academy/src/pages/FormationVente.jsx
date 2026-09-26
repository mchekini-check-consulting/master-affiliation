import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarBlank as CalendarDays, Clock, Monitor, Users } from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFormationById } from '@/data/formations';
import { getVenteById } from '@/data/ventes';
import { getFormationPage } from '@/data/formationPage';
import PageNotFound from '@/lib/PageNotFound';
import HeroVente from '@/components/vente/HeroVente';
import CarteHero from '@/components/vente/CarteHero';
import ResultsSection from '@/components/ResultsSection';
import Arguments from '@/components/vente/Arguments';
import Objectifs from '@/components/vente/Objectifs';
import Programme from '@/components/vente/Programme';
import Formateur from '@/components/vente/Formateur';
import PourQui from '@/components/vente/PourQui';
import Parcours from '@/components/vente/Parcours';
import Tarif from '@/components/vente/Tarif';
import Faq from '@/components/vente/Faq';
import BarreCta from '@/components/vente/BarreCta';

// Page formation = tunnel de vente, style éditorial sombre. Elle reçoit du
// trafic publicitaire : une seule action attendue, la demande d'inscription
// (/inscription/:id). Le formulaire de devis en pied de page a été retiré.
//
// Rythme : bandes pleine largeur en alternance navy / blanc / pâle, photos
// bord à bord, une barre CTA fixe dès que le héro est passé. Ordre des
// sections = ordre de persuasion : objectifs → méthode → programme → pourquoi
// → formateur → pour qui → parcours → preuve (avis) → prix → objections → formulaire.
//
// Chaque section est un composant de src/components/vente qui reçoit des props
// explicites et se masque seul quand sa donnée manque : jamais de preuve
// inventée. Données : formations.jsx (réglementaire), ventes.js (copy,
// `preuves`, `ambiance`), formationPage.js (compléments).

export default function FormationVente() {
  const { formationId } = useParams();
  const formation = getFormationById(formationId);
  const vente = getVenteById(formationId);
  const page = getFormationPage(formationId);

  const [barreVisible, setBarreVisible] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    if (formation) document.title = `${formation.title} : Hi-Tech Academy`;
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [formation]);

  // La barre CTA n'apparaît qu'une fois le héro (qui porte déjà le CTA) sorti.
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      setBarreVisible(hero ? hero.getBoundingClientRect().bottom < 0 : false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!formation || !vente) return <PageNotFound />;

  const fact = (label) => formation.keyFacts.find((f) => f.label === label)?.value ?? '';

  // « 1 000 € HT (1 200 € TTC) / stagiaire — forfait 7 h » → prix + mention TTC
  const tarifBrut = fact('Tarif');
  const prixHT = tarifBrut.split('HT')[0].trim() || tarifBrut;
  const mentionTTC = (tarifBrut.match(/\(([^)]+)\)/)?.[1] ?? '').trim();

  // « 7 h, 1 journée (9 h–12 h 30 / 13 h 30–17 h) » → « 7 h », « 1 journée », horaires
  const dureeBrute = fact('Durée');
  const dureeCourte = dureeBrute.split(', ')[0];
  const dureeDetail = dureeBrute.split(', ')[1] ?? '';
  const dureeJours = dureeDetail.split(' (')[0];
  const horaires = (dureeDetail.match(/\(([^)]+)\)/)?.[1] ?? '').trim();

  const modalite = fact('Modalité');
  const modaliteCourte = modalite.split('(')[0].trim();

  const effectif = fact('Effectif');

  const inscriptionTo = `/inscription/${formation.id}`;

  const heroFacts = ['Organisme certifié Qualiopi', 'Formateur en direct, jamais de vidéo', 'Attestation de fin de formation'];
  const reassurances = ['Réponse sous 24 h ouvrées', 'Sans engagement', fact('Sanction')];

  // Faits clés de la carte du héro : ce qu'il faut savoir avant de s'engager.
  const modaliteDetail = (modalite.match(/\(([^)]+)\)/)?.[1] ?? '').trim();
  const carteFacts = [
    { icon: Clock, label: 'Durée', valeur: dureeCourte, detail: dureeJours },
    { icon: Monitor, label: 'Format', valeur: modaliteCourte, detail: modaliteDetail },
    { icon: CalendarDays, label: 'Prochaine session', valeur: 'Sur demande', detail: fact("Délai d'accès") },
    { icon: Users, label: 'Participants', valeur: effectif.replace('À partir de ', 'Dès ') },
  ];

  // Fiche pratique (mentions Qualiopi), en grille serrée sous le prix.
  const infosPratiques = [
    ['Format', modalite],
    ['Durée', horaires ? `${dureeBrute.split(' (')[0]}, ${horaires}` : dureeBrute],
    ['Participants', effectif],
    ['Sanction', fact('Sanction')],
    ['Prochaine session', 'Sur demande'],
    ["Délai d'accès", fact("Délai d'accès")],
    ['Accessibilité', 'Handicap : adaptations étudiées sur demande'],
    formation.version && ['Programme', formation.version],
  ].filter(Boolean);

  // Modules officiels si renseignés, sinon les clusters de la page de vente.
  const modules = page.modules
    ? page.modules.map((titre) => ({ titre, items: null }))
    : vente.clusters.map((c) => ({ titre: c.titre, items: c.items }));

  const pour = vente.cible?.pour ?? [];
  // « Pas encore, si… » : chaque contre-indication peut orienter vers une autre
  // formation du catalogue (`redirige` = id) — on résout ici son titre.
  const pasPour = (vente.cible?.pasPour ?? []).map((p) => {
    const o = typeof p === 'string' ? { texte: p } : p;
    const cible = o.redirige ? getFormationById(o.redirige) : null;
    return { texte: o.texte, redirige: cible ? { id: cible.id, title: cible.title } : null };
  });

  const { preuves } = vente;

  return (
    <div className="min-h-screen bg-white">
      <Header embedded />

      <main className="pb-20">
        <HeroVente
          heroRef={heroRef}
          formation={formation}
          accroche={vente.accroche}
          sousTitre={preuves.hero.sousTitre || formation.description}
          image={preuves.hero.image || preuves.ambiance.hero}
          imagePosition={preuves.hero.position}
          alt={preuves.hero.alt}
          facts={heroFacts}
          inscriptionTo={inscriptionTo}
          couleur={vente.couleur}
          carte={
            <CarteHero
              prixHT={prixHT}
              mentionTTC={mentionTTC}
              facts={carteFacts}
              inscriptionTo={inscriptionTo}
              couleur={vente.couleur}
              reassurances={reassurances}
            />
          }
        />

        <Objectifs objectifs={page.objectifs} couleur={vente.couleur} photo={preuves.ambiance.objectifs} sanction={fact('Sanction').toLowerCase()} />
        <Programme
          modules={modules}
          captures={preuves.captures}
          pdf={formation.pdf}
          promesseFinale={page.promesseFinale}
          titre={vente.programmeTitre}
          couleur={vente.couleur}
        />
        <Arguments
          arguments={vente.argumentsMarketing}
          urgence={vente.ctaUrgence}
          projection={vente.ctaProjection}
          couleur={vente.couleur}
          inscriptionTo={inscriptionTo}
        />
        <Formateur formateur={preuves.formateur} />
        <PourQui pour={pour} pasPour={pasPour} personas={page.personas} prerequis={page.prerequis} couleur={vente.couleur} contactTo={`/contact?mode=rendez-vous&formation=${formation.id}`} />
        <Parcours couleur={vente.couleur} />
        {/* Bloc « Nos résultats » de l'accueil, réutilisé tel quel (à la place
            des témoignages) : un seul endroit à mettre à jour pour les chiffres. */}
        <ResultsSection />
        <Tarif
          prixHT={prixHT}
          mentionTTC={mentionTTC}
          inclus={page.inclus}
          infosPratiques={infosPratiques}
          couleur={vente.couleur}
          inscriptionTo={inscriptionTo}
        />
        <Faq faq={page.faq} />
      </main>

      <BarreCta visible={barreVisible} prixHT={prixHT} resume={`${dureeCourte} · ${modaliteCourte}`} inscriptionTo={inscriptionTo} />
      <Footer />
    </div>
  );
}
