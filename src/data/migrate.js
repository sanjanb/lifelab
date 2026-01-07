/**
 * Data Migration Utility
 * Import JSON files from /public/data/months into LocalStorage
 */

import { saveMonth } from "./storage.js";

/**
 * Migrates JSON file data to LocalStorage
 * @param {string} year - Year
 * @param {string} month - Month (2 digits)
 * @returns {Promise<boolean>} Success status
 */
export async function migrateMonthFromJSON(year, month) {
  try {
    const response = await fetch(`/data/months/${year}-${month}.json`);

    if (!response.ok) {
      console.warn(`No JSON file found for ${year}-${month}`);
      return false;
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(`Invalid format for ${year}-${month}`);
      return false;
    }

    // Save to LocalStorage
    saveMonth(parseInt(year), parseInt(month), data);
    console.log(`Migrated ${data.length} entries for ${year}-${month}`);
    return true;
  } catch (error) {
    console.error(`Failed to migrate ${year}-${month}:`, error);
    return false;
  }
}

/**
 * Auto-migrate current month if LocalStorage is empty
 */
export async function autoMigrate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  await migrateMonthFromJSON(year, month);
}
