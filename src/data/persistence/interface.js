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

/**
 * Migration state constants
 */
export const MigrationState = {
  NOT_MIGRATED: "not_migrated",
  MIGRATING: "migrating",
  MIGRATED: "migrated",
  ARCHIVED: "archived",
};

/**
 * Validate data shape before persistence
 * @param {string} type - Data type
 * @param {Object} data - Data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateData(type, data) {
  const errors = [];

  if (!data) {
    errors.push("Data is null or undefined");
    return { valid: false, errors };
  }

  switch (type) {
    case DataTypes.WINS:
      if (!Array.isArray(data)) {
        errors.push("Wins must be an array");
      } else {
        data.forEach((win, idx) => {
          if (!win.date || typeof win.date !== "string") {
            errors.push(`Win ${idx}: missing or invalid date`);
          }
          if (!win.text || typeof win.text !== "string") {
            errors.push(`Win ${idx}: missing or invalid text`);
          }
        });
      }
      break;

    case DataTypes.ENTRIES:
      if (typeof data !== "object") {
        errors.push("Entries must be an object");
      } else {
        Object.entries(data).forEach(([key, entries]) => {
          if (!Array.isArray(entries)) {
            errors.push(`Entries[${key}]: must be an array`);
          }
        });
      }
      break;

    case DataTypes.SETTINGS:
      if (typeof data !== "object") {
        errors.push("Settings must be an object");
      }
      break;

    case DataTypes.META:
      if (typeof data !== "object") {
        errors.push("Meta must be an object");
      }
      break;

    default:
      errors.push(`Unknown data type: ${type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
