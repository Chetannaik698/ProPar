"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { workflowStages } from "@/lib/data";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const BEFORE = "review my presentation for tomorrow's board meeting";
const AFTER =
  "Review my board deck for tomorrow's meeting. Focus on the Q3 revenue slide and the hiring plan — flag anything a first-time board member might question.";

export function PromptShowcase() {
  const reduced = useReducedMotion();
  const [stageIndex, setStageIndex] = useState(0);
  const finalStage = stageIndex === workflowStages.length - 1;

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % workflowStages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [reduced]);

  const activeStage = workflowStages[Math.min(stageIndex, workflowStages.length - 1)]!;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl2 border border-border-soft bg-surface shadow-soft">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 text-[11px] text-muted-2">
          <span>propaar.netlify.app · live preview</span>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        {/* prompt area */}
        <div className="border-b border-border p-6 md:border-b-0 md:border-r">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-2">
            Your message
          </p>
          <div className="min-h-[112px] rounded-lg border border-border-soft bg-canvas p-4 font-mono text-[13.5px] leading-relaxed text-ink/90">
            <AnimatePresence mode="wait">
              <motion.p
                key={finalStage ? "after" : "before"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {finalStage ? AFTER : BEFORE}
                {!finalStage && !reduced && (
                  <span className="ml-0.5 inline-block h-4 w-[2px] animate-blink bg-accent-soft align-middle" />
                )}
              </motion.p>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {stageIndex >= 3 && !finalStage && (
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 inline-flex items-start gap-2 rounded-lg border border-accent-dim/50 bg-accent/10 px-3 py-2 text-xs text-accent-soft"
              >
                <Circle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                <span>{activeStage.description}</span>
              </motion.div>
            )}
            {finalStage && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
              >
                <Check className="h-3.5 w-3.5" aria-hidden />
                Ready to send
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* stage timeline */}
        <div className="p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-2">
            ProPaar is thinking
          </p>
          <ol className="space-y-3.5">
            {workflowStages.map((stage, i) => {
              const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
              return (
                <li key={stage.id} className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors duration-300 ${
                      state === "done"
                        ? "border-accent bg-accent text-white"
                        : state === "active"
                          ? "border-accent-soft text-accent-soft"
                          : "border-border-soft text-muted-2"
                    }`}
                  >
                    {state === "done" ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span
                    className={`text-[13px] transition-colors duration-300 ${
                      state === "pending" ? "text-muted-2" : "text-ink"
                    }`}
                  >
                    {stage.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
