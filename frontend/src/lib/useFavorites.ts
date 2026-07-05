import { useCallback, useEffect, useState } from "react";

/**
 * Favorite exercises persisted to localStorage.
 *
 * A local store is intentional for now: there is no favorites table yet, and
 * adding one before the workout-history schema (Phase 8) would be premature.
 * The API surface here (toggle/isFavorite) is what a backend-backed version
 * would expose, so swapping the storage later is contained.
 */
const STORAGE_KEY = "swb_favorites";

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(read);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}
