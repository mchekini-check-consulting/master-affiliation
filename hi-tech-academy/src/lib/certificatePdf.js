import { jsPDF } from 'jspdf';

// Coordonnées officielles de l'organisme (identiques au pied de page des
// documents Qualiopi du dossier documents_source).
const ORG = {
  name: 'HI-TECH ACADEMY',
  representative: 'Mahdi CHEKINI',
  representativeRole: "Représentant légal de l'organisme de formation",
  address: '73 rue de Reuilly, 75012 Paris',
  siret: 'SIRET 922 695 648 00027',
  nda: "Déclaration d'activité n° 11756755575 (préfet de région d'Île-de-France)",
  contact: '07 51 47 41 35 – contact@hi-techacademy.fr',
};

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Construit le PDF d'un certificat de réalisation à partir des données
 * renvoyées par l'API admin (téléchargement ou visualisation navigateur).
 */
function buildCertificatePdf(certificate) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;
  let y = 26;

  // En-tête organisme
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor('#001a4a');
  doc.text(ORG.name, margin, y);
  const nameWidth = doc.getTextWidth(ORG.name); // mesurée avant le changement de police
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#6b7a9b');
  doc.text('Organisme de formation', margin + nameWidth + 4, y);
  y += 3;
  doc.setDrawColor('#005064');
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // Titre
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor('#001a4a');
  doc.text('CERTIFICAT DE RÉALISATION', pageWidth / 2, y, { align: 'center' });

  // Corps
  const civility = certificate.civility === 'Madame' ? 'Madame' : 'Monsieur';
  const learner = `${certificate.first_name} ${certificate.last_name}`;
  const sameDay = certificate.session_start_date === certificate.session_end_date;
  const period = sameDay
    ? `le ${formatDateFr(certificate.session_start_date)}`
    : `du ${formatDateFr(certificate.session_start_date)} au ${formatDateFr(certificate.session_end_date)}`;

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor('#1a1a2e');
  const intro =
    `Je soussigné, ${ORG.representative}, ${ORG.representativeRole.toLowerCase()} ${ORG.name}, ` +
    `certifie que :`;
  doc.text(doc.splitTextToSize(intro, contentWidth), margin, y);

  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${civility} ${learner}`, pageWidth / 2, y, { align: 'center' });
  if (certificate.company_name) {
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor('#6b7a9b');
    doc.text(`(${certificate.company_name})`, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor('#1a1a2e');
  }

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  const attended = certificate.attended_hours ?? certificate.duration_hours;
  const attendanceRate = Math.round((attended / certificate.duration_hours) * 100);
  const body =
    `a suivi l'action de formation « ${certificate.formation_title} », ` +
    `action concourant au développement des compétences (art. L.6313-1 du Code du travail), ` +
    `réalisée à distance (classe virtuelle) ${period}, ` +
    `d'une durée totale de ${certificate.duration_hours} heures. ` +
    `Durée effectivement réalisée par le stagiaire : ${attended} heure${attended > 1 ? 's' : ''} ` +
    `sur ${certificate.duration_hours} (assiduité de ${attendanceRate} %).`;
  doc.text(doc.splitTextToSize(body, contentWidth), margin, y, { lineHeightFactor: 1.6 });

  // Résultats de l'évaluation des acquis et atteinte des objectifs
  // (grille du document « Évaluation finale – V1.0 », seuil indicatif 60 %)
  y += 38;
  if (certificate.total_score !== null && certificate.total_score !== undefined) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor('#001a4a');
    doc.text("Évaluation des acquis", margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#1a1a2e');
    const results =
      `QCM d'évaluation finale : ${certificate.qcm_score} / 10 — ` +
      `Mise en pratique : ${certificate.practical_score} / 10 — ` +
      `Total : ${certificate.total_score} / 20.`;
    doc.text(doc.splitTextToSize(results, contentWidth), margin, y, { lineHeightFactor: 1.5 });
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(certificate.objectives_achieved ? '#116632' : '#a12626');
    doc.text(
      certificate.objectives_achieved
        ? 'Objectifs de la formation : ATTEINTS (seuil indicatif de 60 % dépassé).'
        : 'Objectifs de la formation : NON ATTEINTS (seuil indicatif de 60 % non atteint).',
      margin, y);
    doc.setTextColor('#1a1a2e');
    y += 12;
  }

  const mention =
    `Cette attestation est délivrée pour servir et valoir ce que de droit. ` +
    `L'assiduité du stagiaire est justifiée par les feuilles d'émargement par demi-journée ` +
    `et les rapports de connexion à la classe virtuelle.`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor('#444455');
  doc.text(doc.splitTextToSize(mention, contentWidth), margin, y, { lineHeightFactor: 1.5 });

  // Date et signature
  y += 24;
  doc.setFontSize(11);
  doc.setTextColor('#1a1a2e');
  doc.text(`Fait à Paris, le ${formatDateFr(certificate.issued_at)}`, margin, y);
  y += 10;
  doc.text(ORG.representative, pageWidth - margin, y, { align: 'right' });
  y += 5.5;
  doc.setFontSize(9.5);
  doc.setTextColor('#6b7a9b');
  doc.text(ORG.representativeRole, pageWidth - margin, y, { align: 'right' });

  // Pied de page organisme
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setDrawColor('#c0d4d8');
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFontSize(8);
  doc.setTextColor('#6b7a9b');
  doc.text(`${ORG.name} – ${ORG.address} – ${ORG.siret}`, pageWidth / 2, footerY - 1, { align: 'center' });
  doc.text(`${ORG.nda} – ${ORG.contact}`, pageWidth / 2, footerY + 3, { align: 'center' });

  return doc;
}

function certificateFileName(certificate) {
  return `Certificat_realisation_${certificate.last_name}_${certificate.first_name}.pdf`
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');
}

/** Télécharge le PDF du certificat. */
export function downloadCertificatePdf(certificate) {
  buildCertificatePdf(certificate).save(certificateFileName(certificate));
}

/** URL blob du certificat, à afficher dans la visionneuse intégrée. */
export function certificatePdfBlobUrl(certificate) {
  return buildCertificatePdf(certificate).output('bloburl');
}
