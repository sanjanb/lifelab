/**
 * LocalStorage Persistence Provider
 *
 * Implements persistence interface using browser localStorage.
 * This is the default, fallback provider.
 */

import {
  PersistenceProvider,
  DataTypes,
  SCHEMA_VERSION,
  MigrationState,
  validateData,
} from "./interface.js";

export class LocalStorageProvider extends PersistenceProvider {
  constructor() {
    super();
    this.ready = false;
  }

  async init() {
    try {
      // Check if localStorage is available
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.ready = true;
      console.log("[LocalStorage] Provider initialized");
      return true;
    } catch (error) {
      console.error("[LocalStorage] Initialization failed:", error);
      return false;
    }
  }

  async save(type, data) {
    if (!this.ready) {
      console.error("[LocalStorage] Provider not ready");
      return false;
    }

    // Validate data shape
    const validation = validateData(type, data);
    if (!validation.valid) {
      console.error(
        `[LocalStorage] Validation failed for ${type}:`,
        validation.errors
      );
      // Log but don't block save for backward compatibility
    }

    try {
      const key = this._getKey(type);
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`[LocalStorage] Failed to save ${type}:`, error);
      return false;
    }
  }

  async fetch(type, options = {}) {
    if (!this.ready) {
      console.error("[LocalStorage] Provider not ready");
      return null;
    }

    try {
      const key = this._getKey(type);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[LocalStorage] Failed to fetch ${type}:`, error);
      return null;
    }
  }

  async migrate(localData) {
    // LocalStorage IS the local data - no migration needed
    return {
      success: true,
      message: "Already using localStorage",
      itemsMigrated: 0,
    };
  }

  async export() {
    if (!this.ready) {
      console.error("[LocalStorage] Provider not ready");
      return null;
    }

    try {
      const exportData = {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        provider: this.getName(),
        data: {},
      };

      // Export all data types
      for (const type of Object.values(DataTypes)) {
        const data = await this.fetch(type);
        if (data) {
          exportData.data[type] = data;
        }
      }

      return exportData;
    } catch (error) {
      console.error("[LocalStorage] Export failed:", error);
      return null;
    }
  }

  getName() {
    return "localStorage";
  }

  isReady() {
    return this.ready;
  }

  _getKey(type) {
    return `lifelab_${type}`;
  }

  /**
   * Get migration state
   * @returns {Promise<string>} Migration state
   */
  async getMigrationState() {
    try {
      const state = localStorage.getItem("lifelab_migration_state");
      return state || MigrationState.NOT_MIGRATED;
    } catch (error) {
      console.error("[LocalStorage] Failed to get migration state:", error);
      return MigrationState.NOT_MIGRATED;
    }
  }

  /**
   * Set migration state
   * @param {string} state - Migration state
   * @returns {Promise<boolean>} Success status
   */
  async setMigrationState(state) {
    try {
      localStorage.setItem("lifelab_migration_state", state);
      if (state === MigrationState.MIGRATED) {
        localStorage.setItem(
          "lifelab_migration_timestamp",
          new Date().toISOString()
        );
      }
      return true;
    } catch (error) {
      console.error("[LocalStorage] Failed to set migration state:", error);
      return false;
    }
  }

  /**
   * Get schema version
   * @returns {Promise<number>} Schema version
   */
  async getSchemaVersion() {
    try {
      const version = localStorage.getItem("lifelab_schema_version");
      return version ? parseInt(version, 10) : SCHEMA_VERSION;
    } catch (error) {
      console.error("[LocalStorage] Failed to get schema version:", error);
      return SCHEMA_VERSION;
    }
  }

  /**
   * Set schema version
   * @param {number} version - Schema version
   * @returns {Promise<boolean>} Success status
   */
  async setSchemaVersion(version) {
    try {
      localStorage.setItem("lifelab_schema_version", version.toString());
      return true;
    } catch (error) {
      console.error("[LocalStorage] Failed to set schema version:", error);
      return false;
    }
  }
}
