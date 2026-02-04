/**
 * Win Timeline Component
 *
 * Chronological archive (oldest to newest).
 * Optional filters for visibility only - no analysis or insights.
 */

import { getAllWins, getWinsFiltered } from "../data/winLedger.js";

/**
 * Render chronological win timeline
 * @param {HTMLElement} container - Container element
 * @param {Object} filters - Optional filters {year, month}
 */
export async function renderWinTimeline(container, filters = {}) {
  const wins =
    filters.year || filters.month
      ? await getWinsFiltered(filters.year, filters.month)
      : await getAllWins();

  if (wins.length === 0) {
    container.innerHTML = `
      <div class="win-timeline-empty">
        <p>No acknowledgements recorded yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="win-timeline">
      ${wins.map((win) => renderWinTimelineEntry(win)).join("")}
    </div>
  `;
}

/**
 * Render a single timeline entry
 */
function renderWinTimelineEntry(win) {
  const date = new Date(win.date + "T00:00:00");
  const dateDisplay = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `
    <div class="win-timeline-entry">
      <div class="win-timeline-date">${dateDisplay}</div>
      <div class="win-timeline-text">"${win.text}"</div>
    </div>
  `;
}

/**
 * Render filter controls (year and month)
 * @param {HTMLElement} container - Container element
 * @param {Function} onFilterChange - Callback when filters change
 */
export function renderWinFilters(container, onFilterChange) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  const months = [
    "All months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  container.innerHTML = `
    <div class="win-filters">
      <div class="win-filter-group">
        <label for="win-filter-year">Year</label>
        <select id="win-filter-year" class="win-filter-select">
          <option value="">All years</option>
          ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
        </select>
      </div>
      
      <div class="win-filter-group">
        <label for="win-filter-month">Month</label>
        <select id="win-filter-month" class="win-filter-select">
          ${months
            .map((m, i) => `<option value="${i || ""}">${m}</option>`)
            .join("")}
        </select>
      </div>
      
      <button id="win-filter-clear" class="btn-secondary btn-small">Clear filters</button>
    </div>
  `;

  // Attach event listeners
  const yearSelect = container.querySelector("#win-filter-year");
  const monthSelect = container.querySelector("#win-filter-month");
  const clearBtn = container.querySelector("#win-filter-clear");

  const applyFilters = () => {
    const year = yearSelect.value ? parseInt(yearSelect.value) : null;
    const month = monthSelect.value ? parseInt(monthSelect.value) : null;
    onFilterChange({ year, month });
  };

  yearSelect.addEventListener("change", applyFilters);
  monthSelect.addEventListener("change", applyFilters);

  clearBtn.addEventListener("click", () => {
    yearSelect.value = "";
    monthSelect.value = "";
    onFilterChange({});
  });
}
