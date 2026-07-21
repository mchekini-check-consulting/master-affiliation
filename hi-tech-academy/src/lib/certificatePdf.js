import { jsPDF } from 'jspdf';

// Certificat de réalisation au format du modèle officiel de l'organisme
// (documents_finaux/Certificat_de_réalisation.pdf) : attestation d'assiduité
// et de présence, tableau des modalités, engagements, signature de
// l'organisme uniquement — enrichi de l'assiduité réelle et du résultat de
// l'évaluation des acquis.
const ORG = {
  name: 'HI-TECH ACADEMY',
  representative: 'Mahdi CHEKINI',
  representativeRole: "Représentant légal de l'organisme de formation",
  addressFooter: '73 RUE DE REUILLY 75012 PARIS 12',
  siretFooter: 'Siret 92269564800027 - NAF 85.59A',
  siretInline: 'SIRET 92269564800027',
  nda: '11756755575',
};

const MARGIN = 20;
const NAVY = '#001a4a';
const BLUE = '#002d74';
const TEAL = '#005064';
const GREY = '#6b7a9b';
const INK = '#1a1a2e';
const BORDER = '#d5deee';

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Assembleur du certificat : en-tête/pied de page conformes au modèle. */
class CertWriter {
  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN * 2;
    this.y = 0;
    this.header();
  }

  header() {
    this.y = 22;
    this.doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(NAVY);
    this.doc.text(ORG.name, MARGIN, this.y);
    this.y += 3;
    this.doc.setDrawColor(TEAL).setLineWidth(0.4);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 12;
  }

  ensure(h) {
    if (this.y + h > this.pageHeight - 34) {
      this.doc.addPage();
      this.header();
    }
  }

  title(text) {
    this.doc.setFont('helvetica', 'bold').setFontSize(19).setTextColor(NAVY);
    this.doc.text(text, this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 10;
  }

  subtitle(text) {
    const lines = this.doc.setFont('helvetica', 'bold').setFontSize(11)
      .splitTextToSize(text, this.contentWidth - 10);
    this.doc.setTextColor(BLUE);
    this.doc.text(lines, this.pageWidth / 2, this.y, { align: 'center', lineHeightFactor: 1.4 });
    this.y += lines.length * 5.5 + 6;
  }

  paragraph(text, opts = {}) {
    const size = opts.size ?? 10.5;
    this.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size)
      .setTextColor(opts.color ?? INK);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.ensure(lines.length * size * 0.48 + 4);
    this.doc.text(lines, MARGIN, this.y, { lineHeightFactor: 1.45 });
    this.y += lines.length * size * 0.62 + (opts.gap ?? 5);
  }

  /** Paragraphe avec segments gras au fil du texte (rendu ligne à ligne). */
  richParagraph(segments, opts = {}) {
    const size = opts.size ?? 10.5;
    const lineHeight = size * 0.62;
    // Découpe en mots avec leur style, puis compose les lignes
    const words = [];
    for (const seg of segments) {
      for (const w of seg.text.split(/\s+/)) {
        if (w) words.push({ w, bold: !!seg.bold });
      }
    }
    let line = [];
    let width = 0;
    const flush = () => {
      if (!line.length) return;
      this.ensure(lineHeight + 2);
      let x = MARGIN;
      for (const item of line) {
        this.doc.setFont('helvetica', item.bold ? 'bold' : 'normal').setFontSize(size).setTextColor(INK);
        this.doc.text(item.w, x, this.y);
        x += this.doc.getTextWidth(item.w + ' ');
      }
      this.y += lineHeight;
      line = [];
      width = 0;
    };
    for (const item of words) {
      this.doc.setFont('helvetica', item.bold ? 'bold' : 'normal').setFontSize(size);
      const w = this.doc.getTextWidth(item.w + ' ');
      if (width + w > this.contentWidth && line.length) flush();
      line.push(item);
      width += w;
    }
    flush();
    this.y += opts.gap ?? 5;
  }

  /** Tableau à deux colonnes label/valeur, bordé, comme le modèle. */
  infoTable(rows) {
    const labelW = 62;
    const pad = 3.5;
    for (const [label, value] of rows) {
      const valueLines = this.doc.setFont('helvetica', 'normal').setFontSize(10.5)
        .splitTextToSize(value || '—', this.contentWidth - labelW - pad * 2);
      const rowH = Math.max(11, valueLines.length * 5.2 + 6);
      this.ensure(rowH);
      this.doc.setDrawColor(BORDER).setLineWidth(0.3);
      this.doc.rect(MARGIN, this.y, this.contentWidth, rowH);
      this.doc.line(MARGIN + labelW, this.y, MARGIN + labelW, this.y + rowH);
      this.doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(NAVY);
      this.doc.text(label, MARGIN + pad, this.y + 7);
      this.doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(INK);
      this.doc.text(valueLines, MARGIN + labelW + pad, this.y + 7);
      this.y += rowH;
    }
    this.y += 6;
  }

  /** Tableau Modalité / Heures du modèle (page 2). */
  modalitiesTable(rows) {
    const col2X = MARGIN + this.contentWidth * 0.55;
    const rowH = 9;
    this.ensure(rowH * (rows.length + 1) + 6);
    // En-tête
    this.doc.setFillColor(BLUE);
    this.doc.rect(MARGIN, this.y, this.contentWidth, rowH, 'F');
    this.doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor('#ffffff');
    this.doc.text('Modalité', MARGIN + 3.5, this.y + 6);
    this.doc.text('Heures', col2X + 3.5, this.y + 6);
    this.y += rowH;
    // Lignes
    rows.forEach(([label, hours], i) => {
      const isTotal = i === rows.length - 1;
      if (i % 2 === 0 && !isTotal) {
        this.doc.setFillColor('#f0f3fa');
        this.doc.rect(MARGIN, this.y, this.contentWidth, rowH, 'F');
      }
      if (isTotal) {
        this.doc.setFillColor('#e4ecf7');
        this.doc.rect(MARGIN, this.y, this.contentWidth, rowH, 'F');
      }
      this.doc.setDrawColor(BORDER).setLineWidth(0.2);
      this.doc.rect(MARGIN, this.y, this.contentWidth, rowH);
      this.doc.line(col2X, this.y, col2X, this.y + rowH);
      this.doc.setFont('helvetica', isTotal ? 'bold' : 'normal').setFontSize(10)
        .setTextColor(isTotal ? NAVY : INK);
      this.doc.text(label, MARGIN + 3.5, this.y + 6);
      this.doc.text(hours, col2X + 3.5, this.y + 6);
      this.y += rowH;
    });
    this.y += 7;
  }

  sectionHeading(text) {
    this.ensure(12);
    this.doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(BLUE);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 5.4 + 3;
  }

  bullet(text) {
    const lines = this.doc.setFont('helvetica', 'normal').setFontSize(10)
      .splitTextToSize(text, this.contentWidth - 7);
    this.ensure(lines.length * 5 + 2);
    this.doc.setFont('helvetica', 'bold').setTextColor(TEAL);
    this.doc.text('•', MARGIN + 1.5, this.y);
    this.doc.setFont('helvetica', 'normal').setTextColor(INK);
    this.doc.text(lines, MARGIN + 7, this.y, { lineHeightFactor: 1.4 });
    this.y += lines.length * 5.6 + 2;
  }

  newPage() {
    this.doc.addPage();
    this.header();
  }

  /** Pied de page du modèle sur chaque page (adresse, SIRET/NAF, NDA, n° de page). */
  finish() {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 20;
      this.doc.setDrawColor('#c0d4d8').setLineWidth(0.2);
      this.doc.line(MARGIN, footerY - 4, this.pageWidth - MARGIN, footerY - 4);
      this.doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(GREY);
      this.doc.text(`${ORG.name} - ${ORG.addressFooter}`, this.pageWidth / 2, footerY, { align: 'center' });
      this.doc.text(ORG.siretFooter, this.pageWidth / 2, footerY + 3.5, { align: 'center' });
      this.doc.text(
        `Déclaration d'activité enregistrée sous le numéro ${ORG.nda} auprès du Préfet de Région Île-de-France. `
        + "Cet enregistrement ne vaut pas agrément de l'État",
        this.pageWidth / 2, footerY + 7, { align: 'center', maxWidth: this.contentWidth });
      this.doc.setFont('helvetica', 'bold').setFontSize(9);
      this.doc.text(String(i), this.pageWidth - MARGIN, footerY + 7, { align: 'right' });
    }
    return this.doc;
  }
}

/**
 * Construit le PDF d'un certificat de réalisation à partir des données
 * renvoyées par l'API admin (téléchargement ou visualisation navigateur).
 */
function buildCertificatePdf(certificate) {
  const w = new CertWriter();
  const learner = `${certificate.first_name} ${certificate.last_name}`;

  // ----- Page 1 : attestation ------------------------------------------
  w.y += 4;
  w.title('Certificat de réalisation');
  w.subtitle(
    "Attestation d'assiduité et de présence au stage de formation (Articles R. 6313-3 "
    + 'et R.6332-26 du Code du travail - Décret n°2018-1209 du 21 décembre 2018 - art. 1)',
  );

  w.paragraph(
    `L'organisme de formation ${ORG.name} - ${ORG.siretInline} - enregistré sous le numéro `
    + `NDA N°${ORG.nda} auprès du Préfet de Région d'Île-de-France et représenté par `
    + `${ORG.representative} atteste que :`,
    { gap: 7 },
  );

  const address = [
    [certificate.address_line, certificate.address_complement].filter(Boolean).join(', '),
    [certificate.postal_code, certificate.city].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ');
  const rows = [["Nom et prénom de l'apprenant", learner]];
  if (certificate.company_name) rows.push(["Nom de l'entreprise", certificate.company_name]);
  rows.push(['Adresse postale', address ? `${address}, France` : '—']);
  w.infoTable(rows);

  w.paragraph('A participé à la totalité de la formation suivante, intitulé :', { gap: 2 });
  w.paragraph(certificate.formation_title, { bold: true, size: 11.5, gap: 7 });

  w.richParagraph([
    { text: "Type de l'action concourant au développement des compétences", bold: true },
    { text: " conformément à l'article L6313-1 Alinéa 1 du Code du travail, loi n°2018-771 du 5 septembre 2018 - art.4 : " },
    { text: 'Action de formation.', bold: true },
  ], { gap: 6 });

  const sameDay = certificate.session_start_date === certificate.session_end_date;
  w.paragraph(
    sameDay
      ? `Dates de la formation : le ${formatDateFr(certificate.session_start_date)}`
      : `Dates de la formation : du ${formatDateFr(certificate.session_start_date)} au ${formatDateFr(certificate.session_end_date)}`,
    { gap: 6 },
  );

  w.paragraph(
    'Modalités utilisées (Article L.6313-2 du Code du travail) et durée de formation par modalités :',
    { gap: 4 },
  );

  // ----- Page 2 : modalités, assiduité, évaluation, engagements ---------
  w.newPage();
  const duration = certificate.duration_hours;
  const attended = certificate.attended_hours ?? duration;
  const absences = Math.max(0, duration - attended);
  const hourLabel = (n) => `${n} heure${n > 1 ? 's' : ''}`;
  w.modalitiesTable([
    ['Présentiel', hourLabel(0)],
    ['Distanciel (classe virtuelle)', hourLabel(attended)],
    ['E-learning', hourLabel(0)],
    ['AFEST', hourLabel(0)],
    ['Absences', hourLabel(absences)],
    ['Durée totale', hourLabel(duration)],
  ]);

  // Assiduité réelle (au-delà du modèle : heures réellement suivies)
  const attendanceRate = Math.round((attended / duration) * 100);
  w.sectionHeading('Assiduité');
  w.paragraph(
    `Durée effectivement réalisée par le stagiaire : ${hourLabel(attended)} sur ${duration} `
    + `(assiduité de ${attendanceRate} %), justifiée par les feuilles d'émargement par demi-journée `
    + 'et les rapports de connexion à la classe virtuelle.',
    { gap: 7 },
  );

  // Résultat de l'évaluation des acquis (grille « Évaluation finale – V1.0 »)
  if (certificate.total_score !== null && certificate.total_score !== undefined) {
    w.sectionHeading("Résultat de l'évaluation des acquis");
    w.paragraph(
      `QCM d'évaluation finale : ${certificate.qcm_score} / 10 — Mise en pratique : `
      + `${certificate.practical_score} / 10 — Total : ${certificate.total_score} / 20.`,
      { gap: 3 },
    );
    w.paragraph(
      certificate.objectives_achieved
        ? 'Objectifs de la formation : ATTEINTS (seuil indicatif de 60 % dépassé).'
        : 'Objectifs de la formation : NON ATTEINTS (seuil indicatif de 60 % non atteint).',
      { bold: true, color: certificate.objectives_achieved ? '#116632' : '#a12626', gap: 7 },
    );
  }

  w.sectionHeading(
    "Documents disponibles (sur demande) ayant servi à l'établissement de la présente attestation :",
  );
  w.bullet("Les feuilles d'émargement (états de présence émargés)");
  w.bullet('Les comptes rendus de positionnement et les évaluations qui jalonnent ou terminent la formation');
  w.bullet("Toute autre donnée justifiant la participation effective à l'action de formation");
  w.y += 4;

  w.richParagraph([
    { text: `L'organisme ${ORG.name} s'engage à :`, bold: true },
  ], { gap: 2 });
  w.bullet(
    "Fournir l'ensemble des pièces justificatives permettant de démontrer la réalité de la réalisation. "
    + 'Ces pièces pourront être demandées notamment par le financeur dans le cadre d\'un contrôle.',
  );
  w.bullet(
    "Conserver et fournir ces pièces pendant une durée d'au moins 3 ans à compter de la date de début "
    + `de l'action de formation, soit à compter du ${formatDateFr(certificate.session_start_date)}.`,
  );

  // ----- Page 3 : signature de l'organisme uniquement --------------------
  w.newPage();
  w.y += 6;
  w.paragraph(`Document réalisé et signé le ${formatDateFr(certificate.issued_at)} :`, { gap: 14 });

  const boxW = 80;
  const boxX = w.pageWidth - MARGIN - boxW;
  w.doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(NAVY);
  w.doc.text(`Pour ${ORG.name}`, boxX + boxW / 2, w.y, { align: 'center' });
  w.y += 6;
  w.doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(INK);
  w.doc.text(ORG.representative, boxX + boxW / 2, w.y, { align: 'center' });
  w.y += 4.5;
  w.doc.setFontSize(9).setTextColor(GREY);
  w.doc.text(ORG.representativeRole, boxX + boxW / 2, w.y, { align: 'center' });
  w.y += 6;
  w.doc.setDrawColor(BORDER).setLineWidth(0.3);
  w.doc.rect(boxX, w.y, boxW, 34);
  w.doc.setFontSize(9).setTextColor(GREY);
  w.doc.text('Signature', boxX + 3, w.y + 5.5);

  return w.finish();
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
