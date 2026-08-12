import type { RuleResult, RuleSeverity } from './types';

export class ScoringService {
  private static readonly SEVERITY_WEIGHTS: Record<RuleSeverity, number> = {
    critical: 25,
    high: 15,
    medium: 10,
    low: 5,
  };

  /**
   * Calculate final quality score starting at 100 and deducting points per failed rule severity.
   */
  public calculateScore(results: RuleResult[]): number {
    let score = 100;

    for (const result of results) {
      if (!result.passed) {
        const weight = ScoringService.SEVERITY_WEIGHTS[result.severity] ?? 10;
        score -= weight;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine overall prompt severity level based on the highest severity among failed rules.
   */
  public calculateOverallSeverity(results: RuleResult[]): RuleSeverity | 'none' {
    const failedResults = results.filter((r) => !r.passed);
    if (failedResults.length === 0) {
      return 'none';
    }

    if (failedResults.some((r) => r.severity === 'critical')) return 'critical';
    if (failedResults.some((r) => r.severity === 'high')) return 'high';
    if (failedResults.some((r) => r.severity === 'medium')) return 'medium';
    return 'low';
  }
}
