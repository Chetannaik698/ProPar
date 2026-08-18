"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/animations/variants";
import type { Testimonial } from "@/types";

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "It caught that my launch email never said what happened if people didn't act by Friday. Small fix, completely changed the reply rate.",
    name: "Dana Okafor",
    role: "Head of Growth, Fieldstone",
  },
  {
    quote: "I use it before every prompt now. Half the time it just points out I hadn't decided what I actually wanted yet.",
    name: "Marcus Wei",
    role: "Product Manager, Northwind",
  },
  {
    quote: "The LinkedIn check alone is worth it. It stops me from posting things that sound good to me and confusing to everyone else.",
    name: "Priya Raman",
    role: "Design Lead, Cobalt & Co.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-mist/40 py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-14 max-w-[52ch]"
        >
          <p className="eyebrow mb-5">From people who send a lot of messages</p>
          <h2 className="section-heading">What changes after a week with ProPaar.</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.1)}
          className="grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              className="flex h-full flex-col justify-between rounded-2xl border border-line bg-white p-7 shadow-soft"
            >
              <blockquote className="font-display text-[17px] italic leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 text-[13.5px] text-ink-faint">
                <span className="font-medium text-ink-soft">{t.name}</span> · {t.role}
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
