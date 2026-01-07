/**
 * Simple in-memory data store
 * No hidden state, no reactivity - just plain data
 */

let currentMonth = null;
let currentYear = null;
let monthlyData = {};

/**
 * Sets the current month data
 * @param {Array} data - Array of day records
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 */
export function setMonthlyData(data, year, month) {
  currentYear = year;
  currentMonth = month;
  monthlyData = {
    year,
    month,
    days: data
  };
}

/**
 * Gets the current monthly data
 * @returns {Object|null} Monthly data object or null
 */
export function getMonthlyData() {
  return monthlyData;
}

/**
 * Gets data for a specific date
 * @param {string} date - ISO date string
 * @returns {Object|null} Day record or null
 */
export function getDayData(date) {
  if (!monthlyData.days) return null;
  return monthlyData.days.find(day => day.date === date) || null;
}

/**
 * Clears all data
 */
export function clearData() {
  currentMonth = null;
  currentYear = null;
  monthlyData = {};
}

/**
 * Gets current year and month
 * @returns {Object} {year, month}
 */
export function getCurrentPeriod() {
  return {
    year: currentYear,
    month: currentMonth
  };
}
