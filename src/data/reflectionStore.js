/**
 * Reflection Data Store
 * Local storage only for now - Firebase integration in Phase 6
 *
 * Rules:
 * - No shared data models with daily logs or wins
 * - No sentiment analysis
 * - No word counts
 * - No analytics
 */

const STORAGE_KEY = "lifelab_reflections";

/**
 * Get all reflections
 * @returns {Array} Array of reflection objects, sorted by date (newest first)
 */
export function listReflections() {
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
 * @returns {Object|null} Reflection object or null
 */
export function getReflection(id) {
  const reflections = listReflections();
  return reflections.find((r) => r.id === id) || null;
}

/**
 * Save a reflection (create or update)
 * @param {Object} reflection - Reflection object
 * @returns {boolean} Success status
 */
export function saveReflection(reflection) {
  // Validate required fields
  if (!reflection.id || !reflection.content) {
    console.error("Invalid reflection: missing required fields");
    return false;
  }

  // Ensure createdAt is set
  if (!reflection.createdAt) {
    reflection.createdAt = new Date().toISOString();
  }

  const reflections = listReflections();
  const existingIndex = reflections.findIndex((r) => r.id === reflection.id);

  if (existingIndex >= 0) {
    // Update existing
    reflections[existingIndex] = reflection;
  } else {
    // Add new
    reflections.push(reflection);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
    return true;
  } catch (error) {
    console.error("Failed to save reflection:", error);
    return false;
  }
}

/**
 * Delete a reflection
 * @param {string} id - Reflection ID
 * @returns {boolean} Success status
 */
export function deleteReflection(id) {
  const reflections = listReflections();
  const filtered = reflections.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete reflection:", error);
    return false;
  }
}
