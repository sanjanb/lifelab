/**
 * Auth Invitation Component
 * 
 * PHILOSOPHY:
 * ===========
 * Invite authentication only when it matters.
 * Never block actions. Always dismissible.
 * Contextual, not forced.
 * 
 * @see docs/AUTHENTICATION.md - Soft Gate Phase 3
 */

import { isAuthenticated } from "../data/persistence/authState.js";

const DISMISSAL_KEY = "lifelab_auth_invitation_dismissed";
const INVITE_TRIGGER_KEY = "lifelab_auth_invite_triggered";

/**
 * Check if auth invitation should be shown
 * @returns {boolean} True if should show invitation
 */
function shouldShowInvitation() {
  // Don't show if already authenticated
  if (isAuthenticated()) {
    return false;
  }

  // Don't show if user has dismissed it
  const dismissed = localStorage.getItem(DISMISSAL_KEY);
  if (dismissed === "true") {
    return false;
  }

  return true;
}

/**
 * Check if this is a trigger moment (first meaningful data)
 * @param {string} triggerType - Type of trigger (win, entry, fullday)
 * @returns {boolean} True if this is the first trigger
 */
function isFirstTrigger(triggerType) {
  const triggers = JSON.parse(localStorage.getItem(INVITE_TRIGGER_KEY) || "{}");
  
  if (triggers[triggerType]) {
    return false; // Already triggered before
  }
  
  // Mark as triggered
  triggers[triggerType] = true;
  localStorage.setItem(INVITE_TRIGGER_KEY, JSON.stringify(triggers));
  
  return true;
}

/**
 * Render auth invitation inline
 * @param {HTMLElement} container - Where to insert the invitation
 * @param {string} triggerType - What triggered the invitation
 */
export function renderAuthInvitation(container, triggerType = "data") {
  if (!shouldShowInvitation()) {
    return;
  }

  if (!isFirstTrigger(triggerType)) {
    return;
  }

  const invitation = document.createElement("div");
  invitation.className = "auth-invitation";
  invitation.innerHTML = `
    <div class="auth-invitation-content">
      <div class="auth-invitation-text">
        <p class="auth-invitation-message">Save this privately across devices?</p>
        <p class="auth-invitation-hint">Your data stays in this browser by default. Sign in to keep it safe everywhere.</p>
      </div>
      <div class="auth-invitation-actions">
        <a href="./auth.html" class="auth-invitation-btn auth-invitation-btn-primary">Continue</a>
        <button class="auth-invitation-btn auth-invitation-btn-secondary" id="dismiss-auth-invitation">Not Now</button>
      </div>
    </div>
    <button class="auth-invitation-close" id="close-auth-invitation" aria-label="Dismiss">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  container.appendChild(invitation);

  // Handle dismissal
  const dismissBtn = invitation.querySelector("#dismiss-auth-invitation");
  const closeBtn = invitation.querySelector("#close-auth-invitation");

  const handleDismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, "true");
    invitation.remove();
  };

  dismissBtn.addEventListener("click", handleDismiss);
  closeBtn.addEventListener("click", handleDismiss);

  // Animate in
  setTimeout(() => {
    invitation.classList.add("auth-invitation-visible");
  }, 100);
}

/**
 * Check if user should be invited after saving a win
 * Call this after successfully saving a win
 */
export function inviteAfterWin() {
  const container = document.querySelector(".container");
  if (container) {
    renderAuthInvitation(container, "win");
  }
}

/**
 * Check if user should be invited after saving a journal entry
 * Call this after successfully saving a journal entry
 */
export function inviteAfterEntry() {
  const container = document.querySelector(".container");
  if (container) {
    renderAuthInvitation(container, "entry");
  }
}

/**
 * Check if user should be invited after completing a full day
 * Call this after successfully saving a complete day's data
 */
export function inviteAfterFullDay() {
  const container = document.querySelector(".container");
  if (container) {
    renderAuthInvitation(container, "fullday");
  }
}
