import { env } from "@/config/env";
import { logger } from "@/lib/logger";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Tiny in-memory CSRF token cache
let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/csrf-token`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const data = await res.json();
  return data.csrfToken;
}

export async function getCsrfToken(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken().catch((err) => {
      csrfTokenPromise = null;
      throw err;
    });
  }
  return csrfTokenPromise;
}

// In-memory token refresh mechanism
async function refreshSession(): Promise<boolean> {
  try {
    const csrfToken = await getCsrfToken();
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }
    }
  } catch (error) {
    logger.error("Token refresh failed:", error);
  }
  setAccessToken(null);
  return false;
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && accessToken) {
    // Attempt silent refresh and retry once
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryHeaders = new Headers(options.headers);
      if (hasBody) {
        retryHeaders.set("Content-Type", "application/json");
      }
      if (accessToken) {
        retryHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
      const retryRes = await fetch(
        `${env.NEXT_PUBLIC_API_BASE_URL}${path}`,
        {
          ...options,
          credentials: "include",
          headers: retryHeaders,
        }
      );
      if (!retryRes.ok) {
        const retryContentType = retryRes.headers.get("content-type");
        const retryIsJson = retryContentType && retryContentType.includes("application/json");
        const body = retryIsJson ? await retryRes.json().catch(() => ({})) : {};
        throw new Error(body?.error?.code ?? "unauthorized");
      }
      const retryContentType = retryRes.headers.get("content-type");
      const retryIsJson = retryContentType && retryContentType.includes("application/json");
      return (retryIsJson ? await retryRes.json() : null) as T;
    }
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => ({})) : {};
    throw new Error(body?.error?.code ?? "unknown_error");
  }

  return (isJson ? await res.json() : null) as T;
}
