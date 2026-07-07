"use client";

import { useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future implementation: Fetch current session from memory / silent refresh
    setLoading(false);
  }, []);

  const login = async (idToken: string) => {
    // Future implementation: POST /auth/google exchange
  };

  const logout = async () => {
    // Future implementation: POST /auth/logout
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
