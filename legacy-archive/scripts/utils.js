/*
 * Utility Functions
 * Shared helper functions used across the application
 * Includes: date formatting, validation, DOM helpers, data transformations
 * Pure functions with no side effects
 */

/**
 * LifeLab Universal Entry Model
 *
 * This defines the standard structure for all entries across all domains.
 * Every entry, regardless of domain, must follow this structure.
 * This ensures cross-domain consistency and enables future analytics.
 *
 * Entry Structure:
 * {
 *   id: string          // Unique identifier (required)
 *   timestamp: number   // Unix timestamp in milliseconds (required)
 *   value: any          // The main data value (required, type varies by domain)
 *   notes: string       // Optional user notes (optional)
 * }
 *
 * Domain-Specific Interpretation:
 * - Habits: value = habit name or completion status
 * - Learning: value = skill/course name or progress
 * - Career: value = achievement or goal
 * - Health: value = metric measurement or activity
 *
 * The 'value' field is intentionally generic to allow each domain
 * to interpret it according to its needs without breaking the universal structure.
 *
 * For complex data, domains can store structured objects in 'value',
 * but the entry itself maintains this consistent schema.
 */

/**
 * Create a new entry with proper structure
 * Factory function to ensure all entries follow the standard model
 *
 * @param {any} value - The main entry value (domain-specific)
 * @param {string} [notes=''] - Optional notes
 * @returns {Object} Properly structured entry object
 */
function createEntry(value, notes = "") {
  return {
    id: generateUniqueId(),
    timestamp: Date.now(),
    value: value,
    notes: notes,
  };
}

/**
 * Validate if an object follows the entry structure
 *
 * @param {Object} entry - Object to validate
 * @returns {boolean} True if valid entry structure
 */
function isValidEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  // Required fields
  if (!entry.id || typeof entry.id !== "string") {
    return false;
  }

  if (!entry.timestamp || typeof entry.timestamp !== "number") {
    return false;
  }

  if (entry.value === undefined || entry.value === null) {
    return false;
  }

  // Notes is optional but must be string if present
  if (entry.notes !== undefined && typeof entry.notes !== "string") {
    return false;
  }

  return true;
}

/**
 * Generate a unique ID for entries
 * Uses timestamp + random string to ensure uniqueness
 *
 * @returns {string} Unique identifier
 */
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp to human-readable date
 *
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format timestamp to human-readable date and time
 *
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date and time string
 */
function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createEntry,
    isValidEntry,
    generateUniqueId,
    formatDate,
    formatDateTime,
  };
}
