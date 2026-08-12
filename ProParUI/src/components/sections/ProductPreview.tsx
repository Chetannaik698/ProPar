"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { platforms, platformDemos } from "@/lib/data";

export function ProductPreview() {
  const [active, setActive] = useState<(typeof platforms)[number]["id"]>("chatgpt");
  const demo = platformDemos[active];

  return (
    <section className="border-t border-border py-24 md:py-32" id="product-preview">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            Product preview
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            The same careful review, everywhere you write.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="overflow-hidden rounded-xl2 border border-border-soft bg-surface shadow-soft">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 pt-3">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className={`relative shrink-0 rounded-t-md px-4 py-2.5 text-sm transition-colors ${
                    active === p.id ? "text-ink" : "text-muted-2 hover:text-muted"
                  }`}
                  aria-pressed={active === p.id}
                >
                  {p.label}
                  {active === p.id && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute inset-x-3 -bottom-px h-[2px] bg-accent"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-6 p-6 md:grid-cols-2 md:p-8"
              >
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-2">
                    Before
                  </p>
                  <div className="rounded-lg border border-border-soft bg-canvas p-4 font-mono text-[13px] leading-relaxed text-muted">
                    {demo.before}
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-xs text-amber-300/90">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{demo.issue}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-accent-soft">
                    <ArrowRight className="h-3 w-3" aria-hidden />
                    After ProPar
                  </p>
                  <div className="rounded-lg border border-accent-dim/50 bg-accent/5 p-4 font-mono text-[13px] leading-relaxed text-ink">
                    {demo.after}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
