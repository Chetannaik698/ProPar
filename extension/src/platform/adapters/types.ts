export type PlatformFeature =
  | 'read-composer'
  | 'replace-composer'
  | 'preserve-focus'
  | 'rich-text'
  | 'plain-text'
  | 'future-memory-context'
  | 'future-predictions';

export interface PlatformContextAdapter {
  platformName: string;
  communicationStyle: string;
  supportedFeatures: PlatformFeature[];
}

export type PlatformId = 'chatgpt' | 'gemini' | 'claude' | 'linkedin' | 'gmail' | 'perplexity';
export type BackendPlatformId = 'chatgpt' | 'gemini' | 'claude' | 'linkedin' | 'gmail';

export interface PlatformLabels {
  emptyTitle: string;
  emptyDescription: string;
  analyzeAction: string;
  analysisCompleteTitle: string;
  goalCaption: string;
  thinkingCaption: string;
  recommendationsCaption: string;
  whatChangedCaption: string;
  finalCardLabel: string;
  finalCardCaption: string;
  replaceAction: string;
  replacedAction: string;
  successToast: string;
  goalDiscoveryTitle?: string;
  thinkingTitle?: string;
  expertTitle?: string;
  expertCaption?: string;
  blindSpotsTitle?: string;
  blindSpotsCaption?: string;
  missingContextTitle?: string;
  missingContextCaption?: string;
  recommendationsTitle?: string;
}

export interface ActivePlatformAdapter {
  id: PlatformId;
  platformName: string;
  backendPlatform: BackendPlatformId;
  communicationStyle: string;
  labels: PlatformLabels;
  matches(location: Location): boolean;
  getComposerCandidates(): HTMLElement[];
  readComposer(): string;
  replaceComposer(text: string): boolean;
  getPrimaryActionButton(composer: HTMLElement | null): HTMLElement | null;
  getSecondaryActionButton?(composer: HTMLElement | null): HTMLElement | null;
  getAnchorElement?(composer: HTMLElement | null): HTMLElement | null;
  getComposerContainer?(composer: HTMLElement | null): HTMLElement | null;
  bootstrap?(onRecover: () => void): () => void;
}

