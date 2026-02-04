/**
 * Firebase Configuration
 *
 * AUTHENTICATION PHILOSOPHY:
 * ==========================
 * Authentication in LifeLab exists ONLY for:
 * • Preserving data across devices
 * • Keeping data private
 * • Maintaining continuity over time
 *
 * Authentication is NOT for:
 * • Social features (none exist)
 * • Public profiles (none exist)
 * • Analytics or tracking (not implemented)
 * • Cross-user visibility (explicitly forbidden)
 *
 * CURRENT STATE: Authentication enabled (Phase 1)
 * - Email/Password auth available
 * - Google Sign-In prepared but not exposed in UI yet
 * - Shared collection still active for backward compatibility
 * - User-scoped collections will replace shared after migration (Phase 6)
 *
 * @see src/data/persistence/authPhilosophy.js
 * @see docs/AUTHENTICATION.md
 *
 * CRITICAL: Firebase is persistence only.
 * No business logic here.
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initAuthState } from "./authState.js";

// Load Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let db = null;
let auth = null;
let googleProvider = null;

// Shared collection ID for all data (no user separation)
const SHARED_DOC_ID = "shared_data";

/**
 * Initialize Firebase (non-blocking)
 * @returns {Promise<Object>} Firebase instances
 */
export async function initFirebase() {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      
      // Prepare Google provider (not exposed in UI yet)
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("[Firebase] Initialized with auth support");
    }
    return { app, db, auth };
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    return { app: null, db: null, auth: null };
  }
}

/**
 * Get Firebase instances
 */
export function getFirebaseInstances() {
  return { app, db, auth };
}

/**
 * Get Firebase Auth instance
 * @returns {Object|null} Auth instance or null if not initialized
 */
export function getFirebaseAuth() {
  return auth;
}

/**
 * Get Google Auth Provider (prepared but not exposed in UI yet)
 * @returns {GoogleAuthProvider|null} Google provider or null
 */
export function getGoogleProvider() {
  return googleProvider;
}

/**
 * Get shared document ID
 * @returns {string} Shared document ID
 */
export function getSharedDocId() {
  return SHARED_DOC_ID;
}
