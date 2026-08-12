import type { InstructionIssue, InstructionRecommendation, InstructionRule, RuleResult } from './types';

export class RecommendationBuilder {
  /**
   * Build structured issues list for failed rules.
   */
  public buildIssues(results: RuleResult[], rules: InstructionRule[]): InstructionIssue[] {
    const ruleMap = new Map(rules.map((r) => [r.id, r]));
    const issues: InstructionIssue[] = [];

    for (const result of results) {
      if (!result.passed) {
        const rule = ruleMap.get(result.ruleId);
        if (rule) {
          issues.push({
            ruleId: rule.id,
            title: rule.title,
            severity: result.severity,
            problem: rule.recommendation.problem,
            reason: rule.recommendation.reason,
            evidence: result.evidence,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Build structured recommendations according to official OpenAI guidance.
   * Every recommendation includes Problem, Reason, Official Recommendation, and Expected Improvement.
   */
  public buildRecommendations(results: RuleResult[], rules: InstructionRule[]): InstructionRecommendation[] {
    const ruleMap = new Map(rules.map((r) => [r.id, r]));
    const recommendations: InstructionRecommendation[] = [];

    for (const result of results) {
      if (!result.passed) {
        const rule = ruleMap.get(result.ruleId);
        if (rule) {
          recommendations.push({
            ruleId: rule.id,
            problem: rule.recommendation.problem,
            reason: rule.recommendation.reason,
            officialRecommendation: rule.recommendation.officialRecommendation,
            expectedImprovement: rule.recommendation.expectedImprovement,
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Extract prompt strengths for rules that passed.
   */
  public buildStrengths(results: RuleResult[], rules: InstructionRule[]): string[] {
    const ruleMap = new Map(rules.map((r) => [r.id, r]));
    const strengths: string[] = [];

    for (const result of results) {
      if (result.passed) {
        const rule = ruleMap.get(result.ruleId);
        if (rule) {
          strengths.push(`Follows principle: ${rule.title} — ${rule.description}`);
        }
      }
    }

    return strengths;
  }
}
