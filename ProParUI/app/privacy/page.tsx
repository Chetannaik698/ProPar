import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Lock,
  Database,
  Server,
  UserX,
  ShieldAlert,
  Users,
  RefreshCw,
  Mail,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — ProPaar",
  description:
    "Official Privacy Policy for the ProPaar Chrome extension and website. Learn how ProPaar handles your prompts and data with transparency.",
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

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-white pt-28 pb-24">
        {/* Header Hero Banner */}
        <section className="border-b border-line bg-mist/50 py-12 md:py-16">
          <div className="container-content">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-faint transition-colors hover:text-ink focus-ring rounded-lg px-2 py-1 mb-6 -ml-2"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-white border border-line px-3 py-1 text-[12px] font-semibold text-accent">
                  <ShieldCheck size={14} className="text-accent" />
                  Official Policy
                </span>
                <span className="text-[13px] text-ink-faint">
                  Chrome Web Store Verified
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink">
                ProPaar Privacy Policy
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[14px] text-ink-soft">
                <p className="font-medium text-ink">
                  <strong>Last updated:</strong> August 22, 2026
                </p>
                <span className="hidden sm:inline text-line">•</span>
                <p className="text-ink-faint">
                  Canonical URL:{" "}
                  <code className="rounded bg-white border border-line px-2 py-0.5 text-[13px] font-mono text-ink-soft">
                    https://propaar.netlify.app/privacy
                  </code>
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm text-[15px] sm:text-[16px] leading-relaxed text-ink-soft space-y-3">
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

        {/* Content Body */}
        <section className="py-12 md:py-16">
          <div className="container-content">
            <div className="max-w-3xl space-y-12">
              {/* Section 1 */}
              <div id="section-1" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    1
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    1. Information ProPaar Processes
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
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
              </div>

              {/* Section 2 */}
              <div id="section-2" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    2
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    2. How We Use Information
                  </h2>
                </div>
                <div className="space-y-4 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>Information processed by ProPaar is used to:</p>
                  <ul className="space-y-2.5">
                    {[
                      "Analyze the user's prompt.",
                      "Identify missing context, unclear instructions, assumptions, or other areas that may affect the quality of an AI response.",
                      "Generate suggestions for improving the prompt.",
                      "Generate an improved version of the user's prompt.",
                      "Provide and maintain the ProPaar service.",
                      "Detect and resolve technical problems when necessary.",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pt-2 font-medium text-ink">
                    We do not use users&apos; prompt content for unrelated purposes.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div id="section-3" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    3
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    3. Prompt and User Content
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    ProPaar processes prompt content only when the user requests analysis or improvement.
                  </p>
                  <div className="rounded-2xl border border-line bg-mist/30 p-4 space-y-2.5">
                    <p className="flex items-center gap-2 font-medium text-ink">
                      <UserX size={17} className="text-ink-soft shrink-0" />
                      We do not sell users&apos; prompt content.
                    </p>
                    <p className="flex items-center gap-2 font-medium text-ink">
                      <Lock size={17} className="text-ink-soft shrink-0" />
                      We do not use users&apos; prompt content for advertising.
                    </p>
                    <p className="flex items-center gap-2 font-medium text-ink">
                      <ShieldAlert size={17} className="text-ink-soft shrink-0" />
                      We do not use users&apos; prompt content for creditworthiness, lending, or similar financial decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div id="section-4" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    4
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    4. Data Storage and Retention
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    ProPaar does not intentionally retain users&apos; prompt content longer than necessary to provide the requested functionality.
                  </p>
                  <p>
                    If prompt content is temporarily transmitted to a processing service to generate an analysis or improved prompt, it is handled only for that requested operation and is not intentionally stored as a permanent user profile.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div id="section-5" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    5
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    5. Third-Party Services
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    ProPaar may use third-party infrastructure or AI processing services to provide its functionality.
                  </p>
                  <p>
                    When information is transmitted to a third-party service, it is used only as necessary to provide the requested ProPaar functionality and is subject to the applicable service&apos;s privacy and security practices.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div id="section-6" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    6
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    6. Information We Do Not Sell
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    We do not sell or rent users&apos; personal information or prompt content to third parties.
                  </p>
                  <p>
                    We do not use prompt content for targeted advertising.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div id="section-7" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    7
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    7. Security
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    We take reasonable measures to protect information processed through ProPaar. However, no method of transmission or electronic storage can be guaranteed to be completely secure.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div id="section-8" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    8
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    8. Children&apos;s Privacy
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    ProPaar is not specifically directed toward children under the age of 13. We do not knowingly collect personal information from children under 13.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div id="section-9" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    9
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    9. Changes to This Privacy Policy
                  </h2>
                </div>
                <div className="space-y-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    We may update this Privacy Policy when our service or data practices change. When we make changes, we will update the &quot;Last updated&quot; date on this page.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div id="section-10" className="scroll-mt-32 space-y-4">
                <div className="flex items-center gap-3 border-b border-line pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent font-semibold text-[15px]">
                    10
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    10. Contact
                  </h2>
                </div>
                <div className="space-y-4 text-[15px] sm:text-[16px] leading-relaxed text-ink-soft pl-0 sm:pl-12">
                  <p>
                    If you have questions about this Privacy Policy or ProPaar&apos;s privacy practices, contact us at:
                  </p>
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-line bg-mist/40 px-5 py-4">
                    <Mail className="h-5 w-5 text-accent shrink-0" />
                    <div>
                      <span className="text-[12px] uppercase font-semibold text-ink-faint tracking-wider block">
                        Support & Privacy Email
                      </span>
                      <a
                        href="mailto:hello@propaar.app"
                        className="text-[16px] font-semibold text-ink hover:text-accent transition-colors"
                      >
                        hello@propaar.app
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
