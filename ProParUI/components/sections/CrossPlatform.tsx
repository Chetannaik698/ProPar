"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/animations/variants";

const PLATFORMS = ["ChatGPT", "Claude", "Gemini", "Gmail", "Outlook", "LinkedIn"];

export default function CrossPlatform() {
  return (
    <section className="py-20 md:py-24">
      <div className="container-content text-center">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="eyebrow mb-4"
        >
          Cross-platform support
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="section-heading mx-auto max-w-[36ch]"
        >
          One extension. Every place you write.
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.07)}
          className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-3"
        >
          {PLATFORMS.map((p) => (
            <motion.span
              key={p}
              variants={fadeUp}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-[14px] font-medium text-ink-soft shadow-soft"
            >
              {p}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
