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

    // Success - clear loading before next action
    setLoading(false);
    
    // Check for migration after sign-in
    if (shouldShowMigrationPrompt()) {
      console.log("Local data detected, showing migration prompt");
      showMigrationPrompt();
    } else {
      // Redirect to dashboard if no migration needed
      console.log("Redirecting to dashboard...");
      window.location.href = "./index.html";
    }
  } catch (error) {
    console.error("Auth error:", error);
    showError(getErrorMessage(error.code));
    setLoading(false);
  }
}

/**
 * Show migration prompt if local data exists
 */
function showMigrationPrompt() {
  const data = detectLocalData();

  // Create modal
  const modal = document.createElement("div");
  modal.className = "migration-modal";
  modal.innerHTML = `
    <div class="migration-content">
      <h2>Data Found</h2>
      <p class="migration-description">Your browser has stored data from previous sessions. Would you like to copy it to your account?</p>
      
      <div class="migration-stats">
        ${data.wins > 0 ? `<div class="migration-stat"><strong>${data.wins}</strong> wins</div>` : ""}
        ${data.journalEntries > 0 ? `<div class="migration-stat"><strong>${data.journalEntries}</strong> journal entries</div>` : ""}
        ${data.reflections > 0 ? `<div class="migration-stat"><strong>${data.reflections}</strong> reflections</div>` : ""}
        ${data.hasSettings ? `<div class="migration-stat">Personal settings</div>` : ""}
      </div>
      
      <div class="migration-actions">
        <button class="migration-btn migration-btn-primary" id="migrateBtn">
          Migrate My Data
        </button>
        <button class="migration-btn migration-btn-secondary" id="dismissBtn">
          Not Now
        </button>
      </div>
      
      <p class="migration-note">Your browser data will remain safe. You can always migrate later from Settings.</p>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle migrate
  document.getElementById("migrateBtn").addEventListener("click", async () => {
    await handleMigration(modal);
  });

  // Handle dismiss
  document.getElementById("dismissBtn").addEventListener("click", () => {
    dismissMigration();
    modal.remove();
    window.location.href = "./index.html";
  });
}

/**
 * Handle the migration process with progress and error handling
 */
async function handleMigration(modal) {
  const content = modal.querySelector(".migration-content");

  // Show progress
  content.innerHTML = `
    <h2>Migrating Your Data...</h2>
    <div class="migration-progress">
      <div class="migration-spinner"></div>
      <p>Copying your data to your account...</p>
    </div>
  `;

  try {
    const result = await migrateToFirebase();

    if (result.success) {
      // Show success
      content.innerHTML = `
        <h2>Migration Complete!</h2>
        <div class="migration-success">
          <p>✓ Your data has been safely copied to your account.</p>
        </div>
        
        <div class="migration-delete-section">
          <p class="migration-delete-note">
            Your browser data is still stored locally. Would you like to remove it?
          </p>
          <div class="migration-actions">
            <button class="migration-btn migration-btn-danger" id="deleteLocalBtn">
              Delete Browser Data
            </button>
            <button class="migration-btn migration-btn-secondary" id="keepLocalBtn">
              Keep It
            </button>
          </div>
        </div>
      `;

      document
        .getElementById("deleteLocalBtn")
        .addEventListener("click", () => {
          clearLocalData();
          modal.remove();
          window.location.href = "./index.html";
        });

      document.getElementById("keepLocalBtn").addEventListener("click", () => {
        modal.remove();
        window.location.href = "./index.html";
      });
    } else {
      // Show errors
      content.innerHTML = `
        <h2>Migration Issues</h2>
        <div class="migration-error">
          <p>Some items couldn't be migrated:</p>
          <ul>
            ${result.errors.map((err) => `<li>${err}</li>`).join("")}
          </ul>
        </div>
        <div class="migration-actions">
          <button class="migration-btn migration-btn-primary" id="continueBtn">
            Continue to Dashboard
          </button>
        </div>
      `;

      document.getElementById("continueBtn").addEventListener("click", () => {
        modal.remove();
        window.location.href = "./index.html";
      });
    }
  } catch (error) {
    console.error("Migration failed:", error);
    content.innerHTML = `
      <h2>Migration Failed</h2>
      <div class="migration-error">
        <p>Sorry, we couldn't migrate your data: ${error.message}</p>
      </div>
      <div class="migration-actions">
        <button class="migration-btn migration-btn-primary" id="retryBtn">
          Try Again
        </button>
        <button class="migration-btn migration-btn-secondary" id="skipBtn">
          Skip for Now
        </button>
      </div>
    `;

    document.getElementById("retryBtn").addEventListener("click", () => {
      handleMigration(modal);
    });

    document.getElementById("skipBtn").addEventListener("click", () => {
      modal.remove();
      window.location.href = "./index.html";
    });
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
    title.textContent = "Keep this safe";
    subtitle.textContent = "Set up private storage for your data";
    submitButton.textContent = "Continue";
    toggleText.textContent = "Already set up?";
    toggleButton.textContent = "Sign in instead";
    passwordInput.setAttribute("autocomplete", "new-password");
  } else {
    // Switch to sign in mode
    title.textContent = "Save your work privately";
    subtitle.textContent = "Keep your data safe across devices";
    submitButton.textContent = "Continue";
    toggleText.textContent = "First time?";
    toggleButton.textContent = "Set up private storage";
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
    submitButton.textContent = "Continue";
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
