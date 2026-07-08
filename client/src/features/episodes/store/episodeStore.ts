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
  activeEpisode: Episode | null;
  favoritedIds: Set<string>;
  episodes: Episode[];
  loading: boolean;
  error: string | null;
  isExhausted: boolean;
  
  // Independent caches for each era
  eraCache: Record<string, Episode[]>;
  eraExhausted: Record<string, boolean>;
  
  // Actions
  setSelectedEra: (era: string) => void;
  setActiveEpisode: (episode: Episode | null) => void;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (episode: Episode, isFav: boolean) => Promise<void>;
  fetchEpisodes: (genre?: string, force?: boolean) => Promise<void>;
  invalidateEpisodes: () => void;
}

export const useEpisodeStore = create<EpisodeState>((set, get) => ({
  selectedEra: "all",
  activeEpisode: null,
  favoritedIds: new Set<string>(),
  episodes: [],
  loading: false,
  error: null,
  isExhausted: false,
  
  eraCache: {},
  eraExhausted: {},

  setSelectedEra: (era) => set({ selectedEra: era }),
  setActiveEpisode: (episode) => set({ activeEpisode: episode }),

  loadFavorites: async () => {
    try {
      const ids = await fetchFavoriteIds();
      set({ favoritedIds: ids });
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
    const { eraCache, eraExhausted } = get();
    const currentGenre = genre === undefined ? "all" : genre;
    
    // Check if we have cached episodes for the target era
    const cachedEpisodes = eraCache[currentGenre];
    const hasCache = cachedEpisodes !== undefined && (cachedEpisodes.length > 0 || eraExhausted[currentGenre]);

    // Cache hit: if not forced and cached data exists, load it immediately without API request
    if (!force && hasCache) {
      set({
        episodes: cachedEpisodes,
        isExhausted: eraExhausted[currentGenre] || false,
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await generateEpisodes(genre);
      
      const newEpisodes = data.episodes || [];
      const isExh = !!data.done;

      set((state) => ({
        episodes: newEpisodes,
        isExhausted: isExh,
        eraCache: {
          ...state.eraCache,
          [currentGenre]: newEpisodes,
        },
        eraExhausted: {
          ...state.eraExhausted,
          [currentGenre]: isExh,
        },
      }));
    } catch (err: any) {
      set({ error: err?.message || "Failed to generate episodes." });
    } finally {
      set({ loading: false });
    }
  },

  invalidateEpisodes: () => {
    const { selectedEra } = get();
    set((state) => {
      const nextCache = { ...state.eraCache };
      delete nextCache[selectedEra];
      const nextExhausted = { ...state.eraExhausted };
      delete nextExhausted[selectedEra];
      return {
        episodes: [],
        isExhausted: false,
        eraCache: nextCache,
        eraExhausted: nextExhausted,
      };
    });
  },
}));
