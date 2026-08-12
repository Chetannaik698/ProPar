import type { InstructionRule } from '../types';
import { rule1InstructionAfterContext } from './rule1InstructionAfterContext';
import { rule2ObjectiveMissing } from './rule2ObjectiveMissing';
import { rule3TaskAmbiguous } from './rule3TaskAmbiguous';
import { rule4NoExplicitOutcome } from './rule4NoExplicitOutcome';
import { rule5NoOutputFormat } from './rule5NoOutputFormat';
import { rule6VagueWords } from './rule6VagueWords';
import { rule7OnlyNegativeInstructions } from './rule7OnlyNegativeInstructions';
import { rule8MixedInstructionContext } from './rule8MixedInstructionContext';
import { rule9StyleToneUndefined } from './rule9StyleToneUndefined';
import { rule10MultipleUnrelatedObjectives } from './rule10MultipleUnrelatedObjectives';
import { rule11ReasoningModelCoTMistake } from './rule11ReasoningModelCoTMistake';

export {
  rule1InstructionAfterContext,
  rule2ObjectiveMissing,
  rule3TaskAmbiguous,
  rule4NoExplicitOutcome,
  rule5NoOutputFormat,
  rule6VagueWords,
  rule7OnlyNegativeInstructions,
  rule8MixedInstructionContext,
  rule9StyleToneUndefined,
  rule10MultipleUnrelatedObjectives,
  rule11ReasoningModelCoTMistake,
};

export const defaultRules: InstructionRule[] = [
  rule1InstructionAfterContext,
  rule2ObjectiveMissing,
  rule3TaskAmbiguous,
  rule4NoExplicitOutcome,
  rule5NoOutputFormat,
  rule6VagueWords,
  rule7OnlyNegativeInstructions,
  rule8MixedInstructionContext,
  rule9StyleToneUndefined,
  rule10MultipleUnrelatedObjectives,
  rule11ReasoningModelCoTMistake,
];
