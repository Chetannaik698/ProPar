import type { InstructionRule } from '../types';

export const rule8MixedInstructionContext: InstructionRule = {
  id: 'rule-8-mixed-instruction-context',
  title: 'Instruction and Context Mixed Without Separators',
  description: 'Detects prompts where background information and action instructions are mixed without clear section delimiters.',
  severity: 'medium',
  importance: 'medium',
  recommendation: {
    problem: 'Instructions and reference context are blended together without clear delimiters.',
    reason: 'Blending context with instructions can cause the model to confuse reference text for actionable commands.',
    officialRecommendation: 'Separate instructions from context using delimiters (e.g., ###, ---, ```, or XML tags like <context>).',
    expectedImprovement: 'Helps the model distinguish actionable commands from supporting background context.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-8-mixed-instruction-context',
        passed: true,
        severity: 'medium',
      };
    }

    const sentences = trimmed.split(/(?<=[.!?\n])\s+/).filter(Boolean);
    if (sentences.length < 2) {
      return {
        ruleId: 'rule-8-mixed-instruction-context',
        passed: true,
        severity: 'medium',
      };
    }

    const hasDelimiters = /###|---|```|<context>|<data>|"""|'''/i.test(trimmed);
    const hasContextPattern = /\b(here is|given|the following|background|context|for example|data|text|below|info|sales data)\b/i.test(trimmed);
    const hasInstructionPattern = /\b(create|build|generate|write|analyze|summarize|explain|find|calculate|convert|translate)\b/i.test(trimmed);

    if (hasContextPattern && hasInstructionPattern && !hasDelimiters) {
      return {
        ruleId: 'rule-8-mixed-instruction-context',
        passed: false,
        severity: 'medium',
        details: 'Prompt contains both context and instructions without structural delimiters.',
        evidence: [trimmed.substring(0, 100) + '...'],
      };
    }

    return {
      ruleId: 'rule-8-mixed-instruction-context',
      passed: true,
      severity: 'medium',
    };
  },
};
