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
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
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

    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      initGIS();
      setScriptLoaded(true);
    };

    const handleError = () => {
      setError("Failed to load Google Sign-In");
    };

    if (window.google?.accounts?.id) {
      handleLoad();
    } else {
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);
    }

    return () => {
      if (script) {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      }
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
    <div className="relative flex items-center justify-center">
      {/* Real Google Button — hidden until script loads to prevent mounting race conditions */}
      <div 
        ref={buttonRef} 
        className={!scriptLoaded ? "absolute invisible pointer-events-none" : "block"} 
      />

      {/* Loading Placeholder */}
      {!scriptLoaded && (
        <div className="flex items-center justify-center h-10 px-5 rounded-full border border-slate-200/80 bg-white/95 text-xs font-semibold text-slate-500 gap-2.5 animate-pulse w-[220px] shadow-sm select-none pointer-events-none">
          <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading Google Sign-in...</span>
        </div>
      )}
    </div>
  );
}
