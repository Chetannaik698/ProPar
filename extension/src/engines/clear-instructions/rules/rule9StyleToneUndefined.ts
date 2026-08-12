import type { InstructionRule } from '../types';

export const rule9StyleToneUndefined: InstructionRule = {
  id: 'rule-9-style-tone-undefined',
  title: 'Style or Tone Requested But Undefined',
  description: 'Detects prompts that request specific style, tone, or voice without defining the explicit target characteristics.',
  severity: 'low',
  importance: 'low',
  recommendation: {
    problem: 'Prompt requests tone or style without defining explicit style guidelines or persona.',
    reason: 'Vague style requests lead to inconsistent output formatting, voice, and reading level.',
    officialRecommendation: 'Specify style or tone when necessary by defining the explicit persona, target audience, or voice (e.g., "conversational, executive summary tone for a tech audience").',
    expectedImprovement: 'Aligns response tone and vocabulary with target audience expectations.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-9-style-tone-undefined',
        passed: true,
        severity: 'low',
      };
    }

    const mentionsStyle = /\b(style|tone|voice|manner)\b/i.test(trimmed);
    const definesStyle = /\b(formal|informal|conversational|professional|academic|friendly|persuasive|technical|exec|casual|authoritative|empathic|humorous)\b/i.test(trimmed);

    if (mentionsStyle && !definesStyle) {
      return {
        ruleId: 'rule-9-style-tone-undefined',
        passed: false,
        severity: 'low',
        details: 'Mentions style/tone but leaves target voice undefined.',
        evidence: [trimmed],
      };
    }

    return {
      ruleId: 'rule-9-style-tone-undefined',
      passed: true,
      severity: 'low',
    };
  },
};
