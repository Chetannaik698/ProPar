import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AnchorPositionManager } from './AnchorPositionManager';

class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

class MockIntersectionObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
function markVisible(element: HTMLElement, width = 160, height = 32): void {
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
}

function createComposerText(text: string): HTMLElement {
  const editor = document.createElement('div');
  editor.setAttribute('contenteditable', 'true');
  editor.setAttribute('role', 'textbox');
  editor.setAttribute('aria-label', 'Message prompt');
  editor.textContent = text;
  markVisible(editor, 240, 32);
  return editor;
}

describe('AnchorPositionManager', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: MockResizeObserver,
    });
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('attaches its host container to the composer scope instead of the viewport', () => {
    const composer = document.createElement('div');
    composer.style.position = 'relative';
    composer.style.width = '320px';
    composer.style.height = '140px';
    composer.style.marginTop = '50px';

    const toolbar = document.createElement('div');
    toolbar.style.position = 'absolute';
    toolbar.style.right = '12px';
    toolbar.style.bottom = '12px';
    toolbar.style.width = '96px';
    toolbar.style.height = '40px';
    composer.appendChild(toolbar);

    document.body.appendChild(composer);

    const manager = new AnchorPositionManager({
      resolveAnchor: () => toolbar,
      resolveContainer: () => composer,
    });

    const cleanup = manager.connect();

    const host = manager.getHostElement();
    const portal = manager.getPortalElement();
    expect(host).not.toBeNull();
    expect(host?.parentElement).toBe(composer);
    expect(host?.shadowRoot).not.toBeNull();
    expect(portal?.getRootNode()).toBe(host?.shadowRoot);
    expect(host?.style.position).toBe('relative');

    cleanup();
  });

  it('positions host container in flow before send button for Gemini with proper spacing', () => {
    const originalLocation = window.location;
    // Mock the location to match Gemini domain
    const mockLocation = new URL('https://gemini.google.com/app');
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: mockLocation,
    });

    const composer = document.createElement('div');
    composer.style.position = 'relative';
    composer.appendChild(createComposerText('Plan a launch'));
    
    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.alignItems = 'center';

    const micButton = document.createElement('button');
    micButton.setAttribute('aria-label', 'Microphone');
    micButton.style.width = '40px';
    micButton.style.height = '40px';

    const sendButton = document.createElement('button');
    sendButton.setAttribute('aria-label', 'Send message');
    sendButton.style.width = '40px';
    sendButton.style.height = '40px';

    actionRow.append(micButton, sendButton);
    composer.appendChild(actionRow);
    document.body.appendChild(composer);

    const manager = new AnchorPositionManager({
      resolveAnchor: () => sendButton,
      resolveContainer: () => actionRow,
    });

    const cleanup = manager.connect();
    const host = manager.getHostElement();

    expect(host).not.toBeNull();
    expect(manager.getAnchorElement()).toBe(sendButton);
    expect(host?.parentElement).toBe(actionRow);
    expect(host?.nextElementSibling).toBe(sendButton);
    expect(host?.previousElementSibling).toBe(micButton);
    expect(host?.style.position).toBe('relative');
    expect(host?.style.marginLeft).toBe('6px');
    expect(host?.style.marginRight).toBe('6px');

    cleanup();

    // Restore original location
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });

  it('positions host container in flow between microphone and send button for Claude with proper spacing and visibility', () => {
    const originalLocation = window.location;
    const mockLocation = new URL('https://claude.ai/chat/123');
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: mockLocation,
    });

    const composer = document.createElement('div');
    composer.style.position = 'relative';
    composer.appendChild(createComposerText('Draft the project plan'));

    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.alignItems = 'center';

    const modelButton = document.createElement('button');
    modelButton.textContent = 'Sonnet 5 Medium';

    const micButton = document.createElement('button');
    micButton.setAttribute('aria-label', 'Use voice input');
    markVisible(micButton, 40, 40);

    const sendButton = document.createElement('button');
    sendButton.setAttribute('aria-label', 'Send prompt');
    markVisible(sendButton, 40, 40);

    actionRow.append(modelButton, micButton, sendButton);
    composer.appendChild(actionRow);
    document.body.appendChild(composer);

    const manager = new AnchorPositionManager({
      resolveAnchor: () => micButton,
      resolveContainer: () => actionRow,
    });

    const cleanup = manager.connect();
    const host = manager.getHostElement();

    expect(host).not.toBeNull();
    expect(host?.parentElement).toBe(actionRow);
    expect(host?.nextElementSibling).toBe(micButton);
    expect(micButton.nextElementSibling).toBe(sendButton);
    expect(actionRow.style.display).toBe('flex');
    expect(actionRow.style.alignItems).toBe('center');
    expect(actionRow.style.gap).toBe('10px');
    expect(host?.style.marginLeft).toBe('6px');
    expect(host?.style.position).toBe('relative');
    expect(host?.style.display).toBe('inline-flex');

    cleanup();

    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });

  it('hides the Claude host while the composer is empty', () => {
    const originalLocation = window.location;
    const mockLocation = new URL('https://claude.ai/chat/empty');
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: mockLocation,
    });

    const actionRow = document.createElement('div');
    const sendButton = document.createElement('button');
    sendButton.setAttribute('aria-label', 'Send prompt');
    actionRow.appendChild(sendButton);
    document.body.appendChild(actionRow);

    const manager = new AnchorPositionManager({
      resolveAnchor: () => sendButton,
      resolveContainer: () => actionRow,
    });

    const cleanup = manager.connect();
    const host = manager.getHostElement();

    expect(host).not.toBeNull();
    expect(host?.style.display).toBe('none');

    cleanup();

    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });
});
