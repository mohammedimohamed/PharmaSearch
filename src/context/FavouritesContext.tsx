/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type DensityMode = 'standard' | 'compact' | 'comfortable';

export interface UserPreferencesV1 {
  version: 1;
  favourites: string[]; // List of record IDs
  aliases: Record<string, string>; // recordId -> alias
  recentSearches: string[]; // Recent query strings
  densityMode: DensityMode;
  lastUpdated: string;
}

interface FavouritesContextType {
  favourites: string[];
  aliases: Record<string, string>;
  recentSearches: string[];
  densityMode: DensityMode;
  favouritesCount: number;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
  addFavourite: (id: string) => void;
  removeFavourite: (id: string) => void;
  getAlias: (id: string) => string | undefined;
  setAlias: (id: string, alias: string) => void;
  removeAlias: (id: string) => void;
  clearFavourites: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setDensityMode: (mode: DensityMode) => void;
}

const STORAGE_KEY = 'pharmasearch_user_data_v1';

const DEFAULT_PREFERENCES: UserPreferencesV1 = {
  version: 1,
  favourites: [],
  aliases: {},
  recentSearches: [],
  densityMode: 'standard',
  lastUpdated: new Date().toISOString(),
};

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferencesV1>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version === 1) {
            return {
              ...DEFAULT_PREFERENCES,
              ...parsed,
              favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
              aliases: typeof parsed.aliases === 'object' && parsed.aliases !== null ? parsed.aliases : {},
              recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
              densityMode: ['standard', 'compact', 'comfortable'].includes(parsed.densityMode)
                ? parsed.densityMode
                : 'standard',
            };
          }
        }
      } catch (e) {
        console.warn('Failed to load user preferences from localStorage:', e);
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (e) {
        console.warn('Failed to save user preferences to localStorage:', e);
      }
    }
  }, [preferences]);

  const isFavourite = useCallback(
    (id: string) => preferences.favourites.includes(id),
    [preferences.favourites]
  );

  const toggleFavourite = useCallback((id: string) => {
    setPreferences((prev) => {
      const exists = prev.favourites.includes(id);
      const newFavs = exists ? prev.favourites.filter((f) => f !== id) : [...prev.favourites, id];
      const newAliases = { ...prev.aliases };
      if (exists) {
        delete newAliases[id];
      }
      return {
        ...prev,
        favourites: newFavs,
        aliases: newAliases,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const addFavourite = useCallback((id: string) => {
    setPreferences((prev) => {
      if (prev.favourites.includes(id)) return prev;
      return {
        ...prev,
        favourites: [...prev.favourites, id],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const removeFavourite = useCallback((id: string) => {
    setPreferences((prev) => {
      const newAliases = { ...prev.aliases };
      delete newAliases[id];
      return {
        ...prev,
        favourites: prev.favourites.filter((f) => f !== id),
        aliases: newAliases,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const getAlias = useCallback(
    (id: string) => preferences.aliases[id],
    [preferences.aliases]
  );

  const setAlias = useCallback((id: string, alias: string) => {
    const trimmed = alias.trim();
    setPreferences((prev) => {
      const newAliases = { ...prev.aliases };
      if (!trimmed) {
        delete newAliases[id];
      } else {
        newAliases[id] = trimmed;
      }
      return {
        ...prev,
        aliases: newAliases,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const removeAlias = useCallback((id: string) => {
    setPreferences((prev) => {
      const newAliases = { ...prev.aliases };
      delete newAliases[id];
      return {
        ...prev,
        aliases: newAliases,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const clearFavourites = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      favourites: [],
      aliases: {},
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setPreferences((prev) => {
      const filtered = prev.recentSearches.filter(
        (q) => q.toLowerCase() !== trimmed.toLowerCase()
      );
      return {
        ...prev,
        recentSearches: [trimmed, ...filtered].slice(0, 8),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      recentSearches: [],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setDensityMode = useCallback((densityMode: DensityMode) => {
    setPreferences((prev) => ({
      ...prev,
      densityMode,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const value = useMemo(
    () => ({
      favourites: preferences.favourites,
      aliases: preferences.aliases,
      recentSearches: preferences.recentSearches,
      densityMode: preferences.densityMode,
      favouritesCount: preferences.favourites.length,
      isFavourite,
      toggleFavourite,
      addFavourite,
      removeFavourite,
      getAlias,
      setAlias,
      removeAlias,
      clearFavourites,
      addRecentSearch,
      clearRecentSearches,
      setDensityMode,
    }),
    [
      preferences.favourites,
      preferences.aliases,
      preferences.recentSearches,
      preferences.densityMode,
      isFavourite,
      toggleFavourite,
      addFavourite,
      removeFavourite,
      getAlias,
      setAlias,
      removeAlias,
      clearFavourites,
      addRecentSearch,
      clearRecentSearches,
      setDensityMode,
    ]
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
};

export function useFavourites(): FavouritesContextType {
  const ctx = useContext(FavouritesContext);
  if (!ctx) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return ctx;
}
