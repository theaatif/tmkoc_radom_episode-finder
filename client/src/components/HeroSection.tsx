"use client";

import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

interface HeroSectionProps {
  onGenerateClick?: () => void;
}

export function HeroSection({ onGenerateClick }: HeroSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 py-16 md:py-24 flex flex-col justify-center">

        {/* ── LEFT COLUMN: Text Content ── */}
        <div className="flex-1 w-full max-w-2xl flex flex-col items-start text-left gap-6 sm:gap-8">

          {/* Status Indicator */}
          {/* <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-brand-white/40 backdrop-blur-md border border-brand-white/50 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div> */}

          {/* Headline + Logo */}
          <div className="flex flex-col items-start gap-2">
            <h1 className="font-[family-name:var(--font-geist-sans)] text-4xl sm:text-5xl lg:text-[64px] text-ink font-extrabold tracking-tight leading-[1.05]">
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
              onClick={() => setIsModalOpen(true)}
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
              <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">1,700+</span>
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-canvas rounded-[24px] sm:rounded-[32px] border border-ink/5 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center gap-6 overflow-hidden">

            <button
              className="absolute top-5 right-5 text-muted-text hover:text-ink transition-colors cursor-pointer"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="h-16 w-16 rounded-[20px] bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-3xl">
              🍿
            </div>

            <div>
              <h3 className="font-display text-2xl text-ink font-semibold tracking-tight">
                Get Started
              </h3>
              <p className="text-sm text-muted-text mt-2 leading-relaxed">
                Sign in with Google to save your watch progress, unlock custom era filters, and enjoy seamless playback.
              </p>
            </div>

            <div className="w-full pt-1 flex justify-center">
              <GoogleSignInButton />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
