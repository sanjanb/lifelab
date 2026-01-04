/**
 * LifeLab Utility Functions
 * Framework-agnostic helper functions
 *
 * MIGRATION NOTE: Direct port from original utils.js
 * No behavior changes - conversion only
 */

import type { Entry } from "./storage";

/**
 * Generate a unique ID for entries
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new entry with proper structure
 */
export function createEntry(value: any, notes: string = ""): Entry {
  const now = new Date();
  return {
    id: generateUniqueId(),
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    value: value,
    notes: notes,
  };
}

/**
 * Validate if an object follows the entry structure
 */
export function isValidEntry(entry: any): entry is Entry {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  if (!entry.id || typeof entry.id !== "string") {
    return false;
  }

  if (!entry.timestamp || typeof entry.timestamp !== "string") {
    return false;
  }

  if (entry.value === undefined || entry.value === null) {
    return false;
  }

  if (entry.notes !== undefined && typeof entry.notes !== "string") {
    return false;
  }

  return true;
}

/**
 * Format ISO timestamp to human-readable date
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format ISO timestamp to human-readable date and time
 */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format month and year for display
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
