/**
 * Notebook Sync - Domain Entry Aggregation
 * Framework-agnostic TypeScript port
 * 
 * MIGRATION NOTE: Direct port from notebookSync.js
 * Preserves all non-destructive sync behavior
 * 
 * DESIGN PRINCIPLES:
 * 1. Domains feed signals into notebooks, but don't own them
 * 2. Aggregation is always boolean presence, never counts
 * 3. Original domain data is never mutated
 * 4. Works for any domain without domain-specific logic
 * 5. NON-DESTRUCTIVE: Never touches manual outcomes or reflection notes
 */

import { getEntries } from './storage';
import { 
  getMonthlyNotebook, 
  saveMonthlyNotebook, 
  type MonthlyNotebook,
  type DayEntry 
} from './storage';
import { getAllDomains } from './config';

/**
 * Map domain entries to dates for a specific month
 */
function mapEntriesToDates(entries: any[], year: number, month: number): Set<string> {
  const dateSet = new Set<string>();

  // Define month boundaries
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  entries.forEach((entry) => {
    if (!entry.timestamp) return;

    const entryDate = new Date(entry.timestamp);
    
    // Only include entries within this month
    if (entryDate >= monthStart && entryDate <= monthEnd) {
      const isoDate = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
      dateSet.add(isoDate);
    }
  });

  return dateSet;
}

/**
 * Aggregate domain entries into a monthly notebook
 * 
 * NON-DESTRUCTIVE: Only updates domain presence signals
 * Preserves manual outcomes and reflection notes
 */
export function aggregateDomainToNotebook(
  domainId: string,
  year: number,
  month: number
): boolean {
  try {
    if (!domainId) {
      console.error('aggregateDomainToNotebook: domainId is required');
      return false;
    }

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      console.error('aggregateDomainToNotebook: year and month must be integers');
      return false;
    }

    // Get or create monthly notebook
    let notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      // Create new notebook if it doesn't exist
      notebook = createEmptyNotebook(year, month);
    }

    // Get all entries for this domain
    const entries = getEntries(domainId);

    // Create a map of dates with entries
    const entriesByDate = mapEntriesToDates(entries, year, month);

    // Update notebook with presence signals
    // NON-DESTRUCTIVE: Only updates domains array, preserves intent/quality/outcome/reflection
    Object.keys(notebook.days).forEach((dayKey) => {
      const day = notebook.days[dayKey];
      const dateKey = day.date || `${year}-${String(month).padStart(2, '0')}-${dayKey.padStart(2, '0')}`;
      
      // Update domains array: add or remove domain based on presence
      const hasEntries = entriesByDate.has(dateKey);
      const currentDomains = day.domains || [];
      
      if (hasEntries && !currentDomains.includes(domainId)) {
        day.domains = [...currentDomains, domainId];
      } else if (!hasEntries && currentDomains.includes(domainId)) {
        day.domains = currentDomains.filter(d => d !== domainId);
      }

      // NEVER touch these fields during sync:
      // - day.intent
      // - day.quality
      // - day.outcome
    });

    // Save updated notebook
    return saveMonthlyNotebook(notebook);
  } catch (error) {
    console.error('aggregateDomainToNotebook error:', error);
    return false;
  }
}

/**
 * Create an empty monthly notebook structure
 */
function createEmptyNotebook(year: number, month: number): MonthlyNotebook {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: Record<string, DayEntry> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = String(day);
    const date = new Date(year, month - 1, day);
    const isoDate = date.toISOString().split('T')[0];

    days[dayKey] = {
      date: isoDate,
      domains: []
    };
  }

  return {
    year,
    month,
    days,
    _created: new Date().toISOString()
  };
}

/**
 * Aggregate all domains into a monthly notebook
 */
export function aggregateAllDomainsToNotebook(year: number, month: number): boolean {
  try {
    const domains = getAllDomains();
    if (!domains || domains.length === 0) {
      console.warn('aggregateAllDomainsToNotebook: no domains configured');
      return true;
    }

    let allSuccess = true;
    domains.forEach((domain) => {
      const success = aggregateDomainToNotebook(domain.id, year, month);
      if (!success) {
        console.warn(`Failed to aggregate domain: ${domain.id}`);
        allSuccess = false;
      }
    });

    return allSuccess;
  } catch (error) {
    console.error('aggregateAllDomainsToNotebook error:', error);
    return false;
  }
}

/**
 * Get domain presence for a specific day
 */
export function getDomainPresenceForDay(
  year: number,
  month: number,
  dayNum: number
): string[] | null {
  try {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) return null;

    const dayKey = String(dayNum);
    const day = notebook.days[dayKey];
    
    if (!day) {
      console.error('getDomainPresenceForDay: invalid day number');
      return null;
    }

    return [...(day.domains || [])]; // Return copy
  } catch (error) {
    console.error('getDomainPresenceForDay error:', error);
    return null;
  }
}

/**
 * Get active domain count for each day in a month
 */
export function getMonthlyDomainActivity(year: number, month: number): number[] | null {
  try {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) return null;

    return Object.values(notebook.days).map((day) => {
      return (day.domains || []).length;
    });
  } catch (error) {
    console.error('getMonthlyDomainActivity error:', error);
    return null;
  }
}

/**
 * Sync current month automatically
 */
export function syncCurrentMonth(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return aggregateAllDomainsToNotebook(year, month);
}

/**
 * Perform non-destructive sync for a specific month
 * 
 * Main sync entry point - call when:
 * - User opens monthly notebook view
 * - User adds/deletes domain entries
 * - User manually triggers refresh
 */
export interface SyncResult {
  success: boolean;
  wasCreated?: boolean;
  domainsProcessed?: number;
  successCount?: number;
  failCount?: number;
  error?: string;
  details?: Array<{ domainId: string; success: boolean }>;
}

export function performNonDestructiveSync(year: number, month: number): SyncResult {
  try {
    console.log(`Starting non-destructive sync for ${year}-${month}`);

    // Ensure notebook exists
    let notebook = getMonthlyNotebook(year, month);
    const wasCreated = !notebook;

    if (!notebook) {
      notebook = createEmptyNotebook(year, month);
      saveMonthlyNotebook(notebook);
    }

    // Get all configured domains
    const domains = getAllDomains();
    const syncResults: Array<{ domainId: string; success: boolean }> = [];

    // Sync each domain
    domains.forEach((domain) => {
      const success = aggregateDomainToNotebook(domain.id, year, month);
      syncResults.push({
        domainId: domain.id,
        success: success,
      });
    });

    // Count successes and failures
    const successCount = syncResults.filter((r) => r.success).length;
    const failCount = syncResults.filter((r) => !r.success).length;

    console.log(`Sync complete: ${successCount} domains synced, ${failCount} failed`);

    return {
      success: failCount === 0,
      wasCreated,
      domainsProcessed: domains.length,
      successCount,
      failCount,
      details: syncResults,
    };
  } catch (error: any) {
    console.error('performNonDestructiveSync error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
