"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSharedPlaylist } from "@/features/episodes/episodes.api";

interface ShareFavoritesButtonProps {
  shareToken: string;
}

export function ShareFavoritesButton({ shareToken }: ShareFavoritesButtonProps) {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCopyShareLink = async () => {
    if (!shareToken || creating) return;
    setCreating(true);
    try {
      const { playlistId } = await createSharedPlaylist();
      const shareUrl = `${window.location.origin}/share/${playlistId}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // Fallback for non-HTTPS or older browsers
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail — user can retry
    } finally {
      setCreating(false);
    }
  };

  return (
    <Button
      variant="cyan"
      onClick={handleCopyShareLink}
      disabled={creating}
      className="group cursor-pointer font-bold shadow-clay-cyan shrink-0 self-start sm:self-end"
    >
      {creating ? (
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Creating Link...
        </span>
      ) : copied ? (
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
