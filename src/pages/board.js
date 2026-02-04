/**
 * Visualization Board - Page Logic
 * A calm, manual, non-performative visualization space
 *
 * Phase 2: Free-form board canvas (visual only)
 *
 * @see docs/VISUALIZATION_BOARD_PHILOSOPHY.md
 * @see src/data/boardConstraints.js
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/mobile.css";
import "../styles/board.css";

import { BOARD_CONSTRAINTS } from "../data/boardConstraints.js";

/**
 * Initialize the Visualization Board
 */
function init() {
  console.log("Visualization Board - Phase 2: Canvas initialized");
  console.log("Constraints active:", BOARD_CONSTRAINTS);

  renderCanvas();
  renderEmptyState();
}

/**
 * Render the board canvas workspace
 * Creates a large, scrollable area for free-form placement
 */
function renderCanvas() {
  const canvas = document.querySelector(".board-canvas");

  // Create workspace container for expansive area
  const workspace = document.createElement("div");
  workspace.className = "board-canvas-workspace";
  workspace.setAttribute("role", "region");
  workspace.setAttribute("aria-label", "Visualization board workspace");

  canvas.appendChild(workspace);
}

/**
 * Render empty state message
 * Shows calm invitation when no cards exist
 */
function renderEmptyState() {
  const workspace = document.querySelector(".board-canvas-workspace");

  const emptyState = document.createElement("div");
  emptyState.className = "board-empty-state";
  emptyState.textContent = "A quiet space, ready when you are";

  workspace.appendChild(emptyState);
}

// Initialize on page load
init();
