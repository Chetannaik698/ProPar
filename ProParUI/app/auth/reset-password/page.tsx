"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { resetPasswordWithToken } from "@/lib/auth";
import Logo from "@/components/Logo";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing in the URL.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPasswordWithToken(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFBFC] px-5 py-12">
      {/* Background decorative elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#2F5DE0]/8 to-[#2F5DE0]/2 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#2F5DE0]/6 to-transparent blur-3xl" />
        <div className="grain-veil absolute inset-0 opacity-30" />
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
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="font-display text-[22px] italic text-[#0B0D12]">
                Password Reset!
              </h1>
              <p className="text-[14px] leading-relaxed text-[#8A8F98]">
                Your password has been updated successfully. Redirecting you to login…
              </p>
            </motion.div>
          ) : (
            <>
              {/* Heading */}
              <h1 className="mb-1 text-center font-display text-[26px] leading-tight tracking-[-0.01em] text-[#0B0D12]">
                <span className="italic">Reset password</span>
              </h1>
              <p className="mb-8 text-center text-[14.5px] text-[#8A8F98]">
                Choose a strong password with at least 8 characters
              </p>

              {/* Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="group relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] transition-colors group-focus-within:text-[#2F5DE0]">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-[14.5px] text-[#0B0D12] placeholder:text-[#8A8F98] transition-all focus:border-[#2F5DE0] focus:outline-none focus:ring-2 focus:ring-[#2F5DE0]/15"
                  />
                </div>

                <div className="group relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] transition-colors group-focus-within:text-[#2F5DE0]">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-[14.5px] text-[#0B0D12] placeholder:text-[#8A8F98] transition-all focus:border-[#2F5DE0] focus:outline-none focus:ring-2 focus:ring-[#2F5DE0]/15"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0D12] px-4 py-3 text-[14.5px] font-medium text-white transition-all hover:bg-[#1a1d24] hover:shadow-lg hover:shadow-[#0B0D12]/10 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F5DE0]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
