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
  | 'CE'          // Civil Engineering (Aided)
  | 'MECH_AIDED'  // Mechanical Engineering (Aided)
  | 'MECH_SF'     // Mechanical Engineering (SF)
  | 'MC'          // Mechatronics (SF)
  | 'MES'         // Mechanical Sandwich (SF)
  | 'EEE_AIDED'   // Electrical and Electronics Engineering (Aided)
  | 'EEE_SF'      // Electrical and Electronics Engineering (SF)
  | 'ECE_AIDED'   // Electronics and Communication Engineering (Aided)
  | 'ECE_SF'      // Electronics and Communication Engineering (SF)
  | 'AUTO_AIDED'  // Automobile Engineering (Aided)
  | 'AUTO_SF'     // Automobile Engineering (SF)
  | 'RAC'         // Mechanical Engineering (R&AC) (Aided)
  | 'TT'          // Textile Technology (Aided)
  | 'CT'          // Computer Engineering (Aided)
  | 'CCN'         // Communication & Computer Networking (SF)
  | 'PT'          // Printing Technology (SF)
  | 'ME'          // Alias
  | 'AE'          // Alias
  | 'ECE'         // Alias
  | 'EEE';        // Alias

export const DEPARTMENTS: Department[] = [
  'MECH_AIDED', 'MECH_SF', 'MC', 'MES',
  'EEE_AIDED', 'EEE_SF', 'ECE_AIDED', 'ECE_SF',
  'AUTO_AIDED', 'AUTO_SF', 'RAC',
  'CE', 'TT', 'CT', 'CCN', 'PT'
];

export const DEPARTMENT_NAMES: Record<Department, string> = {
  CE: 'Civil Engineering (Aided)',
  MECH_AIDED: 'Mechanical Engineering (Aided)',
  MECH_SF: 'Mechanical Engineering (SF)',
  MC: 'Mechatronics (SF)',
  MES: 'Mechanical Sandwich (SF)',
  EEE_AIDED: 'Electrical and Electronics Engineering (Aided)',
  EEE_SF: 'Electrical and Electronics Engineering (SF)',
  ECE_AIDED: 'Electronics and Communication Engineering (Aided)',
  ECE_SF: 'Electronics and Communication Engineering (SF)',
  AUTO_AIDED: 'Automobile Engineering (Aided)',
  AUTO_SF: 'Automobile Engineering (SF)',
  RAC: 'Mechanical Engineering (R&AC) (Aided)',
  TT: 'Textile Technology (Aided)',
  CT: 'Computer Engineering (Aided)',
  CCN: 'Communication & Computer Networking (SF)',
  PT: 'Printing Technology (SF)',
  // Aliases for historical data mapping
  ME: 'Mechanical Engineering',
  AE: 'Automobile Engineering',
  ECE: 'Electronics and Communication',
  EEE: 'Electrical and Electronics',
};

export const RATING_LABELS = ['Below Average', 'Average', 'Good', 'Very Good'] as const;
export const RATING_VALUES = [1, 2, 3, 4] as const;
