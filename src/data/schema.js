/**
 * Data Schema for LifeLab
 *
 * Core principle: One day = one record
 * Each day tracks multiple domains with different types:
 * - Percentage domains: 0-1 scale (health, skills, etc.)
 * - Checkbox domains: boolean (did task or not)
 * Extensible design - new domains can be added without breaking old data
 */

import { isValidDomainValue, DomainType } from "./domainTypes.js";

/**
 * Creates a new day record
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {Object} domains - Object mapping domain names to scores (0-1) or booleans
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
 * Validates a day record with mixed domain types
 * @param {Object} day - Day record to validate
 * @param {Object} domainConfigs - Domain configurations from settings
 * @returns {boolean} True if valid
 */
export function isValidDayRecord(day, domainConfigs = null) {
  if (!day || typeof day !== "object") return false;
  if (!day.date || typeof day.date !== "string") return false;
  if (!day.domains || typeof day.domains !== "object") return false;

  // If domain configs provided, validate against types
  if (domainConfigs) {
    for (const [domain, value] of Object.entries(day.domains)) {
      const config = domainConfigs[domain];
      if (!config) continue; // Unknown domain, skip

      const type = config.type || DomainType.PERCENTAGE;
      if (!isValidDomainValue(value, type)) {
        console.warn(
          `Invalid value for domain ${domain} (type: ${type}):`,
          value
        );
        return false;
      }
    }
  } else {
    // Backward compatibility: allow numbers 0-1 or booleans
    for (const [domain, value] of Object.entries(day.domains)) {
      const isNumber = typeof value === "number" && value >= 0 && value <= 1;
      const isBoolean = typeof value === "boolean";

      if (!isNumber && !isBoolean) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Calculates weighted daily score
 * Normalizes checkbox domains (true=1, false=0) to work with percentages
 * @param {Object} day - Day record
 * @param {Object} domainConfigs - Domain configurations from settings
 * @returns {number|null} Average score or null if no domains
 */
export function calculateDailyScore(day, domainConfigs = null) {
  if (!day || !day.domains) return null;

  const scores = [];

  Object.entries(day.domains).forEach(([domain, value]) => {
    // Normalize value to 0-1 range
    if (typeof value === "boolean") {
      scores.push(value ? 1 : 0);
    } else if (typeof value === "number") {
      scores.push(value);
    }
  });

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
