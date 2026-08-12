import { Chrome, MousePointerClick, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/Button";

const steps = [
  { icon: Chrome, label: "Add ProPar from the Chrome Web Store" },
  { icon: MousePointerClick, label: "Pin it, and it appears where you write" },
  { icon: CheckCircle2, label: "Write normally — review happens automatically" },
];

export function ExtensionDemo() {
  return (
    <section className="border-t border-border py-24 md:py-32" id="extension">
      <Container className="grid items-center gap-14 md:grid-cols-2">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            Chrome extension
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            Thirty seconds to install. Nothing to configure.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
            ProPar lives quietly in your browser toolbar and activates on the platforms you
            already write in — no new tab, no separate app to remember to open.
          </p>
          <div className="mt-8">
            <Button variant="primary" href="#final-cta" icon={<Chrome className="h-4 w-4" aria-hidden />}>
              Add to Chrome
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="flex items-center gap-4 rounded-lg border border-border-soft bg-surface px-5 py-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-accent-soft">
                  <step.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm text-ink">{step.label}</p>
                <span className="ml-auto font-mono text-xs text-muted-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
