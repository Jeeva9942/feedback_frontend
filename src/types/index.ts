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
// CE → ce_feedback   ME → me_feedback   MES → mes_feedback
// AE → ae_feedback   RAC → rac_feedback  MC → mc_feedback
// ── ⚡ Circuit Departments ──────────────────────────────────────────────────
// ECE → ece_feedback  EEE → eee_feedback
// ── 💻 Other Departments ───────────────────────────────────────────────────
// CT → ct_feedback   TT → tt_feedback   PT → pt_feedback  CCN → ccn_feedback

export type Department =
  | 'CE'   // Civil Engineering
  | 'ME'   // Mechanical Engineering
  | 'MES'  // Mechanical Engineering (Sandwich)
  | 'AE'   // Automobile Engineering
  | 'RAC'  // Mechanical Engineering (R & AC)
  | 'MC'   // Mechatronics
  | 'ECE'  // Electronics & Communication Engineering
  | 'EEE'  // Electrical & Electronics Engineering
  | 'CT'   // Computer Engineering (table: ct_feedback)
  | 'TT'   // Textile Technology
  | 'PT'   // Printing Technology
  | 'CCN'; // Communication & Computer Networking

export const DEPARTMENTS: Department[] = [
  'CE', 'ME', 'MES', 'AE', 'RAC', 'MC',
  'ECE', 'EEE',
  'CT', 'TT', 'PT', 'CCN',
];

export const DEPARTMENT_NAMES: Record<Department, string> = {
  CE: 'Civil Engineering',
  ME: 'Mechanical Engineering',
  MES: 'Mechanical Engineering (Sandwich)',
  AE: 'Automobile Engineering',
  RAC: 'Mechanical Engineering (R & AC)',
  MC: 'Mechatronics',
  ECE: 'Electronics & Communication Engineering',
  EEE: 'Electrical & Electronics Engineering',
  CT: 'Computer Engineering',
  TT: 'Textile Technology',
  PT: 'Printing Technology',
  CCN: 'Communication & Computer Networking',
};

export const RATING_LABELS = ['Below Average', 'Average', 'Good', 'Very Good'] as const;
export const RATING_VALUES = [1, 2, 3, 4] as const;
