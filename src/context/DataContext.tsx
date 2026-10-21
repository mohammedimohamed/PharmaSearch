/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  NomenclatureDataset,
  DatasetMetadata,
  PharmaceuticalRecord,
} from '@/types';
import {
  searchService,
  type SearchFilterOptions,
  type SortOrder,
  type SearchResults,
  type FilterFacets,
} from '@/services/searchService';

interface DataContextType {
  dataset: NomenclatureDataset | null;
  metadata: DatasetMetadata | null;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  search: (query?: string, filters?: SearchFilterOptions, sort?: SortOrder) => SearchResults;
  getRecordById: (id: string) => PharmaceuticalRecord | undefined;
  getRelatedPresentations: (dci: string, currentId: string) => PharmaceuticalRecord[];
  getDiscrepantRecords: (record: PharmaceuticalRecord) => PharmaceuticalRecord[];
  getFacets: (records?: PharmaceuticalRecord[]) => FilterFacets | null;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{
  children: React.ReactNode;
  initialDataset?: NomenclatureDataset;
}> = ({ children, initialDataset }) => {
  const [dataset, setDataset] = useState<NomenclatureDataset | null>(() => {
    if (initialDataset) return initialDataset;
    return searchService.getDataset();
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (initialDataset || searchService.getDataset()) return false;
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataset) return; // Already initialized

    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        // Load static JSON asset
        const data = await searchService.loadStaticDataset('/data/nomenclature.json');
        if (isMounted) {
          setDataset(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des données.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = useCallback(
    (query = '', filters?: SearchFilterOptions, sort: SortOrder = 'relevance'): SearchResults => {
      if (!dataset) {
        return {
          query,
          totalHits: 0,
          records: [],
          executionTimeMs: 0,
        };
      }
      return searchService.search(query, filters, sort);
    },
    [dataset]
  );

  const getRecordById = useCallback(
    (id: string): PharmaceuticalRecord | undefined => {
      return searchService.getRecordById(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset]
  );

  const getRelatedPresentations = useCallback(
    (dci: string, currentId: string): PharmaceuticalRecord[] => {
      return searchService.getRelatedPresentations(dci, currentId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset]
  );

  const getDiscrepantRecords = useCallback(
    (record: PharmaceuticalRecord): PharmaceuticalRecord[] => {
      return searchService.getDiscrepantRecords(record);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset]
  );

  const getFacets = useCallback(
    (records?: PharmaceuticalRecord[]): FilterFacets | null => {
      if (!dataset) return null;
      return searchService.getFacets(records);
    },
    [dataset]
  );

  const value = useMemo(
    () => ({
      dataset,
      metadata: dataset?.metadata ?? null,
      isLoading,
      error,
      isReady: dataset !== null,
      search,
      getRecordById,
      getRelatedPresentations,
      getDiscrepantRecords,
      getFacets,
    }),
    [dataset, isLoading, error, search, getRecordById, getRelatedPresentations, getDiscrepantRecords, getFacets]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
