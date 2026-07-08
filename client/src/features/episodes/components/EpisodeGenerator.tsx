"use client";

import * as React from "react";
import { useState } from "react";
import { useRandomEpisodes } from "@/features/episodes/hooks/useRandomEpisodes";
import { useFavorites } from "@/features/episodes/hooks/useFavorites";
import { fetchFavoriteIds } from "@/features/episodes/episodes.api";
import { EpisodeGrid, Episode } from "@/features/episodes/components/EpisodeGrid";
import { EpisodePlayer } from "@/features/episodes/components/EpisodePlayer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

export function EpisodeGenerator() {
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const {
    episodes,
    loading,
    error,
    isExhausted,
    fetchEpisodes,
  } = useRandomEpisodes();

  const { toggleFavorite } = useFavorites();

  // Lightweight fetch: only episode IDs for heart icon state
  useEffect(() => {
    fetchFavoriteIds().then(setFavoritedIds).catch(() => {});
  }, []);

  const handleToggleFavorite = async (episode: Episode, isFav: boolean) => {
    try {
      await toggleFavorite(episode, isFav);
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(episode.id);
        else next.add(episode.id);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const eras = [
    { id: "all", name: "All Eras" },
    { id: "classic", name: "Classic (Episodes 1-500)" },
    { id: "golden", name: "Golden Era (Episodes 501-1500)" },
    { id: "modern", name: "Modern Era (1500+)" },
  ];

  const handleGenerate = () => {
    const genreParam = selectedEra === "all" ? undefined : selectedEra;
    fetchEpisodes(genreParam);
  };

  return (
    <div className="flex flex-col space-y-12">
      {/* Header & Era Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline">
        <div>
          <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-brand-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm mb-2 inline-block">
            Smart Discovery
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold tracking-[-0.02em]">
            Unwatched Episode Finder
          </h1>
          <p className="text-sm text-muted-text mt-1 font-normal">
            Select your preferred era to filter random generation.
          </p>
        </div>

        {/* Category tabs (Claymorphic Segmented Control) */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-surface-card border border-hairline rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] select-none">
          {eras.map((era) => {
            const isActive = selectedEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-4 py-2 text-xs transition-all duration-150 rounded-full cursor-pointer border-0 ${
                  isActive
                    ? "bg-brand-cyan text-brand-white shadow-clay-cyan font-bold active:translate-y-[1px]"
                    : "bg-transparent text-muted-text font-semibold hover:text-ink hover:bg-canvas/50"
                }`}
              >
                {era.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Workspace */}
      <div className="min-h-[300px] flex flex-col justify-center items-center bg-canvas rounded-clay-xl border border-hairline p-8 md:p-12 relative overflow-hidden">
        
        {/* Visual background accents */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-brand-yellow/5 blur-3xl pointer-events-none" />

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <Spinner size="lg" className="border-t-brand-cyan" />
            <p className="text-sm font-medium text-muted-text animate-pulse">
              Selecting 4 random unwatched episodes...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center gap-4 py-12">
            <div className="h-12 w-12 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-ink">Generation Failed</h3>
            <p className="text-sm text-muted-text max-w-sm">
              {error === "unauthorized" 
                ? "You need to be logged in to access randomized custom history validation."
                : error}
            </p>
            <Button 
              onClick={handleGenerate} 
              variant="cyan" 
              className="mt-2"
            >
              Retry Generation
            </Button>
          </div>
        ) : isExhausted ? (
          <div className="flex flex-col items-center text-center gap-4 py-12 max-w-md">
            <div className="text-4xl text-brand-yellow">🏆</div>
            <h3 className="text-xl font-bold text-ink">You've watched everything!</h3>
            <p className="text-sm text-muted-text leading-relaxed font-normal">
              Congratulations! You've successfully finished every single episode in this era. Check back later for new episodes.
            </p>
          </div>
        ) : episodes.length > 0 ? (
          <div className="w-full flex flex-col space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-text">
                Generated Batch of 4
              </span>
              <Button
                onClick={handleGenerate}
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-brand-cyan hover:underline hover:bg-transparent"
              >
                Regenerate ↻
              </Button>
            </div>
            <EpisodeGrid
              episodes={episodes}
              onSelectEpisode={(ep) => setActiveEpisode(ep)}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-6 py-12">
            <div className="h-20 w-20 rounded-clay-lg bg-surface-soft border border-hairline flex items-center justify-center text-3xl shadow-sm text-brand-cyan">
              🍿
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-ink">
                Ready to watch?
              </h3>
              <p className="text-sm text-body-text mt-2 leading-relaxed font-normal">
                Click the button below to generate a brand-new batch of 4 random TMKOC episodes. We check your watch history to guarantee you won't get repeats.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              variant="cyan"
              size="lg"
              className="px-8 mt-2"
            >
              Generate 4 Random Episodes
            </Button>
          </div>
        )}
      </div>

      {/* Episode IFrame Player Modal */}
      {activeEpisode && (
        <EpisodePlayer
          videoId={activeEpisode.youtubeVideoId}
          episodeId={activeEpisode.id}
          onClose={() => setActiveEpisode(null)}
        />
      )}
    </div>
  );
}
