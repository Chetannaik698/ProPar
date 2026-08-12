"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AuthUser,
  getToken,
  setToken,
  removeToken,
  fetchCurrentUser,
  isAuthenticated as checkAuth,
} from "@/lib/auth";

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

/**
 * React hook for authentication state management.
 *
 * Provides user data, loading state, and login/logout functions.
 * Automatically fetches the current user on mount if a valid token exists.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (checkAuth()) {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((token: string, userData: AuthUser) => {
    setToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    window.location.href = "/";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && checkAuth(),
    login,
    logout,
    refresh,
  };
}
