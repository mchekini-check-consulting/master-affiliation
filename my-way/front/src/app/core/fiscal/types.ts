// Types du simulateur fiscal multi-statuts.
// Les calculs de cotisations s'appuient sur le moteur URSSAF (publicodes + modele-social),
// le même que mon-entreprise.urssaf.fr — voir fiscal-engine.service.ts.

export type StatutId = 'micro' | 'eurl' | 'sasu-is' | 'sasu-ir' | 'portage' | 'salarie';

export type ActiviteMicro = 'bnc' | 'service-bic' | 'commerce';

export type MethodeDividendes = 'pfu' | 'bareme';

/** Revenu d'activité d'une personne (déclarant ou conjoint). */
export interface RevenuInput {
  /** 'tjm' → TJM × jours × 12 ; 'ca' → CA annuel direct ; le salarié saisit un brut annuel. */
  mode: 'tjm' | 'ca';
  tjm: number;
  joursParMois: number;
  ca: number;
  /** Dépenses annuelles déductibles (frais pro, matériel, comptable…). */
  depenses: number;
  /** Salaire brut annuel (statuts salarié / portage sur brut ; part salaire en SASU IR). */
  salaireBrut: number;
}

export interface OptionsStatut {
  /** EURL & SASU IS : part du disponible affectée à la rémunération (0–100 %), le reste en dividendes. */
  partRemuneration: number;
  /** SASU IS : imposition des dividendes au PFU (flat tax 12,8 % + PS) ou au barème (abattement 40 %). */
  dividendes: MethodeDividendes;
  /** SASU IR : salaire brut annuel optionnel que se verse le président. */
  salairePresident: number;
  /** Micro : nature de l'activité (détermine taux de cotisations et abattement fiscal). */
  activite: ActiviteMicro;
  /** Micro : ACRE (exonération dégressive de début d'activité, taux en vigueur à la date simulée). */
  acre: boolean;
  /** Micro : versement libératoire de l'impôt sur le revenu. */
  versementLiberatoire: boolean;
  /** Portage : commission de la société de portage en % du CA. */
  commissionPortage: number;
}

export interface PersonneInput {
  statut: StatutId;
  revenu: RevenuInput;
  options: OptionsStatut;
}

export interface FoyerInput {
  marie: boolean;
  enfants: number;
  conjoint: PersonneInput | null;
  /** Autres revenus imposables annuels du foyer (fonciers, pensions… montant déjà imposable). */
  autresRevenus: number;
}

/** Droits sociaux acquis avec le statut (alimentés par les cotisations versées). */
export interface DroitsSociaux {
  trimestresRetraite: number;
  retraiteComplementaire: 'AGIRC-ARRCO' | 'RCI (indépendants)' | 'Aucune ou faible';
  chomage: boolean;
  indemnitesJournalieres: 'Complètes' | 'Limitées' | 'Aucune';
}

export interface LigneDetail {
  label: string;
  /** Montant annuel en € ; négatif = prélèvement. */
  montant: number;
  emphase?: boolean;
}

/** Résultat de la simulation d'un statut pour UNE personne (avant IR du foyer). */
export interface StatutResult {
  id: StatutId;
  label: string;
  eligible: boolean;
  raison?: string;

  caAnnuel: number;
  depenses: number;
  cotisations: number;
  impotSociete: number;
  salaireBrut: number;
  /** Cash perçu dans l'année avant impôt sur le revenu (rémunérations nettes + dividendes nets de PS). */
  netAvantImpot: number;

  dividendesBruts: number;
  dividendesNets: number;

  /** Revenu d'activité imposable au barème, AVANT abattement de 10 % (salaires, rémunération gérant). */
  imposableActivite: number;
  /** Revenus imposables au barème déjà nets d'abattement (micro abattu, dividendes au barème). */
  imposableDejaAbattu: number;
  /** Impôts forfaitaires hors barème : PFU 12,8 % sur dividendes + versement libératoire. */
  impotForfaitaire: number;

  droits: DroitsSociaux;
  details: LigneDetail[];
}

/** Résultat consolidé du foyer pour un scénario (statut du déclarant donné, conjoint fixé). */
export interface FoyerResult {
  statut: StatutResult;
  conjoint: StatutResult | null;
  parts: number;
  revenuImposableFoyer: number;
  impotBareme: number;
  impotForfaitaire: number;
  impotTotal: number;
  /** Revenu net du foyer après tous prélèvements et impôts. */
  netFoyerApresImpot: number;
  /** Net après impôt attribuable au seul déclarant (son net avant impôt − sa quote-part d'IR). */
  netDeclarantApresImpot: number;
}

export const STATUT_LABELS: Record<StatutId, string> = {
  'micro': 'Micro-entreprise',
  'eurl': 'EURL (IS)',
  'sasu-is': 'SASU (IS)',
  'sasu-ir': 'SASU (IR)',
  'portage': 'Portage salarial',
  'salarie': 'Salarié',
};

export function defaultOptions(): OptionsStatut {
  return {
    partRemuneration: 60,
    dividendes: 'pfu',
    salairePresident: 0,
    activite: 'bnc',
    acre: false,
    versementLiberatoire: false,
    commissionPortage: 8,
  };
}

export function defaultRevenu(): RevenuInput {
  return { mode: 'tjm', tjm: 500, joursParMois: 18, ca: 108000, depenses: 3000, salaireBrut: 45000 };
}

export function caAnnuel(r: RevenuInput): number {
  return r.mode === 'tjm' ? r.tjm * r.joursParMois * 12 : r.ca;
}

/** Plafonds micro-entreprise (CA annuel). */
export const MICRO_PLAFONDS: Record<ActiviteMicro, number> = {
  'bnc': 77700,
  'service-bic': 77700,
  'commerce': 188700,
};
