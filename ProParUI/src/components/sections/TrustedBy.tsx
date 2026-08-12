import { Container } from "@/components/ui/Container";
import { trustedBy } from "@/lib/data";

export function TrustedBy() {
  const loop = [...trustedBy, ...trustedBy];

  return (
    <section className="border-y border-border py-10" aria-label="Trusted by teams at">
      <Container>
        <p className="mb-6 text-center text-xs uppercase tracking-wider text-muted-2">
          Trusted by professionals at
        </p>
      </Container>
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-marquee gap-16 motion-reduce:animate-none">
          {loop.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap text-lg font-medium text-muted-2/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
