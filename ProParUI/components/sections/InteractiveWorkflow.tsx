"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, SearchCode, EyeOff, Wand2, Send } from "lucide-react";
import { fadeUp, viewportOnce } from "@/animations/variants";

const STEPS = [
  {
    icon: Target,
    title: "Goal detected",
    copy: "You want a deadline moved without sounding like you're behind.",
  },
  {
    icon: SearchCode,
    title: "Missing context found",
    copy: "The reader doesn't know the vendor delay that caused this.",
  },
  {
    icon: EyeOff,
    title: "Blind spot identified",
    copy: "No proposed new date — leaves the decision entirely on them.",
  },
  {
    icon: Wand2,
    title: "Suggestion applied",
    copy: "Adds the cause, a specific new date, and what stays on track.",
  },
  {
    icon: Send,
    title: "Ready to send",
    copy: "Clear, specific, and easy to say yes to.",
  },
];

export default function InteractiveWorkflow() {
  const [active, setActive] = useState(0);

  return (
    <section id="workflow" className="bg-mist/40 py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-14 max-w-[56ch]"
        >
          <p className="eyebrow mb-5">Interactive workflow</p>
          <h2 className="section-heading">One draft, five quiet corrections.</h2>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col gap-2">
            {STEPS.map((step, i) => (
              <button
                key={step.title}
                onClick={() => setActive(i)}
                className={`focus-ring flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  active === i
                    ? "border-accent/30 bg-white shadow-card"
                    : "border-transparent hover:bg-white/60"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
                    active === i ? "bg-ink text-white" : "bg-white text-ink-faint border border-line"
                  }`}
                >
                  {i + 1}
                </div>
                <div>
                  <p className={`text-[15px] font-medium ${active === i ? "text-ink" : "text-ink-soft"}`}>
                    {step.title}
                  </p>
                  {active === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 text-[13.5px] leading-relaxed text-ink-faint"
                    >
                      {step.copy}
                    </motion.p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="relative rounded-[1.5rem] border border-line bg-white p-8 shadow-lift">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full min-h-[280px] flex-col justify-between"
              >
                <div>
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    {(() => {
                      const Icon = STEPS[active].icon;
                      return <Icon size={22} strokeWidth={1.75} />;
                    })()}
                  </div>
                  <h3 className="font-display text-[24px] italic text-ink">{STEPS[active].title}</h3>
                  <p className="body-copy mt-4 max-w-[42ch]">{STEPS[active].copy}</p>
                </div>

                <div className="mt-8 flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= active ? "bg-accent" : "bg-line"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
