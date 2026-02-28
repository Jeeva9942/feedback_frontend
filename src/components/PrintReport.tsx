import { useRef } from 'react';
import { FeedbackSubmission, DEPARTMENT_NAMES, Department } from '@/types';
import { facilityQuestions, participationQuestions, accomplishmentQuestions } from '@/data/questions';
import { getDeptPSO } from '@/data/pso';
import logo from '@/assets/nptc_logo_new.png';
import tower from '@/assets/nptc_tower_new.png';

interface Props {
  department: Department;
  feedback: any[];       // aggregate rows from [dept]_feedback table
  totalStudents?: number; // total enrolled students from all_students DB
}

export default function PrintReport({ department, feedback = [], totalStudents }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // feedback rows keyed by question_code e.g. { question_code: 'A1', very_good_4: 10, ... }
  const getQuestionRow = (section: 'facilities' | 'accomplishment' | 'participation', questionId: number) => {
    const prefix = section === 'facilities' ? 'A' : section === 'participation' ? 'B' : 'C';
    const code = `${prefix}${questionId}`;
    return feedback.find(f => (f.question_code || '').toUpperCase() === code) || null;
  };

  // Total students: use prop from DB, else fallback to max total_count in feedback
  const displayTotal = totalStudents !== undefined
    ? totalStudents
    : (feedback.length > 0 ? Math.max(...feedback.map(f => f.total_count || 0)) : 0);

  // Department-specific PSO text
  const pso = getDeptPSO(department);
  const dynamicAccomplishmentQuestions = accomplishmentQuestions.map(q => {
    if (q.id === 8) return { ...q, text: `PSO1: ${pso.pso1}` };
    if (q.id === 9) return { ...q, text: `PSO2: ${pso.pso2}` };
    return q;
  });

  return (
    <div ref={ref} className="print-report p-6 bg-white text-black min-h-screen">

      {/* College Header */}
      <div className="flex items-center justify-between mb-2 border-b-2 border-black pb-2 print-avoid-break">
        <img src={logo} alt="NPTC Logo" className="w-28 h-28 object-contain" />

        <div className="text-center flex-1 px-4">
          <h1 className="text-xl font-bold uppercase leading-tight">
            Nachimuthu Polytechnic College
          </h1>
          <p className="text-[11px] font-bold uppercase mt-0.5">
            Government Aided Autonomous Institute Approved by AICTE, New Delhi
          </p>
          <p className="text-[11px] font-bold uppercase">
            Affiliated to State Board of Technical Education &amp; Training Tamil Nadu
          </p>
          <p className="text-[9px] font-bold mt-0.5">
            Accredited by APACC (Asia Pacific Accreditation And Certification Commission), Philippines with Gold Level
          </p>
          <h2 className="text-xl font-bold mt-1 tracking-[0.2em]">EXIT SURVEY</h2>
        </div>

        <img src={tower} alt="NPTC Tower" className="w-28 h-28 object-contain" />
      </div>

      {/* Meta row — NO underlines */}
      <div className="mb-4 flex gap-8">
        <p className="text-sm font-bold">
          Department: <span className="font-normal px-2">{DEPARTMENT_NAMES[department]}</span>
        </p>
        <p className="text-sm font-bold">
          Term: <span className="font-normal px-2">VI</span>
        </p>
        <p className="text-sm font-bold">
          Total Students: <span className="font-normal px-2">{displayTotal}</span>
        </p>
      </div>

      {/* Section A: Facilities */}
      <div className="mb-2">
        <h3 className="text-sm font-bold mb-1 uppercase underline">A. Institutional Feedback</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left w-2/3">Criteria</th>
              <th className="border border-black p-1 text-center">Very Good (4)</th>
              <th className="border border-black p-1 text-center">Good (3)</th>
              <th className="border border-black p-1 text-center">Average (2)</th>
              <th className="border border-black p-1 text-center">Below Avg (1)</th>
              <th className="border border-black p-1 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {facilityQuestions.map(q => {
              const row = getQuestionRow('facilities', q.id);
              return (
                <tr key={q.id}>
                  <td className="border border-black p-1">{q.id}. {q.text}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.very_good_4 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.good_3 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.average_2 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.below_average_1 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.total_count || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section B: Participation */}
      <div className="mb-2">
        <h3 className="text-sm font-bold mb-1 uppercase underline">B. Students Participation</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left w-12">S.No</th>
              <th className="border border-black p-1 text-left">Question</th>
              <th className="border border-black p-1 text-center">Very Good (4)</th>
              <th className="border border-black p-1 text-center">Good (3)</th>
              <th className="border border-black p-1 text-center">Average (2)</th>
              <th className="border border-black p-1 text-center">Below Avg (1)</th>
              <th className="border border-black p-1 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {participationQuestions.map(q => {
              const row = getQuestionRow('participation', q.id);
              return (
                <tr key={q.id}>
                  <td className="border border-black p-1 text-center">{q.id}</td>
                  <td className="border border-black p-1">{q.text}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.very_good_4 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.good_3 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.average_2 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.below_average_1 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.total_count || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section C: Accomplishment (with dept-specific PSO) */}
      <div className="mb-2">
        <h3 className="text-sm font-bold mb-1 uppercase underline">C. Assessment of Accomplishment</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left w-12">S.No</th>
              <th className="border border-black p-1 text-left">Criteria</th>
              <th className="border border-black p-1 text-center">Very Good (4)</th>
              <th className="border border-black p-1 text-center">Good (3)</th>
              <th className="border border-black p-1 text-center">Average (2)</th>
              <th className="border border-black p-1 text-center">Below Avg (1)</th>
              <th className="border border-black p-1 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {dynamicAccomplishmentQuestions.map(q => {
              const row = getQuestionRow('accomplishment', q.id);
              return (
                <tr key={q.id}>
                  <td className="border border-black p-1 text-center">{q.id}</td>
                  <td className="border border-black p-1">{q.text}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.very_good_4 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.good_3 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.average_2 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.below_average_1 || 0}</td>
                  <td className="border border-black p-1 text-center font-bold">{row?.total_count || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Suggestions section REMOVED as per request */}

      {/* Footer */}
      <div className="mt-8 print-avoid-break">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Exit Survey Report — {DEPARTMENT_NAMES[department]}</span>
        </div>
        <div className="flex justify-between mt-12 text-xs">
          <div className="text-center">
            <div className="border-t border-black w-40 mb-1" />
            <p>HOD Signature</p>
          </div>
          <div className="text-center">
            <div className="border-t border-black w-40 mb-1" />
            <p>Principal Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
