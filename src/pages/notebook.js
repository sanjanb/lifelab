/**
 * Notebook Page
 * Detailed table view of daily entries with editing capability
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/mobile.css";

import {
  loadMonth,
  saveDayEntry,
  deleteDayEntry,
  getEnabledDomainNames,
} from "../data/storage.js";
import { renderQuickEntry, renderDataEntryForm } from "../data/entry.js";
import {
  renderImportExportUI,
  exportToCSV,
  exportToJSON,
} from "../data/export.js";

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentData = [];

/**
 * Initialize notebook page
 */
async function init() {
  updateMonthDisplay();
  loadMonthData();
  setupNavigation();
  renderQuickEntryWidget();
  renderExportOptions();
}

/**
 * Load month data and render table
 */
function loadMonthData() {
  currentData = loadMonth(currentYear, currentMonth);
  renderNotebookTable();
}

/**
 * Update month display
 */
function updateMonthDisplay() {
  const display = document.getElementById("current-month-display");
  const date = new Date(currentYear, currentMonth - 1);
  display.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Setup month navigation
 */
function setupNavigation() {
  document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    updateMonthDisplay();
    loadMonthData();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    updateMonthDisplay();
    loadMonthData();
  });
}

/**
 * Render notebook table
 */
function renderNotebookTable() {
  const container = document.getElementById("notebook-table-container");

  if (currentData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No entries for this month yet.</p>
        <p>Use the Quick Entry above to get started!</p>
      </div>
    `;
    return;
  }

  // Get enabled domains from settings
  const domainList = getEnabledDomainNames().sort();

  const table = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          ${domainList.map((d) => `<th>${capitalizeFirst(d)}</th>`).join("")}
          <th>Avg</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${currentData.map((day) => renderTableRow(day, domainList)).join("")}
      </tbody>
    </table>
  `;

  container.innerHTML = table;

  // Attach event listeners
  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const date = e.target.dataset.date;
      const dayData = currentData.find((d) => d.date === date);
      showEditForm(date, dayData);
    });
  });

  container.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const date = e.target.dataset.date;
      if (confirm(`Delete entry for ${date}?`)) {
        deleteDayEntry(date);
        loadMonthData();
      }
    });
  });
}

/**
 * Render a single table row
 */
function renderTableRow(day, domainList) {
  const scores = domainList.map((d) => day.domains[d] || "—");
  const avg = calculateAverage(day);
  const formattedDate = new Date(day.date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );

  return `
    <tr>
      <td><strong>${formattedDate}</strong></td>
      ${scores
        .map(
          (s) =>
            `<td class="score-cell">${
              typeof s === "number" ? s.toFixed(2) : s
            }</td>`
        )
        .join("")}
      <td class="avg-cell"><strong>${
        avg !== null ? avg.toFixed(2) : "—"
      }</strong></td>
      <td class="notes-cell">${truncateNotes(day.notes || "")}</td>
      <td class="actions-cell">
        <button class="btn-icon btn-edit" data-date="${day.date}" title="Edit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1739 1.49653 12.4191 1.44775 12.6666 1.44775C12.9142 1.44775 13.1594 1.49653 13.3882 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4087 2.61178C14.5035 2.84055 14.5523 3.08575 14.5523 3.33337C14.5523 3.58099 14.5035 3.82619 14.4087 4.05497C14.314 4.28374 14.1751 4.49161 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn-icon btn-delete" data-date="${
          day.date
        }" title="Delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </td>
    </tr>
  `;
}

/**
 * Calculate average score for a day
 */
function calculateAverage(day) {
  if (!day.domains) return null;
  const scores = Object.values(day.domains).filter(
    (s) => typeof s === "number"
  );
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Truncate notes for table display
 */
function truncateNotes(notes, maxLength = 50) {
  if (!notes) return "—";
  if (notes.length <= maxLength) return notes;
  return notes.substring(0, maxLength) + "...";
}

/**
 * Show edit form
 */
function showEditForm(date, existingData) {
  const formContainer = document.createElement("div");
  formContainer.className = "modal-overlay";
  formContainer.innerHTML = `
    <div class="modal-content">
      <div id="edit-form"></div>
    </div>
  `;
  document.body.appendChild(formContainer);

  renderDataEntryForm(
    formContainer.querySelector("#edit-form"),
    date,
    existingData,
    async (data) => {
      await saveDayEntry(data);
      loadMonthData();
      formContainer.remove();
    }
  );

  // Close on background click
  formContainer.addEventListener("click", (e) => {
    if (e.target === formContainer) {
      formContainer.remove();
    }
  });
}

/**
 * Render quick entry widget
 */
function renderQuickEntryWidget() {
  const container = document.getElementById("quick-entry-container");
  renderQuickEntry(container, async (data) => {
    await saveDayEntry(data);
    loadMonthData();
    alert("Entry saved!");
  });
}

/**
 * Render export options
 */
function renderExportOptions() {
  const container = document.getElementById("export-container");

  container.innerHTML = `
    <div class="export-buttons">
      <button class="btn-secondary" id="export-month-json">Export Month (JSON)</button>
      <button class="btn-secondary" id="export-month-csv">Export Month (CSV)</button>
    </div>
  `;

  container
    .querySelector("#export-month-json")
    .addEventListener("click", () => {
      exportToJSON(currentData, currentYear, currentMonth);
    });

  container.querySelector("#export-month-csv").addEventListener("click", () => {
    const filename = `lifelab-${currentYear}-${String(currentMonth).padStart(
      2,
      "0"
    )}.csv`;
    exportToCSV(currentData, filename);
  });
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
init();
