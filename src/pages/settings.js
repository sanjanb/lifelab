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
  renderDataManagement();
  renderPreferences();
}

/**
 * Render domain configuration
 */
function renderDomainConfig() {
  const container = document.getElementById("domain-config");

  container.innerHTML = `
    <div class="settings-card">
      <div class="settings-card-header">
        <svg class="settings-icon" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <div>
          <h3>Tracking Domains</h3>
          <p class="card-description">Select which areas of life to track</p>
        </div>
      </div>
      
      <div class="domain-grid">
        ${Object.entries(currentSettings.domains)
          .map(
            ([domain, enabled]) => `
          <label class="domain-toggle-card ${enabled ? 'active' : ''}">
            <input 
              type="checkbox" 
              class="domain-checkbox" 
              data-domain="${domain}" 
              ${enabled ? "checked" : ""}
            />
            <div class="domain-toggle-content">
              <span class="domain-name">${capitalizeFirst(domain)}</span>
              <span class="toggle-indicator"></span>
            </div>
          </label>
        `
          )
          .join("")}
      </div>
      
      <div class="add-domain-card">
        <svg class="add-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        <div class="add-domain-form">
          <input type="text" id="new-domain-name" placeholder="Add new domain (e.g., creativity)" />
          <button class="btn-icon" id="add-domain-btn" title="Add">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn-primary" id="save-domains">
          <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
          Save Changes
        </button>
      </div>
    </div>
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
    alert("Domain settings saved!");
  } else {
    alert("Failed to save settings");
  }
}

/**
 * Render data management section
 */
function renderDataManagement() {
  const container = document.getElementById("data-management");

  const allData = loadFromLocalStorage();
  const dataSize = JSON.stringify(allData).length;
  const entriesCount = Object.values(allData).reduce(
    (sum, month) => sum + month.length,
    0
  );

  container.innerHTML = `
    <div class="settings-grid">
      <div class="settings-card">
        <div class="settings-card-header">
          <svg class="settings-icon" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <div>
            <h3>Storage Overview</h3>
            <p class="card-description">Your tracking data statistics</p>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${entriesCount}</div>
            <div class="stat-label">Total Entries</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${(dataSize / 1024).toFixed(1)}</div>
            <div class="stat-label">KB Used</div>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="settings-card-header">
          <svg class="settings-icon" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <path d="M7 10l5 5 5-5M12 15V3"/>
          </svg>
          <div>
            <h3>Export & Import</h3>
            <p class="card-description">Backup or restore your data</p>
          </div>
        </div>
        <div id="import-export-ui"></div>
        <div class="card-actions">
          <button class="btn-secondary" id="full-backup">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Full Backup
          </button>
        </div>
      </div>
      
      <div class="settings-card danger-card">
        <div class="settings-card-header">
          <svg class="settings-icon danger-icon" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <path d="M12 9v4M12 17h.01"/>
          </svg>
          <div>
            <h3>Danger Zone</h3>
            <p class="card-description">Irreversible actions</p>
          </div>
        </div>
        <div class="danger-content">
          <p class="warning-text">This will permanently delete all your tracked data. This action cannot be undone.</p>
          <button class="btn-danger" id="clear-all-data">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  `;

  // Render import/export UI
  renderImportExportUI(
    container.querySelector("#import-export-ui"),
    Object.values(allData).flat(),
    (importedData) => {
      mergeImportedData(importedData);
      renderDataManagement();
    }
  );

  // Full backup
  container.querySelector("#full-backup").addEventListener("click", () => {
    exportFullBackup(allData);
  });

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
        renderDataManagement();
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
    <div class="settings-card">
      <div class="settings-card-header">
        <svg class="settings-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
        </svg>
        <div>
          <h3>Display Preferences</h3>
          <p class="card-description">Customize your experience</p>
        </div>
      </div>
      
      <div class="preferences-grid">
        <div class="preference-card">
          <label class="preference-label">
            <svg viewBox="0 0 24 24" class="pref-icon">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span>First Day of Week</span>
          </label>
          <select id="first-day-select" class="preference-select">
            <option value="0" ${
              currentSettings.firstDayOfWeek === 0 ? "selected" : ""
            }>Sunday</option>
            <option value="1" ${
              currentSettings.firstDayOfWeek === 1 ? "selected" : ""
            }>Monday</option>
          </select>
        </div>
        
        <div class="preference-card disabled">
          <label class="preference-label">
            <svg viewBox="0 0 24 24" class="pref-icon">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <span>Theme <span class="coming-soon">Coming Soon</span></span>
          </label>
          <select id="theme-select" class="preference-select" disabled>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn-primary" id="save-preferences">
          <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
          Save Preferences
        </button>
      </div>
    </div>
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
