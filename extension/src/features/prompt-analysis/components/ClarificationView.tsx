import { CheckCircle2, MessageCircleQuestion, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import type { ClarificationAnswer, ClarificationQuestion } from '../types/analysis';

interface ClarificationViewProps {
  errorMessage?: string;
  questions: ClarificationQuestion[];
  onSubmit: (answers: ClarificationAnswer[]) => void;
}

type AnswerState = Record<string, string>;

export function ClarificationView({ errorMessage, questions, onSubmit }: ClarificationViewProps) {
  const [answers, setAnswers] = useState<AnswerState>({});

  const canSubmit = useMemo(
    () => questions.length > 0 && questions.every((question) => (answers[question.id] ?? '').trim().length > 0),
    [answers, questions],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit(
      questions.map((question) => ({
        questionId: question.id,
        answer: (answers[question.id] ?? '').trim(),
      })),
    );
  };

  return (
    <form className="clarify-view" onSubmit={handleSubmit}>
      <div className="results-intro">
        <div>
          <p className="results-kicker">Clarify before sending</p>
          <h2>A few details will improve the prompt.</h2>
        </div>
      </div>

      <section className="clarify-section" aria-label="Clarify Before Sending">
        {questions.map((question, index) => (
          <ClarificationQuestionCard
            key={question.id}
            index={index}
            question={question}
            value={answers[question.id] ?? ''}
            onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
          />
        ))}
      </section>

      {errorMessage ? <p className="clarify-error" role="alert">{errorMessage}</p> : null}

      <button className="primary-action clarify-submit" disabled={!canSubmit} type="submit">
        <Send size={15} />
        Generate Improved Prompt
      </button>
    </form>
  );
}

function ClarificationQuestionCard({
  index,
  onChange,
  question,
  value,
}: {
  index: number;
  onChange: (value: string) => void;
  question: ClarificationQuestion;
  value: string;
}) {
  const isAnswered = value.trim().length > 0;

  return (
    <article className="clarify-card">
      <div className="clarify-card-header">
        <span className={isAnswered ? 'question-icon question-icon-complete' : 'question-icon'}>
          {isAnswered ? <CheckCircle2 size={16} /> : <MessageCircleQuestion size={16} />}
        </span>
        <div>
          <p className="card-label">Question {index + 1}</p>
          <h3 className="clarify-question">{question.question}</h3>
          {question.reason || question.explanation ? <p className="clarify-explanation">{question.reason ?? question.explanation}</p> : null}
          {question.expectedImprovement ? <p className="clarify-explanation">{question.expectedImprovement}</p> : null}
          {question.informationGain ? <p className="clarify-explanation">{question.informationGain}</p> : null}
        </div>
      </div>

      {question.type === 'multiple-choice' && question.options?.length ? (
        <div className="clarify-options">
          {question.options.map((option) => (
            <button
              className={value === option ? 'clarify-option clarify-option-selected' : 'clarify-option'}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <label className="clarify-custom">
        <span>{question.type === 'multiple-choice' ? 'Custom answer' : 'Answer'}</span>
        <textarea
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer..."
          rows={3}
          value={question.options?.includes(value) ? '' : value}
        />
      </label>
    </article>
  );
}
