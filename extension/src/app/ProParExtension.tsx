import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProParIcon } from '../features/overlay/components/ProParIcon';
import { ProParPopup } from '../features/overlay/components/ProParPopup';
import { OverlayManager, type PopupPosition } from '../platform/overlay/OverlayManager';
import { getActivePlatformAdapter } from '../platform/adapters/registry';
import type { ActivePlatformAdapter } from '../platform/adapters/types';

type IconPosition = { top: number; left: number };

function isSameIconPosition(first: IconPosition | null, second: IconPosition | null): boolean {
  if (first === second) return true;
  if (!first || !second) return false;
  return Math.abs(first.top - second.top) < 0.5 && Math.abs(first.left - second.left) < 0.5;
}

function isSameOptionalNumber(first: number | undefined, second: number | undefined): boolean {
  if (first === undefined || second === undefined) return first === second;
  return Math.abs(first - second) < 0.5;
}

function isSamePopupPosition(first: PopupPosition | null, second: PopupPosition | null): boolean {
  if (first === second) return true;
  if (!first || !second) return false;
  return (
    isSameOptionalNumber(first.top, second.top) &&
    isSameOptionalNumber(first.bottom, second.bottom) &&
    Math.abs(first.left - second.left) < 0.5 &&
    Math.abs(first.width - second.width) < 0.5
  );
}

export function ProParExtension() {
  const overlay = useRef(new OverlayManager());
  const popupHeightRef = useRef(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [iconPosition, setIconPosition] = useState<IconPosition | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [platform, setPlatform] = useState<ActivePlatformAdapter>(() => getActivePlatformAdapter());
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const manager = overlay.current;
    manager.mount();
    setIsMounted(true);

    const updatePositions = () => {
      const portal = manager.getPortalElement();
      setPortalElement((previous) => (previous === portal ? previous : portal));
      const iconPos = manager.getIconPosition();
      setIconPosition((previous) => (isSameIconPosition(previous, iconPos) ? previous : iconPos));
    };

    updatePositions();

    const unsubscribe = manager.subscribeToUpdates(() => {
      updatePositions();
      const nextIsDark = manager.getThemeState().isDark;
      setIsDark((previous) => (previous === nextIsDark ? previous : nextIsDark));
      const activePlatform = getActivePlatformAdapter();
      setPlatform((previous) => (previous.id === activePlatform.id ? previous : activePlatform));
    });

    const handleMessage = (msg: unknown) => {
      if (typeof msg === 'object' && msg !== null && (msg as { type?: string }).type === 'PROPAR_TOGGLE_POPUP') {
        setIsPopupOpen((prev) => !prev);
        setAutoAnalyze(true);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(handleMessage);
      }
      unsubscribe();
      manager.unmount();
    };
  }, []);

  useEffect(() => {
    const hostEl = document.getElementById('propar-extension-root');
    if (hostEl) {
      hostEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (isPopupOpen && iconPosition) {
      const estimatedPopupHeight = Math.min(window.innerHeight * 0.8, 520);
      const effectiveHeight = popupHeightRef.current || estimatedPopupHeight;
      const popupPos = overlay.current.getPopupPosition(iconPosition.top, iconPosition.left, effectiveHeight);
      setPopupPosition((previous) => (isSamePopupPosition(previous, popupPos) ? previous : popupPos));
    }
  }, [isPopupOpen, iconPosition]);

  const handlePopupMeasure = useCallback((height: number) => {
    if (!iconPosition || !isPopupOpen || height <= 0) return;
    if (Math.abs(height - popupHeightRef.current) < 4) return;

    popupHeightRef.current = height;
    const nextPosition = overlay.current.getPopupPosition(iconPosition.top, iconPosition.left, height);
    setPopupPosition((previous) => (isSamePopupPosition(previous, nextPosition) ? previous : nextPosition));
  }, [iconPosition, isPopupOpen]);

  const handleIconClick = () => {
    if (!iconPosition) return;
    if (!isPopupOpen) {
        const estimatedPopupHeight = Math.min(window.innerHeight * 0.8, 520);
        popupHeightRef.current = estimatedPopupHeight;
        const popupPos = overlay.current.getPopupPosition(iconPosition.top, iconPosition.left, estimatedPopupHeight);
        setPopupPosition((previous) => (isSamePopupPosition(previous, popupPos) ? previous : popupPos));
        setIsPopupOpen(true);
        const activePlatform = getActivePlatformAdapter();
        setPlatform(activePlatform);
        const promptLength = activePlatform.readComposer().length;
        console.debug('[ProPar] Review icon clicked', { platform: activePlatform.id, promptLength });
        const promptExists = promptLength > 0;
        setAutoAnalyze(promptExists);
        return;
    }

    setIsPopupOpen(false);
    setAutoAnalyze(false);
    popupHeightRef.current = 0;
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setAutoAnalyze(false);
    popupHeightRef.current = 0;
  };

  if (!isMounted) return null;

  if (!portalElement) return null;

  return (
    <>
      {createPortal(
        <ProParIcon
          isDark={isDark}
          isVisible
          onClick={handleIconClick}
          position={iconPosition}
        />,
        portalElement,
      )}
      <ProParPopup
        isOpen={isPopupOpen}
        isDark={!isDark}
        onClose={handleClosePopup}
        position={popupPosition}
        platform={platform}
        autoAnalyze={autoAnalyze}
        onMeasure={handlePopupMeasure}
      />
    </>
  );
}
