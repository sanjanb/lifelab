/**
 * Settings Page
 * Domain configuration and preferences
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";

import {
  loadSettings,
  saveSettings,
  clearAllData,
  loadFromLocalStorage,
} from "../data/storage.js";
import { renderImportExportUI, exportFullBackup } from "../data/export.js";
import { mergeImportedData } from "../data/storage.js";

let currentSettings = {};

/**
 * Initialize settings page
 */
async function init() {
  currentSettings = loadSettings();
  renderDomainConfig();
  renderDataStats();
  renderExportImport();
  renderDangerZone();
  renderPreferences();
}

/**
 * Render domain configuration
 */
function renderDomainConfig() {
  const container = document.getElementById("domain-config");

  container.innerHTML = `
    <div class="domain-list">
      ${Object.entries(currentSettings.domains)
        .map(
          ([domain, enabled]) => `
        <label class="domain-item">
          <input 
            type="checkbox" 
            class="domain-checkbox" 
            data-domain="${domain}" 
            ${enabled ? "checked" : ""}
          />
          <span>${capitalizeFirst(domain)}</span>
        </label>
      `
        )
        .join("")}
    </div>
    
    <div class="add-domain">
      <input 
        type="text" 
        id="new-domain-name" 
        placeholder="Add new domain" 
      />
      <button class="btn-secondary" id="add-domain-btn">Add</button>
    </div>
    
    <button class="btn-primary" id="save-domains">Save Changes</button>
  `;

  // Attach event listeners
  container
    .querySelector("#add-domain-btn")
    .addEventListener("click", addNewDomain);
  container
    .querySelector("#save-domains")
    .addEventListener("click", saveDomainSettings);
}

/**
 * Add a new domain
 */
function addNewDomain() {
  const input = document.getElementById("new-domain-name");
  const domainName = input.value.trim().toLowerCase();

  if (!domainName) {
    alert("Please enter a domain name");
    return;
  }

  if (currentSettings.domains[domainName] !== undefined) {
    alert("This domain already exists");
    return;
  }

  currentSettings.domains[domainName] = true;
  input.value = "";
  renderDomainConfig();
}

/**
 * Save domain settings
 */
function saveDomainSettings() {
  const checkboxes = document.querySelectorAll(".domain-checkbox");
  checkboxes.forEach((cb) => {
    const domain = cb.dataset.domain;
    currentSettings.domains[domain] = cb.checked;
  });

  if (saveSettings(currentSettings)) {
    alert("Domain settings saved!\n\nYour changes will be reflected in:\n• Quick Entry form\n• Notebook table\n• Grid overview and visualizations\n\nRefresh the page to see the updates.");
  } else {
    alert("Failed to save settings");
  }
}

/**
 * Render data stats section
 */
function renderDataStats() {
  const container = document.getElementById("data-stats");

  const allData = loadFromLocalStorage();
  const dataSize = JSON.stringify(allData).length;
  const entriesCount = Object.values(allData).reduce(
    (sum, month) => sum + month.length,
    0
  );

  container.innerHTML = `
    <div class="bento-stats">
      <div class="bento-stat">
        <div class="stat-value">${entriesCount}</div>
        <div class="stat-label">entries</div>
      </div>
      <div class="bento-stat">
        <div class="stat-value">${(dataSize / 1024).toFixed(1)}</div>
        <div class="stat-label">KB</div>
      </div>
    </div>
  `;
}

/**
 * Render export/import section
 */
function renderExportImport() {
  const container = document.getElementById("export-import");

  const allData = loadFromLocalStorage();

  container.innerHTML = `
    <div id="import-export-ui"></div>
    <button class="btn-secondary" id="full-backup">Full Backup</button>
  `;

  // Render import/export UI
  renderImportExportUI(
    container.querySelector("#import-export-ui"),
    Object.values(allData).flat(),
    (importedData) => {
      mergeImportedData(importedData);
      renderDataStats();
    }
  );

  // Full backup
  container.querySelector("#full-backup").addEventListener("click", () => {
    exportFullBackup(allData);
  });
}

/**
 * Render danger zone section
 */
function renderDangerZone() {
  const container = document.getElementById("danger-zone");

  container.innerHTML = `
    <p class="danger-warning">This will permanently delete all your data. This cannot be undone.</p>
    <button class="btn-danger" id="clear-all-data">Clear All Data</button>
  `;

  // Clear all data
  container.querySelector("#clear-all-data").addEventListener("click", () => {
    const confirmed = confirm(
      "Are you ABSOLUTELY SURE you want to delete all data?\n\n" +
        "This action cannot be undone!\n\n" +
        "Make sure you have exported your data first."
    );

    if (!confirmed) return;

    const doubleCheck = prompt('Type "DELETE ALL" to confirm:');
    if (doubleCheck === "DELETE ALL") {
      if (clearAllData()) {
        alert("All data has been cleared");
        renderDataStats();
      } else {
        alert("Failed to clear data");
      }
    }
  });
}

/**
 * Render preferences section
 */
function renderPreferences() {
  const container = document.getElementById("preferences");

  container.innerHTML = `
    <div class="preference-list">
      <div class="preference-item">
        <label>First Day of Week</label>
        <select id="first-day-select">
          <option value="0" ${
            currentSettings.firstDayOfWeek === 0 ? "selected" : ""
          }>Sunday</option>
          <option value="1" ${
            currentSettings.firstDayOfWeek === 1 ? "selected" : ""
          }>Monday</option>
        </select>
      </div>
    </div>
    
    <button class="btn-primary" id="save-preferences">Save Changes</button>
  `;

  container.querySelector("#save-preferences").addEventListener("click", () => {
    currentSettings.firstDayOfWeek = parseInt(
      document.getElementById("first-day-select").value
    );

    if (saveSettings(currentSettings)) {
      alert("Preferences saved!");
    } else {
      alert("Failed to save preferences");
    }
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
