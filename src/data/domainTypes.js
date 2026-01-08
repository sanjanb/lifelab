/**
 * Domain Type System
 *
 * DESIGN PATTERN:
 * - Strategy Pattern: Different input/display strategies per domain type
 * - Open/Closed Principle: Easy to add new domain types without changing existing code
 * - Single Source of Truth: Domain metadata stored in settings
 *
 * ARCHITECTURE:
 * Settings: domain → {enabled: boolean, type: 'percentage' | 'checkbox'}
 * Data: domain → number (0-1) | boolean
 * UI: Renders appropriate input based on type
 * Viz: Normalizes values for display
 */

/**
 * Domain type enumeration
 */
export const DomainType = {
  PERCENTAGE: "percentage", // 0-1 scale (health, skills, etc.)
  CHECKBOX: "checkbox", // boolean (did task or not)
};

/**
 * Domain configuration metadata
 * @typedef {Object} DomainConfig
 * @property {boolean} enabled - Whether domain is active
 * @property {string} type - Domain type (percentage | checkbox)
 */

/**
 * Create default domain configuration
 * @param {string} type - Domain type
 * @returns {DomainConfig}
 */
export function createDomainConfig(type = DomainType.PERCENTAGE) {
  return {
    enabled: true,
    type,
  };
}

/**
 * Validate domain value based on type
 * @param {*} value - Value to validate
 * @param {string} type - Domain type
 * @returns {boolean}
 */
export function isValidDomainValue(value, type) {
  switch (type) {
    case DomainType.PERCENTAGE:
      return typeof value === "number" && value >= 0 && value <= 1;
    case DomainType.CHECKBOX:
      return typeof value === "boolean";
    default:
      return false;
  }
}

/**
 * Get default value for domain type
 * @param {string} type - Domain type
 * @returns {number|boolean}
 */
export function getDefaultValue(type) {
  switch (type) {
    case DomainType.PERCENTAGE:
      return 0;
    case DomainType.CHECKBOX:
      return false;
    default:
      return 0;
  }
}

/**
 * Normalize value to 0-1 for visualization
 * (Needed for graphs/heatmaps to handle mixed types)
 * @param {*} value - Domain value
 * @param {string} type - Domain type
 * @returns {number} Normalized 0-1 value
 */
export function normalizeValue(value, type) {
  switch (type) {
    case DomainType.PERCENTAGE:
      return typeof value === "number" ? value : 0;
    case DomainType.CHECKBOX:
      return value === true ? 1 : 0;
    default:
      return 0;
  }
}

/**
 * Format value for display
 * @param {*} value - Domain value
 * @param {string} type - Domain type
 * @returns {string}
 */
export function formatValue(value, type) {
  switch (type) {
    case DomainType.PERCENTAGE:
      return typeof value === "number" ? value.toFixed(2) : "—";
    case DomainType.CHECKBOX:
      return value === true ? "✓" : "—";
    default:
      return "—";
  }
}

/**
 * Migrate old domain settings to new format
 * Converts: {domain: boolean} → {domain: {enabled: boolean, type: 'percentage'}}
 * @param {Object} domains - Old domain settings
 * @returns {Object} New domain settings
 */
export function migrateDomainSettings(domains) {
  const migrated = {};

  Object.entries(domains).forEach(([domain, value]) => {
    // Check if already migrated (has 'enabled' and 'type' properties)
    if (
      typeof value === "object" &&
      value !== null &&
      "enabled" in value &&
      "type" in value
    ) {
      migrated[domain] = value;
    } else {
      // Old format: domain → boolean
      migrated[domain] = createDomainConfig(DomainType.PERCENTAGE);
      migrated[domain].enabled = Boolean(value);
    }
  });

  return migrated;
}
