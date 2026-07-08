"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const FUNNY_DIALOGUES = [
  { text: "Hey Maa, Mataji!", character: "Daya Ben" },
  { text: "Chup ho jaa satvi fail!", character: "Jethalal" },
  { text: "Nonsense! Don't eat my brain!", character: "Jethalal" },
  { text: "Goli beta, masti nahi!", character: "Jethalal" },
  { text: "Ae Bhide! Ekdam chup!", character: "Jethalal" },
  { text: "Hamari sadiyo purani sanskriti...", character: "Bhide" },
  { text: "Cancel... cancel... cancel!", character: "Popatlal" },
  { text: "Aey Jethiya!", character: "Bapuji" },
  { text: "Aisa kyun hota hai bhagwan, mere hi saath...", character: "Jethalal" },
  { text: "Aapki chabi mere paas hai!", character: "Bagha" },
  { text: "Mujhe toh kuch pata hi nahi hai!", character: "Bagha" },
  { text: "Chai piyo, biscuit khao!", character: "Hansraj Hathi" },
  { text: "Duniya mein taarak mehta jaise dost sabko milein!", character: "Jethalal" },
];

export function EpisodePlayer({ videoId, episodeId, onClose, onWatched }: EpisodePlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadingDialogue, setLoadingDialogue] = useState({ text: "", character: "" });
  const hasLoggedWatch = useRef(false);
  const onWatchedRef = useRef(onWatched);
  onWatchedRef.current = onWatched;
  const playerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIframeLoaded(false);
    const randomIdx = Math.floor(Math.random() * FUNNY_DIALOGUES.length);
    setLoadingDialogue(FUNNY_DIALOGUES[randomIdx]);
  }, [videoId]);

  useEffect(() => {
    function createPlayer() {
      if (!window.YT || !window.YT.Player) return;
      playerRef.current = new window.YT.Player("yt-player", {
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

  if (!mounted) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/15 backdrop-blur-[12px] p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Floating Bokeh Light Blooms */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-brand-cyan/20 blur-[90px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-brand-coral/15 blur-[120px] pointer-events-none animate-pulse duration-[12s]" />

      <div 
        className="relative z-10 w-full max-w-5xl aspect-video bg-black shadow-[0_24px_60px_rgba(0,0,0,0.6)] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-slate-200/10 isolate"
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
        }}
      >
        {/* Buffering Loading State */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white gap-6 z-0">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[3px] border-t-brand-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
              <div className="absolute inset-1 rounded-full border-[3px] border-t-transparent border-r-brand-cyan/20 border-b-brand-cyan/20 border-l-transparent animate-spin duration-1000" />
            </div>
            
            {loadingDialogue.text && (
              <div className="flex flex-col items-center gap-2 max-w-md px-6 text-center animate-pulse">
                <span className="text-sm sm:text-base font-display font-medium text-slate-200 italic">
                  "{loadingDialogue.text}"
                </span>
                <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase">
                  — {loadingDialogue.character}
                </span>
              </div>
            )}
          </div>
        )}

        <iframe
          id="yt-player"
          className={`w-full h-full border-0 transition-opacity duration-500 ease-out z-10 ${
            iframeLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${origin}`}
          onLoad={() => setIframeLoaded(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 hover:bg-black/95 text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95 focus:outline-none group cursor-pointer"
          aria-label="Close Player"
        >
          <svg
            className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
