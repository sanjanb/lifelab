/*
 * Application Configuration
 * Contains global settings, API endpoints, feature flags
 * Environment-specific configurations
 * Module registration and initialization settings
 */

/**
 * LifeLab Domain Configuration
 *
 * This is the central registry for all life domains in the application.
 * To add a new domain:
 * 1. Add a new object to the DOMAINS array below
 * 2. Create the corresponding module folder in /modules/
 * 3. The domain will automatically appear in navigation and storage
 *
 * Each domain must have:
 * - id: unique identifier (lowercase, no spaces)
 * - displayName: user-facing name
 * - description: brief explanation of the domain
 * - storageKey: localStorage key for this domain's data
 * - analysistraits: optional traits that influence insight phrasing (NOT calculations)
 *   - expectsContinuity: boolean - whether gaps are noteworthy
 *   - naturallyCyclical: boolean - whether activity comes in cycles
 *   - isEnergySensitive: boolean - whether energy affects participation
 *
 * IMPORTANT: Analysis traits do NOT affect:
 * - Storage structure
 * - Logging behavior
 * - Calculations or aggregations
 *
 * They ONLY affect:
 * - Language used in insights
 * - How patterns are described to the user
 */

const DOMAINS = [
  {
    id: "habits",
    displayName: "Habits",
    description: "Track daily habits and build streaks",
    storageKey: "lifelab_habits",
    analysistraits: {
      expectsContinuity: true, // Habits benefit from consistency
      naturallyCyclical: false, // Not cyclical by nature
      isEnergySensitive: false, // Should persist regardless of energy
    },
  },
  {
    id: "learning",
    displayName: "Learning",
    description: "Manage learning goals, courses, and skill development",
    storageKey: "lifelab_learning",
    analysistraits: {
      expectsContinuity: false, // Learning can be project-based, not daily
      naturallyCyclical: false, // Not cyclical
      isEnergySensitive: true, // Requires mental energy and focus
    },
  },
  {
    id: "career",
    displayName: "Career",
    description: "Track career goals, projects, and professional growth",
    storageKey: "lifelab_career",
    analysistraits: {
      expectsContinuity: false, // Career work can be sporadic/project-based
      naturallyCyclical: true, // May have busy and quiet periods
      isEnergySensitive: true, // Requires mental/emotional energy
    },
  },
  {
    id: "health",
    displayName: "Health",
    description: "Monitor fitness, nutrition, and wellness metrics",
    storageKey: "lifelab_health",
    analysistraits: {
      expectsContinuity: true, // Health benefits from regular attention
      naturallyCyclical: false, // Not naturally cyclical
      isEnergySensitive: false, // Should persist even when low energy
    },
  },
];

/**
 * Get domain configuration by ID
 * @param {string} domainId - The domain identifier
 * @returns {Object|null} Domain configuration or null if not found
 */
function getDomainById(domainId) {
  return DOMAINS.find((domain) => domain.id === domainId) || null;
}

/**
 * Get all configured domains
 * @returns {Array} Array of all domain configurations
 */
function getAllDomains() {
  return DOMAINS;
}

// Export configuration for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DOMAINS, getDomainById, getAllDomains };
}
