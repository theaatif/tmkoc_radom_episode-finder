"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { useAuthContext } from "@/features/auth/context/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon";
              shape?: "rectangular" | "pill" | "circle" | "square";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              logo_alignment?: "left" | "center";
              width?: number;
            }
          ) => void;
          prompt: (
            momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getMomentType: () => string }) => void
          ) => void;
        };
      };
    };
  }
}

export interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { login } = useAuthContext();
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const buttonRef = React.useRef<HTMLDivElement>(null);

  const onSuccessRef = React.useRef(onSuccess);
  React.useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  React.useEffect(() => {
    setError(null);
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google Client ID not configured");
      return;
    }

    function handleCredentialResponse(response: { credential: string }) {
      login(response.credential)
        .then(() => onSuccessRef.current?.())
        .catch(() => setError("Sign in failed"));
    }

    function initGIS() {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          shape: "pill",
          theme: "outline",
          size: "large",
          text: "signin_with",
          logo_alignment: "left",
        });
      }
    }

    if (window.google?.accounts?.id) {
      initGIS();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGIS;
    script.onerror = () => setError("Failed to load Google Sign-In");
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.remove();
    };
  }, [login, retryCount]);

  if (error) {
    return (
      <Button
        onClick={() => setRetryCount((c) => c + 1)}
        variant="secondary"
        className="flex items-center gap-2"
      >
        Sign in failed — tap to retry
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div ref={buttonRef} />
    </div>
  );
}
