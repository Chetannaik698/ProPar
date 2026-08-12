import { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';

interface GmailComposeFlowProps {
  onStartAnalysis: (promptText: string) => void;
  onClose: () => void;
}

interface GmailQuestion {
  id: string;
  question: string;
  placeholder?: string;
}

const CATEGORIES = [
  'Job Application',
  'Follow-up Email',
  'Client Proposal',
  'Cold Outreach',
  'Leave Request',
  'Complaint',
  'Thank You Email',
  'Meeting Request',
  'Custom',
] as const;

const QUESTIONS_MAP: Record<string, GmailQuestion[]> = {
  'job application': [
    { id: 'company', question: 'Which company are you applying to?', placeholder: 'e.g. Google' },
    { id: 'role', question: 'What is the role or job title?', placeholder: 'e.g. Software Engineer Intern' },
    { id: 'source', question: 'How did you find this opportunity?', placeholder: 'e.g. LinkedIn, referral' },
    { id: 'skills', question: 'Which skills or experiences should be highlighted?', placeholder: 'e.g. React, Node.js' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional yet enthusiastic, friendly' },
  ],
  'follow-up email': [
    { id: 'recipient', question: 'Who is the recipient?', placeholder: 'e.g. Client, Hiring Manager' },
    { id: 'topic', question: 'What are you following up on?', placeholder: 'e.g. Previous proposal, interview status' },
    { id: 'context', question: 'What context should be recalled?', placeholder: 'e.g. We met last Tuesday' },
    { id: 'outcome', question: 'What outcome or next steps do you want?', placeholder: 'e.g. Schedule a call, get feedback' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Polite, direct' },
  ],
  'client proposal': [
    { id: 'client', question: 'Who is the client or company?', placeholder: 'e.g. Acme Corp' },
    { id: 'project', question: 'What is the project name or proposal topic?', placeholder: 'e.g. Website Redesign' },
    { id: 'details', question: 'What key solutions or details are you proposing?', placeholder: 'e.g. Modern UI, 3-month timeline' },
    { id: 'deadline', question: 'What is the deadline or timeline?', placeholder: 'e.g. Next Friday' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional, persuasive' },
  ],
  'cold outreach': [
    { id: 'recipient', question: 'Who is the recipient and their company?', placeholder: 'e.g. Head of Product at Vercel' },
    { id: 'purpose', question: 'What is the purpose of this outreach?', placeholder: 'e.g. Partnership inquiry' },
    { id: 'value', question: 'What value can you offer them?', placeholder: 'e.g. Streamline deployment workflow' },
    { id: 'outcome', question: 'What action do you want them to take?', placeholder: 'e.g. A 10-minute introductory call' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional, direct, personalized' },
  ],
  'leave request': [
    { id: 'manager', question: 'Who is your manager / the recipient?', placeholder: 'e.g. Sarah' },
    { id: 'dates', question: 'What are the start and end dates of the leave?', placeholder: 'e.g. August 5th to August 12th' },
    { id: 'reason', question: 'What is the reason for the leave?', placeholder: 'e.g. Family vacation' },
    { id: 'handover', question: 'Who will handle your tasks while away?', placeholder: 'e.g. John will cover support tickets' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional, formal' },
  ],
  'complaint': [
    { id: 'recipient', question: 'Who is the recipient?', placeholder: 'e.g. Support Team, Landlord' },
    { id: 'issue', question: 'What is the issue or incident context?', placeholder: 'e.g. Defective item delivered' },
    { id: 'details', question: 'What are the important details or dates?', placeholder: 'e.g. Ordered on July 10, Order #12345' },
    { id: 'outcome', question: 'What outcome or resolution do you expect?', placeholder: 'e.g. Full refund' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Firm but polite' },
  ],
  'thank you email': [
    { id: 'recipient', question: 'Who is the recipient?', placeholder: 'e.g. Mentor, Client' },
    { id: 'reason', question: 'What are you thanking them for?', placeholder: 'e.g. Advice on career path' },
    { id: 'impact', question: 'What was the impact of their action?', placeholder: 'e.g. Helped me land the internship' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Warm, professional, sincere' },
  ],
  'meeting request': [
    { id: 'recipient', question: 'Who is the recipient?', placeholder: 'e.g. Project team, client' },
    { id: 'purpose', question: 'What is the meeting purpose or topic?', placeholder: 'e.g. Project kick-off' },
    { id: 'details', question: 'Preferred meeting details (date, time, duration)?', placeholder: 'e.g. 30 mins, next Tuesday afternoon' },
    { id: 'outcome', question: 'What outcome or next steps do you want?', placeholder: 'e.g. Align on tasks' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional, collaborative' },
  ],
  'custom': [
    { id: 'recipient', question: 'Who is the recipient?', placeholder: 'e.g. Colleague, Client' },
    { id: 'purpose', question: 'What is your purpose?', placeholder: 'e.g. Ask for project update' },
    { id: 'outcome', question: 'What outcome do you want?', placeholder: 'e.g. Receive the latest designs' },
    { id: 'details', question: 'Any important details or context?', placeholder: 'e.g. Need them before tomorrow’s call' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional, casual' },
  ],
};

function detectCategoryFromCustom(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('job') || lower.includes('apply') || lower.includes('application') || lower.includes('internship') || lower.includes('position')) {
    return 'job application';
  }
  if (lower.includes('follow') || lower.includes('followup') || lower.includes('follow-up')) {
    return 'follow-up email';
  }
  if (lower.includes('proposal') || lower.includes('pitch') || lower.includes('client')) {
    return 'client proposal';
  }
  if (lower.includes('cold') || lower.includes('reach') || lower.includes('outreach') || lower.includes('intro')) {
    return 'cold outreach';
  }
  if (lower.includes('leave') || lower.includes('vacation') || lower.includes('off') || lower.includes('time off')) {
    return 'leave request';
  }
  if (lower.includes('complaint') || lower.includes('complain') || lower.includes('issue') || lower.includes('wrong')) {
    return 'complaint';
  }
  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('appreciate')) {
    return 'thank you email';
  }
  if (lower.includes('meet') || lower.includes('meeting') || lower.includes('schedule') || lower.includes('calendar')) {
    return 'meeting request';
  }
  return 'custom';
}

export function GmailComposeFlow({ onStartAnalysis }: GmailComposeFlowProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customObjective, setCustomObjective] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const detectedCategory = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'Custom') {
      return selectedCategory.toLowerCase();
    }
    if (customObjective) {
      return detectCategoryFromCustom(customObjective);
    }
    return 'custom';
  }, [selectedCategory, customObjective]);

  const questions = useMemo(() => {
    return QUESTIONS_MAP[detectedCategory] || QUESTIONS_MAP['custom'];
  }, [detectedCategory]);

  const isStep1Valid = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'Custom') return true;
    return customObjective.trim().length >= 3;
  }, [selectedCategory, customObjective]);

  const isStep2Valid = useMemo(() => {
    return questions.some((q) => (answers[q.id] ?? '').trim().length > 0);
  }, [answers, questions]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'Custom') {
      setStep(2);
    }
  };

  const handleNext = () => {
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setAnswers({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) return;

    const objective = selectedCategory === 'Custom' || !selectedCategory ? customObjective : selectedCategory;
    const parts = [
      `Objective: ${objective}`,
      `Category Context: Detected as ${detectedCategory}`,
      '',
      'Details provided:',
      ...questions
        .filter((q) => (answers[q.id] ?? '').trim().length > 0)
        .map((q) => `- ${q.question} Answer: ${answers[q.id].trim()}`),
    ];

    onStartAnalysis(parts.join('\n'));
  };

  if (step === 1) {
    return (
      <div className="clarify-view">
        <div className="results-intro">
          <div>
            <p className="results-kicker">Compose with ProPar</p>
            <h2>What would you like to write?</h2>
          </div>
        </div>

        <div className="clarify-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 20px 20px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? 'clarify-option clarify-option-selected' : 'clarify-option'}
              onClick={() => handleCategoryClick(cat)}
              type="button"
              style={{ padding: '12px', textAlign: 'center', justifyContent: 'center' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedCategory === 'Custom' && (
          <div style={{ padding: '0 20px 20px' }}>
            <label className="clarify-custom" style={{ margin: 0 }}>
              <span>Describe your email objective</span>
              <textarea
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                placeholder="e.g. Ask landlord to repair the sink next Monday..."
                rows={3}
              />
            </label>
            <button
              className="primary-action"
              onClick={handleNext}
              disabled={!isStep1Valid}
              type="button"
              style={{ width: '100%', marginTop: '12px' }}
            >
              Next <Sparkles size={14} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="clarify-view" onSubmit={handleSubmit}>
      <div className="results-intro" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="icon-button" onClick={handleBack} type="button" aria-label="Go back">
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="results-kicker">Guided details</p>
          <h2 style={{ fontSize: '16px' }}>Provide context for {selectedCategory === 'Custom' ? 'your email' : selectedCategory}</h2>
        </div>
      </div>

      <section className="clarify-section" aria-label="Adaptive details" style={{ maxHeight: '280px', overflowY: 'auto', padding: '0 20px 20px' }}>
        {questions.map((q) => (
          <article key={q.id} className="clarify-card" style={{ marginBottom: '12px', padding: '12px' }}>
            <div className="clarify-card-header" style={{ marginBottom: '8px' }}>
              <h3 className="clarify-question" style={{ fontSize: '13px', fontWeight: '600' }}>{q.question}</h3>
            </div>
            <label className="clarify-custom" style={{ margin: 0 }}>
              <textarea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={q.placeholder}
                rows={2}
              />
            </label>
          </article>
        ))}
      </section>

      <div style={{ padding: '0 20px 20px' }}>
        <button className="primary-action clarify-submit" disabled={!isStep2Valid} type="submit" style={{ width: '100%' }}>
          <Send size={15} style={{ marginRight: '6px' }} />
          Generate Email
        </button>
      </div>
    </form>
  );
}
