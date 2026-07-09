"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-slate-200/60 py-16 md:py-20 px-6 sm:px-8 bg-brand-white">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/tmkoc-footer.png"
          alt="Gokuldham Society Skyline Background"
          fill
          sizes="100vw"
          className="object-cover object-bottom opacity-40 select-none pointer-events-none"
        />
        {/* Soft overlay mask for optimal text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-white via-brand-white/95 to-brand-white/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12 md:gap-16">
        {/* Top Section: 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">

          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-7 w-7 rounded-full overflow-hidden border border-slate-200/40 shadow-sm bg-brand-white/90">
                <Image
                  src="/images/jethiya-logo2.png"
                  alt="Jethiya Logo"
                  fill
                  sizes="28px"
                  className="object-cover scale-110"
                />
              </div>
              <span className="font-display text-xl text-ink font-bold tracking-tight group-hover:text-brand-cyan transition-colors">
                Gokuldham Stream
              </span>
            </Link>
            <p className="text-sm text-muted-text leading-relaxed max-w-xs font-normal">
              The ultimate tracking & randomization companion for Taarak Mehta Ka Ooltah Chashmah enthusiasts. Track watch history, search, and randomize seamlessly.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {/* X (Twitter) */}
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on X"
                className="h-9 w-9 rounded-full bg-slate-100/80 hover:bg-ink text-slate-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-slate-200/40 hover:border-transparent hover:scale-105 active:scale-95"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch on YouTube"
                className="h-9 w-9 rounded-full bg-slate-100/80 hover:bg-red-600 text-slate-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-slate-200/40 hover:border-transparent hover:scale-105 active:scale-95"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm text-ink font-bold uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] font-bold text-muted-text">
              <li>
                <Link href="/" className="hover:text-brand-cyan transition-colors inline-flex items-center gap-1.5 group">
                  <span className="h-1 w-1 rounded-full bg-brand-cyan/40 group-hover:bg-brand-cyan transition-colors" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/generate" className="hover:text-brand-cyan transition-colors inline-flex items-center gap-1.5 group">
                  <span className="h-1 w-1 rounded-full bg-brand-cyan/40 group-hover:bg-brand-cyan transition-colors" />
                  Gokuldham Stream
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-brand-cyan transition-colors inline-flex items-center gap-1.5 group">
                  <span className="h-1 w-1 rounded-full bg-brand-cyan/40 group-hover:bg-brand-cyan transition-colors" />
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-brand-cyan transition-colors inline-flex items-center gap-1.5 group">
                  <span className="h-1 w-1 rounded-full bg-brand-cyan/40 group-hover:bg-brand-cyan transition-colors" />
                  Watch History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: FAQs */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm text-ink font-bold uppercase tracking-wider">
              FAQs
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">How does the Gokuldham Stream work?</span>
                <p className="text-[13px] text-muted-text leading-relaxed">It picks random unwatched episodes based on your selected era tags (Classic, Golden, Modern). Once you watch an episode, it won't be recommended again unlike YouTube, where the same content can reappear with different thumbnails.</p>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">Is my progress saved?</span>
                <p className="text-[13px] text-muted-text leading-relaxed">Yes! Signing in with Google automatically tracks your watch history in real time.</p>
              </li>
            </ul>
          </div>

          {/* Column 4: Gokuldham Facts */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm text-ink font-bold uppercase tracking-wider">
              Gokuldham Facts
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">World Record Sitcom</span>
                <p className="text-[13px] text-muted-text leading-relaxed">TMKOC holds the Guinness World Record for the longest-running daily sitcom by episode count.</p>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">First Broadcast Date</span>
                <p className="text-[13px] text-muted-text leading-relaxed">The show premiered on SAB TV on July 28, 2008, and continues to broadcast new stories.</p>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Divider & Disclaimer */}
        <div className="border-t border-slate-200/50 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-muted-text/80 font-normal">
            &copy; {new Date().getFullYear()} Gokuldham Stream. Developed by fans, for fans.
          </p>
          <p className="text-[11px] text-muted-text/70 max-w-md leading-relaxed md:text-right font-normal">
            Disclaimer: This is an unofficial portfolio project. All television characters, logos, audio/video assets, and name branding are trademarks of <span className="font-bold text-slate-600">Neela Film Productions</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
