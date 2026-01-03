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
            console.error('saveEntry: domainId and entry are required');
            return false;
        }

        const storageKey = getStorageKey(domainId);
        if (!storageKey) {
            console.error(`saveEntry: No storage key found for domain ${domainId}`);
            return false;
        }

        const entries = getEntries(domainId);
        
        // Check if entry exists (by id) and update, otherwise add new
        const existingIndex = entries.findIndex(e => e.id === entry.id);
        
        if (existingIndex !== -1) {
            entries[existingIndex] = entry;
        } else {
            entries.push(entry);
        }

        localStorage.setItem(storageKey, JSON.stringify(entries));
        return true;
    } catch (error) {
        console.error('saveEntry error:', error);
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
            console.error('getEntries: domainId is required');
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
        console.error('getEntries error:', error);
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
            console.error('deleteEntry: domainId and entryId are required');
            return false;
        }

        const storageKey = getStorageKey(domainId);
        if (!storageKey) {
            console.error(`deleteEntry: No storage key found for domain ${domainId}`);
            return false;
        }

        const entries = getEntries(domainId);
        const filteredEntries = entries.filter(e => e.id !== entryId);

        if (filteredEntries.length === entries.length) {
            console.warn(`deleteEntry: Entry ${entryId} not found in ${domainId}`);
            return false;
        }

        localStorage.setItem(storageKey, JSON.stringify(filteredEntries));
        return true;
    } catch (error) {
        console.error('deleteEntry error:', error);
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
            console.error('clearDomain: domainId is required');
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
        console.error('clearDomain error:', error);
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
    if (typeof getDomainById === 'function') {
        const domain = getDomainById(domainId);
        return domain ? domain.storageKey : null;
    }
    
    // Fallback if config is not available
    console.warn('Config not loaded, using fallback storage key');
    return `lifelab_${domainId}`;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        saveEntry, 
        getEntries, 
        deleteEntry, 
        clearDomain 
    };
}
