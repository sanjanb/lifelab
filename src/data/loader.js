/**
 * Data loader for monthly JSON files
 * Works identically in localhost and GitHub Pages
 */

import { setMonthlyData } from "./store.js";
import { isValidDayRecord } from "./schema.js";

/**
 * Constructs the path to a monthly data file
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {string} Path to JSON file
 */
function getMonthFilePath(year, month) {
  const monthStr = String(month).padStart(2, "0");
  return `/data/months/${year}-${monthStr}.json`;
}

/**
 * Loads data for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} Array of day records
 */
export async function loadMonth(year, month) {
  const path = getMonthFilePath(year, month);

  try {
    const response = await fetch(path);

    if (!response.ok) {
      // Month file doesn't exist - return empty array
      console.warn(`No data found for ${year}-${month}`);
      return [];
    }

    const data = await response.json();

    // Validate data
    if (!Array.isArray(data)) {
      console.error(`Invalid data format for ${year}-${month}`);
      return [];
    }

    // Filter out invalid records
    const validRecords = data.filter((record) => {
      if (!isValidDayRecord(record)) {
        console.warn("Invalid record found:", record);
        return false;
      }
      return true;
    });

    // Update store
    setMonthlyData(validRecords, year, month);

    return validRecords;
  } catch (error) {
    console.error(`Error loading month ${year}-${month}:`, error);
    return [];
  }
}

/**
 * Loads the current month's data
 * @returns {Promise<Array>} Array of day records
 */
export async function loadCurrentMonth() {
  const now = new Date();
  return loadMonth(now.getFullYear(), now.getMonth() + 1);
}

/**
 * Loads data for multiple months
 * @param {Array<{year: number, month: number}>} periods - Array of year/month objects
 * @returns {Promise<Array>} Array of all loaded records
 */
export async function loadMultipleMonths(periods) {
  const promises = periods.map((p) => loadMonth(p.year, p.month));
  const results = await Promise.all(promises);
  return results.flat();
}
