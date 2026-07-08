"use client";

import React from "react";
import { PageSkeleton } from "./page-skeleton";
import { Spinner } from "./spinner";

interface SessionLoaderProps {
  type?: "finder" | "grid";
}

export function SessionLoader({ type = "finder" }: SessionLoaderProps) {
  return (
    <>
      {/* Mobile Screen: Show the white/ivory screenshot skeleton loader */}
      <div className="block md:hidden min-h-screen bg-[#FCFBF7]">
        <PageSkeleton type={type} isMobileOnly={true} />
      </div>

      {/* Big/Desktop Screen: Show standard spinner, no skeleton loader */}
      <div className="hidden md:flex flex-col items-center justify-center min-h-screen bg-canvas">
        <Spinner size="lg" className="border-t-brand-cyan" />
        <p className="text-sm font-medium text-muted-text mt-4 animate-pulse">
          Verifying your session...
        </p>
      </div>
    </>
  );
}
