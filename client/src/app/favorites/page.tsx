"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GetStartedModal } from "@/features/auth/components/GetStartedModal";
import { useFavorites } from "@/features/episodes/hooks/useFavorites";
import { Episode } from "@/features/episodes/components/EpisodeGrid";
import { FavoritesPinterestCarousel } from "@/features/episodes/components/FavoritesPinterestCarousel";
import { EpisodePlayer } from "@/features/episodes/components/EpisodePlayer";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { SessionLoader } from "@/components/ui/session-loader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);

  const {
    favorites,
    loading: favoritesLoading,
    error,
    pagination,
    getFavorites,
    toggleFavorite,
  } = useFavorites();

  const handleAuthSuccess = useCallback(() => {
    setShowModal(false);
    getFavorites(1, 12);
  }, [getFavorites]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowModal(true);
    } else if (isAuthenticated) {
      getFavorites(1, 12);
    }
  }, [authLoading, isAuthenticated, getFavorites]);

  const handleToggleFavorite = async (episode: Episode, isFav: boolean) => {
    try {
      await toggleFavorite(episode, isFav);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleCopyShareLink = () => {
    if (!user?.shareToken) return;
    const shareUrl = `${window.location.origin}/share/${user.shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePageChange = (newPage: number) => {
    getFavorites(newPage, 12);
  };

  const favoritedIds = React.useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  if (authLoading) {
    return <SessionLoader type="grid" />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-canvas">
          <p className="text-sm font-medium text-muted-text">
            Please sign in to access your favorites.
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
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 px-6 sm:px-8 bg-surface-soft flex-1 overflow-hidden flex flex-col">
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-hairline mb-8">
            <div>
              <span className="text-[10px] font-bold text-brand-cyan tracking-[0.15em] uppercase bg-brand-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm mb-2 inline-block">
                Curated Collection
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold tracking-[-0.02em]">
                Your Favorites
              </h1>
              <p className="text-sm text-muted-text mt-1 font-normal">
                All your saved episodes in one place.
              </p>
            </div>
            {favorites.length > 0 && user?.shareToken && (
              <Button
                variant="cyan"
                onClick={handleCopyShareLink}
                className="cursor-pointer font-bold shadow-clay-cyan shrink-0 self-start sm:self-end"
              >
                {copied ? "✓ Copied Link!" : "🔗 Share Favorites"}
              </Button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-start">
            {favoritesLoading ? (
              <PageSkeleton type="grid" />
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-4 py-20 flex-1">
                <div className="h-12 w-12 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-ink">Failed to load favorites</h3>
                <p className="text-sm text-muted-text max-w-sm">{error}</p>
                <Button onClick={() => getFavorites(1, 12)} variant="cyan" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : favorites.length > 0 ? (
              <div className="flex flex-col space-y-8 flex-1">
                {/* Pinterest Carousel Layout */}
                <FavoritesPinterestCarousel
                  episodes={favorites}
                  onSelectEpisode={(ep) => setActiveEpisode(ep)}
                  favoritedIds={favoritedIds}
                  onToggleFavorite={handleToggleFavorite}
                />

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
                  💖
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">No favorites yet</h3>
                  <p className="text-sm text-muted-text mt-2 leading-relaxed max-w-sm">
                    Go back to the homepage, generate some random episodes, and click the heart icon on your favorite ones to save them here!
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
