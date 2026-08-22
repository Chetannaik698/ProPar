import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#how-propaar-thinks" },
      { label: "Workflow", href: "#workflow" },
      { label: "Platforms", href: "#platforms" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Twitter / X", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Contact", href: "mailto:hello@propaar.app" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line py-16">
      <div className="container-content">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo href="#top" size={24} />
            <p className="body-copy mt-4 max-w-[32ch] text-[14px]">
              Think before you send. A quiet check on your writing, before it leaves your hands.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-[13px] font-medium uppercase tracking-wide text-ink-faint">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="focus-ring rounded text-[14px] text-ink-soft transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-[13px] text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} ProPaar. All rights reserved.</p>
          <p>Made for people who&rsquo;d rather think twice than send twice.</p>
        </div>
      </div>
    </footer>
  );
}
