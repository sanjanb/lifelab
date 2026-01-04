/**
 * Month Resolution Logic
 * 
 * HOME PAGE CONTRACT:
 * - Home page always represents a SINGLE MONTH
 * - Default to current system month
 * - Allow navigation to past months
 * - Future months are read-only placeholders
 * - No global dashboards
 * - No year-level summaries on home page
 * - All content scoped to the active month
 * 
 * This contract prevents scope creep and maintains focus.
 */

export interface MonthIdentifier {
  year: number;
  month: number; // 1-based (January = 1)
}

export interface MonthMetadata {
  identifier: MonthIdentifier;
  displayName: string; // e.g., "January 2026"
  daysInMonth: number;
  isCurrentMonth: boolean;
  isFutureMonth: boolean;
  isPastMonth: boolean;
  isClosed: boolean; // User explicitly closed the month
}

/**
 * Get the current system month
 */
export function getCurrentMonth(): MonthIdentifier {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // Convert 0-based to 1-based
  };
}

/**
 * Get metadata for a specific month
 */
export function getMonthMetadata(
  identifier: MonthIdentifier,
  closedMonths: Set<string> = new Set()
): MonthMetadata {
  const current = getCurrentMonth();
  const monthKey = `${identifier.year}-${String(identifier.month).padStart(2, '0')}`;
  
  const isCurrentMonth = 
    identifier.year === current.year && 
    identifier.month === current.month;
  
  const isFutureMonth = 
    identifier.year > current.year ||
    (identifier.year === current.year && identifier.month > current.month);
  
  const isPastMonth = !isCurrentMonth && !isFutureMonth;
  
  const daysInMonth = new Date(identifier.year, identifier.month, 0).getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    identifier,
    displayName: `${monthNames[identifier.month - 1]} ${identifier.year}`,
    daysInMonth,
    isCurrentMonth,
    isFutureMonth,
    isPastMonth,
    isClosed: closedMonths.has(monthKey),
  };
}

/**
 * Get the active month for the home page
 * 
 * Rules:
 * - If no month specified, use current month
 * - User can navigate to past months
 * - Future months allowed but read-only
 */
export function resolveActiveMonth(
  requestedMonth?: MonthIdentifier
): MonthIdentifier {
  if (!requestedMonth) {
    return getCurrentMonth();
  }
  
  return requestedMonth;
}

/**
 * Navigate to previous month
 */
export function getPreviousMonth(current: MonthIdentifier): MonthIdentifier {
  if (current.month === 1) {
    return { year: current.year - 1, month: 12 };
  }
  return { year: current.year, month: current.month - 1 };
}

/**
 * Navigate to next month
 */
export function getNextMonth(current: MonthIdentifier): MonthIdentifier {
  if (current.month === 12) {
    return { year: current.year + 1, month: 1 };
  }
  return { year: current.year, month: current.month + 1 };
}

/**
 * Get month key for storage
 */
export function getMonthKey(identifier: MonthIdentifier): string {
  return `${identifier.year}-${String(identifier.month).padStart(2, '0')}`;
}

/**
 * Parse month key from string
 */
export function parseMonthKey(key: string): MonthIdentifier | null {
  const match = key.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
  };
}

/**
 * Get today's date info
 */
export function getTodayInfo() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    dayOfWeek: now.getDay(), // 0 = Sunday
  };
}

/**
 * Check if a specific day is today
 */
export function isToday(month: MonthIdentifier, day: number): boolean {
  const today = getTodayInfo();
  return (
    month.year === today.year &&
    month.month === today.month &&
    day === today.day
  );
}
