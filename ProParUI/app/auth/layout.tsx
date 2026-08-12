import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to ProPar — your AI writing companion.",
};

/**
 * Auth layout — minimal, full-screen layout without Navbar/Footer.
 * Used for /auth/login, /auth/verify, /auth/callback pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
