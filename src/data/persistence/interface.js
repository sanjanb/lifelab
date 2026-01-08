/**
 * Persistence Interface
 * 
 * Abstraction layer for storage providers.
 * Firebase is persistence, NOT logic.
 * 
 * CRITICAL: No provider-specific code outside this module.
 */

/**
 * Persistence interface - all providers must implement these methods
 * @interface PersistenceProvider
 */
export class PersistenceProvider {
  /**
   * Initialize the provider
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    throw new Error("init() must be implemented");
  }

  /**
   * Save data of a specific type
   * @param {string} type - Data type (entries, wins, settings, etc.)
   * @param {Object} data - Data to save
   * @returns {Promise<boolean>} Success status
   */
  async save(type, data) {
    throw new Error("save() must be implemented");
  }

  /**
   * Fetch data of a specific type
   * @param {string} type - Data type
   * @param {Object} options - Optional filters
   * @returns {Promise<Object>} Retrieved data
   */
  async fetch(type, options = {}) {
    throw new Error("fetch() must be implemented");
  }

  /**
   * Migrate local data to this provider
   * @param {Object} localData - All local data to migrate
   * @returns {Promise<Object>} Migration result
   */
  async migrate(localData) {
    throw new Error("migrate() must be implemented");
  }

  /**
   * Export all data
   * @returns {Promise<Object>} All data in portable format
   */
  async export() {
    throw new Error("export() must be implemented");
  }

  /**
   * Get provider name
   * @returns {string} Provider identifier
   */
  getName() {
    throw new Error("getName() must be implemented");
  }

  /**
   * Check if provider is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    throw new Error("isReady() must be implemented");
  }
}

/**
 * Data type constants
 */
export const DataTypes = {
  ENTRIES: "entries",
  WINS: "wins",
  SETTINGS: "settings",
  META: "meta",
};

/**
 * Schema version
 */
export const SCHEMA_VERSION = 1;
