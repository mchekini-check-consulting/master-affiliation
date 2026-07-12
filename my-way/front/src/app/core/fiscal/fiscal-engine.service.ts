import { Injectable } from '@angular/core';
import type Engine from 'publicodes';
import {
  DroitsSociaux, FoyerInput, FoyerResult, LigneDetail, MICRO_PLAFONDS, PersonneInput,
  STATUT_LABELS, StatutId, StatutResult, caAnnuel,
} from './types';

type Situation = Record<string, string | number>;

/**
 * Date de référence des barèmes : tous les taux (cotisations micro, barème IR,
 * prélèvements sociaux…) sont résolus à cette date par les règles URSSAF datées.
 */
const DATE_SIMULATION = '01/07/2026';

/**
 * Prélèvements sociaux sur les revenus du capital au 01/2026 (CSG 10,6 % + CRDS 0,5 %
 * + solidarité 7,5 %). Utilisé pour la quote-part de bénéfice SASU à l'IR, seul cas
 * non couvert par les règles `bénéficiaire . dividendes` (réservées à l'IS).
 */
const PS_CAPITAL = 0.186;

/** Capital social par défaut retenu pour l'assiette TNS des dividendes en EURL. */
const CAPITAL_SOCIAL_DEFAUT = '1000 €';

@Injectable({ providedIn: 'root' })
export class FiscalEngineService {
  private engine: Engine | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Charge le moteur publicodes et les règles du modèle social URSSAF
   * (même moteur que mon-entreprise.urssaf.fr). Import dynamique : le paquet
   * de règles (~2 Mo) forme un chunk séparé chargé uniquement côté navigateur.
   */
  init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = Promise.all([import('publicodes'), import('modele-social')])
        .then(([publicodes, modeleSocial]) => {
          const silent = { warn: () => {}, error: () => {}, log: () => {} };
          this.engine = new publicodes.default(modeleSocial.default as never, { logger: silent });
        });
    }
    return this.initPromise;
  }

  get ready(): boolean {
    return this.engine !== null;
  }

  // ---------------------------------------------------------------------------
  // Accès moteur
  // ---------------------------------------------------------------------------

  /** Fixe une situation puis lit des règles en €/an (0 si non applicable). */
  private lecteur(situation: Situation): (regle: string) => number {
    const engine = this.engine!;
    engine.setSituation({ date: DATE_SIMULATION, ...situation } as never);
    return (regle: string) => {
      const v = engine.evaluate({ valeur: regle, unité: '€/an' }).nodeValue;
      return typeof v === 'number' ? v : 0;
    };
  }

  /** Lit une règle sans unité (nombre de parts, trimestres…) dans la situation courante. */
  private brut(regle: string): number {
    const v = this.engine!.evaluate(regle).nodeValue;
    return typeof v === 'number' ? v : 0;
  }

  // ---------------------------------------------------------------------------
  // Simulation d'un statut pour une personne
  // ---------------------------------------------------------------------------

  computeStatut(p: PersonneInput): StatutResult {
    if (!this.engine) throw new Error('Moteur non initialisé');
    try {
      switch (p.statut) {
        case 'salarie': return this.salarie(p);
        case 'portage': return this.portage(p);
        case 'micro': return this.micro(p);
        case 'eurl': return this.societeIS(p, 'eurl');
        case 'sasu-is': return this.societeIS(p, 'sasu-is');
        case 'sasu-ir': return this.sasuIR(p);
      }
    } catch {
      return this.inéligible(p.statut, 'Calcul impossible pour ces paramètres');
    }
  }

  private inéligible(id: StatutId, raison: string): StatutResult {
    return {
      id, label: STATUT_LABELS[id], eligible: false, raison,
      caAnnuel: 0, depenses: 0, cotisations: 0, impotSociete: 0, salaireBrut: 0,
      netAvantImpot: 0, dividendesBruts: 0, dividendesNets: 0,
      imposableActivite: 0, imposableDejaAbattu: 0, impotForfaitaire: 0,
      droits: { trimestresRetraite: 0, retraiteComplementaire: 'Aucune ou faible', chomage: false, indemnitesJournalieres: 'Aucune' },
      details: [],
    };
  }

  private salarie(p: PersonneInput): StatutResult {
    const brut = p.revenu.salaireBrut;
    const lit = this.lecteur({
      'salarié . contrat . salaire brut': `${brut} €/an`,
      'salarié . contrat . statut cadre': 'oui',
    });
    const net = lit('salarié . rémunération . net . à payer avant impôt');
    const imposable = lit('salarié . rémunération . net . imposable');
    const coutEmployeur = lit('salarié . coût total employeur');
    const trimestres = this.brut('protection sociale . retraite . trimestres');

    const details: LigneDetail[] = [
      { label: 'Salaire brut annuel', montant: brut },
      { label: 'Cotisations salariales', montant: net - brut },
      { label: 'Coût total employeur (information)', montant: coutEmployeur },
      { label: 'Net avant impôt', montant: net, emphase: true },
    ];
    return {
      id: 'salarie', label: STATUT_LABELS['salarie'], eligible: true,
      caAnnuel: brut, depenses: 0, cotisations: brut - net, impotSociete: 0, salaireBrut: brut,
      netAvantImpot: net, dividendesBruts: 0, dividendesNets: 0,
      imposableActivite: imposable, imposableDejaAbattu: 0, impotForfaitaire: 0,
      droits: this.droits(trimestres, 'AGIRC-ARRCO', true, 'Complètes'),
      details,
    };
  }

  private portage(p: PersonneInput): StatutResult {
    const ca = caAnnuel(p.revenu);
    const commission = ca * p.options.commissionPortage / 100;
    // Les frais professionnels sont remboursés par la société de portage : ils
    // sortent de l'assiette cotisée et reviennent au salarié porté sans impôt.
    const fraisRembourses = Math.min(Math.max(0, p.revenu.depenses), Math.max(0, ca - commission));
    const coutEmployeur = Math.max(0, ca - commission - fraisRembourses);

    // CDI de portage statut cadre : le brut est déduit du compte d'activité par
    // inversion (coût employeur → brut), comme sur le simulateur URSSAF.
    const lit = this.lecteur({
      'salarié . contrat . statut cadre': 'oui',
      'salarié . coût total employeur': `${coutEmployeur} €/an`,
    });
    const brut = lit('salarié . contrat . salaire brut');
    const net = lit('salarié . rémunération . net . à payer avant impôt');
    const imposable = lit('salarié . rémunération . net . imposable');
    const trimestres = this.brut('protection sociale . retraite . trimestres');

    const details: LigneDetail[] = [
      { label: "Chiffre d'affaires", montant: ca },
      { label: `Commission de portage (${p.options.commissionPortage} %)`, montant: -commission },
      ...(fraisRembourses > 0
        ? [{ label: 'Frais professionnels remboursés (non soumis)', montant: fraisRembourses }]
        : []),
      { label: 'Salaire brut (CDI portage cadre)', montant: brut },
      { label: 'Cotisations (salariales + patronales)', montant: net - coutEmployeur },
      { label: 'Net avant impôt', montant: net + fraisRembourses, emphase: true },
    ];
    return {
      id: 'portage', label: STATUT_LABELS['portage'], eligible: true,
      caAnnuel: ca, depenses: p.revenu.depenses, cotisations: coutEmployeur - net, impotSociete: 0, salaireBrut: brut,
      netAvantImpot: net + fraisRembourses, dividendesBruts: 0, dividendesNets: 0,
      imposableActivite: imposable, imposableDejaAbattu: 0, impotForfaitaire: 0,
      droits: this.droits(trimestres, 'AGIRC-ARRCO', true, 'Complètes'),
      details,
    };
  }

  private micro(p: PersonneInput): StatutResult {
    const ca = caAnnuel(p.revenu);
    const plafond = MICRO_PLAFONDS[p.options.activite];
    if (ca > plafond) {
      return this.inéligible('micro', `CA supérieur au plafond micro (${plafond.toLocaleString('fr-FR')} €)`);
    }

    const situation: Situation = {
      'entreprise . catégorie juridique': "'EI'",
      'entreprise . catégorie juridique . EI . auto-entrepreneur': 'oui',
      "dirigeant . auto-entrepreneur . chiffre d'affaires": `${ca} €/an`,
    };
    switch (p.options.activite) {
      case 'bnc':
        situation['entreprise . activité . nature'] = "'libérale'";
        situation['entreprise . activité . nature . libérale . réglementée'] = 'non';
        break;
      case 'service-bic':
        situation['entreprise . activité . nature'] = "'artisanale'";
        situation['entreprise . activités . service ou vente'] = "'service'";
        break;
      case 'commerce':
        situation['entreprise . activité . nature'] = "'commerciale'";
        situation['entreprise . activités . service ou vente'] = "'vente'";
        break;
    }
    if (p.options.acre) {
      // L'ACRE n'est applicable que la première année : on simule une création récente.
      situation['entreprise . date de création'] = '01/02/2026';
      situation['dirigeant . exonérations . ACRE'] = 'oui';
    }
    if (p.options.versementLiberatoire) {
      situation['dirigeant . auto-entrepreneur . impôt . versement libératoire'] = 'oui';
    }

    const lit = this.lecteur(situation);
    const cotisations = lit('dirigeant . auto-entrepreneur . cotisations et contributions');
    const revenuNet = lit('dirigeant . auto-entrepreneur . revenu net');
    const abattu = lit('entreprise . imposition . régime . micro-entreprise . revenu abattu');
    const vfl = p.options.versementLiberatoire
      ? lit('dirigeant . auto-entrepreneur . impôt . versement libératoire . montant')
      : 0;
    const trimestres = this.brut('protection sociale . retraite . trimestres');

    // Les dépenses réelles ne sont pas déductibles en micro : elles réduisent
    // le cash disponible mais pas l'assiette (c'est tout l'enjeu du comparatif).
    const net = revenuNet - p.revenu.depenses;

    const details: LigneDetail[] = [
      { label: "Chiffre d'affaires", montant: ca },
      { label: `Cotisations et contributions${p.options.acre ? ' (ACRE)' : ''}`, montant: -cotisations },
      ...(p.revenu.depenses > 0
        ? [{ label: 'Dépenses réelles (non déductibles en micro)', montant: -p.revenu.depenses }]
        : []),
      ...(p.options.versementLiberatoire
        ? [{ label: 'Versement libératoire de l’IR', montant: -vfl }]
        : []),
      { label: 'Net avant impôt', montant: net, emphase: true },
    ];
    return {
      id: 'micro', label: STATUT_LABELS['micro'], eligible: true,
      caAnnuel: ca, depenses: p.revenu.depenses, cotisations, impotSociete: 0, salaireBrut: 0,
      netAvantImpot: net, dividendesBruts: 0, dividendesNets: 0,
      imposableActivite: 0,
      imposableDejaAbattu: p.options.versementLiberatoire ? 0 : abattu,
      impotForfaitaire: vfl,
      droits: this.droits(trimestres, 'Aucune ou faible', false, 'Limitées'),
      details,
    };
  }

  /** EURL à l'IS (gérant TNS) et SASU à l'IS (président assimilé salarié). */
  private societeIS(p: PersonneInput, id: 'eurl' | 'sasu-is'): StatutResult {
    const ca = caAnnuel(p.revenu);
    const depenses = p.revenu.depenses;
    const disponible = ca - depenses;
    if (disponible <= 0) {
      return this.inéligible(id, 'Les dépenses dépassent le chiffre d’affaires');
    }
    const remTotale = disponible * p.options.partRemuneration / 100;
    const auBareme = id === 'sasu-is' && p.options.dividendes === 'bareme';

    const base: Situation = {
      'entreprise . catégorie juridique': id === 'eurl' ? "'SARL'" : "'SAS'",
      'entreprise . associés': "'unique'",
      'entreprise . imposition': "'IS'",
      'entreprise . capital social': CAPITAL_SOCIAL_DEFAUT,
      "entreprise . chiffre d'affaires": `${ca} €/an`,
      'entreprise . charges': `${depenses} €/an`,
      'dirigeant . rémunération . totale': `${remTotale} €/an`,
      'impôt . méthode de calcul': auBareme ? "'barème standard'" : "'PFU'",
    };

    // Premier passage : rémunération, IS et résultat distribuable.
    let lit = this.lecteur(base);
    const impotSociete = lit('entreprise . imposition . IS . montant');
    const dividendesBruts = Math.max(0, lit('entreprise . imposition . IS . résultat net'));

    // Second passage avec la distribution : en EURL, les dividendes > 10 % du capital
    // rejoignent l'assiette des cotisations TNS du gérant (règles URSSAF).
    if (dividendesBruts > 0) {
      lit = this.lecteur({ ...base, 'bénéficiaire': 'oui', 'bénéficiaire . dividendes . bruts': `${dividendesBruts} €/an` });
    }
    const remNet = lit('dirigeant . rémunération . net');
    const remImposable = lit('dirigeant . rémunération . net . imposable');
    const cotisations = lit('dirigeant . rémunération . cotisations');
    const dividendesNets = dividendesBruts > 0 ? lit('bénéficiaire . dividendes . nets') : 0;
    const pfu = dividendesBruts > 0 && !auBareme ? lit("impôt . dividendes . PFU") : 0;
    const divImposables = dividendesBruts > 0 && auBareme ? lit('bénéficiaire . dividendes . imposables') : 0;
    const trimestres = this.brut('protection sociale . retraite . trimestres');

    const details: LigneDetail[] = [
      { label: "Chiffre d'affaires", montant: ca },
      ...(depenses > 0 ? [{ label: 'Dépenses déductibles', montant: -depenses }] : []),
      { label: 'Rémunération totale (enveloppe)', montant: remTotale },
      { label: id === 'eurl' ? 'Cotisations TNS' : 'Cotisations (assimilé salarié)', montant: -cotisations },
      { label: 'Rémunération nette', montant: remNet },
      { label: 'Impôt sur les sociétés', montant: -impotSociete },
      { label: 'Dividendes bruts', montant: dividendesBruts },
      { label: 'Prélèvements sociaux sur dividendes', montant: dividendesNets - dividendesBruts },
      { label: 'Net avant impôt sur le revenu', montant: remNet + dividendesNets, emphase: true },
    ];
    return {
      id, label: STATUT_LABELS[id], eligible: true,
      caAnnuel: ca, depenses, cotisations, impotSociete, salaireBrut: 0,
      netAvantImpot: remNet + dividendesNets, dividendesBruts, dividendesNets,
      imposableActivite: remImposable,
      imposableDejaAbattu: divImposables,
      impotForfaitaire: pfu,
      droits: id === 'eurl'
        ? this.droits(trimestres, 'RCI (indépendants)', false, 'Limitées')
        : this.droits(trimestres, 'AGIRC-ARRCO', false, 'Complètes'),
      details,
    };
  }

  private sasuIR(p: PersonneInput): StatutResult {
    const ca = caAnnuel(p.revenu);
    const depenses = p.revenu.depenses;
    const salaireBrut = p.options.salairePresident;

    let coutSalaire = 0, salaireNet = 0, salaireImposable = 0, cotisations = 0, trimestres = 0;
    if (salaireBrut > 0) {
      const lit = this.lecteur({
        'entreprise . catégorie juridique': "'SAS'",
        'entreprise . associés': "'unique'",
        'entreprise . imposition': "'IR'",
        'salarié . contrat . salaire brut': `${salaireBrut} €/an`,
      });
      coutSalaire = lit('salarié . coût total employeur');
      salaireNet = lit('dirigeant . rémunération . net');
      salaireImposable = lit('dirigeant . rémunération . net . imposable');
      cotisations = lit('dirigeant . rémunération . cotisations');
      trimestres = this.brut('protection sociale . retraite . trimestres');
    }

    const benefice = ca - depenses - coutSalaire;
    if (benefice < 0) {
      return this.inéligible('sasu-ir', 'Dépenses et salaire dépassent le chiffre d’affaires');
    }
    // Quote-part de bénéfice imposée à l'IR chez l'associé unique + prélèvements
    // sociaux sur les revenus du capital (18,6 % au barème 2026).
    const ps = benefice * PS_CAPITAL;

    const details: LigneDetail[] = [
      { label: "Chiffre d'affaires", montant: ca },
      ...(depenses > 0 ? [{ label: 'Dépenses déductibles', montant: -depenses }] : []),
      ...(salaireBrut > 0 ? [
        { label: 'Salaire président (coût total)', montant: -coutSalaire },
        { label: 'Salaire net perçu', montant: salaireNet },
      ] : []),
      { label: 'Quote-part de bénéfice (imposée à l’IR)', montant: benefice },
      { label: 'Prélèvements sociaux 18,6 %', montant: -ps },
      { label: 'Net avant impôt sur le revenu', montant: salaireNet + benefice - ps, emphase: true },
    ];
    return {
      id: 'sasu-ir', label: STATUT_LABELS['sasu-ir'], eligible: true,
      caAnnuel: ca, depenses, cotisations, impotSociete: 0, salaireBrut,
      netAvantImpot: salaireNet + benefice - ps, dividendesBruts: 0, dividendesNets: 0,
      imposableActivite: salaireImposable,
      imposableDejaAbattu: benefice,
      impotForfaitaire: 0,
      droits: salaireBrut > 0
        ? this.droits(trimestres, 'AGIRC-ARRCO', false, 'Complètes')
        : this.droits(0, 'Aucune ou faible', false, 'Aucune'),
      details,
    };
  }

  private droits(
    trimestres: number,
    retraiteComplementaire: DroitsSociaux['retraiteComplementaire'],
    chomage: boolean,
    ij: DroitsSociaux['indemnitesJournalieres'],
  ): DroitsSociaux {
    return {
      trimestresRetraite: Math.max(0, Math.min(4, Math.round(trimestres))),
      retraiteComplementaire, chomage, indemnitesJournalieres: ij,
    };
  }

  // ---------------------------------------------------------------------------
  // Impôt sur le revenu du foyer
  // ---------------------------------------------------------------------------

  /**
   * Abattement de 10 % (plancher/plafond en vigueur) appliqué PAR déclarant sur
   * ses revenus d'activité — le foyer fiscal des règles URSSAF le plafonnerait
   * globalement, ce qui pénaliserait à tort les couples bi-actifs.
   */
  private abattement10(revenuActivite: number): number {
    if (revenuActivite <= 0) return 0;
    const lit = this.lecteur({
      "impôt . foyer fiscal . revenu imposable . revenu d'activité": `${revenuActivite} €/an`,
    });
    return lit("impôt . foyer fiscal . revenu imposable . revenu d'activité abattu");
  }

  computeFoyer(declarant: StatutResult, conjoint: StatutResult | null, foyer: FoyerInput): FoyerResult {
    if (!this.engine) throw new Error('Moteur non initialisé');

    const personnes = conjoint ? [declarant, conjoint] : [declarant];
    const imposables = personnes.map(p => this.abattement10(p.imposableActivite) + p.imposableDejaAbattu);
    const revenuImposableFoyer = imposables.reduce((a, b) => a + b, 0) + Math.max(0, foyer.autresRevenus);

    const lit = this.lecteur({
      'impôt . foyer fiscal . situation de famille': foyer.marie ? "'couple'" : "'célibataire'",
      'impôt . foyer fiscal . enfants à charge': foyer.enfants,
      "impôt . foyer fiscal . revenu imposable . revenu d'activité": '0 €/an',
      'impôt . foyer fiscal . revenu imposable . autres revenus imposables': `${revenuImposableFoyer} €/an`,
    });
    const impotBareme = Math.max(0, lit('impôt . foyer fiscal . impôt à payer'));
    const parts = this.brut('impôt . foyer fiscal . nombre de parts');

    const impotForfaitaire = personnes.reduce((a, p) => a + p.impotForfaitaire, 0);
    const netAvantImpot = personnes.reduce((a, p) => a + p.netAvantImpot, 0) + Math.max(0, foyer.autresRevenus);
    const netFoyerApresImpot = netAvantImpot - impotBareme - impotForfaitaire;

    const totalImposable = imposables.reduce((a, b) => a + b, 0);
    const quoteDeclarant = totalImposable > 0 ? imposables[0] / (totalImposable + Math.max(0, foyer.autresRevenus)) : 0;
    const netDeclarantApresImpot = declarant.netAvantImpot - impotBareme * quoteDeclarant - declarant.impotForfaitaire;

    return {
      statut: declarant, conjoint, parts,
      revenuImposableFoyer, impotBareme, impotForfaitaire,
      impotTotal: impotBareme + impotForfaitaire,
      netFoyerApresImpot, netDeclarantApresImpot,
    };
  }
}
