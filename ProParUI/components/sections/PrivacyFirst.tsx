"use client";

import { motion } from "framer-motion";
import { Lock, EyeOff, Trash2 } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/animations/variants";

const POINTS = [
  { icon: Lock, title: "Analyzed, not stored", copy: "Your drafts are reviewed in the moment and discarded immediately after." },
  { icon: EyeOff, title: "Never used for training", copy: "Nothing you write becomes part of any model, ProPar's or anyone else's." },
  { icon: Trash2, title: "You control the data", copy: "Clear your history at any time from the extension settings, in one click." },
];

export default function PrivacyFirst() {
  return (
    <section id="privacy" className="py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mx-auto max-w-[52ch] text-center"
        >
          <p className="eyebrow mb-5">Privacy first</p>
          <h2 className="section-heading">Your writing stays yours.</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.1)}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {POINTS.map((p) => (
            <motion.div key={p.title} variants={fadeUp} className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <p.icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="text-[15.5px] font-medium text-ink">{p.title}</h3>
              <p className="body-copy mx-auto mt-2 max-w-[30ch] text-[14px]">{p.copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
