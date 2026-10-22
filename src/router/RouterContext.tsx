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
  // as the primary user navigation mechanism in the SPA.
  // Robustly normalize any leading # and / characters (e.g. #/#/medicament, ##/recherche, #/medicament)
  if (hash) {
    const clean = hash.replace(/^[#/]+/, '');
    if (clean) {
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
    // 1. Check legacy hash migration and malformed hash cleanup on mount:
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const stripped = hash.replace(/^[#/]+/, '');
        if (stripped.startsWith('medicament/')) {
          const rawId = stripped.replace(/^medicament\/?/, '').split('?')[0];
          const canonical = RECORD_ID_TO_CANONICAL_PATH.get(rawId.toUpperCase());
          if (canonical) {
            window.history.replaceState(null, '', canonical);
            setRoute(parseCurrentLocation());
            return;
          }
        }

        // Clean up malformed repeated hashes (e.g. #/#/medicament/RET-137 or ##/recherche)
        if (hash.startsWith('#/#') || hash.startsWith('##') || hash.startsWith('#///')) {
          const normalizedHash = `#/${stripped}`;
          window.history.replaceState(null, '', normalizedHash);
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
    // Strip leading hash symbols so cleanPath is always a normalized route path starting with '/'
    const stripped = to.replace(/^[#/]+/, '');
    const [pathPart, inlineSearch] = stripped.split('?');
    let cleanPath = '/' + (pathPart || '');
    if (cleanPath === '//') cleanPath = '/';

    const searchParams = new URLSearchParams(inlineSearch || '');
    if (newParams) {
      Object.entries(newParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.set(k, String(v));
        } else {
          searchParams.delete(k);
        }
      });
    }

    const searchStr = searchParams.toString();

    // Check if target is explicitly a clean registered medicine path
    const isCleanRegisteredPath =
      cleanPath.startsWith('/medicament/') &&
      !cleanPath.startsWith('/medicament/NOM-') &&
      !cleanPath.startsWith('/medicament/NON-') &&
      !cleanPath.startsWith('/medicament/RET-');

    if (isCleanRegisteredPath) {
      const finalUrl = `${cleanPath}${searchStr ? '?' + searchStr : ''}`;
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', finalUrl);
        setRoute({
          path: cleanPath,
          params: Object.fromEntries(searchParams.entries()),
          fullHash: '',
        });
      }
    } else {
      // Standard hash route (e.g. #/recherche or #/favoris or #/medicament/NOM-xxx)
      const newHash = `#${cleanPath}${searchStr ? '?' + searchStr : ''}`;

      if (window.location.hash !== newHash) {
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
          window.history.pushState(null, '', `/${newHash}`);
          setRoute(parseCurrentLocation());
        } else {
          window.location.hash = newHash;
          setRoute(parseCurrentLocation());
        }
      } else {
        setRoute(parseCurrentLocation());
      }
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
