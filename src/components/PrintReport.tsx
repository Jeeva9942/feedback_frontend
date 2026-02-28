import { useRef } from 'react';
import { FeedbackSubmission, DEPARTMENT_NAMES, Department } from '@/types';
import { facilityQuestions, participationQuestions, accomplishmentQuestions } from '@/data/questions';
import logo from '@/assets/nptc_logo_new.png';
import tower from '@/assets/nptc_tower_new.png';

interface Props {
  department: Department;
  feedback: any[]; // Now receiving aggregate rows from [dept]_feedback table
}

export default function PrintReport({ department, feedback = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // feedback is now an array of rows like { question_code: 'A1', very_good_4: 10, ... }
  const getQuestionRow = (section: 'facilities' | 'accomplishment' | 'participation', questionId: number) => {
    let prefix = '';
    if (section === 'facilities') prefix = 'A';
    else if (section === 'participation') prefix = 'B';
    else if (section === 'accomplishment') prefix = 'C';

    const code = `${prefix}${questionId}`;
    return feedback.find(f => (f.question_code || '').toUpperCase() === code) || null;
  };

  // Find the max total_count to represent total students submitted for this dept
  const totalStudents = feedback.length > 0
    ? Math.max(...feedback.map(f => f.total_count || 0))
    : 0;

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
            Affiliated to State Board of Technical Education & Training Tamil Nadu
          </p>
          <p className="text-[9px] font-bold mt-0.5">
            Accredited by APACC (Asia Pacific Accreditation And Certification Commission), Philippines with Gold Level
          </p>

          <h2 className="text-xl font-bold mt-1 tracking-[0.2em]">EXIT SURVEY</h2>
        </div>

        <img src={tower} alt="NPTC Tower" className="w-28 h-28 object-contain" />
      </div>

      <div className="mb-4 flex gap-8">
        <p className="text-sm font-bold">Department: <span className="font-normal border-b border-black px-2">{DEPARTMENT_NAMES[department]}</span></p>
        <p className="text-sm font-bold">Term: <span className="font-normal border-b border-black px-2">VI</span></p>
        <p className="text-sm font-bold">Total Students: <span className="font-normal border-b border-black px-2">{totalStudents}</span></p>
      </div>

      {/* Section A: Facilities */}
      <div className="mb-2">
        <h3 className="text-sm font-bold text-foreground mb-1 uppercase underline">A. Institutional Feedback</h3>
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
        <h3 className="text-sm font-bold text-foreground mb-1 uppercase underline">B. Students Participation</h3>
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

      {/* Section C: Accomplishment */}
      <div className="mb-2">
        <h3 className="text-sm font-bold text-foreground mb-1 uppercase underline">C. Assessment of Accomplishment</h3>
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
            {accomplishmentQuestions.map(q => {
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


      {/* Strengths & Improvements */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground mb-1 uppercase underline">Suggestions</h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left w-1/2">Strengths</th>
              <th className="border border-black p-1 text-left w-1/2">Areas that need improvement</th>
            </tr>
          </thead>
          <tbody>
            {(feedback || []).filter(f => f.strengths || f.improvements).map((f, i) => (
              <tr key={i}>
                <td className="border border-black p-1">{f.strengths || '-'}</td>
                <td className="border border-black p-1">{f.improvements || '-'}</td>
              </tr>
            ))}
            {feedback.filter(f => f.strengths || f.improvements).length === 0 && (
              <tr>
                <td className="border border-black p-1 text-center" colSpan={2}>No suggestions recorded</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 print-avoid-break">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Exit Survey Report - {DEPARTMENT_NAMES[department]}</span>
        </div>
        <div className="flex justify-between mt-12 text-xs">
          <div className="text-center">
            <div className="border-t border-foreground w-40 mb-1" />
            <p className="text-foreground">HOD Signature</p>
          </div>
          <div className="text-center">
            <div className="border-t border-foreground w-40 mb-1" />
            <p className="text-foreground">Principal Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
