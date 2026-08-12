/**
 * Core type definitions for the Clear Instructions Engine.
 * Built according to OpenAI official prompting guidance.
 */

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RuleRecommendationTemplate {
  problem: string;
  reason: string;
  officialRecommendation: string;
  expectedImprovement: string;
}

export interface RuleResult {
  ruleId: string;
  passed: boolean;
  severity: RuleSeverity;
  details?: string;
  evidence?: string[];
  contextInfo?: Record<string, unknown>;
}

export interface InstructionRule {
  id: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  importance: ImportanceLevel;
  detector: (prompt: string) => RuleResult;
  recommendation: RuleRecommendationTemplate;
}

export interface InstructionIssue {
  ruleId: string;
  title: string;
  severity: RuleSeverity;
  problem: string;
  reason: string;
  evidence?: string[];
}

export interface InstructionRecommendation {
  ruleId: string;
  problem: string;
  reason: string;
  officialRecommendation: string;
  expectedImprovement: string;
}

export interface InstructionAnalysisReport {
  score: number; // 0 to 100
  severity: RuleSeverity | 'none';
  issues: InstructionIssue[];
  recommendations: InstructionRecommendation[];
  detectedRules: string[];
  strengths: string[];
}
