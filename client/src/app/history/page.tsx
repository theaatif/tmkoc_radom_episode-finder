"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GetStartedModal } from "@/features/auth/components/GetStartedModal";
import { useWatchHistory } from "@/features/episodes/hooks/useWatchHistory";
import { EpisodePlayer } from "@/features/episodes/components/EpisodePlayer";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useFavorites } from "@/features/episodes/hooks/useFavorites";
import { fetchFavoriteIds } from "@/features/episodes/episodes.api";
import { Heart } from "lucide-react";

function WatchedDate({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>&nbsp;</>;
  return <>{new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}</>;
}

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<{ id: string; youtubeVideoId: string } | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const {
    episodes,
    loading: historyLoading,
    error,
    pagination,
    getHistory,
  } = useWatchHistory();

  const { toggleFavorite } = useFavorites();

  // Lightweight favorite IDs for heart icon state
  useEffect(() => {
    fetchFavoriteIds().then(setFavoritedIds).catch(() => {});
  }, []);

  const handleToggleFavorite = async (episodeId: string, isFav: boolean) => {
    try {
      await toggleFavorite({ id: episodeId } as any, isFav);
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(episodeId);
        else next.add(episodeId);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleAuthSuccess = useCallback(() => {
    setShowModal(false);
    getHistory(1, 12);
  }, [getHistory]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowModal(true);
    } else if (isAuthenticated) {
      getHistory(1, 12);
    }
  }, [authLoading, isAuthenticated, getHistory]);

  const handlePageChange = (newPage: number) => {
    getHistory(newPage, 12);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-canvas">
        <Spinner size="lg" className="border-t-brand-cyan" />
        <p className="text-sm font-medium text-muted-text mt-4 animate-pulse">
          Verifying your session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-canvas">
          <p className="text-sm font-medium text-muted-text">
            Please sign in to access your watch history.
          </p>
        </div>
        <GetStartedModal
          isOpen={showModal}
          onClose={() => router.replace("/")}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-canvas min-h-screen">
      {/* Header and Background Banner */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-20 px-6 sm:px-8 bg-surface-soft flex-1 overflow-hidden flex flex-col">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-surface-soft/45 via-surface-soft/80 to-surface-soft z-10" />
          <Image
            src="/images/jetha-babita-daya.png"
            alt="TMKOC Background"
            fill
            sizes="100vw"
            className="object-cover object-top opacity-20 mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline mb-8">
            <div>
              <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-brand-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm mb-2 inline-block">
                Your Progress
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold tracking-[-0.02em]">
                Watch History
              </h1>
              <p className="text-sm text-muted-text mt-1 font-normal">
                Relive the episodes you have already watched.
              </p>
            </div>
            {pagination.total > 0 && (
              <span className="text-xs font-bold text-ink bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/40">
                Total Watched: {pagination.total} episodes
              </span>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-start">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-20 flex-1">
                <Spinner size="lg" className="border-t-brand-cyan" />
                <p className="text-sm font-medium text-muted-text mt-4 animate-pulse">
                  Loading watch history...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-4 py-20 flex-1">
                <div className="h-12 w-12 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-ink">Failed to load history</h3>
                <p className="text-sm text-muted-text max-w-sm">{error}</p>
                <Button onClick={() => getHistory(1, 12)} variant="cyan" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : episodes.length > 0 ? (
              <div className="flex flex-col space-y-8 flex-1">
                {/* Episodes Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {episodes.map((episode) => (
                    <Card
                      key={episode.id + "-" + episode.watchedAt}
                      className="cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md border border-hairline bg-surface-card hover:bg-brand-white"
                      onClick={() =>
                        setActiveEpisode({
                          id: episode.id,
                          youtubeVideoId: episode.youtubeVideoId,
                        })
                      }
                    >
                      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={episode.thumbnailUrl || `https://img.youtube.com/vi/${episode.youtubeVideoId}/0.jpg`}
                          alt={episode.title}
                          className="h-full w-full object-cover"
                        />

                        {/* Heart Button Overlay */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const isFav = favoritedIds.has(episode.id);
                            handleToggleFavorite(episode.id, isFav);
                          }}
                          className="absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all border shadow-sm bg-black/40 border-white/10 text-white/80 hover:bg-black/60 hover:text-white"
                          aria-label={favoritedIds.has(episode.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart
                            className={`h-4 w-4 ${favoritedIds.has(episode.id) ? "fill-brand-coral text-brand-coral" : ""}`}
                          />
                        </button>

                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-brand-white px-2 py-0.5 rounded text-[10px] font-bold">
                          Watched
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-text">
                          <span>{episode.genre}</span>
                          <span className="normal-case text-[10px] text-zinc-400 font-medium">
                          <WatchedDate date={episode.watchedAt} />
                        </span>
                        </div>
                        <CardTitle className="mt-1.5 text-sm line-clamp-2 leading-snug font-bold text-ink">
                          {episode.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-hairline mt-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="cursor-pointer"
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-muted-text">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-6 py-20 bg-surface-card rounded-clay-lg border border-hairline p-8 max-w-lg mx-auto w-full">
                <div className="h-16 w-16 rounded-clay-md bg-surface-soft border border-hairline flex items-center justify-center text-2xl shadow-sm text-brand-cyan">
                  🎬
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">No watch history yet</h3>
                  <p className="text-sm text-muted-text mt-2 leading-relaxed max-w-sm">
                    Go generate some random episodes, watch them on our player, and your history will be populated here!
                  </p>
                </div>
                <Button onClick={() => router.push("/generate")} variant="cyan" className="px-6">
                  Go to Generator
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {activeEpisode && (
        <EpisodePlayer
          videoId={activeEpisode.youtubeVideoId}
          episodeId={activeEpisode.id}
          onClose={() => setActiveEpisode(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
