import { useCallback, useEffect, useRef, useState } from 'react';
import { analysisSteps, type AnalysisPhase } from '../model/analysis';
import type { Analysis, ClarificationAnswer, HistoryItem } from '../types/analysis';
import { analyzePrompt, AnalysisError } from '../services/analysisApi';
import { getActivePlatformAdapter } from '../../../platform/adapters/registry';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';

const STEP_INTERVAL_MS = 1_500 / analysisSteps.length;

export function useAnalysisFlow(platform: ActivePlatformAdapter = getActivePlatformAdapter()) {
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [completedStepCount, setCompletedStepCount] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<null | { code: string; message: string }>(null);
  const [isOriginalPromptEmpty, setIsOriginalPromptEmpty] = useState(false);
  const timersRef = useRef<number[]>([]);
  const inFlightRef = useRef<AbortController | null>(null);
  const promptRef = useRef('');
  const historyRef = useRef<HistoryItem[]>([]);

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
    if (phase === 'analyzing') return;
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

    historyRef.current = [{ role: 'user', content: prompt }];

    const controller = new AbortController();
    inFlightRef.current = controller;

    try {
      const res = await analyzePrompt(prompt, platform.backendPlatform, controller.signal, [], historyRef.current);
      setAnalysis(res.analysis);
      if (res.analysis.improvedPrompt) {
        historyRef.current.push({ role: 'assistant', content: res.analysis.improvedPrompt });
      }
      console.debug('[ProPaar] Render started', { platform: platform.id });

      clearTimers();
      setCompletedStepCount(analysisSteps.length);
      setPhase(res.analysis.needsClarification ? 'clarifying' : 'complete');
      console.debug('[ProPaar] Render completed', { platform: platform.id, phase: res.analysis.needsClarification ? 'clarifying' : 'complete' });
    } catch (err: unknown) {
      console.error('[ProPaar] AI analysis failed; showing error instead of fallback analysis', err);

      clearTimers();
      setCompletedStepCount(0);
      setPhase('error');
      if (err instanceof AnalysisError) {
        setError({ code: err.code, message: err.message });
      } else {
        setError({ code: 'unknown', message: 'Unexpected error' });
      }
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

    const formattedAnswers = answers.map((a) => `${a.questionId}: ${a.answer}`).join('\n');
    historyRef.current.push({ role: 'user', content: `Clarification answers:\n${formattedAnswers}` });

    const controller = new AbortController();
    inFlightRef.current = controller;

    try {
      const res = await analyzePrompt(promptRef.current, platform.backendPlatform, controller.signal, answers, historyRef.current);
      setAnalysis(res.analysis);
      if (res.analysis.improvedPrompt) {
        historyRef.current.push({ role: 'assistant', content: res.analysis.improvedPrompt });
      }
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

  const dismissError = useCallback(() => {
    setError(null);
    setPhase('idle');
  }, []);

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
