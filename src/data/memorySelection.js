/**
 * Memory Selection Logic
 *
 * RULES:
 * - Returns ONE entry or null
 * - Priority: same date → same month → same week
 * - No comparisons or metrics
 * - No evaluation language
 */

/**
 * Select a memory for "On This Day"
 *
 * Selection priority:
 * 1. Exact calendar date from previous years (YYYY-MM-DD)
 * 2. Same month, closest date
 * 3. Same ISO week, any year
 *
 * @param {Date} today - Today's date
 * @param {Array} entries - Array of {date, content, type} objects
 * @returns {Object|null} Single entry or null
 */
export function selectMemory(today, entries) {
  if (!entries || entries.length === 0) return null;

  const todayStr = formatDate(today);
  const [todayYear, todayMonth, todayDay] = todayStr.split("-").map(Number);

  // Filter entries from the past (not today or future)
  const pastEntries = entries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    return entryDate < today;
  });

  if (pastEntries.length === 0) return null;

  // Priority 1: Exact date from previous years
  const sameDateMemories = pastEntries.filter((entry) => {
    const [year, month, day] = entry.date.split("-").map(Number);
    return month === todayMonth && day === todayDay && year !== todayYear;
  });

  if (sameDateMemories.length > 0) {
    // Return the most recent one from past years
    return sameDateMemories.sort((a, b) => b.date.localeCompare(a.date))[0];
  }

  // Priority 2: Same month, closest date
  const sameMonthMemories = pastEntries.filter((entry) => {
    const [year, month] = entry.date.split("-").map(Number);
    return month === todayMonth && year !== todayYear;
  });

  if (sameMonthMemories.length > 0) {
    // Find closest date by day difference
    const closest = sameMonthMemories.reduce((closest, entry) => {
      const [, , day] = entry.date.split("-").map(Number);
      const [, , closestDay] = closest.date.split("-").map(Number);
      const dayDiff = Math.abs(day - todayDay);
      const closestDiff = Math.abs(closestDay - todayDay);
      return dayDiff < closestDiff ? entry : closest;
    });
    return closest;
  }

  // Priority 3: Same ISO week, any year
  const todayWeek = getISOWeek(today);
  const sameWeekMemories = pastEntries.filter((entry) => {
    const entryDate = parseDate(entry.date);
    return getISOWeek(entryDate) === todayWeek;
  });

  if (sameWeekMemories.length > 0) {
    // Return the most recent one
    return sameWeekMemories.sort((a, b) => b.date.localeCompare(a.date))[0];
  }

  // No match found
  return null;
}

/**
 * Format a Date object to YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date
 * @param {string} dateStr
 * @returns {Date}
 */
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get ISO week number (1-53)
 * Based on ISO 8601 standard
 * @param {Date} date
 * @returns {number}
 */
function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}
