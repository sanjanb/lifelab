/**
 * Reflection Data Store
 * Offline-first with Firebase sync
 *
 * Rules:
 * - No shared data models with daily logs or wins
 * - No sentiment analysis
 * - No word counts
 * - No analytics
 * - Offline-first: save locally, sync when available
 */

import { persistence } from "./persistence/manager.js";

const STORAGE_KEY = "lifelab_reflections";
const FIREBASE_COLLECTION = "reflections";

/**
 * Get all reflections
 * @returns {Promise<Array>} Array of reflection objects, sorted by date (newest first)
 */
export async function listReflections() {
  // Try Firebase first if available
  try {
    if (persistence.initialized && persistence.currentProvider?.getName() === "firebase") {
      const result = await persistence.fetch(FIREBASE_COLLECTION);
      if (result && Array.isArray(result)) {
        return result.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    }
  } catch (error) {
    console.warn("Firebase fetch failed, using localStorage:", error);
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const reflections = JSON.parse(stored);
    return reflections.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error("Failed to parse reflections:", error);
    return [];
  }
}

/**
 * Get a single reflection by ID
 * @param {string} id - Reflection ID
 * @returns {Promise<Object|null>} Reflection object or null
 */
export async function getReflection(id) {
  const reflections = await listReflections();
  return reflections.find((r) => r.id === id) || null;
}

/**
 * Save a reflection (create or update)
 * @param {Object} reflection - Reflection object
 * @returns {Promise<boolean>} Success status
 */
export async function saveReflection(reflection) {
  // Validate required fields
  if (!reflection.id || !reflection.content) {
    console.error("Invalid reflection: missing required fields");
    return false;
  }

  // Ensure createdAt is set
  if (!reflection.createdAt) {
    reflection.createdAt = new Date().toISOString();
  }

  // Save to localStorage first (offline-first)
  const reflections = await listReflections();
  const existingIndex = reflections.findIndex((r) => r.id === reflection.id);

  if (existingIndex >= 0) {
    reflections[existingIndex] = reflection;
  } else {
    reflections.push(reflection);
  }

  try {
    // Save locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));

    // Sync to Firebase if available (non-blocking)
    syncToFirebase(reflection).catch((err) =>
      console.warn("Firebase sync failed (will retry):", err)
    );

    return true;
  } catch (error) {
    console.error("Failed to save reflection:", error);
    return false;
  }
}

/**
 * Delete a reflection
 * @param {string} id - Reflection ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteReflection(id) {
  const reflections = await listReflections();
  const filtered = reflections.filter((r) => r.id !== id);

  try {
    // Delete locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Delete from Firebase if available (non-blocking)
    deleteFromFirebase(id).catch((err) =>
      console.warn("Firebase delete failed:", err)
    );

    return true;
  } catch (error) {
    console.error("Failed to delete reflection:", error);
    return false;
  }
}

/**
 * Sync a reflection to Firebase (internal)
 * @param {Object} reflection - Reflection to sync
 */
async function syncToFirebase(reflection) {
  if (!persistence.initialized) {
    await persistence.init(true);
  }

  if (persistence.currentProvider?.getName() === "firebase") {
    await persistence.save(FIREBASE_COLLECTION, reflection);
  }
}

/**
 * Delete a reflection from Firebase (internal)
 * @param {string} id - Reflection ID
 */
async function deleteFromFirebase(id) {
  if (!persistence.initialized) {
    await persistence.init(true);
  }

  if (persistence.currentProvider?.getName() === "firebase") {
    // Firebase provider should handle deletion
    // This is a placeholder - actual implementation depends on FirebaseProvider
    console.log("Firebase delete requested for:", id);
  }
}
