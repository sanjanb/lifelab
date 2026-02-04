/**
 * Authentication State Management
 * 
 * PHILOSOPHY:
 * ===========
 * Simple, reactive auth state tracking WITHOUT building a "user system".
 * No Redux, no complex frameworks, just Firebase's built-in state listener.
 * 
 * This module knows who the user is, nothing more.
 * No profiles, no social features, no analytics.
 * 
 * @see docs/AUTHENTICATION.md - Phase 2
 * @see src/data/persistence/authPhilosophy.js
 */

import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "./firebaseConfig.js";

/**
 * Global auth state
 * Simple object - no framework needed
 */
let authState = {
  user: null,        // Firebase User object or null
  uid: null,         // User ID or null
  isAuthenticated: false,
  isLoading: true,   // True until first auth state check completes
};

/**
 * Subscribers to auth state changes
 * Array of callback functions
 */
const subscribers = [];

/**
 * Initialize auth state listener
 * Sets up Firebase onAuthStateChanged observer
 * @returns {Function} Unsubscribe function
 */
export function initAuthState() {
  const auth = getFirebaseAuth();
  
  if (!auth) {
    console.warn("[Auth State] Firebase auth not initialized");
    authState.isLoading = false;
    return () => {};
  }

  // Listen to auth state changes
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    const previousUid = authState.uid;
    
    if (user) {
      // User is signed in
      authState.user = user;
      authState.uid = user.uid;
      authState.isAuthenticated = true;
      authState.isLoading = false;
      
      console.log(`[Auth State] User authenticated: ${user.uid}`);
      
      // Log transition if user changed
      if (previousUid && previousUid !== user.uid) {
        console.log(`[Auth State] User switched from ${previousUid} to ${user.uid}`);
      }
    } else {
      // User is signed out
      authState.user = null;
      authState.uid = null;
      authState.isAuthenticated = false;
      authState.isLoading = false;
      
      console.log("[Auth State] User signed out");
      
      if (previousUid) {
        console.log(`[Auth State] User ${previousUid} signed out`);
      }
    }

    // Notify all subscribers
    notifySubscribers(authState);
  });

  return unsubscribe;
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  subscribers.push(callback);
  
  // Immediately call with current state
  callback(authState);
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

/**
 * Notify all subscribers of state change
 * @param {Object} state - Current auth state
 */
function notifySubscribers(state) {
  subscribers.forEach(callback => {
    try {
      callback(state);
    } catch (error) {
      console.error("[Auth State] Subscriber callback error:", error);
    }
  });
}

/**
 * Get current auth state
 * @returns {Object} Current auth state
 */
export function getAuthState() {
  return { ...authState };
}

/**
 * Get current user
 * @returns {Object|null} Firebase User object or null
 */
export function getCurrentUser() {
  return authState.user;
}

/**
 * Get current user UID
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId() {
  return authState.uid;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is signed in
 */
export function isAuthenticated() {
  return authState.isAuthenticated;
}

/**
 * Check if auth state is still loading
 * @returns {boolean} True if initial auth check not complete
 */
export function isAuthLoading() {
  return authState.isLoading;
}

/**
 * Wait for auth state to be ready (not loading)
 * Useful for startup sequences
 * @returns {Promise<Object>} Resolves with auth state when ready
 */
export function waitForAuthReady() {
  return new Promise((resolve) => {
    if (!authState.isLoading) {
      resolve(authState);
      return;
    }

    const unsubscribe = onAuthStateChange((state) => {
      if (!state.isLoading) {
        unsubscribe();
        resolve(state);
      }
    });
  });
}
