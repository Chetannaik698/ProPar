export interface UserPreferences {
  writingStyle?: string;
  preferredFrameworks?: string[];
  preferredAiModels?: string[];
  preferredTone?: string;
  frequentlyUsedTechnologies?: string[];
  favoriteOutputFormat?: string;
  recentProjects?: string[];
  currentGoals?: string[];
}

export interface SecondBrainProfile {
  userId?: string;
  preferences?: UserPreferences;
}

export const createEmptySecondBrainProfile = (): SecondBrainProfile => ({
  preferences: {},
});
