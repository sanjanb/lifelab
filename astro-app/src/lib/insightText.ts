/**
 * Insight Text Generation
 * 
 * PHASE 5: Descriptive Analytics
 * 
 * Generate simple textual observations from MonthlyInsight data.
 * 
 * PRINCIPLES:
 * - Descriptive only (no prescriptions)
 * - No scores or grades
 * - No motivational language
 * - No advice or recommendations
 * - Maximum 3 observations per month
 * 
 * OBSERVATION TYPES:
 * - Consistency changes (did activity pattern shift?)
 * - Clustering of activity (concentrated periods?)
 * - Noticeable gaps (extended quiet periods?)
 * - Domain participation patterns
 */

import type { MonthlyInsight } from './monthlyInsight';

export interface InsightObservation {
  text: string;
  type: 'consistency' | 'cluster' | 'gap' | 'participation';
}

/**
 * Generate textual observations from monthly insight data
 * 
 * Returns up to 3 observations that describe notable patterns.
 * Observations are descriptive, not evaluative.
 * 
 * @param insight - MonthlyInsight data
 * @returns Array of observations (max 3)
 */
export function generateInsightObservations(
  insight: MonthlyInsight
): InsightObservation[] {
  const observations: InsightObservation[] = [];
  
  // Get signal array for analysis
  const signals = insight.days.map(day => insight.dailyAggregateSignal[day]);
  const activeDays = signals.filter(s => s > 0).length;
  const totalDays = insight.days.length;
  
  // Skip if no activity
  if (activeDays === 0) {
    return [{
      text: 'No domain activity recorded this month.',
      type: 'participation'
    }];
  }
  
  // 1. Check for activity clustering
  const clusters = findActivityClusters(signals);
  if (clusters.length > 0) {
    const largestCluster = clusters.reduce((max, c) => c.length > max.length ? c : max);
    const startDay = largestCluster.start + 1;
    const endDay = largestCluster.end + 1;
    
    if (largestCluster.length >= 5) {
      observations.push({
        text: `Activity clustered between days ${startDay}-${endDay} with ${largestCluster.length} consecutive active days.`,
        type: 'cluster'
      });
    }
  }
  
  // 2. Check for notable gaps
  const gaps = findActivityGaps(signals);
  if (gaps.length > 0) {
    const longestGap = gaps.reduce((max, g) => g.length > max.length ? g : max);
    
    if (longestGap.length >= 5) {
      const startDay = longestGap.start + 1;
      const endDay = longestGap.end + 1;
      observations.push({
        text: `Quiet period from days ${startDay}-${endDay} with no recorded activity.`,
        type: 'gap'
      });
    }
  }
  
  // 3. Check for consistency patterns
  const firstHalfDays = signals.slice(0, Math.floor(totalDays / 2));
  const secondHalfDays = signals.slice(Math.floor(totalDays / 2));
  const firstHalfActive = firstHalfDays.filter(s => s > 0).length;
  const secondHalfActive = secondHalfDays.filter(s => s > 0).length;
  
  const diff = Math.abs(firstHalfActive - secondHalfActive);
  if (diff >= 5) {
    if (firstHalfActive > secondHalfActive) {
      observations.push({
        text: `Activity was more frequent in the first half of the month.`,
        type: 'consistency'
      });
    } else {
      observations.push({
        text: `Activity increased in the second half of the month.`,
        type: 'consistency'
      });
    }
  }
  
  // 4. Check domain participation spread
  const domainCount = insight.domains.length;
  if (domainCount >= 4) {
    observations.push({
      text: `${domainCount} different domains were active this month.`,
      type: 'participation'
    });
  } else if (domainCount === 1) {
    observations.push({
      text: `Focus was concentrated in a single domain: ${insight.domains[0]}.`,
      type: 'participation'
    });
  }
  
  // Return max 3 observations
  return observations.slice(0, 3);
}

/**
 * Find clusters of consecutive active days
 * 
 * @param signals - Array of daily signal values
 * @returns Array of clusters with start, end, length
 */
function findActivityClusters(signals: number[]): Array<{start: number, end: number, length: number}> {
  const clusters: Array<{start: number, end: number, length: number}> = [];
  let clusterStart = -1;
  
  signals.forEach((signal, i) => {
    if (signal > 0) {
      if (clusterStart === -1) {
        clusterStart = i;
      }
    } else {
      if (clusterStart !== -1) {
        clusters.push({
          start: clusterStart,
          end: i - 1,
          length: i - clusterStart
        });
        clusterStart = -1;
      }
    }
  });
  
  // Handle cluster at end of month
  if (clusterStart !== -1) {
    clusters.push({
      start: clusterStart,
      end: signals.length - 1,
      length: signals.length - clusterStart
    });
  }
  
  return clusters;
}

/**
 * Find gaps of consecutive inactive days
 * 
 * @param signals - Array of daily signal values
 * @returns Array of gaps with start, end, length
 */
function findActivityGaps(signals: number[]): Array<{start: number, end: number, length: number}> {
  const gaps: Array<{start: number, end: number, length: number}> = [];
  let gapStart = -1;
  
  signals.forEach((signal, i) => {
    if (signal === 0) {
      if (gapStart === -1) {
        gapStart = i;
      }
    } else {
      if (gapStart !== -1) {
        gaps.push({
          start: gapStart,
          end: i - 1,
          length: i - gapStart
        });
        gapStart = -1;
      }
    }
  });
  
  // Handle gap at end of month
  if (gapStart !== -1) {
    gaps.push({
      start: gapStart,
      end: signals.length - 1,
      length: signals.length - gapStart
    });
  }
  
  return gaps;
}

/**
 * Get simple monthly summary text
 * 
 * @param insight - MonthlyInsight data
 * @returns Summary string
 */
export function getMonthSummary(insight: MonthlyInsight): string {
  const signals = insight.days.map(day => insight.dailyAggregateSignal[day]);
  const activeDays = signals.filter(s => s > 0).length;
  const totalDays = insight.days.length;
  const domainCount = insight.domains.length;
  
  if (activeDays === 0) {
    return 'No activity recorded this month.';
  }
  
  return `${activeDays} of ${totalDays} days had activity across ${domainCount} domain${domainCount !== 1 ? 's' : ''}.`;
}
