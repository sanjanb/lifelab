/**
 * Memory Card Component
 *
 * RULES:
 * - Calm, neutral design
 * - No icons implying success/failure
 * - Muted colors
 * - Plenty of whitespace
 * - Dismissible forever
 */

import { dismissTodaysMemory } from "../data/memoryQuery.js";
import { loadSettings, saveSettings } from "../data/storage.js";

/**
 * Render memory card
 * @param {Object} memory - {date, content, type, prompt}
 * @param {HTMLElement} container - Container element
 */
export function renderMemoryCard(memory, container) {
  if (!memory || !container) {
    container.innerHTML = "";
    return;
  }

  const formattedDate = formatDisplayDate(memory.date);
  const truncatedContent = truncateContent(memory.content, 280);

  container.innerHTML = `
    <div class="memory-card">
      <div class="memory-header">
        <span class="memory-label">From your past</span>
        <span class="memory-date">${formattedDate}</span>
      </div>
      
      <div class="memory-content">
        ${escapeHtml(truncatedContent)}
      </div>
      
      ${
        memory.prompt
          ? `<div class="memory-prompt">Prompt: ${escapeHtml(memory.prompt)}</div>`
          : ""
      }
      
      <div class="memory-actions">
        <button class="memory-dismiss" data-action="dismiss">Dismiss</button>
        <button class="memory-disable" data-action="disable">Hide forever</button>
      </div>
    </div>
  `;

  // Attach event listeners
  container
    .querySelector('[data-action="dismiss"]')
    .addEventListener("click", handleDismiss);
  container
    .querySelector('[data-action="disable"]')
    .addEventListener("click", handleDisable);
}

/**
 * Handle dismiss action (hide for today)
 */
function handleDismiss(event) {
  dismissTodaysMemory();

  // Remove card from DOM
  const card = event.target.closest(".memory-card");
  if (card) {
    card.remove();
  }
}

/**
 * Handle disable action (turn off feature globally)
 */
function handleDisable(event) {
  const confirmed = confirm(
    "This will disable Memory Aids completely.\n\n" +
      "You can re-enable it in Settings."
  );

  if (!confirmed) return;

  // Update settings
  const settings = loadSettings();
  settings.memoryAidsEnabled = false;
  saveSettings(settings);

  // Remove card from DOM
  const card = event.target.closest(".memory-card");
  if (card) {
    card.remove();
  }
}

/**
 * Format date for display
 * @param {string} dateStr - YYYY-MM-DD or ISO timestamp
 * @returns {string}
 */
function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Truncate content with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncateContent(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  // Find last space before max length
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + "…";
  }

  return truncated + "…";
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
