/**
 * Year Review Page
 * Annual overview with statistics and comparisons
 */

import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';

import { getAvailableMonths, loadMonth } from '../data/storage.js';
import { renderHeatmap } from '../graphs/heatmap.js';
import { getAllDomains } from '../data/schema.js';

let currentYear = new Date().getFullYear();
let yearData = [];

/**
 * Initialize year page
 */
async function init() {
  updateYearDisplay();
  loadYearData();
  setupNavigation();
}

/**
 * Load all data for the year
 */
function loadYearData() {
  yearData = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthData = loadMonth(currentYear, month);
    yearData.push(...monthData);
  }
  
  renderYearVisualization();
  renderYearStats();
  renderMonthlyComparison();
  renderDomainTrends();
  renderYearInsights();
}

/**
 * Update year display
 */
function updateYearDisplay() {
  document.getElementById('current-year-display').textContent = currentYear;
}

/**
 * Setup year navigation
 */
function setupNavigation() {
  document.getElementById('prev-year').addEventListener('click', () => {
    currentYear--;
    updateYearDisplay();
    loadYearData();
  });

  document.getElementById('next-year').addEventListener('click', () => {
    currentYear++;
    updateYearDisplay();
    loadYearData();
  });
}

/**
 * Render yearly heatmap
 */
function renderYearVisualization() {
  const container = document.getElementById('year-heatmap');
  
  if (yearData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No data for ${currentYear}.</p>
      </div>
    `;
    return;
  }
  
  renderHeatmap(yearData, container, { year: currentYear });
}

/**
 * Render year statistics
 */
function renderYearStats() {
  const container = document.getElementById('year-stats');
  
  if (yearData.length === 0) {
    container.innerHTML = '<p class="empty-state">No data available</p>';
    return;
  }

  const stats = calculateYearStats();
  
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${stats.totalDays}</div>
      <div class="stat-label">Days Tracked</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${(stats.coverage * 100).toFixed(0)}%</div>
      <div class="stat-label">Coverage</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.avgScore.toFixed(2)}</div>
      <div class="stat-label">Average Score</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.bestMonth}</div>
      <div class="stat-label">Best Month</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.longestStreak}</div>
      <div class="stat-label">Longest Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.topDomain}</div>
      <div class="stat-label">Top Domain</div>
    </div>
  `;
}

/**
 * Calculate year statistics
 */
function calculateYearStats() {
  const totalDays = yearData.length;
  const daysInYear = isLeapYear(currentYear) ? 366 : 365;
  const coverage = totalDays / daysInYear;
  
  // Average score
  const scores = yearData.map(d => calculateDayScore(d)).filter(s => s !== null);
  const avgScore = scores.length > 0 
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
    : 0;
  
  // Best month
  const monthlyAvgs = [];
  for (let m = 1; m <= 12; m++) {
    const monthData = yearData.filter(d => new Date(d.date).getMonth() + 1 === m);
    if (monthData.length > 0) {
      const monthScores = monthData.map(d => calculateDayScore(d)).filter(s => s !== null);
      const avg = monthScores.reduce((sum, s) => sum + s, 0) / monthScores.length;
      monthlyAvgs.push({ month: m, avg });
    }
  }
  const bestMonthObj = monthlyAvgs.sort((a, b) => b.avg - a.avg)[0];
  const bestMonth = bestMonthObj 
    ? new Date(currentYear, bestMonthObj.month - 1).toLocaleDateString('en-US', { month: 'short' })
    : '—';
  
  // Longest streak
  const longestStreak = calculateLongestStreak(yearData);
  
  // Top domain
  const domains = getAllDomains(yearData);
  let topDomain = '—';
  let maxAvg = 0;
  
  domains.forEach(domain => {
    const domainScores = yearData
      .filter(d => d.domains && d.domains[domain] !== undefined)
      .map(d => d.domains[domain]);
    const avg = domainScores.reduce((sum, s) => sum + s, 0) / domainScores.length;
    if (avg > maxAvg) {
      maxAvg = avg;
      topDomain = capitalizeFirst(domain);
    }
  });
  
  return {
    totalDays,
    coverage,
    avgScore,
    bestMonth,
    longestStreak,
    topDomain
  };
}

/**
 * Render monthly comparison
 */
function renderMonthlyComparison() {
  const container = document.getElementById('monthly-comparison');
  
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let m = 1; m <= 12; m++) {
    const monthData = yearData.filter(d => new Date(d.date).getMonth() + 1 === m);
    if (monthData.length > 0) {
      const scores = monthData.map(d => calculateDayScore(d)).filter(s => s !== null);
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      monthlyData.push({ month: monthNames[m-1], avg, count: monthData.length });
    }
  }
  
  if (monthlyData.length === 0) {
    container.innerHTML = '<p class="empty-state">No monthly data</p>';
    return;
  }
  
  const maxAvg = Math.max(...monthlyData.map(m => m.avg));
  
  container.innerHTML = `
    <div class="monthly-bars">
      ${monthlyData.map(m => `
        <div class="month-bar">
          <div class="bar-fill" style="height: ${(m.avg / maxAvg) * 100}%"></div>
          <div class="bar-label">${m.month}</div>
          <div class="bar-value">${m.avg.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render domain trends
 */
function renderDomainTrends() {
  const container = document.getElementById('domain-trends');
  
  const domains = getAllDomains(yearData);
  if (domains.size === 0) {
    container.innerHTML = '<p class="empty-state">No domain data</p>';
    return;
  }
  
  const domainStats = [];
  domains.forEach(domain => {
    const scores = yearData
      .filter(d => d.domains && d.domains[domain] !== undefined)
      .map(d => d.domains[domain]);
    
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const trend = calculateTrend(yearData, domain);
    
    domainStats.push({ domain, avg, trend, count: scores.length });
  });
  
  domainStats.sort((a, b) => b.avg - a.avg);
  
  container.innerHTML = `
    <div class="domain-trends-list">
      ${domainStats.map(d => `
        <div class="domain-trend-item">
          <div class="domain-name">${capitalizeFirst(d.domain)}</div>
          <div class="domain-bar">
            <div class="domain-bar-fill" style="width: ${d.avg * 100}%"></div>
          </div>
          <div class="domain-avg">${d.avg.toFixed(2)}</div>
          <div class="domain-trend ${d.trend > 0 ? 'positive' : d.trend < 0 ? 'negative' : 'neutral'}">
            ${d.trend > 0 ? '↗' : d.trend < 0 ? '↘' : '→'} ${Math.abs(d.trend * 100).toFixed(1)}%
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render year insights
 */
function renderYearInsights() {
  const container = document.getElementById('year-insights');
  
  if (yearData.length === 0) {
    container.innerHTML = '<li>No data to analyze</li>';
    return;
  }
  
  const insights = generateYearInsights();
  
  container.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
}

/**
 * Generate insights for the year
 */
function generateYearInsights() {
  const insights = [];
  const stats = calculateYearStats();
  
  // Coverage insight
  if (stats.coverage > 0.9) {
    insights.push(`Excellent consistency: tracked ${(stats.coverage * 100).toFixed(0)}% of days`);
  } else if (stats.coverage < 0.5) {
    insights.push(`Low tracking coverage: only ${(stats.coverage * 100).toFixed(0)}% of days recorded`);
  }
  
  // Performance insight
  if (stats.avgScore > 0.7) {
    insights.push(`Strong year overall with ${stats.avgScore.toFixed(2)} average score`);
  } else if (stats.avgScore < 0.4) {
    insights.push(`Challenging year with ${stats.avgScore.toFixed(2)} average score`);
  }
  
  // Streak insight
  if (stats.longestStreak > 30) {
    insights.push(`Impressive ${stats.longestStreak}-day tracking streak`);
  }
  
  // Seasonal patterns
  const q1 = getQuarterAvg(1);
  const q4 = getQuarterAvg(4);
  if (q1 !== null && q4 !== null) {
    const diff = q4 - q1;
    if (diff > 0.15) {
      insights.push(`Strong finish: Q4 outperformed Q1 by ${(diff * 100).toFixed(0)}%`);
    } else if (diff < -0.15) {
      insights.push(`Started strong: Q1 outperformed Q4 by ${(Math.abs(diff) * 100).toFixed(0)}%`);
    }
  }
  
  return insights.length > 0 ? insights : ['Gathering yearly patterns...'];
}

/**
 * Helper functions
 */

function calculateDayScore(day) {
  if (!day || !day.domains) return null;
  const scores = Object.values(day.domains);
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function calculateLongestStreak(data) {
  if (data.length === 0) return 0;
  
  const dates = data.map(d => new Date(d.date)).sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const dayDiff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
    if (dayDiff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  
  return longest;
}

function calculateTrend(data, domain) {
  const filtered = data.filter(d => d.domains && d.domains[domain] !== undefined);
  if (filtered.length < 10) return 0;
  
  const firstHalf = filtered.slice(0, Math.floor(filtered.length / 2));
  const secondHalf = filtered.slice(Math.floor(filtered.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.domains[domain], 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.domains[domain], 0) / secondHalf.length;
  
  return secondAvg - firstAvg;
}

function getQuarterAvg(quarter) {
  const months = quarter === 1 ? [1,2,3] : quarter === 2 ? [4,5,6] : quarter === 3 ? [7,8,9] : [10,11,12];
  const quarterData = yearData.filter(d => months.includes(new Date(d.date).getMonth() + 1));
  
  if (quarterData.length === 0) return null;
  
  const scores = quarterData.map(d => calculateDayScore(d)).filter(s => s !== null);
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
init();
