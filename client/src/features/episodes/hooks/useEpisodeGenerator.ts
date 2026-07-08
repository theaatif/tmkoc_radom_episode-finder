import { useEffect, useCallback } from "react";
import { useEpisodeStore } from "../store/episodeStore";
import { Episode } from "../components/EpisodeGrid";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { logger } from "@/lib/logger";

export function useEpisodeGenerator() {
  const { isAuthenticated } = useAuth();
  const selectedEra = useEpisodeStore((state) => state.selectedEra);
  const setSelectedEra = useEpisodeStore((state) => state.setSelectedEra);
  const activeEpisode = useEpisodeStore((state) => state.activeEpisode);
  const setActiveEpisode = useEpisodeStore((state) => state.setActiveEpisode);
  const favoritedIds = useEpisodeStore((state) => state.favoritedIds);
  const episodes = useEpisodeStore((state) => state.episodes);
  const loading = useEpisodeStore((state) => state.loading);
  const error = useEpisodeStore((state) => state.error);
  const isExhausted = useEpisodeStore((state) => state.isExhausted);
  const loadFavorites = useEpisodeStore((state) => state.loadFavorites);
  const toggleFavorite = useEpisodeStore((state) => state.toggleFavorite);
  const fetchEpisodes = useEpisodeStore((state) => state.fetchEpisodes);
  const invalidateEpisodes = useEpisodeStore((state) => state.invalidateEpisodes);

  // Sync favorites on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [loadFavorites, isAuthenticated]);

  // Fetch episodes automatically when selectedEra changes
  useEffect(() => {
    if (isAuthenticated) {
      const genreParam = selectedEra === "all" ? undefined : selectedEra;
      fetchEpisodes(genreParam);
    }
  }, [selectedEra, fetchEpisodes, isAuthenticated]);

  const handleToggleFavorite = async (episode: Episode, isFav: boolean) => {
    try {
      await toggleFavorite(episode, isFav);
    } catch (err) {
      logger.error("Failed to toggle favorite:", err);
    }
  };

  const handleGenerate = () => {
    const genreParam = selectedEra === "all" ? undefined : selectedEra;
    fetchEpisodes(genreParam, true); // Force bypass cache for shuffles
  };

  const handleSetActiveEpisode = useCallback((ep: Episode | null) => {
    setActiveEpisode(ep);
  }, [setActiveEpisode]);

  const handleEpisodeWatched = useCallback(() => {
    invalidateEpisodes();
  }, [invalidateEpisodes]);

  const eras = [
    { id: "all", name: "All Eras" },
    { id: "classic", name: "Classic (Episodes 1-500)" },
    { id: "golden", name: "Golden Era (Episodes 501-1500)" },
    { id: "modern", name: "Modern Era (1500+)" },
  ];

  return {
    selectedEra,
    setSelectedEra,
    activeEpisode,
    setActiveEpisode,
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
  };
}
