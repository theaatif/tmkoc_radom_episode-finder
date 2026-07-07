"use client";

import { useState } from "react";
import { Episode } from "../components/EpisodeGrid";
import { generateEpisodes } from "../episodes.api";

export function useRandomEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExhausted, setIsExhausted] = useState(false);

  const fetchEpisodes = async (genre?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateEpisodes(genre);
      if (data.done) {
        setIsExhausted(true);
        setEpisodes([]);
      } else {
        setEpisodes(data.episodes || []);
        setIsExhausted(false);
      }
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
