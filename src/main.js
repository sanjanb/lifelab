/**
 * LifeLab - Main Application Entry
 * Data-first analytical dashboard
 */

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";

import { loadCurrentMonth } from "./data/loader.js";
import { getMonthlyData } from "./data/store.js";
import { renderLineGraph } from "./graphs/lineGraph.js";
import { renderHeatmap } from "./graphs/heatmap.js";
import { generateInsights } from "./insights/analytics.js";

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load current month data
    showLoading();
    const data = await loadCurrentMonth();

    if (data.length === 0) {
      showEmptyState();
      return;
    }

    // Render visualizations
    renderVisualizations(data);
  } catch (error) {
    console.error("Failed to initialize:", error);
    showError(error.message);
  }
}

/**
 * Render all visualizations
 */
function renderVisualizations(data) {
  // Line graph
  const lineGraphContainer = document.getElementById("line-graph");
  if (lineGraphContainer) {
    renderLineGraph(data, lineGraphContainer);
  }

  // Heatmap (for now, just show current month - later we'll load full year)
  const heatmapContainer = document.getElementById("heatmap");
  if (heatmapContainer) {
    renderHeatmap(data, heatmapContainer);
  }

  // Insights
  const insights = generateInsights(data);
  const insightsList = document.getElementById("insights-list");
  if (insightsList) {
    insightsList.innerHTML = insights
      .map((insight) => `<li>${insight}</li>`)
      .join("");
  }
}

/**
 * Show loading state
 */
function showLoading() {
  const containers = ["line-graph", "heatmap", "insights-list"];
  containers.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<div class="loading">Loading data</div>';
    }
  });
}

/**
 * Show empty state
 */
function showEmptyState() {
  const lineGraphContainer = document.getElementById("line-graph");
  if (lineGraphContainer) {
    lineGraphContainer.innerHTML = `
      <div class="empty-state">
        <p>No data available for the current month.</p>
        <p>Add JSON files to <code>/public/data/months/</code> to get started.</p>
      </div>
    `;
  }

  const heatmapContainer = document.getElementById("heatmap");
  if (heatmapContainer) {
    heatmapContainer.innerHTML = "";
  }

  const insightsList = document.getElementById("insights-list");
  if (insightsList) {
    insightsList.innerHTML = "<li>Start tracking to generate insights</li>";
  }
}

/**
 * Show error state
 */
function showError(message) {
  const lineGraphContainer = document.getElementById("line-graph");
  if (lineGraphContainer) {
    lineGraphContainer.innerHTML = `
      <div class="empty-state">
        <p>Error: ${message}</p>
      </div>
    `;
  }
}

// Start the app
init();
