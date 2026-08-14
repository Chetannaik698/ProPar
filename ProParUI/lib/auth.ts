/**
 * Client-side authentication utilities
 *
 * Handles session state, cookie-based authentication, and API calls
 * for the ProPar authentication system.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://propar-backend.onrender.com";
const LOGGED_IN_KEY = "propar_logged_in";

// ============================================
// Session Management
// ============================================

/**
 * Set the client-side logged in indicator
 */
export const setLoggedIn = (value: boolean): void => {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(LOGGED_IN_KEY, "true");
  } else {
    localStorage.removeItem(LOGGED_IN_KEY);
  }
};

/**
 * Check if the user is logged in
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOGGED_IN_KEY) === "true";
};

// Legacy token helpers to prevent compilation breakages in other files
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("propar_token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("propar_token", token);
  setLoggedIn(true);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("propar_token");
  setLoggedIn(false);
};

// ============================================
// User Types
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: "google" | "apple" | "microsoft" | "email";
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token?: string;
  user: AuthUser;
}

// ============================================
// Authentication API Requests
// ============================================

/**
 * Check if an email address exists in the system
 */
export const checkEmailExists = async (email: string): Promise<{ exists: boolean; provider?: "google" | "apple" | "microsoft" | "email" }> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to check email availability");
  }

  return res.json();
};

/**
 * Create a new account with email, name, and password
 */
export const registerUser = async (
  email: string,
  name: string,
  password: string
): Promise<{ message: string; email: string }> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Signup failed");
  }

  return res.json();
};

/**
 * Log in with email & password
 */
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || data.error || "Login failed");
    (err as any).errorType = data.error; // e.g., 'Unverified email', 'Wrong password'
    throw err;
  }

  const responseData: AuthResponse = await res.json();
  if (responseData.token) {
    setToken(responseData.token);
  } else {
    setLoggedIn(true);
  }
  return responseData;
};

/**
 * Verify email address using verification token
 */
export const verifyEmailToken = async (token: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || "Email verification failed");
  }

  const responseData: AuthResponse = await res.json();
  setLoggedIn(true);
  return responseData;
};

/**
 * Request password reset link (forgot password)
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || "Password reset request failed");
  }

  return res.json();
};

/**
 * Reset password using token
 */
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password: newPassword }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || "Failed to reset password");
  }

  return res.json();
};

/**
 * Send a magic-link email (Legacy support)
 */
export const sendMagicLink = async (email: string): Promise<{ message: string; email: string; devModeConsoleOnly?: boolean }> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to send magic link");
  }

  return res.json();
};

/**
 * Verify a magic-link token (Legacy support)
 */
export const verifyMagicToken = async (token: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Invalid or expired link");
  }

  const responseData: AuthResponse = await res.json();
  setLoggedIn(true);
  return responseData;
};

/**
 * Google OAuth — exchange credential ID token
 */
export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Google sign-in failed");
  }

  const responseData: AuthResponse = await res.json();
  if (responseData.token) {
    setToken(responseData.token);
  } else {
    setLoggedIn(true);
  }
  return responseData;
};

/**
 * Apple OAuth — exchange credential ID token
 */
export const appleLogin = async (idToken: string, user?: unknown): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, user }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Apple sign-in failed");
  }

  const responseData: AuthResponse = await res.json();
  if (responseData.token) {
    setToken(responseData.token);
  } else {
    setLoggedIn(true);
  }
  return responseData;
};

/**
 * Microsoft OAuth — exchange access token
 */
export const microsoftLogin = async (accessToken: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/api/v1/auth/microsoft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Microsoft sign-in failed");
  }

  const responseData: AuthResponse = await res.json();
  if (responseData.token) {
    setToken(responseData.token);
  } else {
    setLoggedIn(true);
  }
  return responseData;
};

/**
 * Get current authenticated user session
 */
export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  if (!isAuthenticated()) return null;

  try {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      setLoggedIn(false);
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
};

/**
 * Logout session on backend and clean up client
 */
export const logout = (): void => {
  setLoggedIn(false);

  if (typeof window !== "undefined") {
    localStorage.removeItem("propar_token");
    localStorage.removeItem("propar_added_to_chrome");
  }

  // Call logout endpoint to clear cookie
  fetch(`${API_BASE}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  });
};
