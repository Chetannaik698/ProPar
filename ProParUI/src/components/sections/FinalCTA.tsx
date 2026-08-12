import { Chrome } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animations/Reveal";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border py-24 md:py-32" id="final-cta">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[140px]"
      />
      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <h2 className="max-w-2xl text-display-lg font-medium text-balance">
            Start thinking before you send.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
            Free during the public beta. Add ProPar to Chrome and try it on your next message.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9">
            <Button variant="primary" href="#" icon={<Chrome className="h-4 w-4" aria-hidden />}>
              Add to Chrome — it&apos;s free
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
