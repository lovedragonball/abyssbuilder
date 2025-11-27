/**
 * Type definitions for patch data structures
 */

/**
 * Represents a known issue that is still unresolved
 */
export interface KnownIssue {
  /** Unique identifier for the issue */
  id: string;
  /** Full description of the issue */
  description: string;
  /** Terms in brackets that should be highlighted (e.g., [Longbow: Embla Inflorescence]) */
  highlightedTerms: string[];
  /** Translations for different languages */
  translations?: {
    en: string;
    th: string;
  };
}

/**
 * Represents a single patch note entry
 */
export interface PatchNote {
  /** Unique identifier for the patch note */
  id: string;
  /** Full description of the fix or change */
  description: string;
  /** Terms in brackets that should be highlighted */
  highlightedTerms: string[];
  /** Type of patch note based on content */
  type: 'fix' | 'optimization' | 'other';
  /** Translations for different languages */
  translations?: {
    en: string;
    th: string;
  };
}

/**
 * Represents a group of patch notes for a specific date
 */
export interface UpdateGroup {
  /** Date in YYYY-MM-DD format (e.g., "2025-11-22") */
  date: string;
  /** Display-friendly date string (e.g., "Update Details - 2025-11-22") */
  displayDate: string;
  /** Array of patch notes for this date */
  notes: PatchNote[];
}

/**
 * Complete patch data structure
 */
export interface PatchData {
  /** List of all known issues */
  knownIssues: KnownIssue[];
  /** List of update groups, sorted by date (newest first) */
  updates: UpdateGroup[];
  /** ISO timestamp of when the data was last updated */
  lastUpdated: string;
  /** Optional error message if parsing failed */
  error?: string;
}
