/**
 * Data Entry UI Components
 * In-app editing instead of manual JSON files
 */

import { createDayRecord, DEFAULT_DOMAINS } from './schema.js';

/**
 * Renders a data entry form for a specific date
 * @param {HTMLElement} container - Container element
 * @param {string} date - Date to edit (ISO format)
 * @param {Object} existingData - Existing data for the date
 * @param {Function} onSave - Callback when data is saved
 */
export function renderDataEntryForm(container, date, existingData = null, onSave = null) {
  const data = existingData || createDayRecord(date, { ...DEFAULT_DOMAINS });
  
  container.innerHTML = `
    <div class="data-entry-form">
      <h3>Entry for ${formatDate(date)}</h3>
      
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="entry-date" value="${date}" />
      </div>
      
      <div class="domains-section">
        <h4>Domain Scores (0.0 - 1.0)</h4>
        ${renderDomainInputs(data.domains)}
      </div>
      
      <div class="form-group">
        <label for="entry-notes">Notes</label>
        <textarea id="entry-notes" rows="4" placeholder="Optional reflection...">${data.notes || ''}</textarea>
      </div>
      
      <div class="form-actions">
        <button class="btn-primary" id="save-entry">Save Entry</button>
        <button class="btn-secondary" id="cancel-entry">Cancel</button>
      </div>
      
      <div class="form-hint">
        💡 Tip: Changes are saved locally. Export your data to download as JSON.
      </div>
    </div>
  `;
  
  // Attach event listeners
  const saveBtn = container.querySelector('#save-entry');
  const cancelBtn = container.querySelector('#cancel-entry');
  
  saveBtn.addEventListener('click', () => {
    const savedData = collectFormData();
    if (onSave) onSave(savedData);
  });
  
  cancelBtn.addEventListener('click', () => {
    container.innerHTML = '';
  });
}

/**
 * Renders domain input fields
 */
function renderDomainInputs(domains) {
  return Object.entries(domains || DEFAULT_DOMAINS)
    .map(([domain, value]) => `
      <div class="domain-input">
        <label for="domain-${domain}">${capitalizeFirst(domain)}</label>
        <input 
          type="number" 
          id="domain-${domain}" 
          name="${domain}"
          min="0" 
          max="1" 
          step="0.1" 
          value="${value}"
        />
      </div>
    `).join('');
}

/**
 * Collects data from the form
 */
function collectFormData() {
  const date = document.getElementById('entry-date').value;
  const notes = document.getElementById('entry-notes').value;
  
  const domains = {};
  document.querySelectorAll('.domain-input input').forEach(input => {
    domains[input.name] = parseFloat(input.value) || 0;
  });
  
  return createDayRecord(date, domains, notes);
}

/**
 * Renders a quick entry widget for today
 */
export function renderQuickEntry(container, onSave) {
  const today = new Date().toISOString().split('T')[0];
  
  container.innerHTML = `
    <div class="quick-entry">
      <h3>Quick Entry - Today</h3>
      <div class="quick-domains">
        ${Object.keys(DEFAULT_DOMAINS).map(domain => `
          <div class="quick-domain-slider">
            <label>${capitalizeFirst(domain)}</label>
            <input type="range" id="quick-${domain}" min="0" max="100" value="50" />
            <span class="slider-value">0.5</span>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" id="quick-save">Save Today's Entry</button>
    </div>
  `;
  
  // Update slider values
  container.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const value = (e.target.value / 100).toFixed(1);
      e.target.nextElementSibling.textContent = value;
    });
  });
  
  // Save handler
  container.querySelector('#quick-save').addEventListener('click', () => {
    const domains = {};
    container.querySelectorAll('input[type="range"]').forEach(slider => {
      const domain = slider.id.replace('quick-', '');
      domains[domain] = parseFloat(slider.value) / 100;
    });
    
    const entry = createDayRecord(today, domains, '');
    if (onSave) onSave(entry);
  });
}

/**
 * Helper: Format date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
