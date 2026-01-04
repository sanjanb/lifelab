/**
 * Analytics Calculation Utilities
 *
 * PRINCIPLES:
 * - Observational, not evaluative
 * - Descriptive language only
 * - No scoring, no judgment
 * - No advice or recommendations
 *
 * These analytics support understanding patterns,
 * not measuring performance.
 */

import type { DailyRow } from "./storage";

export interface MonthlyOutcome {
  winDays: number;
  neutralDays: number;
  lossDays: number;
  unsetDays: number;
}

export interface DomainParticipation {
  domainId: string;
  domainName: string;
  activeDays: number;
  totalDays: number;
  firstActiveDay: number | null;
  lastActiveDay: number | null;
  hasGaps: boolean;
  hasClusters: boolean;
}

export interface TrendObservation {
  text: string;
  type: "pattern" | "gap" | "cluster" | "shift";
}

/**
 * Calculate monthly outcome summary
 */
export function calculateMonthlyOutcome(dailyRows: DailyRow[]): MonthlyOutcome {
  const outcome: MonthlyOutcome = {
    winDays: 0,
    neutralDays: 0,
    lossDays: 0,
    unsetDays: 0,
  };

  dailyRows.forEach((row) => {
    switch (row.outcome) {
      case "win":
        outcome.winDays++;
        break;
      case "neutral":
        outcome.neutralDays++;
        break;
      case "loss":
        outcome.lossDays++;
        break;
      default:
        outcome.unsetDays++;
    }
  });

  return outcome;
}

/**
 * Calculate domain participation for the month
 */
export function calculateDomainParticipation(
  dailyRows: DailyRow[],
  domainId: string,
  domainName: string
): DomainParticipation {
  const activeDays: number[] = [];

  dailyRows.forEach((row, index) => {
    if (row.domains && row.domains[domainId]) {
      activeDays.push(index + 1); // 1-based day number
    }
  });

  const totalDays = dailyRows.length;
  const firstActiveDay = activeDays.length > 0 ? activeDays[0] : null;
  const lastActiveDay =
    activeDays.length > 0 ? activeDays[activeDays.length - 1] : null;

  // Detect gaps (3+ consecutive inactive days between active days)
  let hasGaps = false;
  for (let i = 1; i < activeDays.length; i++) {
    if (activeDays[i] - activeDays[i - 1] > 3) {
      hasGaps = true;
      break;
    }
  }

  // Detect clusters (3+ consecutive active days)
  let hasClusters = false;
  for (let i = 2; i < activeDays.length; i++) {
    if (
      activeDays[i] - activeDays[i - 1] === 1 &&
      activeDays[i - 1] - activeDays[i - 2] === 1
    ) {
      hasClusters = true;
      break;
    }
  }

  return {
    domainId,
    domainName,
    activeDays: activeDays.length,
    totalDays,
    firstActiveDay,
    lastActiveDay,
    hasGaps,
    hasClusters,
  };
}

/**
 * Generate trend observations from daily rows
 */
export function generateTrendObservations(
  dailyRows: DailyRow[],
  participations: DomainParticipation[]
): TrendObservation[] {
  const observations: TrendObservation[] = [];

  // Analyze domain participation patterns
  participations.forEach((p) => {
    if (p.activeDays === 0) return;

    // Gap detection
    if (p.hasGaps) {
      observations.push({
        text: `${p.domainName} activity had noticeable gaps.`,
        type: "gap",
      });
    }

    // Cluster detection
    if (p.hasClusters) {
      observations.push({
        text: `${p.domainName} showed clustered activity.`,
        type: "cluster",
      });
    }

    // Early/late month patterns
    if (p.firstActiveDay && p.lastActiveDay) {
      const midMonth = dailyRows.length / 2;

      if (p.lastActiveDay < midMonth) {
        observations.push({
          text: `${p.domainName} activity concentrated in first half of month.`,
          type: "pattern",
        });
      } else if (p.firstActiveDay > midMonth) {
        observations.push({
          text: `${p.domainName} activity started after mid-month.`,
          type: "pattern",
        });
      }
    }
  });

  // Limit to 5 most meaningful observations
  return observations.slice(0, 5);
}

/**
 * Calculate daily domain activity counts for line graph
 * Returns array of counts, one per day
 */
export function calculateDailyDomainCounts(dailyRows: DailyRow[]): number[] {
  return dailyRows.map((row) => {
    if (!row.domains) return 0;
    return Object.keys(row.domains).length;
  });
}

/**
 * Get max domain count for graph scaling
 */
export function getMaxDomainCount(counts: number[]): number {
  return Math.max(...counts, 1); // At least 1 for scaling
}
