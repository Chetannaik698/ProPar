export interface AnalysisRequest {
  prompt: string;
  platform?: PlatformId;
  clarificationAnswers?: ClarificationAnswer[];
}

export type PlatformId = 'chatgpt' | 'claude' | 'linkedin' | 'gmail';

export interface ClarificationAnswer {
  questionId: string;
  answer: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  reason: string;
  expectedImprovement: string;
  informationGain: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
}

export interface MissingContextItem {
  item: string;
  whyItMatters: string;
  expectedImpact: string;
}

export interface AssumptionAnalysisItem {
  assumption: string;
  risk: string;
  detectedBecause: string;
  challengeQuestion?: string;
}

export interface RecommendationItem {
  recommendation: string;
  reason: string;
  consequence: string;
  opportunity?: string;
  expectedBenefit: string;
}

export interface ExpertConsiderationItem {
  expert: string;
  standsOut: string;
  concern: string;
  opportunity: string;
}

export interface InferredGoalItem {
  value: string;
  inferredBecause: string;
}

export interface GoalDiscovery {
  primaryGoal: InferredGoalItem;
  secondaryGoal: InferredGoalItem;
  hiddenMotivation: InferredGoalItem;
  expectedSuccess: InferredGoalItem;
  possibleFailure: InferredGoalItem;
}

export interface BlindSpotItem {
  impactRank: number;
  riskArea: string;
  blindSpot: string;
  consequence: string;
}

export interface PromptAnalysis {
  goalDiscovery: GoalDiscovery;
  intent: string;
  thinkingGap: string;
  missingContext: MissingContextItem[];
  hiddenAssumptions: AssumptionAnalysisItem[];
  blindSpots: BlindSpotItem[];
  suggestions: RecommendationItem[];
  expertConsiderations: ExpertConsiderationItem[];
  whatChanged: string[];
  thinkingScore: number;
  estimatedImprovement: string;
  improvedPrompt: string;
  needsClarification: boolean;
  clarificationQuestions: ClarificationQuestion[];
}

export interface AnalysisMeta {
  provider: string;
  model: string;
  processingTime: string;
  version: 'v1';
}

export interface AnalysisResponse {
  success: true;
  analysis: PromptAnalysis;
  meta: AnalysisMeta;
}
