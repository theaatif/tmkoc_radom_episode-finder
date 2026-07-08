"use client";

import * as React from "react";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
}

// Proxy for legacy components importing the context hook directly
export function useAuthContext() {
  return useAuth();
}
