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
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

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
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

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
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return [];
    }

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
    // Browser check - localStorage only available in browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }

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

// ============================================================================
// EXPORT / IMPORT FUNCTIONALITY
// ============================================================================

export interface LifeLabExport {
  version: string;
  exportDate: string;
  domains: Record<string, Entry[]>;
  notebooks: Record<string, MonthlyNotebook>;
}

/**
 * Export all LifeLab data to JSON
 * 
 * @returns Complete data export object
 */
export function exportAllData(): LifeLabExport {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("Export only available in browser environment");
  }

  const exportData: LifeLabExport = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    domains: {},
    notebooks: {},
  };

  // Export all localStorage items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      // Domain entries (lifelab_habits, lifelab_learning, etc.)
      if (key.startsWith("lifelab_") && !key.includes("notebook")) {
        exportData.domains[key] = JSON.parse(value);
      }
      // Notebook entries (lifelab_notebook_YYYY_MM)
      else if (key.startsWith("lifelab_notebook_")) {
        exportData.notebooks[key] = JSON.parse(value);
      }
    } catch (error) {
      console.error(`Error exporting ${key}:`, error);
    }
  }

  return exportData;
}

/**
 * Download export data as JSON file
 * 
 * @param filename - Optional custom filename
 */
export function downloadExportData(filename?: string): void {
  try {
    const exportData = exportAllData();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    
    const downloadUrl = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || `lifelab-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download export error:", error);
    throw error;
  }
}

/**
 * Import LifeLab data from export object
 * 
 * @param importData - Export data object
 * @param mode - 'merge' (keep existing) or 'replace' (overwrite all)
 * @returns Import statistics
 */
export function importData(
  importData: LifeLabExport,
  mode: "merge" | "replace" = "merge"
): { success: boolean; imported: number; errors: number } {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("Import only available in browser environment");
  }

  let imported = 0;
  let errors = 0;

  try {
    // Replace mode: clear all LifeLab data first
    if (mode === "replace") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("lifelab_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    // Import domain entries
    Object.entries(importData.domains).forEach(([key, entries]) => {
      try {
        if (mode === "merge") {
          // Merge with existing entries
          const existing = getStorageItem<Entry[]>(key) || [];
          const existingIds = new Set(existing.map((e) => e.id));
          const newEntries = entries.filter((e) => !existingIds.has(e.id));
          localStorage.setItem(key, JSON.stringify([...existing, ...newEntries]));
        } else {
          // Replace mode
          localStorage.setItem(key, JSON.stringify(entries));
        }
        imported++;
      } catch (error) {
        console.error(`Error importing ${key}:`, error);
        errors++;
      }
    });

    // Import notebooks
    Object.entries(importData.notebooks).forEach(([key, notebook]) => {
      try {
        if (mode === "merge") {
          // Merge notebook days
          const existing = getStorageItem<MonthlyNotebook>(key);
          if (existing) {
            notebook.days = { ...existing.days, ...notebook.days };
            notebook.reflection = notebook.reflection || existing.reflection;
          }
        }
        localStorage.setItem(key, JSON.stringify(notebook));
        imported++;
      } catch (error) {
        console.error(`Error importing ${key}:`, error);
        errors++;
      }
    });

    return { success: errors === 0, imported, errors };
  } catch (error) {
    console.error("Import data error:", error);
    throw error;
  }
}

/**
 * Import data from file
 * 
 * @param file - JSON file from file input
 * @param mode - 'merge' or 'replace'
 * @returns Promise with import statistics
 */
export async function importFromFile(
  file: File,
  mode: "merge" | "replace" = "merge"
): Promise<{ success: boolean; imported: number; errors: number }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as LifeLabExport;
    
    // Validate import data
    if (!data.version || !data.domains || !data.notebooks) {
      throw new Error("Invalid LifeLab export file format");
    }

    return importData(data, mode);
  } catch (error) {
    console.error("Import from file error:", error);
    throw error;
  }
}

/**
 * Get storage statistics
 * 
 * @returns Storage usage information
 */
export function getStorageStats(): {
  totalEntries: number;
  totalNotebooks: number;
  domains: Record<string, number>;
  estimatedSize: number;
} {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { totalEntries: 0, totalNotebooks: 0, domains: {}, estimatedSize: 0 };
  }

  let totalEntries = 0;
  let totalNotebooks = 0;
  let estimatedSize = 0;
  const domains: Record<string, number> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("lifelab_")) continue;

    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      estimatedSize += value.length;

      if (key.includes("notebook")) {
        totalNotebooks++;
      } else {
        const entries = JSON.parse(value) as Entry[];
        totalEntries += entries.length;
        domains[key] = entries.length;
      }
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
    }
  }

  return {
    totalEntries,
    totalNotebooks,
    domains,
    estimatedSize,
  };
}

