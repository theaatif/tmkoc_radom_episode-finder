"use client";

import { useEffect, useRef } from "react";
import { markWatched } from "../episodes.api";

interface EpisodePlayerProps {
  videoId: string;
  episodeId: string;
  onClose: () => void;
  onWatched?: () => void;
}

// Extend Window interface for YouTube global hooks
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function EpisodePlayer({ videoId, episodeId, onClose, onWatched }: EpisodePlayerProps) {
  const hasLoggedWatch = useRef(false);
  const onWatchedRef = useRef(onWatched);
  onWatchedRef.current = onWatched;
  const playerRef = useRef<any>(null);

  useEffect(() => {
    function createPlayer() {
      if (!window.YT) return;
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        events: {
          onStateChange: (event: any) => {
            const PLAYING = 1;
            if (event.data === PLAYING && !hasLoggedWatch.current) {
              hasLoggedWatch.current = true;
              markWatched(episodeId).catch(() => {});
              onWatchedRef.current?.();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      // Check if tag already exists in page
      let tag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]') as HTMLScriptElement;
      if (!tag) {
        tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        createPlayer();
      };
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
    };
  }, [videoId, episodeId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-black shadow-2xl rounded-lg overflow-hidden">
        <div id="yt-player" className="w-full h-full" />
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-zinc-300 font-medium text-lg flex items-center gap-1 focus:outline-none"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
