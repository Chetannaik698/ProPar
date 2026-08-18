"use client";

import { motion } from "framer-motion";
import {
  Target,
  SearchCode,
  EyeOff,
  Brain,
  MessagesSquare,
  Wand2,
  RefreshCcw,
  FileCheck2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/animations/variants";

const FEATURES = [
  {
    icon: Target,
    title: "Goal discovery",
    description: "ProPaar identifies what you're actually trying to achieve, even when your draft doesn't say it directly.",
  },
  {
    icon: SearchCode,
    title: "Missing context detection",
    description: "Flags the background a reader would need but your draft never mentions.",
  },
  {
    icon: EyeOff,
    title: "Blind spot detection",
    description: "Surfaces the assumptions and gaps you're too close to the writing to notice.",
  },
  {
    icon: Brain,
    title: "Expert thinking",
    description: "Reasons the way a sharp editor or trusted colleague would, before you press send.",
  },
  {
    icon: MessagesSquare,
    title: "Adaptive clarification",
    description: "Asks a short, precise question only when it changes the outcome — never busywork.",
  },
  {
    icon: Wand2,
    title: "Prompt enhancement",
    description: "Turns a rough instruction into one a model or a person can act on with confidence.",
  },
  {
    icon: RefreshCcw,
    title: "Replace in place",
    description: "Swaps your draft for the improved version without leaving the window you're writing in.",
  },
  {
    icon: FileCheck2,
    title: "Communication review",
    description: "Reads for clarity and tone the way your reader will, not the way you intended it.",
  },
  {
    icon: Layers,
    title: "Cross-platform intelligence",
    description: "The same review, tuned to the norms of email, LinkedIn, and every major AI assistant.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy first",
    description: "Your drafts are analyzed in the moment and never stored or used for training.",
  },
];

export default function HowProPaarThinks() {
  return (
    <section id="how-propar-thinks" className="py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-14 max-w-[56ch]"
        >
          <p className="eyebrow mb-5">How ProPaar thinks</p>
          <h2 className="section-heading">
            Ten quiet checks, run in the second before you hit send.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.06)}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-2xl border border-line bg-white p-6 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-110">
                <f.icon size={19} strokeWidth={1.75} />
              </div>
              <h3 className="text-[15.5px] font-medium text-ink">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
