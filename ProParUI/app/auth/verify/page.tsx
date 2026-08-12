"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, ArrowLeft, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { sendMagicLink } from "@/lib/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devModeConsoleOnly, setDevModeConsoleOnly] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("propar_verify_email");
    if (stored) setEmail(stored);

    const consoleOnly = sessionStorage.getItem("propar_dev_mode_console_only");
    if (consoleOnly === "true") setDevModeConsoleOnly(true);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    setResent(false);

    try {
      await sendMagicLink(email);
      setResent(true);
      setCountdown(60);
      setTimeout(() => setResent(false), 3000);
    } catch {
      // Silently fail — the user can try again
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFBFC] px-5 py-12">
      {/* Background elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#2F5DE0]/8 to-[#2F5DE0]/2 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#2F5DE0]/6 to-transparent blur-3xl" />
        <div className="grain-veil absolute inset-0 opacity-30" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-10 flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="ProPar Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain"
            />
            <span className="font-display text-xl tracking-tight text-[#0B0D12]">
              ProPar
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-[#E7E9EC] bg-white px-8 py-10 shadow-[0_1px_2px_rgba(11,13,18,0.04),0_12px_40px_-8px_rgba(11,13,18,0.10)]"
        >
          {/* Animated mail icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF1FE]"
          >
            <Mail className="h-7 w-7 text-[#2F5DE0]" />
          </motion.div>

          <h1 className="mb-2 text-center font-display text-[26px] leading-tight tracking-[-0.01em] text-[#0B0D12]">
            <span className="italic">Check your email</span>
          </h1>

          <p className="mb-2 text-center text-[14.5px] leading-relaxed text-[#3B3F46]">
            We sent a sign-in link to
          </p>

          {email && (
            <p className="mb-6 text-center text-[14.5px] font-medium text-[#0B0D12]">
              {email}
            </p>
          )}

          <p className="mb-6 text-center text-[13.5px] leading-relaxed text-[#8A8F98]">
            Click the link in your email to sign in. The link expires in 15 minutes.
            Check your spam folder if you don&apos;t see it.
          </p>

          {devModeConsoleOnly && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-left">
              <p className="text-[13.5px] font-medium text-amber-900 mb-1">
                Development Notice
              </p>
              <p className="text-[12.5px] leading-relaxed text-amber-700">
                SMTP is not configured in your backend `.env` file. The login link has been printed directly to your backend server terminal console. Copy and paste it to authenticate.
              </p>
            </div>
          )}

          {/* Resend Button */}
          <button
            id="auth-resend-btn"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E7E9EC] bg-white px-4 py-3 text-[14px] font-medium text-[#0B0D12] transition-all hover:border-[#D1D5DB] hover:bg-[#F6F7F8] active:scale-[0.99] disabled:opacity-50"
          >
            {isResending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Sending…
              </>
            ) : resent ? (
              <>
                <CheckCircle2 size={15} className="text-green-500" />
                Sent!
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend magic link"}
              </>
            )}
          </button>
        </motion.div>

        {/* Back link */}
        <motion.div variants={itemVariants} className="mt-6 flex justify-center">
          <a
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8F98] transition-colors hover:text-[#3B3F46]"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
