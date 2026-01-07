/**
 * Settings Page
 * Domain configuration and preferences
 */

import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';

import { loadSettings, saveSettings, clearAllData, loadFromLocalStorage } from '../data/storage.js';
import { renderImportExportUI, exportFullBackup } from '../data/export.js';
import { mergeImportedData } from '../data/storage.js';

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
  const container = document.getElementById('domain-config');
  
  container.innerHTML = `
    <div class="domain-config-section">
      <p>Configure which domains you want to track. Changes apply to new entries.</p>
      
      <div class="domain-list">
        ${Object.entries(currentSettings.domains).map(([domain, enabled]) => `
          <div class="domain-config-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                class="domain-checkbox" 
                data-domain="${domain}" 
                ${enabled ? 'checked' : ''}
              />
              <span>${capitalizeFirst(domain)}</span>
            </label>
          </div>
        `).join('')}
      </div>
      
      <div class="add-domain-section">
        <h4>Add New Domain</h4>
        <div class="add-domain-form">
          <input type="text" id="new-domain-name" placeholder="e.g., creativity" />
          <button class="btn-primary" id="add-domain-btn">Add Domain</button>
        </div>
      </div>
      
      <button class="btn-secondary" id="save-domains">Save Domain Settings</button>
    </div>
  `;
  
  // Attach event listeners
  container.querySelector('#add-domain-btn').addEventListener('click', addNewDomain);
  container.querySelector('#save-domains').addEventListener('click', saveDomainSettings);
}

/**
 * Add a new domain
 */
function addNewDomain() {
  const input = document.getElementById('new-domain-name');
  const domainName = input.value.trim().toLowerCase();
  
  if (!domainName) {
    alert('Please enter a domain name');
    return;
  }
  
  if (currentSettings.domains[domainName] !== undefined) {
    alert('This domain already exists');
    return;
  }
  
  currentSettings.domains[domainName] = true;
  input.value = '';
  renderDomainConfig();
}

/**
 * Save domain settings
 */
function saveDomainSettings() {
  const checkboxes = document.querySelectorAll('.domain-checkbox');
  checkboxes.forEach(cb => {
    const domain = cb.dataset.domain;
    currentSettings.domains[domain] = cb.checked;
  });
  
  if (saveSettings(currentSettings)) {
    alert('Domain settings saved!');
  } else {
    alert('Failed to save settings');
  }
}

/**
 * Render data management section
 */
function renderDataManagement() {
  const container = document.getElementById('data-management');
  
  const allData = loadFromLocalStorage();
  const dataSize = JSON.stringify(allData).length;
  const entriesCount = Object.values(allData).reduce((sum, month) => sum + month.length, 0);
  
  container.innerHTML = `
    <div class="data-management-section">
      <div class="data-stats">
        <p><strong>Total Entries:</strong> ${entriesCount}</p>
        <p><strong>Storage Used:</strong> ${(dataSize / 1024).toFixed(2)} KB</p>
      </div>
      
      <div class="data-actions">
        <h4>Export/Import</h4>
        <div id="import-export-ui"></div>
        
        <h4>Full Backup</h4>
        <button class="btn-secondary" id="full-backup">Download Full Backup</button>
        
        <h4>Danger Zone</h4>
        <button class="btn-danger" id="clear-all-data">Clear All Data</button>
        <p class="warning-text">⚠️ This will permanently delete all your tracked data!</p>
      </div>
    </div>
  `;
  
  // Render import/export UI
  renderImportExportUI(
    container.querySelector('#import-export-ui'),
    Object.values(allData).flat(),
    (importedData) => {
      mergeImportedData(importedData);
      renderDataManagement();
    }
  );
  
  // Full backup
  container.querySelector('#full-backup').addEventListener('click', () => {
    exportFullBackup(allData);
  });
  
  // Clear all data
  container.querySelector('#clear-all-data').addEventListener('click', () => {
    const confirmed = confirm(
      'Are you ABSOLUTELY SURE you want to delete all data?\n\n' +
      'This action cannot be undone!\n\n' +
      'Make sure you have exported your data first.'
    );
    
    if (!confirmed) return;
    
    const doubleCheck = prompt('Type "DELETE ALL" to confirm:');
    if (doubleCheck === 'DELETE ALL') {
      if (clearAllData()) {
        alert('All data has been cleared');
        renderDataManagement();
      } else {
        alert('Failed to clear data');
      }
    }
  });
}

/**
 * Render preferences section
 */
function renderPreferences() {
  const container = document.getElementById('preferences');
  
  container.innerHTML = `
    <div class="preferences-section">
      <div class="preference-item">
        <label>First Day of Week</label>
        <select id="first-day-select">
          <option value="0" ${currentSettings.firstDayOfWeek === 0 ? 'selected' : ''}>Sunday</option>
          <option value="1" ${currentSettings.firstDayOfWeek === 1 ? 'selected' : ''}>Monday</option>
        </select>
      </div>
      
      <div class="preference-item">
        <label>Theme (Coming Soon)</label>
        <select id="theme-select" disabled>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      
      <button class="btn-secondary" id="save-preferences">Save Preferences</button>
    </div>
  `;
  
  container.querySelector('#save-preferences').addEventListener('click', () => {
    currentSettings.firstDayOfWeek = parseInt(document.getElementById('first-day-select').value);
    
    if (saveSettings(currentSettings)) {
      alert('Preferences saved!');
    } else {
      alert('Failed to save preferences');
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
