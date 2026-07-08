"use client";

import { useAuthStore, type User } from "@/features/auth/store/authStore";

export type { User };

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
}
