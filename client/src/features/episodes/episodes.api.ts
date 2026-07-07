import { request } from "@/lib/apiClient";
import { Episode } from "./components/EpisodeGrid";

export interface GenerateResponse {
  episodes?: Episode[];
  remaining?: number;
  done?: boolean;
}

export async function generateEpisodes(genre?: string): Promise<GenerateResponse> {
  const query = genre ? `?genre=${encodeURIComponent(genre)}` : "";
  return request<GenerateResponse>(`/episodes/generate${query}`);
}

export async function markWatched(episodeId: string): Promise<void> {
  return request<void>(`/episodes/${encodeURIComponent(episodeId)}/watch`, {
    method: "POST",
  });
}

export async function fetchWatchHistory(): Promise<Episode[]> {
  return request<Episode[]>("/episodes/history");
}
