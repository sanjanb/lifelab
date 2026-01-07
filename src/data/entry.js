/**
 * Data Entry UI Components
 * In-app editing instead of manual JSON files
 */

import { createDayRecord, DEFAULT_DOMAINS } from "./schema.js";

/**
 * Renders a data entry form for a specific date
 * @param {HTMLElement} container - Container element
 * @param {string} date - Date to edit (ISO format)
 * @param {Object} existingData - Existing data for the date
 * @param {Function} onSave - Callback when data is saved
 */
export function renderDataEntryForm(
  container,
  date,
  existingData = null,
  onSave = null
) {
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
        <textarea id="entry-notes" rows="4" placeholder="Optional reflection...">${
          data.notes || ""
        }</textarea>
      </div>
      
      <div class="form-actions">
        <button class="btn-primary" id="save-entry">Save Entry</button>
        <button class="btn-secondary" id="cancel-entry">Cancel</button>
      </div>
    </div>
  `;

  // Attach event listeners
  const saveBtn = container.querySelector("#save-entry");
  const cancelBtn = container.querySelector("#cancel-entry");

  saveBtn.addEventListener("click", () => {
    const savedData = collectFormData();
    if (onSave) onSave(savedData);
  });

  cancelBtn.addEventListener("click", () => {
    container.innerHTML = "";
  });
}

/**
 * Renders domain input fields
 */
function renderDomainInputs(domains) {
  return Object.entries(domains || DEFAULT_DOMAINS)
    .map(
      ([domain, value]) => `
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
    `
    )
    .join("");
}

/**
 * Collects data from the form
 */
function collectFormData() {
  const date = document.getElementById("entry-date").value;
  const notes = document.getElementById("entry-notes").value;

  const domains = {};
  document.querySelectorAll(".domain-input input").forEach((input) => {
    domains[input.name] = parseFloat(input.value) || 0;
  });

  return createDayRecord(date, domains, notes);
}

/**
 * Renders a quick entry widget for today
 */
export function renderQuickEntry(container, onSave) {
  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
    <div class="quick-entry">
      <div class="quick-entry-header">
        <h3>Quick Entry</h3>
        <span class="quick-entry-date">${formatDate(today)}</span>
      </div>
      <div class="quick-domains">
        ${Object.keys(DEFAULT_DOMAINS)
          .map(
            (domain) => `
          <div class="quick-domain-slider">
            <div class="slider-label">
              <label>${capitalizeFirst(domain)}</label>
              <span class="slider-value" id="value-${domain}">50%</span>
            </div>
            <div class="slider-track-wrapper">
              <div class="slider-markers">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <input type="range" id="quick-${domain}" min="0" max="100" step="5" value="50" list="markers" />
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <button class="btn-primary" id="quick-save">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
          <path d="M13 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 2V6H5V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 10H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Save Entry
      </button>
    </div>
  `;

  // Update slider values with snap-to-grid behavior
  container.querySelectorAll('input[type="range"]').forEach((slider) => {
    const updateValue = (value) => {
      const domain = slider.id.replace("quick-", "");
      const valueSpan = document.getElementById(`value-${domain}`);
      valueSpan.textContent = `${value}%`;

      // Visual feedback for value ranges
      slider.style.setProperty("--slider-value", value);
    };

    slider.addEventListener("input", (e) => {
      updateValue(e.target.value);
    });

    // Snap to nearest 5 on release
    slider.addEventListener("change", (e) => {
      const snapped = Math.round(e.target.value / 5) * 5;
      e.target.value = snapped;
      updateValue(snapped);
    });

    // Initialize
    updateValue(slider.value);
  });

  // Save handler
  container.querySelector("#quick-save").addEventListener("click", () => {
    const domains = {};
    container.querySelectorAll('input[type="range"]').forEach((slider) => {
      const domain = slider.id.replace("quick-", "");
      domains[domain] = parseFloat(slider.value) / 100;
    });

    const entry = createDayRecord(today, domains, "");
    if (onSave) onSave(entry);
  });
}

/**
 * Helper: Format date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
