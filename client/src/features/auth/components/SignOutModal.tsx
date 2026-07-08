"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-canvas rounded-[24px] sm:rounded-[32px] border border-ink/5 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center gap-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-5 right-5 text-muted-text hover:text-ink transition-colors cursor-pointer z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Circular Bapuji avatar at top */}
        <div className="relative z-10 h-32 w-32 rounded-full overflow-hidden border-2 border-brand-coral/20 bg-brand-coral/5 shadow-md flex items-center justify-center mt-4">
          <Image
            src="/images/bapuji-angry.png"
            alt="Bapuji Angry"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10">
          <h3 className="font-display text-2xl text-ink font-semibold tracking-tight">
            Sign Out
          </h3>
          <p className="text-sm text-muted-text mt-2 leading-relaxed">
            Are you sure you want to sign out? You&apos;ll need to sign in again to access your history and play unseen episodes.
          </p>
        </div>

        <div className="relative z-10 w-full pt-1 flex flex-col gap-3">
          <Button
            type="button"
            onClick={onConfirm}
            variant="coral"
            className="w-full text-sm sm:text-base px-8 py-2.5"
          >
            Yes, Sign Out
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="w-full text-sm sm:text-base px-8 py-2.5"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
