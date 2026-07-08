"use client";

import Image from "next/image";
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
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 rounded-full overflow-hidden border border-slate-200/40 shadow-sm bg-brand-white/90">
                <Image
                  src="/images/jethiya-logo2.png"
                  alt="Jethiya Logo"
                  fill
                  sizes="28px"
                  className="object-cover scale-110"
                />
              </div>
              <span className="font-display text-xl text-ink font-bold tracking-tight">
                TMKOC Player
              </span>
            </div>
            <p className="text-sm text-muted-text leading-relaxed max-w-xs font-normal">
              The ultimate tracking & randomization companion for Taarak Mehta Ka Ooltah Chashmah enthusiasts. Track watch history, search, and randomize seamlessly.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-slate-100/80 hover:bg-brand-cyan/10 text-slate-600 hover:text-brand-cyan flex items-center justify-center transition-all duration-250 shadow-sm border border-slate-200/40">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-slate-100/80 hover:bg-brand-cyan/10 text-slate-600 hover:text-brand-cyan flex items-center justify-center transition-all duration-250 shadow-sm border border-slate-200/40">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-slate-100/80 hover:bg-brand-cyan/10 text-slate-600 hover:text-brand-cyan flex items-center justify-center transition-all duration-250 shadow-sm border border-slate-200/40">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: FAQs */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm text-ink font-bold uppercase tracking-wider">
              FAQs
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">How does the randomizer work?</span>
                <p className="text-[13px] text-muted-text leading-relaxed">It picks randomized episodes based on your selected era tags (Classic, Golden, Modern).</p>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">Is my progress saved?</span>
                <p className="text-[13px] text-muted-text leading-relaxed">Yes! Signing in with Google automatically tracks your watch history in real time.</p>
              </li>
            </ul>
          </div>

          {/* Column 3: Fun Facts */}
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

          {/* Column 4: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm text-ink font-bold uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2 text-[13px] font-bold text-muted-text">
              <li>
                <a href="#workspace" className="hover:text-brand-cyan transition-colors">
                  Randomize Engine
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-cyan transition-colors">
                  Watch History Tracker
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-cyan transition-colors">
                  Era Filters
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-cyan transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Divider & Disclaimer */}
        <div className="border-t border-slate-200/50 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-muted-text/80 font-normal">
            &copy; {new Date().getFullYear()} TMKOC Player. Developed by fans, for fans.
          </p>
          <p className="text-[11px] text-muted-text/70 max-w-md leading-relaxed md:text-right font-normal">
            Disclaimer: This is an unofficial portfolio project. All television characters, logos, audio/video assets, and name branding are trademarks of <span className="font-bold text-slate-600">Neela Film Productions</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
