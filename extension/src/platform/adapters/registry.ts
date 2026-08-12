import type { PlatformContextAdapter } from './types';
import { PlatformDetector } from './PlatformDetector';
import { chatGptAdapter } from '../chatgpt/adapter';
import { geminiAdapter } from '../gemini/adapter';
import { claudeAdapter } from '../claude/adapter';
import { linkedinAdapter } from '../linkedin/adapter';
import { gmailAdapter } from '../gmail/adapter';
import { perplexityAdapter } from '../perplexity/adapter';
import type { ActivePlatformAdapter } from './types';

export const platformContextAdapters = [
  {
    platformName: 'ChatGPT',
    communicationStyle: 'Conversational assistant prompt with review-before-send composer behavior.',
    supportedFeatures: ['read-composer', 'replace-composer', 'preserve-focus', 'rich-text'],
  },
  {
    platformName: 'Gemini',
    communicationStyle: 'Conversational assistant prompt with review-before-send composer behavior.',
    supportedFeatures: ['read-composer', 'replace-composer', 'preserve-focus', 'rich-text'],
  },
  {
    platformName: 'Claude',
    communicationStyle: 'Conversational assistant prompt with review-before-send composer behavior.',
    supportedFeatures: ['read-composer', 'replace-composer', 'preserve-focus', 'rich-text'],
  },
  {
    platformName: 'LinkedIn',
    communicationStyle: 'Professional communication review with actionable growth suggestions.',
    supportedFeatures: ['read-composer', 'replace-composer', 'preserve-focus', 'rich-text'],
  },
  {
    platformName: 'Gmail',
    communicationStyle: 'Professional communication review with actionable growth suggestions.',
    supportedFeatures: ['read-composer', 'replace-composer', 'preserve-focus', 'rich-text'],
  },
  {
    platformName: 'Perplexity',
    communicationStyle: 'Deep search & reasoning prompt review before sending.',
    supportedFeatures: ['read-composer', 'replace-composer', 'preserve-focus', 'rich-text'],
  },
] satisfies PlatformContextAdapter[];

export function getPlatformContextAdapter(platformName: string): PlatformContextAdapter | undefined {
  return platformContextAdapters.find(
    (adapter) => adapter.platformName.toLowerCase() === platformName.toLowerCase(),
  );
}

export const activePlatformAdapters = [chatGptAdapter, geminiAdapter, claudeAdapter, linkedinAdapter, gmailAdapter, perplexityAdapter] satisfies ActivePlatformAdapter[];
export const platformDetector = new PlatformDetector(activePlatformAdapters);

export function getActivePlatformAdapter(location: Location = window.location): ActivePlatformAdapter {
  return platformDetector.detect(location) ?? chatGptAdapter;
}
