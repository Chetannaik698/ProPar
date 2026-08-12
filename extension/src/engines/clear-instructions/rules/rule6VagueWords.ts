import type { InstructionRule } from '../types';

export const rule6VagueWords: InstructionRule = {
  id: 'rule-6-vague-words-used',
  title: 'Uses Vague Words Instead of Measurable Constraints',
  description: 'Detects subjective words (e.g. short, brief, detailed, good, professional) or lack of measurable constraints.',
  severity: 'high',
  importance: 'high',
  recommendation: {
    problem: 'Prompt uses vague descriptors or lacks numeric/measurable requirements.',
    reason: 'Vague words are subjective and interpreted differently by language models, leading to inconsistent response length and depth.',
    officialRecommendation: 'Replace vague language with measurable requirements (e.g., instead of "short", specify "under 150 words" or "3 key bullet points").',
    expectedImprovement: 'Provides precise parameters for length, scope, and technical depth.',
  },
  detector: (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        ruleId: 'rule-6-vague-words-used',
        passed: true,
        severity: 'high',
      };
    }

    const vagueWordsPattern = /\b(short|brief|detailed|good|professional|quick|simple|proper|nice|long)\b/i;
    const numericConstraintPattern = /\b(\d+\s*(words|sentences|paragraphs|pages|lines|bullets|items|points|characters)|under\s+\d+|max\s+\d+|limit\s+to\s+\d+|using\s+[a-z0-9]+)\b/i;

    const matches = trimmed.match(new RegExp(vagueWordsPattern.source, 'gi'));
    const hasMeasurable = numericConstraintPattern.test(trimmed);

    // If vague words are present without numbers, OR prompt is a short command without constraints
    const words = trimmed.split(/\s+/).filter(Boolean);
    if ((matches && matches.length > 0 && !hasMeasurable) || (words.length <= 3 && !hasMeasurable)) {
      return {
        ruleId: 'rule-6-vague-words-used',
        passed: false,
        severity: 'high',
        details: matches
          ? `Uses vague terms: ${Array.from(new Set(matches)).join(', ')} without measurable constraints.`
          : 'Lacks measurable constraints or scope metrics.',
        evidence: matches ? Array.from(new Set(matches)) : [trimmed],
      };
    }

    return {
      ruleId: 'rule-6-vague-words-used',
      passed: true,
      severity: 'high',
    };
  },
};
