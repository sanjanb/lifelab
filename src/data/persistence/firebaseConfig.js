/**
 * Firebase Configuration
 *
 * CRITICAL: Firebase is persistence only.
 * No business logic here.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCayoYHeuE13Vn1keJ0nDOmxwYvjkeLlvs",
  authDomain: "lifelab-903c0.firebaseapp.com",
  projectId: "lifelab-903c0",
  storageBucket: "lifelab-903c0.firebasestorage.app",
  messagingSenderId: "725880880514",
  appId: "1:725880880514:web:b5f12d5006d87e5086a39b",
  measurementId: "G-VBEQD6XQWM",
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
