import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { useAnalysisFlow } from '../hooks/useAnalysisFlow';
import { AnalysisShell } from './AnalysisShell';
import { LoadingState, ErrorState, EmptyState } from './ResultCards';
import { ResultsView } from './ResultsView';
import { ClarificationView } from './ClarificationView';
import { GmailComposeFlow } from './GmailComposeFlow';
import { LinkedInComposeFlow } from './LinkedInComposeFlow';
import type { ActivePlatformAdapter } from '../../../platform/adapters/types';

interface AnalysisCardProps {
  isDark?: boolean;
  onClose: () => void;
  autoAnalyze?: boolean;
  platform: ActivePlatformAdapter;
}

export function AnalysisCard({ isDark = false, onClose, autoAnalyze = false, platform }: AnalysisCardProps) {
  const reduceMotion = useReducedMotion();
  const {
    completedStepCount,
    phase,
    start,
    analysis,
    error,
    retry,
    dismissError,
    submitClarifications,
    isOriginalPromptEmpty,
  } = useAnalysisFlow(platform);

  useEffect(() => {
    if (autoAnalyze && phase === 'idle' && !error) {
      void start();
    }
  }, [autoAnalyze, error, phase, start]);

  const clarificationQuestions = analysis?.clarificationQuestions ?? [];
  const contentTransition = { duration: reduceMotion ? 0 : 0.16, ease: [0.2, 0, 0, 1] } as const;
  const contentInitial = { opacity: 0, y: reduceMotion ? 0 : 6 };
  const contentAnimate = { opacity: 1, y: 0 };
  const contentExit = { opacity: 0, y: reduceMotion ? 0 : 6 };

  return (
    <AnalysisShell isDark={isDark} onClose={onClose} platform={platform}>
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'idle' && !autoAnalyze && (
          <motion.div animate={contentAnimate} exit={contentExit} key="idle" transition={contentTransition}>
            {platform.id === 'gmail' ? (
              <GmailComposeFlow
                onStartAnalysis={(promptText) => { void start(promptText); }}
                onClose={onClose}
              />
            ) : platform.id === 'linkedin' ? (
              <LinkedInComposeFlow
                onStartAnalysis={(promptText: string) => { void start(promptText); }}
                onClose={onClose}
              />
            ) : (
              <EmptyState labels={platform.labels} onStart={() => { void start(); }} />
            )}
          </motion.div>
        )}

        {phase === 'analyzing' && (
          <motion.div animate={contentAnimate} exit={contentExit} key="analyzing" transition={contentTransition}>
            <LoadingState completedStepCount={completedStepCount} />
          </motion.div>
        )}

        {error && phase !== 'clarifying' && (
          <motion.div animate={contentAnimate} exit={contentExit} key="error" transition={contentTransition}>
            <ErrorState message={error.message} onRetry={retry} onDismiss={dismissError} />
          </motion.div>
        )}

        {phase === 'clarifying' && clarificationQuestions.length > 0 && (
          <motion.div animate={contentAnimate} initial={contentInitial} key="clarifying" transition={contentTransition}>
            <ClarificationView
              errorMessage={error?.message}
              onSubmit={(answers) => { void submitClarifications(answers); }}
              questions={clarificationQuestions}
            />
          </motion.div>
        )}

        {phase === 'complete' && analysis && (
          <motion.div animate={contentAnimate} initial={contentInitial} key="complete" transition={contentTransition}>
            <ResultsView
              analysis={analysis}
              onClose={onClose}
              platform={platform}
              isOriginalPromptEmpty={isOriginalPromptEmpty}
              onRegenerate={retry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AnalysisShell>
  );
}
