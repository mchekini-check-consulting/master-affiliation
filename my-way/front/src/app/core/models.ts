export interface User {
  id: number;
  email: string;
  full_name: string;
  city?: string;
  specialties?: string[];
  current_status?: string;
  desired_tjm?: number;
  days_per_month?: number;
  family_shares?: number;
  household_income?: number;
  goals?: string[];
  onboarding_completed?: boolean;
  /** USER (défaut) ou ADMIN — pilote l'affichage des fonctions d'administration. */
  role?: string;
}

export interface Simulation {
  id?: number;
  name?: string;
  tjm: number;
  days_per_month: number;
  monthly_expenses?: number;
  family_shares?: number;
  household_income?: number;
  statuses_compared?: string[];
  acre?: boolean;
  arce?: boolean;
  are?: boolean;
  results?: unknown;
  created_date?: string;
}

export interface ContactMessage {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SimResult {
  eligible: boolean;
  reason?: string;
  statut?: string;
  ca_annuel?: number;
  ca_mensuel?: number;
  charges_annuelles?: number;
  charges_mensuelles?: number;
  charges_sociales?: number;
  frais_annuels?: number;
  remuneration_brute?: number;
  remuneration_nette?: number;
  is?: number;
  dividendes_bruts?: number;
  dividendes_nets?: number;
  ir_annuel?: number;
  net_annuel?: number;
  net_mensuel?: number;
  taux_prelevement?: number;
  acre?: boolean;
}
