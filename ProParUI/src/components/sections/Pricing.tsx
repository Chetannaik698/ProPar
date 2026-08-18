import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Everything you need to try ProPaar during the public beta.",
    features: ["Unlimited reviews", "All supported platforms", "Local-only processing"],
    current: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    description: "For professionals who write at volume.",
    features: ["Everything in Free", "Team style guide", "Priority support"],
    current: false,
  },
  {
    name: "Team",
    price: "Coming soon",
    description: "Shared context and review standards across your org.",
    features: ["Everything in Pro", "Centralized admin", "SSO"],
    current: false,
  },
];

export function Pricing() {
  return (
    <section className="border-t border-border py-24 md:py-32" id="pricing">
      <Container>
        <Reveal className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">
            Pricing
          </p>
          <h2 className="mt-4 text-display-lg font-medium text-balance">
            Free during the public beta.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col rounded-xl2 border p-7 ${
                  plan.current ? "border-accent-dim bg-accent/5" : "border-border-soft bg-surface"
                }`}
              >
                <h3 className="text-base font-medium text-ink">{plan.name}</h3>
                <p className="mt-3 text-2xl font-medium text-ink">{plan.price}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-muted">
                      · {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? "primary" : "secondary"}
                  href="#final-cta"
                  className="mt-8 w-full"
                >
                  {plan.current ? "Get started" : "Notify me"}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
