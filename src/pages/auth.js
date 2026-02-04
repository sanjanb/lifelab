/**
 * Authentication Page
 *
 * PHILOSOPHY:
 * ===========
 * Authentication should feel like opening a notebook, not joining a platform.
 * No marketing copy. No upsells. No "benefits" language.
 * Just calm, neutral access to your private data.
 *
 * @see docs/AUTHENTICATION.md - Phase 3
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/mobile.css";
import "../styles/auth.css";
import "../styles/migration.css";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "../data/persistence/firebaseConfig.js";
import { waitForAuthReady } from "../data/persistence/authState.js";
import {
  shouldShowMigrationPrompt,
  detectLocalData,
  migrateToFirebase,
  dismissMigration,
  clearLocalData,
} from "../data/persistence/migration.js";

// Auth mode state
let isSignUpMode = false;

/**
 * Initialize auth page
 */
async function init() {
  console.log("Auth page initialized");

  // Check if user is already authenticated
  const authState = await waitForAuthReady();
  if (authState.isAuthenticated) {
    // Redirect to dashboard if already signed in
    console.log("User already authenticated, redirecting...");
    window.location.href = "./index.html";
    return;
  }

  setupEventListeners();
}

/**
 * Setup event listeners for form and toggle
 */
function setupEventListeners() {
  const form = document.getElementById("auth-form");
  const toggleButton = document.getElementById("toggle-button");

  form.addEventListener("submit", handleSubmit);
  toggleButton.addEventListener("click", toggleMode);
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  clearError();
  setLoading(true);

  try {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new Error("Authentication not available");
    }

    if (isSignUpMode) {
      // Create new account
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Account created successfully");
    } else {
      // Sign in
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in successfully");
    }

    // Check for migration after sign-in
    if (shouldShowMigrationPrompt()) {
      console.log("Local data detected, showing migration prompt");
      showMigrationPrompt();
    } else {
      // Redirect to dashboard if no migration needed
      window.location.href = "./index.html";
    }
  } catch (error) {
    console.error("Auth error:", error);
    showError(getErrorMessage(error.code));
    setLoading(false);
  }
}

/**
 * Toggle between sign in and sign up modes
 */
function toggleMode() {
  isSignUpMode = !isSignUpMode;

  const title = document.getElementById("auth-title");
  const subtitle = document.getElementById("auth-subtitle");
  const submitButton = document.getElementById("submit-button");
  const toggleText = document.getElementById("toggle-text");
  const toggleButton = document.getElementById("toggle-button");
  const passwordInput = document.getElementById("password");

  if (isSignUpMode) {
    // Switch to sign up mode
    title.textContent = "Create your notebook";
    subtitle.textContent = "Your data, kept private";
    submitButton.textContent = "Create Notebook";
    toggleText.textContent = "Already have one?";
    toggleButton.textContent = "Sign in";
    passwordInput.setAttribute("autocomplete", "new-password");
  } else {
    // Switch to sign in mode
    title.textContent = "Open your notebook";
    subtitle.textContent = "Continue your work across devices";
    submitButton.textContent = "Sign In";
    toggleText.textContent = "New here?";
    toggleButton.textContent = "Create notebook";
    passwordInput.setAttribute("autocomplete", "current-password");
  }

  clearError();
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

/**
 * Clear error message
 */
function clearError() {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

/**
 * Set loading state
 * @param {boolean} loading - Whether form is loading
 */
function setLoading(loading) {
  const submitButton = document.getElementById("submit-button");
  const inputs = document.querySelectorAll("input");

  if (loading) {
    submitButton.disabled = true;
    submitButton.textContent = "...";
    inputs.forEach((input) => (input.disabled = true));
  } else {
    submitButton.disabled = false;
    submitButton.textContent = isSignUpMode ? "Create Notebook" : "Sign In";
    inputs.forEach((input) => (input.disabled = false));
  }
}

/**
 * Get user-friendly error message
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly message
 */
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Email address is not valid";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    case "auth/network-request-failed":
      return "Network error. Check your connection";
    default:
      return "Unable to authenticate. Please try again";
  }
}

// Initialize on page load
init();
