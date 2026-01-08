/**
 * LifeLab - Main Application Entry
 * Data-first analytical dashboard
 */

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/mobile.css";

import { loadMonth, loadSettings } from "./data/storage.js";
import { renderLineGraph } from "./graphs/lineGraph.js";
import { renderHeatmap } from "./graphs/heatmap.js";
import { generateInsights } from "./insights/analytics.js";
import { autoMigrate } from "./data/migrate.js";
import { renderWinSummary } from "./components/winCounter.js";
import { persistence } from "./data/persistence/manager.js";
import { getTodaysMemory } from "./data/memoryQuery.js";
import { renderMemoryCard } from "./components/memoryCard.js";

/**
 * Initialize the application
 */
async function init() {
  try {
    // Initialize Firebase persistence (must wait for it)
    await persistence.init(true);

    showLoading();

    // Auto-migrate sample data if needed
    const now = new Date();
    let data = loadMonth(now.getFullYear(), now.getMonth() + 1);

    if (data.length === 0) {
      // Try to load from JSON file
      await autoMigrate();
      data = loadMonth(now.getFullYear(), now.getMonth() + 1);
    }

    if (data.length === 0) {
      showEmptyState();
      await renderMemoryAid();
      return;
    }

    // Render visualizations
    renderVisualizations(data);

    // Render Memory Aid at the bottom
    await renderMemoryAid();
  } catch (error) {
    console.error("Failed to initialize:", error);
    showError(error.message);
  }
}

/**
 * Render all visualizations
 */
function renderVisualizations(data) {
  const now = new Date();

  // Line graph
  const lineGraphContainer = document.getElementById("line-graph");
  if (lineGraphContainer) {
    try {
      renderLineGraph(data, lineGraphContainer);
    } catch (error) {
      console.error("Line graph error:", error);
      lineGraphContainer.innerHTML = `
        <div class="empty-state">
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }

  // Heatmap (show current month data with month/year context)
  const heatmapContainer = document.getElementById("heatmap");
  if (heatmapContainer) {
    renderHeatmap(data, heatmapContainer, {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  }

  // Insights
  const insights = generateInsights(data);
  const insightsList = document.getElementById("insights-list");
  if (insightsList) {
    insightsList.innerHTML = insights
      .map((insight) => renderInsightCard(insight))
      .join("");
  }

  // Win summary (minimal presence)
  const winSummaryContainer = document.getElementById("win-summary-container");
  if (winSummaryContainer) {
    renderWinSummary(winSummaryContainer);
  }
}

/**
 * Renders an insight card with icon and styling
 */
function renderInsightCard(insight) {
  const icons = {
    up: '<path d="M5 15l7-7 7 7"/><path d="M12 8v14"/>',
    down: '<path d="M19 9l-7 7-7-7"/><path d="M12 16V2"/>',
    trend: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    energy:
      '<circle cx="12" cy="12" r="10"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>',
    calendar:
      '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
  };

  const iconSvg = icons[insight.icon] || icons.info;

  return `
    <li data-type="${insight.type}">
      <div class="insight-icon">
        <svg viewBox="0 0 24 24">${iconSvg}</svg>
      </div>
      <div class="insight-content">
        <div class="insight-message">${insight.message}</div>
        ${
          insight.highlight
            ? `<div class="insight-highlight">${insight.highlight}</div>`
            : ""
        }
      </div>
    </li>
  `;
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
        <p>Go to <a href="./notebook.html">Notebook</a> to start tracking!</p>
      </div>
    `;
  }

  const heatmapContainer = document.getElementById("heatmap");
  if (heatmapContainer) {
    heatmapContainer.innerHTML = "";
  }

  const insightsList = document.getElementById("insights-list");
  if (insightsList) {
    insightsList.innerHTML = renderInsightCard({
      type: "info",
      icon: "info",
      message: "Start tracking to generate insights",
      highlight: null,
    });
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

/**
 * Render Memory Aid (if enabled)
 */
async function renderMemoryAid() {
  const container = document.getElementById("memory-aid-container");
  if (!container) return;

  // Check if feature is enabled
  const settings = loadSettings();
  if (!settings.memoryAidsEnabled) {
    container.innerHTML = "";
    return;
  }

  // Fetch today's memory
  try {
    const memory = await getTodaysMemory();
    if (memory) {
      renderMemoryCard(memory, container);
    } else {
      container.innerHTML = "";
    }
  } catch (error) {
    console.warn("Memory aid failed silently:", error);
    container.innerHTML = "";
  }
}

// Start the app
init();
