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
  // Persistence manager is auth-aware and will use the right provider
  try {
    const result = await persistence.fetch(FIREBASE_COLLECTION);
    if (result && Array.isArray(result)) {
      return result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }
  } catch (error) {
    console.warn("Fetch failed:", error);
  }

  // Fallback to empty array
  return [];
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

  try {
    // Persistence manager handles localStorage vs Firebase based on auth
    const success = await persistence.save(FIREBASE_COLLECTION, reflection);
    return success;
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
  try {
    // Get all reflections
    const reflections = await listReflections();
    const filtered = reflections.filter((r) => r.id !== id);

    // Save updated list (persistence manager handles the provider)
    // Note: This is a workaround - ideally we'd have a delete() method
    // For now, we fetch all, filter, and save back
    for (const reflection of filtered) {
      await persistence.save(FIREBASE_COLLECTION, reflection);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete reflection:", error);
    return false;
  }
}
