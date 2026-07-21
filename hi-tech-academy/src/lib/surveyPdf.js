import { jsPDF } from 'jspdf';

// Export PDF des questionnaires remplis (analyse du besoin, test de
// positionnement), au format des documents Qualiopi de l'organisme.

const ORG = {
  name: 'HI-TECH ACADEMY',
  address: '73 rue de Reuilly, 75012 Paris',
  siret: 'SIRET 922 695 648 00027',
  nda: "Déclaration d'activité n° 11756755575 (préfet de région d'Île-de-France)",
  contact: '07 51 47 41 35 – contact@hi-techacademy.fr',
};

const MARGIN = 20;
const FOOTER_RESERVE = 26;

function formatDateFr(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** Petit assembleur : gère le curseur vertical et les sauts de page. */
class PdfWriter {
  constructor(title, subtitle) {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN * 2;
    this.y = 24;

    // En-tête organisme
    this.doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor('#001a4a');
    this.doc.text(ORG.name, MARGIN, this.y);
    const nameWidth = this.doc.getTextWidth(ORG.name);
    this.doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor('#6b7a9b');
    this.doc.text('Organisme de formation', MARGIN + nameWidth + 4, this.y);
    this.y += 3;
    this.doc.setDrawColor('#005064').setLineWidth(0.4);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);

    // Titre du document
    this.y += 14;
    this.doc.setFont('helvetica', 'bold').setFontSize(17).setTextColor('#001a4a');
    this.doc.text(title, this.pageWidth / 2, this.y, { align: 'center' });
    if (subtitle) {
      this.y += 7;
      this.doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor('#005064');
      this.doc.text(subtitle, this.pageWidth / 2, this.y, { align: 'center' });
    }
    this.y += 10;
  }

  ensure(height) {
    if (this.y + height > this.pageHeight - FOOTER_RESERVE) {
      this.doc.addPage();
      this.y = 22;
    }
  }

  meta(text) {
    this.ensure(7);
    this.doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor('#6b7a9b');
    this.doc.text(text, MARGIN, this.y);
    this.y += 6;
  }

  score(text) {
    this.ensure(12);
    this.doc.setFillColor('#f0f3fa');
    const width = this.doc.getTextWidth(text) + 12;
    this.doc.roundedRect(MARGIN, this.y - 5.5, Math.max(width, 60), 9, 2, 2, 'F');
    this.doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor('#005064');
    this.doc.text(text, MARGIN + 5, this.y);
    this.y += 10;
  }

  section(title) {
    this.ensure(14);
    this.y += 4;
    this.doc.setFont('helvetica', 'bold').setFontSize(11.5).setTextColor('#002d74');
    this.doc.text(title, MARGIN, this.y);
    this.y += 2;
    this.doc.setDrawColor('#c0d4d8').setLineWidth(0.25);
    this.doc.line(MARGIN, this.y, this.pageWidth - MARGIN, this.y);
    this.y += 6;
  }

  qa(question, answer) {
    const questionLines = this.doc.setFont('helvetica', 'bold').setFontSize(9.5)
      .splitTextToSize(question, this.contentWidth);
    const value = answer === true ? 'Oui' : answer === false ? 'Non'
      : answer === null || answer === undefined || answer === '' ? 'Non renseigné' : String(answer);
    const answerLines = this.doc.setFont('helvetica', 'normal').setFontSize(10)
      .splitTextToSize(value, this.contentWidth - 4);
    this.ensure(questionLines.length * 4.4 + answerLines.length * 4.8 + 5);

    this.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor('#6b7a9b');
    this.doc.text(questionLines, MARGIN, this.y);
    this.y += questionLines.length * 4.4 + 1;
    this.doc.setFont('helvetica', 'normal').setFontSize(10)
      .setTextColor(value === 'Non renseigné' ? '#a3aec7' : '#1a1a2e');
    this.doc.text(answerLines, MARGIN + 4, this.y);
    this.y += answerLines.length * 4.8 + 4;
  }

  /** Note libre (petit texte gris, multi-lignes) en bas de section. */
  note(text) {
    const lines = this.doc.setFont('helvetica', 'italic').setFontSize(8.5)
      .splitTextToSize(text, this.contentWidth);
    this.ensure(lines.length * 4 + 4);
    this.y += 2;
    this.doc.setFont('helvetica', 'italic').setFontSize(8.5).setTextColor('#6b7a9b');
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 4 + 2;
  }

  /** Question de QCM avec seulement la bonne réponse (corrigé générique). */
  qcmAnswerKey(item) {
    const questionLines = this.doc.setFont('helvetica', 'bold').setFontSize(9.5)
      .splitTextToSize(`${item.id}. ${item.question}`, this.contentWidth);
    const answer = `Bonne réponse : ${item.options[item.correct_index]}`;
    const answerLines = this.doc.setFont('helvetica', 'normal').setFontSize(10)
      .splitTextToSize(answer, this.contentWidth - 4);
    this.ensure(questionLines.length * 4.4 + answerLines.length * 4.8 + 6);

    this.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor('#001a4a');
    this.doc.text(questionLines, MARGIN, this.y);
    this.y += questionLines.length * 4.4 + 1;
    this.doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor('#116632');
    this.doc.text(answerLines, MARGIN + 4, this.y);
    this.y += answerLines.length * 4.8 + 5.4;
  }

  /** Question de QCM corrigée : réponse choisie + bonne réponse si ratée. */
  qcm(item) {
    const questionLines = this.doc.setFont('helvetica', 'bold').setFontSize(9.5)
      .splitTextToSize(`${item.id}. ${item.question}`, this.contentWidth);
    const chosen = item.chosen_index !== null && item.chosen_index !== undefined
      ? item.options[item.chosen_index] : 'Non renseigné';
    const lines = [`Réponse : ${chosen} ${item.correct ? '(bonne réponse)' : '(mauvaise réponse)'}`];
    if (!item.correct) {
      lines.push(`Bonne réponse attendue : ${item.options[item.correct_index]}`);
    }
    this.ensure(questionLines.length * 4.4 + lines.length * 4.8 + 6);

    this.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor('#001a4a');
    this.doc.text(questionLines, MARGIN, this.y);
    this.y += questionLines.length * 4.4 + 1;
    this.doc.setFont('helvetica', 'normal').setFontSize(10)
      .setTextColor(item.correct ? '#116632' : '#a12626');
    this.doc.text(lines[0], MARGIN + 4, this.y);
    if (lines[1]) {
      this.y += 4.8;
      this.doc.setTextColor('#116632');
      this.doc.text(lines[1], MARGIN + 4, this.y);
    }
    this.y += 5.4;
  }

  // Pied de page organisme sur chaque page
  stampFooters() {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 16;
      this.doc.setDrawColor('#c0d4d8').setLineWidth(0.2);
      this.doc.line(MARGIN, footerY - 5, this.pageWidth - MARGIN, footerY - 5);
      this.doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor('#6b7a9b');
      this.doc.text(`${ORG.name} – ${ORG.address} – ${ORG.siret}`, this.pageWidth / 2, footerY - 1, { align: 'center' });
      this.doc.text(`${ORG.nda} – ${ORG.contact}`, this.pageWidth / 2, footerY + 2.5, { align: 'center' });
      this.doc.text(`Page ${i}/${pages}`, this.pageWidth - MARGIN, footerY + 2.5, { align: 'right' });
    }
  }

  finish(fileName) {
    this.stampFooters();
    this.doc.save(fileName);
  }

  /** Rend le document en base64 (sans le préfixe data:), pour un envoi serveur. */
  toBase64() {
    this.stampFooters();
    // Conversion déterministe (identique en navigateur et en Node), plus fiable
    // que le parsing de output('datauristring') qui diffère selon le build jsPDF.
    const bytes = new Uint8Array(this.doc.output('arraybuffer'));
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }
}

function safeFileName(parts) {
  return parts.join('_').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_') + '.pdf';
}

const LEVEL_LABELS = [
  ['Linux (ligne de commande)', 'level_linux'],
  ['Docker / conteneurs', 'level_docker'],
  ['Kubernetes', 'level_kubernetes'],
];

/**
 * Exporte une analyse du besoin remplie. `subject` : { name, context (ex.
 * entreprise), formationTitle } ; `na` : la vue needs_analysis de l'API
 * (demandeur) ou l'objet trainee (salarié — mêmes champs de réponses).
 */
export function exportNeedsAnalysisPdf(na, subject) {
  const w = new PdfWriter('ANALYSE DU BESOIN', subject.formationTitle);
  w.meta(`Bénéficiaire : ${subject.name}${subject.context ? ` — ${subject.context}` : ''}`);
  w.meta(`Répondu le : ${formatDateFr(na.submitted_at)}`);
  w.score(`Note de positionnement : ${na.score} / ${na.max_score}`);

  w.section('1. Identité');
  w.qa('Nom et prénom du bénéficiaire', na.beneficiary_name ?? subject.name);
  if (na.company_role !== undefined) w.qa('Entreprise / fonction', na.company_role);
  if (na.email) w.qa('Adresse email', na.email);
  if (na.job_title !== undefined) w.qa('Poste occupé', na.job_title);
  if (na.funder !== undefined) w.qa('Financeur envisagé (OPCO Atlas / AGEFICE / autre)', na.funder);

  w.section('2. Contexte et besoin');
  w.qa('Activité et environnement technique actuel', na.activity_context);
  w.qa('Besoin / problème que la formation doit aider à résoudre', na.problem_to_solve);
  w.qa("Objectifs attendus à l'issue de la formation", na.expected_objectives);

  w.section('3. Niveau de départ (auto-évaluation)');
  for (const [label, key] of LEVEL_LABELS) {
    w.qa(label, na[key]);
  }

  w.section('4. Attentes et besoins spécifiques');
  w.qa("Cas d'usage précis à traiter pendant la formation", na.specific_use_case);
  w.qa('Situation de handicap nécessitant un aménagement', na.needs_adaptation);
  if (na.needs_adaptation) {
    w.qa("Besoins d'aménagement précisés", na.adaptation_details);
  }

  w.section('5. Contraintes');
  w.qa('Contraintes de planning', na.planning_constraints);

  w.finish(safeFileName(['Analyse_du_besoin', subject.name]));
}

/**
 * Exporte le questionnaire des attentes du commanditaire (rempli par le
 * représentant de l'entreprise qui inscrit ses salariés). `s` : la vue
 * sponsor_survey de l'API ; `subject` : { company, formationTitle }.
 */
export function exportSponsorSurveyPdf(s, subject) {
  const w = new PdfWriter("ANALYSE DU BESOIN — COMMANDITAIRE", subject.formationTitle);
  w.meta(`Entreprise : ${subject.company}`);
  w.meta(`Répondu le : ${formatDateFr(s.submitted_at)}`);

  w.section('1. Le projet de formation');
  w.qa("Contexte et objectif de la formation pour l'entreprise", s.training_reason);
  w.qa('Comment le besoin de formation a été identifié', s.need_origin);
  w.qa('Nombre de salariés concernés', s.trainee_count);
  w.qa('Profils / fonctions des salariés à former', s.trainee_profiles);

  w.section("2. Les attentes de l'entreprise");
  w.qa("Compétences attendues à l'issue de la formation", s.expected_skills);
  w.qa("Critères de réussite pour l'entreprise", s.success_criteria);
  w.qa("Projet concret d'application des acquis", s.application_project);

  w.section('3. Organisation et financement');
  w.qa("Contraintes de planning ou d'organisation", s.planning_constraints);
  w.qa('Mode de financement envisagé', s.funding);
  w.qa('Salarié(s) en situation de handicap nécessitant un aménagement', s.needs_adaptation);
  if (s.needs_adaptation) {
    w.qa("Besoins d'aménagement précisés", s.adaptation_details);
  }
  w.qa('Autres remarques ou attentes', s.comments);

  w.finish(safeFileName(['Analyse_du_besoin_commanditaire', subject.company]));
}

/** Exporte un test de positionnement passé (vue positioning_test de l'API). */
export function exportPositioningTestPdf(test, subject) {
  const w = new PdfWriter('TEST DE POSITIONNEMENT', subject.formationTitle);
  w.meta(`Apprenant : ${subject.name}${subject.context ? ` — ${subject.context}` : ''}`);
  w.meta(`Passé le : ${formatDateFr(test.submitted_at)}`);
  w.score(`Note : ${test.score} / ${test.max_score} (test non éliminatoire)`);

  w.section('A. Auto-évaluation');
  w.qa('Maîtrise actuelle de Kubernetes (déclarée)', test.self_level);

  // Questions groupées par section du catalogue (Prérequis Linux / Docker)
  const sections = test.questions.reduce((acc, q) => {
    (acc[q.section] = acc[q.section] ?? []).push(q);
    return acc;
  }, {});
  let letter = 'B'.charCodeAt(0);
  for (const [sectionTitle, questions] of Object.entries(sections)) {
    w.section(`${String.fromCharCode(letter)}. ${sectionTitle}`);
    letter += 1;
    for (const q of questions) {
      w.qcm(q);
    }
  }

  w.section('D. Connaissances Kubernetes (facultatif)');
  w.qa('Selon vous, à quoi sert Kubernetes ?', test.kubernetes_purpose);
  w.qa('Termes connus', test.known_terms?.length ? test.known_terms.join(', ') : null);

  w.section('E. Attentes');
  w.qa("Cas d'usage ou objectif précis pour cette formation", test.expectations);

  w.finish(safeFileName(['Test_de_positionnement', subject.name]));
}

/**
 * Exporte une évaluation finale passée (vue final_evaluation de l'API).
 * `subject` : { name, formationTitle }.
 */
export function exportFinalEvaluationPdf(evaluation, subject) {
  const w = new PdfWriter('ÉVALUATION FINALE', subject.formationTitle);
  w.meta(`Apprenant : ${subject.name}`);
  w.meta(`Passée le : ${formatDateFr(evaluation.submitted_at)}`);
  w.score(`Note au QCM : ${evaluation.score} / ${evaluation.max_score}`);

  w.section(`Partie A — QCM (${evaluation.questions.length} questions)`);
  for (const q of evaluation.questions) {
    w.qcm(q);
  }

  w.note(
    "Partie B (mise en pratique sur AKS) évaluée par le formateur pendant la session ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
  );

  w.finish(safeFileName(['Evaluation_finale', subject.name]));
}

/**
 * Construit le corrigé générique du QCM d'évaluation finale (questions +
 * bonnes réponses attendues, sans les réponses individuelles). Renvoie le
 * PDF en base64 pour un envoi serveur. `subject` : { formationTitle }.
 */
export function buildFinalEvaluationCorrectionPdf(evaluation, subject) {
  const w = new PdfWriter('CORRIGÉ — ÉVALUATION FINALE', subject.formationTitle);
  w.meta('Corrigé du QCM — bonnes réponses attendues');

  w.section(`Partie A — QCM (${evaluation.questions.length} questions)`);
  for (const q of evaluation.questions) {
    w.qcmAnswerKey(q);
  }

  w.note(
    "Partie B (mise en pratique sur AKS) évaluée par le formateur pendant la session ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
  );

  return w.toBase64();
}
