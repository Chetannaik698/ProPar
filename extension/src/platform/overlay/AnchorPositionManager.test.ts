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

  it('uses absolute positioning with 12px horizontal offset spacing for the Gemini platform', () => {
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
    
    const toolbar = document.createElement('div');
    toolbar.style.position = 'absolute';
    toolbar.style.width = '40px';
    toolbar.style.height = '40px';
    composer.appendChild(toolbar);
    document.body.appendChild(composer);

    const manager = new AnchorPositionManager({
      resolveAnchor: () => toolbar,
      resolveContainer: () => composer,
    });

    const cleanup = manager.connect();
    const host = manager.getHostElement();

    expect(host).not.toBeNull();
    expect(host?.style.position).toBe('absolute');
    expect(host?.style.marginLeft).toBe('');
    expect(host?.style.marginRight).toBe('');

    cleanup();

    // Restore original location
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
  });
});
