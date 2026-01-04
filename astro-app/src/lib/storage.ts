/**
 * LifeLab Storage Layer
 * Framework-agnostic localStorage abstraction
 *
 * MIGRATION NOTE: Direct port from original store.js
 * No behavior changes - conversion only
 */

import { getStorageKey } from "./config";

export interface Entry {
  id: string;
  timestamp: string;
  date: string;
  value: any;
  notes?: string;
}

export interface DayEntry {
  date: string;
  intent?: string;
  quality?: string;
  outcome?: string;
  domains?: string[];
}

export interface MonthlyNotebook {
  year: number;
  month: number;
  days: Record<string, DayEntry>;
  reflection?: string;
  _closed?: boolean;
  _created?: string;
  _lastModified?: string;
  _closedDate?: string;
}

// ============================================================================
// DOMAIN ENTRY STORAGE
// ============================================================================

/**
 * Save an entry to a domain's storage
 */
export function saveEntry(domainId: string, entry: Entry): boolean {
  try {
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

    if (!domainId || !entry) {
      console.error("saveEntry: domainId and entry are required");
      return false;
    }

    const storageKey = getStorageKey(domainId);
    if (!storageKey) {
      console.error(`saveEntry: No storage key found for domain ${domainId}`);
      return false;
    }

    const entries = getEntries(domainId);
    const existingIndex = entries.findIndex((e) => e.id === entry.id);

    if (existingIndex !== -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    localStorage.setItem(storageKey, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("saveEntry error:", error);
    return false;
  }
}

/**
 * Get all entries for a domain
 */
export function getEntries(domainId: string): Entry[] {
  try {
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return [];
    }

    if (!domainId) {
      console.error("getEntries: domainId is required");
      return [];
    }

    const storageKey = getStorageKey(domainId);
    if (!storageKey) {
      console.error(`getEntries: No storage key found for domain ${domainId}`);
      return [];
    }

    const data = localStorage.getItem(storageKey);
    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("getEntries error:", error);
    return [];
  }
}

/**
 * Delete a specific entry from a domain
 */
export function deleteEntry(domainId: string, entryId: string): boolean {
  try {
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

    if (!domainId || !entryId) {
      console.error("deleteEntry: domainId and entryId are required");
      return false;
    }

    const storageKey = getStorageKey(domainId);
    if (!storageKey) {
      console.error(`deleteEntry: No storage key found for domain ${domainId}`);
      return false;
    }

    const entries = getEntries(domainId);
    const filteredEntries = entries.filter((e) => e.id !== entryId);

    if (filteredEntries.length === entries.length) {
      console.warn(`deleteEntry: Entry ${entryId} not found in ${domainId}`);
      return false;
    }

    localStorage.setItem(storageKey, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error("deleteEntry error:", error);
    return false;
  }
}

/**
 * Clear all entries for a domain
 */
export function clearDomain(domainId: string): boolean {
  try {
    if (!domainId) {
      console.error("clearDomain: domainId is required");
      return false;
    }

    const storageKey = getStorageKey(domainId);
    if (!storageKey) {
      console.error(`clearDomain: No storage key found for domain ${domainId}`);
      return false;
    }

    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error("clearDomain error:", error);
    return false;
  }
}

// ============================================================================
// MONTHLY NOTEBOOK STORAGE
// ============================================================================

/**
 * Generate storage key for a monthly notebook
 */
function getNotebookStorageKey(year: number, month: number): string {
  const monthStr = String(month).padStart(2, "0");
  return `lifelab_notebook_${year}_${monthStr}`;
}

/**
 * Get a monthly notebook from storage
 */
export function getMonthlyNotebook(
  year: number,
  month: number
): MonthlyNotebook | null {
  try {
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      console.error("getMonthlyNotebook: year and month must be integers");
      return null;
    }

    if (month < 1 || month > 12) {
      console.error("getMonthlyNotebook: month must be between 1 and 12");
      return null;
    }

    const storageKey = getNotebookStorageKey(year, month);
    const data = localStorage.getItem(storageKey);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("getMonthlyNotebook error:", error);
    return null;
  }
}

/**
 * Save a monthly notebook to storage
 */
export function saveMonthlyNotebook(notebook: MonthlyNotebook): boolean {
  try {
    if (!notebook || typeof notebook !== "object") {
      console.error("saveMonthlyNotebook: notebook must be an object");
      return false;
    }

    if (!notebook.year || !notebook.month) {
      console.error("saveMonthlyNotebook: notebook missing year or month");
      return false;
    }

    const storageKey = getNotebookStorageKey(notebook.year, notebook.month);
    notebook._lastModified = new Date().toISOString();

    localStorage.setItem(storageKey, JSON.stringify(notebook));
    return true;
  } catch (error) {
    console.error("saveMonthlyNotebook error:", error);
    return false;
  }
}

/**
 * Get all monthly notebooks from storage
 */
export function getAllMonthlyNotebooks(): MonthlyNotebook[] {
  try {
    const notebooks: MonthlyNotebook[] = [];
    const prefix = "lifelab_notebook_";

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const notebook = JSON.parse(data);
            notebooks.push(notebook);
          } catch (e) {
            console.warn(`Failed to parse notebook: ${key}`, e);
          }
        }
      }
    }

    notebooks.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return notebooks;
  } catch (error) {
    console.error("getAllMonthlyNotebooks error:", error);
    return [];
  }
}

/**
 * Delete a monthly notebook from storage
 */
export function deleteMonthlyNotebook(year: number, month: number): boolean {
  try {
    const storageKey = getNotebookStorageKey(year, month);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error("deleteMonthlyNotebook error:", error);
    return false;
  }
}

/**
 * Close a monthly notebook (truth lock)
 */
export function closeMonthlyNotebook(year: number, month: number): boolean {
  try {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      console.error("Cannot close: notebook not found");
      return false;
    }

    if (notebook._closed) {
      console.warn("Notebook already closed");
      return true;
    }

    notebook._closed = true;
    notebook._closedDate = new Date().toISOString();

    return saveMonthlyNotebook(notebook);
  } catch (error) {
    console.error("closeMonthlyNotebook error:", error);
    return false;
  }
}

/**
 * Check if a monthly notebook is closed
 */
export function isNotebookClosed(year: number, month: number): boolean {
  try {
    const notebook = getMonthlyNotebook(year, month);
    return notebook ? notebook._closed === true : false;
  } catch (error) {
    console.error("isNotebookClosed error:", error);
    return false;
  }
}
