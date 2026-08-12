import Image from "next/image";

const COLUMNS = [
  {
    title: "Product",
    links: ["How it thinks", "Workflow", "Platforms", "Chrome extension"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help center", "Privacy policy", "Terms of service"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line py-16">
      <div className="container-content">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="ProPar Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-display text-[18px] tracking-tight text-ink">ProPar</span>
            </a>
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
                    <li key={link}>
                      <a
                        href="#"
                        className="focus-ring rounded text-[14px] text-ink-soft transition-colors hover:text-ink"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-[13px] text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} ProPar. All rights reserved.</p>
          <p>Made for people who&rsquo;d rather think twice than send twice.</p>
        </div>
      </div>
    </footer>
  );
}
