/**
 * Firebase Configuration
 *
 * CRITICAL: Firebase is persistence only.
 * No business logic here.
 * No authentication - uses shared collection for cross-device sync
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
      console.log("[Firebase] Initialized without auth");
    }
    return { app, db };
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    return { app: null, db: null };
  }
}

/**
 * Get Firebase instances
 */
export function getFirebaseInstances() {
  return { app, db };
}

/**
 * Get shared document ID
 * @returns {string} Shared document ID
 */
export function getSharedDocId() {
  return SHARED_DOC_ID;
}
