"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareFavoritesButtonProps {
  shareToken: string;
}

export function ShareFavoritesButton({ shareToken }: ShareFavoritesButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    if (!shareToken) return;
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button
      variant="cyan"
      onClick={handleCopyShareLink}
      className="group cursor-pointer font-bold shadow-clay-cyan shrink-0 self-start sm:self-end"
    >
      {copied ? (
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied Link!
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          Share Favorites
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </span>
      )}
    </Button>
  );
}
