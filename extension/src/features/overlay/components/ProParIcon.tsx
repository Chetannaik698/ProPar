import { motion, useReducedMotion } from 'framer-motion';
import { ProParMark } from '../../prompt-analysis/components/ProParMark';

interface ProParIconProps {
  isVisible: boolean;
  isDark?: boolean;
  onClick: () => void;
  position: { top: number; left: number } | null;
}

export function ProParIcon({ isVisible, isDark = false, onClick, position }: ProParIconProps) {
  const reduceMotion = useReducedMotion();

  if (!position || !isVisible) return null;

  return (
    <motion.button
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: reduceMotion ? 1 : 0.98,
      }}
      aria-controls="propaar-popup"
      aria-expanded={isVisible}
      aria-haspopup="dialog"
      aria-label="Analyze prompt with ProPaar"
      className="propaar-icon"
      initial={{ opacity: 0, scale: 0.98 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 36,
        height: 36,
        zIndex: 2147483647,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.15,
        ease: 'easeOut',
      }}
      type="button"
      whileHover={reduceMotion ? undefined : { scale: 1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
    >
      <ProParMark className="h-[18px] w-[18px]" isDark={isDark} />
    </motion.button>
  );
}
