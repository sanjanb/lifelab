/**
 * LifeLab Monthly Insight Data Contract
 *
 * PHASE 1: Foundation for insight-first home page redesign
 *
 * This module defines a clean, domain-agnostic monthly data model
 * consumed by visualization components (line graph, heatmap, analytics).
 *
 * DESIGN PRINCIPLES:
 * - No UI assumptions
 * - No storage assumptions
 * - Domain-agnostic (works with any domain)
 * - Deterministic transformations
 * - Missing days are preserved in output
 *
 * ASSUMPTIONS:
 * - Month is identified by YYYY-MM format
 * - Days are numbered 1-31 (varies by month)
 * - Domains are identified by string IDs
 * - Daily domain data represents presence/activity (not success/failure)
 * - Signal values are numeric (interpretation is flexible)
 */

/**
 * Monthly Insight Data Structure
 *
 * Represents a complete month with:
 * - Temporal identification (monthId)
 * - Calendar coverage (days present)
 * - Domain scope (active domains)
 * - Daily domain mapping (presence/intensity per day per domain)
 * - Daily aggregate signal (overall monthly rhythm)
 */
export interface MonthlyInsight {
  /** Month identifier in YYYY-MM format */
  monthId: string;

  /** Year number (e.g., 2026) */
  year: number;

  /** Month number 1-12 */
  month: number;

  /** Array of day numbers present in the month (1-31) */
  days: number[];

  /** Array of domain IDs that have any activity this month */
  domains: string[];

  /**
   * Daily domain map: day → domain → presence/intensity
   *
   * Structure: { dayNumber: { domainId: intensity } }
   *
   * - dayNumber: 1-31
   * - domainId: string identifier (e.g., 'health', 'career')
   * - intensity: 0-2 (0=none, 1=present, 2=strong presence)
   *
   * Missing days will have empty domain maps.
   * Missing domains on a day will not appear in that day's map.
   */
  dailyDomainMap: Record<number, Record<string, number>>;

  /**
   * Daily aggregate signal: day → numeric signal
   *
   * Structure: { dayNumber: signal }
   *
   * This represents the overall "activity" or "engagement" for each day,
   * aggregated across all domains. It shows temporal flow and rhythm.
   *
   * Signal interpretation:
   * - 0: No activity recorded
   * - 1-3: Light activity (1-2 domains)
   * - 4-6: Moderate activity (3-4 domains)
   * - 7+: High activity (5+ domains)
   *
   * This is NOT a quality score. It simply reflects breadth of engagement.
   */
  dailyAggregateSignal: Record<number, number>;
}

/**
 * Domain Entry (from storage layer)
 * Minimal interface for what we need from stored data
 */
export interface DomainEntry {
  date: string; // ISO date string YYYY-MM-DD
  domain: string; // domain ID
  value?: any; // domain-specific data
}

/**
 * Daily Row (from notebook storage)
 * Represents a single day's data in the monthly notebook
 */
export interface DailyRowData {
  date: string; // ISO date string YYYY-MM-DD
  intent?: string;
  quality?: string;
  outcome?: string;
  domains?: string[]; // Active domains for this day
}

/**
 * Convert stored domain entries into MonthlyInsight structure
 *
 * RULES:
 * - Domain-agnostic (works with any domain structure)
 * - Deterministic (same input always produces same output)
 * - No UI logic (pure data transformation)
 * - Missing days must still appear in output with empty data
 *
 * @param year - Year number (e.g., 2026)
 * @param month - Month number (1-12)
 * @param dailyRows - Array of daily row data from monthly notebook
 * @returns MonthlyInsight data structure
 */
export function buildMonthlyInsight(
  year: number,
  month: number,
  dailyRows: DailyRowData[]
): MonthlyInsight {
  const monthId = `${year}-${String(month).padStart(2, "0")}`;

  // Determine days in month (1-based day numbers)
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Initialize structures
  const dailyDomainMap: Record<number, Record<string, number>> = {};
  const dailyAggregateSignal: Record<number, number> = {};
  const domainSet = new Set<string>();

  // Initialize all days (even if no data)
  days.forEach((day) => {
    dailyDomainMap[day] = {};
    dailyAggregateSignal[day] = 0;
  });

  // Process daily rows
  dailyRows.forEach((row) => {
    const date = new Date(row.date);
    const dayNumber = date.getDate();

    // Verify this row belongs to current month
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month) {
      return; // Skip rows from other months
    }

    // Process domains for this day
    const domains = row.domains || [];
    domains.forEach((domainId) => {
      domainSet.add(domainId);

      // Calculate domain intensity for this day
      // For now, presence = 1 (simple binary presence)
      // Future: could derive intensity from quality, outcome, etc.
      dailyDomainMap[dayNumber][domainId] = 1;
    });

    // Calculate aggregate signal for this day
    // Signal = number of active domains (breadth of engagement)
    dailyAggregateSignal[dayNumber] = domains.length;
  });

  return {
    monthId,
    year,
    month,
    days,
    domains: Array.from(domainSet).sort(),
    dailyDomainMap,
    dailyAggregateSignal,
  };
}

/**
 * Get domain intensity for a specific day
 *
 * @param insight - MonthlyInsight data
 * @param day - Day number (1-31)
 * @param domainId - Domain identifier
 * @returns Intensity value (0-2) or 0 if not present
 */
export function getDomainIntensity(
  insight: MonthlyInsight,
  day: number,
  domainId: string
): number {
  return insight.dailyDomainMap[day]?.[domainId] || 0;
}

/**
 * Get aggregate signal for a specific day
 *
 * @param insight - MonthlyInsight data
 * @param day - Day number (1-31)
 * @returns Signal value (0+)
 */
export function getDailySignal(insight: MonthlyInsight, day: number): number {
  return insight.dailyAggregateSignal[day] || 0;
}

/**
 * Get all signal values as array (ordered by day)
 *
 * @param insight - MonthlyInsight data
 * @returns Array of signal values [day1, day2, ..., dayN]
 */
export function getSignalArray(insight: MonthlyInsight): number[] {
  return insight.days.map((day) => insight.dailyAggregateSignal[day] || 0);
}

/**
 * Get heatmap matrix (2D array: days × domains)
 *
 * @param insight - MonthlyInsight data
 * @returns 2D array where [dayIndex][domainIndex] = intensity
 */
export function getHeatmapMatrix(insight: MonthlyInsight): number[][] {
  return insight.days.map((day) => {
    return insight.domains.map((domainId) => {
      return insight.dailyDomainMap[day]?.[domainId] || 0;
    });
  });
}

/**
 * PHASE 7: ANTI-DRIFT GUARDRAILS
 *
 * This module must remain strictly observational.
 *
 * WHAT THIS MODULE DOES:
 * ✓ Transform daily data into insight structures
 * ✓ Preserve temporal patterns and rhythms
 * ✓ Calculate presence and breadth of engagement
 * ✓ Enable visual pattern recognition
 *
 * WHAT THIS MODULE MUST NEVER DO:
 * ❌ Calculate scores, grades, or ratings
 * ❌ Compute productivity metrics or improvements
 * ❌ Generate goal achievement percentages
 * ❌ Create streak counters or gamification
 * ❌ Compare months or time periods
 * ❌ Add evaluative labels (good/bad, success/failure)
 * ❌ Normalize data with prescriptive intent
 *
 * SIGNAL INTERPRETATION:
 * The dailyAggregateSignal represents BREADTH (how many domains),
 * not DEPTH (quality), SUCCESS (outcome), or EFFORT (intensity).
 *
 * It answers: "Where did attention go?" not "How well did you do?"
 *
 * PRESENCE VS PERFORMANCE:
 * - Presence = domain had activity (binary or low-range)
 * - Performance = evaluative judgment (FORBIDDEN)
 *
 * If you're adding features that:
 * - Award points or badges
 * - Track improvement over time with value judgments
 * - Create competition or comparison
 * - Generate motivational prompts
 *
 * STOP. You're drifting from the core philosophy.
 *
 * This tool is for UNDERSTANDING, not OPTIMIZATION.
 */
