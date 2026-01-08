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
 */

import { LocalStorageProvider } from "./localStorageProvider.js";
import { FirebaseProvider } from "./firebaseProvider.js";
import { DataTypes } from "./interface.js";

class PersistenceManager {
  constructor() {
    this.currentProvider = null;
    this.providers = {
      localStorage: new LocalStorageProvider(),
      firebase: new FirebaseProvider(),
    };
    this.initialized = false;
  }

  /**
   * Initialize persistence (try Firebase, fallback to localStorage)
   * @param {boolean} preferFirebase - Whether to try Firebase first
   * @returns {Promise<string>} Name of active provider
   */
  async init(preferFirebase = false) {
    if (this.initialized) {
      console.log(
        `[Persistence] Already initialized with ${this.currentProvider.getName()}`
      );
      return this.currentProvider.getName();
    }

    if (preferFirebase) {
      // Try Firebase first
      const firebaseReady = await this.providers.firebase.init();
      if (firebaseReady) {
        this.currentProvider = this.providers.firebase;
        this.initialized = true;
        console.log("[Persistence] Using Firebase");
        return "firebase";
      }
      console.log("[Persistence] Firebase not available, falling back to localStorage");
    }

    // Fallback to localStorage
    const localReady = await this.providers.localStorage.init();
    if (localReady) {
      this.currentProvider = this.providers.localStorage;
      this.initialized = true;
      console.log("[Persistence] Using localStorage");
      return "localStorage";
    }

    throw new Error("No persistence provider available");
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

    const localData = await this.providers.localStorage.export();
    if (!localData || !localData.data) {
      return {
        success: false,
        error: "No local data to migrate",
      };
    }

    // Migrate to Firebase
    const result = await this.providers.firebase.migrate(localData.data);

    if (result.success) {
      // Switch to Firebase provider
      this.currentProvider = this.providers.firebase;
      console.log("[Persistence] Switched to Firebase after migration");
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

    const localExport = await this.providers.localStorage.export();
    const hasLocalData =
      localExport &&
      localExport.data &&
      Object.keys(localExport.data).length > 0;

    // Check if Firebase is available
    const firebaseReady = await this.providers.firebase.init();

    return hasLocalData && firebaseReady;
  }
}

// Singleton instance
export const persistence = new PersistenceManager();
export { DataTypes };
