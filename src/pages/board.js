/**
 * Visualization Board - Page Logic
 * A calm, manual, non-performative visualization space
 *
 * Phase 3: Card types and rendering layer
 *
 * @see docs/VISUALIZATION_BOARD_PHILOSOPHY.md
 * @see src/data/boardConstraints.js
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/mobile.css";
import "../styles/board.css";

import { BOARD_CONSTRAINTS, CARD_TYPES } from "../data/boardConstraints.js";

/**
 * Initialize the Visualization Board
 */
function init() {
  console.log("Visualization Board - Phase 3: Card rendering initialized");
  console.log("Constraints active:", BOARD_CONSTRAINTS);
  console.log("Supported card types:", CARD_TYPES);

  renderCanvas();
  renderEmptyState();

  // Demo: Render example cards (will be removed in Phase 4)
  renderDemoCards();
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

/**
 * Render a card on the board
 * @param {Object} card - Card data object
 * @param {string} card.id - Unique card identifier
 * @param {string} card.type - Card type (text, image, color)
 * @param {string} card.content - Card content (text, image URL, or color value)
 * @param {Object} card.position - Card position {x, y}
 * @returns {HTMLElement} The rendered card element
 */
function renderCard(card) {
  const { id, type, content, position } = card;

  // Create card container
  const cardElement = document.createElement("div");
  cardElement.className = `board-card card-${type}`;
  cardElement.setAttribute("data-card-id", id);
  cardElement.setAttribute("role", "article");
  cardElement.setAttribute("tabindex", "0");

  // Position the card
  cardElement.style.left = `${position.x}px`;
  cardElement.style.top = `${position.y}px`;

  // Render based on card type
  switch (type) {
    case CARD_TYPES.TEXT:
      renderTextCard(cardElement, content);
      break;
    case CARD_TYPES.IMAGE:
      renderImageCard(cardElement, content);
      break;
    case CARD_TYPES.COLOR:
      renderColorCard(cardElement, content);
      break;
    default:
      console.warn(`Unknown card type: ${type}`);
  }

  return cardElement;
}

/**
 * Render text card content
 * @param {HTMLElement} cardElement - Card container
 * @param {string} text - Text content
 */
function renderTextCard(cardElement, text) {
  const contentDiv = document.createElement("div");
  contentDiv.className = "board-card-content";
  contentDiv.textContent = text;
  contentDiv.setAttribute("aria-label", "Text card");

  cardElement.appendChild(contentDiv);
}

/**
 * Render image card content
 * @param {HTMLElement} cardElement - Card container
 * @param {string} imageUrl - Image URL
 */
function renderImageCard(cardElement, imageUrl) {
  const img = document.createElement("img");
  img.className = "board-card-image";
  img.src = imageUrl;
  img.alt = "Visual element";
  img.setAttribute("draggable", "false");

  // Handle image load errors gracefully
  img.addEventListener("error", () => {
    cardElement.style.backgroundColor = "#f1f1f1";
    cardElement.innerHTML =
      '<div style="padding: 1rem; color: #999;">Image unavailable</div>';
  });

  cardElement.appendChild(img);
}

/**
 * Render color card content
 * @param {HTMLElement} cardElement - Card container
 * @param {string} color - Color value (hex, rgb, etc.)
 */
function renderColorCard(cardElement, color) {
  cardElement.style.backgroundColor = color;
  cardElement.setAttribute("aria-label", `Color block: ${color}`);
}

/**
 * Add a card to the workspace
 * @param {Object} card - Card data object
 */
function addCardToWorkspace(card) {
  const workspace = document.querySelector(".board-canvas-workspace");
  const cardElement = renderCard(card);

  workspace.appendChild(cardElement);

  // Hide empty state when cards exist
  const emptyState = workspace.querySelector(".board-empty-state");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

/**
 * Demo: Render example cards to showcase card types
 * This will be removed in Phase 4 when manual card creation is implemented
 */
function renderDemoCards() {
  // Example cards demonstrating each type
  const demoCards = [
    {
      id: "demo-text-1",
      type: CARD_TYPES.TEXT,
      content: "Notice what you notice",
      position: { x: 100, y: 100 },
    },
    {
      id: "demo-text-2",
      type: CARD_TYPES.TEXT,
      content: "Meaning emerges through arrangement, not measurement",
      position: { x: 400, y: 150 },
    },
    {
      id: "demo-color-1",
      type: CARD_TYPES.COLOR,
      content: "#e8f4f8",
      position: { x: 150, y: 300 },
    },
    {
      id: "demo-color-2",
      type: CARD_TYPES.COLOR,
      content: "#f9f3e8",
      position: { x: 500, y: 280 },
    },
  ];

  // Render demo cards
  demoCards.forEach((card) => addCardToWorkspace(card));
}

// Initialize on page load
init();
