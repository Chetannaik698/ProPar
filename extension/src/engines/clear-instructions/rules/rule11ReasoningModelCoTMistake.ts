import type { InstructionRule } from '../types';

export const rule11ReasoningModelCoTMistake: InstructionRule = {
  id: 'rule-11-reasoning-model-cot-mistake',
  title: 'Unnecessary Chain-of-Thought Prompting for Reasoning Models',
  description: 'Detects explicit chain-of-thought phrases (e.g., "think step by step", "explain your reasoning") that can degrade performance on OpenAI reasoning models (o1, o3, o4-mini).',
  severity: 'medium',
  importance: 'medium',
  recommendation: {
    problem: 'Prompt includes explicit chain-of-thought requests ("think step by step").',
    reason: 'OpenAI reasoning models (o1, o3, o4-mini) perform internal chain-of-thought automatically. Explicitly instructing them to think step by step is unnecessary and can hinder performance.',
    officialRecommendation: 'For reasoning models, state the high-level goal, hard constraints, and success criteria (OpenAI Pattern 6). Skip step-by-step thinking directives.',
    expectedImprovement: 'Allows the reasoning model to optimize its internal reasoning tokens toward your explicit goal and success criteria.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-11-reasoning-model-cot-mistake',
        passed: true,
        severity: 'medium',
      };
    }

    const cotPattern = /\b(think\s+step\s+by\s+step|explain\s+your\s+reasoning|show\s+your\s+work|step\s+by\s+step\s+reasoning|walk\s+me\s+through\s+your\s+thinking)\b/i;
    const match = trimmed.match(cotPattern);

    if (match) {
      return {
        ruleId: 'rule-11-reasoning-model-cot-mistake',
        passed: false,
        severity: 'medium',
        details: `Contains explicit chain-of-thought phrase: "${match[0]}".`,
        evidence: [match[0]],
      };
    }

    return {
      ruleId: 'rule-11-reasoning-model-cot-mistake',
      passed: true,
      severity: 'medium',
    };
  },
};
