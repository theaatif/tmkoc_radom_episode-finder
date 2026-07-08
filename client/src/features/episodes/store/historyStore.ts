"use client";

import { create } from "zustand";
import { Episode } from "../components/EpisodeGrid";
import { fetchWatchHistory, HistoryResponse } from "../episodes.api";

interface HistoryState {
  episodes: (Episode & { watchedAt: string })[];
  loading: boolean;
  error: string | null;
  pagination: HistoryResponse["pagination"];
  getHistory: (page?: number, limit?: number) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  episodes: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  getHistory: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchWatchHistory(page, limit);
      set({ episodes: data.episodes, pagination: data.pagination });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch watch history." });
    } finally {
      set({ loading: false });
    }
  },
}));
