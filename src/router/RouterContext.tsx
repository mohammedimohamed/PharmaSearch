/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, '');
  const [pathname, search] = clean.split('?');
  const path = '/' + (pathname || '');

  const params: Record<string, string> = {};
  if (search) {
    const sp = new URLSearchParams(search);
    sp.forEach((value, key) => {
      params[key] = value;
    });
  }

  return { path, params, fullHash: hash };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() =>
    parseHash(typeof window !== 'undefined' ? window.location.hash : '#/')
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
      setRoute(parseHash(newHash));
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
