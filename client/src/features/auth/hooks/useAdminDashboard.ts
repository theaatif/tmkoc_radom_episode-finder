import { useState, useEffect } from "react";
import { fetchVisitStats, FrequentVisitor, RecentVisit, VisitorUser, WatchHistoryEntry } from "@/features/auth/visits.api";

export interface AdminStats {
  frequentVisitors: FrequentVisitor[];
  recentVisits: RecentVisit[];
  allUsers: VisitorUser[];
  recentWatches: WatchHistoryEntry[];
}

export function useAdminDashboard() {
  // Admin Login Credentials State
  const [userIdInput, setUserIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Navigation tabs: entries log, all users list, watch history
  const [activeTab, setActiveTab] = useState<"entries" | "members" | "history">("entries");

  // Visitor Stats State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const ADMIN_SESSION_TTL = 30 * 60 * 1000; // 30 minutes

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth_token");
    sessionStorage.removeItem("admin_auth_expires");
    setIsAdminLoggedIn(false);
    setStats(null);
    setUserIdInput("");
    setPasswordInput("");
  };

  const loadStats = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVisitStats(token);
      setStats(data);
      setIsAdminLoggedIn(true);
    } catch (err: any) {
      setError(err?.message || "Failed to load visitor statistics.");
      if (err?.message === "unauthorized" || err?.message === "unauthenticated") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Retrieve credentials from sessionStorage on mount
  useEffect(() => {
    const cachedToken = sessionStorage.getItem("admin_auth_token");
    const expiresAt = sessionStorage.getItem("admin_auth_expires");
    if (cachedToken && expiresAt) {
      if (Date.now() > parseInt(expiresAt, 10)) {
        handleLogout();
        return;
      }
      setIsAdminLoggedIn(true);
      loadStats(cachedToken);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const token = btoa(`${userIdInput}:${passwordInput}`);

    try {
      await loadStats(token);
      sessionStorage.setItem("admin_auth_token", token);
      sessionStorage.setItem("admin_auth_expires", String(Date.now() + ADMIN_SESSION_TTL));
    } catch (err: any) {
      if (err?.message === "unauthorized" || err?.message === "unauthenticated") {
        setLoginError("Ae Bhindi Rona band kar! Invalid credentials.");
      } else {
        setLoginError(err?.message || "Failed to connect. Try again.");
      }
    }
  };

  return {
    userIdInput,
    setUserIdInput,
    passwordInput,
    setPasswordInput,
    showPassword,
    setShowPassword,
    loginError,
    isAdminLoggedIn,
    activeTab,
    setActiveTab,
    loading,
    error,
    stats,
    loggingOut,
    setLoggingOut,
    handleLoginSubmit,
    handleLogout,
    loadStats,
  };
}

// Utility: Parse User Agent string
export const parseUserAgent = (uaString: string) => {
  if (!uaString) return "Unknown Browser";
  const lowercase = uaString.toLowerCase();

  let browser = "Browser";
  if (lowercase.includes("firefox")) browser = "Firefox";
  else if (lowercase.includes("opr") || lowercase.includes("opera")) browser = "Opera";
  else if (lowercase.includes("edge") || lowercase.includes("edg")) browser = "Edge";
  else if (lowercase.includes("chrome") || lowercase.includes("chromium")) browser = "Chrome";
  else if (lowercase.includes("safari")) browser = "Safari";

  let os = "OS";
  if (lowercase.includes("windows")) os = "Windows";
  else if (lowercase.includes("macintosh") || lowercase.includes("mac os")) os = "macOS";
  else if (lowercase.includes("linux")) os = "Linux";
  else if (lowercase.includes("android")) os = "Android";
  else if (lowercase.includes("iphone") || lowercase.includes("ipad")) os = "iOS";

  return `${browser} on ${os}`;
};

// Utility: Format Date
export const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

// Utility: Get User Initials
export const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Utility: Get initials pastel color mapping
export const getInitialsColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    { bg: "bg-[#b8a4ed]/20 border-[#b8a4ed]/40", text: "text-[#583da1]" },
    { bg: "bg-[#ffb084]/25 border-[#ffb084]/50", text: "text-[#b24b12]" },
    { bg: "bg-[#ff7295]/20 border-[#ff7295]/45", text: "text-[#c2204c]" },
    { bg: "bg-[#4da8b8]/20 border-[#4da8b8]/40", text: "text-[#1d6b79]" },
    { bg: "bg-[#84ffb0]/20 border-[#84ffb0]/40", text: "text-[#1b7c41]" },
    { bg: "bg-[#fcd34d]/25 border-[#fcd34d]/50", text: "text-[#78350f]" }
  ];
  return colors[hash % colors.length];
};
