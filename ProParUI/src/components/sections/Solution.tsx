import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";

export function Solution() {
  return (
    <section className="border-t border-border py-24 md:py-32" id="solution">
      <Container className="grid items-center gap-14 md:grid-cols-2">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            The approach
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            ProPaar reviews your thinking, not just your grammar.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
            Before your message leaves your hands, ProPaar checks it against what you&apos;re
            actually trying to achieve — surfacing the context, assumptions, and gaps a
            careful editor would catch, then helping you close them.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-3">
            {[
              { label: "Missing Context", tone: "text-accent-soft" },
              { label: "Hidden Assumption", tone: "text-amber-300" },
              { label: "Unclear Goal", tone: "text-rose-300" },
            ].map((tag) => (
              <div
                key={tag.label}
                className="flex items-center justify-between rounded-lg border border-border-soft bg-surface px-5 py-4"
              >
                <span className={`text-sm font-medium ${tag.tone}`}>{tag.label}</span>
                <span className="text-xs text-muted-2">Detected before send</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
