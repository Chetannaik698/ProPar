import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useChatGptTheme } from '../../../shared/hooks/useChatGptTheme';
import { ProParMark } from './ProParMark';

interface FloatingLauncherProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingLauncher = forwardRef<HTMLButtonElement, FloatingLauncherProps>(
  function FloatingLauncher({ isOpen, onClick }, ref) {
    const reduceMotion = useReducedMotion();
    const { isDark } = useChatGptTheme();

    return (
      <motion.button
        aria-controls="propar-analysis-popover"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Analyze prompt with ProPaar"
        className="flex h-[var(--propar-control-size,36px)] w-[var(--propar-control-size,36px)] cursor-pointer items-center justify-center rounded-[var(--propar-control-radius,12px)] border-0 bg-transparent p-0 transition-colors duration-150 hover:bg-[var(--propar-hover,rgba(0,0,0,0.06))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--propar-focus,#0284c7)]" data-theme={isDark ? 'dark' : 'light'}
        onClick={onClick}
        ref={ref}
        transition={{ duration: reduceMotion ? 0 : 0.1, ease: 'easeOut' }}
        type="button"
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      >
        <ProParMark className="h-[18px] w-[18px]" isDark={isDark} />
      </motion.button>
    );
  },
);
