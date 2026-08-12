export const analysisSteps = [
  'Understanding intent',
  'Detecting missing context',
  'Finding assumptions',
  'Improving structure',
] as const;

export const prototypeAnalysis = {
  intent: 'Build a Gym Website',
  missingContext: [
    'Target audience',
    'Membership plans',
    'Brand identity',
    'SEO',
    'Mobile responsiveness',
  ],
  suggestions: ['Add target audience', 'Improve clarity', 'Define business goal'],
} as const;

export type AnalysisPhase = 'idle' | 'analyzing' | 'clarifying' | 'complete';
