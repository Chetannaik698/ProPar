import type { InstructionRule } from '../types';

export const rule5NoOutputFormat: InstructionRule = {
  id: 'rule-5-no-output-format',
  title: 'No Desired Output Format',
  description: 'Detects prompts that do not specify the preferred structural output format.',
  severity: 'medium',
  importance: 'medium',
  recommendation: {
    problem: 'No specific output format (e.g. JSON, markdown, table, bulleted list, TypeScript) is requested.',
    reason: 'Specifying output format prevents unformatted or plain text responses when a structured format is preferred.',
    officialRecommendation: 'Specify output format explicitly (e.g., "Return output as a markdown table", "Return production-ready code in TypeScript", "Provide a bulleted list").',
    expectedImprovement: 'Ensures output is pre-formatted for direct copy-paste or integration into your workflow.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-5-no-output-format',
        passed: false,
        severity: 'medium',
      };
    }

    const formatKeywords = /\b(json|markdown|table|bullet|bullets|list|typescript|javascript|python|html|css|code|yaml|xml|csv|step-by-step|sections|format|structure|template)\b/i;

    const hasFormat = formatKeywords.test(trimmed);

    if (!hasFormat) {
      return {
        ruleId: 'rule-5-no-output-format',
        passed: false,
        severity: 'medium',
        details: 'No output format specified.',
        evidence: [trimmed],
      };
    }

    return {
      ruleId: 'rule-5-no-output-format',
      passed: true,
      severity: 'medium',
    };
  },
};
