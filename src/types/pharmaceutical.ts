/**
 * PharmaSearch — Domain Data Model & Types
 * Reflects strict data integrity requirements for Algerian pharmaceutical nomenclature.
 */

/**
 * Observed official source list classification.
 * NOTE: List membership represents observed inclusion in that official registry sheet,
 * not an infallible assertion of current market availability.
 */
export type SourceListType =
  | 'NOMENCLATURE_ACTIVE'   // Nomenclature Nationale au 31 Août 2026 (5,425 records)
  | 'NON_RENOUVELE'         // Produits non renouvelés au 31 Août 2026 (1,491 records)
  | 'RETRAIT';              // Produits faisant l'objet de retrait au 31 Août 2026 (2,679 records)

/**
 * Manufacturing / Trade Origin (STATUT column in workbook):
 * F = Fabrication locale (Domestic production / packaging)
 * I = Importation (Imported pharmaceutical)
 * UNKNOWN = Not specified or ambiguous
 */
export type ManufacturingOrigin = 'F' | 'I' | 'UNKNOWN';

/**
 * Product Classification (TYPE column):
 * GE = Générique
 * RE = Référence / Princeps
 * BIO = Biologique / Biosimilaire
 * UNKNOWN = Not specified
 */
export type ProductClassification = 'GE' | 'RE' | 'BIO' | 'UNKNOWN';

/**
 * Prescription Schedule (LISTE column):
 * Explicitly preserves raw schedule designations.
 * IMPORTANT: A blank value must NEVER be inferred as OTC (Over-the-Counter).
 */
export type PrescriptionSchedule =
  | 'LISTE I'
  | 'LISTE II'
  | 'STUPEFIANT'
  | 'NON_SPECIFIE';

/**
 * Raw Date Representation:
 * Preserves original text/serial, parsed ISO dates, and administrative textual tags.
 */
export interface RawDateValue {
  /** Verbatim raw value from the source workbook (e.g., '44924', '00/00/2019', 'RETRAIT') */
  raw: string;
  /** Normalized ISO date string (YYYY-MM-DD), if validly parseable */
  isoDate: string | null;
  /** Formatted date string for display (DD/MM/YYYY), if validly parseable */
  formatted: string | null;
  /** True if the date was present but could not be parsed as a valid calendar date */
  isInvalidDate: boolean;
  /** True if the date column contains an administrative action string (e.g. 'RETRAIT', 'ABROGATION') */
  isAdministrativeTag: boolean;
  /** Warning message if the date format is ambiguous or irregular */
  warning?: string;
}

/**
 * Provenance tracking for every record to guarantee auditability back to the source snapshot.
 */
export interface RecordProvenance {
  /** Original worksheet title (e.g. 'Nomenclature Aout 2026', 'Non Renouvelés ', 'Retraits') */
  sourceWorksheet: string;
  /** 1-based row index in the source Excel file */
  sourceRow: number;
  /** Snapshot date documented in official workbook header (e.g., '2026-08-31') */
  snapshotDate: string;
  /** Raw, untrimmed original string values keyed by Excel column letter, if irregular or requested */
  originalFieldValues?: Record<string, string>;
}

/**
 * Discrepancy reference when a medicine appears across conflicting source lists
 * (e.g. appears in both active nomenclature and withdrawals list).
 */
export interface ListDiscrepancy {
  targetRecordId: string;
  targetList: SourceListType;
  overlapType: 'EXACT_MATCH' | 'POTENTIAL_OVERLAP';
  matchingFields: Array<'registrationNumber' | 'brandName' | 'dci' | 'code' | 'dosage' | 'form' | 'packaging'>;
  description: string;
}

/**
 * Primary Pharmaceutical Record Entity.
 * Represents a single preserved row from the official source snapshot.
 */
export interface PharmaceuticalRecord {
  /** Deterministic unique row identity: e.g. 'NOM-17', 'NON-13', 'RET-12' */
  id: string;

  /** Source registry list */
  sourceList: SourceListType;

  /** Registration / Marketing Authorization Number (N° ENREGISTREMENT) */
  registrationNumber: string;

  /** National product classification code (CODE) */
  code: string;

  /** International Nonproprietary Name (DENOMINATION COMMUNE INTERNATIONALE - DCI) */
  dci: string;

  /** Commercial brand name (NOM DE MARQUE) */
  brandName: string;

  /** Pharmaceutical dosage form (FORME) */
  form: string;

  /** Active substance strength / dosage (DOSAGE) */
  dosage: string;

  /** Commercial packaging presentation (CONDITIONNEMENT) */
  packaging: string;

  /** Prescription schedule (LISTE: 'LISTE I', 'LISTE II', 'STUPEFIANT', or 'NON_SPECIFIE') */
  prescriptionSchedule: PrescriptionSchedule;
  /** Raw prescription schedule text from the source */
  rawPrescriptionSchedule: string;

  /** Hospital use indicator (P1 === 'HOP') */
  hospitalUse: boolean;

  /** Retail pharmacy / officine indicator (P2 === 'OFF') */
  officineUse: boolean;

  /** Marketing authorization holder (LABORATOIRES DETENTEUR DE LA DECISION D'ENREGISTREMENT) */
  laboratory: string;

  /** Country of the marketing authorization holder */
  country: string;

  /** Initial registration date */
  initialRegistrationDate: RawDateValue;

  /** Final / renewal registration date (Nomenclature and Non-renouvelés only) */
  finalRegistrationDate?: RawDateValue;

  /** Withdrawal date (Retraits sheet only; may be a date or administrative keyword) */
  withdrawalDate?: RawDateValue;

  /** Legal / administrative grounds for withdrawal (Retraits sheet only) */
  withdrawalReason?: string;

  /** Shelf-life / Stability period (DUREE DE STABILITE, Nomenclature sheet only) */
  shelfLife?: string;

  /** Additional administrative observations (OBS column) */
  observations?: string;

  /** Product classification (Générique, Référence, Biologique) */
  productClassification: ProductClassification;

  /** Manufacturing origin (Fabrication locale vs Importation) */
  manufacturingOrigin: ManufacturingOrigin;

  /** Verifiable audit provenance back to the source Excel row */
  provenance: RecordProvenance;

  /** Potential cross-list discrepancies flagged for review */
  discrepancies?: ListDiscrepancy[];
}

/**
 * Aggregate metadata generated alongside the dataset.
 */
export interface DatasetMetadata {
  sourceSnapshotDate: string;
  officialSourceUrl: string;
  sourceMinistry: string;
  sourceDirection: string;
  generatedAt: string;
  totalSourceRows: number;
  listCounts: {
    nomenclatureActive: number;
    nonRenouveles: number;
    retraits: number;
  };
  discrepancyCounts: {
    exactMatches: number;
    potentialOverlaps: number;
    intraListDuplicates: number;
  };
  warningCounts: {
    ambiguousDates: number;
    missingCriticalFields: number;
    crossListDiscrepancies: number;
  };
}

/**
 * Full static dataset container.
 */
export interface NomenclatureDataset {
  metadata: DatasetMetadata;
  records: PharmaceuticalRecord[];
}
