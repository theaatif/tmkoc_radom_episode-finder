"use client";

import { create } from "zustand";
import { Episode } from "../components/EpisodeGrid";
import {
  generateEpisodes,
  fetchFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../episodes.api";
import { logger } from "@/lib/logger";

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
  markEpisodeWatched: (episodeId: string) => void;
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
      logger.error("Failed to fetch favorite IDs:", err);
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
      logger.error("Failed to toggle favorite:", err);
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
    // Only clear the cache so the next fetch/era-switch is fresh.
    // Do NOT wipe the currently displayed episodes — the user should
    // still see the deck they were browsing after closing the player.
    set((state) => {
      const nextCache = { ...state.eraCache };
      delete nextCache[selectedEra];
      const nextExhausted = { ...state.eraExhausted };
      delete nextExhausted[selectedEra];
      return {
        eraCache: nextCache,
        eraExhausted: nextExhausted,
      };
    });
  },

  markEpisodeWatched: (episodeId: string) => {
    const { selectedEra } = get();
    set((state) => {
      const filtered = state.episodes.filter((ep) => ep.id !== episodeId);
      // Also update the cache so switching eras and back stays consistent
      const nextCache = { ...state.eraCache };
      const cacheKey = selectedEra === "all" ? "all" : selectedEra;
      if (nextCache[cacheKey]) {
        nextCache[cacheKey] = nextCache[cacheKey].filter((ep) => ep.id !== episodeId);
      }
      return {
        episodes: filtered,
        eraCache: nextCache,
      };
    });
  },
}));
