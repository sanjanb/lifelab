/**
 * Visualization Board - Page Logic
 * A calm, manual, non-performative visualization space
 * 
 * Phase 1: Page skeleton with no interactivity
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
  console.log("Visualization Board initialized");
  console.log("Constraints active:", BOARD_CONSTRAINTS);
  
  renderEmptyState();
}

/**
 * Render empty state message
 * Shows calm invitation when no cards exist
 */
function renderEmptyState() {
  const canvas = document.querySelector(".board-canvas");
  
  const emptyState = document.createElement("div");
  emptyState.className = "board-empty-state";
  emptyState.textContent = "A quiet space, ready when you are";
  
  canvas.appendChild(emptyState);
}

// Initialize on page load
init();
