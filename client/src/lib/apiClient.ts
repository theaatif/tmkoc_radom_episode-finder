import { env } from "@/config/env";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// In-memory token refresh mechanism
async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
  setAccessToken(null);
  return false;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && accessToken) {
    // Attempt silent refresh and retry once
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Content-Type", "application/json");
      if (accessToken) {
        retryHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
      const retryRes = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
        ...options,
        headers: retryHeaders,
      });
      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({}));
        throw new Error(body?.error?.code ?? "unauthorized");
      }
      return (retryRes.status === 204 ? null : await retryRes.json()) as T;
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.code ?? "unknown_error");
  }

  return (res.status === 204 ? null : await res.json()) as T;
}
