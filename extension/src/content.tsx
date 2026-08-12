import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProParExtension } from './app/ProParExtension';
import styles from './styles/index.css?inline';

function mount(): void {
  if (document.getElementById('propar-extension-root')) {
    console.debug('[ProPar] Content script already mounted');
    return;
  }

  // Mount ProPar extension to document body
  // The extension uses an overlay architecture and does NOT modify ChatGPT's DOM
  const rootElement = document.createElement('div');
  rootElement.id = 'propar-extension-root';
  rootElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `;
  document.body.appendChild(rootElement);

  // Inject light DOM styles to ensure the portaled ProParIcon button has a transparent background
  const globalStyle = document.createElement('style');
  globalStyle.id = 'propar-extension-global-styles';
  globalStyle.textContent = `
    .propar-icon {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
    }
    .propar-icon:hover {
      background: rgba(0, 0, 0, 0.06) !important;
    }
    [data-theme="dark"] .propar-icon:hover {
      background: rgba(255, 255, 255, 0.12) !important;
    }

    /* Gemini-specific overrides scoped to the relative flex host */
    [data-propar-anchor-host] {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      flex: 0 0 auto !important;
      position: relative !important;
      vertical-align: middle !important;
      align-self: center !important;
      pointer-events: auto !important;
      z-index: 2147483647 !important;
    }
    [data-propar-anchor-host] .propar-icon {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      border: none !important;
      border-radius: 50% !important;
      background: transparent !important;
      color: inherit !important;
      cursor: pointer !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
      outline: none !important;
      transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    [data-propar-anchor-host] .propar-icon:hover {
      background: rgba(31, 31, 31, 0.08) !important;
    }
    html[data-theme="dark"] [data-propar-anchor-host] .propar-icon:hover,
    html.dark [data-propar-anchor-host] .propar-icon:hover {
      background: rgba(227, 227, 227, 0.08) !important;
    }
    [data-propar-anchor-host] .propar-icon img {
      width: 19px !important;
      height: 19px !important;
      max-width: 19px !important;
      max-height: 19px !important;
      display: block !important;
    }
    [data-propar-anchor-host] .propar-icon:focus-visible {
      outline: 2px solid #0b57d0 !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(globalStyle);

  const shadowRoot = rootElement.attachShadow({ mode: 'open' });

  // Expose isContentEditable and closest overrides on host element to prevent host page scripts from focus-redirecting keyboard events
  Object.defineProperty(rootElement, 'isContentEditable', {
    get() {
      const active = shadowRoot.activeElement;
      return Boolean(
        active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            (active as HTMLElement).isContentEditable)
      );
    },
    configurable: true,
    enumerable: true,
  });

  const originalClosest = rootElement.closest ? rootElement.closest.bind(rootElement) : null;
  rootElement.closest = function (selector: string) {
    const active = shadowRoot.activeElement;
    const isEditingInShadow = Boolean(
      active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable)
    );
    if (
      isEditingInShadow &&
      typeof selector === 'string' &&
      (selector.includes('contenteditable') ||
        selector.includes('textarea') ||
        selector.includes('input') ||
        selector.includes('[contenteditable]'))
    ) {
      return rootElement;
    }
    return originalClosest ? originalClosest(selector) : null;
  };

  // Stop keyboard events from bubbling past shadowRoot to the host document/window
  // This allows React inside shadowRoot to process all input/change events first,
  // while preventing global hotkey listeners on host pages (e.g. Claude) from stealing focus.
  const stopOuterPropagation = (e: Event) => {
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
  };

  shadowRoot.addEventListener('keydown', stopOuterPropagation, false);
  shadowRoot.addEventListener('keyup', stopOuterPropagation, false);
  shadowRoot.addEventListener('keypress', stopOuterPropagation, false);

  const style = document.createElement('style');
  style.textContent = styles;
  const root = document.createElement('div');
  shadowRoot.append(style, root);

  createRoot(root).render(
    <StrictMode>
      <ProParExtension />
    </StrictMode>,
  );
}

console.log('[ProPar] Content script loaded on URL:', window.location.href);

// Mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
