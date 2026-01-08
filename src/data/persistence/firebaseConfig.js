/**
 * Firebase Configuration
 *
 * CRITICAL: Firebase is persistence only.
 * No business logic here.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
let auth = null;
let db = null;

/**
 * Initialize Firebase (non-blocking)
 * @returns {Promise<Object>} Firebase instances
 */
export async function initFirebase() {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      console.log("[Firebase] Initialized");
    }
    return { app, auth, db };
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    return { app: null, auth: null, db: null };
  }
}

/**
 * Get Firebase instances (must call initFirebase first)
 */
export function getFirebaseInstances() {
  return { app, auth, db };
}

/**
 * Get current user ID (if authenticated)
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId() {
  if (!auth || !auth.currentUser) {
    return null;
  }
  return auth.currentUser.uid;
}
