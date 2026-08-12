import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatGptComposerAdapter } from './ChatGptComposerAdapter';

class ResizeObserverStub {
  disconnect = vi.fn();
  observe = vi.fn();
}

describe('ChatGptComposerAdapter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('reports whether the composer contains meaningful text', () => {
    const form = document.createElement('form');
    const composer = document.createElement('div');
    composer.id = 'prompt-textarea';
    composer.contentEditable = 'true';
    const actions = document.createElement('div');
    const sendButton = document.createElement('button');
    sendButton.dataset.testid = 'send-button';
    actions.append(sendButton);
    form.append(composer, actions);
    document.body.append(form);

    const host = document.createElement('div');
    document.documentElement.append(host);

    const adapter = new ChatGptComposerAdapter(host);
    const listener = vi.fn();
    const disconnect = adapter.connect(listener);

    expect(Array.from(actions.children)).toEqual(expect.arrayContaining([host, sendButton]));
    expect(host.nextElementSibling).toBe(sendButton);
    expect(listener).toHaveBeenLastCalledWith({ hasText: false, mounted: true });
    composer.textContent = 'Build me a gym website';
    composer.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(listener).toHaveBeenLastCalledWith({ hasText: true, mounted: true });
    disconnect();
  });
});
