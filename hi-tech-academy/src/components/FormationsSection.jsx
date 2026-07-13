import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Monitor, Euro, Users, CalendarClock, Award, ArrowRight, FileText, Accessibility, ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Catalogue des formations. Pour ajouter une formation : ajouter une entrée
// ici (carte + infos réglementaires Qualiopi + PDF du programme dans
// public/documents/), rien d'autre à modifier.
const formations = [
  {
    id: 'kubernetes-fondamentaux',
    tag: 'Infrastructure & Cloud',
    title: 'Kubernetes – Fondamentaux',
    description:
      "Déployez et administrez des applications conteneurisées avec Kubernetes : architecture d'un cluster, Deployments, Services, Ingress, ConfigMaps, Secrets et règles de placement — avec travaux pratiques sur un cluster Azure (AKS) réel.",
    image: '/images/0002848c7_istock-2177184303.jpg',
    version: 'Programme V1.2 du 11/07/2026',
    pdf: '/documents/Programme_Kubernetes_Fondamentaux_V1.2.pdf',
    registrationUrl: 'https://10eeb566.qualiobee.fr/qualiobee/formation/d3d3588b-30f6-45b5-ba86-5ff1156492c3/registration/form',
    keyFacts: [
      { icon: Clock, label: 'Durée', value: '21 h — 3 jours de 7 h' },
      { icon: Monitor, label: 'Modalité', value: '100 % à distance (classe virtuelle Google Meet)' },
      { icon: Euro, label: 'Tarif', value: '1 000 € net de taxe / stagiaire' },
      { icon: CalendarClock, label: "Délai d'accès", value: '2 jours minimum entre la demande et le début' },
      { icon: Users, label: 'Effectif', value: 'Dès 3 participants — session individuelle possible' },
      { icon: Award, label: 'Sanction', value: 'Attestation de fin de formation' },
    ],
    qualiopiSections: [
      {
        id: 'public-prerequis',
        title: 'Public visé et prérequis',
        content: (
          <>
            <p className="mb-2">
              <strong>Public concerné :</strong> développeurs, administrateurs systèmes et réseaux, ingénieurs
              DevOps / Cloud, techniciens et architectes IT souhaitant déployer et administrer des applications
              conteneurisées avec Kubernetes.
            </p>
            <p className="mb-1"><strong>Prérequis :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maîtrise des bases de la ligne de commande Linux (navigation, édition de fichiers, droits).</li>
              <li>Connaissance des fondamentaux des conteneurs et de Docker (images, conteneurs, registre).</li>
            </ul>
            <p className="mt-2">Les prérequis sont vérifiés à l'entrée via un test de positionnement.</p>
          </>
        ),
      },
      {
        id: 'objectifs',
        title: 'Objectifs opérationnels et évaluables',
        content: (
          <>
            <p className="mb-2">À l'issue de la formation, le participant sera capable de :</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Expliquer le rôle de Kubernetes dans le cycle de vie d'une application conteneurisée et identifier ses cas d'usage.</li>
              <li>Décrire l'architecture d'un cluster et le rôle de chaque composant du control plane et des nœuds.</li>
              <li>Expliquer les mécanismes assurant la haute disponibilité d'un cluster Kubernetes.</li>
              <li>Créer, déployer et administrer les principales ressources (Pod, Service, Deployment, DaemonSet, StatefulSet, Ingress) via manifestes YAML et kubectl.</li>
              <li>Externaliser la configuration et les données sensibles d'une application via ConfigMap et Secrets.</li>
              <li>Mettre en œuvre des règles de placement des pods (affinity / anti-affinity).</li>
            </ol>
          </>
        ),
      },
      {
        id: 'methodes',
        title: 'Méthodes et moyens mobilisés',
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Alternance d'apports théoriques et de mises en pratique ; démonstrations en direct et travaux pratiques guidés sur cluster réel.</li>
            <li>Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).</li>
            <li>Cluster Kubernetes managé Microsoft Azure (AKS), avec un espace de noms dédié par stagiaire ; kubectl et manifestes YAML.</li>
            <li>Support de cours, fiches de commandes, énoncés et corrigés des TP téléchargeables sur l'espace de la formation.</li>
          </ul>
        ),
      },
      {
        id: 'evaluation',
        title: "Modalités d'évaluation et de suivi",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Avant :</strong> questionnaire d'analyse du besoin et des attentes ; test de positionnement (prérequis).</li>
            <li><strong>Pendant :</strong> un quiz à la fin de chaque journée, travaux pratiques corrigés, émargement par demi-journée et rapport de connexion.</li>
            <li><strong>En fin de formation :</strong> évaluation finale des acquis (QCM + mise en pratique), questionnaires de satisfaction à chaud puis à froid, attestation de fin de formation.</li>
          </ul>
        ),
      },
      {
        id: 'acces',
        title: "Modalités et délais d'accès",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Inscription par e-mail (<a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a>) ou téléphone (<a href="tel:+33751474135" className="underline">07 51 47 41 35</a>).</li>
            <li>Délai d'accès : 2 jours minimum entre la demande et le début de la formation (hors prise en charge financeur).</li>
            <li>Ouverture de la session à partir de 3 participants ; session individuelle possible.</li>
          </ul>
        ),
      },
      {
        id: 'handicap',
        title: 'Accessibilité aux personnes en situation de handicap',
        content: (
          <>
            <p className="mb-2">
              Nos formations à distance peuvent être adaptées aux personnes en situation de handicap. Lors de
              l'inscription, le référent handicap étudie avec le candidat les aménagements nécessaires et mobilise
              si besoin son réseau de partenaires.
            </p>
            <p>
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
          </>
        ),
      },
      {
        id: 'indicateurs',
        title: 'Indicateurs de résultats',
        content: (
          <p>
            Hi-Tech Academy est nouvel entrant pour cette action de formation. Les indicateurs de résultats
            (taux de satisfaction, atteinte des objectifs, assiduité) sont mis en place dès la première session
            et publiés sur cette page.
          </p>
        ),
      },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  })
};

function FormationRow({ formation }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">

      {/* Carte */}
      <motion.div
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-col rounded-3xl overflow-hidden lg:col-span-2"
        style={{
          background: 'white',
          border: '1px solid #e0e8f4',
          boxShadow: hovered ?
            '0 8px 24px rgba(0,80,100,0.10)' :
            '0 2px 8px rgba(0,0,0,0.04)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)'
        }}>

        {/* Image */}
        <div className="relative w-full overflow-hidden" style={{ height: 200, background: '#edf6f6' }}>
          <img src={formation.image} alt={formation.title} className="w-full h-full object-cover" />
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(255,255,255,0.85)',
              color: '#005064',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backdropFilter: 'blur(8px)'
            }}>
            {formation.tag}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex flex-col flex-1 p-6">
          <h3
            className="font-bold text-xl leading-snug mb-3"
            style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {formation.title}
          </h3>

          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
            {formation.description}
          </p>

          {/* Infos clés */}
          <ul className="space-y-3 mb-6 p-4 rounded-2xl" style={{ background: '#f0f3fa' }}>
            {formation.keyFacts.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#005064' }} />
                <span className="text-xs" style={{ color: '#0f2e2f', fontFamily: "'Inter', sans-serif" }}>
                  <strong style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label} :</strong> {value}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href={formation.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: '#005064',
              color: 'white',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            <FileText className="w-4 h-4" />
            Télécharger le programme (PDF)
          </a>
          <a
            href={formation.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: '#f0f3fa',
              color: '#005064',
              border: '1.5px solid #005064',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            Demander une inscription
            <ArrowRight className="w-4 h-4" />
          </a>

          <p className="text-[11px] mt-4 text-center" style={{ color: '#6b8a8b', fontFamily: "'Inter', sans-serif" }}>
            {formation.version}
          </p>
        </div>
      </motion.div>

      {/* Informations réglementaires (Qualiopi) */}
      <motion.div
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="lg:col-span-3 rounded-3xl p-6 sm:p-8"
        style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>

        <div className="flex items-center gap-2 mb-2">
          <Accessibility className="w-5 h-5" style={{ color: '#005064' }} />
          <h3
            className="font-bold text-lg"
            style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Informations pratiques et réglementaires
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
          Action de formation concourant au développement des compétences (art. L.6313-1 du Code du travail).
        </p>

        <Accordion type="single" collapsible className="w-full">
          {formation.qualiopiSections.map((s) => (
            <AccordionItem key={s.id} value={s.id}>
              <AccordionTrigger
                className="text-sm font-semibold text-left"
                style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {s.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-sm leading-relaxed" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
                  {s.content}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
}

export default function FormationsSection() {
  return (
    <section
      id="programmes"
      className="w-full py-16 sm:py-20 lg:py-24"
      style={{ background: 'white' }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#002d74', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            Découvrir notre Catalogue
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            Explorer nos{' '}
            <span style={{ color: '#002d74' }}>Formations</span>
          </h2>
          <p
            className="max-w-xl mx-auto text-base"
            style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>

            Des actions de formation intensives, 100 % à distance, animées en direct par un formateur expert
            — avec toutes les informations utiles avant votre inscription.
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16" style={{ background: '#c0d4d8' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#F8B102' }} />
            <div className="h-px w-16" style={{ background: '#c0d4d8' }} />
          </div>
        </motion.div>

        {/* Une rangée par formation du catalogue */}
        <div className="space-y-16">
          {formations.map((f) => (
            <FormationRow key={f.id} formation={f} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}>

          <p
            className="text-sm mb-4"
            style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>

            Une question sur nos formations ou votre financement ?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
            style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            Parlez à un conseiller
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>);
}
