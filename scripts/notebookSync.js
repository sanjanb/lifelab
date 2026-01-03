/**
 * Notebook Sync - Domain Entry Aggregation
 *
 * DESIGN PRINCIPLES:
 *
 * 1. Domains feed signals into notebooks, but don't own them.
 *    The notebook is the source of truth for monthly structure.
 *
 * 2. Aggregation is always boolean presence, never counts or scores.
 *    "Did something happen in this domain on this day?" → true/false
 *
 * 3. Original domain data is never mutated.
 *    This is a pure read operation from domains, write to notebook.
 *
 * 4. Works for any domain without domain-specific logic.
 *    Generic algorithm based on entry timestamps.
 *
 * 5. No UI dependencies. Pure data transformation.
 * 
 * 6. NON-DESTRUCTIVE SYNC RULE (CRITICAL):
 *    Sync ONLY updates domainSignals (automated presence tracking).
 *    Sync NEVER touches manualOutcome or reflectionNote.
 *    Manual human edits ALWAYS win over automation.
 *    This preserves human judgment and prevents data loss.
 */

/**
 * Aggregate domain entries into a monthly notebook
 *
 * Reads all entries from a domain and marks presence for each day.
 * If a domain has one or more entries on a given date, that day is marked true.
 *
 * @param {string} domainId - The domain identifier
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {boolean} Success status
 */
function aggregateDomainToNotebook(domainId, year, month) {
  try {
    // Validate inputs
    if (!domainId) {
      console.error("aggregateDomainToNotebook: domainId is required");
      return false;
    }

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      console.error(
        "aggregateDomainToNotebook: year and month must be integers"
      );
      return false;
    }

    // Get or create monthly notebook
    let notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      notebook = createMonthlyNotebook(year, month);
      if (!notebook) {
        console.error("aggregateDomainToNotebook: failed to create notebook");
        return false;
      }
    }

    // Get all entries for this domain (does not mutate original data)
    const entries = getEntries(domainId);

    if (!entries || entries.length === 0) {
      // No entries means no presence - clear any existing signals for this domain
      notebook.days.forEach((day) => {
        day.domainSignals[domainId] = false;
      });
      return saveMonthlyNotebook(notebook);
    }

    // Create a map of dates with entries (for O(1) lookup)
    const entriesByDate = mapEntriesToDates(entries, year, month);

    // Update notebook with presence signals
    notebook.days.forEach((day, index) => {
      const dateKey = day.date; // ISO format YYYY-MM-DD

      // Mark presence: true if domain has entries on this date, false otherwise
      day.domainSignals[domainId] = entriesByDate.has(dateKey);
    });

    // Save updated notebook
    return saveMonthlyNotebook(notebook);
  } catch (error) {
    console.error("aggregateDomainToNotebook error:", error);
    return false;
  }
}

/**
 * Map domain entries to dates for a specific month
 *
 * Returns a Set of ISO date strings (YYYY-MM-DD) that have entries.
 * Only includes dates within the specified year/month.
 *
 * @param {Array} entries - Array of domain entries
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {Set} Set of ISO date strings with entries
 */
function mapEntriesToDates(entries, year, month) {
  const dateSet = new Set();

  // Define month boundaries
  const monthStart = new Date(year, month - 1, 1).getTime();
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();

  entries.forEach((entry) => {
    // Validate entry has timestamp
    if (!entry.timestamp || typeof entry.timestamp !== "number") {
      return;
    }

    // Only include entries within this month
    if (entry.timestamp >= monthStart && entry.timestamp <= monthEnd) {
      const date = new Date(entry.timestamp);
      const isoDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
      dateSet.add(isoDate);
    }
  });

  return dateSet;
}

/**
 * Aggregate all domains into a monthly notebook
 *
 * Convenience function that syncs all configured domains at once.
 * Useful for bulk sync operations.
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {boolean} Success status (true if all domains synced)
 */
function aggregateAllDomainsToNotebook(year, month) {
  try {
    // Get all domains from config
    if (typeof getAllDomains !== "function") {
      console.error("aggregateAllDomainsToNotebook: config.js not loaded");
      return false;
    }

    const domains = getAllDomains();
    if (!domains || domains.length === 0) {
      console.warn("aggregateAllDomainsToNotebook: no domains configured");
      return true; // Not an error, just nothing to sync
    }

    // Aggregate each domain
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
    console.error("aggregateAllDomainsToNotebook error:", error);
    return false;
  }
}

/**
 * Get domain presence summary for a specific day
 *
 * Returns an object showing which domains were active on a given day.
 * Useful for UI display and analysis.
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @param {number} dayNum - Day of month (1-31)
 * @returns {Object|null} Object with domain IDs as keys, boolean presence as values
 */
function getDomainPresenceForDay(year, month, dayNum) {
  try {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      return null;
    }

    const dayIndex = dayNum - 1; // Convert to 0-based index
    if (dayIndex < 0 || dayIndex >= notebook.days.length) {
      console.error("getDomainPresenceForDay: invalid day number");
      return null;
    }

    const day = notebook.days[dayIndex];
    return { ...day.domainSignals }; // Return copy to prevent mutation
  } catch (error) {
    console.error("getDomainPresenceForDay error:", error);
    return null;
  }
}

/**
 * Get active domain count for each day in a month
 *
 * Returns an array where each element is the count of active domains for that day.
 * Useful for visualizing consistency across the month.
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {Array|null} Array of domain counts per day, or null on error
 */
function getMonthlyDomainActivity(year, month) {
  try {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      return null;
    }

    return notebook.days.map((day) => {
      // Count domains that are present (true)
      return Object.values(day.domainSignals).filter(
        (present) => present === true
      ).length;
    });
  } catch (error) {
    console.error("getMonthlyDomainActivity error:", error);
    return null;
  }
}

/**
 * Sync current month automatically
 *
 * Convenience function to sync all domains for the current calendar month.
 * Intended to be called when the user views the monthly notebook.
 *
 * @returns {boolean} Success status
 */
function syncCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-based

  return aggregateAllDomainsToNotebook(year, month);
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    aggregateDomainToNotebook,
    aggregateAllDomainsToNotebook,
    getDomainPresenceForDay,
    getMonthlyDomainActivity,
    syncCurrentMonth,
  };
}
