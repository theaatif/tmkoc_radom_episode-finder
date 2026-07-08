"use client";

import * as React from "react";
import { env } from "@/config/env";
import { setAccessToken, getCsrfToken } from "@/lib/apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  shareToken: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Silent session restore on mount
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const csrfToken = await getCsrfToken();
        const res = await fetch(
          `${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setAccessToken(data.accessToken);
            setUser(data.user);
          }
        }
      } catch {
        // No valid session — stay logged out
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(async (idToken: string) => {
    const csrfToken = await getCsrfToken();

    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.code ?? "login_failed");
    }

    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      const accessToken = (await import("@/lib/apiClient")).getAccessToken();

      await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
    } catch {
      // Always clear local state even if the server call fails
    }

    setAccessToken(null);
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
