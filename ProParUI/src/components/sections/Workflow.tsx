"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { workflowStages } from "@/lib/data";

export function Workflow() {
  const [active, setActive] = useState(0);
  const stage = workflowStages[active]!;

  return (
    <section className="border-t border-border py-24 md:py-32" id="workflow">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            How it works
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            From first draft to ready-to-send, step by step.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {workflowStages.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`relative shrink-0 rounded-lg border px-4 py-3.5 text-left text-sm transition-colors lg:shrink ${
                  active === i
                    ? "border-accent-dim bg-accent/10 text-ink"
                    : "border-border-soft bg-surface text-muted hover:text-ink"
                }`}
                aria-pressed={active === i}
              >
                <span className="mr-2 font-mono text-xs text-muted-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl2 border border-border-soft bg-surface p-8 md:p-10"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
              Step {active + 1} of {workflowStages.length}
            </p>
            <h3 className="mt-4 text-2xl font-medium text-balance text-ink">{stage.title}</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
              {stage.description}
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
