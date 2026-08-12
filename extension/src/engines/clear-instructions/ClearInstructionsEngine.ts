import type { InstructionAnalysisReport, InstructionRule } from './types';
import { RuleLoader } from './RuleLoader';
import { RuleEvaluator } from './RuleEvaluator';
import { ScoringService } from './ScoringService';
import { RecommendationBuilder } from './RecommendationBuilder';

export class ClearInstructionsEngine {
  private loader: RuleLoader;
  private evaluator: RuleEvaluator;
  private scoringService: ScoringService;
  private recommendationBuilder: RecommendationBuilder;

  constructor(customRules?: InstructionRule[]) {
    this.loader = new RuleLoader(customRules);
    this.evaluator = new RuleEvaluator();
    this.scoringService = new ScoringService();
    this.recommendationBuilder = new RecommendationBuilder();
  }

  /**
   * Register an additional custom rule into the engine runtime.
   */
  public registerRule(rule: InstructionRule): void {
    this.loader.registerRule(rule);
  }

  /**
   * Main entry point to evaluate a prompt against OpenAI's Clear Instructions principles.
   * Runs the complete analysis pipeline without mutating or rewriting the prompt.
   */
  public analyze(prompt: string): InstructionAnalysisReport {
    const rules = this.loader.getRules();
    const results = this.evaluator.evaluate(prompt, rules);

    const score = this.scoringService.calculateScore(results);
    const overallSeverity = this.scoringService.calculateOverallSeverity(results);
    const issues = this.recommendationBuilder.buildIssues(results, rules);
    const recommendations = this.recommendationBuilder.buildRecommendations(results, rules);
    const strengths = this.recommendationBuilder.buildStrengths(results, rules);
    const detectedRules = results.map((r) => r.ruleId);

    return {
      score,
      severity: overallSeverity,
      issues,
      recommendations,
      detectedRules,
      strengths,
    };
  }
}
