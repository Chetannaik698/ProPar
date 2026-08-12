import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { AnalysisCard } from '../../prompt-analysis/components/AnalysisCard';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';
import type { PopupPosition } from '../../../platform/overlay/OverlayManager';

interface ProParPopupProps {
  isDark?: boolean;
  isOpen: boolean;
  onClose: () => void;
  position: PopupPosition | null;
  autoAnalyze?: boolean;
  onMeasure?: (height: number) => void;
  platform: ActivePlatformAdapter;
}

export function ProParPopup({ isDark = false, isOpen, onClose, position, autoAnalyze = false, onMeasure, platform }: ProParPopupProps) {
  const reduceMotion = useReducedMotion();
  const elRef = useRef<HTMLDivElement | null>(null);
  const lastMeasuredHeightRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      lastMeasuredHeightRef.current = 0;
      return;
    }

    let raf: number | null = null;
    const measure = () => {
      const height = elRef.current?.offsetHeight ?? 0;
      if (!onMeasure || height <= 0 || Math.abs(height - lastMeasuredHeightRef.current) < 4) {
        return;
      }

      lastMeasuredHeightRef.current = height;
      onMeasure(height);
    };

    const scheduleMeasure = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        measure();
      });
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    if (elRef.current) {
      resizeObserver.observe(elRef.current);
    }

    scheduleMeasure();
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    return () => {
      if (raf !== null) {
        window.cancelAnimationFrame(raf);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [isOpen, onMeasure]);

  if (!position) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={elRef}
          animate={{
            opacity: 1,
            scale: reduceMotion ? 1 : 1,
            y: reduceMotion ? 0 : 0,
          }}
          aria-modal="false"
          className="propar-popup"
          data-theme={isDark ? 'dark' : 'light'}
          exit={{
            opacity: 0,
            scale: reduceMotion ? 1 : 0.98,
            y: reduceMotion ? 0 : 4,
          }}
          initial={{
            opacity: 0,
            scale: reduceMotion ? 1 : 0.98,
            y: reduceMotion ? 0 : 8,
          }}
          style={{
            position: 'absolute',
            top: position.top ?? 'auto',
            bottom: position.bottom ?? 'auto',
            left: position.left,
            width: position.width,
            zIndex: 2147483646,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.18,
            ease: [0.2, 0, 0, 1],
          }}
        >
          <AnalysisCard
            autoAnalyze={autoAnalyze}
            isDark={isDark}
            onClose={onClose}
            platform={platform}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
