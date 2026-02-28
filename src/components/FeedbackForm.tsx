import { useState } from 'react';
import { motion } from 'framer-motion';
import { facilityQuestions, participationQuestions, accomplishmentQuestions } from '@/data/questions';
import { FeedbackAnswer, FeedbackSubmission, RATING_LABELS } from '@/types';
import { CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getDeptPSO } from '@/data/pso';

interface Props {
  rollNo: string;
  studentName: string;
  department: string;
  onSubmitted: () => void;
}

export default function FeedbackForm({ rollNo, studentName, department, onSubmitted }: Props) {
  const [facilityAnswers, setFacilityAnswers] = useState<Record<number, number>>({});
  const [participationAnswers, setParticipationAnswers] = useState<Record<number, number>>({});
  const [accomplishmentAnswers, setAccomplishmentAnswers] = useState<Record<number, number>>({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [generalStrengths, setGeneralStrengths] = useState('');
  const [generalImprovements, setGeneralImprovements] = useState('');
  const [generalAdmin, setGeneralAdmin] = useState('');
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build accomplishment questions with department-specific PSO text
  const pso = getDeptPSO(department);
  const dynamicAccomplishmentQuestions = accomplishmentQuestions.map(q => {
    if (q.id === 8) return { ...q, text: `PSO1: ${pso.pso1}` };
    if (q.id === 9) return { ...q, text: `PSO2: ${pso.pso2}` };
    return q;
  });

  const validateStep = (): boolean => {
    if (step === 0 && Object.keys(facilityAnswers).length < facilityQuestions.length) {
      setError('Please answer all facility questions');
      return false;
    }
    if (step === 1 && Object.keys(participationAnswers).length < participationQuestions.length) {
      setError('Please answer all participation questions');
      return false;
    }
    if (step === 2 && Object.keys(accomplishmentAnswers).length < accomplishmentQuestions.length) {
      setError('Please answer all accomplishment questions');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const answers: FeedbackAnswer[] = [
        ...Object.entries(facilityAnswers).map(([id, rating]) => ({ questionId: Number(id), section: 'facilities' as const, rating })),
        ...Object.entries(participationAnswers).map(([id, rating]) => ({ questionId: Number(id), section: 'participation' as const, rating })),
        ...Object.entries(accomplishmentAnswers).map(([id, rating]) => ({ questionId: Number(id), section: 'accomplishment' as const, rating })),
      ];

      const submission: FeedbackSubmission = {
        rollNo,
        studentName,
        department,
        answers,
        strengths,
        improvements,
        generalStrengths,
        generalImprovements,
        generalAdmin,
        submittedAt: new Date().toISOString(),
      };

      const response = await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }
      setStep(3); // Moved to a success screen index, 3 is now success since total steps is 3
      onSubmitted();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit feedback. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {

    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16">
        <CheckCircle className="mx-auto mb-4 text-success" size={64} />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Feedback Submitted Successfully!</h2>
        <p className="text-muted-foreground">Thank you for your valuable feedback.</p>
      </motion.div>
    );
  }

  const steps = ['Facilities', 'Participation', 'Accomplishment'];


  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              <span>{i + 1}</span>
              <span>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {/* Step 0: Facilities */}
        {step === 0 && (
          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-4">General Assessment - Facilities</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border p-3 text-left">S.No</th>
                    <th className="border p-3 text-left">Criteria</th>
                    {RATING_LABELS.slice().reverse().map(l => (
                      <th key={l} className="border p-3 text-center whitespace-nowrap">{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {facilityQuestions.map((q, i) => (
                    <tr key={q.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="border p-3 text-center">{q.id}</td>
                      <td className="border p-3">{q.text}</td>
                      {[4, 3, 2, 1].map(val => (
                        <td key={val} className="border p-3 text-center">
                          <input
                            type="radio"
                            name={`facility-${q.id}`}
                            checked={facilityAnswers[q.id] === val}
                            onChange={() => setFacilityAnswers(prev => ({ ...prev, [q.id]: val }))}
                            className="w-4 h-4 accent-primary"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 1: Participation */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-4">B. Students Participation</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border p-3 text-left">S.No</th>
                    <th className="border p-3 text-left">Question</th>
                    {RATING_LABELS.slice().reverse().map(l => (
                      <th key={l} className="border p-3 text-center whitespace-nowrap">{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participationQuestions.map((q, i) => (
                    <tr key={q.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="border p-3 text-center">{q.id}</td>
                      <td className="border p-3">{q.text}</td>
                      {[4, 3, 2, 1].map(val => (
                        <td key={val} className="border p-3 text-center">
                          <input
                            type="radio"
                            name={`part-${q.id}`}
                            checked={participationAnswers[q.id] === val}
                            onChange={() => setParticipationAnswers(prev => ({ ...prev, [q.id]: val }))}
                            className="w-4 h-4 accent-primary"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 2: Accomplishment */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-4">C. Assessment of Accomplishment</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border p-3 text-left w-12">S.No</th>
                    <th className="border p-3 text-left">Criteria</th>
                    {RATING_LABELS.slice().reverse().map(l => (
                      <th key={l} className="border p-3 text-center whitespace-nowrap">{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dynamicAccomplishmentQuestions.map((q, i) => (
                    <tr key={q.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="border p-3 text-center">{q.id}</td>
                      <td className="border p-3 text-sm">{q.text}</td>
                      {[4, 3, 2, 1].map(val => (
                        <td key={val} className="border p-3 text-center">
                          <input
                            type="radio"
                            name={`acc-${q.id}`}
                            checked={accomplishmentAnswers[q.id] === val}
                            onChange={() => setAccomplishmentAnswers(prev => ({ ...prev, [q.id]: val }))}
                            className="w-4 h-4 accent-primary"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Text Comments - REMOVED AS REQUESTED */}
      </motion.div>


      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <button onClick={() => { setStep(s => s - 1); setError(''); }} className="px-6 py-3 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium">
            Previous
          </button>
        ) : <div />}
        {step < 2 ? (
          <button onClick={handleNext} className="btn-college rounded-lg">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn-college rounded-lg bg-success disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        )}

      </div>
    </div>
  );
}
