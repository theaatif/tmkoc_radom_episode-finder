"use client";

import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GetStartedModal } from "@/features/auth/components/GetStartedModal";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface HeroSectionProps {
  onGenerateClick?: () => void;
}

export function HeroSection({ onGenerateClick }: HeroSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-start overflow-hidden">


      {/* ═══ BACKGROUND: Full Screen Image ═══ */}
      <div className="absolute inset-0 z-0 bg-canvas">
        <Image
          src="/images/hero-section-v2.png"
          alt="Taarak Mehta Ka Ooltah Chashmah Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlay to ensure text readability on the left while revealing the image on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/95 via-canvas/80 to-canvas/10 sm:to-transparent" />
        {/* Subtle top/bottom fade to blend with next sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/30 via-transparent to-canvas/40" />
      </div>

      {/* ── Blended Character Image (Bottom Right) ── */}
      <div
        className="hidden lg:block absolute bottom-0 right-0 h-[85%] pointer-events-none z-0"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 40%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 40%, black 80%, transparent 100%)'
        }}
      >
        <div
          className="relative h-full inline-block"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)'
          }}
        >
          <Image
            src="/images/babitaa-jetha.png"
            alt="Jethalal and Babita"
            width={1448}
            height={1086}
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="h-full w-auto object-right-bottom"
          />
        </div>
      </div>

      {/* ═══ MAIN CONTENT: Left-Aligned ═══ */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 pt-28 pb-16 sm:pt-32 md:pt-36 lg:py-24 flex flex-col justify-center">

        {/* ── LEFT COLUMN: Text Content ── */}
        <div className="flex-1 w-full max-w-3xl flex flex-col items-start text-left gap-6 sm:gap-8">

          {/* Headline + Logo Group */}
          <div className="flex flex-col items-start gap-2.5 sm:gap-3">
            {/* Tagline */}
            <p className="text-[10px] sm:text-xs font-bold text-brand-cyan uppercase tracking-[0.18em] leading-none max-w-xl">
              Stop Re-watching the Same 50 Episodes on YouTube.
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] text-ink font-semibold tracking-[-0.03em] leading-[1.05] sm:whitespace-nowrap">
              Discover Unseen Episodes of
            </h1>
            <div className="relative w-[300px] h-[95px] sm:w-[420px] sm:h-[135px] md:w-[540px] md:h-[175px] -ml-2 sm:-ml-3 mt-1">
              <Image
                src="/images/tmkoc_tile.webp"
                alt="Taarak Mehta Ka Ooltah Chashmah"
                fill
                priority
                sizes="(max-width: 640px) 300px, (max-width: 768px) 420px, 540px"
                className="object-contain object-left"
              />
            </div>
          </div>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-body-text leading-relaxed font-normal max-w-lg">
            Break free from YouTube&apos;s algorithm. Track your watch history,
            filter by eras, and get randomized unwatched episodes instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  onGenerateClick?.();
                } else {
                  setIsModalOpen(true);
                }
              }}
              variant="cyan"
              size="lg"
              className="text-sm sm:text-base px-8 sm:px-10 shadow-[0_8px_24px_rgba(0,172,192,0.3)]"
            >
              Find Unseen Episode
            </Button>
          </div>

          {/* Inline Text Stats (No Cards) */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 mt-2 border-t border-ink/10 w-full max-w-lg">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">3,800+</span>
              <span className="text-[10px] sm:text-xs font-bold text-muted-text uppercase tracking-widest mt-1">Episodes</span>
            </div>
            <div className="w-px h-10 bg-ink/10 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">3</span>
              <span className="text-[10px] sm:text-xs font-bold text-muted-text uppercase tracking-widest mt-1">Era Filters</span>
            </div>
            <div className="w-px h-10 bg-ink/10 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">100%</span>
              <span className="text-[10px] sm:text-xs font-bold text-muted-text uppercase tracking-widest mt-1">Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SIGN IN MODAL ═══ */}
      <GetStartedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onGenerateClick?.();
        }}
      />
    </section>
  );
}
