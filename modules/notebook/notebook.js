/**
 * Monthly Notebook Module
 *
 * Provides a notebook-style view of a full month with:
 * - Trend visualization
 * - Daily rows with domain presence
 * - Manual outcome selection
 * - Monthly reflection
 *
 * Design philosophy: Feel like a paper notebook, not a productivity app
 */

/**
 * Initialize the monthly notebook module
 * Called when user navigates to the notebook view
 *
 * @param {number} year - Four-digit year (optional, defaults to current)
 * @param {number} month - Month number 1-12 (optional, defaults to current)
 */
function initializeMonthlyNotebook(year, month) {
  // Default to current month if not specified
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || now.getMonth() + 1;

  // Get container
  const container = document.getElementById("notebook-view");
  if (!container) {
    console.error("Notebook container not found");
    return;
  }

  // Show sync status
  container.innerHTML =
    '<div class="sync-status syncing">Syncing data...</div>';

  // Perform non-destructive sync
  const syncResult = performNonDestructiveSync(targetYear, targetMonth);

  if (!syncResult.success) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">Sync Error</div>
        <div class="empty-state-message">${
          syncResult.error || "Failed to sync notebook"
        }</div>
      </div>
    `;
    return;
  }

  // Get the synced notebook
  const notebook = getMonthlyNotebook(targetYear, targetMonth);
  if (!notebook) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No Notebook Found</div>
        <div class="empty-state-message">Unable to load notebook for ${targetYear}-${targetMonth}</div>
      </div>
    `;
    return;
  }

  // Render the notebook view
  renderNotebookView(container, notebook);
}

/**
 * Render the complete notebook view
 *
 * @param {HTMLElement} container - Container element
 * @param {Object} notebook - Monthly notebook data
 */
function renderNotebookView(container, notebook) {
  const monthName = new Date(
    notebook.year,
    notebook.month - 1
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  container.innerHTML = `
    <div class="notebook-view">
      <div class="notebook-header">
        <h2 class="notebook-title">${monthName}</h2>
        <p class="notebook-subtitle">Monthly Notebook</p>
      </div>
      
      <div id="trend-graph-container"></div>
      <div id="daily-entries-container"></div>
      <div id="monthly-reflection-container"></div>
    </div>
  `;

  // Render each section
  renderTrendGraph(notebook);
  renderDailyEntries(notebook);
  renderMonthlyReflection(notebook);
}

/**
 * Render trend graph showing domain activity per day
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderTrendGraph(notebook) {
  const container = document.getElementById("trend-graph-container");
  if (!container) return;

  // Get activity counts per day
  const activityCounts = getMonthlyDomainActivity(
    notebook.year,
    notebook.month
  );
  if (!activityCounts) {
    container.innerHTML = "";
    return;
  }

  // Generate trend marks
  const marksHtml = activityCounts
    .map((count, index) => {
      const day = index + 1;
      return `<div class="trend-mark" data-count="${count}" data-day="${day}" title="Day ${day}: ${count} domains"></div>`;
    })
    .join("");

  container.innerHTML = `
    <div class="trend-graph">
      <div class="trend-graph-title">Domain Activity</div>
      <div class="trend-marks">${marksHtml}</div>
    </div>
  `;
}

/**
 * Render daily entry rows
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderDailyEntries(notebook) {
  const container = document.getElementById("daily-entries-container");
  if (!container) return;

  const domains = getAllDomains();

  const entriesHtml = notebook.days
    .map((day, index) => {
      const date = new Date(day.date);
      const dayNum = index + 1;
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Generate domain indicators
      const indicatorsHtml = domains
        .map((domain) => {
          const isActive = day.domainSignals[domain.id] === true;
          return `<div class="domain-indicator ${
            isActive ? "active" : ""
          }" data-domain="${domain.displayName}"></div>`;
        })
        .join("");

      // Get active domains list for display
      const activeDomains = domains
        .filter((domain) => day.domainSignals[domain.id] === true)
        .map((domain) => domain.displayName);
      const activeDomainsText =
        activeDomains.length > 0 ? activeDomains.join(", ") : "No activity";

      return `
      <div class="daily-entry" data-day-index="${index}">
        <div class="entry-row" data-day-index="${index}">
          <span class="entry-expand-indicator">▸</span>
          <div class="entry-date">
            ${dateStr}
            <span class="entry-date-day">${dayName}</span>
          </div>
          
          <div class="domain-indicators">
            ${indicatorsHtml}
          </div>
          
          <div class="outcome-selector" onclick="event.stopPropagation()">
            <button class="outcome-button ${
              day.manualOutcome === "win" ? "selected" : ""
            }" 
                    data-outcome="win" 
                    data-day-index="${index}"
                    title="Win">✓</button>
            <button class="outcome-button ${
              day.manualOutcome === "neutral" ? "selected" : ""
            }" 
                    data-outcome="neutral" 
                    data-day-index="${index}"
                    title="Neutral">−</button>
            <button class="outcome-button ${
              day.manualOutcome === "loss" ? "selected" : ""
            }" 
                    data-outcome="loss" 
                    data-day-index="${index}"
                    title="Loss">✗</button>
          </div>
        </div>
        
        <div class="day-reflection">
          <label class="day-reflection-label">Day Note</label>
          <textarea 
            class="day-reflection-input" 
            data-day-index="${index}"
            placeholder="What happened today?">${
              day.reflectionNote || ""
            }</textarea>
          <div class="day-active-domains">
            <strong>Active:</strong> ${activeDomainsText}
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `<div class="daily-entries">${entriesHtml}</div>`;

  // Attach event listeners
  attachOutcomeListeners(notebook);
  attachReflectionListeners(notebook);
  attachExpandListeners();
}

/**
 * Attach event listeners to outcome buttons
 *
 * @param {Object} notebook - Monthly notebook data
 */
function attachOutcomeListeners(notebook) {
  const buttons = document.querySelectorAll(".outcome-button");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const dayIndex = parseInt(button.dataset.dayIndex);
      const outcome = button.dataset.outcome;

      // Get current outcome for this day
      const currentOutcome = notebook.days[dayIndex].manualOutcome;

      // Toggle: if clicking the same outcome, clear it; otherwise set new outcome
      const newOutcome = currentOutcome === outcome ? null : outcome;

      // Update notebook
      const success = updateDayEntry(notebook.year, notebook.month, dayIndex, {
        manualOutcome: newOutcome,
      });

      if (success) {
        // Update UI
        const dayButtons = document.querySelectorAll(
          `.outcome-button[data-day-index="${dayIndex}"]`
        );
        dayButtons.forEach((btn) => btn.classList.remove("selected"));

        if (newOutcome) {
          button.classList.add("selected");
        }

        // Update notebook object in memory
        notebook.days[dayIndex].manualOutcome = newOutcome;
      }
    });
  });
}

/**
 * Attach event listeners for day reflection notes
 *
 * @param {Object} notebook - Monthly notebook data
 */
function attachReflectionListeners(notebook) {
  const textareas = document.querySelectorAll(".day-reflection-input");

  textareas.forEach((textarea) => {
    let saveTimeout;

    textarea.addEventListener("input", (e) => {
      const dayIndex = parseInt(textarea.dataset.dayIndex);

      // Debounce saves (wait 1 second after user stops typing)
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const success = updateDayEntry(
          notebook.year,
          notebook.month,
          dayIndex,
          {
            reflectionNote: e.target.value,
          }
        );

        if (success) {
          // Update notebook object in memory
          notebook.days[dayIndex].reflectionNote = e.target.value;
        }
      }, 1000);
    });
  });
}

/**
 * Attach event listeners for expanding/collapsing day entries
 */
function attachExpandListeners() {
  const entryRows = document.querySelectorAll(".entry-row");

  entryRows.forEach((row) => {
    row.addEventListener("click", (e) => {
      const dayIndex = row.dataset.dayIndex;
      const entry = document.querySelector(
        `.daily-entry[data-day-index="${dayIndex}"]`
      );

      if (entry) {
        entry.classList.toggle("expanded");
      }
    });
  });
}

/**
 * Render monthly reflection section
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderMonthlyReflection(notebook) {
  const container = document.getElementById("monthly-reflection-container");
  if (!container) return;

  // Monthly reflection is stored on the notebook object itself, not in days
  const reflection = notebook.monthlyReflection || "";

  container.innerHTML = `
    <div class="monthly-reflection">
      <div class="reflection-title">Monthly Reflection</div>
      <textarea 
        class="reflection-textarea" 
        id="monthly-reflection-input"
        placeholder="What did you learn this month? What patterns do you notice?">${reflection}</textarea>
    </div>
  `;

  // Attach save listener (debounced)
  const textarea = document.getElementById("monthly-reflection-input");
  let saveTimeout;

  textarea.addEventListener("input", (e) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      // Save reflection to notebook
      notebook.monthlyReflection = e.target.value;
      saveMonthlyNotebook(notebook);
    }, 1000); // Save 1 second after user stops typing
  });
}

/**
 * Navigate to a different month
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 */
function navigateToMonth(year, month) {
  initializeMonthlyNotebook(year, month);
}
