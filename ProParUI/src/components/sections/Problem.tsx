import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { problems } from "@/lib/data";

export function Problem() {
  return (
    <section className="py-24 md:py-32" id="problem">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            The problem
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            Most writing tools help you after you&apos;ve already made the mistake.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {problems.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-xl2 border border-border-soft bg-surface p-7">
                <h3 className="text-base font-medium text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
