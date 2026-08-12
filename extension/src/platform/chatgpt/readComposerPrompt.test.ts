import { beforeEach, describe, expect, it } from 'vitest';
import { replaceChatGptComposerPrompt } from './readComposerPrompt';

describe('replaceChatGptComposerPrompt', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('replaces textarea text and leaves the caret at the end', () => {
    const composer = document.createElement('textarea');
    composer.id = 'prompt-textarea';
    composer.value = 'Old prompt';
    document.body.append(composer);

    const didReplace = replaceChatGptComposerPrompt('Improved prompt');

    expect(didReplace).toBe(true);
    expect(composer.value).toBe('Improved prompt');
    expect(composer.selectionStart).toBe('Improved prompt'.length);
    expect(document.activeElement).toBe(composer);
  });
});
