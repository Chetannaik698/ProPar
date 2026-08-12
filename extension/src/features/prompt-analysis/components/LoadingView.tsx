import { motion, useReducedMotion } from 'framer-motion';
import { Check, LoaderCircle } from 'lucide-react';
import { analysisSteps } from '../model/analysis';

interface LoadingViewProps {
  completedStepCount: number;
}

export function LoadingView({ completedStepCount }: LoadingViewProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-live="polite" className="py-1">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="m-0 text-sm font-semibold text-ink">Analyzing your thinking</p>
          <p className="m-0 mt-0.5 text-xs text-muted">This stays on your device.</p>
        </div>
      </div>

      <ol className="m-0 space-y-3 p-0">
        {analysisSteps.map((step, index) => {
          const isComplete = index < completedStepCount;
          return (
            <motion.li
              animate={{ opacity: isComplete ? 1 : 0.45 }}
              className="flex list-none items-center gap-3 text-sm text-zinc-700"
              key={step}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${isComplete ? 'bg-accent text-white' : 'bg-zinc-100 text-zinc-400'}`}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              {step}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
