import { request } from "@/lib/apiClient";

export interface VisitorUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt?: string;
}

export interface FrequentVisitor {
  userId: string;
  visitCount: number;
  lastVisitedAt: string;
  user: VisitorUser;
}

export interface RecentVisit {
  id: string;
  visitedAt: string;
  ip: string;
  userAgent: string;
  user: VisitorUser | null;
}

export interface WatchHistoryEntry {
  id: string;
  watchedAt: string;
  lastPositionSeconds: number;
  user: {
    id: string;
    name: string;
  };
  episode: {
    id: string;
    title: string;
    episodeNumber: number | null;
  };
}

export interface VisitStatsResponse {
  frequentVisitors: FrequentVisitor[];
  recentVisits: RecentVisit[];
  allUsers: VisitorUser[];
  recentWatches: WatchHistoryEntry[];
}

export async function fetchVisitStats(basicAuthToken?: string): Promise<VisitStatsResponse> {
  const headers: Record<string, string> = {};
  if (basicAuthToken) {
    headers["Authorization"] = `Basic ${basicAuthToken}`;
  }
  return request<VisitStatsResponse>("/auth/visits", { headers });
}
