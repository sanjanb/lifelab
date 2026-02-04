/**
 * User Data Namespace
 *
 * PHILOSOPHY:
 * ===========
 * Strict separation of data per user.
 * One user = one private data space.
 * All reads and writes are scoped to UID.
 * No shared collections for user-generated content.
 *
 * CANONICAL DATA SHAPE:
 * =====================
 * users/
 *   {uid}/
 *     profile/
 *       displayName
 *       createdAt
 *       lastLoginAt
 *     wins/
 *       {winId}/
 *         date
 *         domain
 *         description
 *         score
 *     journal/
 *       {entryId}/
 *         date
 *         entries (array of domain entries)
 *     reflections/
 *       {reflectionId}/
 *         date
 *         promptId
 *         response
 *     board/
 *       cards/
 *         {cardId}/
 *           type
 *           content
 *           position
 *       settings/
 *         starter_template/
 *           dismissed
 *     settings/
 *       domains
 *       firstDayOfWeek
 *       memoryAidsEnabled
 *
 * @see docs/AUTHENTICATION.md - Phase 4
 * @see src/data/persistence/authPhilosophy.js
 */

import { getCurrentUserId, isAuthenticated } from "./authState.js";

/**
 * Collection names for user data
 * All nested under users/{uid}/
 */
export const USER_COLLECTIONS = {
  PROFILE: "profile",
  WINS: "wins",
  JOURNAL: "journal",
  REFLECTIONS: "reflections",
  BOARD_CARDS: "board/cards",
  BOARD_SETTINGS: "board/settings",
  SETTINGS: "settings",
};

/**
 * Get the base path for a user's data
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {string} Base path: "users/{uid}"
 * @throws {Error} If no UID provided and user not authenticated
 */
export function getUserBasePath(uid = null) {
  const userId = uid || getCurrentUserId();

  if (!userId) {
    throw new Error("Cannot get user path: No user authenticated");
  }

  return `users/${userId}`;
}

/**
 * Get the full path for a user collection
 * @param {string} collection - Collection name from USER_COLLECTIONS
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {string} Full path: "users/{uid}/{collection}"
 * @throws {Error} If no UID provided and user not authenticated
 */
export function getUserCollectionPath(collection, uid = null) {
  const basePath = getUserBasePath(uid);
  return `${basePath}/${collection}`;
}

/**
 * Get the full path for a specific document in a user collection
 * @param {string} collection - Collection name from USER_COLLECTIONS
 * @param {string} docId - Document ID
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {string} Full path: "users/{uid}/{collection}/{docId}"
 * @throws {Error} If no UID provided and user not authenticated
 */
export function getUserDocPath(collection, docId, uid = null) {
  const collectionPath = getUserCollectionPath(collection, uid);
  return `${collectionPath}/${docId}`;
}

/**
 * Validate that a path is user-scoped
 * Ensures no global collections are being used
 * @param {string} path - Firestore path to validate
 * @returns {boolean} True if path is properly user-scoped
 */
export function validateUserScopedPath(path) {
  // Must start with "users/{uid}/"
  const userPathPattern = /^users\/[^/]+\//;

  if (!userPathPattern.test(path)) {
    console.error(
      `[User Namespace] Invalid path: ${path} - must be user-scoped`,
    );
    return false;
  }

  return true;
}

/**
 * Get shared collection ID (for backward compatibility during migration)
 * This is TEMPORARY and will be removed after Phase 6 (migration)
 * @returns {string} Shared document ID
 * @deprecated Use user-scoped paths instead
 */
export function getSharedDocId() {
  console.warn("[User Namespace] Using shared collection - this is deprecated");
  return "shared_data";
}

/**
 * Check if user has a private data space
 * Used during migration to determine if user data exists
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {boolean} True if user should use private namespace
 */
export function shouldUseUserNamespace(uid = null) {
  const userId = uid || getCurrentUserId();

  // If authenticated, always use user namespace
  if (userId) {
    return true;
  }

  // If not authenticated, use shared collection (backward compatibility)
  return false;
}

/**
 * User namespace helper functions for common operations
 */
export const UserNamespace = {
  /**
   * Get profile path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to user profile
   */
  profilePath: (uid = null) =>
    getUserCollectionPath(USER_COLLECTIONS.PROFILE, uid),

  /**
   * Get wins collection path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to wins collection
   */
  winsPath: (uid = null) => getUserCollectionPath(USER_COLLECTIONS.WINS, uid),

  /**
   * Get specific win path
   * @param {string} winId - Win document ID
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to win document
   */
  winPath: (winId, uid = null) =>
    getUserDocPath(USER_COLLECTIONS.WINS, winId, uid),

  /**
   * Get journal collection path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to journal collection
   */
  journalPath: (uid = null) =>
    getUserCollectionPath(USER_COLLECTIONS.JOURNAL, uid),

  /**
   * Get specific journal entry path
   * @param {string} entryId - Entry document ID
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to journal entry document
   */
  journalEntryPath: (entryId, uid = null) =>
    getUserDocPath(USER_COLLECTIONS.JOURNAL, entryId, uid),

  /**
   * Get reflections collection path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to reflections collection
   */
  reflectionsPath: (uid = null) =>
    getUserCollectionPath(USER_COLLECTIONS.REFLECTIONS, uid),

  /**
   * Get specific reflection path
   * @param {string} reflectionId - Reflection document ID
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to reflection document
   */
  reflectionPath: (reflectionId, uid = null) =>
    getUserDocPath(USER_COLLECTIONS.REFLECTIONS, reflectionId, uid),

  /**
   * Get board cards collection path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to board cards collection
   */
  boardCardsPath: (uid = null) =>
    getUserCollectionPath(USER_COLLECTIONS.BOARD_CARDS, uid),

  /**
   * Get specific board card path
   * @param {string} cardId - Card document ID
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to board card document
   */
  boardCardPath: (cardId, uid = null) =>
    getUserDocPath(USER_COLLECTIONS.BOARD_CARDS, cardId, uid),

  /**
   * Get board settings path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to board settings collection
   */
  boardSettingsPath: (uid = null) =>
    getUserCollectionPath(USER_COLLECTIONS.BOARD_SETTINGS, uid),

  /**
   * Get settings path
   * @param {string} uid - User ID (optional)
   * @returns {string} Path to settings collection
   */
  settingsPath: (uid = null) =>
    getUserCollectionPath(USER_COLLECTIONS.SETTINGS, uid),
};
