import { jsPDF } from 'jspdf';
import { getConventionData } from '@/data/conventionData';

// Convention de formation professionnelle (art. L. 6353-1 et L. 6353-2 du Code
// du travail), fidèle au modèle historique de l'organisme mais sans cadre de
// signature manuscrite : la signature des deux parties est apposée par Yousign
// (signature électronique), le générateur expose les coordonnées exactes des
// champs de signature à transmettre à l'API.
//
// La clause suspensive OPCO (article dédié) n'apparaît que si la convention est
// déclarée finançable : accord de prise en charge attendu, date butoir, et sort
// de la convention en cas de prise en charge partielle (reliquat au client ou
// caducité) — un choix ferme est exigé à la création, pas de zone grise.

const ORG = {
  name: 'HI-TECH ACADEMY',
  legalLine: 'EURL au capital de 100 € — RCS Paris 922 695 648',
  representative: 'Mahdi CHEKINI',
  representativeRole: 'Gérant',
  address: '73 rue de Reuilly',
  postalCity: '75012 Paris',
  siret: 'SIRET 922 695 648 00027 — NAF 85.59A',
  siretRaw: '922 695 648 00027',
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

// jsPDF travaille en millimètres, Yousign attend des pixels à 72 dpi (points
// PDF, origine en haut à gauche) : 1 mm = 72 / 25,4 pt.
const MM_TO_PT = 72 / 25.4;

function formatDateFr(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function money(n) {
  const formatted = Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Les espaces insécables (fines ou non) des milliers sont absentes des
  // polices standard de jsPDF : remplacées par une espace normale.
  return `${formatted.replace(/[  \s]/g, ' ')} €`;
}

/** Assembleur de la convention : articles numérotés dynamiquement. */
class ConventionWriter {
  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN * 2;
    this.y = 0;
    this.articleIndex = 0;
    this.signatureFields = [];
  }

  ensure(h) {
    if (this.y + h > this.pageHeight - 30) {
      this.doc.addPage();
      this.y = 24;
    }
  }

  header(c) {
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

    this.doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(NAVY);
    this.doc.text(`N° ${c.number}`, this.pageWidth - MARGIN, this.y + 2, { align: 'right' });
    this.doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(INK);
    this.doc.text(`Émise le ${formatDateFr(c.issue_date)}`, this.pageWidth - MARGIN, this.y + 8, { align: 'right' });

    this.y = oy + 4;
    this.doc.setDrawColor(TEAL).setLineWidth(0.5);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 10;

    this.doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(TEAL);
    this.doc.text('Convention de formation professionnelle', this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 6;
    this.doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(GREY);
    this.doc.text('(Articles L. 6353-1 et L. 6353-2 du Code du travail)', this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 10;
  }

  articleHeading(title) {
    this.articleIndex += 1;
    this.ensure(14);
    this.doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(TEAL);
    this.doc.text(`Article ${this.articleIndex} : ${title}`, MARGIN, this.y);
    this.y += 2;
    this.doc.setDrawColor(BORDER).setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 5;
  }

  subHeading(text) {
    this.ensure(8);
    this.doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(NAVY);
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

  bullets(items, opts = {}) {
    const size = opts.size ?? 8.8;
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

  /**
   * Zone de signature des deux parties : deux encadrés nominatifs, sans trait
   * ni mention « Signature » — Yousign apposera la signature électronique dans
   * chaque encadré, aux coordonnées retournées par `signatureFields`.
   */
  signatureZone(c) {
    const boxH = 42;
    const gap = 8;
    const boxW = (this.contentWidth - gap) / 2;
    // Zone insécable : si elle ne tient pas, elle part entière en page suivante.
    this.ensure(boxH + 18);

    this.doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(INK);
    this.doc.text(`Document établi le ${formatDateFr(c.issue_date)}, en deux exemplaires signés électroniquement.`, MARGIN, this.y);
    this.y += 7;

    const top = this.y;
    const boxes = [
      { signer: 'ORGANIZATION', x: MARGIN, title: `Pour ${ORG.name}`, name: `${ORG.representative}, ${ORG.representativeRole}` },
      { signer: 'CLIENT', x: MARGIN + boxW + gap, title: `Pour ${c.client_name}`, name: c.client_representative_name || '' },
    ];
    for (const box of boxes) {
      this.doc.setDrawColor(BORDER).setLineWidth(0.3);
      this.doc.roundedRect(box.x, top, boxW, boxH, 1.5, 1.5);
      this.doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(NAVY);
      this.doc.text(box.title, box.x + 4, top + 6, { maxWidth: boxW - 8 });
      this.doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(GREY);
      if (box.name) this.doc.text(box.name, box.x + 4, top + 11, { maxWidth: boxW - 8 });

      // Champ Yousign : à l'intérieur de l'encadré, sous l'identité.
      const fieldXMm = box.x + 5;
      const fieldYMm = top + 14;
      this.signatureFields.push({
        signer: box.signer,
        page: this.doc.getNumberOfPages(),
        x: Math.round(fieldXMm * MM_TO_PT),
        y: Math.round(fieldYMm * MM_TO_PT),
        width: Math.round((boxW - 10) * MM_TO_PT),
        height: Math.round((boxH - 17) * MM_TO_PT),
      });
    }
    this.y = top + boxH + 8;
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

/** Paragraphe d'identification du client (société ou particulier). */
function clientIdentityText(c) {
  const address = `${c.client_address_line} - ${c.client_postal_code} ${c.client_city}`;
  if (c.client_siret) {
    const rep = c.client_representative_name ? ` Représentée par ${c.client_representative_name},` : '';
    return `La société ${c.client_name} située ${address} - SIRET ${c.client_siret}.${rep} ci-après dénommée « le Signataire ».`;
  }
  return `${c.client_name}, demeurant ${address}, ci-après dénommé(e) « le Signataire ».`;
}

/**
 * Construit la convention. `c` est l'enregistrement de l'API admin (snake_case) :
 * number, issue_date, formation_id, formation_title, client_*, participants
 * (tableau de noms), session_start_date, session_end_date, schedule_text,
 * price_ht, price_ttc, opco_funded, opco_name, opco_deadline, opco_partial_mode.
 */
function buildConvention(c) {
  const data = getConventionData(c.formation_id);
  if (!data) throw new Error(`Pas de contenu de convention pour la formation « ${c.formation_id} »`);

  const w = new ConventionWriter();
  w.header(c);

  // --- Parties -----------------------------------------------------------
  w.subHeading('Entre les soussignés :');
  w.paragraph(
    `L'organisme de formation ${ORG.name}, ${ORG.legalLine}, situé ${ORG.address} - ${ORG.postalCity} - `
    + `SIRET ${ORG.siretRaw} - Déclaration d'activité enregistrée sous le N° ${ORG.nda} auprès du Préfet de `
    + `Région d'Île-de-France, représenté par ${ORG.representative}, ${ORG.representativeRole}, ci-après dénommé `
    + `« l'organisme de formation ». Cet enregistrement ne vaut pas agrément de l'État.`,
  );
  w.subHeading('Et :');
  w.paragraph(clientIdentityText(c));
  w.paragraph(
    'Il est conclu une convention de formation professionnelle conformément aux dispositions des articles '
    + 'L. 6311-1 à L. 6363-2 du Code du travail, et en application des dispositions du Livre III de la '
    + "sixième partie et des catégories prévues à l'article L. 6313-1 du Code du travail relatif à la "
    + 'formation professionnelle continue tout au long de la vie.',
    { gap: 6 },
  );

  // --- Article 1 : objet --------------------------------------------------
  w.articleHeading('OBJET DE LA CONVENTION');
  w.paragraph("En exécution de la présente convention, l'organisme s'engage à organiser l'action de formation suivante :");
  w.paragraph(c.formation_title, { bold: true, size: 10 });
  w.paragraph(
    "L'action de formation professionnelle entre dans l'une des catégories prévues aux articles L. 6313-1 à "
    + 'L. 6313-11 du Code du travail : préformation, adaptation, promotion, prévention, conversion, acquisition, '
    + 'entretien ou perfectionnement des compétences.',
  );
  w.paragraph(data.categorieAction);
  w.paragraph(
    "En application de l'article L. 6353-1 du Code du travail, l'action est réalisée conformément à un programme "
    + "préétabli qui précise les moyens pédagogiques, techniques et d'encadrement mis en œuvre ainsi que les moyens "
    + "permettant de suivre son exécution et d'en apprécier les résultats.",
  );
  w.subHeading("OBJECTIF PROFESSIONNEL VISÉ À L'ISSUE DE LA FORMATION :");
  w.bullets(data.objectifs);
  w.subHeading('CONTENU :');
  w.paragraph(
    "Le contenu de l'action de formation et les moyens prévus : la description détaillée du programme de formation "
    + 'est fournie en pièce jointe.',
  );
  w.paragraph(data.contenu);
  w.subHeading('NATURE ET LOGISTIQUE :');
  w.paragraph(data.nature);
  w.paragraph(`Durée : ${data.dureeLabel}.`);
  w.paragraph(`Période de réalisation : du ${formatDateFr(c.session_start_date)} au ${formatDateFr(c.session_end_date)}.`);
  w.subHeading('Prérequis des apprenants :');
  w.bullets(data.prerequis);
  if (c.schedule_text) {
    w.subHeading('Planning des séances provisoires :');
    w.bullets(c.schedule_text.split('\n').map((l) => l.trim()).filter(Boolean));
  }
  w.subHeading('INDICATEURS DE RÉSULTATS :');
  if (c.satisfaction_rate != null || c.recommendation_rate != null) {
    // Indicateurs globaux de l'organisme (admis par Qualiopi à condition de les
    // libeller comme tels et de citer la base de mesure).
    const rate = (n) => `${Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
    const parts = [];
    if (c.satisfaction_rate != null) parts.push(`Taux de satisfaction : ${rate(c.satisfaction_rate)}`);
    if (c.recommendation_rate != null) parts.push(`Taux de recommandation : ${rate(c.recommendation_rate)}`);
    const basis = c.indicators_basis || "indicateurs globaux de l'organisme, toutes formations confondues";
    w.paragraph(`${parts.join(' — ')} (${basis}).`, { gap: 6 });
  } else {
    w.paragraph(
      'Hi-Tech Academy est nouvel entrant pour cette action de formation : les indicateurs (taux de satisfaction, '
      + "taux de recommandation) seront disponibles à l'issue de la première session.",
      { gap: 6 },
    );
  }

  // --- Article 2 : effectif formé ----------------------------------------
  w.articleHeading('EFFECTIF FORMÉ');
  w.paragraph(`Public visé au sens de l'article L. 6313-3 du Code du travail : ${data.publicVise}`);
  w.paragraph(
    `La formation sera assurée par ${ORG.representative} (${ORG.email} - ${ORG.phone.replace(/ /g, '')}), `
    + "consultant et formateur spécialisé dans l'IT.",
  );
  w.paragraph(`Responsable pédagogique : ${ORG.representative} (${ORG.email}).`, { gap: 6 });

  // --- Article 3 : engagements de participation ---------------------------
  w.articleHeading('ENGAGEMENTS DE PARTICIPATION');
  w.paragraph(
    "Le Signataire s'engage à assurer la présence des participants aux dates, lieux et heures prévus ci-dessus "
    + "et selon les modalités d'organisation de l'action de formation convenues avec le Signataire. Les "
    + "participants sont ceux indiqués sur la liste d'émargement. Il s'agit de :",
  );
  w.bullets((c.participants ?? []).length ? c.participants : ["(participants à confirmer à l'inscription)"]);
  w.subHeading("À L'ATTENTION DES PERSONNES AYANT BESOIN D'UNE ADAPTATION SPÉCIFIQUE POUR LEUR FORMATION :");
  w.paragraph(
    "Notre organisme peut vous offrir des possibilités d'adaptation et/ou de compensation spécifiques si elles "
    + "sont nécessaires à l'amélioration de vos apprentissages. Si vous rencontrez une quelconque difficulté ou "
    + 'si vous êtes en situation de handicap, même temporaire ou partiel, nous vous remercions de contacter '
    + `directement ${ORG.representative} à l'adresse ${ORG.email}, ou de nous le spécifier par retour du `
    + "questionnaire de positionnement ou tout autre moyen à disposition, avant l'arrivée en formation.",
    { gap: 6 },
  );

  // --- Article 4 : dispositions financières -------------------------------
  w.articleHeading('DISPOSITIONS FINANCIÈRES ET PRIX DE LA FORMATION');
  w.paragraph(
    "En contrepartie de cette action de formation, le Signataire (ou le financeur dans le cadre d'une subrogation "
    + "de paiement) s'acquittera des coûts suivants, qui couvrent l'intégralité des frais engagés par l'organisme "
    + "de formation pour cette session (analyse du besoin, conception et animation de la session, réalisation des "
    + "fiches d'évaluation et synthèse) :",
  );
  w.paragraph(`${money(c.price_ht)} HT, soit ${money(c.price_ttc)} TTC (TVA 20 %).`, { bold: true, size: 10 });
  w.paragraph(
    "Les conditions de paiement : la facture est émise et adressée par l'organisme de formation au Signataire. "
    + "Le règlement de l'intégralité du prix est dû par le Signataire dans un délai de trente (30) jours à compter "
    + "de la date d'émission de la facture.",
    { gap: 6 },
  );

  // --- Article conditionnel : condition suspensive OPCO -------------------
  if (c.opco_funded) {
    w.articleHeading("CONDITION SUSPENSIVE — PRISE EN CHARGE PAR L'OPCO");
    w.paragraph(
      `La présente convention est conclue sous condition suspensive de l'obtention d'un accord de prise en charge `
      + `de ${c.opco_name} pour l'action décrite à l'article 1.`,
    );
    w.paragraph(
      `Si l'accord de prise en charge n'est pas obtenu au plus tard le ${formatDateFr(c.opco_deadline)}, et en tout `
      + "état de cause avant la date de début de la formation, la convention sera caduque de plein droit, sans "
      + "indemnité de part et d'autre.",
    );
    if (c.opco_partial_mode === 'CLIENT_PAYS_REMAINDER') {
      w.paragraph(
        `En cas de prise en charge partielle de ${c.opco_name}, le Signataire s'engage à régler à l'organisme de `
        + "formation le reliquat restant à sa charge, selon les conditions de paiement prévues à l'article 4.",
        { gap: 6 },
      );
    } else {
      w.paragraph(
        `En cas de prise en charge partielle de ${c.opco_name}, la condition suspensive sera réputée non réalisée `
        + "et la présente convention sera caduque de plein droit, sans indemnité de part et d'autre.",
        { gap: 6 },
      );
    }
  }

  // --- Articles communs ----------------------------------------------------
  w.articleHeading('MOYENS PÉDAGOGIQUES ET TECHNIQUES MIS EN ŒUVRE');
  w.bullets(data.moyensPedagogiques, { gap: 4 });

  w.articleHeading("MOYENS PERMETTANT DE SUIVRE L'EXÉCUTION DE L'ACTION");
  w.bullets(data.suiviExecution, { gap: 4 });

  w.articleHeading("MOYENS PERMETTANT D'APPRÉCIER LES RÉSULTATS DE L'ACTION");
  w.bullets(data.appreciationResultats, { gap: 4 });

  w.articleHeading('SANCTION DE LA FORMATION');
  w.paragraph(
    "Un certificat de réalisation mentionnant les objectifs, la nature et la durée de l'action sera remis au(x) "
    + "apprenant(s) et à l'employeur financeur à l'issue de la formation.",
    { gap: 6 },
  );

  w.articleHeading('APPLICATION DU RGPD');
  w.paragraph(
    'Les informations fournies et saisies dans les documents contractuels de formation échangés entre nos deux '
    + 'structures sont utilisées uniquement dans le cadre de notre relation commerciale. Par votre retour de '
    + `documents, vous acceptez l'utilisation de vos informations exclusivement par ${ORG.name} le temps de la `
    + 'formation et de son traitement amont et aval. Vous pouvez à tout moment exercer vos droits en lien avec la '
    + `réglementation RGPD en adressant un mail individualisé au référent RGPD précisant vos attentes : ${ORG.email}.`,
    { gap: 6 },
  );

  w.articleHeading('ENGAGEMENT QUALITÉ');
  w.paragraph(
    "L'organisme prestataire d'actions de développement des compétences satisfait aux exigences du décret "
    + 'n° 2019-564 du 6 juin 2019 relatif à la qualité des actions de la formation professionnelle. Toutes les '
    + `actions de formation dispensées par ${ORG.name} font l'objet d'une convention de formation signée des deux `
    + 'parties qui comporte les conditions de vente. Tout document contractuel est accompagné du programme de '
    + 'formation détaillé et du règlement intérieur de la formation.',
    { gap: 6 },
  );

  w.articleHeading('TRAITEMENT DES ÉVENTUELLES RÉCLAMATIONS');
  w.paragraph(
    "Une feuille d'appréciation individuelle sur la session de formation est renseignée par chaque participant à "
    + "l'issue de l'action. Afin de répondre individuellement à une éventuelle réclamation, l'entreprise ou le "
    + 'stagiaire veillera à indiquer son nom et son entreprise. Toute réclamation doit être adressée par mail à : '
    + `${ORG.email}. Une réponse sera adressée à l'entreprise ou au stagiaire dans un délai d'un mois maximum. En `
    + "cas d'anonymat de la personne stagiaire, la réponse sera adressée directement à son entreprise.",
    { gap: 6 },
  );

  w.articleHeading('EN CAS DE NON-RÉALISATION DE LA PRESTATION DE FORMATION');
  w.paragraph(
    "En application de l'article L. 6354-1 du Code du travail, il est convenu entre les signataires de la présente "
    + "convention que, faute de réalisation totale ou partielle de la prestation de formation, l'organisme "
    + 'prestataire doit rembourser au cocontractant les sommes indûment perçues de ce fait.',
    { gap: 6 },
  );

  w.articleHeading('DÉDOMMAGEMENT, RÉPARATION OU DÉDIT');
  w.paragraph("En cas de renoncement par l'entreprise bénéficiaire avant le début du programme de formation :");
  w.bullets([
    'dans un délai supérieur à 1 mois avant le début de la formation : 50 % du coût de la formation est dû ;',
    '2 semaines avant le début de la formation : 75 % du coût de la formation est dû ;',
    'dans un délai inférieur à 48 h avant le début de la formation : 100 % du coût de la formation est dû.',
  ]);
  w.paragraph(
    "Les montants versés à ce titre ne sont pas imputables sur l'obligation de l'employeur et ne peuvent faire "
    + "l'objet d'une demande de prise en charge par un OPCO ou un FAF.",
    { gap: 6 },
  );

  w.articleHeading('EN CAS DE DIFFÉRENDS POTENTIELS');
  w.paragraph(
    "Si une contestation ou un différend ne peuvent être réglés à l'amiable, le Tribunal de Commerce de Paris "
    + 'sera seul compétent pour régler ce litige commercial.',
    { gap: 8 },
  );

  // --- Signatures (Yousign) ----------------------------------------------
  w.signatureZone(c);

  return w;
}

export function conventionFileName(c) {
  return `Convention_${c.number}_Hi-Tech_Academy.pdf`;
}

/** Télécharge le PDF de la convention (version non signée). */
export function downloadConventionPdf(c) {
  buildConvention(c).finish().save(conventionFileName(c));
}

/** URL blob de la convention, pour la visionneuse intégrée. */
export function conventionPdfBlobUrl(c) {
  return buildConvention(c).finish().output('bloburl');
}

/**
 * Convention en base64 (sans préfixe) + coordonnées des champs de signature
 * Yousign (origine en haut à gauche, points PDF 72 dpi) : ce que l'admin envoie
 * au back pour créer la demande de signature.
 */
export function conventionPdfForSignature(c) {
  const w = buildConvention(c);
  const bytes = new Uint8Array(w.finish().output('arraybuffer'));
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return { pdfBase64: btoa(binary), signatureFields: w.signatureFields };
}
