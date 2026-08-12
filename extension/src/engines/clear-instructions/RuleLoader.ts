import type { InstructionRule } from './types';
import { defaultRules } from './rules';

export class RuleLoader {
  private rules: Map<string, InstructionRule>;

  constructor(initialRules: InstructionRule[] = defaultRules) {
    this.rules = new Map();
    this.loadRules(initialRules);
  }

  /**
   * Load an array of rules into the registry.
   */
  public loadRules(rules: InstructionRule[]): void {
    for (const rule of rules) {
      this.registerRule(rule);
    }
  }

  /**
   * Register a single instruction rule.
   * Enables adding future rules without changing engine code.
   */
  public registerRule(rule: InstructionRule): void {
    if (!rule.id) {
      throw new Error('InstructionRule must have a valid non-empty id.');
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Unregister a rule by ID.
   */
  public unregisterRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get a registered rule by ID.
   */
  public getRule(ruleId: string): InstructionRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all currently loaded instruction rules.
   */
  public getRules(): InstructionRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Clear all registered rules.
   */
  public clear(): void {
    this.rules.clear();
  }
}
