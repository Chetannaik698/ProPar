import type { InstructionRule } from '../types';

export const rule10MultipleUnrelatedObjectives: InstructionRule = {
  id: 'rule-10-multiple-unrelated-objectives',
  title: 'Multiple Unrelated Objectives Without Prioritization',
  description: 'Detects prompts that combine multiple distinct tasks without clear step ordering or priority.',
  severity: 'high',
  importance: 'high',
  recommendation: {
    problem: 'Prompt requests multiple distinct tasks simultaneously without priority or ordering.',
    reason: 'Combining multiple unprioritized requests can lead to incomplete execution or missing sub-tasks.',
    officialRecommendation: 'Break down complex prompts into numbered steps or explicitly prioritize objectives.',
    expectedImprovement: 'Ensures systematic execution of every sub-task without missing key requirements.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-10-multiple-unrelated-objectives',
        passed: true,
        severity: 'high',
      };
    }

    const actionMatches = trimmed.match(/\b(create|build|generate|write|analyze|summarize|explain|find|calculate|convert|translate|design|refactor|deploy|test)\b/gi) ?? [];
    const uniqueActions = Array.from(new Set(actionMatches.map((a) => a.toLowerCase())));

    const hasNumberedOrder = /\b(step\s*1|1\.|first|second|finally|priority|then)\b/i.test(trimmed);

    if (uniqueActions.length >= 3 && !hasNumberedOrder) {
      return {
        ruleId: 'rule-10-multiple-unrelated-objectives',
        passed: false,
        severity: 'high',
        details: `Contains ${uniqueActions.length} distinct actions (${uniqueActions.join(', ')}) without prioritization or step ordering.`,
        evidence: uniqueActions,
      };
    }

    return {
      ruleId: 'rule-10-multiple-unrelated-objectives',
      passed: true,
      severity: 'high',
    };
  },
};
