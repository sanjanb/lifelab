/**
 * Memory Query Layer
 *
 * RULES:
 * - Query only eligible entry types (journal, reflection)
 * - Lightweight queries (no full scans)
 * - Cache result per day
 * - No metrics or analytics data
 */

import { selectMemory } from "./memorySelection.js";
import { listReflections } from "./reflectionStore.js";
import { loadFromLocalStorage } from "./storage.js";

const CACHE_KEY = "lifelab_memory_cache";

/**
 * Cache structure:
 * {
 *   date: "YYYY-MM-DD",
 *   memory: {date, content, type} | null,
 *   dismissed: boolean
 * }
 */

/**
 * Get today's memory (cached if available)
 * @returns {Promise<Object|null>} Memory object or null
 */
export async function getTodaysMemory() {
  const today = new Date();
  const todayStr = formatDate(today);

  // Check cache first
  const cache = getCache();
  if (cache && cache.date === todayStr) {
    // Return null if dismissed today
    if (cache.dismissed) {
      return null;
    }
    // Return cached memory
    if (cache.memory) {
      return cache.memory;
    }
  }

  // Fetch and select new memory
  const memory = await fetchAndSelectMemory(today);

  // Cache result
  setCache({
    date: todayStr,
    memory,
    dismissed: false,
  });

  return memory;
}

/**
 * Dismiss today's memory (don't show again today)
 */
export function dismissTodaysMemory() {
  const today = new Date();
  const todayStr = formatDate(today);

  const cache = getCache();
  setCache({
    date: todayStr,
    memory: cache?.memory || null,
    dismissed: true,
  });
}

/**
 * Fetch eligible entries and select one memory
 * @param {Date} today
 * @returns {Promise<Object|null>}
 */
async function fetchAndSelectMemory(today) {
  try {
    // Collect eligible entries
    const entries = [];

    // 1. Fetch reflections (long-form journal entries)
    const reflections = await listReflections();
    reflections.forEach((r) => {
      if (r.content && r.createdAt) {
        entries.push({
          date: r.createdAt.split("T")[0], // Extract YYYY-MM-DD
          content: r.content,
          type: "reflection",
          prompt: r.prompt || null,
        });
      }
    });

    // 2. Fetch daily notes (from notebook)
    const allData = loadFromLocalStorage();
    Object.entries(allData).forEach(([monthKey, days]) => {
      if (Array.isArray(days)) {
        days.forEach((day) => {
          if (day.notes && day.notes.trim().length > 0) {
            entries.push({
              date: day.date,
              content: day.notes,
              type: "journal",
            });
          }
        });
      }
    });

    // Select ONE memory
    return selectMemory(today, entries);
  } catch (error) {
    console.warn("Memory query failed silently:", error);
    return null;
  }
}

/**
 * Get cache from localStorage
 * @returns {Object|null}
 */
function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Set cache in localStorage
 * @param {Object} cache
 */
function setCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Failed to cache memory:", error);
  }
}

/**
 * Clear memory cache (useful for testing)
 */
export function clearMemoryCache() {
  localStorage.removeItem(CACHE_KEY);
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
