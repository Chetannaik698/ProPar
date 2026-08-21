export interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  explanation?: string;
  reason?: string;
  expectedImprovement?: string;
  informationGain?: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
}

export interface ClarificationAnswer {
  questionId: string;
  answer: string;
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
  consequence?: string;
  opportunity?: string;
  expectedBenefit: string;
}

export interface ExpertConsiderationItem {
  consideration?: string;
  whyItMatters?: string;
  expert?: string;
  standsOut?: string;
  concern?: string;
  opportunity?: string;
}

export interface InferredGoalItem {
  value: string;
  inferredBecause: string;
}

export interface GoalDiscovery {
  primaryGoal?: string | InferredGoalItem;
  secondaryGoal?: InferredGoalItem;
  hiddenGoal?: string;
  hiddenMotivation?: InferredGoalItem;
  expectedOutcome?: string;
  expectedSuccess?: InferredGoalItem;
  possibleFailure?: InferredGoalItem;
  taskType?: string;
}

export interface BlindSpotItem {
  impactRank?: number;
  riskArea?: string;
  blindSpot: string;
  whyItMatters?: string;
  consequence?: string;
}

export interface FailureVectorItem {
  targetModel: string;
  riskProbability: number;
  vectorType: 'hallucination' | 'formatting' | 'reasoning-token-waste' | 'engagement-drop' | 'ambiguity';
  description: string;
  mitigation: string;
}

export interface ModelSimulationResult {
  targetModel: string;
  fitScore: number;
  status: 'optimal' | 'warning' | 'high-risk';
  predictedOutcome: string;
  primaryRisk: string;
}

export interface PreFlightSimulation {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  failureVectors: FailureVectorItem[];
  modelSimulations: ModelSimulationResult[];
  mitigationsApplied: string[];
}

export interface Analysis {
  goalDiscovery?: GoalDiscovery;
  intent: string;
  thinkingGap?: string;
  missingContext: Array<string | MissingContextItem>;
  hiddenAssumptions: Array<string | AssumptionAnalysisItem>;
  blindSpots?: BlindSpotItem[];
  suggestions: Array<string | RecommendationItem>;
  expertConsiderations?: ExpertConsiderationItem[];
  whatChanged?: string[];
  thinkingScore?: number;
  estimatedImprovement?: string;
  improvedPrompt?: string;
  needsClarification?: boolean;
  clarificationQuestions?: ClarificationQuestion[];
  preFlightSimulation?: PreFlightSimulation;
}

export interface Meta {
  provider: string;
  model: string;
  version: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: Analysis;
  meta: Meta;
}
