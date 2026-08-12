import type { InstructionRule } from '../types';

export const rule1InstructionAfterContext: InstructionRule = {
  id: 'rule-1-instruction-after-context',
  title: 'Instruction Appears After Context',
  description: 'Detects prompts where background context appears before primary instructions without clear structure.',
  severity: 'medium',
  importance: 'medium',
  recommendation: {
    problem: 'Primary instructions are placed after background context or details.',
    reason: 'OpenAI official guidance recommends placing instructions at the beginning of the prompt to ensure the model immediately understands the primary task.',
    officialRecommendation: 'Place instructions at the beginning of the prompt and use delimiters (such as ### or quotes) to set off context.',
    expectedImprovement: 'Improves instruction follow-through by establishing the objective before parsing contextual material.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-1-instruction-after-context',
        passed: true,
        severity: 'medium',
      };
    }

    const sentences = trimmed.split(/(?<=[.!?\n])\s+/).filter(Boolean);
    if (sentences.length < 2) {
      return {
        ruleId: 'rule-1-instruction-after-context',
        passed: true,
        severity: 'medium',
      };
    }

    const actionKeywords = /^(create|build|generate|write|analyze|summarize|explain|find|calculate|convert|translate|draft|develop|implement|design|provide|return|list)/i;
    const contextKeywords = /^(here is|the following|given|context:|background:|below is|referring to|based on the|data:|info:)/i;

    const firstSentenceIsContext = contextKeywords.test(sentences[0]);
    const lastSentenceIsAction = actionKeywords.test(sentences[sentences.length - 1]);

    const hasDelimiters = /###|---|```|<context>/i.test(trimmed);

    // Passed if instructions are first or if proper delimiters separate instruction from context
    if ((firstSentenceIsContext && lastSentenceIsAction && !hasDelimiters) || (!actionKeywords.test(sentences[0]) && actionKeywords.test(sentences[sentences.length - 1]) && !hasDelimiters)) {
      return {
        ruleId: 'rule-1-instruction-after-context',
        passed: false,
        severity: 'medium',
        details: 'Instruction is placed at the end after context material.',
        evidence: [sentences[0], sentences[sentences.length - 1]],
      };
    }

    return {
      ruleId: 'rule-1-instruction-after-context',
      passed: true,
      severity: 'medium',
    };
  },
};
