"use client";

import * as React from "react";
import { useEffect, useState, useCallback, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GetStartedModal } from "@/features/auth/components/GetStartedModal";
import { fetchSharedFavorites } from "@/features/episodes/episodes.api";
import { EpisodeGrid, Episode } from "@/features/episodes/components/EpisodeGrid";
import { EpisodePlayer } from "@/features/episodes/components/EpisodePlayer";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { SessionLoader } from "@/components/ui/session-loader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface SharePageProps {
  params: Promise<{ shareToken: string }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { shareToken } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [ownerName, setOwnerName] = useState<string>("");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const loadSharedFavorites = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSharedFavorites(shareToken, page, 12);
      setOwnerName(data.ownerName);
      
      const mappedEpisodes: Episode[] = data.favorites.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        genre: ep.genre,
        thumbnailUrl: ep.thumbnailUrl,
        youtubeVideoId: ep.youtubeVideoId,
      }));
      
      setEpisodes(mappedEpisodes);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to load shared favorites.");
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowModal(true);
    } else if (isAuthenticated) {
      loadSharedFavorites(1);
    }
  }, [authLoading, isAuthenticated, loadSharedFavorites]);

  const handleAuthSuccess = useCallback(() => {
    setShowModal(false);
    loadSharedFavorites(1);
  }, [loadSharedFavorites]);

  const handlePageChange = (newPage: number) => {
    loadSharedFavorites(newPage);
  };

  if (authLoading) {
    return <SessionLoader type="grid" />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-canvas">
          <p className="text-sm font-medium text-muted-text">
            Please sign in to view shared favorites.
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
      {/* Main Container */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 px-6 sm:px-8 bg-surface-soft flex-1 overflow-hidden flex flex-col">
        {/* Background Accent */}
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
                Shared Collection
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold tracking-[-0.02em]">
                {ownerName ? `${ownerName}'s Favorites` : "Shared Favorites"}
              </h1>
              <p className="text-sm text-muted-text mt-1 font-normal">
                Curated and handpicked list of TMKOC episodes.
              </p>
            </div>
            {pagination.total > 0 && (
              <span className="text-xs font-bold text-ink bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/40">
                Total: {pagination.total} episodes
              </span>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-start">
            {loading ? (
              <PageSkeleton type="grid" />
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-4 py-20 flex-1">
                <div className="h-12 w-12 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-ink">Failed to load shared favorites</h3>
                <p className="text-sm text-muted-text max-w-sm">{error}</p>
                <Button onClick={() => loadSharedFavorites(1)} variant="cyan" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : episodes.length > 0 ? (
              <div className="flex flex-col space-y-8 flex-1">
                {/* Reusable Grid in Read-Only Mode (no onToggleFavorite passed) */}
                <EpisodeGrid
                  episodes={episodes}
                  onSelectEpisode={(ep) => setActiveEpisode(ep)}
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
                  📦
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">No public favorites</h3>
                  <p className="text-sm text-muted-text mt-2 leading-relaxed max-w-sm">
                    This user hasn't added any episodes to their favorites list yet.
                  </p>
                </div>
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
