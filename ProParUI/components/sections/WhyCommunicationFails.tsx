"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/animations/variants";

const PROBLEMS = [
  {
    stat: "Missing context",
    copy: "You know the background. Your reader doesn't. Most drafts assume shared context that was never actually shared.",
  },
  {
    stat: "Unclear goals",
    copy: "A message without a clear ask reads as noise. Readers can tell when even the writer isn't sure what they want.",
  },
  {
    stat: "Hidden assumptions",
    copy: "The details that feel obvious to you are usually the ones your reader needs spelled out.",
  },
];

export default function WhyCommunicationFails() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="max-w-[52ch]"
        >
          <p className="eyebrow mb-5">Why communication fails</p>
          <h2 className="section-heading">
            Most writing tools fix your grammar. <span className="italic text-ink-soft">Almost none look at your thinking.</span>
          </h2>
          <p className="body-copy mt-6">
            Spell-check catches typos. Grammar tools catch tense. But the message still lands wrong
            — because the problem was never the sentence. It was what got left out before you wrote it.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.12)}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {PROBLEMS.map((p) => (
            <motion.div
              key={p.stat}
              variants={fadeUp}
              className="rounded-2xl border border-line bg-white p-7"
            >
              <p className="font-display text-[22px] italic text-ink">{p.stat}</p>
              <p className="body-copy mt-3 text-[15px]">{p.copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
