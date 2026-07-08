"use client";

import { useFavoritesStore } from "../store/favoritesStore";

export function useFavorites() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const loading = useFavoritesStore((state) => state.loading);
  const error = useFavoritesStore((state) => state.error);
  const pagination = useFavoritesStore((state) => state.pagination);
  const getFavorites = useFavoritesStore((state) => state.getFavorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return {
    favorites,
    loading,
    error,
    pagination,
    getFavorites,
    toggleFavorite,
  };
}
