import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="border-t border-border py-24 md:py-32" id="testimonials">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            From the beta
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            What early users are saying.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col justify-between rounded-xl2 border border-border-soft bg-surface p-7">
                <blockquote className="text-[15px] leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block font-medium text-ink">{t.name}</span>
                  <span className="text-muted-2">{t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
