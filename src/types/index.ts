export interface Student {
  rollNo: string;
  name: string;
  department: string;
  dob: string;
  password: string;
  hasSubmitted: boolean;
}

export interface FeedbackAnswer {
  questionId: number;
  section: 'facilities' | 'participation' | 'accomplishment';
  rating: number;
}

export interface FeedbackSubmission {
  rollNo: string;
  studentName: string;
  department: string;
  answers: FeedbackAnswer[];
  strengths: string;
  improvements: string;
  generalStrengths: string;
  generalImprovements: string;
  generalAdmin: string;
  submittedAt: string;
}

export interface User {
  role: 'student' | 'admin';
  rollNo?: string;
  name?: string;
  department?: string;
  username?: string;
  hasSubmitted?: boolean;
}

// ── 📌 Core Departments ────────────────────────────────────────────────────
// CE → ce_feedback        ME → mech_aided_feedback   MECH_AIDED → mech_aided_feedback
// MECH_SF → mechanical_sf_feedback  MES → mes_feedback   AE → ae_feedback
// RAC → rac_feedback      MC → mcs_feedback
// ── ⚡ Circuit Departments ──────────────────────────────────────────────────
// ECE → ece_feedback  EEE → eee_feedback
// ── 💻 Other Departments ───────────────────────────────────────────────────
// CT → ct_feedback   TT → tt_feedback   PT → pt_feedback  CCN → ccn_feedback

export type Department =
  | 'CE'          // Civil Engineering
  | 'ME'          // Mechanical Engineering (alias — not used directly)
  | 'MECH_AIDED'  // Mechanical Engineering – Aided  (table: mech_aided_feedback)
  | 'MECH_SF'     // Mechanical Engineering – Self-Finance (table: mechanical_sf_feedback)
  | 'MES'         // Mechanical Engineering (Sandwich)
  | 'AE'          // Automobile Engineering
  | 'AUTO_AIDED'   // Automobile Engineering - Aided (table: automobile_aided_feedback)
  | 'AUTO_SF'      // Automobile Engineering - SF (table: automobile_sf_feedback)
  | 'RAC'         // Mechanical Engineering (R & AC)
  | 'MC'          // Mechatronics (table: mcs_feedback)
  | 'ECE'         // Electronics & Communication Engineering
  | 'ECE_AIDED'   // Electronics & Communication Engineering (Aided)
  | 'ECE_SF'      // Electronics & Communication Engineering (SF)
  | 'EEE'         // Electrical & Electronics Engineering
  | 'EEE_AIDED'   // Electrical & Electronics Engineering (Aided)
  | 'EEE_SF'      // Electrical & Electronics Engineering (SF)
  | 'CT'          // Computer Engineering (table: ct_feedback)
  | 'TT'          // Textile Technology
  | 'PT'          // Printing Technology
  | 'CCN';        // Communication & Computer Networking

export const DEPARTMENTS: Department[] = [
  'CE', 'MECH_AIDED', 'MECH_SF', 'ME', 'MES', 'AE', 'AUTO_AIDED', 'AUTO_SF', 'RAC', 'MC',
  'ECE', 'ECE_AIDED', 'ECE_SF',
  'EEE', 'EEE_AIDED', 'EEE_SF',
  'CT', 'TT', 'PT', 'CCN',
];

export const DEPARTMENT_NAMES: Record<Department, string> = {
  CE: 'Civil Engineering',
  ME: 'Mechanical Engineering',
  MECH_AIDED: 'Mechanical Engineering (Aided)',
  MECH_SF: 'Mechanical Engineering (SF)',
  MES: 'Mechanical Engineering (Sandwich)',
  AE: 'Automobile Engineering',
  AUTO_AIDED: 'Automobile Engineering (Aided)',
  AUTO_SF: 'Automobile Engineering (SF)',
  RAC: 'Mechanical Engineering (R & AC)',
  MC: 'Mechatronics',
  ECE: 'Electronics & Communication Engineering',
  ECE_AIDED: 'Electronics & Communication Engineering (Aided)',
  ECE_SF: 'Electronics & Communication Engineering (SF)',
  EEE: 'Electrical & Electronics Engineering',
  EEE_AIDED: 'Electrical & Electronics Engineering (Aided)',
  EEE_SF: 'Electrical & Electronics Engineering (SF)',
  CT: 'Computer Engineering',
  TT: 'Textile Technology',
  PT: 'Printing Technology',
  CCN: 'Communication & Computer Networking',
};

export const RATING_LABELS = ['Below Average', 'Average', 'Good', 'Very Good'] as const;
export const RATING_VALUES = [1, 2, 3, 4] as const;
