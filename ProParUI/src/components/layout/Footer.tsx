import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { nav } from "@/lib/data";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Use cases", href: "#use-cases" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Contact", href: "mailto:hello@propar.app" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-canvas">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            ProPar helps you think before you send — reviewing prompts, emails, and
            professional writing for clarity, before they leave your hands.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-2">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-2 md:flex-row">
        <p>© {new Date().getFullYear()} ProPar. All rights reserved.</p>
        <nav className="flex gap-6" aria-label="Footer">
          {nav.slice(0, 3).map((item) => (
            <a key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
