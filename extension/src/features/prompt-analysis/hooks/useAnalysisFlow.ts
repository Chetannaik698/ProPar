import { useCallback, useEffect, useRef, useState } from 'react';
import { analysisSteps, type AnalysisPhase } from '../model/analysis';
import type { Analysis, ClarificationAnswer } from '../types/analysis';
import { analyzePrompt, AnalysisError } from '../services/analysisApi';
import { getActivePlatformAdapter } from '../../../platform/adapters/registry';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';

import { ClearInstructionsEngine } from '../../../engines/clear-instructions/ClearInstructionsEngine';

const STEP_INTERVAL_MS = 1_500 / analysisSteps.length;

function generateLocalFallbackAnalysis(prompt: string, platformName: string): Analysis {
  const engine = new ClearInstructionsEngine();
  const report = engine.analyze(prompt);

  const improvedPromptText = prompt.trim()
    ? `System: Act as an expert consultant.\n\nTask: ${prompt.trim()}\n\nExecution Guidelines:\n- Provide structured, step-by-step reasoning.\n- Use clear formatting with action-oriented headers.\n- Ask clarifying questions if key details are missing.`
    : `Please write a structured, high-impact post/prompt focusing on key insights, clear outcomes, and professional delivery.`;

  return {
    needsClarification: false,
    intent: prompt.trim() ? prompt.slice(0, 80) : 'Clear, structured task execution',
    thinkingScore: report.score,
    estimatedImprovement: '+45% Clarity & Impact',
    goalDiscovery: {
      primaryGoal: 'Deliver high-impact, structured communication',
      taskType: `${platformName} communication`,
    },
    hiddenAssumptions: [
      {
        assumption: 'Target audience and desired output format are implied',
        risk: 'Response may lack specific context or structural alignment',
        detectedBecause: 'Rule evaluation detected implicit context',
      },
    ],
    blindSpots: report.issues.map((issue) => ({
      title: issue.title,
      description: issue.explanation,
      suggestion: issue.suggestedFix,
      impact: 'High Impact',
    })),
    suggestions: report.recommendations.length > 0 ? report.recommendations : ['Specify explicit output format and constraints', 'Provide clear background context'],
    whatChanged: [
      'Structured prompt role & execution guidelines',
      'Added explicit formatting constraints',
      'Refined clarity and goal positioning',
    ],
    improvedPrompt: improvedPromptText,
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
    console.debug('[ProPar] Review button clicked', { platform: platform.id });
    clearInFlight();
    setError(null);
    setAnalysis(null);
    setPhase('analyzing');
    runLoadingTimers();

    const prompt = customPrompt !== undefined ? customPrompt : platform.readComposer();
    promptRef.current = prompt;
    setIsOriginalPromptEmpty(prompt.trim().length === 0);
    console.debug('[ProPar] Editor text length', { platform: platform.id, length: prompt.length });

    // If no prompt, treat as empty string but still call backend
    const controller = new AbortController();
    inFlightRef.current = controller;

    try {
      const res = await analyzePrompt(prompt, platform.backendPlatform, controller.signal);
      setAnalysis(res.analysis);
      console.debug('[ProPar] Render started', { platform: platform.id });

      clearTimers();
      setCompletedStepCount(analysisSteps.length);
      setPhase(res.analysis.needsClarification ? 'clarifying' : 'complete');
      console.debug('[ProPar] Render completed', { platform: platform.id, phase: res.analysis.needsClarification ? 'clarifying' : 'complete' });
    } catch (err: unknown) {
      console.warn('[ProPar] Network analysis unavailable, deploying local engine fallback', err);
      
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
