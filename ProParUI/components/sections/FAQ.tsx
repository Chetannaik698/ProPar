"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { fadeUp, viewportOnce } from "@/animations/variants";
import type { FaqItem } from "@/types";

const FAQS: FaqItem[] = [
  {
    question: "How is this different from grammar or spell-check tools?",
    answer: "Grammar tools look at the sentence you wrote. ProPaar looks at the thinking behind it — what you're trying to achieve, what your reader needs to know, and what you might have assumed without saying.",
  },
  {
    question: "Which platforms does ProPaar work in?",
    answer: "ProPaar runs as a Chrome extension across ChatGPT, Claude, Gemini, Gmail, Outlook, and LinkedIn, with more platforms on the way.",
  },
  {
    question: "Does ProPaar store what I write?",
    answer: "No. Drafts are analyzed in the moment to generate suggestions and are not stored or used to train any model.",
  },
  {
    question: "Will it rewrite my voice into something generic?",
    answer: "No — ProPaar keeps your tone and adjusts specifics: missing context, unclear goals, and assumptions. It suggests, you decide what to keep.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes. ProPaar is free to install and use for individual writing. Team plans are coming soon.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32">
      <div className="container-content mx-auto max-w-2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-12 text-center"
        >
          <p className="eyebrow mb-5">Questions</p>
          <h2 className="section-heading">Good to know before you install.</h2>
        </motion.div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="focus-ring flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-medium text-ink">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-ink-faint"
                  >
                    <Plus size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="body-copy px-6 pb-5 text-[14.5px]">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
