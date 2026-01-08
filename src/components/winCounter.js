/**
 * Win Counter Component
 *
 * Archival display - counts only, no performance metrics.
 * Neutral language, no celebration.
 */

import { getWinStats } from "../data/winLedger.js";

/**
 * Render lifetime win counter (simple, archival)
 * @param {HTMLElement} container - Container element
 */
export function renderWinCounter(container) {
  const stats = getWinStats();

  container.innerHTML = `
    <div class="win-counter">
      <div class="win-counter-value">${stats.total}</div>
      <div class="win-counter-label">acknowledgements recorded</div>
    </div>
  `;
}

/**
 * Render time-based aggregation (neutral counts, no comparison)
 * @param {HTMLElement} container - Container element
 */
export function renderWinStats(container) {
  const stats = getWinStats();

  container.innerHTML = `
    <div class="win-stats">
      <div class="win-stat-card">
        <div class="win-stat-value">${stats.total}</div>
        <div class="win-stat-label">Total</div>
      </div>
      <div class="win-stat-card">
        <div class="win-stat-value">${stats.thisYear}</div>
        <div class="win-stat-label">This Year</div>
      </div>
      <div class="win-stat-card">
        <div class="win-stat-value">${stats.thisMonth}</div>
        <div class="win-stat-label">This Month</div>
      </div>
    </div>
  `;
}

/**
 * Render minimal counter for home page
 * @param {HTMLElement} container - Container element
 */
export function renderWinSummary(container) {
  const stats = getWinStats();

  container.innerHTML = `
    <div class="win-summary">
      <span class="win-summary-count">${stats.total} acknowledgements recorded</span>
      <a href="./wins.html" class="win-summary-link">+ Add today's acknowledgement</a>
    </div>
  `;
}
