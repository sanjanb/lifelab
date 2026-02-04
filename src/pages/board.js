/**
 * Visualization Board - Page Logic
 * A calm, manual, non-performative visualization space
 *
 * Phase 9-10: Accessibility & Final Integrity Review
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
import {
  initBoardStore,
  saveCard,
  loadCards,
  deleteCard,
  updateCardPosition,
  getStarterDismissed,
  saveStarterDismissed,
} from "../data/boardStore.js";

// State management
let cardIdCounter = 0;
let draggedCard = null;
let dragOffset = { x: 0, y: 0 };

/**
 * Initialize the Visualization Board
 */
async function init() {
  console.log(
    "Visualization Board - Phase 9-10: Accessibility & Final Review complete",
  );
  console.log("Constraints active:", BOARD_CONSTRAINTS);
  console.log("Supported card types:", CARD_TYPES);

  renderCanvas();
  renderEmptyState();
  renderAddButton();
  setupDragAndDrop();
  setupKeyboardNavigation();

  // Initialize Firebase and load existing cards
  await initBoardStore();
  await loadExistingCards();

  // Check if we should show starter template
  await checkAndShowStarterTemplate();
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
 * Render the "Add Card" button
 * Small, unobtrusive button for intentional card creation
 */
function renderAddButton() {
  const button = document.createElement("button");
  button.className = "add-card-button";
  button.innerHTML = "+";
  button.setAttribute("aria-label", "Add a card");
  button.setAttribute("title", "Add a card");

  button.addEventListener("click", showCardTypeModal);

  document.body.appendChild(button);
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

  // Add action buttons (edit/delete)
  addCardActions(cardElement, { id, type, content });

  // Enable dragging for this card
  makeDraggable(cardElement);

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
 * Add action buttons (edit/delete) to a card
 * @param {HTMLElement} cardElement - The card element
 * @param {Object} cardData - Card data {id, type, content}
 */
function addCardActions(cardElement, cardData) {
  const actionsContainer = document.createElement("div");
  actionsContainer.className = "card-actions";

  // Edit button
  const editButton = document.createElement("button");
  editButton.className = "card-action-button edit-button";
  editButton.innerHTML = "✎";
  editButton.setAttribute("aria-label", "Edit card");
  editButton.setAttribute("title", "Edit");
  editButton.addEventListener("click", (e) => {
    e.stopPropagation();
    showEditModal(cardData);
  });

  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "card-action-button delete-button";
  deleteButton.innerHTML = "×";
  deleteButton.setAttribute("aria-label", "Delete card");
  deleteButton.setAttribute("title", "Delete");
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    showDeleteConfirmation(cardData.id);
  });

  actionsContainer.appendChild(editButton);
  actionsContainer.appendChild(deleteButton);
  cardElement.appendChild(actionsContainer);
}

/**
 * Show edit modal for a card
 * @param {Object} cardData - Card data {id, type, content}
 */
function showEditModal(cardData) {
  const { id, type, content } = cardData;

  const modal = document.createElement("div");
  modal.className = "card-input-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "edit-card-title");

  const modalContent = document.createElement("div");
  modalContent.className = "card-input-modal-content";

  const title = document.createElement("h3");
  title.id = "edit-card-title";
  title.textContent = `Edit ${type} card`;

  const inputGroup = document.createElement("div");
  inputGroup.className = "card-input-group";

  let input;

  if (type === CARD_TYPES.TEXT) {
    const label = document.createElement("label");
    label.textContent = "Your text";
    input = document.createElement("textarea");
    input.value = content;
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
  } else if (type === CARD_TYPES.IMAGE) {
    const label = document.createElement("label");
    label.textContent = "Image URL";
    input = document.createElement("input");
    input.type = "text";
    input.value = content;
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
  } else if (type === CARD_TYPES.COLOR) {
    const label = document.createElement("label");
    label.textContent = "Choose a color";
    input = document.createElement("input");
    input.type = "color";
    input.value = content;
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
  }

  const actions = document.createElement("div");
  actions.className = "card-input-actions";

  const cancelButton = document.createElement("button");
  cancelButton.className = "card-input-cancel";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => closeModal(modal));

  const saveButton = document.createElement("button");
  saveButton.className = "card-input-save";
  saveButton.textContent = "Save Changes";
  saveButton.addEventListener("click", async () => {
    const newContent = input.value.trim();
    if (newContent || type === CARD_TYPES.COLOR) {
      await updateCard(id, type, input.value);
      closeModal(modal);
    }
  });

  if (type !== CARD_TYPES.COLOR) {
    input.addEventListener("input", () => {
      saveButton.disabled = !input.value.trim();
    });
    saveButton.disabled = !input.value.trim();
  }

  actions.appendChild(cancelButton);
  actions.appendChild(saveButton);

  modalContent.appendChild(title);
  modalContent.appendChild(inputGroup);
  modalContent.appendChild(actions);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  setTimeout(() => input.focus(), 100);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });

  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal(modal);
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

/**
 * Update a card's content
 * @param {string} cardId - Card ID
 * @param {string} cardType - Card type
 * @param {string} newContent - New content
 */
async function updateCard(cardId, cardType, newContent) {
  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  if (!cardElement) return;

  const position = {
    x: parseInt(cardElement.style.left),
    y: parseInt(cardElement.style.top),
  };

  const updatedCard = {
    id: cardId,
    type: cardType,
    content: newContent,
    position,
  };

  cardElement.remove();
  addCardToWorkspace(updatedCard);
  await saveCard(updatedCard);
}

/**
 * Show delete confirmation modal
 * @param {string} cardId - Card ID to delete
 */
function showDeleteConfirmation(cardId) {
  const modal = document.createElement("div");
  modal.className = "delete-confirmation-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "delete-title");

  const modalContent = document.createElement("div");
  modalContent.className = "delete-confirmation-content";

  const title = document.createElement("h3");
  title.id = "delete-title";
  title.textContent = "Delete card?";

  const message = document.createElement("p");
  message.textContent =
    "This card will be permanently removed. This action cannot be undone.";

  const actions = document.createElement("div");
  actions.className = "delete-confirmation-actions";

  const cancelButton = document.createElement("button");
  cancelButton.className = "delete-cancel-button";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => closeModal(modal));

  const confirmButton = document.createElement("button");
  confirmButton.className = "delete-confirm-button";
  confirmButton.textContent = "Delete";
  confirmButton.addEventListener("click", async () => {
    await deleteCardById(cardId);
    closeModal(modal);
  });

  actions.appendChild(cancelButton);
  actions.appendChild(confirmButton);

  modalContent.appendChild(title);
  modalContent.appendChild(message);
  modalContent.appendChild(actions);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  setTimeout(() => confirmButton.focus(), 100);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });

  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal(modal);
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

/**
 * Delete a card by ID
 * @param {string} cardId - Card ID to delete
 */
async function deleteCardById(cardId) {
  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  if (cardElement) {
    cardElement.remove();
  }

  await deleteCard(cardId);

  const workspace = document.querySelector(".board-canvas-workspace");
  const remainingCards = workspace.querySelectorAll(".board-card");
  const emptyState = workspace.querySelector(".board-empty-state");

  if (remainingCards.length === 0 && emptyState) {
    emptyState.style.display = "block";
  }
}

/**
 * Show modal to select card type
 * User explicitly chooses what type of card to create
 */
function showCardTypeModal() {
  const modal = document.createElement("div");
  modal.className = "card-type-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "card-type-title");

  const modalContent = document.createElement("div");
  modalContent.className = "card-type-modal-content";

  const title = document.createElement("h3");
  title.id = "card-type-title";
  title.textContent = "Choose card type";

  const options = document.createElement("div");
  options.className = "card-type-options";

  // Text card option
  const textOption = createCardTypeOption(
    CARD_TYPES.TEXT,
    "Text",
    "Short reflection or phrase",
  );
  textOption.addEventListener("click", () => {
    closeModal(modal);
    showCardInputModal(CARD_TYPES.TEXT);
  });

  // Image card option
  const imageOption = createCardTypeOption(
    CARD_TYPES.IMAGE,
    "Image",
    "Visual element from URL",
  );
  imageOption.addEventListener("click", () => {
    closeModal(modal);
    showCardInputModal(CARD_TYPES.IMAGE);
  });

  // Color card option
  const colorOption = createCardTypeOption(
    CARD_TYPES.COLOR,
    "Color",
    "Single color block",
  );
  colorOption.addEventListener("click", () => {
    closeModal(modal);
    showCardInputModal(CARD_TYPES.COLOR);
  });

  options.appendChild(textOption);
  options.appendChild(imageOption);
  options.appendChild(colorOption);

  const actions = document.createElement("div");
  actions.className = "modal-actions";

  const cancelButton = document.createElement("button");
  cancelButton.className = "modal-cancel-button";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => closeModal(modal));

  actions.appendChild(cancelButton);

  modalContent.appendChild(title);
  modalContent.appendChild(options);
  modalContent.appendChild(actions);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal(modal);
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

/**
 * Create a card type option element
 */
function createCardTypeOption(type, title, description) {
  const option = document.createElement("div");
  option.className = "card-type-option";
  option.setAttribute("tabindex", "0");
  option.setAttribute("role", "button");

  const titleEl = document.createElement("div");
  titleEl.className = "card-type-option-title";
  titleEl.textContent = title;

  const descEl = document.createElement("div");
  descEl.className = "card-type-option-desc";
  descEl.textContent = description;

  option.appendChild(titleEl);
  option.appendChild(descEl);

  // Keyboard support
  option.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      option.click();
    }
  });

  return option;
}

/**
 * Show modal to input card content
 * @param {string} cardType - Type of card being created
 */
function showCardInputModal(cardType) {
  const modal = document.createElement("div");
  modal.className = "card-input-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "card-input-title");

  const modalContent = document.createElement("div");
  modalContent.className = "card-input-modal-content";

  const title = document.createElement("h3");
  title.id = "card-input-title";
  title.textContent = `Add ${cardType} card`;

  const inputGroup = document.createElement("div");
  inputGroup.className = "card-input-group";

  let input;

  if (cardType === CARD_TYPES.TEXT) {
    const label = document.createElement("label");
    label.textContent = "Your text";
    input = document.createElement("textarea");
    input.placeholder = "Enter your reflection...";
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
  } else if (cardType === CARD_TYPES.IMAGE) {
    const label = document.createElement("label");
    label.textContent = "Image URL";
    input = document.createElement("input");
    input.type = "text";
    input.placeholder = "https://example.com/image.jpg";
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
  } else if (cardType === CARD_TYPES.COLOR) {
    const label = document.createElement("label");
    label.textContent = "Choose a color";
    input = document.createElement("input");
    input.type = "color";
    input.value = "#e8f4f8";
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
  }

  const actions = document.createElement("div");
  actions.className = "card-input-actions";

  const cancelButton = document.createElement("button");
  cancelButton.className = "card-input-cancel";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => closeModal(modal));

  const saveButton = document.createElement("button");
  saveButton.className = "card-input-save";
  saveButton.textContent = "Add Card";
  saveButton.addEventListener("click", () => {
    const content = input.value.trim();
    if (content || cardType === CARD_TYPES.COLOR) {
      createCard(cardType, input.value);
      closeModal(modal);
    }
  });

  // Enable/disable save button based on input
  if (cardType !== CARD_TYPES.COLOR) {
    input.addEventListener("input", () => {
      saveButton.disabled = !input.value.trim();
    });
    saveButton.disabled = true;
  }

  actions.appendChild(cancelButton);
  actions.appendChild(saveButton);

  modalContent.appendChild(title);
  modalContent.appendChild(inputGroup);
  modalContent.appendChild(actions);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Focus input
  setTimeout(() => input.focus(), 100);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal(modal);
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

/**
 * Create a new card and add it to the board
 * @param {string} type - Card type
 * @param {string} content - Card content
 */
async function createCard(type, content) {
  const card = {
    id: `card-${Date.now()}-${++cardIdCounter}`, // Unique ID with timestamp
    type,
    content,
    // Place new cards in center of visible area
    position: {
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
    },
  };

  addCardToWorkspace(card);

  // Save to Firebase (explicit user action)
  await saveCard(card);
}

/**
 * Close and remove a modal
 * @param {HTMLElement} modal - Modal element to close
 */
function closeModal(modal) {
  modal.remove();
}

/**
 * Load existing cards from Firebase
 * Called once on page load
 */
async function loadExistingCards() {
  const cards = await loadCards();

  if (cards.length === 0) {
    console.log("[Board] No existing cards found");
    return;
  }

  // Update card counter to avoid ID conflicts
  cards.forEach((card) => {
    const match = card.id.match(/-(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > cardIdCounter) {
        cardIdCounter = num;
      }
    }
  });

  // Render all loaded cards
  cards.forEach((card) => addCardToWorkspace(card));

  console.log(`[Board] Loaded ${cards.length} cards from Firebase`);
}

/**
 * Setup global drag-and-drop event listeners
 * Handles workspace-level mouse/touch events
 */
function setupDragAndDrop() {
  const workspace = document.querySelector(".board-canvas-workspace");

  // Mouse events
  workspace.addEventListener("mousemove", handleDragMove);
  workspace.addEventListener("mouseup", handleDragEnd);

  // Touch events for mobile
  workspace.addEventListener("touchmove", handleDragMove, { passive: false });
  workspace.addEventListener("touchend", handleDragEnd);
}

/**
 * Setup keyboard navigation for accessibility
 * Allows keyboard-only users to interact with cards
 */
function setupKeyboardNavigation() {
  document.addEventListener("keydown", handleCardKeyboard);
}

/**
 * Handle keyboard events on cards
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleCardKeyboard(e) {
  const focusedCard = document.activeElement;

  // Only handle if a card is focused
  if (!focusedCard || !focusedCard.classList.contains("board-card")) {
    return;
  }

  const cardId = focusedCard.getAttribute("data-card-id");

  // Enter key - Edit card
  if (e.key === "Enter") {
    e.preventDefault();
    const type = focusedCard.classList.contains("card-text")
      ? CARD_TYPES.TEXT
      : focusedCard.classList.contains("card-image")
        ? CARD_TYPES.IMAGE
        : CARD_TYPES.COLOR;
    const content =
      type === CARD_TYPES.TEXT
        ? focusedCard.querySelector(".board-card-content").textContent
        : type === CARD_TYPES.IMAGE
          ? focusedCard.querySelector(".board-card-image").src
          : focusedCard.style.backgroundColor;
    showEditModal({ id: cardId, type, content });
    return;
  }

  // Delete key - Delete card
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    showDeleteConfirmation(cardId);
    return;
  }

  // Arrow keys - Move card
  const moveAmount = e.shiftKey ? 10 : 1; // Shift for larger movements
  let moved = false;

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    const currentX = parseInt(focusedCard.style.left);
    focusedCard.style.left = `${currentX - moveAmount}px`;
    moved = true;
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    const currentX = parseInt(focusedCard.style.left);
    focusedCard.style.left = `${currentX + moveAmount}px`;
    moved = true;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const currentY = parseInt(focusedCard.style.top);
    focusedCard.style.top = `${currentY - moveAmount}px`;
    moved = true;
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const currentY = parseInt(focusedCard.style.top);
    focusedCard.style.top = `${currentY + moveAmount}px`;
    moved = true;
  }

  // Save position after keyboard move
  if (moved) {
    const position = {
      x: parseInt(focusedCard.style.left),
      y: parseInt(focusedCard.style.top),
    };
    updateCardPosition(cardId, position);
  }
}

/**
 * Make a card element draggable
 * @param {HTMLElement} cardElement - The card element
 */
function makeDraggable(cardElement) {
  // Mouse events
  cardElement.addEventListener("mousedown", handleDragStart);

  // Touch events
  cardElement.addEventListener("touchstart", handleDragStart, {
    passive: false,
  });
}

/**
 * Handle drag start event
 * @param {MouseEvent|TouchEvent} e - Event object
 */
function handleDragStart(e) {
  // Prevent default to avoid text selection
  e.preventDefault();

  const card = e.currentTarget;
  draggedCard = card;

  // Get the pointer position
  const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

  // Calculate offset from card's top-left corner
  const rect = card.getBoundingClientRect();
  const workspace = document.querySelector(".board-canvas-workspace");
  const workspaceRect = workspace.getBoundingClientRect();

  dragOffset.x = clientX - rect.left;
  dragOffset.y = clientY - rect.top;

  // Add dragging class for visual feedback
  card.classList.add("dragging");

  // Bring card to front
  card.style.zIndex = "1000";
}

/**
 * Handle drag move event
 * @param {MouseEvent|TouchEvent} e - Event object
 */
function handleDragMove(e) {
  if (!draggedCard) return;

  // Prevent default scrolling on touch
  if (e.type === "touchmove") {
    e.preventDefault();
  }

  // Get pointer position
  const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

  // Get workspace bounds for positioning
  const workspace = document.querySelector(".board-canvas-workspace");
  const workspaceRect = workspace.getBoundingClientRect();
  const scrollLeft = workspace.scrollLeft || 0;
  const scrollTop = workspace.scrollTop || 0;

  // Calculate new position (relative to workspace, not viewport)
  // Free-form positioning - no snapping or alignment
  const newX = clientX - workspaceRect.left + scrollLeft - dragOffset.x;
  const newY = clientY - workspaceRect.top + scrollTop - dragOffset.y;

  // Update card position (calm, direct movement)
  draggedCard.style.left = `${newX}px`;
  draggedCard.style.top = `${newY}px`;
}

/**
 * Handle drag end event
 * @param {MouseEvent|TouchEvent} e - Event object
 */
async function handleDragEnd(e) {
  if (!draggedCard) return;

  // Remove dragging class
  draggedCard.classList.remove("dragging");

  // Reset z-index
  draggedCard.style.zIndex = "";

  // Save the new position to Firebase (explicit user action - drag complete)
  const cardId = draggedCard.getAttribute("data-card-id");
  const position = {
    x: parseInt(draggedCard.style.left),
    y: parseInt(draggedCard.style.top),
  };

  // Update position in Firebase (not during drag, only when dropped)
  await updateCardPosition(cardId, position);

  // Clear drag state
  draggedCard = null;
  dragOffset = { x: 0, y: 0 };
}

/**
 * Check if starter template should be shown
 * Shows 2-3 neutral placeholder cards for new users
 */
async function checkAndShowStarterTemplate() {
  const workspace = document.querySelector(".board-canvas-workspace");
  const existingCards = workspace.querySelectorAll(".board-card");

  // Only show if no cards exist
  if (existingCards.length > 0) return;

  // Check if user has dismissed the template
  const dismissed = await getStarterDismissed();
  if (dismissed) return;

  // Show starter cards
  showStarterCards();
}

/**
 * Show starter template cards
 * Creates 2-3 neutral placeholder cards with a dismiss banner
 */
function showStarterCards() {
  const workspace = document.querySelector(".board-canvas-workspace");

  // Create starter cards (not saved to Firebase)
  const starterCards = [
    {
      id: "starter-1",
      type: CARD_TYPES.TEXT,
      content: "A moment you want to remember",
      position: { x: 100, y: 100 },
      isStarter: true,
    },
    {
      id: "starter-2",
      type: CARD_TYPES.COLOR,
      content: "#e8f4f8",
      position: { x: 350, y: 150 },
      isStarter: true,
    },
    {
      id: "starter-3",
      type: CARD_TYPES.TEXT,
      content: "Something that made you smile",
      position: { x: 600, y: 120 },
      isStarter: true,
    },
  ];

  // Render each starter card
  starterCards.forEach((card) => {
    const cardElement = renderCard(card);
    cardElement.classList.add("starter-card");
    workspace.appendChild(cardElement);
  });

  // Hide empty state
  const emptyState = workspace.querySelector(".board-empty-state");
  if (emptyState) {
    emptyState.style.display = "none";
  }

  // Show dismiss banner
  showStarterDismissBanner();
}

/**
 * Show banner to dismiss starter template
 */
function showStarterDismissBanner() {
  const canvas = document.querySelector(".board-canvas");

  const banner = document.createElement("div");
  banner.className = "starter-dismiss-banner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");

  const message = document.createElement("span");
  message.textContent = "Starter cards — dismiss when ready";

  const dismissButton = document.createElement("button");
  dismissButton.className = "starter-dismiss-button";
  dismissButton.textContent = "Dismiss";
  dismissButton.setAttribute("aria-label", "Dismiss starter cards");
  dismissButton.addEventListener("click", dismissStarterTemplate);

  banner.appendChild(message);
  banner.appendChild(dismissButton);
  canvas.appendChild(banner);
}

/**
 * Dismiss starter template permanently
 */
async function dismissStarterTemplate() {
  const workspace = document.querySelector(".board-canvas-workspace");
  const banner = document.querySelector(".starter-dismiss-banner");

  // Remove all starter cards
  const starterCards = workspace.querySelectorAll(".starter-card");
  starterCards.forEach((card) => card.remove());

  // Remove banner
  if (banner) {
    banner.remove();
  }

  // Save dismissal state to Firebase
  await saveStarterDismissed();

  // Show empty state again
  const emptyState = workspace.querySelector(".board-empty-state");
  if (emptyState) {
    emptyState.style.display = "block";
  }
}

// Initialize on page load
init();
