/**
 * Win Entry Component
 *
 * Collapsed by default - user must choose to engage.
 * Neutral, calm, no celebration.
 *
 * ONE WIN PER DAY - visible constraint, not punitive.
 */

import { saveWin, getWinByDate, hasWinForDate } from "../data/winLedger.js";
import { inviteAfterWin } from "./authInvitation.js";

/**
 * Renders the win entry component
 * @param {HTMLElement} container - Container element
 * @param {Function} onSaved - Optional callback after win is saved
 */
export async function renderWinEntry(container, onSaved = null) {
  const today = new Date().toISOString().split("T")[0];
  const existingWin = await getWinByDate(today);

  container.innerHTML = `
    <div class="win-entry-component">
      ${existingWin ? renderExistingWin(existingWin) : renderNewWinEntry(today)}
    </div>
  `;

  if (!existingWin) {
    attachEventListeners(container, today, onSaved);
  }
}

/**
 * Render input for new win entry
 */
function renderNewWinEntry(today) {
  return `
    <div class="win-entry-collapsed" id="win-entry-toggle">
      <span class="win-entry-prompt">+ One thing I acknowledge today</span>
    </div>
    
    <div class="win-entry-expanded" id="win-entry-form" style="display: none;">
      <label for="win-text" class="win-entry-label">One thing I acknowledge today</label>
      <textarea 
        id="win-text" 
        class="win-entry-textarea"
        placeholder="Something I notice or recognize..."
        rows="3"
      ></textarea>
      <button id="save-win-btn" class="btn-secondary" style="display: none;">
        Record acknowledgement
      </button>
    </div>
  `;
}

/**
 * Render existing win (read-only)
 */
function renderExistingWin(win) {
  return `
    <div class="win-entry-readonly">
      <div class="win-entry-readonly-label">Today's acknowledgement is already recorded</div>
      <div class="win-entry-readonly-text">"${win.text}"</div>
    </div>
  `;
}

/**
 * Attach event listeners for new win entry
 */
function attachEventListeners(container, today, onSaved) {
  const toggle = container.querySelector("#win-entry-toggle");
  const form = container.querySelector("#win-entry-form");
  const textarea = container.querySelector("#win-text");
  const saveBtn = container.querySelector("#save-win-btn");

  // Expand on click
  toggle.addEventListener("click", () => {
    toggle.style.display = "none";
    form.style.display = "block";
    textarea.focus();
  });

  // Show save button when text is entered
  textarea.addEventListener("input", () => {
    const hasText = textarea.value.trim().length > 0;
    saveBtn.style.display = hasText ? "block" : "none";
  });

  // Save win
  saveBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();

    if (!text) return;

    const result = await saveWin(today, text);

    if (result.success) {
      // Silent success - just re-render to show read-only view
      renderWinEntry(container, onSaved);
      if (onSaved) onSaved(result.win);
    } else {
      // Neutral error message (should not happen in normal flow)
      container
        .querySelector("#win-entry-form")
        .insertAdjacentHTML(
          "beforeend",
          `<div class="win-entry-error">${result.error}</div>`,
        );
    }
  });
}

/**
 * Render quick win entry for specific date (for dedicated wins page)
 * @param {HTMLElement} container - Container element
 * @param {string} date - ISO date string
 * @param {Function} onSaved - Optional callback after win is saved
 */
export async function renderWinEntryForDate(container, date, onSaved = null) {
  const existingWin = await getWinByDate(date);
  const dateDisplay = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  container.innerHTML = `
    <div class="win-entry-component">
      <h3 class="win-entry-date">${dateDisplay}</h3>
      ${existingWin ? renderExistingWin(existingWin) : renderNewWinEntry(date)}
    </div>
  `;

  if (!existingWin) {
    attachEventListeners(container, date, onSaved);
  }
}
