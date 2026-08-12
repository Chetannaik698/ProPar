"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard wraps content that requires authentication.
 * If the user is not signed in, they are redirected to /auth/login.
 * An optional fallback (e.g. a loading spinner) can be shown during the check.
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B0D12] border-t-transparent" />
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
