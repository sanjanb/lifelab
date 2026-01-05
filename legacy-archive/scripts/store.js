/*
 * Global State Management
 * Manages application state across all modules
 * Provides methods for state updates, subscriptions, and persistence
 * Implements a simple store pattern for reactive data flow
 */

/**
 * LifeLab Storage Layer
 *
 * Wraps browser localStorage to provide a consistent API for data persistence.
 * This abstraction allows for future enhancements like encryption, compression,
 * or migration to other storage mechanisms without changing application code.
 *
 * Storage Structure:
 * Each domain stores its entries as an array under its storageKey:
 * {
 *   "lifelab_habits": [...entries],
 *   "lifelab_learning": [...entries],
 *   etc.
 * }
 */

/**
 * Save an entry to a domain's storage
 * Adds a new entry to the domain's array or updates an existing one
 *
 * @param {string} domainId - The domain identifier (used to get storageKey from config)
 * @param {Object} entry - The entry object to save (must have an id property)
 * @returns {boolean} Success status
 */
function saveEntry(domainId, entry) {
  try {
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

    // Check if entry exists (by id) and update, otherwise add new
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
 *
 * @param {string} domainId - The domain identifier
 * @returns {Array} Array of entries (empty array if none exist)
 */
function getEntries(domainId) {
  try {
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
 *
 * @param {string} domainId - The domain identifier
 * @param {string} entryId - The unique entry identifier
 * @returns {boolean} Success status
 */
function deleteEntry(domainId, entryId) {
  try {
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
 *
 * @param {string} domainId - The domain identifier
 * @returns {boolean} Success status
 */
function clearDomain(domainId) {
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

/**
 * Helper function to get storage key from domain ID
 * Uses config.js to look up the storage key
 *
 * @param {string} domainId - The domain identifier
 * @returns {string|null} Storage key or null if not found
 */
function getStorageKey(domainId) {
  // This requires config.js to be loaded first
  if (typeof getDomainById === "function") {
    const domain = getDomainById(domainId);
    return domain ? domain.storageKey : null;
  }

  // Fallback if config is not available
  console.warn("Config not loaded, using fallback storage key");
  return `lifelab_${domainId}`;
}

// ============================================================================
// MONTHLY NOTEBOOK STORAGE API
// ============================================================================

/**
 * Monthly Notebook Storage
 *
 * DESIGN DECISIONS:
 *
 * 1. Storage key format: "lifelab_notebook_YYYY_MM"
 *    This allows easy identification and filtering of notebook data.
 *
 * 2. Each notebook is stored as a complete, self-contained JSON object.
 *    This enables atomic GitHub backups and simple export/import.
 *
 * 3. No auto-creation on read. getMonthlyNotebook returns null if not found.
 *    This preserves the distinction between "notebook doesn't exist yet"
 *    and "notebook exists but is empty."
 *
 * 4. Updates are always full notebook writes, not partial updates.
 *    This keeps the API simple and matches localStorage constraints.
 *
 * 5. No UI logic. These functions are pure storage operations.
 */

/**
 * Generate storage key for a monthly notebook
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {string} Storage key
 */
function getNotebookStorageKey(year, month) {
  // Pad month to 2 digits for consistent sorting
  const monthStr = String(month).padStart(2, "0");
  return `lifelab_notebook_${year}_${monthStr}`;
}

/**
 * Get a monthly notebook from storage
 * Returns null if notebook doesn't exist
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {Object|null} Monthly notebook or null if not found
 */
function getMonthlyNotebook(year, month) {
  try {
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

    const notebook = JSON.parse(data);

    // Basic validation
    if (!notebook.year || !notebook.month || !Array.isArray(notebook.days)) {
      console.error("getMonthlyNotebook: invalid notebook structure");
      return null;
    }

    return notebook;
  } catch (error) {
    console.error("getMonthlyNotebook error:", error);
    return null;
  }
}

/**
 * Create a new monthly notebook
 * Uses the structure from monthlyNotebook.js
 * Returns the created notebook
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {Object|null} Created notebook or null on error
 */
function createMonthlyNotebook(year, month) {
  try {
    // Check if notebook already exists
    const existing = getMonthlyNotebook(year, month);
    if (existing) {
      console.warn(`Monthly notebook for ${year}-${month} already exists`);
      return existing;
    }

    // Validate inputs
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      console.error("createMonthlyNotebook: invalid year");
      return null;
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      console.error("createMonthlyNotebook: invalid month");
      return null;
    }

    // Calculate days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create day entries
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isoDate = date.toISOString().split("T")[0];

      days.push({
        date: isoDate,
        domainSignals: {},
        manualOutcome: null,
        reflectionNote: "",
      });
    }

    // Create notebook structure
    const notebook = {
      year,
      month,
      days,
      _created: new Date().toISOString(),
      _version: "1.0",
    };

    // Save to storage
    const saved = saveMonthlyNotebook(notebook);
    return saved ? notebook : null;
  } catch (error) {
    console.error("createMonthlyNotebook error:", error);
    return null;
  }
}

/**
 * Update a specific day entry in a monthly notebook
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @param {number} dayIndex - Day index (0-based, 0 = first day of month)
 * @param {Object} data - Partial day data to update
 * @returns {boolean} Success status
 */
function updateDayEntry(year, month, dayIndex, data) {
  try {
    // Get existing notebook (create if doesn't exist)
    let notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      notebook = createMonthlyNotebook(year, month);
      if (!notebook) {
        console.error("updateDayEntry: failed to create notebook");
        return false;
      }
    }

    // Validate dayIndex
    if (dayIndex < 0 || dayIndex >= notebook.days.length) {
      console.error(`updateDayEntry: invalid dayIndex ${dayIndex}`);
      return false;
    }

    // Update day entry (merge with existing data)
    const day = notebook.days[dayIndex];

    if (data.domainSignals !== undefined) {
      // Merge domain signals (preserve existing, add new)
      day.domainSignals = { ...day.domainSignals, ...data.domainSignals };
    }

    if (data.manualOutcome !== undefined) {
      day.manualOutcome = data.manualOutcome;
    }

    if (data.reflectionNote !== undefined) {
      day.reflectionNote = data.reflectionNote;
    }

    // Save updated notebook
    return saveMonthlyNotebook(notebook);
  } catch (error) {
    console.error("updateDayEntry error:", error);
    return false;
  }
}

/**
 * Save a monthly notebook to storage
 * Overwrites existing notebook with same year/month
 *
 * @param {Object} notebook - Monthly notebook object
 * @returns {boolean} Success status
 */
function saveMonthlyNotebook(notebook) {
  try {
    if (!notebook || typeof notebook !== "object") {
      console.error("saveMonthlyNotebook: notebook must be an object");
      return false;
    }

    if (!notebook.year || !notebook.month) {
      console.error("saveMonthlyNotebook: notebook missing year or month");
      return false;
    }

    if (!Array.isArray(notebook.days)) {
      console.error("saveMonthlyNotebook: notebook.days must be an array");
      return false;
    }

    const storageKey = getNotebookStorageKey(notebook.year, notebook.month);

    // Add last modified timestamp
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
 * Useful for export/backup operations
 *
 * @returns {Array} Array of notebook objects
 */
function getAllMonthlyNotebooks() {
  try {
    const notebooks = [];
    const prefix = "lifelab_notebook_";

    // Iterate through all localStorage keys
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

    // Sort by year, then month (newest first)
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
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {boolean} Success status
 */
function deleteMonthlyNotebook(year, month) {
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
 * Once closed, daily outcomes, quality, intent, and notes become read-only
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {boolean} Success status
 */
function closeMonthlyNotebook(year, month) {
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

    // Mark as closed with timestamp
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
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @returns {boolean} True if closed
 */
function isNotebookClosed(year, month) {
  try {
    const notebook = getMonthlyNotebook(year, month);
    return notebook ? notebook._closed === true : false;
  } catch (error) {
    console.error("isNotebookClosed error:", error);
    return false;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    saveEntry,
    getEntries,
    deleteEntry,
    clearDomain,
    getMonthlyNotebook,
    createMonthlyNotebook,
    updateDayEntry,
    saveMonthlyNotebook,
    getAllMonthlyNotebooks,
    deleteMonthlyNotebook,
    closeMonthlyNotebook,
    isNotebookClosed,
  };
}
