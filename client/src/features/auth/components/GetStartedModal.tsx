"use client";

import * as React from "react";
import Image from "next/image";
import { GoogleSignInButton } from "./GoogleSignInButton";

export interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GetStartedModal({ isOpen, onClose, onSuccess }: GetStartedModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-canvas rounded-[24px] sm:rounded-[32px] border border-ink/5 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center gap-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-5 text-muted-text hover:text-ink transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-24 w-24 rounded-2xl overflow-hidden">
          <Image
            src="/images/jethiya-logo2.png"
            alt="Logo"
            fill
            className="object-cover"
          />
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
          <GoogleSignInButton onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
