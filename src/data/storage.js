/**
 * LocalStorage Data Persistence
 * Simple local storage for data that persists across sessions
 */

const STORAGE_KEY = "lifelab_data";
const SETTINGS_KEY = "lifelab_settings";

/**
 * Saves data to localStorage
 * @param {Object} data - Data object mapping months to day arrays
 */
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
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
 * Saves data for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {Array} monthData - Array of day records
 */
export function saveMonth(year, month, monthData) {
  const allData = loadFromLocalStorage();
  const key = `${year}-${String(month).padStart(2, "0")}`;
  allData[key] = monthData;
  return saveToLocalStorage(allData);
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
 * Adds or updates a single day entry
 * @param {Object} dayData - Day record
 * @returns {boolean} Success status
 */
export function saveDayEntry(dayData) {
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

  return saveMonth(year, month, monthData);
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
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
 * Gets default settings
 */
function getDefaultSettings() {
  return {
    domains: {
      health: true,
      skills: true,
      finance: true,
      academics: true,
    },
    theme: "light",
    firstDayOfWeek: 1, // Monday
  };
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
