import { describe, it, expect } from 'vitest';
import { linkedinAdapter } from '../../../platform/linkedin/adapter';

describe('LinkedIn Integration', () => {
  it('identifies LinkedIn hostname correctly', () => {
    expect(linkedinAdapter.matches({ hostname: 'linkedin.com' } as Location)).toBe(true);
    expect(linkedinAdapter.matches({ hostname: 'www.linkedin.com' } as Location)).toBe(true);
    expect(linkedinAdapter.matches({ hostname: 'feed.linkedin.com' } as Location)).toBe(true);
    expect(linkedinAdapter.matches({ hostname: 'github.com' } as Location)).toBe(false);
  });

  it('provides correct labels for LinkedIn UI', () => {
    expect(linkedinAdapter.labels.emptyTitle).toContain('LinkedIn');
    expect(linkedinAdapter.labels.replaceAction).toBe('Replace Post');
    expect(linkedinAdapter.labels.missingContextTitle).toContain('Hook');
  });
});
