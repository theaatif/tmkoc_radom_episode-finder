import { useState, useEffect } from "react";
import { useRandomEpisodes } from "./useRandomEpisodes";
import { useFavorites } from "./useFavorites";
import { fetchFavoriteIds } from "../episodes.api";
import { Episode } from "../components/EpisodeGrid";

// Module-level cache for the selected era tab
let cacheSelectedEra = "all";

export function useEpisodeGenerator() {
  const [selectedEra, setSelectedEraInternal] = useState<string>(cacheSelectedEra);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const setSelectedEra = (era: string) => {
    cacheSelectedEra = era;
    setSelectedEraInternal(era);
  };

  const {
    episodes,
    loading,
    error,
    isExhausted,
    fetchEpisodes,
  } = useRandomEpisodes();

  const { toggleFavorite } = useFavorites();

  // Load only favorited episode IDs on mount to display filled heart icons
  useEffect(() => {
    fetchFavoriteIds().then(setFavoritedIds).catch(() => {});
  }, []);

  // Automatically trigger discovery when selectedEra changes (uses cache unless forced)
  useEffect(() => {
    const genreParam = selectedEra === "all" ? undefined : selectedEra;
    fetchEpisodes(genreParam);
  }, [selectedEra]);

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

  const handleGenerate = () => {
    const genreParam = selectedEra === "all" ? undefined : selectedEra;
    fetchEpisodes(genreParam, true); // Pass force = true to bypass cache and pull new episodes
  };

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
  };
}
