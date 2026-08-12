"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";
import { PromptShowcase } from "@/components/sections/PromptShowcase";
import { Chrome, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 md:pt-48 md:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-grid-fade"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
      />

      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Now in public beta
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-7 max-w-3xl text-display-xl font-medium text-balance text-ink">
            Think before you send.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted md:text-lg">
            ProPar reviews your prompts, emails, LinkedIn posts, and professional writing
            before you hit send — helping you communicate with greater clarity, confidence,
            and impact.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button variant="primary" href="#final-cta" icon={<Chrome className="h-4 w-4" aria-hidden />}>
              Add to Chrome — it&apos;s free
            </Button>
            <Button variant="secondary" href="#workflow" icon={<PlayCircle className="h-4 w-4" aria-hidden />}>
              Watch demo
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.22} className="mt-8 text-xs text-muted-2">
          <p>No account required to try it · Runs locally · Nothing you write is stored</p>
        </Reveal>
      </Container>

      <Reveal delay={0.3} className="mt-16">
        <Container>
          <PromptShowcase />
        </Container>
      </Reveal>
    </section>
  );
}
