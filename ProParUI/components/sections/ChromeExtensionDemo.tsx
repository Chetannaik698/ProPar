"use client";

import { motion } from "framer-motion";
import { Chrome, Sparkles } from "lucide-react";
import { fadeUp, viewportOnce } from "@/animations/variants";

export default function ChromeExtensionDemo() {
  return (
    <section className="bg-mist/40 py-24 md:py-32">
      <div className="container-content grid items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <p className="eyebrow mb-5">Chrome extension</p>
          <h2 className="section-heading">
            Lives quietly in your toolbar. Speaks up only when it matters.
          </h2>
          <p className="body-copy mt-6 max-w-[46ch]">
            ProPaar sits in the corner of whatever {"you're"} writing in. It stays out of the way until
            {"there's"} something worth flagging — then it says so, in one line, with a fix ready.
          </p>
          <div className="mt-8 flex items-center gap-2 text-[14px] text-ink-faint">
            <Chrome size={16} />
            Available now on the Chrome Web Store
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="relative"
        >
          <div className="rounded-2xl border border-line bg-white p-2 shadow-lift">
            <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink-faint/30" />
                <span className="h-2 w-2 rounded-full bg-ink-faint/30" />
                <span className="h-2 w-2 rounded-full bg-ink-faint/30" />
              </div>
              <div className="ml-2 flex-1 rounded-md bg-white px-3 py-1.5 text-[12px] text-ink-faint">
                linkedin.com/feed
              </div>
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                <Sparkles size={13} />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-line p-5">
              <div className="mb-3 h-2.5 w-2/3 rounded-full bg-mist" />
              <div className="mb-2 h-2.5 w-full rounded-full bg-mist" />
              <div className="mb-5 h-2.5 w-5/6 rounded-full bg-mist" />

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent-soft/70 p-3.5"
              >
                <Sparkles size={15} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[13px] leading-snug text-ink">
                  This reads confident, but doesn&rsquo;t say what team or company. Add both before posting.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
