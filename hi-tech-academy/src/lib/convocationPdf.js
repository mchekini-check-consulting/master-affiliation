import { jsPDF } from 'jspdf';

// Convocation à une session de formation, générée par apprenant : reprend le
// contenu du modèle historique (public/documents/qualiopi/Convocation.pdf)
// variabilisé avec le nom de l'apprenant, l'intitulé de la formation, les
// dates de session, les horaires des séances et le lien Google Meet. Pas de
// bloc signature : le document se conclut par sa date de réalisation.

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
};

const MARGIN = 18;
const NAVY = '#001a4a';
const TEAL = '#005064';
const GREY = '#6b7a9b';
const INK = '#1a1a2e';
const BORDER = '#d5deee';

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Assembleur de la convocation : en-tête et pied de page au style maison. */
class ConvocationWriter {
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

  header() {
    this.y = 20;
    this.doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(NAVY);
    this.doc.text(ORG.name, MARGIN, this.y);
    this.doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(GREY);
    const orgLines = [
      ORG.legalLine,
      `${ORG.address}, ${ORG.postalCity} — France`,
      ORG.siret,
      `${ORG.email} — ${ORG.phone}`,
    ];
    let oy = this.y + 5.5;
    for (const l of orgLines) {
      this.doc.text(l, MARGIN, oy);
      oy += 4;
    }

    this.y = oy + 4;
    this.doc.setDrawColor(TEAL).setLineWidth(0.5);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 10;

    this.doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(TEAL);
    this.doc.text('Convocation', this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 10;
  }

  sectionHeading(text) {
    this.ensure(10);
    this.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(TEAL);
    this.doc.text(text, MARGIN, this.y);
    this.y += 2;
    this.doc.setDrawColor(BORDER).setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 5;
  }

  paragraph(text, opts = {}) {
    const size = opts.size ?? 9.2;
    this.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size)
      .setTextColor(opts.color ?? INK);
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.ensure(lines.length * size * 0.5 + 3);
    this.doc.text(lines, MARGIN, this.y, { lineHeightFactor: 1.4 });
    this.y += lines.length * size * 0.5 + (opts.gap ?? 3.5);
  }

  bullets(items, opts = {}) {
    const size = opts.size ?? 9.2;
    for (const item of items) {
      this.doc.setFont('helvetica', 'normal').setFontSize(size).setTextColor(INK);
      const lines = this.doc.splitTextToSize(item, this.contentWidth - 6);
      this.ensure(lines.length * size * 0.5 + 2);
      this.doc.text('•', MARGIN + 1, this.y);
      this.doc.text(lines, MARGIN + 6, this.y, { lineHeightFactor: 1.35 });
      this.y += lines.length * size * 0.5 + 1.8;
    }
    this.y += opts.gap ?? 2;
  }

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
        this.pageWidth / 2, footerY + 6.8, { align: 'center', maxWidth: this.contentWidth - 28 });
      this.doc.setFont('helvetica', 'bold').setFontSize(8);
      this.doc.text(`${i}/${pages}`, this.pageWidth - MARGIN, footerY, { align: 'right' });
    }
    return this.doc;
  }
}

/**
 * Construit la convocation. Paramètres : learnerName, formationTitle,
 * startDate / endDate (ISO), scheduleText (une séance par ligne), meetLink.
 */
function buildConvocation({ learnerName, formationTitle, startDate, endDate, scheduleText, meetLink }) {
  const w = new ConvocationWriter();
  w.header();

  w.paragraph(`Bonjour ${learnerName},`);
  w.paragraph('Vous êtes inscrit(e) à la session de formation suivante :');
  w.paragraph(formationTitle, { bold: true, size: 10.5 });
  w.paragraph(
    `Cette formation se déroulera du ${formatDateFr(startDate)} au ${formatDateFr(endDate)}, `
    + 'en classe virtuelle (Google Meet). Le détail des séances est précisé ci-dessous :',
  );
  w.bullets((scheduleText ?? '').split('\n').map((l) => l.trim()).filter(Boolean));
  w.paragraph(`Lien de connexion Google Meet : ${meetLink}`, { bold: true, gap: 6 });

  w.sectionHeading("À l'attention des personnes en situation de handicap (même temporaire) :");
  w.paragraph(
    "En toute confidentialité, notre organisme peut vous offrir des possibilités d'adaptation et/ou de "
    + "compensations spécifiques si elles sont nécessaires à l'amélioration de vos apprentissages sur cette "
    + `formation. En cas de besoin, vous pouvez contacter le référent handicap à l'adresse suivante : ${ORG.email}.`,
    { gap: 6 },
  );

  w.sectionHeading('Aide à la connexion aux outils logiciels :');
  w.paragraph(
    'Dans le cadre de cette formation, vous serez amené(e) à vous connecter à un outil de visioconférence. '
    + 'Le lien de connexion est indiqué ci-dessus, dans le détail des séances de cette convocation.',
  );
  w.paragraph(
    'Il vous suffit de cliquer sur le lien, de renseigner votre prénom, puis de patienter dans la salle '
    + "d'attente le temps que le formateur vous fasse entrer.",
  );
  w.paragraph(
    'Au besoin, contactez votre assistant technique et pédagogique : '
    + `${ORG.representative} — ${ORG.email} — ${ORG.phone}.`,
    { gap: 6 },
  );

  w.sectionHeading('RGPD :');
  w.paragraph(
    'Les informations fournies et saisies dans les documents contractuels de formation seront utilisées '
    + 'uniquement dans le cadre de notre relation commerciale. Par votre retour de documents, vous acceptez '
    + `l'utilisation de vos informations par ${ORG.name} et vous pouvez à tout moment exercer vos droits en lien `
    + 'avec la réglementation RGPD, en adressant un mail individualisé précisant vos attentes à '
    + `${ORG.representative} à l'adresse : ${ORG.email}.`,
    { gap: 6 },
  );

  w.paragraph('En vous remerciant de votre confiance.');
  w.paragraph('Bien cordialement,', { gap: 6 });
  w.paragraph(`Document réalisé le ${formatDateFr(new Date().toISOString())}.`);

  return w;
}

/** Nom du fichier joint, dérivé du nom de l'apprenant. */
export function convocationFileName(learnerName) {
  const safe = learnerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_');
  return `Convocation_${safe}_Hi-Tech_Academy.pdf`;
}

/** Convocation personnalisée en base64 (sans préfixe), prête pour l'envoi en pièce jointe. */
export function convocationPdfBase64(params) {
  const bytes = new Uint8Array(buildConvocation(params).finish().output('arraybuffer'));
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
