/**
 * Firebase Persistence Provider
 * 
 * Implements persistence interface using Firebase Firestore.
 * 
 * Schema:
 * users/{uid}/
 *   ├─ wins/{date}
 *   ├─ entries/{monthKey}
 *   ├─ settings/config
 *   └─ meta/info
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import {
  PersistenceProvider,
  DataTypes,
  SCHEMA_VERSION,
} from "./interface.js";
import {
  initFirebase,
  getFirebaseInstances,
  getCurrentUserId,
} from "./firebaseConfig.js";

export class FirebaseProvider extends PersistenceProvider {
  constructor() {
    super();
    this.ready = false;
    this.db = null;
    this.uid = null;
  }

  async init() {
    try {
      // Initialize Firebase (non-blocking)
      const { db, auth } = await initFirebase();

      if (!db || !auth) {
        console.error("[Firebase] Failed to initialize");
        return false;
      }

      this.db = db;

      // Wait for auth state
      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          if (user) {
            this.uid = user.uid;
            this.ready = true;
            console.log("[Firebase] Provider ready for user:", this.uid);
            this._ensureUserRoot();
            resolve(true);
          } else {
            console.log("[Firebase] No authenticated user");
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error("[Firebase] Initialization failed:", error);
      return false;
    }
  }

  async save(type, data) {
    if (!this.ready || !this.uid) {
      console.error("[Firebase] Provider not ready");
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
    if (!this.ready || !this.uid) {
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
    if (!this.ready || !this.uid) {
      console.error("[Firebase] Provider not ready");
      return null;
    }

    try {
      const exportData = {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        provider: this.getName(),
        uid: this.uid,
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
    return this.ready && this.uid !== null;
  }

  // Private helper methods

  async _ensureUserRoot() {
    try {
      const userRef = doc(this.db, "users", this.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          createdAt: serverTimestamp(),
          schemaVersion: SCHEMA_VERSION,
        });
        console.log("[Firebase] Created user root");
      }
    } catch (error) {
      console.error("[Firebase] Failed to ensure user root:", error);
    }
  }

  async _saveWins(wins) {
    const winsRef = collection(this.db, "users", this.uid, "wins");

    for (const [date, win] of Object.entries(wins)) {
      const winRef = doc(winsRef, date);
      await setDoc(winRef, {
        ...win,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  }

  async _fetchWins(options) {
    const winsRef = collection(this.db, "users", this.uid, "wins");
    const snapshot = await getDocs(winsRef);

    const wins = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Convert Firestore timestamps to ISO strings
      wins[doc.id] = {
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    return wins;
  }

  async _saveEntries(entries) {
    const entriesRef = collection(this.db, "users", this.uid, "entries");

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
    const entriesRef = collection(this.db, "users", this.uid, "entries");
    const snapshot = await getDocs(entriesRef);

    const entries = {};
    snapshot.forEach((doc) => {
      entries[doc.id] = doc.data().data;
    });

    return entries;
  }

  async _saveSettings(settings) {
    const settingsRef = doc(this.db, "users", this.uid, "settings", "config");
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
    return true;
  }

  async _fetchSettings() {
    const settingsRef = doc(this.db, "users", this.uid, "settings", "config");
    const settingsDoc = await getDoc(settingsRef);
    return settingsDoc.exists() ? settingsDoc.data() : null;
  }

  async _saveMeta(meta) {
    const metaRef = doc(this.db, "users", this.uid, "meta", "info");
    await setDoc(metaRef, {
      ...meta,
      updatedAt: serverTimestamp(),
    });
    return true;
  }

  async _fetchMeta() {
    const metaRef = doc(this.db, "users", this.uid, "meta", "info");
    const metaDoc = await getDoc(metaRef);
    return metaDoc.exists() ? metaDoc.data() : null;
  }
}
