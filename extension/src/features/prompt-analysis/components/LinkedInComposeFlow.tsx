import { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';

interface LinkedInComposeFlowProps {
  onStartAnalysis: (promptText: string) => void;
  onClose: () => void;
}

interface LinkedInQuestion {
  id: string;
  question: string;
  placeholder?: string;
}

const CATEGORIES = [
  'Thought Leadership',
  'Career Milestone',
  'Personal Story',
  'Product Launch',
  "We're Hiring",
  'How-To Guide',
  'Event Recap',
  'Case Study',
  'Custom',
] as const;

const QUESTIONS_MAP: Record<string, LinkedInQuestion[]> = {
  'thought leadership': [
    { id: 'topic', question: 'What industry trend, framework, or insight do you want to share?', placeholder: 'e.g. Why micro-frontends fail without domain ownership' },
    { id: 'takeaway', question: 'What is the core takeaway or counter-intuitive perspective?', placeholder: 'e.g. Focus on team boundaries before technical split' },
    { id: 'audience', question: 'Who is your target audience on LinkedIn?', placeholder: 'e.g. Engineering Directors, Tech Leads, Founders' },
    { id: 'cta', question: 'What open question or CTA should drive comments?', placeholder: 'e.g. What is your experience with micro-services?' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Insightful, authoritative, conversational' },
  ],
  'career milestone': [
    { id: 'milestone', question: 'What milestone or achievement are you sharing?', placeholder: 'e.g. Promoted to Principal Engineer at Stripe' },
    { id: 'reflection', question: 'What personal story, hard lesson, or reflection stands out?', placeholder: 'e.g. Failing my first system architecture review 3 years ago' },
    { id: 'thanks', question: 'Who would you like to mention or thank?', placeholder: 'e.g. Mentors, past team, leadership' },
    { id: 'takeaway', question: 'What advice do you have for others on a similar path?', placeholder: 'e.g. Focus on compounding small daily skills' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Grateful, inspiring, humble' },
  ],
  'personal story': [
    { id: 'situation', question: 'What challenge, mistake, or pivot happened?', placeholder: 'e.g. Losing our first 10 enterprise customers in month 1' },
    { id: 'lesson', question: 'What key lesson or mindset shift did it teach you?', placeholder: 'e.g. Talk to customers daily instead of building in isolation' },
    { id: 'outcome', question: 'What was the result or growth after solving it?', placeholder: 'e.g. Grew from $0 to $1M ARR in 12 months' },
    { id: 'cta', question: 'What question will spark discussion in the comments?', placeholder: 'e.g. Have you ever had to rebuild a product from scratch?' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Authentic, vulnerable, motivational' },
  ],
  'product launch': [
    { id: 'product', question: 'What are you launching or announcing?', placeholder: 'e.g. ProPaar Chrome Extension 2.0' },
    { id: 'value', question: 'What major problem does it solve for users?', placeholder: 'e.g. Eliminates weak prompts and unpolished post drafts before send' },
    { id: 'features', question: 'Key 2-3 features or highlights?', placeholder: 'e.g. Instant RAG analysis, multi-platform support' },
    { id: 'cta', question: 'Call to action / link context?', placeholder: 'e.g. Try it free on Chrome Web Store (link in comments)' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Energetic, professional, concise' },
  ],
  "we're hiring": [
    { id: 'role', question: 'What role and team are you hiring for?', placeholder: 'e.g. Senior Frontend Engineer (React/TypeScript)' },
    { id: 'team', question: 'What makes this role or team exciting?', placeholder: 'e.g. Building developer tools used by 50k+ creators' },
    { id: 'requirements', question: 'Key skills or traits you are looking for?', placeholder: 'e.g. 5+ yrs React, browser extension experience, ownership mindset' },
    { id: 'cta', question: 'How should interested candidates reach out?', placeholder: 'e.g. DM me directly or apply via link in comments' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Welcoming, high-energy, direct' },
  ],
  'how-to guide': [
    { id: 'skill', question: 'What actionable skill or process are you teaching?', placeholder: 'e.g. How to structure a high-converting B2B landing page' },
    { id: 'steps', question: 'What are the 3-5 clear steps?', placeholder: 'e.g. 1. Value prop above fold, 2. Social proof grid, 3. Single CTA' },
    { id: 'mistake', question: 'What common mistake should readers avoid?', placeholder: 'e.g. Having multiple competing primary buttons' },
    { id: 'cta', question: 'What question should wrap up the post?', placeholder: 'e.g. Which landing page section do you find hardest to optimize?' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Practical, structured, educational' },
  ],
  'event recap': [
    { id: 'event', question: 'What event, conference, or workshop did you attend?', placeholder: 'e.g. React Summit 2026' },
    { id: 'learnings', question: 'What were your top 3 key takeaways?', placeholder: 'e.g. Server components maturity, AI-driven UI generators, state performance' },
    { id: 'connections', question: 'Shoutouts or notable speakers met?', placeholder: 'e.g. Inspiring keynote by Sarah Drasner' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Enthusiastic, networking-focused' },
  ],
  'case study': [
    { id: 'project', question: 'What project, client work, or case study are you sharing?', placeholder: 'e.g. Reducing mobile app latency by 65%' },
    { id: 'metrics', question: 'What metrics or tangible results were achieved?', placeholder: 'e.g. Reduced load time from 4.2s to 1.1s, +28% retention' },
    { id: 'approach', question: 'What technical approach or strategy delivered these results?', placeholder: 'e.g. Optimizing bundle splits and caching static JSON assets' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Metric-driven, authoritative, professional' },
  ],
  'custom': [
    { id: 'topic', question: 'What topic or message do you want to post about?', placeholder: 'e.g. Lessons from scaling remote teams across 4 timezones' },
    { id: 'audience', question: 'Who is your target audience on LinkedIn?', placeholder: 'e.g. Founders, HR Leaders, Remote Workers' },
    { id: 'takeaway', question: 'What main takeaway should readers gain?', placeholder: 'e.g. Async documentation beats endless status meetings' },
    { id: 'cta', question: 'What question or CTA should end the post?', placeholder: 'e.g. How does your team handle cross-timezone alignment?' },
    { id: 'tone', question: 'Preferred tone?', placeholder: 'e.g. Professional, engaging' },
  ],
};

function detectCategoryFromCustom(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('hire') || lower.includes('hiring') || lower.includes('job') || lower.includes('recruit') || lower.includes('opening')) {
    return "we're hiring";
  }
  if (lower.includes('launch') || lower.includes('announce') || lower.includes('release') || lower.includes('product')) {
    return 'product launch';
  }
  if (lower.includes('story') || lower.includes('lesson') || lower.includes('mistake') || lower.includes('failure')) {
    return 'personal story';
  }
  if (lower.includes('promot') || lower.includes('milestone') || lower.includes('career') || lower.includes('role')) {
    return 'career milestone';
  }
  if (lower.includes('how to') || lower.includes('guide') || lower.includes('step') || lower.includes('framework')) {
    return 'how-to guide';
  }
  if (lower.includes('event') || lower.includes('conference') || lower.includes('summit') || lower.includes('recap')) {
    return 'event recap';
  }
  if (lower.includes('metric') || lower.includes('result') || lower.includes('case study') || lower.includes('client')) {
    return 'case study';
  }
  if (lower.includes('thought') || lower.includes('trend') || lower.includes('insight') || lower.includes('industry')) {
    return 'thought leadership';
  }
  return 'custom';
}

export function LinkedInComposeFlow({ onStartAnalysis }: LinkedInComposeFlowProps) {
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
      `LinkedIn Post Objective: ${objective}`,
      `Category Context: Detected as ${detectedCategory}`,
      '',
      'Details provided for LinkedIn Post optimization:',
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
            <p className="results-kicker">Craft LinkedIn Post with ProPaar</p>
            <h2>What kind of post are you writing?</h2>
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
              <span>Describe your LinkedIn post topic</span>
              <textarea
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                placeholder="e.g. Sharing 5 lessons learned from transitioning from developer to engineering manager..."
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
          <p className="results-kicker">LinkedIn Post Context</p>
          <h2 style={{ fontSize: '16px' }}>Provide details for {selectedCategory === 'Custom' ? 'your post' : selectedCategory}</h2>
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
          Generate & Review Post
        </button>
      </div>
    </form>
  );
}
