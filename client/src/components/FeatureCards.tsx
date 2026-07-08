import * as React from "react";

export function FeatureCards() {
  return (
    <section className="w-full py-16 md:py-24 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col space-y-12">

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
          Core Features
        </span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink font-semibold tracking-[-0.04em]">
          Designed for true discovery
        </h2>
      </div>

      {/* 3-Column Minimal Typography Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 pt-4">

        {/* Column 1: Smart History Filter */}
        <div className="space-y-4 text-center md:text-left">
          <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/50 shadow-sm inline-block">
            History Sync
          </span>
          <h3 className="font-sans text-xl sm:text-2xl text-ink font-bold tracking-tight">
            Smart History Filtering
          </h3>
          <p className="text-sm text-muted-text leading-relaxed font-normal">
            Never get duplicate suggestions. Our system checks your watched list in real-time before suggesting a classic episode, keeping your Nostalgia session fresh.
          </p>
        </div>

        {/* Column 2: Era Filtering Engine */}
        <div className="space-y-4 text-center md:text-left">
          <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/50 shadow-sm inline-block">
            Era Presets
          </span>
          <h3 className="font-sans text-xl sm:text-2xl text-ink font-bold tracking-tight">
            Era Filtering Engine
          </h3>
          <p className="text-sm text-muted-text leading-relaxed font-normal">
            Filter by Classic (1-500), Golden (501-1500), or Modern eras. Experience Gokuldham episodes exactly the way you remember them.
          </p>
        </div>

        {/* Column 3: One-Click Sharing */}
        <div className="space-y-4 text-center md:text-left">
          <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/50 shadow-sm inline-block">
            Public Sharing
          </span>
          <h3 className="font-sans text-xl sm:text-2xl text-ink font-bold tracking-tight">
            One-Click Sharing
          </h3>
          <p className="text-sm text-muted-text leading-relaxed font-normal">
            Save your favorite nostalgic episodes and share custom playlist collections with your friends instantly.
          </p>
        </div>

      </div>

    </section>
  );
}
