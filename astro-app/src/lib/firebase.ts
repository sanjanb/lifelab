/**
 * Firebase Cloud Sync Service
 * 
 * Enables cross-device data synchronization using Firebase Firestore.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firestore Database
 * 3. Enable Authentication (Email/Password or Google Sign-In)
 * 4. Copy your Firebase config and update firebaseConfig below
 * 5. Update Firestore security rules to protect user data
 * 
 * PRIVACY & SECURITY:
 * - Each user's data is isolated by user ID
 * - Authentication required for all operations
 * - Data encrypted in transit and at rest
 * - No analytics or tracking enabled
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  type Firestore 
} from 'firebase/firestore';
import type { LifeLabExport } from './storage';

// Firebase configuration - REPLACE WITH YOUR OWN
// Get this from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase
 * Call this before using any Firebase features
 */
export function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized in browser');
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { app, auth, db };
}

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { auth } = initFirebase();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Create new account
 */
export async function createAccount(email: string, password: string): Promise<User> {
  const { auth } = initFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  const { auth } = initFirebase();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  const { auth } = initFirebase();
  await signOut(auth);
}

/**
 * Listen to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { auth } = initFirebase();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const { auth } = initFirebase();
  return auth.currentUser;
}

/**
 * Sync data to Firebase
 * Uploads all LifeLab data to user's Firestore document
 */
export async function syncToCloud(data: LifeLabExport): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Must be signed in to sync data');
  }

  const { db } = initFirebase();
  
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, {
    lifelabData: data,
    lastSync: new Date().toISOString(),
    userId: user.uid,
    email: user.email
  }, { merge: true });
}

/**
 * Load data from Firebase
 * Downloads user's LifeLab data from Firestore
 */
export async function loadFromCloud(): Promise<LifeLabExport | null> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Must be signed in to load data');
  }

  const { db } = initFirebase();
  
  const userDocRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.lifelabData as LifeLabExport;
  }

  return null;
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;

  const { db } = initFirebase();
  
  const userDocRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data().lastSync || null;
  }

  return null;
}

/**
 * Delete cloud data
 * WARNING: This permanently deletes all synced data
 */
export async function deleteCloudData(): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Must be signed in to delete data');
  }

  const { db } = initFirebase();
  
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, {
    lifelabData: null,
    lastSync: new Date().toISOString(),
    deleted: true
  });
}

/**
 * FIRESTORE SECURITY RULES
 * 
 * Copy these rules to Firebase Console > Firestore Database > Rules:
 * 
 * ```
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Only authenticated users can access their own data
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *   }
 * }
 * ```
 */
