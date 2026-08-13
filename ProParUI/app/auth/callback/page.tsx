"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyMagicToken, verifyEmailToken, setToken } from "@/lib/auth";
import { useAuth } from "@/components/AuthContext";
import Logo from "@/components/Logo";

type CallbackStatus = "loading" | "success" | "error";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token) {
      setStatus("error");
      setErrorMsg("No authentication token found in the URL.");
      return;
    }

    const verifyAndLogin = async () => {
      try {
        if (type === "email") {
          // Magic link flow
          const response = await verifyMagicToken(token);
          if (response.token) setToken(response.token);
          login(response.user);
          setStatus("success");

          // Redirect to home after a brief success message
          setTimeout(() => {
            router.replace("/");
          }, 1500);
        } else if (type === "verify") {
          // Email Verification flow
          const response = await verifyEmailToken(token);
          if (response.token) setToken(response.token);
          login(response.user);
          setStatus("success");

          // Redirect to home after a brief success message
          setTimeout(() => {
            router.replace("/");
          }, 1500);
        } else {
          // Unknown type
          setStatus("error");
          setErrorMsg("Unknown authentication type.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please try signing in again."
        );
      }
    };

    verifyAndLogin();
  }, [searchParams, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFBFC] px-5 py-12">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#2F5DE0]/8 to-[#2F5DE0]/2 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#2F5DE0]/6 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Logo size={24} wordmarkClassName="font-display text-xl tracking-tight text-[#0B0D12]" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E7E9EC] bg-white px-8 py-10 shadow-[0_1px_2px_rgba(11,13,18,0.04),0_12px_40px_-8px_rgba(11,13,18,0.10)]">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#2F5DE0]" />
              <h1 className="font-display text-[22px] italic text-[#0B0D12]">
                Signing you in…
              </h1>
              <p className="text-[14px] text-[#8A8F98]">
                Please wait while we verify your identity.
              </p>
            </div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="font-display text-[22px] italic text-[#0B0D12]">
                You&apos;re in!
              </h1>
              <p className="text-[14px] text-[#8A8F98]">
                Redirecting you to ProPar…
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <h1 className="font-display text-[22px] italic text-[#0B0D12]">
                Something went wrong
              </h1>
              <p className="text-center text-[14px] leading-relaxed text-[#8A8F98]">
                {errorMsg}
              </p>
              <a
                href="/auth/login"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#0B0D12] px-6 py-3 text-[14px] font-medium text-white transition-all hover:bg-[#1a1d24] active:scale-[0.99]"
              >
                Try again
              </a>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Auth callback page — handles magic link verification and OAuth redirects.
 * Wrapped in Suspense because useSearchParams requires it in Next.js 15+.
 */
export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F5DE0]" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
