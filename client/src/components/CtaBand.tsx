import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="w-full py-12 md:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-surface-soft border border-slate-200/50 rounded-clay-xl px-4 py-8 sm:p-12 md:p-16 flex flex-col justify-center gap-10 shadow-sm min-h-[350px]">
        
        {/* Background Image */}
        <div className="absolute top-0 right-0 bottom-0 z-0 pointer-events-none">
          <div 
            className="relative h-full inline-block"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 50%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 50%, black 100%)'
            }}
          >
            <Image
              src="/images/jetha naste.png"
              alt="Gokuldham Background"
              width={1337}
              height={1177}
              className="h-full w-auto opacity-45 md:opacity-95"
            />
          </div>
        </div>

        {/* Abstract Background Accents */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-brand-yellow/10 blur-3xl pointer-events-none z-0" />

        {/* Content Group */}
        <div className="space-y-4 max-w-xl text-center md:text-left z-10 bg-brand-white/70 md:bg-transparent backdrop-blur-[3px] md:backdrop-blur-none p-4 sm:p-8 md:p-0 rounded-[28px] border border-slate-200/30 md:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:shadow-none flex flex-col items-center md:items-start w-full">
          <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-brand-white px-3.5 py-1.5 rounded-full border border-slate-105 shadow-sm inline-block">
            Start Exploring
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink font-semibold tracking-tight leading-tight px-2 md:px-0">
            Ready to explore Gokuldham Society?
          </h2>
          <p className="text-sm md:text-base text-muted-text leading-relaxed font-normal px-2 md:px-0">
            Step into Gokuldham Society! Sign in with Google to personalize your experience, filter out episodes you've already watched, and track your streaming progress in real-time.
          </p>
          <div className="pt-2 flex justify-center md:justify-start w-full px-2 md:px-0">
            <Link href="/generate" className="w-full sm:w-auto flex justify-center">
              <Button variant="cyan" size="lg" className="w-full sm:w-auto max-w-[260px] sm:max-w-none px-6 sm:px-8 font-bold whitespace-nowrap shadow-clay-cyan">
                Find Unseen Episode
              </Button>
            </Link>
          </div>
        </div>

        {/* Removed Decorative Graphic */}

      </div>
    </section>
  );
}
