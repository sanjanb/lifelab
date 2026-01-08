/**
 * Firebase Persistence Provider
 *
 * Implements persistence interface using Firebase Firestore.
 *
 * Schema (Shared - No Authentication):
 * lifelab_data/
 *   ├─ shared_data/wins (collection)
 *   ├─ shared_data/entries (collection)
 *   ├─ shared_data/settings (document)
 *   └─ shared_data/meta (document)
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import {
  PersistenceProvider,
  DataTypes,
  SCHEMA_VERSION,
  MigrationState,
  validateData,
} from "./interface.js";
import { initFirebase, getSharedDocId } from "./firebaseConfig.js";

export class FirebaseProvider extends PersistenceProvider {
  constructor() {
    super();
    this.ready = false;
    this.db = null;
    this.sharedId = null;
  }

  async init() {
    try {
      // Initialize Firebase (no auth required)
      const { db } = await initFirebase();

      if (!db) {
        console.error("[Firebase] Failed to initialize");
        return false;
      }

      this.db = db;
      this.sharedId = getSharedDocId();
      this.ready = true;
      console.log("[Firebase] Provider ready (no auth)");
      return true;
    } catch (error) {
      console.error("[Firebase] Initialization failed:", error);
      return false;
    }
  }

  async save(type, data) {
    if (!this.ready) {
      console.error("[Firebase] Provider not ready");
      return false;
    }

    // Validate data shape
    const validation = validateData(type, data);
    if (!validation.valid) {
      console.error(
        `[Firebase] Validation failed for ${type}:`,
        validation.errors
      );
      // Fail hard on Firebase writes - we control the schema
      return false;
    }

    try {
      switch (type) {
        case DataTypes.WINS:
          return await this._saveWins(data);
        case DataTypes.ENTRIES:
          return await this._saveEntries(data);
        case DataTypes.SETTINGS:
          return await this._saveSettings(data);
        case DataTypes.META:
          return await this._saveMeta(data);
        default:
          console.error(`[Firebase] Unknown type: ${type}`);
          return false;
      }
    } catch (error) {
      console.error(`[Firebase] Failed to save ${type}:`, error);
      return false;
    }
  }

  async fetch(type, options = {}) {
    if (!this.ready) {
      console.error("[Firebase] Provider not ready");
      return null;
    }

    try {
      switch (type) {
        case DataTypes.WINS:
          return await this._fetchWins(options);
        case DataTypes.ENTRIES:
          return await this._fetchEntries(options);
        case DataTypes.SETTINGS:
          return await this._fetchSettings();
        case DataTypes.META:
          return await this._fetchMeta();
        default:
          console.error(`[Firebase] Unknown type: ${type}`);
          return null;
      }
    } catch (error) {
      console.error(`[Firebase] Failed to fetch ${type}:`, error);
      return null;
    }
  }

  async migrate(localData) {
    if (!this.ready || !this.uid) {
      return {
        success: false,
        error: "Firebase not ready",
        itemsMigrated: 0,
      };
    }

    try {
      let itemsMigrated = 0;

      // Migrate wins
      if (localData.wins) {
        await this.save(DataTypes.WINS, localData.wins);
        itemsMigrated += Object.keys(localData.wins).length;
      }

      // Migrate entries
      if (localData.entries) {
        await this.save(DataTypes.ENTRIES, localData.entries);
        itemsMigrated += Object.keys(localData.entries).length;
      }

      // Migrate settings
      if (localData.settings) {
        await this.save(DataTypes.SETTINGS, localData.settings);
        itemsMigrated += 1;
      }

      // Update migration meta
      await this._saveMeta({
        migratedAt: new Date().toISOString(),
        migratedFrom: "localStorage",
        schemaVersion: SCHEMA_VERSION,
      });

      console.log(`[Firebase] Migrated ${itemsMigrated} items`);

      return {
        success: true,
        itemsMigrated,
      };
    } catch (error) {
      console.error("[Firebase] Migration failed:", error);
      return {
        success: false,
        error: error.message,
        itemsMigrated: 0,
      };
    }
  }

  async export() {
    if (!this.ready) {
      console.error("[Firebase] Provider not ready");
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
      console.error("[Firebase] Export failed:", error);
      return null;
    }
  }

  getName() {
    return "firebase";
  }

  isReady() {
    return this.ready && this.db !== null;
  }

  // Private helper methods

  async _saveWins(wins) {
    const winsRef = collection(this.db, "lifelab_data", this.sharedId, "wins");

    // Convert wins object to array format if needed
    const winsArray = Array.isArray(wins) ? wins : Object.entries(wins).map(([date, win]) => ({ ...win, date }));

    for (const win of winsArray) {
      const winRef = doc(winsRef, win.date);
      await setDoc(winRef, {
        ...win,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  }

  async _fetchWins(options) {
    const winsRef = collection(this.db, "lifelab_data", this.sharedId, "wins");
    const snapshot = await getDocs(winsRef);

    const wins = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Convert Firestore timestamps to ISO strings
      wins[doc.id] = {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    return wins;
  }

  async _saveEntries(entries) {
    const entriesRef = collection(this.db, "lifelab_data", this.sharedId, "entries");

    for (const [monthKey, monthData] of Object.entries(entries)) {
      const entryRef = doc(entriesRef, monthKey);
      await setDoc(entryRef, {
        data: monthData,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  }

  async _fetchEntries(options) {
    const entriesRef = collection(this.db, "lifelab_data", this.sharedId, "entries");
    const snapshot = await getDocs(entriesRef);

    const entries = {};
    snapshot.forEach((doc) => {
      entries[doc.id] = doc.data().data;
    });

    return entries;
  }

  async _saveSettings(settings) {
    const settingsRef = doc(this.db, "lifelab_data", this.sharedId, "settings");
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
    return true;
  }

  async _fetchSettings() {
    const settingsRef = doc(this.db, "lifelab_data", this.sharedId, "settings");
    const settingsDoc = await getDoc(settingsRef);
    return settingsDoc.exists() ? settingsDoc.data() : null;
  }

  async _saveMeta(meta) {
    const metaRef = doc(this.db, "lifelab_data", this.sharedId, "meta");
    await setDoc(metaRef, {
      ...meta,
      updatedAt: serverTimestamp(),
    });
    return true;
  }

  async _fetchMeta() {
    const metaRef = doc(this.db, "lifelab_data", this.sharedId, "meta");
    const metaDoc = await getDoc(metaRef);
    return metaDoc.exists() ? metaDoc.data() : null;
  }
}
