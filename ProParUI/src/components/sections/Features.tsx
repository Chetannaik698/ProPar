"use client";

import {
  Target,
  SearchCheck,
  Eye,
  BrainCircuit,
  MessagesSquare,
  ClipboardCheck,
  Sparkles,
  Replace,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { features } from "@/lib/data";

const icons: ComponentType<SVGProps<SVGSVGElement>>[] = [
  Target,
  SearchCheck,
  Eye,
  BrainCircuit,
  MessagesSquare,
  ClipboardCheck,
  Sparkles,
  Replace,
  Layers,
  ShieldCheck,
];

export function Features() {
  return (
    <section className="border-t border-border py-24 md:py-32" id="features">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            Features
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            Everything ProPar checks before you send.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = icons[i % icons.length]!;
            return (
              <Reveal key={feature.title} delay={(i % 3) * 0.06}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="group h-full rounded-xl2 border border-border-soft bg-surface p-6 transition-colors hover:border-accent-dim"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-soft bg-surface-2 text-accent-soft transition-colors group-hover:border-accent-dim group-hover:bg-accent/10">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-[15px] font-medium text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
