/**
 * Yearly Roll-up Data Hooks
 *
 * PHASE 6: Prepare for future yearly view
 *
 * This module provides lightweight monthly summaries suitable for
 * yearly aggregation WITHOUT flattening nuance.
 *
 * CRITICAL DESIGN CONSTRAINTS:
 * - NO yearly scores or totals
 * - NO month ranking or comparison
 * - NO improvement metrics or arrows
 * - PRESERVE month-to-month shape and rhythm
 * - Enable pattern recognition, not performance evaluation
 *
 * FUTURE YEARLY VIEW PRINCIPLES:
 * When implementing yearly views, they MUST:
 * - Show patterns across months (not aggregate them)
 * - Display monthly signatures side-by-side
 * - Avoid creating "best month" or "worst month" narratives
 * - Preserve the temporal flow of each month
 * - Respect the psychology of long-term reflection
 *
 * WHAT YEARLY VIEWS SHOULD SHOW:
 * - How monthly rhythms evolved over time
 * - Domain participation trends (descriptive)
 * - Notable shifts in activity patterns
 * - Visual comparison of monthly signatures
 *
 * WHAT YEARLY VIEWS MUST NOT SHOW:
 * - Total activity scores
 * - Month rankings or leaderboards
 * - Productivity trends or improvement metrics
 * - Goal achievement percentages
 * - Success/failure language
 */

import type { MonthlyInsight } from "./monthlyInsight";

/**
 * Monthly Silhouette
 *
 * A lightweight summary of a month that preserves its unique shape
 * for yearly pattern recognition.
 *
 * This is NOT a score. It's a fingerprint.
 */
export interface MonthlySilhouette {
  /** Month identifier YYYY-MM */
  monthId: string;

  /** Year number */
  year: number;

  /** Month number (1-12) */
  month: number;

  /** Total days in the month */
  totalDays: number;

  /** Days with any activity */
  activeDays: number;

  /** Domains that appeared at least once */
  activeDomains: string[];

  /**
   * Daily signal shape (preserves temporal pattern)
   * Array of normalized values showing the month's rhythm
   * This allows visual comparison without computing averages
   */
  dailySignalShape: number[];

  /**
   * Domain distribution (how balanced was participation?)
   * Map of domain → days present
   * Enables pattern recognition: "mostly focused" vs "broadly engaged"
   */
  domainDistribution: Record<string, number>;

  /**
   * Activity density (descriptive clusters)
   * Identifies when activity happened, not how much
   */
  densityPattern: {
    /** Longest consecutive active period */
    longestActiveStreak: number;
    /** Longest gap with no activity */
    longestQuietPeriod: number;
    /** Number of distinct activity clusters */
    clusterCount: number;
  };
}

/**
 * Generate monthly silhouette from insight data
 *
 * This creates a compact summary that preserves the month's unique
 * characteristics for future yearly aggregation.
 *
 * @param insight - MonthlyInsight data structure
 * @returns MonthlySilhouette suitable for yearly comparison
 */
export function generateMonthlySilhouette(
  insight: MonthlyInsight
): MonthlySilhouette {
  // Extract basic metrics
  const signals = insight.days.map((day) => insight.dailyAggregateSignal[day]);
  const activeDays = signals.filter((s) => s > 0).length;

  // Calculate domain distribution
  const domainDistribution: Record<string, number> = {};
  insight.domains.forEach((domainId) => {
    let daysPresent = 0;
    insight.days.forEach((day) => {
      if (insight.dailyDomainMap[day]?.[domainId]) {
        daysPresent++;
      }
    });
    domainDistribution[domainId] = daysPresent;
  });

  // Analyze density patterns
  const densityPattern = analyzeDensityPattern(signals);

  return {
    monthId: insight.monthId,
    year: insight.year,
    month: insight.month,
    totalDays: insight.days.length,
    activeDays,
    activeDomains: [...insight.domains],
    dailySignalShape: [...signals], // Preserve exact shape
    domainDistribution,
    densityPattern,
  };
}

/**
 * Analyze activity density patterns
 *
 * Identifies clusters and gaps to characterize the month's rhythm
 *
 * @param signals - Array of daily signal values
 * @returns Density pattern metrics
 */
function analyzeDensityPattern(signals: number[]): {
  longestActiveStreak: number;
  longestQuietPeriod: number;
  clusterCount: number;
} {
  let longestActiveStreak = 0;
  let longestQuietPeriod = 0;
  let currentActiveStreak = 0;
  let currentQuietPeriod = 0;
  let clusterCount = 0;
  let inCluster = false;

  signals.forEach((signal) => {
    if (signal > 0) {
      // Active day
      currentActiveStreak++;
      if (currentQuietPeriod > 0) {
        longestQuietPeriod = Math.max(longestQuietPeriod, currentQuietPeriod);
        currentQuietPeriod = 0;
      }
      if (!inCluster) {
        clusterCount++;
        inCluster = true;
      }
    } else {
      // Inactive day
      currentQuietPeriod++;
      if (currentActiveStreak > 0) {
        longestActiveStreak = Math.max(
          longestActiveStreak,
          currentActiveStreak
        );
        currentActiveStreak = 0;
      }
      inCluster = false;
    }
  });

  // Handle final streaks
  longestActiveStreak = Math.max(longestActiveStreak, currentActiveStreak);
  longestQuietPeriod = Math.max(longestQuietPeriod, currentQuietPeriod);

  return {
    longestActiveStreak,
    longestQuietPeriod,
    clusterCount,
  };
}

/**
 * FUTURE YEARLY VIEW GUIDELINES
 *
 * When implementing yearly views, follow these rules:
 *
 * 1. VISUAL COMPARISON, NOT AGGREGATION
 *    - Show 12 monthly silhouettes side-by-side
 *    - Allow visual pattern recognition
 *    - Do NOT sum or average across months
 *
 * 2. PRESERVE TEMPORAL CONTEXT
 *    - Maintain month-to-month sequence
 *    - Show how rhythms evolved over time
 *    - Enable narrative construction by the user
 *
 * 3. AVOID QUANTIFICATION
 *    - No "total yearly activity score"
 *    - No "most productive month"
 *    - No percentage improvements
 *    - No goal achievement metrics
 *
 * 4. DESCRIPTIVE LANGUAGE ONLY
 *    - "March had concentrated activity"
 *    - "Summer months showed broader domain participation"
 *    - "Fall had longer quiet periods"
 *    - NEVER: "You improved by 23%"
 *
 * 5. RESPECT EMOTIONAL SAFETY
 *    - Users should feel curiosity, not judgment
 *    - Patterns should invite reflection, not comparison
 *    - The year view is for understanding, not evaluation
 *
 * 6. EXAMPLE YEARLY VIEW STRUCTURE
 *    ```
 *    2026 Annual Overview
 *
 *    [12 small line graphs showing monthly signal shapes]
 *
 *    [Heatmap grid: months × domains showing participation]
 *
 *    Notable Patterns:
 *    - Spring months showed focus in learning domain
 *    - Summer had broader participation across all domains
 *    - Activity clustered in early and late year
 *    ```
 *
 * ANTI-PATTERNS (DO NOT IMPLEMENT):
 * ❌ Yearly total activity score
 * ❌ Month ranking or leaderboard
 * ❌ Best/worst month highlights
 * ❌ Improvement percentage
 * ❌ Goal achievement tracker
 * ❌ Streak counters across months
 * ❌ "You were productive X days this year"
 */

/**
 * Export monthly silhouette to JSON for storage/aggregation
 *
 * This enables yearly views to load pre-computed silhouettes
 * without recalculating from raw data.
 *
 * @param silhouette - MonthlySilhouette to export
 * @returns JSON string
 */
export function exportSilhouetteToJSON(silhouette: MonthlySilhouette): string {
  return JSON.stringify(silhouette, null, 2);
}

/**
 * Import monthly silhouette from JSON
 *
 * @param json - JSON string of silhouette data
 * @returns MonthlySilhouette object
 */
export function importSilhouetteFromJSON(json: string): MonthlySilhouette {
  return JSON.parse(json) as MonthlySilhouette;
}
