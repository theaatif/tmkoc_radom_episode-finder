"use client";

import { useState, useCallback } from "react";
import { Episode } from "../components/EpisodeGrid";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  FavoritesResponse,
} from "../episodes.api";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<FavoritesResponse["pagination"]>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const getFavorites = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFavorites(page, limit);
      setFavorites(data.favorites);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch favorites.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (episode: Episode, isFav: boolean) => {
      setError(null);
      try {
        if (isFav) {
          await removeFavorite(episode.id);
          setFavorites((prev) => prev.filter((item) => item.id !== episode.id));
          setPagination((prev) => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
          }));
        } else {
          await addFavorite(episode.id);
          // Prepend — server sorts by addedAt descending
          setFavorites((prev) => [episode, ...prev]);
          setPagination((prev) => ({
            ...prev,
            total: prev.total + 1,
          }));
        }
      } catch (err: any) {
        setError(err?.message || "Failed to update favorite status.");
        throw err;
      }
    },
    []
  );

  return {
    favorites,
    loading,
    error,
    pagination,
    getFavorites,
    toggleFavorite,
  };
}
