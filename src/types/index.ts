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
  rating: number; // 1-4 for rating, 1=yes/0=no for participation
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

export type Department = 'CIVIL' | 'MECH' | 'EEE' | 'ECE' | 'CSE' | 'IT' | 'CT' | 'ICE';

export const DEPARTMENTS: Department[] = ['CIVIL', 'MECH', 'EEE', 'ECE', 'CSE', 'IT', 'CT', 'ICE'];

export const DEPARTMENT_NAMES: Record<Department, string> = {
  CIVIL: 'Civil Engineering',
  MECH: 'Mechanical Engineering',
  EEE: 'Electrical & Electronics Engineering',
  ECE: 'Electronics & Communication Engineering',
  CSE: 'Computer Science & Engineering',
  IT: 'Information Technology',
  CT: 'Computer Technology',
  ICE: 'Instrumentation & Control Engineering',
};

export const RATING_LABELS = ['Below Average', 'Average', 'Good', 'Very Good'] as const;
export const RATING_VALUES = [1, 2, 3, 4] as const;
