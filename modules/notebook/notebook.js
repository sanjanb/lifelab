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
        <button class="export-button" id="export-notebooks-button" title="Export all monthly notebooks to JSON">
          Export Data
        </button>
      </div>
      
      <div id="monthly-overview-container"></div>
      <div id="domain-participation-container"></div>
      <div id="trend-graph-container"></div>
      <div id="daily-entries-container"></div>
      <div id="monthly-reflection-container"></div>
    </div>
  `;

  // Render each section
  renderMonthlyOverview(notebook);
  renderDomainParticipation(notebook);
  renderTrendGraph(notebook);
  renderDailyEntries(notebook);
  renderMonthlyReflection(notebook);
  
  // Attach export button listener
  attachExportListener();
}

/**
 * Calculate monthly outcome statistics
 *
 * @param {Object} notebook - Monthly notebook data
 * @returns {Object} Outcome counts
 */
function calculateMonthlyOutcomes(notebook) {
  const outcomes = {
    wins: 0,
    neutral: 0,
    losses: 0,
    unrated: 0,
  };

  notebook.days.forEach((day) => {
    if (day.manualOutcome === "win") {
      outcomes.wins++;
    } else if (day.manualOutcome === "neutral") {
      outcomes.neutral++;
    } else if (day.manualOutcome === "loss") {
      outcomes.losses++;
    } else {
      outcomes.unrated++;
    }
  });

  return outcomes;
}

/**
 * Render monthly overview section
 * Shows win/neutral/loss counts visually without percentages
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderMonthlyOverview(notebook) {
  const container = document.getElementById("monthly-overview-container");
  if (!container) return;

  const outcomes = calculateMonthlyOutcomes(notebook);

  // Don't show overview if no outcomes rated yet
  const totalRated = outcomes.wins + outcomes.neutral + outcomes.losses;
  if (totalRated === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="monthly-overview">
      <div class="overview-title">Month at a Glance</div>
      <div class="outcome-bars">
        <div class="outcome-bar">
          <div class="outcome-bar-label">
            <span class="outcome-icon win">✓</span>
            <span class="outcome-text">Wins</span>
          </div>
          <div class="outcome-bar-visual">
            <div class="outcome-bar-fill win" style="width: ${
              outcomes.wins * 10
            }px"></div>
            <span class="outcome-count">${outcomes.wins}</span>
          </div>
        </div>
        
        <div class="outcome-bar">
          <div class="outcome-bar-label">
            <span class="outcome-icon neutral">−</span>
            <span class="outcome-text">Neutral</span>
          </div>
          <div class="outcome-bar-visual">
            <div class="outcome-bar-fill neutral" style="width: ${
              outcomes.neutral * 10
            }px"></div>
            <span class="outcome-count">${outcomes.neutral}</span>
          </div>
        </div>
        
        <div class="outcome-bar">
          <div class="outcome-bar-label">
            <span class="outcome-icon loss">✗</span>
            <span class="outcome-text">Losses</span>
          </div>
          <div class="outcome-bar-visual">
            <div class="outcome-bar-fill loss" style="width: ${
              outcomes.losses * 10
            }px"></div>
            <span class="outcome-count">${outcomes.losses}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Analyze domain participation patterns
 * Detects streaks, gaps, and clustering
 *
 * @param {Object} notebook - Monthly notebook data
 * @param {string} domainId - Domain identifier
 * @returns {Object} Analysis results
 */
function analyzeDomainParticipation(notebook, domainId) {
  const activeDays = [];

  // Collect active day numbers
  notebook.days.forEach((day, index) => {
    if (day.domainSignals[domainId] === true) {
      activeDays.push(index + 1); // 1-based day number
    }
  });

  const totalActiveDays = activeDays.length;

  if (totalActiveDays === 0) {
    return {
      totalActiveDays: 0,
      longestStreak: 0,
      longestGap: 0,
      pattern: null,
      observation: "No activity this month.",
    };
  }

  // Find streaks and gaps
  const streaks = [];
  const gaps = [];
  let currentStreak = 1;

  for (let i = 1; i < activeDays.length; i++) {
    const dayDiff = activeDays[i] - activeDays[i - 1];

    if (dayDiff === 1) {
      // Consecutive days - part of streak
      currentStreak++;
    } else {
      // Gap found
      if (currentStreak > 0) {
        streaks.push(currentStreak);
      }
      gaps.push(dayDiff - 1);
      currentStreak = 1;
    }
  }

  // Add final streak
  if (currentStreak > 0) {
    streaks.push(currentStreak);
  }

  const longestStreak = streaks.length > 0 ? Math.max(...streaks) : 1;
  const longestGap = gaps.length > 0 ? Math.max(...gaps) : 0;

  // Detect patterns
  let pattern = null;
  let observation = "";

  // Clustering detection
  const firstDay = activeDays[0];
  const lastDay = activeDays[activeDays.length - 1];
  const span = lastDay - firstDay + 1;
  const density = totalActiveDays / span;

  if (totalActiveDays === notebook.days.length) {
    pattern = "consistent";
    observation = "Active every day.";
  } else if (longestStreak >= 7) {
    pattern = "sustained";
    observation = `Sustained activity with ${longestStreak}-day streak.`;
  } else if (density > 0.7 && span < notebook.days.length * 0.5) {
    // High density in limited span = clustered
    if (firstDay <= 10) {
      pattern = "clustered-early";
      observation = "Activity clustered early in month.";
    } else if (lastDay >= notebook.days.length - 10) {
      pattern = "clustered-late";
      observation = "Activity clustered late in month.";
    } else {
      pattern = "clustered-mid";
      observation = "Activity clustered mid-month.";
    }
  } else if (totalActiveDays <= 3) {
    pattern = "sporadic";
    observation = `Sporadic activity (${totalActiveDays} days).`;
  } else if (longestGap >= 7) {
    pattern = "intermittent";
    observation = `Intermittent activity with ${longestGap}-day gap.`;
  } else {
    pattern = "regular";
    observation = `Regular activity across ${totalActiveDays} days.`;
  }

  return {
    totalActiveDays,
    longestStreak,
    longestGap,
    pattern,
    observation,
  };
}

/**
 * Render domain participation trends
 * Shows participation patterns as observations, not grades
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderDomainParticipation(notebook) {
  const container = document.getElementById("domain-participation-container");
  if (!container) return;

  const domains = getAllDomains();

  // Analyze each domain
  const analyses = domains.map((domain) => {
    const analysis = analyzeDomainParticipation(notebook, domain.id);
    return {
      domain,
      ...analysis,
    };
  });

  // Filter out domains with no activity
  const activeAnalyses = analyses.filter((a) => a.totalActiveDays > 0);

  if (activeAnalyses.length === 0) {
    container.innerHTML = "";
    return;
  }

  const itemsHtml = activeAnalyses
    .map((analysis) => {
      return `
      <div class="participation-item">
        <div class="participation-header">
          <span class="participation-domain">${
            analysis.domain.displayName
          }</span>
          <span class="participation-count">${analysis.totalActiveDays} ${
        analysis.totalActiveDays === 1 ? "day" : "days"
      }</span>
        </div>
        <div class="participation-observation">${analysis.observation}</div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `
    <div class="domain-participation">
      <div class="participation-title">Domain Patterns</div>
      <div class="participation-items">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Render consistency graph showing domain activity per day
 * X-axis: days of month
 * Y-axis: number of domains active (raw count)
 * No smoothing, no goal lines - descriptive only
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderTrendGraph(notebook) {
  const container = document.getElementById("trend-graph-container");
  if (!container) return;

  // Get activity counts per day (raw counts, no smoothing)
  const activityCounts = getMonthlyDomainActivity(
    notebook.year,
    notebook.month
  );
  if (!activityCounts) {
    container.innerHTML = "";
    return;
  }

  const maxCount = Math.max(...activityCounts, 1); // Ensure at least 1 for scale
  const totalDays = activityCounts.length;

  // Generate graph bars (each represents one day)
  const barsHtml = activityCounts
    .map((count, index) => {
      const day = index + 1;
      const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

      return `
        <div class="consistency-day" title="Day ${day}: ${count} ${
        count === 1 ? "domain" : "domains"
      }">
          <div class="consistency-bar" style="height: ${heightPercent}%">
            <span class="consistency-value">${count}</span>
          </div>
          <div class="consistency-day-label">${day}</div>
        </div>
      `;
    })
    .join("");

  // Generate Y-axis labels (domain count)
  const yAxisLabels = [];
  for (let i = maxCount; i >= 0; i--) {
    yAxisLabels.push(`<div class="y-axis-label">${i}</div>`);
  }

  container.innerHTML = `
    <div class="consistency-graph">
      <div class="consistency-graph-title">Consistency Graph</div>
      <div class="consistency-graph-subtitle">Daily domain activity (raw counts)</div>
      <div class="consistency-graph-container">
        <div class="y-axis">
          ${yAxisLabels.join("")}
        </div>
        <div class="consistency-bars">
          ${barsHtml}
        </div>
      </div>
      <div class="x-axis-label">Day of Month</div>
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
