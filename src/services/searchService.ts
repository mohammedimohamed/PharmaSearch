/**
 * PharmaSearch — Client-Side Search & Data Access Service
 * 
 * Powered by MiniSearch for in-memory, zero-latency multi-field querying
 * across all 9,595 pharmaceutical records.
 */

import MiniSearch from 'minisearch';
import type {
  PharmaceuticalRecord,
  NomenclatureDataset,
  DatasetMetadata,
  SourceListType,
  ProductClassification,
  ManufacturingOrigin,
} from '@/types';

export interface SearchFilterOptions {
  sourceList?: SourceListType[];
  productClassification?: ProductClassification[];
  manufacturingOrigin?: ManufacturingOrigin[];
  hospitalUse?: boolean;
  officineUse?: boolean;
  form?: string[];
  laboratory?: string[];
  country?: string[];
}

export type SortOrder =
  | 'relevance'
  | 'brand_asc'
  | 'brand_desc'
  | 'dci_asc'
  | 'dci_desc'
  | 'date_desc'
  | 'date_asc';

export interface SearchResults {
  query: string;
  totalHits: number;
  records: PharmaceuticalRecord[];
  executionTimeMs: number;
}

export interface FilterFacets {
  sourceList: Record<SourceListType, number>;
  productClassification: Record<ProductClassification, number>;
  manufacturingOrigin: Record<ManufacturingOrigin, number>;
  hospitalUse: number;
  officineUse: number;
  forms: Array<{ value: string; count: number }>;
  laboratories: Array<{ value: string; count: number }>;
  countries: Array<{ value: string; count: number }>;
}

export function normalizeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export class PharmaceuticalSearchService {
  private dataset: NomenclatureDataset | null = null;
  private miniSearch: MiniSearch<PharmaceuticalRecord> | null = null;
  private recordsById: Map<string, PharmaceuticalRecord> = new Map();
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  constructor(initialDataset?: NomenclatureDataset) {
    if (initialDataset) {
      this.initFromDataset(initialDataset);
    }
  }

  /**
   * Initializes the service from a provided in-memory dataset.
   */
  public initFromDataset(dataset: NomenclatureDataset): void {
    this.dataset = dataset;
    this.recordsById.clear();

    for (const rec of dataset.records) {
      this.recordsById.set(rec.id, rec);
    }

    this.miniSearch = new MiniSearch<PharmaceuticalRecord>({
      fields: ['brandName', 'dci', 'registrationNumber', 'code', 'laboratory', 'dosage', 'form'],
      storeFields: ['id'],
      processTerm: (term) => normalizeDiacritics(term),
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: {
          brandName: 4,
          dci: 3,
          registrationNumber: 3,
          code: 2,
          laboratory: 2,
          dosage: 1,
          form: 1,
        },
      },
    });

    this.miniSearch.addAll(dataset.records);
  }

  /**
   * Loads the static JSON asset from public/data/nomenclature.json (browser or node).
   */
  public async loadStaticDataset(url = '/data/nomenclature.json'): Promise<NomenclatureDataset> {
    if (this.dataset) return this.dataset;

    if (this.isInitializing && this.initPromise) {
      await this.initPromise;
      return this.dataset!;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`Échec du chargement du jeu de données: HTTP ${resp.status}`);
        }
        const loadedData: NomenclatureDataset = await resp.json();
        this.initFromDataset(loadedData);
      } finally {
        this.isInitializing = false;
      }
    })();

    await this.initPromise;
    return this.dataset!;
  }

  public isReady(): boolean {
    return this.dataset !== null && this.miniSearch !== null;
  }

  public getDataset(): NomenclatureDataset | null {
    return this.dataset;
  }

  public getMetadata(): DatasetMetadata {
    if (!this.dataset) {
      throw new Error('Search service is not initialized. Call loadStaticDataset() first.');
    }
    return this.dataset.metadata;
  }

  public getAllRecords(): PharmaceuticalRecord[] {
    return this.dataset?.records || [];
  }

  public getRecordById(id: string): PharmaceuticalRecord | undefined {
    return this.recordsById.get(id);
  }

  /**
   * Retrieves related presentations sharing the same INN (DCI).
   */
  public getRelatedPresentations(dci: string, currentId: string): PharmaceuticalRecord[] {
    if (!dci || !this.dataset) return [];
    const normDci = normalizeDiacritics(dci);
    return this.dataset.records.filter(
      (r) => r.id !== currentId && normalizeDiacritics(r.dci) === normDci
    );
  }

  /**
   * Retrieves any cross-list matching or discrepant records.
   */
  public getDiscrepantRecords(record: PharmaceuticalRecord): PharmaceuticalRecord[] {
    if (!record.discrepancies || record.discrepancies.length === 0) return [];
    const list: PharmaceuticalRecord[] = [];
    for (const disc of record.discrepancies) {
      const rec = this.getRecordById(disc.targetRecordId);
      if (rec) list.push(rec);
    }
    return list;
  }

  /**
   * Main query execution with multi-field full text + structured filters + sorting.
   */
  public search(
    query = '',
    filters?: SearchFilterOptions,
    sort: SortOrder = 'relevance'
  ): SearchResults {
    if (!this.dataset || !this.miniSearch) {
      throw new Error('Search service is not initialized.');
    }

    const start = performance.now();
    const cleanQuery = query.trim();

    let candidateRecords: PharmaceuticalRecord[];

    if (!cleanQuery) {
      // Return all records for browsing / facet filtering
      candidateRecords = this.dataset.records;
    } else {
      const hits = this.miniSearch.search(cleanQuery);
      candidateRecords = [];
      for (const hit of hits) {
        const rec = this.recordsById.get(hit.id);
        if (rec) candidateRecords.push(rec);
      }
    }

    // Apply structured filters
    if (filters) {
      candidateRecords = candidateRecords.filter((rec) => {
        if (filters.sourceList && filters.sourceList.length > 0) {
          if (!filters.sourceList.includes(rec.sourceList)) return false;
        }
        if (filters.productClassification && filters.productClassification.length > 0) {
          if (!filters.productClassification.includes(rec.productClassification)) return false;
        }
        if (filters.manufacturingOrigin && filters.manufacturingOrigin.length > 0) {
          if (!filters.manufacturingOrigin.includes(rec.manufacturingOrigin)) return false;
        }
        if (filters.hospitalUse !== undefined && rec.hospitalUse !== filters.hospitalUse) {
          return false;
        }
        if (filters.officineUse !== undefined && rec.officineUse !== filters.officineUse) {
          return false;
        }
        if (filters.form && filters.form.length > 0) {
          if (!filters.form.includes(rec.form)) return false;
        }
        if (filters.laboratory && filters.laboratory.length > 0) {
          if (!filters.laboratory.includes(rec.laboratory)) return false;
        }
        if (filters.country && filters.country.length > 0) {
          if (!filters.country.includes(rec.country)) return false;
        }
        return true;
      });
    }

    // Apply sorting
    if (sort !== 'relevance' || !cleanQuery) {
      candidateRecords = this.sortRecords(candidateRecords, sort);
    }

    const executionTimeMs = Number((performance.now() - start).toFixed(2));

    return {
      query: cleanQuery,
      totalHits: candidateRecords.length,
      records: candidateRecords,
      executionTimeMs,
    };
  }

  private sortRecords(records: PharmaceuticalRecord[], sort: SortOrder): PharmaceuticalRecord[] {
    const list = [...records];
    switch (sort) {
      case 'brand_asc':
        return list.sort((a, b) => a.brandName.localeCompare(b.brandName, 'fr'));
      case 'brand_desc':
        return list.sort((a, b) => b.brandName.localeCompare(a.brandName, 'fr'));
      case 'dci_asc':
        return list.sort((a, b) => a.dci.localeCompare(b.dci, 'fr'));
      case 'dci_desc':
        return list.sort((a, b) => b.dci.localeCompare(a.dci, 'fr'));
      case 'date_desc':
        return list.sort((a, b) => {
          const dateA = a.initialRegistrationDate?.isoDate || '';
          const dateB = b.initialRegistrationDate?.isoDate || '';
          return dateB.localeCompare(dateA);
        });
      case 'date_asc':
        return list.sort((a, b) => {
          const dateA = a.initialRegistrationDate?.isoDate || '';
          const dateB = b.initialRegistrationDate?.isoDate || '';
          return dateA.localeCompare(dateB);
        });
      default:
        return list;
    }
  }

  /**
   * Calculates comprehensive facet counts across the dataset.
   */
  public getFacets(records?: PharmaceuticalRecord[]): FilterFacets {
    const target = records || this.dataset?.records || [];

    const sourceList: Record<SourceListType, number> = {
      NOMENCLATURE_ACTIVE: 0,
      NON_RENOUVELE: 0,
      RETRAIT: 0,
    };

    const productClassification: Record<ProductClassification, number> = {
      GE: 0,
      RE: 0,
      BIO: 0,
      UNKNOWN: 0,
    };

    const manufacturingOrigin: Record<ManufacturingOrigin, number> = {
      F: 0,
      I: 0,
      UNKNOWN: 0,
    };

    let hospitalUse = 0;
    let officineUse = 0;

    const formMap = new Map<string, number>();
    const labMap = new Map<string, number>();
    const countryMap = new Map<string, number>();

    for (const rec of target) {
      sourceList[rec.sourceList]++;
      productClassification[rec.productClassification]++;
      manufacturingOrigin[rec.manufacturingOrigin]++;
      if (rec.hospitalUse) hospitalUse++;
      if (rec.officineUse) officineUse++;

      if (rec.form) formMap.set(rec.form, (formMap.get(rec.form) || 0) + 1);
      if (rec.laboratory) labMap.set(rec.laboratory, (labMap.get(rec.laboratory) || 0) + 1);
      if (rec.country) countryMap.set(rec.country, (countryMap.get(rec.country) || 0) + 1);
    }

    const toSortedArray = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);

    return {
      sourceList,
      productClassification,
      manufacturingOrigin,
      hospitalUse,
      officineUse,
      forms: toSortedArray(formMap),
      laboratories: toSortedArray(labMap),
      countries: toSortedArray(countryMap),
    };
  }
}

/**
 * Singleton instance for shared application access.
 */
export const searchService = new PharmaceuticalSearchService();
