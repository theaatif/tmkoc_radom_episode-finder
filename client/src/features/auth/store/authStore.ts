"use client";

import { create } from "zustand";
import { env } from "@/config/env";
import { setAccessToken, getCsrfToken } from "@/lib/apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  shareToken: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  restoreSession: () => Promise<void>;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  showSuccessModal: false,
  setShowSuccessModal: (show: boolean) => set({ showSuccessModal: show }),

  restoreSession: async () => {
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
          body: JSON.stringify({}),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        set({ user: data.user, isAuthenticated: !!data.user });
      }
    } catch {
      // No valid session — stay logged out
    } finally {
      set({ loading: false });
    }
  },

  login: async (idToken: string) => {
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
    set({ user: data.user, isAuthenticated: true, showSuccessModal: true });
  },

  logout: async () => {
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
    set({ user: null, isAuthenticated: false });
  },
}));
