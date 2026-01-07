/**
 * Analytics - Turn data into reflection
 * Focus on patterns, not scores
 */

/**
 * Analyzes monthly data and generates insights
 * @param {Array} data - Array of day records
 * @returns {Array} Array of insight strings
 */
export function generateInsights(data) {
  if (!data || data.length === 0) {
    return ['No data available for analysis'];
  }

  const insights = [];

  // Calculate overall trend
  const trend = analyzeTrend(data);
  if (trend) insights.push(trend);

  // Find energy patterns
  const energyPattern = analyzeEnergyPattern(data);
  if (energyPattern) insights.push(energyPattern);

  // Domain correlation
  const correlation = analyzeDomainCorrelation(data);
  if (correlation) insights.push(correlation);

  // Consistency check
  const consistency = analyzeConsistency(data);
  if (consistency) insights.push(consistency);

  // Weekend vs weekday
  const weekendPattern = analyzeWeekendPattern(data);
  if (weekendPattern) insights.push(weekendPattern);

  return insights.length > 0 ? insights : ['Gathering patterns...'];
}

/**
 * Analyzes overall trend direction
 */
function analyzeTrend(data) {
  const scores = data.map(d => calculateDailyScore(d)).filter(s => s !== null);
  if (scores.length < 5) return null;

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const firstAvg = average(firstHalf);
  const secondAvg = average(secondHalf);

  const diff = secondAvg - firstAvg;

  if (Math.abs(diff) < 0.05) {
    return 'Scores remained stable throughout the month';
  } else if (diff > 0) {
    return `Upward trend detected: ${(diff * 100).toFixed(1)}% improvement`;
  } else {
    return `Scores dipped in second half by ${Math.abs(diff * 100).toFixed(1)}%`;
  }
}

/**
 * Analyzes energy patterns across the month
 */
function analyzeEnergyPattern(data) {
  const scores = data.map((d, i) => ({
    day: i + 1,
    score: calculateDailyScore(d)
  })).filter(s => s.score !== null);

  if (scores.length < 10) return null;

  // Find the weakest period
  const windowSize = 5;
  let minAvg = 1;
  let minDay = 0;

  for (let i = 0; i <= scores.length - windowSize; i++) {
    const window = scores.slice(i, i + windowSize);
    const avg = average(window.map(s => s.score));
    if (avg < minAvg) {
      minAvg = avg;
      minDay = window[Math.floor(windowSize / 2)].day;
    }
  }

  if (minAvg < 0.5) {
    return `Energy dips around day ${minDay}`;
  }

  return null;
}

/**
 * Analyzes correlation between domains
 */
function analyzeDomainCorrelation(data) {
  const domains = getAllDomains(data);
  if (domains.length < 2) return null;

  const domainScores = {};
  domains.forEach(domain => {
    domainScores[domain] = data
      .filter(d => d.domains && d.domains[domain] !== undefined)
      .map(d => d.domains[domain]);
  });

  // Find domain with lowest average
  let lowestDomain = null;
  let lowestAvg = 1;

  for (const [domain, scores] of Object.entries(domainScores)) {
    if (scores.length === 0) continue;
    const avg = average(scores);
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestDomain = domain;
    }
  }

  if (lowestDomain && lowestAvg < 0.4) {
    return `${capitalizeFirst(lowestDomain)} needs attention (avg: ${lowestAvg.toFixed(2)})`;
  }

  return null;
}

/**
 * Analyzes consistency of tracking
 */
function analyzeConsistency(data) {
  const daysInMonth = 30; // Approximate
  const coverage = (data.length / daysInMonth) * 100;

  if (coverage < 50) {
    return `Low tracking coverage: ${coverage.toFixed(0)}% of days recorded`;
  } else if (coverage > 90) {
    return `Excellent tracking consistency: ${coverage.toFixed(0)}% coverage`;
  }

  return null;
}

/**
 * Analyzes weekend vs weekday patterns
 */
function analyzeWeekendPattern(data) {
  const weekdays = [];
  const weekends = [];

  data.forEach(d => {
    const date = new Date(d.date);
    const day = date.getDay();
    const score = calculateDailyScore(d);
    
    if (score === null) return;

    if (day === 0 || day === 6) {
      weekends.push(score);
    } else {
      weekdays.push(score);
    }
  });

  if (weekdays.length < 3 || weekends.length < 2) return null;

  const weekdayAvg = average(weekdays);
  const weekendAvg = average(weekends);
  const diff = weekendAvg - weekdayAvg;

  if (Math.abs(diff) > 0.15) {
    if (diff > 0) {
      return 'Weekend scores consistently higher than weekdays';
    } else {
      return 'Weekday performance exceeds weekend habits';
    }
  }

  return null;
}

/**
 * Helper functions
 */

function calculateDailyScore(day) {
  if (!day || !day.domains) return null;
  const scores = Object.values(day.domains);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function getAllDomains(data) {
  const domains = new Set();
  data.forEach(d => {
    if (d.domains) {
      Object.keys(d.domains).forEach(domain => domains.add(domain));
    }
  });
  return Array.from(domains);
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
