/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { resolveToRecordId, RECORD_ID_TO_CANONICAL_PATH } from '@/utils/seoRegistry';

export interface RouteState {
  path: string;
  params: Record<string, string>;
  fullHash: string;
}

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  navigate: (to: string, newParams?: Record<string, string | undefined>) => void;
  getParam: (key: string, defaultValue?: string) => string;
}

const RouterContext = createContext<RouterContextType | null>(null);

function parseCurrentLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { path: '/', params: {}, fullHash: '#/' };
  }

  const hash = window.location.hash;
  const pathname = window.location.pathname;

  // 1. If hash contains a route path (e.g. #/recherche or #/medicament/...), hash takes priority
  // as the primary user navigation mechanism in the SPA
  if (hash && hash !== '#' && hash !== '#/') {
    const clean = hash.replace(/^#\/?/, '');
    const [hashPath, search] = clean.split('?');
    const path = '/' + (hashPath || '');

    const params: Record<string, string> = {};
    if (search) {
      const sp = new URLSearchParams(search);
      sp.forEach((value, key) => {
        params[key] = value;
      });
    }

    return { path, params, fullHash: hash };
  }

  // 2. If direct clean path is accessed (e.g. /medicament/...) and no conflicting hash
  if (pathname && pathname !== '/' && pathname !== '/index.html') {
    const sp = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    sp.forEach((value, key) => {
      params[key] = value;
    });
    return { path: pathname, params, fullHash: hash || `#${pathname}` };
  }

  // 3. Default root
  return { path: '/', params: {}, fullHash: hash || '#/' };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() => parseCurrentLocation());

  useEffect(() => {
    // 1. Check legacy hash migration on mount:
    // If user opened e.g. /#/medicament/NOM-4460, and NOM-4460 has a clean canonical path,
    // upgrade URL cleanly using history.replaceState to the permanent clean URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/medicament/') || hash.startsWith('#medicament/')) {
        const rawId = hash.replace(/^#\/?medicament\/?/, '').split('?')[0];
        const canonical = RECORD_ID_TO_CANONICAL_PATH.get(rawId.toUpperCase());
        if (canonical) {
          window.history.replaceState(null, '', canonical);
          setRoute(parseCurrentLocation());
        }
      }
    }

    const handleLocationChange = () => {
      setRoute(parseCurrentLocation());
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = useCallback((to: string, newParams?: Record<string, string | undefined>) => {
    let cleanPath = to.startsWith('/') ? to : '/' + to;
    if (cleanPath === '//') cleanPath = '/';

    const searchParams = new URLSearchParams();
    if (newParams) {
      Object.entries(newParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.set(k, String(v));
        }
      });
    }

    const searchStr = searchParams.toString();
    const newHash = `#${cleanPath}${searchStr ? '?' + searchStr : ''}`;

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      setRoute(parseCurrentLocation());
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getParam = useCallback(
    (key: string, defaultValue = '') => route.params[key] ?? defaultValue,
    [route.params]
  );

  const value = useMemo(
    () => ({
      path: route.path,
      params: route.params,
      navigate,
      getParam,
    }),
    [route.path, route.params, navigate, getParam]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
}
export { resolveToRecordId };
