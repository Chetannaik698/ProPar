"use client";

import { motion } from "framer-motion";
import { fadeIn, viewportOnce } from "@/animations/variants";

const LOGOS = ["Anthea", "Northwind", "Fieldstone", "Marrow Labs", "Verity", "Cobalt & Co."];

export default function TrustedBy() {
  return (
    <section className="border-y border-line/80 bg-mist/40 py-10">
      <div className="container-content">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeIn}
          className="mb-7 text-center text-[12.5px] font-medium uppercase tracking-[0.14em] text-ink-faint"
        >
          Trusted by people who write for a living — and people who wish they didn&rsquo;t have to
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4"
        >
          {LOGOS.map((name) => (
            <motion.span
              key={name}
              variants={fadeIn}
              className="font-display text-[19px] italic text-ink-faint/80"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
