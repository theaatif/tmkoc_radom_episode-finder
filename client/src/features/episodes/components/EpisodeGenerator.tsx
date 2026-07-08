"use client";

import * as React from "react";
import { useEpisodeGenerator } from "@/features/episodes/hooks/useEpisodeGenerator";
import { Episode } from "@/features/episodes/components/EpisodeGrid";
import { EpisodeCardsDeck } from "@/features/episodes/components/EpisodeCardsDeck";
import { EpisodePlayer } from "@/features/episodes/components/EpisodePlayer";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// ==========================================
// Sub-Presenter Components (Separated UI)
// ==========================================

interface EraSelectorProps {
  eras: { id: string; name: string }[];
  selectedEra: string;
  onSelectEra: (id: string) => void;
}

export function EraSelector({ eras, selectedEra, onSelectEra }: EraSelectorProps) {
  return (
    <div className="w-full pb-4 mb-4 border-b border-hairline select-none z-10 flex flex-col items-center">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1.2s infinite ease-in-out;
        }
      `}</style>
      <div className="flex gap-1.5 p-1.5 bg-canvas/50 border border-hairline rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)] overflow-x-auto no-scrollbar max-w-full scroll-smooth mx-auto">
        {eras.map((era) => {
          const isActive = selectedEra === era.id;
          return (
            <button
              key={era.id}
              onClick={() => onSelectEra(era.id)}
              className={`px-4 py-2 text-xs transition-all duration-150 rounded-full cursor-pointer border-0 font-bold shrink-0 ${isActive
                  ? "bg-brand-cyan text-brand-white shadow-clay-cyan active:translate-y-[1px]"
                  : "bg-transparent text-muted-text hover:text-ink hover:bg-canvas/50"
                }`}
            >
              {era.name}
            </button>
          );
        })}
      </div>
      {/* Mobile Swipe Hint */}
      <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-[10px] font-bold text-muted-text/75 tracking-wider uppercase select-none animate-pulse">
        <span>Swipe left/right to view more eras</span>
        <svg className="h-3.5 w-3.5 text-brand-cyan animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );
}

export function EpisodeLoaderSkeleton() {
  return (
    <div className="w-full flex flex-col space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <div className="h-4 w-32 bg-slate-200/80 rounded-md animate-pulse" />
        <div className="h-9 w-36 bg-slate-200/80 rounded-full animate-pulse" />
      </div>

      {/* Deck Skeletons */}
      <div className="w-full py-4 flex items-center justify-center gap-6 overflow-hidden select-none pointer-events-none">
        {/* Card 1 (Visible on all screens) */}
        <div className="h-[290px] md:h-[324px] w-[260px] md:w-[280px] rounded-3xl md:rounded-[2rem] border border-slate-200/40 bg-surface-card p-4 flex flex-col justify-between animate-pulse shrink-0">
          <div className="aspect-video w-full bg-slate-200/60 rounded-2xl relative" />
          <div className="space-y-3 mt-4 flex-1">
            <div className="h-3 w-16 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-2/3 bg-slate-200/60 rounded-md" />
          </div>
          <div className="h-9 w-full bg-slate-200/60 rounded-xl mt-auto" />
        </div>

        {/* Card 2 (Visible on desktop only) */}
        <div className="hidden md:flex h-[324px] w-[280px] rounded-[2rem] border border-slate-200/40 bg-surface-card p-4 flex flex-col justify-between animate-pulse shrink-0 opacity-75">
          <div className="aspect-video w-full bg-slate-200/60 rounded-2xl relative" />
          <div className="space-y-3 mt-4 flex-1">
            <div className="h-3 w-16 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-2/3 bg-slate-200/60 rounded-md" />
          </div>
          <div className="h-9 w-full bg-slate-200/60 rounded-xl mt-auto" />
        </div>

        {/* Card 3 (Visible on desktop only) */}
        <div className="hidden lg:flex h-[324px] w-[280px] rounded-[2rem] border border-slate-200/40 bg-surface-card p-4 flex flex-col justify-between animate-pulse shrink-0 opacity-50">
          <div className="aspect-video w-full bg-slate-200/60 rounded-2xl relative" />
          <div className="space-y-3 mt-4 flex-1">
            <div className="h-3 w-16 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-200/60 rounded-md" />
            <div className="h-4 w-2/3 bg-slate-200/60 rounded-md" />
          </div>
          <div className="h-9 w-full bg-slate-200/60 rounded-xl mt-auto" />
        </div>
      </div>
    </div>
  );
}

interface EpisodeFailureStateProps {
  error: string;
  onRetry: () => void;
}

export function EpisodeFailureState({ error, onRetry }: EpisodeFailureStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-12">
      <div>
        <h3 className="text-lg font-bold text-ink">Finder Failure</h3>
        <p className="text-sm text-muted-text max-w-sm mt-1 leading-relaxed">
          {error === "unauthorized"
            ? "You need to be logged in to access randomized custom history validation."
            : error}
        </p>
      </div>
      <Button
        onClick={onRetry}
        variant="cyan"
        className="mt-2 font-bold px-6 shadow-clay-cyan"
      >
        Retry Discovery
      </Button>
    </div>
  );
}

export function EpisodeExhaustedState() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-12 max-w-md animate-fade-in">
      <h3 className="text-xl font-bold text-ink">You've finished this era!</h3>
      <p className="text-sm text-muted-text mt-2 leading-relaxed">
        You have successfully watched every single available episode in the selected era. Please choose another era to continue!
      </p>
    </div>
  );
}

interface EpisodeEmptyStateProps {
  onGenerate: () => void;
}

export function EpisodeEmptyState({ onGenerate }: EpisodeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-10 max-w-lg">
      <div className="relative group/icon cursor-pointer flex items-center justify-center h-20 w-20 rounded-[28px] bg-gradient-to-tr from-brand-white to-slate-50/80 border border-slate-200/60 shadow-lg shadow-slate-100/60 active:scale-95 transition-all duration-300">
        <div className="absolute inset-0.5 rounded-[26px] bg-gradient-to-tr from-brand-cyan/5 to-brand-yellow/5 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
        <svg
          className="h-8 w-8 text-brand-cyan group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-300 ease-out z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl md:text-3xl font-display font-semibold text-ink tracking-[-0.02em]">
          Ready to find unwatched episodes?
        </h3>
        <p className="text-sm text-muted-text leading-relaxed max-w-sm mx-auto">
          Choose your preferred era from the tabs above, then click below to fetch a batch of random unwatched episodes from our catalog.
        </p>
      </div>
      <Button
        onClick={onGenerate}
        variant="cyan"
        size="lg"
        className="px-10 py-6 text-sm font-bold shadow-clay-cyan hover:scale-[1.02] hover:shadow-cyan-100/50 hover:brightness-105 active:scale-[0.98] transition-all duration-200 rounded-full mt-2 cursor-pointer relative overflow-hidden group"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        <span className="relative z-10">Find Unwatched Episodes</span>
      </Button>
    </div>
  );
}

// ==========================================
// Parent Orchestrator Component
// ==========================================

export function EpisodeGenerator() {
  const {
    selectedEra,
    setSelectedEra,
    activeEpisode,
    favoritedIds,
    episodes,
    loading,
    error,
    isExhausted,
    handleToggleFavorite,
    handleGenerate,
    eras,
    handleSetActiveEpisode,
    handleEpisodeWatched,
  } = useEpisodeGenerator();

  return (
    <div className="flex flex-col space-y-6">
      {/* Header and Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-hairline">
        <div>
          <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-brand-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm mb-2 inline-block">
            Smart Discovery
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold tracking-[-0.02em]">
            Gokuldham Stream
          </h1>
          <p className="text-sm text-muted-text mt-1 font-normal">
            Select your preferred era to filter unseen Episode.
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Finder Console */}
      <div className="min-h-0 flex flex-col justify-start items-center bg-surface-card rounded-[32px] border border-slate-200/60 p-5 md:p-6 relative overflow-hidden shadow-lg shadow-slate-100/50">
        {/* Soft Decorative Glow Spots */}
        <div className="absolute top-[-100px] left-[-100px] h-64 w-64 rounded-full bg-brand-cyan/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] h-64 w-64 rounded-full bg-brand-yellow/5 blur-[80px] pointer-events-none" />

        {/* Category tabs */}
        <EraSelector eras={eras} selectedEra={selectedEra} onSelectEra={setSelectedEra} />

        {/* Loading and Result States */}
        {loading ? (
          <EpisodeLoaderSkeleton />
        ) : error ? (
          <EpisodeFailureState error={error} onRetry={handleGenerate} />
        ) : isExhausted ? (
          <EpisodeExhaustedState />
        ) : episodes.length > 0 ? (
          <div className="w-full flex flex-col space-y-6 animate-fade-in">
            {/* Header of Results */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Unwatched Episodes
              </span>
              <Button
                onClick={handleGenerate}
                variant="secondary"
                size="sm"
                className="group text-xs font-bold shadow-clay-white flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200/60 active:scale-95 transition-all whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <RefreshCw className="h-3.5 w-3.5 text-brand-cyan group-hover:rotate-180 transition-transform duration-500" />
                <span>Discover More</span>
              </Button>
            </div>

            {/* Reusable Deck */}
            <EpisodeCardsDeck
              episodes={episodes}
              onSelectEpisode={(ep) => handleSetActiveEpisode(ep)}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        ) : (
          <EpisodeEmptyState onGenerate={handleGenerate} />
        )}
      </div>

      {/* Episode IFrame Player Modal */}
      {activeEpisode && (
        <EpisodePlayer
          videoId={activeEpisode.youtubeVideoId}
          episodeId={activeEpisode.id}
          onClose={() => handleSetActiveEpisode(null)}
          onWatched={handleEpisodeWatched}
        />
      )}
    </div>
  );
}
