export interface Question {
  id: number;
  text: string;
  section: 'facilities' | 'participation' | 'accomplishment';
  type: 'rating' | 'yesno';
}

export const facilityQuestions: Question[] = [
  { id: 1, text: 'Infrastructure Facility', section: 'facilities', type: 'rating' },
  { id: 2, text: 'Library Facility', section: 'facilities', type: 'rating' },
  { id: 3, text: 'Drinking Water Facility', section: 'facilities', type: 'rating' },
  { id: 4, text: 'Canteen Facility', section: 'facilities', type: 'rating' },
  { id: 5, text: 'Transport Facility', section: 'facilities', type: 'rating' },
  { id: 6, text: 'Sport Facility', section: 'facilities', type: 'rating' },
  { id: 7, text: 'Internet Facility', section: 'facilities', type: 'rating' },
  { id: 8, text: 'Hostel Facility', section: 'facilities', type: 'rating' },
  { id: 9, text: 'Banking Facility/ATM', section: 'facilities', type: 'rating' },
  { id: 10, text: 'Quality of Teaching and Learning', section: 'facilities', type: 'rating' },
  { id: 11, text: 'Laboratory Facilities', section: 'facilities', type: 'rating' },
  { id: 12, text: 'Industrial Visit', section: 'facilities', type: 'rating' },
  { id: 13, text: 'Guest Lecture', section: 'facilities', type: 'rating' },
  { id: 14, text: 'Career Guidance / Placement Training', section: 'facilities', type: 'rating' },
  { id: 15, text: 'Campus Environment', section: 'facilities', type: 'rating' },
  { id: 16, text: 'Toilet Facility (Cleanliness)', section: 'facilities', type: 'rating' },
  { id: 17, text: 'Stationary Store Facility', section: 'facilities', type: 'rating' },
  { id: 18, text: 'Medical Health Centre', section: 'facilities', type: 'rating' },
  { id: 19, text: 'Fitness Centre Facility', section: 'facilities', type: 'rating' },
  { id: 20, text: 'Meditation / Yoga Centre Facility', section: 'facilities', type: 'rating' },
  { id: 21, text: 'Industrial Collaboration (MoU)', section: 'facilities', type: 'rating' },
  { id: 22, text: 'College Office for Information', section: 'facilities', type: 'rating' },
  { id: 23, text: 'Availability of Scholarship Facilities', section: 'facilities', type: 'rating' },
  { id: 24, text: 'Parking Facilities', section: 'facilities', type: 'rating' },
];

export const participationQuestions: Question[] = [
  { id: 1, text: 'Did you participate in Sports events?', section: 'participation', type: 'rating' },
  { id: 2, text: 'Did you participate in Seminar?', section: 'participation', type: 'rating' },
  { id: 3, text: 'Did you participate in Workshop?', section: 'participation', type: 'rating' },
  { id: 4, text: 'Are you did any Industry Project?', section: 'participation', type: 'rating' },
  { id: 5, text: 'Are you member in Students Guild of Service (SGS)?', section: 'participation', type: 'rating' },
  { id: 6, text: 'Are you a NSS Volunteer?', section: 'participation', type: 'rating' },
  { id: 7, text: 'Have you received any scholarships during the study?', section: 'participation', type: 'rating' },
  { id: 8, text: 'Did you attend any certified courses inside the campus (Swelect, Bosch, 3D Modeling, etc.)?', section: 'participation', type: 'rating' },
  { id: 9, text: 'Do you attend any awareness program?', section: 'participation', type: 'rating' },
];

export const accomplishmentQuestions: Question[] = [
  { id: 1, text: 'Basic and Discipline specific knowledge: Apply knowledge of basic mathematics, science and engineering fundamentals and engineering specialization to solve the engineering problems.', section: 'accomplishment', type: 'rating' },
  { id: 2, text: 'Problem analysis: Identify and analyse well-defined engineering problems using codified standard methods.', section: 'accomplishment', type: 'rating' },
  { id: 3, text: 'Design/development of solutions: Design solutions for well-defined technical problems and assist with the design of systems components or processes to meet specified needs.', section: 'accomplishment', type: 'rating' },
  { id: 4, text: 'Engineering Tools, Experimentation and Testing: Apply modern engineering tools and appropriate technique to well-defined engineering problems.', section: 'accomplishment', type: 'rating' },
  { id: 5, text: 'Engineering practices for society, sustainability and environment: Apply appropriate technology in context of society, sustainability, environment and ethical practices.', section: 'accomplishment', type: 'rating' },
  { id: 6, text: 'Project Management: Use engineering management principles individually, as a team member or a leader to manage projects and effectively communicate about well-defined engineering activities.', section: 'accomplishment', type: 'rating' },
  { id: 7, text: 'Life-long learning: Ability to analyse individual needs and engage in updating in the context of technological changes.', section: 'accomplishment', type: 'rating' },
  { id: 8, text: 'Program Specific Outcome (PSO1)', section: 'accomplishment', type: 'rating' },
  { id: 9, text: 'Program Specific Outcome (PSO2)', section: 'accomplishment', type: 'rating' },
];
