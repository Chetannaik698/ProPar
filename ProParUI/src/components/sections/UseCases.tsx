import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { useCases } from "@/lib/data";

export function UseCases() {
  return (
    <section className="border-t border-border py-24 md:py-32" id="use-cases">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            Use cases
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            Wherever clarity matters, ProPaar helps.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl2 border border-border-soft bg-border sm:grid-cols-2">
          {useCases.map((useCase, i) => (
            <Reveal key={useCase.title} delay={i * 0.06}>
              <div className="h-full bg-surface p-8">
                <span className="font-mono text-xs text-muted-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-medium text-ink">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{useCase.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
