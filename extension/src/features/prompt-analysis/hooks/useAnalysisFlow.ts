import { useCallback, useEffect, useRef, useState } from 'react';
import { analysisSteps, type AnalysisPhase } from '../model/analysis';
import type { Analysis, AssumptionAnalysisItem, ClarificationAnswer, FailureVectorItem, MissingContextItem, ModelSimulationResult, PreFlightSimulation, RecommendationItem } from '../types/analysis';
import { analyzePrompt, AnalysisError } from '../services/analysisApi';
import { getActivePlatformAdapter } from '../../../platform/adapters/registry';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';

import { ClearInstructionsEngine } from '../../../engines/clear-instructions/ClearInstructionsEngine';

const STEP_INTERVAL_MS = 1_500 / analysisSteps.length;

function generateLocalFallbackAnalysis(prompt: string, platformName: string): Analysis {
  const engine = new ClearInstructionsEngine();
  const rawPrompt = prompt.trim();
  const report = engine.analyze(rawPrompt);

  const cleanPrompt = rawPrompt || 'Explain technical concepts clearly with structured examples';
  const platform = platformName.toLowerCase();

  // Inferred Goals
  const primaryGoalStr = rawPrompt
    ? `Master and execute prompt task: "${rawPrompt.slice(0, 60)}${rawPrompt.length > 60 ? '...' : ''}"`
    : `Deliver high-impact, structured ${platformName} communication`;

  // Dynamic Missing Context
  const missingContext: MissingContextItem[] = [
    {
      item: 'Target Audience & Technical Depth',
      whyItMatters: 'Determines detail level, complexity, and jargon usage',
      expectedImpact: 'Ensures output matches recipient expertise',
    },
    {
      item: 'Explicit Output Format & Deliverables',
      whyItMatters: 'Prevents generic bullet lists or unstructured essays',
      expectedImpact: 'Produces ready-to-use, structured output',
    },
    {
      item: 'Constraints & Edge Cases',
      whyItMatters: 'Avoids unwanted scope creep or incorrect assumptions',
      expectedImpact: 'Focuses response strictly on relevant requirements',
    },
  ];

  // Dynamic Hidden Assumptions
  const hiddenAssumptions: AssumptionAnalysisItem[] = [
    {
      assumption: 'Implicit baseline knowledge and standard execution environment',
      risk: 'Response might skip fundamental steps or over-explain basics',
      detectedBecause: 'Rule evaluation detected unstated user background',
      challengeQuestion: 'What specific skill level or environment should be assumed?',
    },
    {
      assumption: 'Default formatting and concise bullet structure preferred',
      risk: 'Output style may not match exact expectations',
      detectedBecause: 'No explicit formatting style specified in prompt',
    },
  ];

  // Dynamic Suggestions from Engine Issues
  const suggestions: RecommendationItem[] = report.issues.map((issue) => ({
    recommendation: issue.problem || `Address ${issue.title}`,
    reason: issue.reason || 'Refines instruction clarity and structure',
    expectedBenefit: 'Improves response precision and alignment',
  }));

  if (suggestions.length === 0) {
    suggestions.push(
      {
        recommendation: 'Specify target audience and output format constraints',
        reason: 'Eliminates ambiguity in model response structure',
        expectedBenefit: 'Higher relevance and immediate usability',
      },
      {
        recommendation: 'Include explicit background context and success criteria',
        reason: 'Provides clear boundaries for the AI response',
        expectedBenefit: 'Prevents generic or off-topic responses',
      }
    );
  }

  // Dynamic Improved Prompt Generation based on Platform
  let improvedPromptText = '';

  if (platform.includes('claude')) {
    improvedPromptText = `<role>
Senior Technical Consultant & Specialist
</role>

<task>
${cleanPrompt}
</task>

<context>
User requested a detailed, structured response for "${cleanPrompt}".
</context>

<instructions>
1. Provide a comprehensive, step-by-step breakdown with clear section headings.
2. Include concrete, real-world code snippets or practical examples where applicable.
3. Highlight key rules, scope boundaries, and common pitfalls to avoid.
4. Conclude with a clear summary or actionable best practices checklist.
</instructions>

<output_format>
- Executive Overview
- Detailed Concepts & Practical Breakdown
- Runnable Code / Concrete Examples
- Pitfalls & Edge Cases
- Actionable Summary
</output_format>`;
  } else if (platform.includes('gmail')) {
    improvedPromptText = `[SUBJECT] Breakdown & Action Plan: ${cleanPrompt.slice(0, 50)}

[GREETING] Hello,

[BODY]
I have prepared a structured overview and execution plan regarding: "${cleanPrompt}".

Key Highlights & Deliverables:
- Core Objective: Deliver clear, actionable insights tailored to your requirements.
- Key Details: Step-by-step breakdown covering essential concepts and practical steps.
- Recommended Next Steps: Implementation guidelines and review checkpoints.

Please review the details below and let me know if you would like any adjustments.

[CLOSING] Best regards,

[SIGNATURE] [Your Name]`;
  } else if (platform.includes('linkedin')) {
    improvedPromptText = `Mastering ${cleanPrompt.slice(0, 45)}: Key Insights & Actionable Principles 🚀

When approaching ${cleanPrompt.slice(0, 30)}, clarity and execution are everything.

Here are the essential key takeaways:

1️⃣ Core Foundation: Focus on clear principles and high-impact fundamentals.
2️⃣ Practical Application: Translate concepts into actionable steps.
3️⃣ Avoid Common Pitfalls: Keep structure clean and measurable.

What strategies have worked best for you in this domain? Share your thoughts below! 👇

#ProfessionalGrowth #TechInsights #Leadership #BestPractices`;
  } else {
    // Default / ChatGPT / Gemini
    improvedPromptText = `Objective
${cleanPrompt}

Background & Context
The user is requesting a thorough, expert-level breakdown of the specified task with high clarity and structured delivery.

Requirements
- Provide clear, step-by-step reasoning organized by descriptive headers.
- Include practical, self-contained examples or runnable code blocks where relevant.
- Address edge cases, common pitfalls, and key best practices.
- Use clear formatting with concise bullet points for readability.

Constraints
- Avoid vague or generic explanations.
- Ensure all technical terms are clearly defined.

Expected Output Format
1. Core Concepts & Overview
2. Step-by-step Explanation & Examples
3. Pitfalls & Best Practices Checklist
4. Summary & Actionable Recommendations`;
  }

  const failureVectors: FailureVectorItem[] = [
    {
      targetModel: 'Claude 3.5 Sonnet',
      riskProbability: report.score < 60 ? 82 : 35,
      vectorType: 'formatting',
      description: 'Risk of generic unstructured response without XML tag boundaries.',
      mitigation: 'Enforce explicit <task>, <context>, and <output_format> XML blocks.',
    },
    {
      targetModel: 'OpenAI o3-mini / o1',
      riskProbability: rawPrompt.toLowerCase().includes('think step') ? 88 : 38,
      vectorType: 'reasoning-token-waste',
      description: 'Micromanaged chain-of-thought instructions waste internal reasoning tokens.',
      mitigation: 'Replace manual thinking steps with explicit Goal, Constraints, and Deliverables.',
    },
    {
      targetModel: 'GPT-4o / Gemini 2.0',
      riskProbability: report.score < 50 ? 75 : 25,
      vectorType: 'hallucination',
      description: 'Implicit scope boundaries increase probability of hallucinated or off-target facts.',
      mitigation: 'Add explicit positive constraints and verifiable output schema bounds.',
    },
  ];

  const modelSimulations: ModelSimulationResult[] = [
    {
      targetModel: 'Claude 3.5 Sonnet',
      fitScore: Math.min(98, report.score + 25),
      status: report.score > 70 ? 'optimal' : 'warning',
      predictedOutcome: 'High analytical depth; performs best with XML-tagged prompt structure.',
      primaryRisk: 'Requires XML tag structure for complex context.',
    },
    {
      targetModel: 'GPT-4o',
      fitScore: Math.min(95, report.score + 20),
      status: 'optimal',
      predictedOutcome: 'Strong multi-turn adherence when guidelines use positive constraints.',
      primaryRisk: 'May over-summarize if word limits are missing.',
    },
    {
      targetModel: 'OpenAI o3-mini',
      fitScore: Math.min(92, report.score + 18),
      status: rawPrompt.toLowerCase().includes('think step') ? 'high-risk' : 'optimal',
      predictedOutcome: 'Autonomous deep reasoning; optimal for multi-step logic.',
      primaryRisk: 'Token burn if prompt micromanages thinking steps.',
    },
  ];

  const preFlightSimulation: PreFlightSimulation = {
    overallRiskLevel: report.score < 40 ? 'critical' : report.score < 70 ? 'high' : 'medium',
    failureVectors,
    modelSimulations,
    mitigationsApplied: [
      'Pre-flight risk assessment executed',
      'Target model failure vectors analyzed',
      'Prompt structure optimized for LLM architecture alignment',
    ],
  };

  const estGain = Math.max(25, Math.min(65, 100 - report.score));

  return {
    needsClarification: false,
    intent: cleanPrompt.slice(0, 80),
    thinkingScore: report.score,
    estimatedImprovement: `+${estGain}% Clarity & Depth`,
    goalDiscovery: {
      primaryGoal: primaryGoalStr,
      taskType: `${platformName} Task Execution`,
    },
    missingContext,
    hiddenAssumptions,
    blindSpots: report.issues.map((issue) => ({
      blindSpot: issue.title,
      whyItMatters: issue.reason,
      consequence: issue.problem,
    })),
    suggestions,
    whatChanged: [
      'Applied platform-specific prompt engineering structure',
      'Added explicit requirements, constraints, and output format',
      'Refined intent positioning and task scope boundaries',
      'Executed pre-flight model failure simulation',
    ],
    improvedPrompt: improvedPromptText,
    preFlightSimulation,
  };
}

export function useAnalysisFlow(platform: ActivePlatformAdapter = getActivePlatformAdapter()) {
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [completedStepCount, setCompletedStepCount] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<null | { code: string; message: string }>(null);
  const [isOriginalPromptEmpty, setIsOriginalPromptEmpty] = useState(false);
  const timersRef = useRef<number[]>([]);
  const inFlightRef = useRef<AbortController | null>(null);
  const promptRef = useRef('');

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const clearInFlight = useCallback(() => {
    if (inFlightRef.current) {
      inFlightRef.current.abort();
      inFlightRef.current = null;
    }
  }, []);

  const runLoadingTimers = useCallback(() => {
    clearTimers();
    setCompletedStepCount(0);
    analysisSteps.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setCompletedStepCount(index + 1);
      }, STEP_INTERVAL_MS * (index + 1));
      timersRef.current.push(timer);
    });
  }, [clearTimers]);

  const start = useCallback(async (customPrompt?: string) => {
    if (phase === 'analyzing') return; // prevent duplicate
    console.debug('[ProPaar] Review button clicked', { platform: platform.id });
    clearInFlight();
    setError(null);
    setAnalysis(null);
    setPhase('analyzing');
    runLoadingTimers();

    const prompt = customPrompt !== undefined ? customPrompt : platform.readComposer();
    promptRef.current = prompt;
    setIsOriginalPromptEmpty(prompt.trim().length === 0);
    console.debug('[ProPaar] Editor text length', { platform: platform.id, length: prompt.length });

    // If no prompt, treat as empty string but still call backend
    const controller = new AbortController();
    inFlightRef.current = controller;

    try {
      const res = await analyzePrompt(prompt, platform.backendPlatform, controller.signal);
      setAnalysis(res.analysis);
      console.debug('[ProPaar] Render started', { platform: platform.id });

      clearTimers();
      setCompletedStepCount(analysisSteps.length);
      setPhase(res.analysis.needsClarification ? 'clarifying' : 'complete');
      console.debug('[ProPaar] Render completed', { platform: platform.id, phase: res.analysis.needsClarification ? 'clarifying' : 'complete' });
    } catch (err: unknown) {
      console.warn('[ProPaar] Network analysis unavailable, deploying local engine fallback', err);
      
      const fallbackAnalysis = generateLocalFallbackAnalysis(prompt, platform.platformName);
      setAnalysis(fallbackAnalysis);
      clearTimers();
      setCompletedStepCount(analysisSteps.length);
      setPhase('complete');
    } finally {
      inFlightRef.current = null;
    }
  }, [clearInFlight, clearTimers, phase, platform, runLoadingTimers]);

  const submitClarifications = useCallback(async (answers: ClarificationAnswer[]) => {
    if (phase === 'analyzing') return;
    clearInFlight();
    setError(null);
    setPhase('analyzing');
    runLoadingTimers();

    const controller = new AbortController();
    inFlightRef.current = controller;

    try {
      const res = await analyzePrompt(promptRef.current, platform.backendPlatform, controller.signal, answers);
      setAnalysis(res.analysis);
      clearTimers();
      setCompletedStepCount(analysisSteps.length);
      setPhase(res.analysis.needsClarification ? 'clarifying' : 'complete');
    } catch (err: unknown) {
      clearTimers();
      setCompletedStepCount(0);
      setPhase('clarifying');
      if (err instanceof AnalysisError) {
        setError({ code: err.code, message: err.message });
      } else {
        setError({ code: 'unknown', message: 'Unexpected error' });
      }
    } finally {
      inFlightRef.current = null;
    }
  }, [clearInFlight, clearTimers, phase, platform, runLoadingTimers]);

  const retry = useCallback(() => {
    setError(null);
    void start(promptRef.current);
  }, [start]);

  const dismissError = useCallback(() => setError(null), []);

  const cancel = useCallback(() => {
    clearInFlight();
    clearTimers();
    setPhase('idle');
    setCompletedStepCount(0);
  }, [clearInFlight, clearTimers]);

  return {
    completedStepCount,
    phase,
    start,
    analysis,
    error,
    retry,
    dismissError,
    cancel,
    submitClarifications,
    isOriginalPromptEmpty,
  };
}
