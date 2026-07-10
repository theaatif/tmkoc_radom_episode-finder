"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface SignInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function SignInSuccessModal({ isOpen, onClose, userName }: SignInSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm pointer-events-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-canvas rounded-[24px] sm:rounded-[32px] border border-ink/5 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center gap-6 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
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

        {/* Circular Bhide avatar at top */}
        <div className="relative z-10 h-32 w-32 rounded-full overflow-hidden border-2 border-brand-yellow/20 bg-brand-yellow/5 shadow-md flex items-center justify-center mt-4">
          <Image
            src="/images/bhide.png"
            alt="Atmaram Tukaram Bhide"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Text Details & Dialogue */}
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-widest uppercase text-brand-yellow bg-brand-yellow/10 px-3 py-1 rounded-full">
            Gokuldham Welcome
          </span>
          <h3 className="font-display text-2xl text-ink font-semibold tracking-tight mt-3">
            Sign In Successful!
          </h3>
          
          <div className="mt-4 p-4 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/10 relative">
            <span className="absolute -top-3 left-4 bg-canvas px-2 text-[10px] font-bold text-brand-yellow/80 uppercase tracking-wider">
              Bhide Says:
            </span>
            <p className="text-base font-display font-medium text-ink italic leading-relaxed">
              &quot;Mandala aapka aabhari hai, {userName || "mitra"}! 🙏&quot;
            </p>
            <p className="text-xs text-muted-text mt-2 leading-relaxed">
              Gokuldham Society ke ekmev secretary Atmaram Tukaram Bhide ki taraf se aapka swagat hai. Ab aapke unseen episodes aur favorites yahan surakshit rahenge!
            </p>
          </div>
          
          <p className="text-xs text-muted-text mt-4 italic leading-relaxed">
            &quot;Humare zamane mein toh aisi automatic systems nahi thi... par aap anand lijiye!&quot;
          </p>
        </div>

        {/* Confirm Button */}
        <div className="relative z-10 w-full pt-1">
          <Button
            type="button"
            onClick={onClose}
            variant="yellow"
            className="w-full text-sm sm:text-base px-8 py-2.5 shadow-clay-yellow hover:scale-[1.02]"
          >
            Chalo, Let&apos;s Play!
          </Button>
        </div>
      </div>
    </div>
  );
}
