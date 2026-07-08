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

export interface HistoryResponse {
  episodes: (Episode & { watchedAt: string })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchWatchHistory(page = 1, limit = 20): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/episodes/history?page=${page}&limit=${limit}`);
}

export interface FavoritesResponse {
  favorites: Episode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SharedFavoritesResponse {
  ownerName: string;
  favorites: { title: string; genre: string; thumbnailUrl: string }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchFavorites(page = 1, limit = 20): Promise<FavoritesResponse> {
  return request<FavoritesResponse>(`/favorites?page=${page}&limit=${limit}`);
}

export async function addFavorite(episodeId: string): Promise<void> {
  return request<void>(`/favorites/${encodeURIComponent(episodeId)}`, {
    method: "POST",
  });
}

export async function removeFavorite(episodeId: string): Promise<void> {
  return request<void>(`/favorites/${encodeURIComponent(episodeId)}`, {
    method: "DELETE",
  });
}

export interface CreateSharedPlaylistResponse {
  playlistId: string;
}

export async function createSharedPlaylist(): Promise<CreateSharedPlaylistResponse> {
  return request<CreateSharedPlaylistResponse>('/share', { method: 'POST' });
}

export async function fetchSharedFavorites(shareId: string, page = 1, limit = 20): Promise<SharedFavoritesResponse> {
  return request<SharedFavoritesResponse>(`/share/${encodeURIComponent(shareId)}?page=${page}&limit=${limit}`);
}

/**
 * Lightweight fetch of only favorited episode IDs — avoids loading full
 * episode objects just to render heart icons on the generator page.
 */
export async function fetchFavoriteIds(): Promise<Set<string>> {
  // Fetch first page — if user has more favorites, keep fetching until exhausted
  const ids = new Set<string>();
  let page = 1;
  while (true) {
    const data = await request<FavoritesResponse>(`/favorites?page=${page}&limit=500&idsOnly=true`);
    for (const f of data.favorites) ids.add(f.id);
    if (page >= data.pagination.totalPages) break;
    page++;
  }
  return ids;
}

