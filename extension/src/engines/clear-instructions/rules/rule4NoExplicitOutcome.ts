import type { InstructionRule } from '../types';

export const rule4NoExplicitOutcome: InstructionRule = {
  id: 'rule-4-no-explicit-outcome',
  title: 'No Explicit Outcome',
  description: 'Detects prompts that fail to define the intended outcome, deliverable type, or success criteria.',
  severity: 'high',
  importance: 'high',
  recommendation: {
    problem: 'The prompt does not state the expected outcome or criteria for success.',
    reason: 'Specifying the desired outcome ensures the output fulfills the specific end-use requirement.',
    officialRecommendation: 'Specify the desired outcome, target output quality (e.g., "production-ready code", "executive summary"), or key deliverables.',
    expectedImprovement: 'Guides the model to produce output directly tailored to your target deliverable.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-4-no-explicit-outcome',
        passed: false,
        severity: 'high',
      };
    }

    const outcomeKeywords = /\b(production-ready|functional|ready|usable|result|outcome|deliverable|aim|goal|landing page|summary|overview|solution|code|script|report|article|analysis|guide|checklist|dataset|api|ui|component)\b/i;

    const hasOutcome = outcomeKeywords.test(trimmed);

    if (!hasOutcome && trimmed.split(/\s+/).length < 15) {
      return {
        ruleId: 'rule-4-no-explicit-outcome',
        passed: false,
        severity: 'high',
        details: 'No clear target outcome or deliverable specified.',
        evidence: [trimmed],
      };
    }

    return {
      ruleId: 'rule-4-no-explicit-outcome',
      passed: true,
      severity: 'high',
    };
  },
};
