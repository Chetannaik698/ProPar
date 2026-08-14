"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Script from "next/script";
import { Mail, ArrowRight, Loader2, User, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  checkEmailExists,
  registerUser,
  loginUser,
  requestPasswordReset,
  googleLogin,
  appleLogin,
  setToken,
} from "@/lib/auth";
import { useAuth } from "@/components/AuthContext";
import Logo from "@/components/Logo";

// ============================================
// Social Provider Icons
// ============================================

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
    <path d="M14.94 13.38c-.34.78-.5 1.13-.94 1.82-.6.97-1.46 2.18-2.52 2.19-.94.01-1.18-.62-2.46-.61-1.28.01-1.54.62-2.48.61-1.06-.01-1.87-1.1-2.47-2.07C2.63 12.97 2.19 10.22 3.37 8.62c.83-1.14 2.12-1.8 3.32-1.8 1.14 0 1.85.62 2.79.62.91 0 1.47-.62 2.78-.62 1.06 0 2.2.57 3.04 1.56-2.67 1.46-2.24 5.27.64 6.28v-.28ZM11.5 4.9c.5-.64.88-1.55.74-2.48-.82.06-1.77.57-2.33 1.25-.5.61-.92 1.53-.76 2.42.9.03 1.83-.5 2.35-1.19Z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022"/>
    <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00"/>
    <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
    <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
  </svg>
);

// ============================================
// Animation Variants
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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

export default function LoginPage() {
  const router = useRouter();
  const { login: contextLogin } = useAuth();

  const [step, setStep] = useState<"email" | "password" | "signup" | "forgot">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";

  // Dynamic Headings & Descriptions
  const headingText = {
    email: "Get started",
    password: "Welcome back",
    signup: "Create account",
    forgot: "Reset password",
  }[step];

  const descText = {
    email: "Sign in to review your writing with ProPar",
    password: "Enter your password to sign in",
    signup: "Choose a name and password to get started",
    forgot: "We'll email you a secure link to reset your password",
  }[step];

  const initGoogle = () => {
    if (typeof window !== "undefined" && window.google && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button-container"),
          { theme: "outline", size: "large", width: 350 }
        );
      } catch (err) {
        console.error("Error initializing Google Sign-In:", err);
      }
    }
  };

  const initApple = () => {
    if (typeof window !== "undefined" && window.AppleID && appleClientId) {
      try {
        window.AppleID.auth.init({
          clientId: appleClientId,
          scope: "name email",
          redirectURI: `${window.location.origin}/auth/callback`,
          usePopup: true,
        });
      } catch (err) {
        console.error("Error initializing Apple Sign-In:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.google) initGoogle();
      if (window.AppleID) initApple();
    }
  }, [googleClientId, appleClientId]);

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await googleLogin(response.credential);
      contextLogin(res.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (!appleClientId) {
      handleSocialLogin("Apple");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      if (typeof window === "undefined" || !window.AppleID) {
        throw new Error("Apple Sign-In script not loaded yet.");
      }
      const response = await window.AppleID.auth.signIn();
      const idToken = response.authorization.id_token;
      const appleUser = response.user || null;

      const res = await appleLogin(idToken, appleUser);
      contextLogin(res.user);
      router.push("/");
    } catch (err: any) {
      if (err?.error === "popup_closed_by_user" || err?.error === "user_cancelled") {
        return;
      }
      setError(err instanceof Error ? err.message : "Apple sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError(`${provider} sign-in will be available once configured. Use email for now.`);
    setTimeout(() => setError(""), 4000);
  };

  // Submit Handlers
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.toLowerCase().trim())) {
        throw new Error("Please enter a valid email address.");
      }

      const response = await checkEmailExists(email.toLowerCase().trim());
      if (response.exists) {
        if (response.provider === "email") {
          setStep("password");
        } else {
          throw new Error(
            `This email is associated with a ${response.provider} login. Please continue with ${response.provider}.`
          );
        }
      } else {
        setStep("signup");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(email.toLowerCase().trim(), password);
      contextLogin(response.user);
      router.push("/");
    } catch (err: any) {
      if (err.errorType === "Unverified email") {
        sessionStorage.setItem("propar_verify_email", email.toLowerCase().trim());
        sessionStorage.setItem("propar_dev_mode_console_only", "true");
        router.push("/auth/verify");
      } else {
        setError(err.message || "Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await registerUser(email.toLowerCase().trim(), name.trim(), password);
      sessionStorage.setItem("propar_verify_email", email.toLowerCase().trim());
      if ((response as any).devModeConsoleOnly) {
        sessionStorage.setItem("propar_dev_mode_console_only", "true");
      } else {
        sessionStorage.removeItem("propar_dev_mode_console_only");
      }
      router.push("/auth/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await requestPasswordReset(email.toLowerCase().trim());
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFBFC] px-5 py-12">
      {/* Background */}
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
          <Logo size={24} wordmarkClassName="font-display text-xl tracking-tight text-[#0B0D12]" />
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-[#E7E9EC] bg-white px-5 py-7 sm:px-8 sm:py-10 shadow-[0_1px_2px_rgba(11,13,18,0.04),0_12px_40px_-8px_rgba(11,13,18,0.10)]"
        >
          {/* Dynamic Headers */}
          <h1 className="mb-1 text-center font-display text-[28px] leading-tight tracking-[-0.01em] text-[#0B0D12]">
            <span className="italic">{headingText}</span>
          </h1>
          <p className="mb-8 text-center text-[14.5px] text-[#8A8F98]">
            {descText}
          </p>

          {/* Social OAuth Buttons (Email Step Only) */}
          {step === "email" && (
            <>
              <div className="space-y-2.5">
                <div className="relative">
                  <button
                    id="auth-google-btn"
                    onClick={() => handleSocialLogin("Google")}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7E9EC] bg-white px-4 py-3 text-[14.5px] font-medium text-[#0B0D12] transition-all hover:border-[#D1D5DB] hover:bg-[#F6F7F8] hover:shadow-sm active:scale-[0.99]"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  {googleClientId && (
                    <div
                      id="google-signin-button-container"
                      className="absolute inset-0 z-20 cursor-pointer opacity-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:cursor-pointer [&_iframe]:pointer-events-auto"
                    />
                  )}
                </div>

                <button
                  id="auth-apple-btn"
                  onClick={handleAppleSignIn}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7E9EC] bg-white px-4 py-3 text-[14.5px] font-medium text-[#0B0D12] transition-all hover:border-[#D1D5DB] hover:bg-[#F6F7F8] hover:shadow-sm active:scale-[0.99]"
                >
                  <AppleIcon />
                  Continue with Apple
                </button>

                <button
                  id="auth-microsoft-btn"
                  onClick={() => handleSocialLogin("Microsoft")}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7E9EC] bg-white px-4 py-3 text-[14.5px] font-medium text-[#0B0D12] transition-all hover:border-[#D1D5DB] hover:bg-[#F6F7F8] hover:shadow-sm active:scale-[0.99]"
                >
                  <MicrosoftIcon />
                  Continue with Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E7E9EC]" />
                <span className="text-[13px] font-medium text-[#8A8F98]">or</span>
                <div className="h-px flex-1 bg-[#E7E9EC]" />
              </div>
            </>
          )}

          {/* Email View Header for subsequent steps */}
          {step !== "email" && step !== "forgot" && (
            <div className="mb-5 flex items-center justify-between rounded-xl bg-[#F6F7F8] px-4 py-3 text-[13.5px] text-[#3B3F46]">
              <span className="truncate font-medium">{email}</span>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setPassword("");
                  setName("");
                }}
                className="font-semibold text-[#2F5DE0] hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="group relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] transition-colors group-focus-within:text-[#2F5DE0]">
                  <Mail size={16} />
                </div>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-[14.5px] text-[#0B0D12] placeholder:text-[#8A8F98] transition-all focus:border-[#2F5DE0] focus:outline-none focus:ring-2 focus:ring-[#2F5DE0]/15"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <button
                id="auth-email-submit"
                type="submit"
                disabled={isLoading || !email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0D12] px-4 py-3 text-[14.5px] font-medium text-white transition-all hover:bg-[#1a1d24] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Password Form (Existing User) */}
          {step === "password" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="group relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] transition-colors group-focus-within:text-[#2F5DE0]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-[14.5px] text-[#0B0D12] placeholder:text-[#8A8F98] transition-all focus:border-[#2F5DE0] focus:outline-none focus:ring-2 focus:ring-[#2F5DE0]/15"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setStep("forgot");
                    setError("");
                  }}
                  className="text-[12.5px] font-semibold text-[#2F5DE0] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !password}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0D12] px-4 py-3 text-[14.5px] font-medium text-white transition-all hover:bg-[#1a1d24] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setPassword("");
                }}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-[#3B3F46] py-1"
              >
                <ArrowLeft size={13} /> Back
              </button>
            </form>
          )}

          {/* Step 3: Sign Up Form (New User) */}
          {step === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="group relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] transition-colors group-focus-within:text-[#2F5DE0]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password (min 8 chars)"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-[14.5px] text-[#0B0D12] placeholder:text-[#8A8F98] transition-all focus:border-[#2F5DE0] focus:outline-none focus:ring-2 focus:ring-[#2F5DE0]/15"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !name.trim() || !password}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0D12] px-4 py-3 text-[14.5px] font-medium text-white transition-all hover:bg-[#1a1d24] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setName("");
                  setPassword("");
                }}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-[#3B3F46] py-1"
              >
                <ArrowLeft size={13} /> Back
              </button>
            </form>
          )}

          {/* Step 4: Forgot Password Form */}
          {step === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {successMessage ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-[13.5px] text-green-800 leading-relaxed font-medium">
                    {successMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-[#0B0D12] hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <>
                  <div className="group relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] transition-colors group-focus-within:text-[#2F5DE0]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-[14.5px] text-[#0B0D12] placeholder:text-[#8A8F98] transition-all focus:border-[#2F5DE0] focus:outline-none focus:ring-2 focus:ring-[#2F5DE0]/15"
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0D12] px-4 py-3 text-[14.5px] font-medium text-white transition-all hover:bg-[#1a1d24] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                    }}
                    className="flex w-full items-center justify-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-[#3B3F46] py-1"
                  >
                    <ArrowLeft size={13} /> Back to Sign In
                  </button>
                </>
              )}
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-[12.5px] leading-relaxed text-[#8A8F98]"
        >
          By continuing, you agree to ProPar&apos;s{" "}
          <a href="#" className="underline underline-offset-2 transition-colors hover:text-[#3B3F46]">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 transition-colors hover:text-[#3B3F46]">
            Privacy Policy
          </a>
        </motion.p>
      </motion.div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={initApple}
      />
    </div>
  );
}
