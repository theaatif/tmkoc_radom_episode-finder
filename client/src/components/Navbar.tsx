"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { SignOutModal } from "@/features/auth/components/SignOutModal";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Gokuldham Stream", href: "/generate" },
    { name: "Favorites", href: "/favorites" },
    { name: "Watch History", href: "/history" },
  ];

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-40 w-full px-4 sm:px-6 md:px-8 pointer-events-none">
        <nav className="pointer-events-auto max-w-7xl mx-auto h-16 bg-brand-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full flex items-center justify-between px-4 sm:px-6 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_0_8px_24px_rgba(0,0,0,0.06)] relative">
        {/* Left: Branding & Jethiya Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-200/40 shadow-sm bg-brand-white/90">
              <Image
                src="/images/jethiya-logo2.png"
                alt="Jethiya Logo"
                fill
                sizes="32px"
                priority
                className="object-cover scale-110"
              />
            </div>
            <span className="font-display text-sm sm:text-base tracking-[-0.03em] text-ink font-bold group-hover:text-brand-cyan transition-colors">
              Gokuldham Stream
            </span>
          </Link>
        </div>

        {/* Center: Recessed Clay Segmented Nav Track (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/40 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.04)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-150 border ${
                  isActive
                    ? "bg-brand-white text-ink border border-slate-200/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    : "bg-transparent text-muted-text border-transparent hover:text-ink hover:bg-slate-50/50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth Profile Cluster / Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Profile Capsule */}
              <div className="bg-slate-100/60 border border-slate-200/40 rounded-full pl-1.5 pr-2.5 sm:pr-3 py-1 flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all hover:scale-[1.01]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl || "/api/placeholder/32/32"}
                  alt={user.name}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-slate-200/20 object-cover"
                />
                <span className="text-[10px] sm:text-xs font-bold text-ink hidden min-[380px]:inline max-w-[80px] sm:max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={() => setShowSignOutModal(true)}
                className="text-[10px] sm:text-xs font-bold text-brand-coral hover:text-red-700 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <GoogleSignInButton />
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden h-8 w-8 rounded-full border border-slate-200/50 bg-slate-100/60 shadow-sm flex items-center justify-center text-ink cursor-pointer hover:bg-slate-100/85 active:scale-95 transition-transform"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Collapsible Mobile Dropdown (White Liquid Glass Card) */}
        {isOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-brand-white/95 backdrop-blur-2xl border border-slate-200/55 rounded-[28px] p-3 shadow-lg flex flex-col gap-1.5 md:hidden pointer-events-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`w-full px-5 py-3 text-sm font-bold rounded-2xl transition-all duration-150 border ${
                    isActive
                      ? "bg-brand-cyan text-brand-white border-brand-cyan shadow-clay-cyan"
                      : "bg-transparent text-muted-text border-transparent hover:text-ink hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      </div>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          logout();
          setShowSignOutModal(false);
        }}
      />
    </>
  );
}
