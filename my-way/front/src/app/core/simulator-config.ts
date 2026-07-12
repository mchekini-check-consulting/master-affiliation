import { SimResult } from './models';

// Configuration des taux et barèmes - facilement modifiable
export const CONFIG = {
  // Auto-entrepreneur
  AE: {
    plafond_ca: 77700,
    charges_sociales: 0.211,
    cfp: 0.002,
    acre_reduction: 0.5,
    franchise_tva: 36800,
  },

  // SASU (IS)
  SASU: {
    charges_sociales_pct: 0.65, // sur le net dirigeant
    is_taux_reduit: 0.15,
    is_taux_reduit_plafond: 42500,
    is_taux_normal: 0.25,
    flat_tax: 0.30,
    ps_dividendes: 0.172,
    pee_plafond: 3519,
    pereco_plafond: 7038,
    ppv_plafond: 3000,
  },

  // Barème IR 2024
  IR_TRANCHES: [
    { min: 0, max: 11294, taux: 0 },
    { min: 11295, max: 28797, taux: 0.11 },
    { min: 28798, max: 82341, taux: 0.30 },
    { min: 82342, max: 177106, taux: 0.41 },
    { min: 177107, max: Infinity, taux: 0.45 },
  ],
};

export function calculateIR(revenuImposable: number, parts = 1): number {
  const quotient = revenuImposable / parts;
  let impot = 0;
  for (const tranche of CONFIG.IR_TRANCHES) {
    if (quotient > tranche.min) {
      const taxable = Math.min(quotient, tranche.max) - tranche.min;
      impot += taxable * tranche.taux;
    }
  }
  return impot * parts;
}

export function simulateAE(tjm: number, daysPerMonth: number, acre = false): SimResult {
  const caAnnuel = tjm * daysPerMonth * 12;
  const caMensuel = tjm * daysPerMonth;

  if (caAnnuel > CONFIG.AE.plafond_ca) {
    return { eligible: false, reason: 'CA dépasse le plafond AE (77 700€)' };
  }

  let tauxCharges = CONFIG.AE.charges_sociales + CONFIG.AE.cfp;
  if (acre) {
    tauxCharges = (CONFIG.AE.charges_sociales * CONFIG.AE.acre_reduction) + CONFIG.AE.cfp;
  }

  const chargesAnnuelles = caAnnuel * tauxCharges;
  const revenuAvantIR = caAnnuel - chargesAnnuelles;

  // Versement libératoire simplifié : 2.2% du CA
  const vlIR = caAnnuel * 0.022;
  const irClassique = calculateIR(revenuAvantIR);
  const irFinal = Math.min(vlIR, irClassique);

  const netAnnuel = revenuAvantIR - irFinal;
  const netMensuel = netAnnuel / 12;

  return {
    eligible: true,
    statut: 'Auto-entrepreneur',
    ca_annuel: caAnnuel,
    ca_mensuel: caMensuel,
    charges_annuelles: chargesAnnuelles,
    charges_mensuelles: chargesAnnuelles / 12,
    ir_annuel: irFinal,
    net_annuel: netAnnuel,
    net_mensuel: netMensuel,
    taux_prelevement: ((chargesAnnuelles + irFinal) / caAnnuel * 100),
    acre,
  };
}

export function simulateSASU(tjm: number, daysPerMonth: number, monthlyExpenses = 0, acre = false): SimResult {
  const caAnnuel = tjm * daysPerMonth * 12;
  const fraisAnnuels = monthlyExpenses * 12;
  const beneficeAvantRemuneration = caAnnuel - fraisAnnuels;

  // Optimisation : 70% rémunération, 30% dividendes (simplification)
  const remunerationBrute = beneficeAvantRemuneration * 0.60;
  const chargesSociales = remunerationBrute * CONFIG.SASU.charges_sociales_pct / (1 + CONFIG.SASU.charges_sociales_pct);
  const remunerationNette = remunerationBrute - chargesSociales;

  const resultatAvantIS = beneficeAvantRemuneration - remunerationBrute;
  let is = 0;
  if (resultatAvantIS > 0) {
    if (resultatAvantIS <= CONFIG.SASU.is_taux_reduit_plafond) {
      is = resultatAvantIS * CONFIG.SASU.is_taux_reduit;
    } else {
      is = CONFIG.SASU.is_taux_reduit_plafond * CONFIG.SASU.is_taux_reduit +
        (resultatAvantIS - CONFIG.SASU.is_taux_reduit_plafond) * CONFIG.SASU.is_taux_normal;
    }
  }

  const dividendesBruts = Math.max(0, resultatAvantIS - is);
  const flatTaxDiv = dividendesBruts * CONFIG.SASU.flat_tax;
  const dividendesNets = dividendesBruts - flatTaxDiv;

  const irRemuneration = calculateIR(remunerationNette);
  const netAnnuel = remunerationNette - irRemuneration + dividendesNets;
  const netMensuel = netAnnuel / 12;

  const totalCharges = chargesSociales + is + flatTaxDiv + irRemuneration;

  return {
    eligible: true,
    statut: 'SASU (IS)',
    ca_annuel: caAnnuel,
    ca_mensuel: caAnnuel / 12,
    frais_annuels: fraisAnnuels,
    remuneration_brute: remunerationBrute,
    charges_sociales: chargesSociales,
    remuneration_nette: remunerationNette,
    is,
    dividendes_bruts: dividendesBruts,
    dividendes_nets: dividendesNets,
    ir_annuel: irRemuneration,
    net_annuel: netAnnuel,
    net_mensuel: netMensuel,
    taux_prelevement: (totalCharges / caAnnuel * 100),
    acre,
  };
}

export function getBestStatus(results: SimResult[]): SimResult | null {
  const eligible = results.filter(r => r.eligible);
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => (b.net_mensuel ?? 0) - (a.net_mensuel ?? 0))[0];
}
