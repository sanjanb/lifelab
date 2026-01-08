/**
 * LocalStorage Data Persistence
 * Simple local storage for data that persists across sessions
 *
 * NOTE: Gradually migrating to persistence layer (manager.js)
 * Direct localStorage calls will be phased out
 */

import { persistence, DataTypes } from "./persistence/manager.js";
import {
  migrateDomainSettings,
  createDomainConfig,
  DomainType,
  getDefaultValue,
} from "./domainTypes.js";

const STORAGE_KEY = "lifelab_data";
const SETTINGS_KEY = "lifelab_settings";

/**
 * Saves data to localStorage and Firebase
 * @param {Object} data - Data object mapping months to day arrays
 */
export async function saveToLocalStorage(data) {
  try {
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Save to Firebase (synchronous)
    await persistence.save(DataTypes.ENTRIES, data);

    return true;
  } catch (error) {
    console.error("Failed to save to storage:", error);
    return false;
  }
}

/**
 * Loads all data from localStorage
 * @returns {Object} Data object or empty object
 */
export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return {};
  }
}

/**
 * Loads all data from persistence layer (async)
 * @returns {Promise<Object>} Data object or empty object
 */
export async function loadAllData() {
  try {
    const entries = await persistence.fetch(DataTypes.ENTRIES);
    return entries || {};
  } catch (error) {
    console.error("Failed to load from persistence:", error);
    return loadFromLocalStorage(); // Fallback
  }
}

/**
 * Saves data for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {Array} monthData - Array of day records
 */
export async function saveMonth(year, month, monthData) {
  const allData = loadFromLocalStorage();
  const key = `${year}-${String(month).padStart(2, "0")}`;
  allData[key] = monthData;
  return await saveToLocalStorage(allData);
}

/**
 * Loads data for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Array} Array of day records
 */
export function loadMonth(year, month) {
  const allData = loadFromLocalStorage();
  const key = `${year}-${String(month).padStart(2, "0")}`;
  return allData[key] || [];
}

/**
 * Loads data for a specific month from Firebase first
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} Array of day records
 */
export async function loadMonthFromFirebase(year, month) {
  try {
    const allData = await persistence.fetch(DataTypes.ENTRIES);
    const key = `${year}-${String(month).padStart(2, "0")}`;
    return (allData && allData[key]) || loadMonth(year, month);
  } catch (error) {
    console.error("Failed to load from Firebase:", error);
    return loadMonth(year, month);
  }
}

/**
 * Adds or updates a single day entry
 * @param {Object} dayData - Day record
 * @returns {boolean} Success status
 */
export async function saveDayEntry(dayData) {
  const date = new Date(dayData.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  let monthData = loadMonth(year, month);

  // Remove existing entry for this date
  monthData = monthData.filter((d) => d.date !== dayData.date);

  // Add new entry
  monthData.push(dayData);

  // Sort by date
  monthData.sort((a, b) => a.date.localeCompare(b.date));

  return await saveMonth(year, month, monthData);
}

/**
 * Deletes a day entry
 * @param {string} date - ISO date string
 * @returns {boolean} Success status
 */
export function deleteDayEntry(date) {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;

  let monthData = loadMonth(year, month);
  monthData = monthData.filter((d) => d.date !== date);

  return saveMonth(year, month, monthData);
}

/**
 * Gets all months that have data
 * @returns {Array} Array of {year, month} objects
 */
export function getAvailableMonths() {
  const allData = loadFromLocalStorage();
  return Object.keys(allData)
    .map((key) => {
      const [year, month] = key.split("-");
      return {
        year: parseInt(year),
        month: parseInt(month),
        key,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Saves settings
 * @param {Object} settings - Settings object
 */
export async function saveSettings(settings) {
  try {
    // Save to localStorage immediately
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // Save to Firebase (synchronous)
    await persistence.save(DataTypes.SETTINGS, settings);

    return true;
  } catch (error) {
    console.error("Failed to save settings:", error);
    return false;
  }
}

/**
 * Loads settings
 * @returns {Object} Settings object
 */
export function loadSettings() {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : getDefaultSettings();
  } catch (error) {
    console.error("Failed to load settings:", error);
    return getDefaultSettings();
  }
}

/**
 * Loads settings from persistence layer (async)
 * @returns {Promise<Object>} Settings object or defaults
 */
export async function loadSettingsAsync() {
  try {
    const settings = await persistence.fetch(DataTypes.SETTINGS);
    return settings || loadSettings(); // Fallback to localStorage
  } catch (error) {
    console.error("Failed to load settings from persistence:", error);
    return loadSettings();
  }
}

/**
 * Gets default settings
 */
function getDefaultSettings() {
  return {
    domains: {
      health: createDomainConfig(DomainType.PERCENTAGE),
      skills: createDomainConfig(DomainType.PERCENTAGE),
      finance: createDomainConfig(DomainType.PERCENTAGE),
      academics: createDomainConfig(DomainType.PERCENTAGE),
    },
    theme: "light",
    firstDayOfWeek: 1, // Monday
    memoryAidsEnabled: false, // Memory Aids OFF by default
  };
}

/**
 * Gets enabled domains from settings
 * @returns {Object} Object with enabled domains initialized to default values
 */
export function getEnabledDomains() {
  const settings = loadSettings();
  const enabledDomains = {};

  Object.entries(settings.domains).forEach(([domain, config]) => {
    // Handle both old format (boolean) and new format (object)
    if (typeof config === "boolean") {
      if (config) {
        enabledDomains[domain] = 0; // Default to percentage type
      }
    } else if (config && config.enabled) {
      enabledDomains[domain] = getDefaultValue(
        config.type || DomainType.PERCENTAGE
      );
    }
  });

  return enabledDomains;
}

/**
 * Gets list of enabled domain names
 * @returns {Array} Array of enabled domain names
 */
export function getEnabledDomainNames() {
  const settings = loadSettings();
  return Object.entries(settings.domains)
    .filter(([_, config]) => {
      // Handle both old format (boolean) and new format (object)
      if (typeof config === "boolean") return config;
      return config && config.enabled;
    })
    .map(([domain, _]) => domain);
}

/**
 * Get domain configuration for a specific domain
 * @param {string} domain - Domain name
 * @returns {Object} Domain config {enabled, type}
 */
export function getDomainConfig(domain) {
  const settings = loadSettings();
  const config = settings.domains[domain];

  // Handle old format (boolean) - migrate on the fly
  if (typeof config === "boolean") {
    return createDomainConfig(DomainType.PERCENTAGE);
  }

  return config || createDomainConfig(DomainType.PERCENTAGE);
}

/**
 * Get all domain configurations
 * @returns {Object} All domain configs
 */
export function getAllDomainConfigs() {
  const settings = loadSettings();
  return migrateDomainSettings(settings.domains);
}

/**
 * Clears all data (with confirmation)
 * @returns {boolean} Success status
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear data:", error);
    return false;
  }
}

/**
 * Merges imported data with existing data
 * @param {Array} importedData - Array of day records to merge
 */
export function mergeImportedData(importedData) {
  const grouped = {};

  // Group imported data by month
  importedData.forEach((day) => {
    const date = new Date(day.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(day);
  });

  // Merge with existing data
  Object.entries(grouped).forEach(([key, days]) => {
    const [year, month] = key.split("-");
    const existingData = loadMonth(parseInt(year), parseInt(month));

    // Create a map of existing dates
    const dateMap = new Map(existingData.map((d) => [d.date, d]));

    // Add/update with imported data
    days.forEach((day) => {
      dateMap.set(day.date, day);
    });

    // Convert back to array and sort
    const mergedData = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    saveMonth(parseInt(year), parseInt(month), mergedData);
  });
}
