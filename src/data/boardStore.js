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
    const cardData = {
      id: card.id,
      type: card.type,
      content: card.content,
      position: {
        x: card.position.x,
        y: card.position.y,
      },
    };

    // Persistence manager handles localStorage vs Firebase based on auth
    const success = await persistence.save(CARDS_COLLECTION, cardData);
    
    if (success) {
      console.log(`[Board Store] Card ${card.id} saved`);
    }
    
    return success;
  } catch (error) {
    console.error("[Board Store] Save failed:", error);
    return false;
  }
}

/**
 * Load all cards from persistence
 * Called once on page load
 *
 * @returns {Promise<Array>} Array of card objects
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
 * Delete a card from Firebase
 * Called only on explicit user action (delete confirmation)
 *
 * @param {string} cardId - Card ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCard(cardId) {
  if (!initialized) {
    await initBoardStore();
  }

  // If Firebase unavailable, skip
  if (!db) {
    console.log("[Board Store] Delete skipped - no Firebase connection");
    return false;
  }

  try {
    const sharedId = getSharedDocId();
    const cardRef = doc(db, "lifelab_data", sharedId, COLLECTION_NAME, cardId);

    await deleteDoc(cardRef);
    console.log(`[Board Store] Card ${cardId} deleted`);
    return true;
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

  if (!db) {
    return false;
  }

  try {
    const sharedId = getSharedDocId();
    const settingsRef = doc(
      db,
      "lifelab_data",
      sharedId,
      "board_settings",
      "starter_template",
    );
    const settingsDoc = await getDoc(settingsRef);

    return settingsDoc.exists() ? settingsDoc.data().dismissed === true : false;
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

  if (!db) {
    console.warn("[Board Store] Not initialized, cannot save dismissal state");
    return false;
  }

  try {
    const sharedId = getSharedDocId();
    const settingsRef = doc(
      db,
      "lifelab_data",
      sharedId,
      "board_settings",
      "starter_template",
    );

    await setDoc(settingsRef, {
      dismissed: true,
      dismissedAt: serverTimestamp(),
    });

    console.log("[Board Store] Starter template dismissed");
    return true;
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

  // If Firebase unavailable, skip
  if (!db) {
    return false;
  }

  try {
    const sharedId = getSharedDocId();
    const cardRef = doc(db, "lifelab_data", sharedId, COLLECTION_NAME, cardId);

    // Get existing card data
    const cardSnap = await getDoc(cardRef);
    if (!cardSnap.exists()) {
      console.warn(
        `[Board Store] Card ${cardId} not found for position update`,
      );
      return false;
    }

    const cardData = cardSnap.data();

    // Update only position and timestamp
    await setDoc(
      cardRef,
      {
        ...cardData,
        position: {
          x: position.x,
          y: position.y,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: false },
    );

    console.log(`[Board Store] Card ${cardId} position updated`);
    return true;
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

  if (!db) {
    return false;
  }

  try {
    const sharedId = getSharedDocId();
    const cardsCollection = collection(
      db,
      "lifelab_data",
      sharedId,
      COLLECTION_NAME,
    );

    const snapshot = await getDocs(cardsCollection);
    const deletePromises = [];

    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
    });

    await Promise.all(deletePromises);
    console.log("[Board Store] All cards cleared");
    return true;
  } catch (error) {
    console.error("[Board Store] Clear failed:", error);
    return false;
  }
}
