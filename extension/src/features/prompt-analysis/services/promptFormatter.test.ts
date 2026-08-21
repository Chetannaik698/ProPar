import { describe, expect, it } from 'vitest';
import { formatImprovedPrompt } from './promptFormatter';

describe('formatImprovedPrompt', () => {
  it('preserves dense prose instead of rebucketing it into generated lists', () => {
    const source = 'Build an ecommerce website using React Node MongoDB include authentication payment admin dashboard responsive SEO optimized';
    const result = formatImprovedPrompt(source);

    expect(result.text).toBe(source);
    expect(result.blocks).toEqual([{ type: 'paragraph', text: source }]);
  });

  it('preserves professional prompt sections and lists', () => {
    const result = formatImprovedPrompt('Objective\nBuild a SaaS app.\n\nRequirements\n- React\n- Stripe');

    expect(result.text).toContain('Objective');
    expect(result.text).toContain('Build a SaaS app.');
    expect(result.text).toContain('Requirements');
    expect(result.text).toContain('- React');
    expect(result.text).toContain('- Stripe');
  });

  it('normalizes structural XML prompt wrappers into professional headings', () => {
    const result = formatImprovedPrompt(
      '<task>Generate a practice set for Python string operations.</task>\n\n<constraints>\n- Beginner friendly\n</constraints>\n\n<output_format>Problem and solution for each item.</output_format>',
    );

    expect(result.text).not.toContain('<task>');
    expect(result.text).not.toContain('<constraints>');
    expect(result.text).not.toContain('<output_format>');
    expect(result.text).toContain('Objective');
    expect(result.text).toContain('Generate a practice set for Python string operations.');
    expect(result.text).toContain('Constraints');
    expect(result.text).toContain('- Beginner friendly');
    expect(result.text).toContain('Output Format');
  });
});
