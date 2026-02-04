/**
 * Settings Page
 * Domain configuration and preferences
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/mobile.css";

import {
  loadSettings,
  saveSettings,
  clearAllData,
  loadFromLocalStorage,
} from "../data/storage.js";
import { renderImportExportUI, exportFullBackup } from "../data/export.js";
import { mergeImportedData } from "../data/storage.js";
import { renderExportImportUI } from "../data/exportImport.js";
import { persistence } from "../data/persistence/manager.js";
import {
  DomainType,
  createDomainConfig,
  migrateDomainSettings,
} from "../data/domainTypes.js";
import {
  isAuthenticated,
  onAuthStateChange,
} from "../data/persistence/authState.js";
import { getFirebaseAuth } from "../data/persistence/firebaseConfig.js";
import { signOut } from "firebase/auth";

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

  // Migrate domains if needed
  currentSettings.domains = migrateDomainSettings(currentSettings.domains);

  container.innerHTML = `
    <div class="domain-list">
      ${Object.entries(currentSettings.domains)
        .map(
          ([domain, config]) => `
        <div class="domain-item-row">
          <label class="domain-item">
            <input 
              type="checkbox" 
              class="domain-checkbox" 
              data-domain="${domain}" 
              ${config.enabled ? "checked" : ""}
            />
            <span>${capitalizeFirst(domain)}</span>
          </label>
          <select class="domain-type-select" data-domain="${domain}">
            <option value="${DomainType.PERCENTAGE}" ${
              config.type === DomainType.PERCENTAGE ? "selected" : ""
            }>Percentage (0-100%)</option>
            <option value="${DomainType.CHECKBOX}" ${
              config.type === DomainType.CHECKBOX ? "selected" : ""
            }>Checkbox (Done/Not Done)</option>
          </select>
        </div>
      `,
        )
        .join("")}
    </div>
    
    <div class="add-domain">
      <input 
        type="text" 
        id="new-domain-name" 
        placeholder="Add new domain" 
      />
      <select id="new-domain-type">
        <option value="${DomainType.PERCENTAGE}">Percentage</option>
        <option value="${DomainType.CHECKBOX}">Checkbox</option>
      </select>
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
  const typeSelect = document.getElementById("new-domain-type");
  const domainName = input.value.trim().toLowerCase();
  const domainType = typeSelect.value;

  if (!domainName) {
    alert("Please enter a domain name");
    return;
  }

  if (currentSettings.domains[domainName] !== undefined) {
    alert("This domain already exists");
    return;
  }

  currentSettings.domains[domainName] = createDomainConfig(domainType);
  input.value = "";
  renderDomainConfig();
}

/**
 * Save domain settings
 */
async function saveDomainSettings() {
  const checkboxes = document.querySelectorAll(".domain-checkbox");
  const typeSelects = document.querySelectorAll(".domain-type-select");

  // Update enabled status
  checkboxes.forEach((cb) => {
    const domain = cb.dataset.domain;
    if (currentSettings.domains[domain]) {
      currentSettings.domains[domain].enabled = cb.checked;
    }
  });

  // Update domain types
  typeSelects.forEach((select) => {
    const domain = select.dataset.domain;
    if (currentSettings.domains[domain]) {
      currentSettings.domains[domain].type = select.value;
    }
  });

  if (await saveSettings(currentSettings)) {
    alert(
      "Domain settings saved!\n\nYour changes will be reflected in:\n• Quick Entry form\n• Notebook table\n• Grid overview and visualizations\n\nRefresh the page to see the updates.",
    );
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
    0,
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

  // Render new persistence-based export/import UI
  renderExportImportUI(container);
}

/**
 * Render danger zone section
 */
function renderDangerZone() {
  const container = document.getElementById("danger-zone");

  const authSection = isAuthenticated()
    ? `
    <div class="danger-section">
      <h3>Account</h3>
      <button class="btn-secondary" id="sign-out-btn">Sign Out</button>
    </div>
    <div class="danger-divider"></div>
    `
    : "";

  container.innerHTML = `
    ${authSection}
    <div class="danger-section">
      <h3>Data</h3>
      <p class="danger-warning">This will permanently delete all your data. This cannot be undone.</p>
      <button class="btn-danger" id="clear-all-data">Clear All Data</button>
    </div>
  `;

  // Sign out handler
  if (isAuthenticated()) {
    container
      .querySelector("#sign-out-btn")
      .addEventListener("click", handleSignOut);
  }

  // Clear all data
  container.querySelector("#clear-all-data").addEventListener("click", () => {
    const confirmed = confirm(
      "Are you ABSOLUTELY SURE you want to delete all data?\n\n" +
        "This action cannot be undone!\n\n" +
        "Make sure you have exported your data first.",
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
      
      <div class="preference-item">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            id="memory-aids-toggle"
            ${currentSettings.memoryAidsEnabled ? "checked" : ""}
          />
          <span>Enable Memory Aids</span>
        </label>
        <p class="preference-description">Show past entries from the same date or month. Optional and dismissible.</p>
      </div>
    </div>
    
    <button class="btn-primary" id="save-preferences">Save Changes</button>
  `;

  container.querySelector("#save-preferences").addEventListener("click", () => {
    currentSettings.firstDayOfWeek = parseInt(
      document.getElementById("first-day-select").value,
    );
    currentSettings.memoryAidsEnabled =
      document.getElementById("memory-aids-toggle").checked;

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
