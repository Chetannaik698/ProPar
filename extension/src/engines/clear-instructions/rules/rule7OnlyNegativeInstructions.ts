import type { InstructionRule } from '../types';

export const rule7OnlyNegativeInstructions: InstructionRule = {
  id: 'rule-7-only-negative-instructions',
  title: 'Only Negative Instructions Given',
  description: 'Detects prompts that rely exclusively on negative constraints ("don\'t do X") without providing affirmative directions.',
  severity: 'medium',
  importance: 'medium',
  recommendation: {
    problem: 'Prompt contains negative constraints ("don\'t", "do not", "avoid") without telling the model what TO DO instead.',
    reason: 'Models follow positive instructions more reliably than negative prohibitions.',
    officialRecommendation: 'Tell the model what TO DO rather than only what NOT TO DO.',
    expectedImprovement: 'Directs the model toward desired behavior rather than trying to restrict invalid pathways.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-7-only-negative-instructions',
        passed: true,
        severity: 'medium',
      };
    }

    const negativePattern = /\b(don'?t|do not|never|avoid)\b/i;
    const hasNegative = negativePattern.test(trimmed);

    // Strip out the negative command clauses to check for remaining affirmative directives
    const textWithoutNegatives = trimmed.replace(/\b(don'?t|do not|never|avoid)\s+[^.!?\n,]+/gi, '');
    const positiveDirectivePattern = /\b(create|build|generate|write|analyze|summarize|explain|find|calculate|convert|translate|provide|return|list|include|instead|prefer|ensure|use)\b/i;

    const hasPositiveCorrection = positiveDirectivePattern.test(textWithoutNegatives);

    if (hasNegative && !hasPositiveCorrection) {
      const matches = trimmed.match(new RegExp(negativePattern.source, 'gi')) ?? [];
      return {
        ruleId: 'rule-7-only-negative-instructions',
        passed: false,
        severity: 'medium',
        details: 'Negative constraint found without explicit positive instruction.',
        evidence: Array.from(new Set(matches)),
      };
    }

    return {
      ruleId: 'rule-7-only-negative-instructions',
      passed: true,
      severity: 'medium',
    };
  },
};
