import type { AnalysisResponse, ClarificationAnswer } from './features/prompt-analysis/types/analysis';
import type { PlatformId } from './platform/adapters/types';

const API_URL = 'https://propar-backend.onrender.com/api/v1/analyze';
const TIMEOUT_MS = 75_000;

interface AnalyzeRequestMessage {
  type: 'PROPAR_ANALYZE';
  prompt: string;
  platform: PlatformId;
  clarificationAnswers?: ClarificationAnswer[];
}

interface AnalyzeSuccessMessage {
  ok: true;
  data: AnalysisResponse;
}

interface AnalyzeFailureMessage {
  ok: false;
  error: string;
  code: 'network' | 'timeout' | 'invalid' | 'unknown';
}

type AnalyzeResponseMessage = AnalyzeSuccessMessage | AnalyzeFailureMessage;

function isAnalyzeRequestMessage(message: unknown): message is AnalyzeRequestMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'PROPAR_ANALYZE' &&
    typeof (message as { prompt?: unknown }).prompt === 'string'
  );
}

function hasAnalysisPayload(value: unknown): value is AnalysisResponse {
  return typeof value === 'object' && value !== null && 'analysis' in value;
}

chrome.runtime.onInstalled.addListener(() => {
  // Reserved for extension lifecycle migrations. Milestone 1 stores no data.
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse: (response: AnalyzeResponseMessage) => void) => {
  if (!isAnalyzeRequestMessage(message)) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  console.debug('[ProPaar] Message sent to background', {
    platform: message.platform,
    promptLength: message.prompt.length,
  });
  console.debug('[ProPaar] Backend request started', {
    platform: message.platform,
    promptLength: message.prompt.length,
  });

  void fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: message.prompt,
      platform: message.platform,
      ...(message.clarificationAnswers?.length ? { clarificationAnswers: message.clarificationAnswers } : {}),
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        console.error('[ProPaar] Backend request failed', { status: response.status, statusText: response.statusText });
        sendResponse({ ok: false, code: 'network', error: 'Unable to connect to ProPaar Backend.' });
        return;
      }

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        console.error('[ProPaar] Backend response JSON parsing failed');
        sendResponse({ ok: false, code: 'invalid', error: 'Unexpected server response.' });
        return;
      }

      if (!hasAnalysisPayload(json)) {
        console.error('[ProPaar] Backend response missing analysis payload', json);
        sendResponse({ ok: false, code: 'invalid', error: 'Unexpected server response.' });
        return;
      }

      console.debug('[ProPaar] Backend response received', { platform: message.platform });
      sendResponse({ ok: true, data: json });
    })
    .catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('[ProPaar] Backend request timed out');
        sendResponse({ ok: false, code: 'timeout', error: 'Analysis timed out. Please try again.' });
        return;
      }

      console.error('[ProPaar] Backend request failed before response', error);
      sendResponse({ ok: false, code: 'network', error: 'Unable to connect to ProPaar Backend.' });
    })
    .finally(() => clearTimeout(timeout));

  return true;
});

chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'analyze_prompt') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { type: 'PROPAR_TOGGLE_POPUP' }).catch(() => {
          // Tab may not have content script loaded
        });
      }
    });
  }
});
