"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, viewportOnce } from "@/animations/variants";
import type { Platform, PlatformContent } from "@/types";

const TABS: PlatformContent[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    before: "write a plan to grow our newsletter",
    after: "Draft a 90-day newsletter growth plan for a B2B audience of ~4,000 subscribers, current open rate 31%. Prioritize referral loops over paid acquisition, and flag any assumption you're making about budget.",
    findings: ["Goal detected: subscriber growth", "Missing context: audience size, open rate", "Blind spot: budget assumption unstated"],
  },
  {
    id: "claude",
    label: "Claude",
    before: "summarize this contract for me",
    after: "Summarize this vendor contract for a non-lawyer founder. Flag anything unusual in the termination and liability clauses specifically, and note which sections would benefit from legal review.",
    findings: ["Goal detected: risk-focused summary", "Missing context: reader's legal background", "Blind spot: which clauses matter most"],
  },
  {
    id: "gemini",
    label: "Gemini",
    before: "help me plan a product launch",
    after: "Help me plan a two-week launch for a Chrome extension aimed at knowledge workers, with a Product Hunt post as the centerpiece. Include what to prepare in the 48 hours before launch.",
    findings: ["Goal detected: launch sequencing", "Missing context: product type, channel", "Blind spot: pre-launch prep window"],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    before: "Excited to share I'm joining a new company as Head of Design!",
    after: "Excited to share I'm joining Fieldstone as Head of Design, leading a team of 6 across product and brand. Grateful to my old team at Anthea for three formative years — more soon.",
    findings: ["Missing context: company, role scope", "Blind spot: no acknowledgment of past team", "Tone check: reads confident, not boastful"],
  },
  {
    id: "email",
    label: "Email",
    before: "Hey, can we push the deadline?",
    after: "Hi Sam — we hit a vendor delay on the assets. Could we move Friday's deadline to Tuesday? Everything else on the timeline stays on track.",
    findings: ["Missing context: reason for delay", "Blind spot: no proposed new date", "Tone check: direct, not apologetic"],
  },
];

export default function ProductPreview() {
  const [active, setActive] = useState<Platform>("chatgpt");
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <section id="platforms" className="py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-14 max-w-[56ch]"
        >
          <p className="eyebrow mb-5">Product preview</p>
          <h2 className="section-heading">The same review, wherever you write.</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="rounded-[1.5rem] border border-line bg-white shadow-lift"
        >
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-line px-3 py-2.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`focus-ring shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors ${
                  active === tab.id
                    ? "bg-ink text-white"
                    : "text-ink-faint hover:bg-mist hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[320px] p-4 sm:p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-8 md:grid-cols-2"
              >
                <div>
                  <p className="mb-2.5 text-[12px] font-medium uppercase tracking-wide text-ink-faint">
                    Before
                  </p>
                  <div className="rounded-xl border border-line bg-mist/50 p-4 font-mono text-[14px] leading-relaxed text-ink-soft">
                    {activeTab.before}
                  </div>
                  <div className="mt-4 space-y-2">
                    {activeTab.findings.map((f) => (
                      <div key={f} className="text-[12.5px] leading-snug text-ink-faint">
                        · {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2.5 text-[12px] font-medium uppercase tracking-wide text-accent">
                    After ProPar
                  </p>
                  <div className="rounded-xl border border-accent/25 bg-accent-soft/60 p-4 font-mono text-[14px] leading-relaxed text-ink">
                    {activeTab.after}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
