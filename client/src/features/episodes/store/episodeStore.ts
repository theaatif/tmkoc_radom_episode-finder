"use client";

import { create } from "zustand";
import { Episode } from "../components/EpisodeGrid";
import {
  generateEpisodes,
  fetchFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../episodes.api";

interface EpisodeState {
  selectedEra: string;
  loadedGenre: string | null; // Tracks the genre of the episodes currently in memory
  activeEpisode: Episode | null;
  favoritedIds: Set<string>;
  episodes: Episode[];
  loading: boolean;
  error: string | null;
  isExhausted: boolean;
  
  // Actions
  setSelectedEra: (era: string) => void;
  setActiveEpisode: (episode: Episode | null, onWatched?: () => void) => void;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (episode: Episode, isFav: boolean) => Promise<void>;
  fetchEpisodes: (genre?: string, force?: boolean) => Promise<void>;
  invalidateEpisodes: () => void;
}

export const useEpisodeStore = create<EpisodeState>((set, get) => ({
  selectedEra: "all",
  loadedGenre: null,
  activeEpisode: null,
  favoritedIds: new Set<string>(),
  episodes: [],
  loading: false,
  error: null,
  isExhausted: false,

  setSelectedEra: (era) => set({ selectedEra: era }),
  setActiveEpisode: (episode) => set({ activeEpisode: episode }),

  loadFavorites: async () => {
    try {
      const ids = await fetchFavoriteIds();
      const current = get().favoritedIds;
      // Avoid spurious re-renders — only set if content actually changed
      if (ids.size !== current.size || [...ids].some((id) => !current.has(id))) {
        set({ favoritedIds: ids });
      }
    } catch (err) {
      console.error("Failed to fetch favorite IDs:", err);
    }
  },

  toggleFavorite: async (episode, isFav) => {
    try {
      if (isFav) {
        await removeFavorite(episode.id);
        set((state) => {
          const next = new Set(state.favoritedIds);
          next.delete(episode.id);
          return { favoritedIds: next };
        });
      } else {
        await addFavorite(episode.id);
        set((state) => {
          const next = new Set(state.favoritedIds);
          next.add(episode.id);
          return { favoritedIds: next };
        });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      throw err;
    }
  },

  fetchEpisodes: async (genre, force = false) => {
    const { episodes, loadedGenre } = get();
    const currentGenre = genre === undefined ? "all" : genre;
    
    const isCached = episodes.length > 0 && loadedGenre === currentGenre;
    if (!force && isCached) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await generateEpisodes(genre);
      if (data.done) {
        set({ isExhausted: true, episodes: [], loadedGenre: currentGenre });
      } else {
        set({ episodes: data.episodes || [], isExhausted: false, loadedGenre: currentGenre });
      }
    } catch (err: any) {
      set({ error: err?.message || "Failed to generate episodes." });
    } finally {
      set({ loading: false });
    }
  },

  invalidateEpisodes: () => {
    set({ loadedGenre: null, episodes: [], isExhausted: false });
  },
}));
