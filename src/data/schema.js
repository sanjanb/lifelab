/**
 * Data Schema for LifeLab
 *
 * Core principle: One day = one record
 * Each day tracks multiple domains (0-1 scale)
 * Extensible design - new domains can be added without breaking old data
 */

/**
 * Creates a new day record
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {Object} domains - Object mapping domain names to scores (0-1)
 * @param {string} notes - Optional notes for the day
 * @returns {Object} Day record
 */
export function createDayRecord(date, domains = {}, notes = "") {
  return {
    date,
    domains,
    notes,
  };
}

/**
 * Default domains for tracking
 * Can be extended without breaking existing data
 */
export const DEFAULT_DOMAINS = {
  health: 0,
  skills: 0,
  finance: 0,
  academics: 0,
};

/**
 * Validates a day record
 * @param {Object} day - Day record to validate
 * @returns {boolean} True if valid
 */
export function isValidDayRecord(day) {
  if (!day || typeof day !== "object") return false;
  if (!day.date || typeof day.date !== "string") return false;
  if (!day.domains || typeof day.domains !== "object") return false;

  // Validate domain scores are between 0 and 1
  for (const [domain, score] of Object.entries(day.domains)) {
    if (typeof score !== "number" || score < 0 || score > 1) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates weighted daily score
 * @param {Object} day - Day record
 * @returns {number|null} Average score or null if no domains
 */
export function calculateDailyScore(day) {
  if (!day || !day.domains) return null;

  const scores = Object.values(day.domains);
  if (scores.length === 0) return null;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

/**
 * Gets all unique domains across an array of day records
 * @param {Array} days - Array of day records
 * @returns {Set} Set of domain names
 */
export function getAllDomains(days) {
  const domains = new Set();
  days.forEach((day) => {
    if (day.domains) {
      Object.keys(day.domains).forEach((domain) => domains.add(domain));
    }
  });
  return domains;
}
