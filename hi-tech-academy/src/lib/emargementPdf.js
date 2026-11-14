import { jsPDF } from 'jspdf';

// Feuille d'émargement individuelle : une feuille par apprenant et par journée
// de formation, avec deux cases de signature (matin / après-midi), inspirée du
// modèle historique mais à l'identité Hi-Tech Academy. Envoyée en pièce jointe
// depuis la section Émargement d'une session.

const ORG = {
  name: 'HI-TECH ACADEMY',
  legalLine: 'EURL au capital de 100 € — RCS Paris 922 695 648',
  trainer: 'Mahdi CHEKINI',
  address: '73 rue de Reuilly, 75012 Paris',
  siret: 'SIRET 922 695 648 00027 — NAF 85.59A',
  nda: '11756755575',
  email: 'contact@hi-techacademy.fr',
  phone: '07 51 47 41 35',
};

const NAVY = '#001a4a';
const TEAL = '#005064';
const GREY = '#6b7a9b';
const INK = '#1a1a2e';
const BORDER = '#9fb2cc';
const MARGIN = 16;

/** dayLabel au format JJ/MM/AAAA. */
export function buildEmargementPdf({ learnerName, formationTitle, dayLabel }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;

  // Titre
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(NAVY);
  doc.text("FEUILLE D'ÉMARGEMENT", pageWidth / 2, 24, { align: 'center' });

  // Tableau d'identification (libellé | valeur)
  const rows = [
    ['Organisme de formation :', ORG.name],
    ['Nom de la formation :', formationTitle],
    ['Date :', dayLabel],
    ['Formateur :', ORG.trainer],
  ];
  let y = 34;
  const labelW = 70;
  doc.setLineWidth(0.3).setDrawColor(BORDER);
  for (const [label, value] of rows) {
    const valueLines = doc.setFont('helvetica', 'normal').setFontSize(11)
      .splitTextToSize(value, contentWidth - labelW - 8);
    const h = Math.max(11, valueLines.length * 5.4 + 5.5);
    doc.rect(MARGIN, y, labelW, h);
    doc.rect(MARGIN + labelW, y, contentWidth - labelW, h);
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(NAVY);
    doc.text(label, MARGIN + 4, y + 7);
    doc.setFont('helvetica', 'normal').setTextColor(INK);
    doc.text(valueLines, MARGIN + labelW + 4, y + 7);
    y += h;
  }

  // Tableau de signatures : apprenant | matin | après-midi
  y += 10;
  const nameW = 95;
  const halfW = (contentWidth - nameW) / 2;
  const headH = 12;
  const signH = 42;

  doc.setFillColor(240, 243, 250);
  doc.rect(MARGIN, y, nameW, headH, 'FD');
  doc.rect(MARGIN + nameW, y, halfW, headH, 'FD');
  doc.rect(MARGIN + nameW + halfW, y, halfW, headH, 'FD');
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(NAVY);
  doc.text('Prénom Nom', MARGIN + 4, y + 7.5);
  doc.text(`Matin — ${dayLabel}`, MARGIN + nameW + halfW / 2, y + 7.5, { align: 'center' });
  doc.text(`Après-midi — ${dayLabel}`, MARGIN + nameW + halfW + halfW / 2, y + 7.5, { align: 'center' });

  y += headH;
  doc.rect(MARGIN, y, nameW, signH);
  doc.rect(MARGIN + nameW, y, halfW, signH);
  doc.rect(MARGIN + nameW + halfW, y, halfW, signH);
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(INK);
  doc.text(learnerName, MARGIN + 4, y + 10);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(GREY);
  doc.text('Signature :', MARGIN + nameW + 4, y + 6);
  doc.text('Signature :', MARGIN + nameW + halfW + 4, y + 6);

  y += signH + 10;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(INK);
  doc.text(
    "Merci de signer chaque demi-journée effectuée, puis de retourner cette feuille à "
    + `${ORG.email}. L'émargement atteste de l'assiduité du stagiaire (justificatif de réalisation de l'action de formation).`,
    MARGIN, y, { maxWidth: contentWidth },
  );

  // Pied de page légal
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor('#c0d4d8').setLineWidth(0.2);
  doc.line(MARGIN, footerY - 5, pageWidth - MARGIN, footerY - 5);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(GREY);
  doc.text(`${ORG.name} — ${ORG.legalLine} — ${ORG.address}`, pageWidth / 2, footerY, { align: 'center' });
  doc.text(`${ORG.siret} — Tél : ${ORG.phone} — ${ORG.email}`, pageWidth / 2, footerY + 4.2, { align: 'center' });
  doc.text(
    `Déclaration d'activité enregistrée sous le numéro ${ORG.nda} auprès du Préfet de Région Île-de-France. `
    + "Cet enregistrement ne vaut pas agrément de l'État.",
    pageWidth / 2, footerY + 8.4, { align: 'center', maxWidth: contentWidth },
  );
  return doc;
}

export function emargementFileName(learnerName, dayLabel) {
  const safe = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_');
  return `Feuille_emargement_${safe(dayLabel)}_${safe(learnerName)}.pdf`;
}

export function emargementPdfBase64(params) {
  const bytes = new Uint8Array(buildEmargementPdf(params).output('arraybuffer'));
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
