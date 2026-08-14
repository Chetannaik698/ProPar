"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, viewportOnce } from "@/animations/variants";

const INCLUDED = [
  "Unlimited reviews across all supported platforms",
  "Goal, context, and blind-spot detection",
  "One-click rewrite in place",
];

export default function Pricing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container-content">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mx-auto max-w-lg rounded-[1.75rem] border border-line bg-white p-5 sm:p-8 md:p-10 text-center shadow-card"
        >
          <p className="eyebrow mb-4">Pricing</p>
          <h2 className="font-display text-[28px] italic text-ink">Team plans, coming soon.</h2>
          <p className="body-copy mx-auto mt-4 max-w-[36ch]">
            Individual use is free today. We&rsquo;re building shared style guides and team review
            for organizations next.
          </p>

          <ul className="mx-auto mt-7 flex max-w-[34ch] flex-col gap-2.5 text-left">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink-soft">
                <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>

          {submitted ? (
            <p className="mt-8 rounded-full bg-accent-soft px-5 py-3 text-[14px] font-medium text-accent-deep">
              You&rsquo;re on the list — we&rsquo;ll reach out when it&rsquo;s ready.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-2.5 sm:flex-row">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="focus-ring w-full rounded-full border border-line px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint"
              />
              <button
                type="submit"
                className="focus-ring w-full sm:w-auto shrink-0 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Join waitlist
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
