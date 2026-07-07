"use client";

import * as React from "react";
import Image from "next/image";
import { EpisodeGenerator } from "@/features/episodes/components/EpisodeGenerator";
import { Footer } from "@/components/Footer";

export default function GeneratePage() {
  return (
    <div className="flex flex-col flex-1 bg-canvas">
      {/* Main Workspace Area */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 px-6 sm:px-8 bg-surface-soft flex-1 overflow-hidden">
        
        {/* Decorative Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-surface-soft/50 via-surface-soft/80 to-surface-soft z-10" />
          <Image
            src="/images/jetha-babita-daya.png"
            alt="TMKOC Background"
            fill
            sizes="100vw"
            className="object-cover object-top opacity-40 mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <EpisodeGenerator />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
