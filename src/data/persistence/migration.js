/**
 * Local Storage → Firebase Migration
 * 
 * PHILOSOPHY:
 * ===========
 * Respect existing users' data.
 * Never auto-delete. Never auto-migrate. Always ask.
 * 
 * MIGRATION STRATEGY:
 * ===================
 * 1. Detect local data on sign-in
 * 2. Prompt user once
 * 3. Migrate explicitly with user consent
 * 4. Preserve local copy unless user confirms deletion
 * 
 * @see docs/AUTHENTICATION.md - Phase 6
 */

import { getCurrentUserId } from "./authState.js";
import { UserNamespace } from "./userDataNamespace.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseInstances } from "./firebaseConfig.js";

/**
 * LocalStorage keys used by LifeLab
 */
const STORAGE_KEYS = {
  SETTINGS: "settings",
  WINS: "wins",
  JOURNAL: "journal",
  REFLECTIONS: "reflections",
  MEMORY_SELECTION: "memorySelection",
  MIGRATION_COMPLETED: "migrationCompleted",
  MIGRATION_DISMISSED: "migrationDismissed",
};

/**
 * Detect if user has existing localStorage data
 * @returns {Object} Detection results
 */
export function detectLocalData() {
  const detection = {
    hasData: false,
    wins: 0,
    journalEntries: 0,
    reflections: 0,
    hasSettings: false,
  };

  try {
    // Check wins
    const winsData = localStorage.getItem(STORAGE_KEYS.WINS);
    if (winsData) {
      const wins = JSON.parse(winsData);
      detection.wins = Array.isArray(wins) ? wins.length : 0;
      if (detection.wins > 0) detection.hasData = true;
    }

    // Check journal
    const journalData = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (journalData) {
      const journal = JSON.parse(journalData);
      detection.journalEntries = Array.isArray(journal) ? journal.length : 0;
      if (detection.journalEntries > 0) detection.hasData = true;
    }

    // Check reflections
    const reflectionsData = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (reflectionsData) {
      const reflections = JSON.parse(reflectionsData);
      detection.reflections = Array.isArray(reflections)
        ? reflections.length
        : 0;
      if (detection.reflections > 0) detection.hasData = true;
    }

    // Check settings
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsData) {
      detection.hasSettings = true;
      detection.hasData = true;
    }
  } catch (error) {
    console.error("[Migration] Error detecting local data:", error);
  }

  return detection;
}

/**
 * Check if user has already completed or dismissed migration
 * @returns {Object} Migration state
 */
export function getMigrationState() {
  const completed =
    localStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETED) === "true";
  const dismissed =
    localStorage.getItem(STORAGE_KEYS.MIGRATION_DISMISSED) === "true";

  return { completed, dismissed };
}

/**
 * Check if migration prompt should be shown
 * @returns {boolean} True if should show prompt
 */
export function shouldShowMigrationPrompt() {
  const detection = detectLocalData();
  const state = getMigrationState();

  // Don't show if no data, already completed, or already dismissed
  if (!detection.hasData || state.completed || state.dismissed) {
    return false;
  }

  return true;
}

/**
 * Migrate user data from localStorage to Firebase
 * @returns {Promise<Object>} Migration results
 */
export async function migrateToFirebase() {
  const uid = getCurrentUserId();

  if (!uid) {
    throw new Error("Cannot migrate: User not authenticated");
  }

  const { db } = getFirebaseInstances();

  if (!db) {
    throw new Error("Cannot migrate: Firebase not initialized");
  }

  const results = {
    success: false,
    wins: 0,
    journalEntries: 0,
    reflections: 0,
    settings: false,
    errors: [],
  };

  try {
    console.log("[Migration] Starting migration for user:", uid);

    // Migrate wins
    const winsData = localStorage.getItem(STORAGE_KEYS.WINS);
    if (winsData) {
      const wins = JSON.parse(winsData);
      if (Array.isArray(wins)) {
        for (const win of wins) {
          try {
            const winId = win.id || `win_${Date.now()}_${Math.random()}`;
            const winRef = doc(db, UserNamespace.winPath(winId, uid));
            await setDoc(winRef, {
              ...win,
              migratedAt: serverTimestamp(),
            });
            results.wins++;
          } catch (error) {
            console.error("[Migration] Error migrating win:", error);
            results.errors.push(`Win: ${error.message}`);
          }
        }
      }
    }

    // Migrate journal entries
    const journalData = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (journalData) {
      const entries = JSON.parse(journalData);
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          try {
            const entryId =
              entry.date || `entry_${Date.now()}_${Math.random()}`;
            const entryRef = doc(
              db,
              UserNamespace.journalEntryPath(entryId, uid)
            );
            await setDoc(entryRef, {
              ...entry,
              migratedAt: serverTimestamp(),
            });
            results.journalEntries++;
          } catch (error) {
            console.error("[Migration] Error migrating journal entry:", error);
            results.errors.push(`Journal: ${error.message}`);
          }
        }
      }
    }

    // Migrate reflections
    const reflectionsData = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (reflectionsData) {
      const reflections = JSON.parse(reflectionsData);
      if (Array.isArray(reflections)) {
        for (const reflection of reflections) {
          try {
            const reflectionId =
              reflection.id || `reflection_${Date.now()}_${Math.random()}`;
            const reflectionRef = doc(
              db,
              UserNamespace.reflectionPath(reflectionId, uid)
            );
            await setDoc(reflectionRef, {
              ...reflection,
              migratedAt: serverTimestamp(),
            });
            results.reflections++;
          } catch (error) {
            console.error("[Migration] Error migrating reflection:", error);
            results.errors.push(`Reflection: ${error.message}`);
          }
        }
      }
    }

    // Migrate settings
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsData) {
      try {
        const settings = JSON.parse(settingsData);
        const settingsRef = doc(db, UserNamespace.settingsPath(uid), "app");
        await setDoc(settingsRef, {
          ...settings,
          migratedAt: serverTimestamp(),
        });
        results.settings = true;
      } catch (error) {
        console.error("[Migration] Error migrating settings:", error);
        results.errors.push(`Settings: ${error.message}`);
      }
    }

    // Mark migration as completed
    localStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETED, "true");

    results.success = results.errors.length === 0;

    console.log("[Migration] Migration completed:", results);

    return results;
  } catch (error) {
    console.error("[Migration] Migration failed:", error);
    results.errors.push(`Fatal: ${error.message}`);
    return results;
  }
}

/**
 * Clear local storage data after successful migration
 * ONLY called after explicit user confirmation
 */
export function clearLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.WINS);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL);
    localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.MEMORY_SELECTION);

    console.log("[Migration] Local data cleared");
    return true;
  } catch (error) {
    console.error("[Migration] Error clearing local data:", error);
    return false;
  }
}

/**
 * Dismiss migration prompt (user chose not to migrate)
 */
export function dismissMigration() {
  localStorage.setItem(STORAGE_KEYS.MIGRATION_DISMISSED, "true");
  console.log("[Migration] Migration dismissed by user");
}

/**
 * Reset migration state (for testing/debugging)
 */
export function resetMigrationState() {
  localStorage.removeItem(STORAGE_KEYS.MIGRATION_COMPLETED);
  localStorage.removeItem(STORAGE_KEYS.MIGRATION_DISMISSED);
  console.log("[Migration] Migration state reset");
}
