"use client";

import { useState } from "react";
import { Episode } from "../components/EpisodeGrid";
import { generateEpisodes } from "../episodes.api";

// Module-level cache to persist state across page navigations
let cacheEpisodes: Episode[] | null = null;
let cacheExhausted = false;
let cacheGenre: string | undefined = undefined;

export function useRandomEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>(cacheEpisodes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExhausted, setIsExhausted] = useState(cacheExhausted);

  const fetchEpisodes = async (genre?: string, force = false) => {
    // If not forced and we have matching cached episodes, skip API request
    if (!force && cacheEpisodes !== null && cacheGenre === genre) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateEpisodes(genre);
      if (data.done) {
        setIsExhausted(true);
        setEpisodes([]);
        cacheExhausted = true;
        cacheEpisodes = [];
      } else {
        const newEpisodes = data.episodes || [];
        setEpisodes(newEpisodes);
        setIsExhausted(false);
        cacheExhausted = false;
        cacheEpisodes = newEpisodes;
      }
      cacheGenre = genre;
    } catch (err: any) {
      setError(err?.message || "Failed to generate episodes.");
    } finally {
      setLoading(false);
    }
  };

  return {
    episodes,
    loading,
    error,
    isExhausted,
    fetchEpisodes,
  };
}
