/**
 * Win Ledger Page
 *
 * Dedicated page for win entry and timeline viewing.
 * Calm, neutral, archival feel.
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";

import { renderWinEntry } from "../components/winEntry.js";
import { renderWinStats } from "../components/winCounter.js";
import {
  renderWinTimeline,
  renderWinFilters,
} from "../components/winTimeline.js";

/**
 * Initialize wins page
 */
async function init() {
  renderWinEntrySection();
  renderStatsSection();
  renderTimelineSection();
}

/**
 * Render win entry for today
 */
function renderWinEntrySection() {
  const container = document.getElementById("win-entry-container");

  renderWinEntry(container, () => {
    // On save, refresh stats and timeline
    renderStatsSection();
    renderTimelineSection();
  });
}

/**
 * Render win statistics
 */
function renderStatsSection() {
  const container = document.getElementById("win-stats-container");
  renderWinStats(container);
}

/**
 * Render timeline with filters
 */
function renderTimelineSection() {
  const filtersContainer = document.getElementById("win-filters-container");
  const timelineContainer = document.getElementById("win-timeline-container");

  // Render filters
  renderWinFilters(filtersContainer, (filters) => {
    renderWinTimeline(timelineContainer, filters);
  });

  // Initial timeline render
  renderWinTimeline(timelineContainer);
}

// Initialize
init();
