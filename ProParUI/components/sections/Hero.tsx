"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chrome, PlayCircle, CircleCheck, Search, Eye, Sparkles } from "lucide-react";
import { fadeUp, fadeIn, viewportOnce } from "@/animations/variants";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useAuth } from "@/components/AuthContext";

const RAW_PROMPT = "write an email to my manager asking for a raise";

const FINDINGS = [
  { icon: Search, label: "Goal detected", detail: "Request a salary increase" },
  { icon: Eye, label: "Missing context", detail: "Tenure, last review, scope of work" },
  { icon: Sparkles, label: "Blind spot", detail: "No measurable impact mentioned" },
];

const FINAL_DRAFT =
  "Subject: Compensation review after two years on the growth team\n\nHi Priya — since my last review, I've led the onboarding redesign (+18% activation) and taken on two direct reports...";

type Stage = "typing" | "analyzing" | "revealing" | "final" | "hold";

export default function Hero() {
  const prefersReduced = useReducedMotionSafe();
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>("typing");
  const [typed, setTyped] = useState("");
  const [visibleFindings, setVisibleFindings] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdded(localStorage.getItem("propar_added_to_chrome") === "true");
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdded(localStorage.getItem("propar_added_to_chrome") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("propar_chrome_added", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("propar_chrome_added", handleStorageChange);
    };
  }, []);

  const handleAddClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault();
      localStorage.setItem("propar_added_to_chrome", "true");
      setIsAdded(true);
      window.dispatchEvent(new Event("propar_chrome_added"));
    }
  };

  useEffect(() => {
    if (prefersReduced) {
      setTyped(RAW_PROMPT);
      setStage("final");
      setVisibleFindings(FINDINGS.length);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    async function run() {
      while (!cancelled) {
        // typing
        setStage("typing");
        setTyped("");
        setVisibleFindings(0);
        for (let i = 0; i <= RAW_PROMPT.length; i++) {
          if (cancelled) return;
          await wait(22);
          setTyped(RAW_PROMPT.slice(0, i));
        }

        await wait(500);
        if (cancelled) return;
        setStage("analyzing");

        for (let i = 0; i < FINDINGS.length; i++) {
          await wait(650);
          if (cancelled) return;
          setVisibleFindings(i + 1);
        }

        await wait(700);
        if (cancelled) return;
        setStage("revealing");

        await wait(500);
        if (cancelled) return;
        setStage("final");

        await wait(4200);
        if (cancelled) return;
      }
    }

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [prefersReduced]);

  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44">
      <div
        aria-hidden
        className="grain-veil pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="container-content relative grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p variants={fadeUp} className="eyebrow mb-6">
            Now in Chrome — works everywhere you write
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02] tracking-[-0.02em] text-ink"
          >
            Think before
            <br />
            <span className="italic text-ink-soft">you send.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="body-copy mt-7 max-w-[46ch] text-[18px]">
            ProPaar reviews your prompts, emails, LinkedIn posts, and professional writing before
            you hit send — helping you communicate with greater clarity, confidence, and impact.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative inline-block w-full sm:w-auto">
              {user && !isAdded && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { duration: 0.3 },
                    y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                  }}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 pointer-events-none"
                >
                  <span className="bg-ink text-white text-[11px] font-semibold py-1 px-2.5 rounded-full shadow-md whitespace-nowrap tracking-wide border border-white/10 uppercase">
                    Click here!
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink drop-shadow-sm"
                  >
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </motion.div>
              )}
              {user && isAdded ? (
                <div
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3.5 text-[15px] font-semibold text-white shadow-soft transition-all duration-300"
                >
                  <CircleCheck size={18} className="stroke-[2.5]" />
                  ProPaar is added
                </div>
              ) : (
                <a
                  href="/auth/login"
                  onClick={handleAddClick}
                  className="focus-ring group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-white shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Chrome size={17} className="opacity-90" />
                  Add to Chrome
                </a>
              )}
            </div>
            <a
              href="#workflow"
              className="focus-ring inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-mist"
            >
              <PlayCircle size={17} />
              Watch demo
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-[13px] text-ink-faint">
            Free to install · No account required to try · Works in Gmail, LinkedIn, ChatGPT, Claude, Gemini
          </motion.p>
        </motion.div>

        {/* Signature product demo */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative"
        >
          <div className="absolute -inset-x-6 -inset-y-10 -z-10 rounded-[2.5rem] bg-gradient-to-b from-accent-soft/70 to-transparent blur-2xl" />

          <div className="rounded-2xl border border-line bg-white shadow-lift overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E5484D]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F5A623]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#30A46C]/70" />
              <span className="ml-3 rounded-full bg-mist px-3 py-1 text-[12px] text-ink-faint truncate max-w-[180px] sm:max-w-none">
                mail.google.com
              </span>
            </div>

            <div className="min-h-[320px] p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {stage !== "final" ? (
                  <motion.div
                    key="compose"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="font-mono text-[15px] leading-relaxed text-ink">
                      {typed}
                      <span className="animate-blink text-accent">|</span>
                    </p>

                    <div className="min-h-[140px] space-y-2 pt-2">
                      {stage !== "typing" &&
                        FINDINGS.slice(0, visibleFindings).map((f, i) => (
                          <motion.div
                            key={f.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-start gap-2.5 rounded-xl border border-line bg-mist/60 px-3 py-2.5"
                          >
                            <f.icon size={15} className="mt-0.5 shrink-0 text-accent" />
                            <span className="text-[13.5px] leading-snug text-ink-soft">
                              <span className="font-medium text-ink">{f.label}:</span> {f.detail}
                            </span>
                          </motion.div>
                        ))}

                      {stage === "revealing" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 pt-1 text-[13px] text-accent"
                        >
                          <CircleCheck size={15} />
                          Rewriting with full context…
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="final"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-[12.5px] font-medium text-accent">
                      <CircleCheck size={15} />
                      Improved before sending
                    </div>
                    <p className="whitespace-pre-line font-mono text-[14px] leading-relaxed text-ink-soft">
                      {FINAL_DRAFT}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
