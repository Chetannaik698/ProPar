import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Mail, Shield, CheckCircle2, Lock, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — ProPaar",
  description:
    "Official Privacy Policy for the ProPaar Chrome extension and website. Comprehensive data practices and privacy disclosures.",
  alternates: {
    canonical: "https://propaar.netlify.app/privacy",
  },
  openGraph: {
    title: "Privacy Policy — ProPaar",
    description:
      "Official Privacy Policy for the ProPaar Chrome extension and website.",
    url: "https://propaar.netlify.app/privacy",
    type: "website",
  },
};

const SECTIONS = [
  { id: "information-processes", number: "1", title: "Information ProPaar Processes" },
  { id: "how-we-use-information", number: "2", title: "How We Use Information" },
  { id: "prompt-and-user-content", number: "3", title: "Prompt and User Content" },
  { id: "data-storage-and-retention", number: "4", title: "Data Storage and Retention" },
  { id: "third-party-services", number: "5", title: "Third-Party Services" },
  { id: "information-we-do-not-sell", number: "6", title: "Information We Do Not Sell" },
  { id: "security", number: "7", title: "Security" },
  { id: "childrens-privacy", number: "8", title: "Children's Privacy" },
  { id: "changes-to-privacy-policy", number: "9", title: "Changes to This Privacy Policy" },
  { id: "contact", number: "10", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-white pt-24 pb-24 text-ink">
        {/* Document Header Header Banner */}
        <section className="border-b border-line bg-mist/30 py-10 md:py-14">
          <div className="container-content">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-faint transition-colors hover:text-ink focus-ring rounded-md px-2 py-1 mb-6 -ml-2"
            >
              <ArrowLeft size={15} />
              Back to Home
            </Link>

            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2.5 text-[12px]">
                <span className="inline-flex items-center gap-1 rounded bg-ink/5 border border-line px-2.5 py-0.5 font-mono font-medium text-ink-soft">
                  LEGAL DOCUMENT
                </span>
                <span className="text-ink-faint">•</span>
                <span className="text-ink-faint">Chrome Web Store Official Disclosure</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
                ProPaar Privacy Policy
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[13.5px] text-ink-soft">
                <p>
                  <strong>Last updated:</strong> August 22, 2026
                </p>
                <span className="text-line">•</span>
                <p className="font-mono text-[12.5px] text-ink-faint">
                  Canonical URL: https://propaar.netlify.app/privacy
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-line bg-white p-5 text-[14.5px] leading-relaxed text-ink-soft space-y-3">
                <p>
                  ProPaar (&quot;ProPaar&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an AI-assisted prompt improvement tool designed to help users clarify and improve prompts before sending them to AI services.
                </p>
                <p>
                  This Privacy Policy explains how ProPaar handles information when you use the ProPaar Chrome extension and website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Document Content */}
        <section className="py-10 md:py-14">
          <div className="container-content">
            <div className="grid gap-10 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
              {/* Sidebar Navigation / Table of Contents */}
              <aside className="hidden md:block">
                <div className="sticky top-28 space-y-4 rounded-xl border border-line p-4 bg-mist/20 text-[13px]">
                  <p className="font-semibold uppercase tracking-wider text-[11px] text-ink-faint">
                    Document Sections
                  </p>
                  <nav className="space-y-1.5" aria-label="Privacy policy sections">
                    {SECTIONS.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        className="block rounded px-2 py-1 text-ink-soft transition-colors hover:bg-mist hover:text-ink focus-ring"
                      >
                        <span className="font-mono text-ink-faint mr-1.5">{sec.number}.</span>
                        {sec.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Document Main Content */}
              <div className="max-w-3xl space-y-10">
                {/* Fact Sheet Overview */}
                <div className="rounded-xl border border-line bg-white p-5 space-y-4">
                  <h3 className="text-[14px] font-semibold uppercase tracking-wider text-ink-faint flex items-center gap-2">
                    <FileText size={16} className="text-accent" />
                    Summary of Technical & Data Practices
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-[13.5px]">
                    <div className="rounded-lg border border-line bg-mist/30 p-3">
                      <span className="font-semibold text-ink block mb-1">Prompt Data Processing</span>
                      <p className="text-ink-soft leading-snug">
                        Processed in-memory to generate analysis. Not permanently saved to database logs.
                      </p>
                    </div>
                    <div className="rounded-lg border border-line bg-mist/30 p-3">
                      <span className="font-semibold text-ink block mb-1">AI Model Training</span>
                      <p className="text-ink-soft leading-snug">
                        Prompt content is not used by ProPaar to train foundation models.
                      </p>
                    </div>
                    <div className="rounded-lg border border-line bg-mist/30 p-3">
                      <span className="font-semibold text-ink block mb-1">Session History</span>
                      <p className="text-ink-soft leading-snug">
                        Analysis session history is kept transiently in memory during an active session and resets when closed.
                      </p>
                    </div>
                    <div className="rounded-lg border border-line bg-mist/30 p-3">
                      <span className="font-semibold text-ink block mb-1">Data Commercialization</span>
                      <p className="text-ink-soft leading-snug">
                        We do not sell, rent, or trade prompt text or personal information to third parties.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 1 */}
                <article id="information-processes" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">1.</span>
                    Information ProPaar Processes
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      When you use the ProPaar extension, you may provide text such as prompts, instructions, or other content that you choose to analyze.
                    </p>
                    <p>
                      ProPaar may process this content only to provide the requested prompt analysis and improvement features.
                    </p>
                    <p>
                      The extension may also process limited technical information necessary for the extension to function, such as information required to communicate with ProPaar&apos;s services.
                    </p>
                  </div>
                </article>

                {/* Section 2 */}
                <article id="how-we-use-information" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">2.</span>
                    How We Use Information
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>Information processed by ProPaar is used to:</p>
                    <ul className="space-y-2 pl-2">
                      {[
                        "Analyze the user's prompt.",
                        "Identify missing context, unclear instructions, assumptions, or other areas that may affect the quality of an AI response.",
                        "Generate suggestions for improving the prompt.",
                        "Generate an improved version of the user's prompt.",
                        "Provide and maintain the ProPaar service.",
                        "Detect and resolve technical problems when necessary.",
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="pt-1 font-medium text-ink">
                      We do not use users&apos; prompt content for unrelated purposes.
                    </p>
                  </div>
                </article>

                {/* Section 3 */}
                <article id="prompt-and-user-content" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">3.</span>
                    Prompt and User Content
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      ProPaar processes prompt content only when the user requests analysis or improvement.
                    </p>
                    <p>
                      We do not sell users&apos; prompt content.
                    </p>
                    <p>
                      We do not use users&apos; prompt content for advertising.
                    </p>
                    <p>
                      We do not use users&apos; prompt content for creditworthiness, lending, or similar financial decisions.
                    </p>
                  </div>
                </article>

                {/* Section 4 */}
                <article id="data-storage-and-retention" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">4.</span>
                    Data Storage and Retention
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      ProPaar does not intentionally retain users&apos; prompt content longer than necessary to provide the requested functionality.
                    </p>
                    <p>
                      If prompt content is temporarily transmitted to a processing service to generate an analysis or improved prompt, it is handled only for that requested operation and is not intentionally stored as a permanent user profile.
                    </p>
                  </div>
                </article>

                {/* Section 5 */}
                <article id="third-party-services" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">5.</span>
                    Third-Party Services
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      ProPaar may use third-party infrastructure or AI processing services to provide its functionality.
                    </p>
                    <p>
                      When information is transmitted to a third-party service, it is used only as necessary to provide the requested ProPaar functionality and is subject to the applicable service&apos;s privacy and security practices.
                    </p>
                  </div>
                </article>

                {/* Section 6 */}
                <article id="information-we-do-not-sell" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">6.</span>
                    Information We Do Not Sell
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      We do not sell or rent users&apos; personal information or prompt content to third parties.
                    </p>
                    <p>
                      We do not use prompt content for targeted advertising.
                    </p>
                  </div>
                </article>

                {/* Section 7 */}
                <article id="security" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">7.</span>
                    Security
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      We take reasonable measures to protect information processed through ProPaar. However, no method of transmission or electronic storage can be guaranteed to be completely secure.
                    </p>
                  </div>
                </article>

                {/* Section 8 */}
                <article id="childrens-privacy" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">8.</span>
                    Children&apos;s Privacy
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      ProPaar is not specifically directed toward children under the age of 13. We do not knowingly collect personal information from children under 13.
                    </p>
                  </div>
                </article>

                {/* Section 9 */}
                <article id="changes-to-privacy-policy" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">9.</span>
                    Changes to This Privacy Policy
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      We may update this Privacy Policy when our service or data practices change. When we make changes, we will update the &quot;Last updated&quot; date on this page.
                    </p>
                  </div>
                </article>

                {/* Section 10 */}
                <article id="contact" className="scroll-mt-28 space-y-3 border-t border-line pt-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2.5">
                    <span className="font-mono text-accent font-medium text-base">10.</span>
                    Contact
                  </h2>
                  <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
                    <p>
                      If you have questions about this Privacy Policy or ProPaar&apos;s privacy practices, contact us at:
                    </p>
                    <div className="mt-2 rounded-xl border border-line bg-mist/30 p-4">
                      <p className="font-medium text-ink">
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:hello@propaar.app"
                          className="text-accent underline underline-offset-2 hover:text-accent-deep transition-colors"
                        >
                          hello@propaar.app
                        </a>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
