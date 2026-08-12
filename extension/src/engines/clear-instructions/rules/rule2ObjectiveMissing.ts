import type { InstructionRule } from '../types';

export const rule2ObjectiveMissing: InstructionRule = {
  id: 'rule-2-objective-missing',
  title: 'Objective is Missing',
  description: 'Detects prompts that lack a clear, actionable task objective or primary command.',
  severity: 'critical',
  importance: 'critical',
  recommendation: {
    problem: 'The prompt does not state a clear action verb or explicit goal.',
    reason: 'Without a clear objective, the model must guess what action to take (e.g. explain, summarize, create, code, or critique).',
    officialRecommendation: 'Be explicit about the goal. Start with direct action verbs such as "Create", "Generate", "Write", "Build", or "Analyze".',
    expectedImprovement: 'Eliminates ambiguity regarding the core task the AI should perform.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-2-objective-missing',
        passed: false,
        severity: 'critical',
        details: 'Prompt is empty.',
        evidence: ['[empty prompt]'],
      };
    }

    const actionPattern = /\b(create|build|generate|write|analyze|summarize|explain|find|calculate|convert|translate|draft|develop|implement|design|provide|return|list|help|make|review|fix|refactor|compare|describe)\b/i;

    const hasAction = actionPattern.test(trimmed);

    if (!hasAction) {
      return {
        ruleId: 'rule-2-objective-missing',
        passed: false,
        severity: 'critical',
        details: 'No explicit action verb or objective command found.',
        evidence: [trimmed],
      };
    }

    return {
      ruleId: 'rule-2-objective-missing',
      passed: true,
      severity: 'critical',
    };
  },
};
