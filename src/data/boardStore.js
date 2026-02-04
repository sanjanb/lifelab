/**
 * Visualization Board Data Store
 * Handles persistence for board cards using Firebase
 *
 * CRITICAL: No autosave loops - saves only on explicit user actions
 *
 * @see docs/VISUALIZATION_BOARD_PHILOSOPHY.md
 */

import { persistence } from "./persistence/manager.js";

const CARDS_COLLECTION = "board_cards";
const SETTINGS_COLLECTION = "board_settings";

let initialized = false;

/**
 * Initialize board store
 * @returns {Promise<boolean>} Success status
 */
export async function initBoardStore() {
  if (initialized) return true;

  try {
    // Persistence manager is auth-aware and auto-initializes
    await persistence.init();
    initialized = true;
    console.log("[Board Store] Initialized");
    return true;
  } catch (error) {
    console.error("[Board Store] Initialization failed:", error);
    return false;
  }
}

/**
 * Save a card to persistence
 * Called only on explicit user actions (create, move, edit)
 *
 * @param {Object} card - Card object
 * @param {string} card.id - Card ID
 * @param {string} card.type - Card type (text, image, color)
 * @param {string} card.content - Card content
 * @param {Object} card.position - Card position {x, y}
 * @returns {Promise<boolean>} Success status
 */
export async function saveCard(card) {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    // Load all cards
    const cards = await loadCards();
    
    // Find existing card or add new one
    const existingIndex = cards.findIndex(c => c.id === card.id);
    
    const cardData = {
      id: card.id,
      type: card.type,
      content: card.content,
      position: {
        x: card.position.x,
        y: card.position.y,
      },
    };
    
    if (existingIndex >= 0) {
      // Update existing card
      cards[existingIndex] = cardData;
    } else {
      // Add new card
      cards.push(cardData);
    }

    // Persistence manager handles localStorage vs Firebase based on auth
    const success = await persistence.save(CARDS_COLLECTION, cards);
 */
export async function loadCards() {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    // Persistence manager handles fetching from localStorage or Firebase
    const result = await persistence.fetch(CARDS_COLLECTION);

    if (result && Array.isArray(result)) {
      console.log(`[Board Store] Loaded ${result.length} cards`);
      return result;
    }

    return [];
  } catch (error) {
    console.error("[Board Store] Load failed:", error);
    return [];
  }
}

/**
 * Delete a card
 * Called only on explicit user action (delete confirmation)
 *
 * @param {string} cardId - Card ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCard(cardId) {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    // Load all cards
    const cards = await loadCards();
    
    // Filter out the deleted card
    const updatedCards = cards.filter(card => card.id !== cardId);
    
    // Save updated array
    const success = await persistence.save(CARDS_COLLECTION, updatedCards);
    
    if (success) {
      console.log(`[Board Store] Card ${cardId} deleted`);
    }
    
    return success;
  } catch (error) {
    console.error("[Board Store] Delete failed:", error);
    return false;
  }
}

/**
 * Check if starter template was dismissed
 * @returns {Promise<boolean>} True if dismissed
 */
export async function getStarterDismissed() {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    const settings = await persistence.fetch(SETTINGS_COLLECTION);
    return settings?.starter_template_dismissed === true;
  } catch (error) {
    console.error("[Board Store] Error checking starter dismissal:", error);
    return false;
  }
}

/**
 * Save starter template dismissal state
 * @returns {Promise<boolean>} Success status
 */
export async function saveStarterDismissed() {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    const settings = await persistence.fetch(SETTINGS_COLLECTION) || {};
    settings.starter_template_dismissed = true;
    settings.dismissedAt = new Date().toISOString();
    
    const success = await persistence.save(SETTINGS_COLLECTION, settings);
    
    if (success) {
      console.log("[Board Store] Starter template dismissed");
    }
    
    return success;
  } catch (error) {
    console.error("[Board Store] Error saving dismissal state:", error);
    return false;
  }
}

/**
 * Update card position
 * Called only when drag ends (not during drag)
 *
 * @param {string} cardId - Card ID
 * @param {Object} position - New position {x, y}
 * @returns {Promise<boolean>} Success status
 */
export async function updateCardPosition(cardId, position) {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    // Load all cards
    const cards = await loadCards();
    
    // Find and update the card
    const card = cards.find(c => c.id === cardId);
    if (!card) {
      console.warn(`[Board Store] Card ${cardId} not found for position update`);
      return false;
    }
    
    // Update position
    card.position = { x: position.x, y: position.y };
    
    // Save updated array
    const success = await persistence.save(CARDS_COLLECTION, cards);
    
    if (success) {
      console.log(`[Board Store] Card ${cardId} position updated`);
    }
    
    return success;
  } catch (error) {
    console.error("[Board Store] Position update failed:", error);
    return false;
  }
}

/**
 * Clear all cards (for testing/reset)
 * Requires explicit confirmation from user
 *
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllCards() {
  if (!initialized) {
    await initBoardStore();
  }

  try {
    // Save empty array
    const success = await persistence.save(CARDS_COLLECTION, []);
    
    if (success) {
      console.log("[Board Store] All cards cleared");
    }
    
    return success;
  } catch (error) {
    console.error("[Board Store] Clear failed:", error);
    return false;
  }
}
