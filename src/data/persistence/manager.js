/**
 * Persistence Manager
 *
 * Manages storage provider selection and switching.
 *
 * RULES:
 * - Default to localStorage
 * - Switch to Firebase only after successful auth
 * - Never oscillate between providers
 * - App works WITHOUT Firebase
 *
 * PHASE 7: Auth-Aware Feature Access
 * - Check auth state before Firebase operations
 * - Fall back to localStorage when unauthenticated
 * - Sync automatically when user logs in
 */

import { LocalStorageProvider } from "./localStorageProvider.js";
import { FirebaseProvider } from "./firebaseProvider.js";
import { DataTypes, MigrationState, validateData } from "./interface.js";
import { 
  isAuthenticated, 
  onAuthStateChange, 
  getCurrentUserId 
} from "./authState.js";

class PersistenceManager {
  constructor() {
    this.currentProvider = null;
    this.providers = {
      localStorage: new LocalStorageProvider(),
      firebase: new FirebaseProvider(),
    };
    this.initialized = false;
    this.authUnsubscribe = null;
    this.isSyncing = false; // Prevent concurrent sync operations
  }

  /**
   * Initialize persistence (auth-aware)
   * @returns {Promise<string>} Name of active provider
   */
  async init() {
    if (this.initialized) {
      console.log(
        `[Persistence] Already initialized with ${this.currentProvider.getName()}`
      );
      return this.currentProvider.getName();
    }

    // Set up auth state listener
    this.authUnsubscribe = onAuthStateChange((authState) => {
      this.handleAuthStateChange(authState);
    });

    // Choose provider based on current auth state
    if (isAuthenticated()) {
      // User is authenticated, try Firebase
      const firebaseReady = await this.providers.firebase.init();
      if (firebaseReady) {
        this.currentProvider = this.providers.firebase;
        this.initialized = true;
        console.log("[Persistence] Using Firebase (authenticated)");
        return "firebase";
      }
      console.log(
        "[Persistence] Firebase not available, falling back to localStorage"
      );
    }

    // Fallback to localStorage (unauthenticated or Firebase unavailable)
    const localReady = await this.providers.localStorage.init();
    if (localReady) {
      this.currentProvider = this.providers.localStorage;
      this.initialized = true;
      console.log("[Persistence] Using localStorage (unauthenticated)");
      return "localStorage";
    }

    throw new Error("No persistence provider available");
  }

  /**
   * Handle authentication state changes
   * Switch providers and sync data when user logs in/out
   * @param {Object} authState - Current auth state
   */
  async handleAuthStateChange(authState) {
    if (!this.initialized) {
      return; // Let init() handle the initial setup
    }

    if (authState.isLoading) {
      return; // Wait for auth to finish loading
    }

    if (authState.isAuthenticated) {
      // User just logged in
      if (!this.isUsingFirebase()) {
        console.log("[Persistence] User logged in, switching to Firebase");
        await this.switchToFirebase();
      }
    } else {
      // User just logged out
      if (this.isUsingFirebase()) {
        console.log("[Persistence] User logged out, switching to localStorage");
        await this.switchToLocalStorage();
      }
    }
  }

  /**
   * Switch to Firebase provider and sync local data
   * @returns {Promise<boolean>} Success status
   */
  async switchToFirebase() {
    const firebaseReady = await this.providers.firebase.init();
    if (!firebaseReady) {
      console.warn("[Persistence] Cannot switch to Firebase - not available");
      return false;
    }

    // Sync local data to Firebase
    await this.syncLocalToFirebase();

    // Switch provider
    this.currentProvider = this.providers.firebase;
    console.log("[Persistence] Switched to Firebase");
    return true;
  }

  /**
   * Switch to localStorage provider
   * @returns {Promise<boolean>} Success status
   */
  async switchToLocalStorage() {
    const localReady = await this.providers.localStorage.init();
    if (!localReady) {
      console.warn("[Persistence] Cannot switch to localStorage - not available");
      return false;
    }

    // Switch provider (no data copy on logout for privacy)
    this.currentProvider = this.providers.localStorage;
    console.log("[Persistence] Switched to localStorage");
    return true;
  }

  /**
   * Sync localStorage data to Firebase (when user logs in)
   * @returns {Promise<Object>} Sync result
   */
  async syncLocalToFirebase() {
    if (this.isSyncing) {
      console.log("[Persistence] Sync already in progress");
      return { success: false, error: "Sync already in progress" };
    }

    this.isSyncing = true;

    try {
      // Get local data
      const localReady = await this.providers.localStorage.init();
      if (!localReady) {
        return { success: false, error: "localStorage not available" };
      }

      const localExport = await this.providers.localStorage.export();
      if (!localExport || !localExport.data) {
        console.log("[Persistence] No local data to sync");
        return { success: true, itemsSynced: 0 };
      }

      // Check if there's actually data to sync
      const hasData = Object.values(localExport.data).some(
        (typeData) => typeData && Object.keys(typeData).length > 0
      );

      if (!hasData) {
        console.log("[Persistence] No local data to sync");
        return { success: true, itemsSynced: 0 };
      }

      console.log("[Persistence] Syncing local data to Firebase...");

      // Migrate to Firebase (this copies data without deleting local copy)
      const result = await this.providers.firebase.migrate(localExport.data);

      if (result.success) {
        console.log(
          `[Persistence] Synced ${result.itemsMigrated || 0} items to Firebase`
        );
      }

      return result;
    } catch (error) {
      console.error("[Persistence] Sync failed:", error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Save data
   * @param {string} type - Data type
   * @param {Object} data - Data to save
   * @returns {Promise<boolean>} Success status
   */
  async save(type, data) {
    if (!this.initialized) {
      await this.init();
    }
    return this.currentProvider.save(type, data);
  }

  /**
   * Fetch data
   * @param {string} type - Data type
   * @param {Object} options - Optional filters
   * @returns {Promise<Object>} Retrieved data
   */
  async fetch(type, options = {}) {
    if (!this.initialized) {
      await this.init();
    }
    return this.currentProvider.fetch(type, options);
  }

  /**
   * Migrate from localStorage to Firebase
   * @returns {Promise<Object>} Migration result
   */
  async migrateToFirebase() {
    // Ensure Firebase is initialized
    const firebaseReady = await this.providers.firebase.init();
    if (!firebaseReady) {
      return {
        success: false,
        error: "Firebase not available",
      };
    }

    // Get all local data
    const localReady = await this.providers.localStorage.init();
    if (!localReady) {
      return {
        success: false,
        error: "Cannot access localStorage",
      };
    }

    // Check migration state
    const migrationState =
      await this.providers.localStorage.getMigrationState();
    if (migrationState === MigrationState.MIGRATED) {
      return {
        success: false,
        error: "Data already migrated",
      };
    }

    // Mark as migrating
    await this.providers.localStorage.setMigrationState(
      MigrationState.MIGRATING
    );

    const localData = await this.providers.localStorage.export();
    if (!localData || !localData.data) {
      await this.providers.localStorage.setMigrationState(
        MigrationState.NOT_MIGRATED
      );
      return {
        success: false,
        error: "No local data to migrate",
      };
    }

    // Migrate to Firebase
    const result = await this.providers.firebase.migrate(localData.data);

    if (result.success) {
      // Mark as migrated
      await this.providers.localStorage.setMigrationState(
        MigrationState.MIGRATED
      );

      // Switch to Firebase provider
      this.currentProvider = this.providers.firebase;
      console.log("[Persistence] Switched to Firebase after migration");
    } else {
      // Revert migration state on failure
      await this.providers.localStorage.setMigrationState(
        MigrationState.NOT_MIGRATED
      );
    }

    return result;
  }

  /**
   * Export all data
   * @returns {Promise<Object>} All data in portable format
   */
  async export() {
    if (!this.initialized) {
      await this.init();
    }
    return this.currentProvider.export();
  }

  /**
   * Get current provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    return this.currentProvider ? this.currentProvider.getName() : "none";
  }

  /**
   * Check if using Firebase
   * @returns {boolean} True if using Firebase
   */
  isUsingFirebase() {
    return this.getProviderName() === "firebase";
  }

  /**
   * Check if migration is needed
   * @returns {Promise<boolean>} True if local data exists and not using Firebase
   */
  async needsMigration() {
    if (this.isUsingFirebase()) {
      return false;
    }

    // Check if local data exists
    const localReady = await this.providers.localStorage.init();
    if (!localReady) {
      return false;
    }

    // Check migration state
    const migrationState =
      await this.providers.localStorage.getMigrationState();
    if (migrationState === MigrationState.MIGRATED) {
      return false;
    }

    const localExport = await this.providers.localStorage.export();
    const hasLocalData =
      localExport &&
      localExport.data &&
      Object.keys(localExport.data).length > 0;

    // Check if Firebase is available
    const firebaseReady = await this.providers.firebase.init();

    return hasLocalData && firebaseReady;
  }

  /**
   * Restore data from export (always to localStorage)
   * @param {Object} exportData - Export data object
   * @returns {Promise<Object>} Restore result
   */
  async restore(exportData) {
    if (!exportData || !exportData.data) {
      return {
        success: false,
        error: "Invalid export data",
      };
    }

    // Validate schema version
    const currentVersion = await this.providers.localStorage.getSchemaVersion();
    if (exportData.schemaVersion > currentVersion) {
      return {
        success: false,
        error: `Schema version mismatch: export is v${exportData.schemaVersion}, current is v${currentVersion}`,
      };
    }

    // Restore to localStorage only (safety measure)
    const localReady = await this.providers.localStorage.init();
    if (!localReady) {
      return {
        success: false,
        error: "Cannot access localStorage",
      };
    }

    try {
      let itemsRestored = 0;

      // Restore each data type
      for (const [type, data] of Object.entries(exportData.data)) {
        // Validate before restoring
        const validation = validateData(type, data);
        if (!validation.valid) {
          console.warn(
            `[Persistence] Skipping invalid ${type}:`,
            validation.errors
          );
          continue;
        }

        const success = await this.providers.localStorage.save(type, data);
        if (success) {
          itemsRestored++;
        }
      }

      // Update schema version
      await this.providers.localStorage.setSchemaVersion(
        exportData.schemaVersion
      );

      return {
        success: true,
        itemsRestored,
      };
    } catch (error) {
      console.error("[Persistence] Restore failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Archive local data (mark as backed up)
   * @returns {Promise<boolean>} Success status
   */
  async archiveLocalData() {
    const localReady = await this.providers.localStorage.init();
    if (!localReady) {
      return false;
    }

    return await this.providers.localStorage.setMigrationState(
      MigrationState.ARCHIVED
    );
  }

  /**
   * Cleanup: unsubscribe from auth state changes
   */
  cleanup() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
  }
}

// Singleton instance
export const persistence = new PersistenceManager();
export { DataTypes };
