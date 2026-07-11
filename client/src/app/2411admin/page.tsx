"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { useAdminDashboard } from "@/features/auth/hooks/useAdminDashboard";
import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";
import { AdminStatsOverview } from "@/features/auth/components/AdminStatsOverview";
import { AdminEntryLogs } from "@/features/auth/components/AdminEntryLogs";
import { AdminRegisteredMembers } from "@/features/auth/components/AdminRegisteredMembers";
import { AdminWatchHistory } from "@/features/auth/components/AdminWatchHistory";

export default function AdminStatsPage() {
  const router = useRouter();
  const {
    userIdInput,
    setUserIdInput,
    passwordInput,
    setPasswordInput,
    showPassword,
    setShowPassword,
    loginError,
    isAdminLoggedIn,
    activeTab,
    setActiveTab,
    loading,
    error,
    stats,
    handleLoginSubmit,
    handleLogout,
    loadStats,
  } = useAdminDashboard();

  return (
    <div className="flex flex-col flex-1 bg-[#fffaf0] min-h-screen">
      {/* Background Graphic */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 px-6 sm:px-8 bg-[#faf5e8] flex-1 overflow-hidden flex flex-col">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf5e8]/45 via-[#faf5e8]/80 to-[#faf5e8] z-10" />
          <Image
            src="/images/jetha-babita-daya.png"
            alt="TMKOC Background"
            fill
            sizes="100vw"
            className="object-cover object-top opacity-15 mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e5e5] mb-8">
            <div>
              <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm mb-2 inline-block">
                Bhide's Gokuldham Secretariat
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-[#0a0a0a] font-semibold tracking-[-0.02em]">
                {isAdminLoggedIn ? "Bhide's Gokuldham Entry Book" : "Secret Admin Portal"}
              </h1>
              <p className="text-sm text-muted-text mt-1 font-normal">
                {isAdminLoggedIn
                  ? "Real-time tracking of which residents visit the Gokuldham stream and when."
                  : "Authorized access only. Enter Bhide's login credentials to view the entry register."
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-xs font-bold py-2 border border-slate-200 shadow-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Button>
              {isAdminLoggedIn && (
                <Button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-bold py-2 bg-brand-coral border border-transparent shadow-sm text-white hover:bg-red-700 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out Admin
                </Button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-start">
            
            {/* If Admin is NOT logged in, show the login form */}
            {!isAdminLoggedIn ? (
              <AdminLoginForm
                userIdInput={userIdInput}
                setUserIdInput={setUserIdInput}
                passwordInput={passwordInput}
                setPasswordInput={setPasswordInput}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loginError={loginError}
                onSubmit={handleLoginSubmit}
              />
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-[#f5f0e0] border border-[#e5e5e5] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-4 py-20 flex-1">
                <div className="h-12 w-12 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Failed to load stats</h3>
                <p className="text-sm text-muted-text max-w-sm">{error}</p>
                <Button 
                  onClick={() => {
                    const cachedToken = sessionStorage.getItem("admin_auth_token");
                    if (cachedToken) loadStats(cachedToken);
                  }} 
                  variant="cyan" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {/* Stats Summary Cards */}
                <AdminStatsOverview stats={stats} />

                {/* Tabs Bar */}
                <div className="flex gap-6 mb-6 border-b border-[#e5e5e5]/80 pb-2">
                  <button
                    onClick={() => setActiveTab("entries")}
                    className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === "entries"
                        ? "border-[#0a0a0a] text-[#0a0a0a]"
                        : "border-transparent text-muted-text hover:text-[#0a0a0a]"
                    }`}
                  >
                    Entry Logs & Visitor Stats
                  </button>
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === "members"
                        ? "border-[#0a0a0a] text-[#0a0a0a]"
                        : "border-transparent text-muted-text hover:text-[#0a0a0a]"
                    }`}
                  >
                    👥 All Registered Members ({stats?.allUsers.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === "history"
                        ? "border-[#0a0a0a] text-[#0a0a0a]"
                        : "border-transparent text-muted-text hover:text-[#0a0a0a]"
                    }`}
                  >
                    🎬 Watch History ({stats?.recentWatches.length || 0})
                  </button>
                </div>

                {/* Tab content rendering */}
                {activeTab === "entries" && <AdminEntryLogs stats={stats} />}
                {activeTab === "members" && <AdminRegisteredMembers stats={stats} />}
                {activeTab === "history" && <AdminWatchHistory stats={stats} />}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
