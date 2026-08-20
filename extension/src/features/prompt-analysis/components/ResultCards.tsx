import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, CheckCircle2, Clipboard, FilePenLine, LoaderCircle, MessageCircleQuestion, RefreshCw, Sparkles, X } from 'lucide-react';
import { analysisSteps } from '../model/analysis';
import type { CopyState } from './ResultsView';
import type { FormattedPrompt, FormattedPromptBlock } from '../services/promptFormatter';
import type { AssumptionAnalysisItem, BlindSpotItem, ExpertConsiderationItem, GoalDiscovery, InferredGoalItem, MissingContextItem, RecommendationItem } from '../types/analysis';
import type { PlatformLabels } from '../../../platform/adapters/types';
import { getActivePlatformAdapter } from '../../../platform/adapters/registry';

export function EmptyState({ labels, onStart }: { labels: PlatformLabels; onStart: () => void }) {
  return (
    <section className="state-view empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <div className="empty-spark"><Sparkles size={22} strokeWidth={1.8} /></div>
        <div className="empty-prompt-line empty-prompt-line-short" />
        <div className="empty-prompt-line" />
      </div>
      <div><h2 className="state-title">{labels.emptyTitle}</h2><p className="state-description">{labels.emptyDescription}</p></div>
      <button className="primary-action" onClick={onStart} type="button">{labels.analyzeAction}</button>
    </section>
  );
}

export function ErrorState({ message, onRetry, onDismiss }: { message: string; onRetry: () => void; onDismiss: () => void }) {
  return (
    <section className="state-view error-state" role="alert">
      <div className="state-icon state-icon-error"><X size={20} /></div>
      <div><h2 className="state-title">Unable to connect to ProPaar.</h2><p className="state-description">{message || 'Please check your connection and try again.'}</p></div>
      <div className="state-actions">
        <button className="primary-action" onClick={onRetry} type="button"><RefreshCw size={15} /> Retry</button>
        <button className="secondary-action" onClick={onDismiss} type="button">Dismiss</button>
      </div>
    </section>
  );
}

export function LoadingState({ completedStepCount }: { completedStepCount: number }) {
  const reduceMotion = useReducedMotion();
  const platform = getActivePlatformAdapter();
  const isLinkedIn = platform.id === 'linkedin';

  const steps = isLinkedIn
    ? [
        'Analyzing post purpose',
        'Evaluating hook & flow',
        'Checking engagement & structure',
        'Reviewing personal branding',
      ]
    : analysisSteps;

  const title = isLinkedIn ? 'Reviewing your post...' : 'Analyzing your thinking...';
  const description = isLinkedIn ? 'Analyzing hook, structure, and branding.' : 'Mapping intent, context, and assumptions.';

  return (
    <motion.section 
      animate={{ opacity: 1 }} 
      className="state-view loading-state" 
      initial={{ opacity: 0 }} 
      transition={{ duration: reduceMotion ? 0 : 0.24 }} 
      aria-live="polite"
    >
      <div className="loading-heading">
        <span className="state-icon state-icon-loading">
          <LoaderCircle className="loading-spinner" size={20} />
        </span>
        <div>
          <h2 className="state-title">{title}</h2>
          <p className="state-description">{description}</p>
        </div>
      </div>
      
      <div className="thinking-stepper">
        {steps.map((step, index) => {
          const isCompleted = index < completedStepCount;
          const isActive = index === completedStepCount;
          
          let statusClass = 'step-item';
          let icon = <div className="step-bullet-pending" />;
          
          if (isCompleted) {
            statusClass = 'step-item step-item-completed';
            icon = <CheckCircle2 size={16} />;
          } else if (isActive) {
            statusClass = 'step-item step-item-active';
            icon = <LoaderCircle size={16} className="loading-spinner" />;
          }
          
          return (
            <div key={step} className={statusClass}>
              <div className="step-icon">
                {icon}
              </div>
              <span className="step-text">
                {step}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="progress-steps" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span 
            className={index < completedStepCount ? 'step-dot step-dot-active' : 'step-dot'} 
            key={index} 
          />
        ))}
      </div>
    </motion.section>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      {[0, 1, 2].map((index) => <div className="skeleton-card" key={index}><div className="skeleton-line skeleton-line-short" /><div className="skeleton-line" /></div>)}
    </div>
  );
}

const scoreTone = (score: number) => {
  if (score >= 90) return { label: 'Excellent', tone: 'green' };
  if (score >= 70) return { label: 'Good', tone: 'blue' };
  if (score >= 50) return { label: 'Needs clarity', tone: 'orange' };
  return { label: 'Needs work', tone: 'red' };
};

export function ThinkingScoreCard({ score = 0 }: { score?: number }) {
  const reduceMotion = useReducedMotion();
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const { label, tone } = scoreTone(safeScore);
  return (
    <section className="result-card score-card">
      <div className="result-card-heading"><div><p className="card-label">Thinking Score</p><p className="card-caption">Prompt readiness</p></div><span className={`score-pill score-${tone}`}>{label}</span></div>
      <p className="score-value"><strong>{safeScore}</strong><span> / 100</span></p>
      <div className="score-track" aria-label={`Thinking score ${safeScore} out of 100`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeScore}>
        <motion.div animate={{ width: `${safeScore}%` }} className={`score-fill score-fill-${tone}`} initial={{ width: 0 }} transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </section>
  );
}

export function IntentCard({ intent }: { intent: string }) {
  return <section className="result-card intent-card"><div className="intent-icon"><Sparkles size={17} /></div><div><p className="card-label">I think you want to</p><h2 className="intent-value">{intent || 'Not detected'}</h2><p className="card-caption">This is the main outcome I found in your prompt.</p></div></section>;
}

export function GoalDiscoveryCard({ goalDiscovery, fallbackIntent, labels }: { fallbackIntent: string; goalDiscovery?: GoalDiscovery; labels: PlatformLabels }) {
  const hasGoalDiscovery = goalDiscovery && Object.values(goalDiscovery as Record<string, string | InferredGoalItem | undefined>).some((value) => {
    if (!value) return false;
    return typeof value === 'string' ? value.trim().length > 0 : value.value.trim().length > 0;
  });
  if (!hasGoalDiscovery && !fallbackIntent.trim()) return null;

  const goalText = (value: string | InferredGoalItem | undefined): { value: string; inferredBecause?: string } | undefined => {
    if (!value) return undefined;
    return typeof value === 'string' ? { value } : value;
  };

  const items = [
    { label: 'Primary Goal', detail: goalText(goalDiscovery?.primaryGoal) ?? { value: fallbackIntent } },
    { label: 'Secondary Goal', detail: goalText(goalDiscovery?.secondaryGoal) },
    { label: 'Hidden Motivation', detail: goalText(goalDiscovery?.hiddenMotivation ?? goalDiscovery?.hiddenGoal) },
    { label: 'Expected Success', detail: goalText(goalDiscovery?.expectedSuccess ?? goalDiscovery?.expectedOutcome) },
    { label: 'Possible Failure', detail: goalText(goalDiscovery?.possibleFailure) },
    { label: 'Task Type', detail: goalText(goalDiscovery?.taskType) },
  ].filter((item) => item.detail?.value.trim());

  return (
    <section className="result-card collection-card">
      <div><p className="card-label">{labels.goalDiscoveryTitle || 'Goal Discovery'}</p><p className="card-caption">{labels.goalCaption}</p></div>
      <div className="collection-list">
        {items.map((item) => (
          <div className="context-question detail-item" key={item.label}>
            <span className="question-icon"><Sparkles size={15} /></span>
            <div>
              <strong>{item.label}</strong>
              <p>{item.detail?.value}</p>
              {item.detail?.inferredBecause ? <p className="detail-impact">{item.detail.inferredBecause}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MetricCard({ value }: { value?: string }) {
  return <section className="result-card metric-card"><div className="result-card-heading"><div><p className="card-label">Estimated Improvement</p><p className="card-caption">With the refined prompt</p></div><span className="trend-icon"><ArrowUpRight size={17} /></span></div><p className="metric-value">{value || 'N/A'}</p></section>;
}

const isMissingContextItem = (item: string | MissingContextItem): item is MissingContextItem => typeof item !== 'string';
const isAssumptionItem = (item: string | AssumptionAnalysisItem): item is AssumptionAnalysisItem => typeof item !== 'string';
const isRecommendationItem = (item: string | RecommendationItem): item is RecommendationItem => typeof item !== 'string';

export function WhatChangedCard({ items = [], labels }: { items?: string[]; labels: PlatformLabels }) {
  if (!items.length) return null;

  return (
    <section className="result-card collection-card compact-card">
      <div><p className="card-label">What Changed</p><p className="card-caption">{labels.whatChangedCaption}</p></div>
      <div className="change-list-chips">
        {items.map((item, index) => (
          <span className="chip-item" key={`${item}-${index}`}>
            <CheckCircle2 size={13} style={{ flexShrink: 0, color: '#10b981' }} />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export function MissingContextCard({ items, labels }: { items: Array<string | MissingContextItem>; labels?: PlatformLabels }) {
  return (
    <section className="result-card collection-card">
      <div><p className="card-label">{labels?.missingContextTitle || 'Missing Context'}</p><p className="card-caption">{labels?.missingContextCaption || 'Only the details that would materially improve the answer.'}</p></div>
      <div className="collection-list">
        {items.length ? items.map((item, index) => {
          const title = isMissingContextItem(item) ? item.item : item;
          return (
            <div className="context-question detail-item" key={`${title}-${index}`}>
              <span className="question-icon"><MessageCircleQuestion size={16} /></span>
              <div>
                <strong>{title}</strong>
                {isMissingContextItem(item) ? (
                  <>
                    <p>{item.whyItMatters}</p>
                    <p className="detail-impact">{item.expectedImpact}</p>
                  </>
                ) : null}
              </div>
            </div>
          );
        }) : <p className="collection-empty"><CheckCircle2 size={16} /> No critical context is missing.</p>}
      </div>
    </section>
  );
}

const suggestionCopy = (suggestion: string | RecommendationItem) => {
  if (isRecommendationItem(suggestion)) {
    return {
      title: suggestion.recommendation,
      explanation: suggestion.consequence ? `${suggestion.reason} ${suggestion.consequence}` : suggestion.reason,
      benefit: suggestion.opportunity ? `${suggestion.expectedBenefit} Opportunity: ${suggestion.opportunity}` : suggestion.expectedBenefit,
    };
  }

  const clean = suggestion.trim().replace(/[.!]$/, '');
  const words = clean.split(/\s+/);
  return {
    title: words.slice(0, 4).join(' ') || 'Improve prompt',
    explanation: words.length > 4 ? clean : `${clean || 'Add more detail'} to make the final response more focused and useful.`,
    benefit: '',
  };
};

export function SuggestionCard({ suggestion }: { suggestion: string | RecommendationItem }) {
  const { title, explanation, benefit } = suggestionCopy(suggestion);
  return <div className="suggestion-card"><span className="suggestion-icon"><Check size={15} strokeWidth={2.5} /></span><span><strong className="suggestion-title">{title}</strong><span className="suggestion-text">{explanation}</span>{benefit ? <span className="suggestion-benefit">{benefit}</span> : null}</span></div>;
}

export function ThinkingCard({ thinkingGap, hiddenAssumptions, labels }: { hiddenAssumptions?: Array<string | AssumptionAnalysisItem>; thinkingGap?: string; labels: PlatformLabels }) {
  const assumptions = hiddenAssumptions ?? [];
  if (!thinkingGap?.trim() && !assumptions.length) return null;

  return (
    <section className="result-card collection-card">
      <div><p className="card-label">{labels.thinkingTitle || 'Before sending, consider...'}</p><p className="card-caption">{labels.thinkingCaption}</p></div>
      <div className="collection-list">
        {thinkingGap?.trim() ? (
          <div className="context-question" key="thinking-gap">
            <span className="question-icon"><MessageCircleQuestion size={16} /></span>
            <p>{thinkingGap}</p>
          </div>
        ) : null}
        {assumptions.map((item, index) => {
          const title = isAssumptionItem(item) ? item.assumption : item;
          return (
            <div className="context-question detail-item" key={`${title}-${index}`}>
              <span className="question-icon"><MessageCircleQuestion size={16} /></span>
              <div>
                <strong>{title}</strong>
                {isAssumptionItem(item) ? (
                  <>
                    <p><span>Risk:</span> {item.risk}</p>
                    <p><span>Detected because:</span> {item.detectedBecause}</p>
                    {item.challengeQuestion ? <p><span>Challenge:</span> {item.challengeQuestion}</p> : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function BlindSpotsCard({ items = [], labels }: { items?: BlindSpotItem[]; labels?: PlatformLabels }) {
  if (!items.length) return null;

  const sortedItems = [...items].sort((first, second) => (first.impactRank ?? 99) - (second.impactRank ?? 99));

  return (
    <section className="result-card collection-card">
      <div><p className="card-label">{labels?.blindSpotsTitle || 'Blind Spots'}</p><p className="card-caption">{labels?.blindSpotsCaption || 'High-value issues that may not be obvious yet.'}</p></div>
      <div className="collection-list">
        {sortedItems.slice(0, 5).map((item, index) => (
          <div className="context-question detail-item" key={`${item.blindSpot}-${index}`}>
            <span className="question-icon"><MessageCircleQuestion size={16} /></span>
            <div>
              <strong>{item.impactRank ? `#${item.impactRank} ${item.riskArea ?? 'Risk'}` : item.riskArea ?? 'Risk'}</strong>
              <p>{item.blindSpot}</p>
              <p className="detail-impact">{item.consequence ?? item.whyItMatters}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExpertConsiderationsCard({ items = [], labels }: { items?: ExpertConsiderationItem[]; labels?: PlatformLabels }) {
  if (!items.length) return null;

  return (
    <section className="result-card collection-card">
      <div><p className="card-label">{labels?.expertTitle || 'Expert Thinking'}</p><p className="card-caption">{labels?.expertCaption || 'Observations a strong specialist would consider before answering.'}</p></div>
      <div className="collection-list">
        {items.slice(0, 5).map((item, index) => (
          <div className="context-question detail-item" key={`${item.expert ?? item.consideration}-${index}`}>
            <span className="question-icon"><Sparkles size={15} /></span>
            <div>
              <strong>{item.expert ?? item.consideration}</strong>
              {item.standsOut ? <p><span>Stands out:</span> {item.standsOut}</p> : null}
              {item.concern ? <p><span>Concern:</span> {item.concern}</p> : null}
              {item.opportunity ? <p><span>Opportunity:</span> {item.opportunity}</p> : null}
              {!item.standsOut && item.whyItMatters ? <p>{item.whyItMatters}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromptBlock({ block }: { block: FormattedPromptBlock }) {
  if (block.type === 'heading') return <h3 className="formatted-prompt-heading">{block.text}</h3>;
  if (block.type === 'paragraph') return <p className="formatted-prompt-paragraph">{block.text}</p>;

  const listItems = block.items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>);
  return (
    <div className="formatted-prompt-section">
      {block.title ? <h3 className="formatted-prompt-heading">{block.title}</h3> : null}
      {block.type === 'numbered' ? <ol>{listItems}</ol> : <ul>{listItems}</ul>}
    </div>
  );
}

export function SuccessToast({ message }: { message: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="success-toast"
      initial={{ opacity: 0, y: 8, scale: reduceMotion ? 1 : 0.98 }}
      role="status"
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
    >
      <CheckCircle2 size={15} />
      {message}
    </motion.div>
  );
}

export function detectOpenAiPattern(text: string): { name: string; tag: string } | null {
  if (!text) return null;
  if (/Formatting re-enabled/i.test(text)) {
    return { name: 'Pattern 9: Reasoning Markdown Opt-In', tag: 'o-series Model' };
  }
  if (/\bGoal:\s/i.test(text) && /\bConstraints:\s/i.test(text)) {
    return { name: 'Pattern 6: High-Level Goal Prompt', tag: 'Reasoning Model (o1/o3/o4-mini)' };
  }
  if (/# Identity/i.test(text) && /# Instructions/i.test(text)) {
    return { name: 'Pattern 1: Structured Developer Message', tag: 'OpenAI Canonical Pattern' };
  }
  if (/# Identity/i.test(text) && /# Data/i.test(text)) {
    return { name: 'Pattern 7: Explicit Precise-Instruction', tag: 'GPT Model (GPT-4.1/5)' };
  }
  if (/Desired format:/i.test(text)) {
    return { name: 'Pattern 3: Format-by-Example', tag: 'Structured Output' };
  }
  if (/Text 1:/i.test(text) && /Output 1:/i.test(text)) {
    return { name: 'Pattern 4: Few-Shot Demonstration', tag: 'Task Demonstration' };
  }
  if (/Text:\s*"""/i.test(text) || /<task_instruction>/i.test(text)) {
    return { name: 'Pattern 2: Instruction-then-Delimited-Content', tag: 'Delimited Task' };
  }
  return { name: 'Pattern 1: Structured Developer Message', tag: 'OpenAI Prompt Standard' };
}

export function PreFlightSimulationCard({ preFlight }: { preFlight?: any }) {
  if (!preFlight || !preFlight.failureVectors?.length) return null;

  const riskColors: Record<string, { bg: string; border: string; text: string }> = {
    low: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', text: '#059669' },
    medium: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)', text: '#d97706' },
    high: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', text: '#dc2626' },
    critical: { bg: 'rgba(220, 38, 38, 0.15)', border: 'rgba(220, 38, 38, 0.4)', text: '#b91c1c' },
  };

  const currentRisk = riskColors[preFlight.overallRiskLevel] || riskColors.medium;

  return (
    <section className="result-card preflight-sim-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <p className="card-label">Pre-Flight LLM Failure Predictor</p>
          <p className="card-caption">Simulated risk vectors across target AI model architectures</p>
        </div>
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          background: currentRisk.bg,
          border: `1px solid ${currentRisk.border}`,
          color: currentRisk.text,
        }}>
          {preFlight.overallRiskLevel} RISK
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {preFlight.failureVectors.map((vector: any, idx: number) => (
          <div key={idx} style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--propaar-card-bg, rgba(255, 255, 255, 0.04))',
            border: '1px solid var(--propaar-card-border, rgba(255, 255, 255, 0.08))',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{vector.targetModel}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: vector.riskProbability > 70 ? '#ef4444' : '#f59e0b' }}>
                {vector.riskProbability}% Risk
              </span>
            </div>
            <p style={{ fontSize: '12px', margin: '2px 0 4px 0', opacity: 0.85 }}>{vector.description}</p>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🛡️ Pre-Flight Shield:</span> <span>{vector.mitigation}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ImprovedPromptCard({ formattedPrompt, copyState, replaceState, onCopy, onReplace, labels }: { formattedPrompt: FormattedPrompt; copyState: CopyState; replaceState: 'idle' | 'ready' | 'success'; onCopy: () => Promise<void>; onReplace: () => void; labels: PlatformLabels }) {
  const platform = getActivePlatformAdapter();
  const isChatGPT = platform.id === 'chatgpt';
  const openAiPattern = isChatGPT ? detectOpenAiPattern(formattedPrompt.text) : null;

  return (
    <section className="result-card improved-prompt-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p className="card-label">{labels.finalCardLabel}</p>
          <p className="card-caption">{labels.finalCardCaption}</p>
        </div>
        {openAiPattern && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '11px', fontWeight: 600, color: '#059669' }}>
            <Sparkles size={13} />
            <span>{openAiPattern.name}</span>
          </div>
        )}
      </div>
      <div className="prompt-box">{formattedPrompt.blocks.map((block, index) => <PromptBlock block={block} key={`${block.type}-${index}`} />)}</div>
      <div className="prompt-actions">
        <button className={copyState === 'copied' ? 'secondary-action action-success' : 'secondary-action'} onClick={() => { void onCopy(); }} type="button">{copyState === 'copied' ? <CheckCircle2 size={15} /> : <Clipboard size={15} />}{copyState === 'copied' ? 'Copied!' : 'Copy'}</button>
        <button className={replaceState !== 'idle' ? 'primary-action action-success' : 'primary-action'} onClick={onReplace} type="button">{replaceState !== 'idle' ? <CheckCircle2 size={15} /> : <FilePenLine size={15} />}{replaceState !== 'idle' ? labels.replacedAction : labels.replaceAction}</button>
      </div>
      {replaceState === 'success' ? <SuccessToast message={labels.successToast} /> : null}
    </section>
  );
}
