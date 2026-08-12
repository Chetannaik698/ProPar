export interface PredictionInput {
  promptDraft: string;
  platformName?: string;
}

export interface PredictiveSuggestion {
  label: string;
  reason?: string;
}

export interface PredictionProvider {
  readonly name: string;
  suggest(input: PredictionInput): Promise<PredictiveSuggestion[]>;
}

export class PredictionNotImplementedProvider implements PredictionProvider {
  readonly name = 'future-prediction-provider';

  suggest(): Promise<PredictiveSuggestion[]> {
    return Promise.resolve([]);
  }
}
