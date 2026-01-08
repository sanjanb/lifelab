/**
 * Win Ledger - Storage and Data Operations
 *
 * CRITICAL PHILOSOPHY:
 * Wins are ACKNOWLEDGEMENTS, not achievements.
 * This is identity reinforcement, not performance tracking.
 *
 * ANTI-PATTERNS (DO NOT ADD):
 * ❌ Streaks
 * ❌ Missed day indicators
 * ❌ Performance comparisons
 * ❌ Gamification
 * ❌ Celebration animations
 * ❌ Daily reminders
 */

import { persistence, DataTypes } from "./persistence/manager.js";

const WIN_STORAGE_KEY = "lifelab_wins";

/**
 * Win Entry Data Model
 * @typedef {Object} WinEntry
 * @property {string} id - Unique identifier (UUID)
 * @property {string} date - ISO date string (YYYY-MM-DD, day-level precision)
 * @property {string} text - Free-form acknowledgement text
 * @property {string} createdAt - ISO timestamp of when the win was recorded
 */

/**
 * Generate a simple unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load all wins from localStorage
 * @returns {Object} Object mapping dates to win entries
 */
function loadWins() {
  try {
    const data = localStorage.getItem(WIN_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load wins:", error);
    return {};
  }
}

/**
 * Save wins to localStorage and Firebase
 * @param {Object} wins - Object mapping dates to win entries
 * @returns {Promise<boolean>} Success status
 */
async function saveWinsToStorage(wins) {
  try {
    // Save to localStorage immediately
    localStorage.setItem(WIN_STORAGE_KEY, JSON.stringify(wins));

    // Save to Firebase (synchronous)
    const winsArray = Object.entries(wins).map(([date, win]) => ({
      ...win,
      date,
    }));
    await persistence.save(DataTypes.WINS, winsArray);

    return true;
  } catch (error) {
    console.error("Failed to save wins:", error);
    return false;
  }
}

/**
 * Save a win for a specific date
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {string} text - Acknowledgement text
 * @returns {Promise<Object>} Result object with success status and optional error
 */
export async function saveWin(date, text) {
  if (!date || !text) {
    return { success: false, error: "Date and text are required" };
  }

  const wins = loadWins();

  // Prevent more than one win per day
  if (wins[date]) {
    return {
      success: false,
      error: "A win already exists for this date",
    };
  }

  // Create win entry
  const win = {
    id: generateId(),
    date: date,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  wins[date] = win;

  const saved = await saveWinsToStorage(wins);
  return {
    success: saved,
    error: saved ? null : "Failed to save win to storage",
    win: saved ? win : null,
  };
}

/**
 * Get a win for a specific date
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @returns {WinEntry|null} Win entry or null if not found
 */
export function getWinByDate(date) {
  const wins = loadWins();
  return wins[date] || null;
}

/**
 * Check if a win exists for a specific date
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @returns {boolean} True if win exists
 */
export function hasWinForDate(date) {
  const wins = loadWins();
  return !!wins[date];
}

/**
 * Get all wins sorted chronologically (oldest to newest)
 * @returns {Array<WinEntry>} Array of win entries
 */
export function getAllWins() {
  const wins = loadWins();
  return Object.values(wins).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get win statistics (archival counts, no performance metrics)
 * @returns {Object} Statistics object
 */
export function getWinStats() {
  const wins = loadWins();
  const allWins = Object.values(wins);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Count wins for current month
  const thisMonthWins = allWins.filter((win) => {
    const winDate = new Date(win.date);
    return (
      winDate.getFullYear() === currentYear &&
      winDate.getMonth() + 1 === currentMonth
    );
  }).length;

  // Count wins for current year
  const thisYearWins = allWins.filter((win) => {
    const winDate = new Date(win.date);
    return winDate.getFullYear() === currentYear;
  }).length;

  return {
    total: allWins.length,
    thisMonth: thisMonthWins,
    thisYear: thisYearWins,
  };
}

/**
 * Get wins filtered by year and/or month
 * @param {number} year - Year to filter by (optional)
 * @param {number} month - Month to filter by (1-12, optional)
 * @returns {Array<WinEntry>} Filtered wins
 */
export function getWinsFiltered(year = null, month = null) {
  const allWins = getAllWins();

  return allWins.filter((win) => {
    const winDate = new Date(win.date);

    if (year !== null && winDate.getFullYear() !== year) {
      return false;
    }

    if (month !== null && winDate.getMonth() + 1 !== month) {
      return false;
    }

    return true;
  });
}
