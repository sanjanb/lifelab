/**
 * Notebook Page
 * Detailed table view of daily entries with editing capability
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";

import { loadMonth, saveDayEntry, deleteDayEntry } from "../data/storage.js";
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

  // Get all unique domains
  const domains = new Set();
  currentData.forEach((day) => {
    if (day.domains) {
      Object.keys(day.domains).forEach((d) => domains.add(d));
    }
  });
  const domainList = Array.from(domains).sort();

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
        <button class="btn-icon btn-edit" data-date="${
          day.date
        }" title="Edit">✏️</button>
        <button class="btn-icon btn-delete" data-date="${
          day.date
        }" title="Delete">🗑️</button>
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
    (data) => {
      saveDayEntry(data);
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
  renderQuickEntry(container, (data) => {
    saveDayEntry(data);
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
