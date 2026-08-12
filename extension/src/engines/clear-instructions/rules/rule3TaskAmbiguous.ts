import type { InstructionRule } from '../types';

export const rule3TaskAmbiguous: InstructionRule = {
  id: 'rule-3-task-ambiguous',
  title: 'Task is Ambiguous',
  description: 'Detects prompts that are extremely short or underspecified without necessary task details or scope.',
  severity: 'critical',
  importance: 'critical',
  recommendation: {
    problem: 'The requested task is too broad or underspecified.',
    reason: 'Ambiguous requests lead to generic or off-target responses because key requirements are left unspecified.',
    officialRecommendation: 'Reduce ambiguity by providing specific details, target audience, context, or scope.',
    expectedImprovement: 'Ensures the AI produces a targeted, relevant response matching your exact scenario.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);

    // Prompts with fewer than 4 words or generic short commands (e.g. "Build website", "Fix code") are ambiguous
    const ambiguousPhrases = /^(build|make|create|write|do|fix|design)\s+(website|app|code|script|essay|post|article|stuff|something|report|paper)$/i;

    if (words.length < 4 || ambiguousPhrases.test(trimmed)) {
      return {
        ruleId: 'rule-3-task-ambiguous',
        passed: false,
        severity: 'critical',
        details: 'Prompt is extremely short and ambiguous.',
        evidence: [trimmed],
      };
    }

    return {
      ruleId: 'rule-3-task-ambiguous',
      passed: true,
      severity: 'critical',
    };
  },
};
