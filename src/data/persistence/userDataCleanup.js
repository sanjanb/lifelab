/**
 * User Data Cleanup
 * 
 * Handles deletion of user data from Firestore when account is deleted.
 * 
 * IMPORTANT:
 * ==========
 * This function deletes ALL user data from Firestore under users/{uid}/.
 * Only call this when the user has explicitly confirmed account deletion.
 * 
 * NOTE: In production, this should be handled by a Cloud Function triggered
 * by the Authentication user deletion event. For now, we handle it client-side.
 * 
 * @see docs/AUTHENTICATION.md - Phase 8
 */

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { initFirebase } from "./firebaseConfig.js";
import { getCurrentUserId } from "./authState.js";

/**
 * Delete all user data from Firestore
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} Result object with success status
 */
export async function deleteUserData(uid = null) {
  try {
    const userId = uid || getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        error: "No user ID provided",
      };
    }

    const { db } = await initFirebase();
    
    if (!db) {
      return {
        success: false,
        error: "Firestore not available",
      };
    }

    console.log(`[User Data Cleanup] Deleting data for user ${userId}...`);

    // Collections to delete under users/{uid}/
    const collections = [
      "wins",
      "journal",
      "reflections",
      "board_cards",
      "board_settings",
      "settings",
      "profile"
    ];

    let deletedCount = 0;
    const errors = [];

    // Delete each collection
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, "users", userId, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        // Delete all documents in collection
        const deletePromises = [];
        snapshot.forEach((docSnapshot) => {
          deletePromises.push(deleteDoc(docSnapshot.ref));
        });
        
        await Promise.all(deletePromises);
        deletedCount += snapshot.size;
        
        console.log(`[User Data Cleanup] Deleted ${snapshot.size} documents from ${collectionName}`);
      } catch (error) {
        console.error(`[User Data Cleanup] Error deleting ${collectionName}:`, error);
        errors.push(`${collectionName}: ${error.message}`);
      }
    }

    // Delete user root document (if it exists)
    try {
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);
      console.log(`[User Data Cleanup] Deleted user root document`);
    } catch (error) {
      // User root doc might not exist, that's okay
      console.log(`[User Data Cleanup] User root document does not exist (this is okay)`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        deletedCount,
        errors,
      };
    }

    console.log(`[User Data Cleanup] Successfully deleted ${deletedCount} documents`);
    
    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error("[User Data Cleanup] Failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if user has any data in Firestore
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} Object with hasData boolean and document count
 */
export async function checkUserHasData(uid = null) {
  try {
    const userId = uid || getCurrentUserId();
    
    if (!userId) {
      return { hasData: false, count: 0 };
    }

    const { db } = await initFirebase();
    
    if (!db) {
      return { hasData: false, count: 0 };
    }

    const collections = [
      "wins",
      "journal",
      "reflections",
      "board_cards",
      "board_settings",
      "settings"
    ];

    let totalCount = 0;

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, "users", userId, collectionName);
        const snapshot = await getDocs(collectionRef);
        totalCount += snapshot.size;
      } catch (error) {
        console.warn(`[User Data Cleanup] Error checking ${collectionName}:`, error);
      }
    }

    return {
      hasData: totalCount > 0,
      count: totalCount,
    };
  } catch (error) {
    console.error("[User Data Cleanup] Failed to check user data:", error);
    return { hasData: false, count: 0 };
  }
}
