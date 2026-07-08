"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-brand-coral/10 flex items-center justify-center mb-6">
        <svg className="h-8 w-8 text-brand-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-ink">Something went wrong</h2>
      <p className="text-sm text-muted-text mt-2 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} variant="cyan" className="mt-6 px-8">
        Try Again
      </Button>
    </div>
  );
}
