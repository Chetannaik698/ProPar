import type { AnalysisResponse, ClarificationAnswer } from '../types/analysis';
import type { PlatformId } from '../../../platform/adapters/types';

const API_URL = 'https://propar-backend.onrender.com/api/v1/analyze';
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
): Promise<AnalysisResponse> {
  console.debug('[ProPar] Message sent to background', { platform, promptLength: prompt.length });

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'PROPAR_ANALYZE',
        prompt,
        platform,
        ...(clarificationAnswers?.length ? { clarificationAnswers } : {}),
      },
      (response: BackgroundAnalyzeResponse | undefined) => {
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError) {
          console.error('[ProPar] Background message failed', runtimeError.message);
          reject(new AnalysisError(runtimeError.message || 'Unable to connect to ProPar Background.', 'network'));
          return;
        }

        if (!response) {
          console.error('[ProPar] Background returned no response');
          reject(new AnalysisError('Unable to connect to ProPar Background.', 'network'));
          return;
        }

        if (!response.ok || !response.data) {
          console.error('[ProPar] Background analysis failed', response);
          reject(new AnalysisError(response.error || 'Unable to connect to ProPar Backend.', response.code ?? 'unknown'));
          return;
        }

        console.debug('[ProPar] Background response received', { platform });
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
): Promise<AnalysisResponse> {
  console.debug('[ProPar] Backend request started', { platform, promptLength: prompt.length });
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, platform, ...(clarificationAnswers?.length ? { clarificationAnswers } : {}) }),
    signal,
  });

  if (!res.ok) {
    console.error('[ProPar] Backend request failed', { status: res.status, statusText: res.statusText });
    throw new AnalysisError('Unable to connect to ProPar Backend.', 'network');
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    console.error('[ProPar] Backend response JSON parsing failed');
    throw new AnalysisError('Unexpected server response.', 'invalid');
  }

  if (!hasAnalysisPayload(json)) {
    console.error('[ProPar] Backend response missing analysis payload', json);
    throw new AnalysisError('Unexpected server response.', 'invalid');
  }

  console.debug('[ProPar] Backend response received', { platform });
  return json;
}

export async function analyzePrompt(
  prompt: string,
  platform: PlatformId = 'chatgpt',
  signal?: AbortSignal,
  clarificationAnswers?: ClarificationAnswer[],
): Promise<AnalysisResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  const mergedSignal = ((): AbortSignal => {
    if (!signal) return controller.signal;
    // Compose signals: abort if either aborts
    const composed = new AbortController();
    const forward = () => composed.abort();
    signal.addEventListener('abort', forward, { once: true });
    controller.signal.addEventListener('abort', forward, { once: true });
    return composed.signal;
  })();

  try {
    if (canUseExtensionMessaging()) {
      return await sendAnalyzeMessage(prompt, platform, clarificationAnswers);
    }

    return await fetchAnalyzeDirect(prompt, platform, mergedSignal, clarificationAnswers);
  } catch (err: unknown) {
    if (isAbortError(err)) {
      // Determine whether it was timeout by checking controller
      console.error('[ProPar] Backend request timed out');
      throw new AnalysisError('Analysis timed out. Please try again.', 'timeout');
    }
    if (err instanceof AnalysisError) throw err;
    console.error('[ProPar] Backend request failed before response', err);
    throw new AnalysisError('Unable to connect to ProPar Backend.', 'network');
  } finally {
    window.clearTimeout(timeout);
  }
}
