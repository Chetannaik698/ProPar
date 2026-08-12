import type { InstructionRule, RuleResult } from './types';

export class RuleEvaluator {
  /**
   * Evaluate a list of instruction rules against the target user prompt.
   * Catches runtime errors in detectors safely to ensure continuous operation.
   */
  public evaluate(prompt: string, rules: InstructionRule[]): RuleResult[] {
    const results: RuleResult[] = [];

    for (const rule of rules) {
      try {
        const result = rule.detector(prompt);
        results.push(result);
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          severity: rule.severity,
          details: `Error executing detector for rule ${rule.id}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    return results;
  }
}
