import { describe, expect, it } from 'vitest';
import { ClearInstructionsEngine } from '../ClearInstructionsEngine';
import { RuleLoader } from '../RuleLoader';
import { RuleEvaluator } from '../RuleEvaluator';
import { ScoringService } from '../ScoringService';
import { RecommendationBuilder } from '../RecommendationBuilder';
import type { InstructionRule } from '../types';

import { defaultRules } from '../rules';

describe('ClearInstructionsEngine', () => {
  it('should initialize and evaluate a high quality prompt (Example 2)', () => {
    const engine = new ClearInstructionsEngine();
    const prompt =
      'Create a responsive React landing page for a fintech startup using Tailwind CSS. Return production-ready code in TypeScript.';

    const report = engine.analyze(prompt);

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.detectedRules.length).toBe(defaultRules.length);
    expect(report.strengths.length).toBeGreaterThan(0);
    expect(report.issues.length).toBeLessThanOrEqual(2);
  });

  it('should detect violations for a weak ambiguous prompt (Example 1)', () => {
    const engine = new ClearInstructionsEngine();
    const prompt = 'Build website';

    const report = engine.analyze(prompt);

    expect(report.score).toBeLessThan(60);
    expect(report.severity).toBe('critical');

    // Should report missing objective/ambiguous task, missing format, missing outcome
    const ruleIds = report.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain('rule-3-task-ambiguous');
    expect(ruleIds).toContain('rule-5-no-output-format');

    // Recommendations should have full structure
    for (const rec of report.recommendations) {
      expect(rec.problem).toBeTruthy();
      expect(rec.reason).toBeTruthy();
      expect(rec.officialRecommendation).toBeTruthy();
      expect(rec.expectedImprovement).toBeTruthy();
    }
  });

  it('should detect Rule 1: Instruction appears after context', () => {
    const engine = new ClearInstructionsEngine();
    const prompt =
      'The following data contains customer feedback from last quarter including satisfaction scores and text comments. Create a summary report.';

    const report = engine.analyze(prompt);
    const rule1Violation = report.issues.find((i) => i.ruleId === 'rule-1-instruction-after-context');
    expect(rule1Violation).toBeDefined();
  });

  it('should detect Rule 6: Uses vague words without measurable constraints', () => {
    const engine = new ClearInstructionsEngine();
    const prompt = 'Write a short and brief explanation of quantum computing. Make it good and professional.';

    const report = engine.analyze(prompt);
    const rule6Violation = report.issues.find((i) => i.ruleId === 'rule-6-vague-words-used');
    expect(rule6Violation).toBeDefined();
    expect(rule6Violation?.evidence).toContain('short');
  });

  it('should detect Rule 7: Only negative instructions given', () => {
    const engine = new ClearInstructionsEngine();
    const prompt = 'Do not use jargon and avoid passive voice.';

    const report = engine.analyze(prompt);
    const rule7Violation = report.issues.find((i) => i.ruleId === 'rule-7-only-negative-instructions');
    expect(rule7Violation).toBeDefined();
  });

  it('should detect Rule 8: Instruction and context mixed without separators', () => {
    const engine = new ClearInstructionsEngine();
    const prompt =
      'Here is the sales data for Q3 showing product revenue breakdown across North America and Europe regions. Create a summary analysis table highlighting top performers.';

    const report = engine.analyze(prompt);
    const rule8Violation = report.issues.find((i) => i.ruleId === 'rule-8-mixed-instruction-context');
    expect(rule8Violation).toBeDefined();
  });

  it('should detect Rule 9: Style or tone requested but undefined', () => {
    const engine = new ClearInstructionsEngine();
    const prompt = 'Create a blog post about artificial intelligence. Pay attention to style and tone.';

    const report = engine.analyze(prompt);
    const rule9Violation = report.issues.find((i) => i.ruleId === 'rule-9-style-tone-undefined');
    expect(rule9Violation).toBeDefined();
  });

  it('should detect Rule 10: Multiple unrelated objectives without prioritization', () => {
    const engine = new ClearInstructionsEngine();
    const prompt = 'Create a marketing strategy, build a website, generate a pricing plan, and refactor the backend API.';

    const report = engine.analyze(prompt);
    const rule10Violation = report.issues.find((i) => i.ruleId === 'rule-10-multiple-unrelated-objectives');
    expect(rule10Violation).toBeDefined();
  });

  it('should detect Rule 11: Unnecessary chain of thought for reasoning models', () => {
    const engine = new ClearInstructionsEngine();
    const prompt = 'Solve this math problem. Think step by step and explain your reasoning in detail.';

    const report = engine.analyze(prompt);
    const rule11Violation = report.issues.find((i) => i.ruleId === 'rule-11-reasoning-model-cot-mistake');
    expect(rule11Violation).toBeDefined();
    expect(rule11Violation?.evidence).toContain('Think step by step');
  });

  it('should support registering custom rules dynamically', () => {
    const engine = new ClearInstructionsEngine();

    const customRule: InstructionRule = {
      id: 'rule-custom-no-emojis',
      title: 'Contains Emojis',
      description: 'Detects presence of emojis in professional prompt.',
      severity: 'low',
      importance: 'low',
      recommendation: {
        problem: 'Prompt contains decorative emojis.',
        reason: 'Emojis can introduce unintentional tokens.',
        officialRecommendation: 'Keep prompt text clean and unformatted.',
        expectedImprovement: 'Saves token overhead.',
      },
      detector: (prompt: string) => {
        const hasEmoji = /\p{Extended_Pictographic}/u.test(prompt);
        return {
          ruleId: 'rule-custom-no-emojis',
          passed: !hasEmoji,
          severity: 'low',
          evidence: hasEmoji ? ['emoji detected'] : [],
        };
      },
    };

    engine.registerRule(customRule);

    const report = engine.analyze('Create a website 🚀');
    expect(report.detectedRules).toContain('rule-custom-no-emojis');
    expect(report.issues.some((i) => i.ruleId === 'rule-custom-no-emojis')).toBe(true);
  });
});
