"use client";

import React from "react";

interface PageSkeletonProps {
  type?: "finder" | "grid";
  isMobileOnly?: boolean;
}

export function PageSkeleton({ type = "finder", isMobileOnly = false }: PageSkeletonProps) {
  // If mobile-only, render matching the ivory/white screenshot aesthetics
  if (isMobileOnly) {
    return (
      <div className="w-full h-full flex flex-col pt-12 pb-16 px-6 relative overflow-hidden bg-[#FCFBF7]">
        <div className="max-w-md mx-auto w-full flex flex-col items-center gap-6 animate-pulse">
          {/* Top Pill Placeholder */}
          <div className="h-10 w-44 bg-white border border-slate-200/40 rounded-full shadow-sm" />
          {/* Horizontal Line */}
          <div className="h-2 w-full bg-white/70 rounded-full" />

          {type === "finder" ? (
            /* Finder Layout */
            <div className="flex flex-col items-center gap-8 w-full mt-4">
              {/* Tabs selector bar */}
              <div className="flex gap-2 p-1 bg-white/60 border border-slate-200/30 rounded-full w-full">
                <div className="h-8 flex-1 bg-white rounded-full shadow-sm" />
                <div className="h-8 flex-1 bg-white/40 rounded-full" />
                <div className="h-8 flex-1 bg-white/40 rounded-full" />
                <div className="h-8 flex-1 bg-white/40 rounded-full" />
              </div>

              {/* Central Card */}
              <div className="w-full max-w-[340px] aspect-[3/4] bg-white rounded-[32px] flex flex-col justify-end p-6 gap-4 border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.02)]">
                <div className="h-5 w-3/4 bg-slate-100 rounded-full" />
                <div className="h-4 w-1/2 bg-slate-100/80 rounded-full" />
                <div className="flex justify-between items-center mt-2">
                  <div className="h-10 w-20 bg-slate-100 rounded-2xl" />
                  <div className="h-10 w-10 bg-slate-100 rounded-full" />
                </div>
              </div>

              {/* Action Button at bottom */}
              <div className="h-12 w-48 bg-white border border-slate-200/40 rounded-full shadow-sm mt-2" />
            </div>
          ) : (
            /* Grid Layout (e.g. mobile card grid) */
            <div className="flex flex-col gap-4 w-full mt-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
                >
                  <div className="aspect-video w-full bg-slate-50 rounded-2xl" />
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-5/6 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-1/2 bg-slate-50 rounded-md" />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-9 w-20 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular PageSkeleton for full-screen loading
  return (
    <div className="min-h-screen bg-canvas flex flex-col pt-32 pb-16 px-6 sm:px-8 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-brand-coral/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-8 flex-1 animate-pulse">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-10 w-64 bg-white border border-slate-100 rounded-2xl" />
          <div className="h-5 w-96 max-w-full bg-white/70 rounded-xl" />
        </div>

        {type === "finder" ? (
          <div className="flex flex-col items-center gap-8 w-full mt-6">
            <div className="flex gap-2 p-1.5 bg-white/60 border border-slate-100 rounded-full w-full max-w-md">
              <div className="h-8 flex-1 bg-white rounded-full" />
              <div className="h-8 flex-1 bg-white/40 rounded-full" />
              <div className="h-8 flex-1 bg-white/40 rounded-full" />
              <div className="h-8 flex-1 bg-white/40 rounded-full" />
            </div>

            <div className="w-full max-w-4xl flex flex-col items-center gap-10">
              <div className="w-[300px] h-[420px] sm:w-[340px] sm:h-[460px] bg-white border border-slate-100 rounded-[32px] shadow-lg flex flex-col justify-end p-6 gap-4">
                <div className="h-6 w-3/4 bg-slate-100 rounded-xl" />
                <div className="h-4 w-1/2 bg-slate-100/60 rounded-lg" />
                <div className="flex justify-between items-center mt-4">
                  <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                  <div className="h-10 w-10 bg-slate-100 rounded-full" />
                </div>
              </div>

              <div className="h-14 w-52 bg-white border border-slate-100 rounded-full shadow-sm" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mt-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 shadow-sm"
              >
                <div className="aspect-video w-full bg-slate-50 rounded-2xl" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-5 w-5/6 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-50 rounded-md" />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="h-9 w-20 bg-slate-100 rounded-lg" />
                  <div className="h-8 w-8 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
