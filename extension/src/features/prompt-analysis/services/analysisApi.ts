import type { AnalysisResponse, ClarificationAnswer, HistoryItem } from '../types/analysis';
import type { PlatformId } from '../../../platform/adapters/types';

const API_URL = 'http://localhost:5000/api/v1/analyze';
const TIMEOUT_MS = 75_000;

export class AnalysisError extends Error {
  code: 'network' | 'timeout' | 'invalid' | 'unknown';
  constructor(message: string, code: AnalysisError['code'] = 'unknown') {
    super(message);
    this.code = code;
  }
}

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'AbortError';
};

const hasAnalysisPayload = (value: unknown): value is AnalysisResponse => {
  return typeof value === 'object' && value !== null && 'analysis' in value;
};

interface BackgroundAnalyzeResponse {
  ok: boolean;
  data?: AnalysisResponse;
  error?: string;
  code?: AnalysisError['code'];
}

function canUseExtensionMessaging(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.runtime.sendMessage);
}

function sendAnalyzeMessage(
  prompt: string,
  platform: PlatformId,
  clarificationAnswers?: ClarificationAnswer[],
  history?: HistoryItem[],
): Promise<AnalysisResponse> {
  console.debug('[ProPaar] Message sent to background', { platform, promptLength: prompt.length });

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'PROPAR_ANALYZE',
        prompt,
        platform,
        ...(clarificationAnswers?.length ? { clarificationAnswers } : {}),
        ...(history?.length ? { history } : {}),
      },
      (response: BackgroundAnalyzeResponse | undefined) => {
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError) {
          console.error('[ProPaar] Background message failed', runtimeError.message);
          reject(new AnalysisError(runtimeError.message || 'Unable to connect to ProPaar Background.', 'network'));
          return;
        }

        if (!response) {
          console.error('[ProPaar] Background returned no response');
          reject(new AnalysisError('Unable to connect to ProPaar Background.', 'network'));
          return;
        }

        if (!response.ok || !response.data) {
          console.error('[ProPaar] Background analysis failed', response);
          reject(new AnalysisError(response.error || 'Unable to connect to ProPaar Backend.', response.code ?? 'unknown'));
          return;
        }

        console.debug('[ProPaar] Background response received', { platform });
        resolve(response.data);
      },
    );
  });
}

async function fetchAnalyzeDirect(
  prompt: string,
  platform: PlatformId,
  signal: AbortSignal,
  clarificationAnswers?: ClarificationAnswer[],
  history?: HistoryItem[],
): Promise<AnalysisResponse> {
  console.debug('[ProPaar] Backend request started', { platform, promptLength: prompt.length });
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      platform,
      ...(clarificationAnswers?.length ? { clarificationAnswers } : {}),
      ...(history?.length ? { history } : {}),
    }),
    signal,
  });

  if (!res.ok) {
    console.error('[ProPaar] Backend request failed', { status: res.status, statusText: res.statusText });
    throw new AnalysisError('Unable to connect to ProPaar Backend.', 'network');
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    console.error('[ProPaar] Backend response JSON parsing failed');
    throw new AnalysisError('Unexpected server response.', 'invalid');
  }

  if (!hasAnalysisPayload(json)) {
    console.error('[ProPaar] Backend response missing analysis payload', json);
    throw new AnalysisError('Unexpected server response.', 'invalid');
  }

  console.debug('[ProPaar] Backend response received', { platform });
  return json;
}

export async function analyzePrompt(
  prompt: string,
  platform: PlatformId = 'chatgpt',
  signal?: AbortSignal,
  clarificationAnswers?: ClarificationAnswer[],
  history?: HistoryItem[],
): Promise<AnalysisResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  const mergedSignal = ((): AbortSignal => {
    if (!signal) return controller.signal;
    const composed = new AbortController();
    const forward = () => composed.abort();
    signal.addEventListener('abort', forward, { once: true });
    controller.signal.addEventListener('abort', forward, { once: true });
    return composed.signal;
  })();

  try {
    if (canUseExtensionMessaging()) {
      return await sendAnalyzeMessage(prompt, platform, clarificationAnswers, history);
    }

    return await fetchAnalyzeDirect(prompt, platform, mergedSignal, clarificationAnswers, history);
  } catch (err: unknown) {
    if (isAbortError(err)) {
      console.error('[ProPaar] Backend request timed out');
      throw new AnalysisError('Analysis timed out. Please try again.', 'timeout');
    }
    if (err instanceof AnalysisError) throw err;
    console.error('[ProPaar] Backend request failed before response', err);
    throw new AnalysisError('Unable to connect to ProPaar Backend.', 'network');
  } finally {
    window.clearTimeout(timeout);
  }
}
