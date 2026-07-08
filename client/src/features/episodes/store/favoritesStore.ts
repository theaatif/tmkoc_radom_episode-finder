"use client";

import { create } from "zustand";
import { Episode } from "../components/EpisodeGrid";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  FavoritesResponse,
} from "../episodes.api";

interface FavoritesState {
  favorites: Episode[];
  loading: boolean;
  error: string | null;
  pagination: FavoritesResponse["pagination"];
  getFavorites: (page?: number, limit?: number) => Promise<void>;
  toggleFavorite: (episode: Episode, isFav: boolean) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favorites: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  getFavorites: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchFavorites(page, limit);
      set({ favorites: data.favorites, pagination: data.pagination });
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch favorites." });
    } finally {
      set({ loading: false });
    }
  },

  toggleFavorite: async (episode, isFav) => {
    set({ error: null });
    try {
      if (isFav) {
        await removeFavorite(episode.id);
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== episode.id),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1),
          },
        }));
      } else {
        await addFavorite(episode.id);
        set((state) => ({
          favorites: [episode, ...state.favorites],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1,
          },
        }));
      }
    } catch (err: any) {
      set({ error: err?.message || "Failed to update favorite status." });
      throw err;
    }
  },
}));
