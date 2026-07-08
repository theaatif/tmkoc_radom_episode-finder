"use client";

import { useState, useCallback } from "react";
import { Episode } from "../components/EpisodeGrid";
import { fetchWatchHistory, HistoryResponse } from "../episodes.api";

export function useWatchHistory() {
  const [episodes, setEpisodes] = useState<(Episode & { watchedAt: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<HistoryResponse["pagination"]>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const getHistory = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWatchHistory(page, limit);
      setEpisodes(data.episodes);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch watch history.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    episodes,
    loading,
    error,
    pagination,
    getHistory,
  };
}
