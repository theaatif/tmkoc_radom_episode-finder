"use client";

import { useHistoryStore } from "../store/historyStore";

export function useWatchHistory() {
  const episodes = useHistoryStore((state) => state.episodes);
  const loading = useHistoryStore((state) => state.loading);
  const error = useHistoryStore((state) => state.error);
  const pagination = useHistoryStore((state) => state.pagination);
  const getHistory = useHistoryStore((state) => state.getHistory);

  return {
    episodes,
    loading,
    error,
    pagination,
    getHistory,
  };
}
