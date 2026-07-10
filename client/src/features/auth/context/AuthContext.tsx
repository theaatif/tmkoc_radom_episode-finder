"use client";

import * as React from "react";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";
import { SignInSuccessModal } from "../components/SignInSuccessModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const showSuccessModal = useAuthStore((state) => state.showSuccessModal);
  const setShowSuccessModal = useAuthStore((state) => state.setShowSuccessModal);
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <>
      {children}
      <SignInSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={user?.name}
      />
    </>
  );
}

// Proxy for legacy components importing the context hook directly
export function useAuthContext() {
  return useAuth();
}
