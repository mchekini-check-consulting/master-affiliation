import { jsPDF } from 'jspdf';

// Devis et factures avec l'ensemble des mentions légales françaises :
// identification complète du vendeur (forme juridique, capital, RCS, SIRET,
// TVA intracommunautaire, NDA), du client, détail HT / TVA / TTC, conditions
// de paiement (virement 30 jours, pénalités de retard, indemnité de
// recouvrement, pas d'escompte) et bloc « Bon pour accord » pour les devis.
const ORG = {
  name: 'HI-TECH ACADEMY',
  legalLine: 'EURL au capital de 100 € — RCS Paris 922 695 648',
  representative: 'Mahdi CHEKINI',
  address: '73 rue de Reuilly',
  postalCity: '75012 Paris',
  siret: 'SIRET 922 695 648 00027 — NAF 85.59A',
  vat: 'TVA intracommunautaire : FR90922695648',
  nda: '11756755575',
  email: 'contact@hi-techacademy.fr',
  phone: '07 51 47 41 35',
  iban: 'FR76 1695 8000 0190 1841 2175 649',
  bic: 'QNTOFRP1XXX',
};

const MARGIN = 18;
const NAVY = '#001a4a';
const BLUE = '#002d74';
const TEAL = '#005064';
const GREY = '#6b7a9b';
const INK = '#1a1a2e';
const BORDER = '#d5deee';

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Montant en euros à la française. L'espace fine insécable des milliers
// (U+202F) est absente des polices standard de jsPDF (rendue « / ») : on la
// remplace par une espace normale.
function money(n) {
  const formatted = Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted.replace(/[  ]/g, ' ')} €`;
}

function lineTotalHt(line) {
  return Math.round(Number(line.quantity) * Number(line.unit_price_ht) * 100) / 100;
}

/** Assembleur commun aux devis et factures. */
class BillingWriter {
  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN * 2;
    this.y = 0;
  }

  ensure(h) {
    if (this.y + h > this.pageHeight - 30) {
      this.doc.addPage();
      this.y = 24;
    }
  }

  /** En-tête : identité complète de l'organisme à gauche, titre + numéro à droite. */
  header(title, document_) {
    this.y = 20;
    this.doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(NAVY);
    this.doc.text(ORG.name, MARGIN, this.y);
    this.doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(GREY);
    const orgLines = [
      ORG.legalLine,
      `${ORG.address}, ${ORG.postalCity} — France`,
      ORG.siret,
      ORG.vat,
      `Déclaration d'activité n° ${ORG.nda} (préfet de région Île-de-France)`,
      `${ORG.email} — ${ORG.phone}`,
    ];
    let oy = this.y + 5.5;
    for (const l of orgLines) {
      this.doc.text(l, MARGIN, oy);
      oy += 4;
    }

    this.doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(TEAL);
    this.doc.text(title, this.pageWidth - MARGIN, this.y + 2, { align: 'right' });
    this.doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(NAVY);
    this.doc.text(`N° ${document_.number}`, this.pageWidth - MARGIN, this.y + 9, { align: 'right' });
    this.doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(INK);
    const metaLines = [`Date d'émission : ${formatDateFr(document_.issue_date)}`];
    if (document_.type === 'INVOICE') {
      metaLines.push(`Date limite de paiement : ${formatDateFr(document_.due_date)}`);
      if (document_.source_quote_number) metaLines.push(`Suivant devis n° ${document_.source_quote_number}`);
    } else {
      metaLines.push(`Valable jusqu'au : ${formatDateFr(document_.valid_until)}`);
    }
    let my = this.y + 15;
    for (const l of metaLines) {
      this.doc.text(l, this.pageWidth - MARGIN, my, { align: 'right' });
      my += 4.5;
    }

    this.y = Math.max(oy, my) + 4;
    this.doc.setDrawColor(TEAL).setLineWidth(0.5);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 9;
  }

  /** Encadré destinataire (identité et adresse du client). */
  clientBlock(d) {
    const lines = [];
    if (d.client_contact_name && d.client_contact_name !== d.client_name) lines.push(d.client_contact_name);
    lines.push(d.client_address_line);
    lines.push(`${d.client_postal_code} ${d.client_city}${d.client_country && d.client_country !== 'France' ? ` — ${d.client_country}` : ''}`);
    if (d.client_siret) lines.push(`SIRET : ${d.client_siret}`);
    if (d.client_vat_number) lines.push(`TVA intracommunautaire : ${d.client_vat_number}`);

    const boxW = this.contentWidth * 0.52;
    const boxX = this.pageWidth - MARGIN - boxW;
    const boxH = 12 + lines.length * 4.6;
    this.doc.setFillColor('#f0f3fa');
    this.doc.setDrawColor(BORDER).setLineWidth(0.3);
    this.doc.roundedRect(boxX, this.y, boxW, boxH, 1.5, 1.5, 'FD');
    this.doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(GREY);
    this.doc.text('ADRESSÉ À', boxX + 4, this.y + 5);
    this.doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(NAVY);
    this.doc.text(d.client_name, boxX + 4, this.y + 10);
    this.doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(INK);
    let cy = this.y + 14.6;
    for (const l of lines) {
      this.doc.text(String(l), boxX + 4, cy);
      cy += 4.6;
    }
    this.y += boxH + 9;
  }

  /** Période de réalisation de la prestation (mention obligatoire facture). */
  serviceDates(d) {
    if (!d.service_start_date) return;
    const same = !d.service_end_date || d.service_end_date === d.service_start_date;
    const text = same
      ? `Date de réalisation de la prestation : le ${formatDateFr(d.service_start_date)}`
      : `Période de réalisation de la prestation : du ${formatDateFr(d.service_start_date)} au ${formatDateFr(d.service_end_date)}`;
    this.doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(INK);
    this.doc.text(text, MARGIN, this.y);
    this.y += 7;
  }

  /** Tableau des lignes : désignation, quantité, PU HT, TVA, total HT. */
  linesTable(lines) {
    const cols = [
      { label: 'Désignation', w: this.contentWidth * 0.46, align: 'left' },
      { label: 'Qté', w: this.contentWidth * 0.08, align: 'center' },
      { label: 'PU HT', w: this.contentWidth * 0.15, align: 'right' },
      { label: 'TVA', w: this.contentWidth * 0.09, align: 'right' },
      { label: 'Total HT', w: this.contentWidth * 0.22, align: 'right' },
    ];
    const xs = [];
    let x = MARGIN;
    for (const c of cols) { xs.push(x); x += c.w; }
    const cellX = (i) => (cols[i].align === 'left' ? xs[i] + 3 : cols[i].align === 'center' ? xs[i] + cols[i].w / 2 : xs[i] + cols[i].w - 3);

    const headH = 9;
    this.ensure(headH + 12);
    this.doc.setFillColor(BLUE);
    this.doc.rect(MARGIN, this.y, this.contentWidth, headH, 'F');
    this.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor('#ffffff');
    cols.forEach((c, i) => this.doc.text(c.label, cellX(i), this.y + 6, { align: c.align }));
    this.y += headH;

    lines.forEach((line, idx) => {
      const descLines = this.doc.setFont('helvetica', 'normal').setFontSize(9.5)
        .splitTextToSize(line.description, cols[0].w - 6);
      const rowH = Math.max(9, descLines.length * 4.4 + 4.5);
      this.ensure(rowH);
      if (idx % 2 === 0) {
        this.doc.setFillColor('#f7f9fd');
        this.doc.rect(MARGIN, this.y, this.contentWidth, rowH, 'F');
      }
      this.doc.setDrawColor(BORDER).setLineWidth(0.2);
      this.doc.rect(MARGIN, this.y, this.contentWidth, rowH);
      this.doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(INK);
      this.doc.text(descLines, cellX(0), this.y + 6, { lineHeightFactor: 1.35 });
      const qty = Number(line.quantity).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
      this.doc.text(qty, cellX(1), this.y + 6, { align: 'center' });
      this.doc.text(money(line.unit_price_ht), cellX(2), this.y + 6, { align: 'right' });
      this.doc.text(`${Number(line.vat_rate).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`, cellX(3), this.y + 6, { align: 'right' });
      this.doc.text(money(lineTotalHt(line)), cellX(4), this.y + 6, { align: 'right' });
      this.y += rowH;
    });
    this.y += 6;
  }

  /** Bloc des totaux : HT, TVA 20 %, net à payer TTC. */
  totals(d) {
    const boxW = this.contentWidth * 0.42;
    const boxX = this.pageWidth - MARGIN - boxW;
    const rows = [
      ['Total HT', money(d.total_ht), false],
      ['TVA (20 %)', money(d.total_vat), false],
      [d.type === 'INVOICE' ? 'Net à payer TTC' : 'Total TTC', money(d.total_ttc), true],
    ];
    this.ensure(rows.length * 8.5 + 4);
    for (const [label, value, strong] of rows) {
      const rowH = strong ? 10 : 8;
      if (strong) {
        this.doc.setFillColor(TEAL);
        this.doc.rect(boxX, this.y, boxW, rowH, 'F');
      } else {
        this.doc.setDrawColor(BORDER).setLineWidth(0.2);
        this.doc.rect(boxX, this.y, boxW, rowH);
      }
      this.doc.setFont('helvetica', strong ? 'bold' : 'normal').setFontSize(strong ? 11 : 9.5)
        .setTextColor(strong ? '#ffffff' : INK);
      this.doc.text(label, boxX + 4, this.y + (strong ? 6.8 : 5.5));
      this.doc.text(value, boxX + boxW - 4, this.y + (strong ? 6.8 : 5.5), { align: 'right' });
      this.y += rowH;
    }
    this.y += 9;
  }

  sectionHeading(text) {
    this.ensure(12);
    this.doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(BLUE);
    this.doc.text(text, MARGIN, this.y);
    this.y += 5;
  }

  paragraph(text, opts = {}) {
    const size = opts.size ?? 8.8;
    this.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size)
      .setTextColor(opts.color ?? INK);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.ensure(lines.length * size * 0.5 + 3);
    this.doc.text(lines, MARGIN, this.y, { lineHeightFactor: 1.4 });
    this.y += lines.length * size * 0.5 + (opts.gap ?? 3.5);
  }

  /** Pied de page légal sur chaque page. */
  finish() {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 18;
      this.doc.setDrawColor('#c0d4d8').setLineWidth(0.2);
      this.doc.line(MARGIN, footerY - 4, this.pageWidth - MARGIN, footerY - 4);
      this.doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(GREY);
      this.doc.text(
        `${ORG.name} — ${ORG.legalLine} — ${ORG.address}, ${ORG.postalCity}`,
        this.pageWidth / 2, footerY, { align: 'center' });
      this.doc.text(`${ORG.siret} — ${ORG.vat}`, this.pageWidth / 2, footerY + 3.4, { align: 'center' });
      this.doc.text(
        `Déclaration d'activité enregistrée sous le numéro ${ORG.nda} auprès du Préfet de Région Île-de-France. `
        + "Cet enregistrement ne vaut pas agrément de l'État.",
        this.pageWidth / 2, footerY + 6.8, { align: 'center', maxWidth: this.contentWidth });
      this.doc.setFont('helvetica', 'bold').setFontSize(8);
      this.doc.text(`${i}/${pages}`, this.pageWidth - MARGIN, footerY + 6.8, { align: 'right' });
    }
    return this.doc;
  }
}

/** Construit le PDF d'un devis ou d'une facture (données de l'API admin). */
function buildBillingPdf(d) {
  const w = new BillingWriter();
  const isInvoice = d.type === 'INVOICE';
  w.header(isInvoice ? 'FACTURE' : 'DEVIS', d);
  w.clientBlock(d);
  w.serviceDates(d);
  w.linesTable(d.lines);
  w.totals(d);

  if (d.notes) {
    w.sectionHeading('Remarques');
    w.paragraph(d.notes, { size: 9.5, gap: 6 });
  }

  if (isInvoice) {
    if (d.paid_at) {
      w.paragraph(`FACTURE ACQUITTÉE le ${formatDateFr(d.paid_at)}.`, {
        bold: true, size: 10.5, color: '#116632', gap: 6,
      });
    }
    w.sectionHeading('Conditions de règlement');
    w.paragraph(
      `Paiement par virement bancaire sous 30 jours, au plus tard le ${formatDateFr(d.due_date)}.`
      + ` IBAN : ${ORG.iban} — BIC : ${ORG.bic} (titulaire : ${ORG.name}).`,
      { size: 9.5, gap: 4 },
    );
    w.paragraph(
      "Pénalités de retard : en cas de non-paiement à la date d'échéance, des pénalités calculées au taux "
      + "d'intérêt appliqué par la Banque centrale européenne à son opération de refinancement la plus récente, "
      + 'majoré de 10 points de pourcentage, seront exigibles sans qu\'un rappel soit nécessaire (art. L. 441-10 '
      + 'du Code de commerce), ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 € '
      + '(art. D. 441-5 du Code de commerce). Pas d\'escompte pour paiement anticipé.',
      { gap: 4 },
    );
    w.paragraph(
      'TVA acquittée sur les débits. En cas de retard de paiement, l\'organisme se réserve le droit de '
      + 'suspendre les prestations en cours.',
      { gap: 4 },
    );
  } else {
    w.sectionHeading('Conditions du devis');
    w.paragraph(
      "Devis gratuit, valable 30 jours à compter de sa date d'émission, soit jusqu'au "
      + `${formatDateFr(d.valid_until)}. Toute prestation commandée fera l'objet d'une facture payable par `
      + 'virement bancaire sous 30 jours. Pas d\'escompte pour paiement anticipé.',
      { gap: 4 },
    );
    w.paragraph(
      "Pour accepter ce devis, retournez-le daté et signé, précédé de la mention manuscrite « Bon pour accord », "
      + `à ${ORG.email}.`,
      { gap: 8 },
    );

    // Bloc signature « Bon pour accord »
    const boxW = w.contentWidth * 0.48;
    const boxX = w.pageWidth - MARGIN - boxW;
    const boxH = 34;
    w.ensure(boxH);
    w.doc.setDrawColor(BORDER).setLineWidth(0.3);
    w.doc.roundedRect(boxX, w.y, boxW, boxH, 1.5, 1.5);
    w.doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(NAVY);
    w.doc.text('Bon pour accord', boxX + 4, w.y + 6);
    w.doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(GREY);
    w.doc.text('Date :', boxX + 4, w.y + 13);
    w.doc.text('Nom et qualité du signataire :', boxX + 4, w.y + 20);
    w.doc.text('Signature :', boxX + 4, w.y + 27);
    w.y += boxH + 6;
  }

  return w.finish();
}

function billingFileName(d) {
  const label = d.type === 'INVOICE' ? 'Facture' : 'Devis';
  return `${label}_${d.number}_Hi-Tech_Academy.pdf`;
}

/** Télécharge le PDF du devis ou de la facture. */
export function downloadBillingPdf(d) {
  buildBillingPdf(d).save(billingFileName(d));
}

/** URL blob du document, à afficher dans la visionneuse intégrée. */
export function billingPdfBlobUrl(d) {
  return buildBillingPdf(d).output('bloburl');
}

/** Document en base64 (sans préfixe data:), pour un envoi par le serveur. */
export function billingPdfBase64(d) {
  const bytes = new Uint8Array(buildBillingPdf(d).output('arraybuffer'));
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
