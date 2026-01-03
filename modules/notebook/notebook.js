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
  
  const isClosed = notebook._closed === true;
  const closedIndicator = isClosed 
    ? '<span class="closed-badge">🔒 Closed</span>' 
    : '';

  container.innerHTML = `
    <div class="notebook-view ${isClosed ? 'notebook-closed' : ''}">
      <div class="notebook-header">
        <h2 class="notebook-title">${monthName} ${closedIndicator}</h2>
        <p class="notebook-subtitle">Monthly Notebook</p>
        <div class="header-actions">
          <button class="action-button" id="import-notebooks-button" title="Import monthly notebooks from JSON">
            Import Data
          </button>
          <button class="action-button primary" id="export-notebooks-button" title="Export all monthly notebooks to JSON">
            Export Data
          </button>
          ${!isClosed ? `
            <button class="action-button warning" id="close-month-button" title="Close this month (makes it read-only)">
              Close Month
            </button>
          ` : ''}
        </div>
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

  // Attach button listeners
  attachExportListener();
  attachImportListener();
  attachCloseMonthListener(notebook);
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

  // Get domain configuration for trait-aware phrasing
  const domain = getAllDomains().find(d => d.id === domainId);
  const traits = domain?.analysistraits || {};

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

  // Detect patterns with trait-aware language
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
      observation = traits.naturallyCyclical
        ? "Activity concentrated early in month (natural cycle)."
        : "Activity clustered early in month.";
    } else if (lastDay >= notebook.days.length - 10) {
      pattern = "clustered-late";
      observation = traits.naturallyCyclical
        ? "Activity concentrated late in month (natural cycle)."
        : "Activity clustered late in month.";
    } else {
      pattern = "clustered-mid";
      observation = traits.naturallyCyclical
        ? "Activity concentrated mid-month (natural cycle)."
        : "Activity clustered mid-month.";
    }
  } else if (totalActiveDays <= 3) {
    pattern = "sporadic";
    observation = traits.naturallyCyclical
      ? `Light activity month (${totalActiveDays} days).`
      : `Sporadic activity (${totalActiveDays} days).`;
  } else if (longestGap >= 7) {
    pattern = "intermittent";
    // For cyclical domains, don't frame gaps negatively
    if (traits.naturallyCyclical) {
      observation = `Active across ${totalActiveDays} days with natural pauses.`;
    } else if (traits.isEnergySensitive) {
      observation = `Active ${totalActiveDays} days with ${longestGap}-day pause.`;
    } else {
      observation = `Intermittent activity with ${longestGap}-day gap.`;
    }
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
  const isClosed = notebook._closed === true;

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
          
          <div class="intent-selector" onclick="event.stopPropagation()" title="Day type">
            <button class="intent-button ${
              day.dayIntent === "active" ? "selected" : ""
            }" 
                    data-intent="active" 
                    data-day-index="${index}"
                    title="Active day"
                    ${isClosed ? 'disabled' : ''}>◉</button>
            <button class="intent-button ${
              day.dayIntent === "rest" ? "selected" : ""
            }" 
                    data-intent="rest" 
                    data-day-index="${index}"
                    title="Rest day"
                    ${isClosed ? 'disabled' : ''}>◐</button>
            <button class="intent-button ${
              day.dayIntent === "offline" ? "selected" : ""
            }" 
                    data-intent="offline" 
                    data-day-index="${index}"
                    title="Offline/unplugged"
                    ${isClosed ? 'disabled' : ''}>◯</button>
          </div>
          
          <div class="outcome-selector" onclick="event.stopPropagation()">
            <button class="outcome-button ${
              day.manualOutcome === "win" ? "selected" : ""
            }" 
                    data-outcome="win" 
                    data-day-index="${index}"
                    title="Win"
                    ${isClosed ? 'disabled' : ''}>✓</button>
            <button class="outcome-button ${
              day.manualOutcome === "neutral" ? "selected" : ""
            }" 
                    data-outcome="neutral" 
                    data-day-index="${index}"
                    title="Neutral"
                    ${isClosed ? 'disabled' : ''}>−</button>
            <button class="outcome-button ${
              day.manualOutcome === "loss" ? "selected" : ""
            }" 
                    data-outcome="loss" 
                    data-day-index="${index}"
                    title="Loss"
                    ${isClosed ? 'disabled' : ''}>✗</button>
          </div>
        </div>
        
        <div class="day-reflection">
          <label class="day-reflection-label">Day Note ${isClosed ? '(Read-only)' : ''}</label>
          <textarea 
            class="day-reflection-input" 
            data-day-index="${index}"
            placeholder="What happened today?"
            ${isClosed ? 'readonly' : ''}>${
              day.reflectionNote || ""
            }</textarea>
          
          <div class="day-quality-selector">
            <label class="day-quality-label">Quality ${isClosed ? '(Read-only)' : ''}:</label>
            <div class="quality-buttons">
              <button class="quality-button ${
                day.dayQuality === "low" ? "selected" : ""
              }" 
                      data-quality="low" 
                      data-day-index="${index}"
                      ${isClosed ? 'disabled' : ''}>Low</button>
              <button class="quality-button ${
                day.dayQuality === "medium" ? "selected" : ""
              }" 
                      data-quality="medium" 
                      data-day-index="${index}"
                      ${isClosed ? 'disabled' : ''}>Medium</button>
              <button class="quality-button ${
                day.dayQuality === "high" ? "selected" : ""
              }" 
                      data-quality="high" 
                      data-day-index="${index}"
                      ${isClosed ? 'disabled' : ''}>High</button>
            </div>
          </div>
          
          <div class="day-active-domains">
            <strong>Active:</strong> ${activeDomainsText}
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = `<div class="daily-entries">${entriesHtml}</div>`;

  // Attach event listeners (only if not closed)
  if (!isClosed) {
    attachOutcomeListeners(notebook);
    attachIntentListeners(notebook);
    attachQualityListeners(notebook);
    attachReflectionListeners(notebook);
  }
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
 * Attach event listeners to day intent buttons
 * Intent: active, rest, offline, or unknown (default)
 *
 * @param {Object} notebook - Monthly notebook data
 */
function attachIntentListeners(notebook) {
  const buttons = document.querySelectorAll(".intent-button");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const dayIndex = parseInt(button.dataset.dayIndex);
      const intent = button.dataset.intent;

      // Get current intent for this day
      const currentIntent = notebook.days[dayIndex].dayIntent;

      // Toggle: if clicking the same intent, reset to "unknown"; otherwise set new intent
      const newIntent = currentIntent === intent ? "unknown" : intent;

      // Update notebook
      const success = updateDayEntry(notebook.year, notebook.month, dayIndex, {
        dayIntent: newIntent,
      });

      if (success) {
        // Update UI
        const dayButtons = document.querySelectorAll(
          `.intent-button[data-day-index="${dayIndex}"]`
        );
        dayButtons.forEach((btn) => btn.classList.remove("selected"));

        if (newIntent !== "unknown") {
          button.classList.add("selected");
        }

        // Update notebook object in memory
        notebook.days[dayIndex].dayIntent = newIntent;
      }
    });
  });
}

/**
 * Attach event listeners to day quality buttons
 * Quality: low, medium, high, or null (default)
 * Quality is independent of outcome - not aggregated
 *
 * @param {Object} notebook - Monthly notebook data
 */
function attachQualityListeners(notebook) {
  const buttons = document.querySelectorAll(".quality-button");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const dayIndex = parseInt(button.dataset.dayIndex);
      const quality = button.dataset.quality;

      // Get current quality for this day
      const currentQuality = notebook.days[dayIndex].dayQuality;

      // Toggle: if clicking the same quality, reset to null; otherwise set new quality
      const newQuality = currentQuality === quality ? null : quality;

      // Update notebook
      const success = updateDayEntry(notebook.year, notebook.month, dayIndex, {
        dayQuality: newQuality,
      });

      if (success) {
        // Update UI
        const dayButtons = document.querySelectorAll(
          `.quality-button[data-day-index="${dayIndex}"]`
        );
        dayButtons.forEach((btn) => btn.classList.remove("selected"));

        if (newQuality) {
          button.classList.add("selected");
        }

        // Update notebook object in memory
        notebook.days[dayIndex].dayQuality = newQuality;
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
 * Get monthly sentence starter based on month
 * Rotates through different prompts to encourage reflection
 * 
 * @param {number} month - Month number (1-12)
 * @returns {string} Sentence starter
 */
function getMonthlyReflectionStarter(month) {
  const starters = [
    "This month felt like...",                    // Jan
    "I underestimated...",                        // Feb
    "What surprised me was...",                   // Mar
    "The hardest part was...",                    // Apr
    "I'm noticing a pattern where...",            // May
    "This month taught me...",                    // Jun
    "I wasn't expecting...",                      // Jul
    "The biggest shift was...",                   // Aug
    "Looking back, I see...",                     // Sep
    "What became clear this month...",            // Oct
    "I'm learning that...",                       // Nov
    "By the end of this month...",                // Dec
  ];
  
  return starters[month - 1] || starters[0];
}

/**
 * Check if monthly reflection is complete
 * @param {Object} notebook - Monthly notebook data
 * @returns {boolean} True if reflection exists and is not empty
 */
function hasMonthlyReflection(notebook) {
  return notebook.monthlyReflection && notebook.monthlyReflection.trim().length > 0;
}

/**
 * Render monthly reflection section with sentence starter
 *
 * @param {Object} notebook - Monthly notebook data
 */
function renderMonthlyReflection(notebook) {
  const container = document.getElementById("monthly-reflection-container");
  if (!container) return;

  // Monthly reflection is stored on the notebook object itself, not in days
  const reflection = notebook.monthlyReflection || "";
  const starter = getMonthlyReflectionStarter(notebook.month);
  const hasReflection = hasMonthlyReflection(notebook);
  const isClosed = notebook._closed === true;
  
  // Show gentle reminder if reflection is missing (not blocking, just visible)
  const reminderClass = hasReflection ? '' : 'reflection-reminder-visible';

  container.innerHTML = `
    <div class="monthly-reflection ${reminderClass} ${isClosed ? 'read-only' : ''}">
      <div class="reflection-title">Monthly Reflection ${isClosed ? '(Read-only)' : ''}</div>
      <div class="reflection-starter">${starter}</div>
      <textarea 
        class="reflection-textarea" 
        id="monthly-reflection-input"
        placeholder="Complete the thought above (one sentence encouraged)"
        maxlength="500"
        ${isClosed ? 'readonly' : ''}>${reflection}</textarea>
      <div class="reflection-hint ${!hasReflection ? 'reflection-missing' : ''}">
        ${!hasReflection && !isClosed
          ? '⚠ Reflection helps close the month intentionally' 
          : isClosed
          ? 'Month closed - reflection preserved'
          : 'Reflection saved'}
      </div>
    </div>
  `;

  // Attach save listener only if not closed
  if (!isClosed) {
    const textarea = document.getElementById("monthly-reflection-input");
    let saveTimeout;

    textarea.addEventListener("input", (e) => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        // Save reflection to notebook
        notebook.monthlyReflection = e.target.value;
        saveMonthlyNotebook(notebook);
        
        // Re-render to update reminder visibility
        renderMonthlyReflection(notebook);
      }, 1000); // Save 1 second after user stops typing
    });
  }
}

/**
 * Export all monthly notebooks to JSON
 * Manual export only - no auto-sync
 *
 * @returns {Object} Export package with metadata
 */
function exportMonthlyNotebooks() {
  try {
    // Get all monthly notebooks from storage
    const notebooks = getAllMonthlyNotebooks();

    if (!notebooks || notebooks.length === 0) {
      return {
        success: false,
        error: "No notebooks to export",
      };
    }

    // Create export package
    const exportData = {
      // Metadata
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      appName: "LifeLab",
      appVersion: "1.0.0",

      // Count summary
      notebookCount: notebooks.length,
      dateRange: {
        earliest: `${notebooks[notebooks.length - 1].year}-${String(
          notebooks[notebooks.length - 1].month
        ).padStart(2, "0")}`,
        latest: `${notebooks[0].year}-${String(notebooks[0].month).padStart(
          2,
          "0"
        )}`,
      },

      // All notebooks
      notebooks: notebooks,
    };

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    console.error("exportMonthlyNotebooks error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Download export data as JSON file
 * Triggers browser download
 *
 * @param {Object} exportData - Data to export
 */
function downloadExportFile(exportData) {
  try {
    // Convert to JSON string (pretty-printed for readability)
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    link.download = `lifelab-export-${dateStr}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("downloadExportFile error:", error);
    return false;
  }
}

/**
 * Attach event listener to export button
 */
function attachExportListener() {
  const exportButton = document.getElementById("export-notebooks-button");

  if (!exportButton) return;

  exportButton.addEventListener("click", () => {
    // Disable button during export
    exportButton.disabled = true;
    exportButton.textContent = "Exporting...";

    // Perform export
    const result = exportMonthlyNotebooks();

    if (result.success) {
      // Download file
      const downloaded = downloadExportFile(result.data);

      if (downloaded) {
        // Show success feedback
        exportButton.textContent = "Exported ✓";
        setTimeout(() => {
          exportButton.textContent = "Export Data";
          exportButton.disabled = false;
        }, 2000);
      } else {
        // Download failed
        exportButton.textContent = "Export Failed";
        alert("Failed to download export file. Please try again.");
        setTimeout(() => {
          exportButton.textContent = "Export Data";
          exportButton.disabled = false;
        }, 2000);
      }
    } else {
      // Export failed
      exportButton.textContent = "Export Failed";
      alert(result.error || "Failed to export notebooks. Please try again.");
      setTimeout(() => {
        exportButton.textContent = "Export Data";
        exportButton.disabled = false;
      }, 2000);
    }
  });
}

/**
 * Validate import data structure
 *
 * @param {Object} importData - Data to validate
 * @returns {Object} Validation result
 */
function validateImportData(importData) {
  const errors = [];

  // Check top-level structure
  if (!importData || typeof importData !== "object") {
    return {
      valid: false,
      errors: ["Import data must be an object"],
    };
  }

  // Check required metadata fields
  if (!importData.exportDate) {
    errors.push("Missing exportDate in metadata");
  }

  if (!importData.notebooks || !Array.isArray(importData.notebooks)) {
    return {
      valid: false,
      errors: ["Import data must contain a notebooks array"],
    };
  }

  // Validate each notebook
  importData.notebooks.forEach((notebook, index) => {
    if (!notebook.year || !Number.isInteger(notebook.year)) {
      errors.push(`Notebook ${index}: missing or invalid year`);
    }

    if (
      !notebook.month ||
      !Number.isInteger(notebook.month) ||
      notebook.month < 1 ||
      notebook.month > 12
    ) {
      errors.push(`Notebook ${index}: missing or invalid month`);
    }

    if (!Array.isArray(notebook.days)) {
      errors.push(`Notebook ${index}: missing days array`);
    } else {
      // Validate each day
      notebook.days.forEach((day, dayIndex) => {
        if (!day.date || typeof day.date !== "string") {
          errors.push(
            `Notebook ${index}, Day ${dayIndex}: missing or invalid date`
          );
        }

        if (!day.domainSignals || typeof day.domainSignals !== "object") {
          errors.push(
            `Notebook ${index}, Day ${dayIndex}: missing or invalid domainSignals`
          );
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Check for conflicts with existing notebooks
 *
 * @param {Array} importNotebooks - Notebooks to import
 * @returns {Object} Conflict information
 */
function checkImportConflicts(importNotebooks) {
  const conflicts = [];
  const newNotebooks = [];

  importNotebooks.forEach((notebook) => {
    const existing = getMonthlyNotebook(notebook.year, notebook.month);

    if (existing) {
      conflicts.push({
        year: notebook.year,
        month: notebook.month,
        label: `${notebook.year}-${String(notebook.month).padStart(2, "0")}`,
      });
    } else {
      newNotebooks.push({
        year: notebook.year,
        month: notebook.month,
        label: `${notebook.year}-${String(notebook.month).padStart(2, "0")}`,
      });
    }
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts: conflicts,
    newNotebooks: newNotebooks,
    conflictCount: conflicts.length,
    newCount: newNotebooks.length,
  };
}

/**
 * Import monthly notebooks from data
 *
 * @param {Object} importData - Validated import data
 * @param {boolean} overwriteExisting - Whether to overwrite existing notebooks
 * @returns {Object} Import result
 */
function importMonthlyNotebooks(importData, overwriteExisting = false) {
  try {
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    importData.notebooks.forEach((notebook) => {
      const existing = getMonthlyNotebook(notebook.year, notebook.month);

      if (existing && !overwriteExisting) {
        skippedCount++;
        return;
      }

      // Save notebook
      const success = saveMonthlyNotebook(notebook);

      if (success) {
        importedCount++;
      } else {
        errors.push(`Failed to import ${notebook.year}-${notebook.month}`);
      }
    });

    return {
      success: errors.length === 0,
      importedCount,
      skippedCount,
      errors,
    };
  } catch (error) {
    console.error("importMonthlyNotebooks error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Attach event listener to import button
 */
function attachImportListener() {
  const importButton = document.getElementById("import-notebooks-button");

  if (!importButton) return;

  importButton.addEventListener("click", () => {
    // Create file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json,.json";

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Disable button during import
      importButton.disabled = true;
      importButton.textContent = "Importing...";

      try {
        // Read file
        const text = await file.text();
        const importData = JSON.parse(text);

        // Validate structure
        const validation = validateImportData(importData);

        if (!validation.valid) {
          alert("Invalid import file:\n\n" + validation.errors.join("\n"));
          importButton.textContent = "Import Failed";
          setTimeout(() => {
            importButton.textContent = "Import Data";
            importButton.disabled = false;
          }, 2000);
          return;
        }

        // Check for conflicts
        const conflicts = checkImportConflicts(importData.notebooks);

        let overwriteExisting = false;

        if (conflicts.hasConflicts) {
          // Show confirmation dialog
          const message = `Found ${
            conflicts.conflictCount
          } existing notebook(s):\n${conflicts.conflicts
            .map((c) => c.label)
            .join(", ")}\n\nAlso found ${
            conflicts.newCount
          } new notebook(s).\n\nOverwrite existing notebooks?`;

          overwriteExisting = confirm(message);

          if (!overwriteExisting && conflicts.newCount === 0) {
            // User declined and there are no new notebooks
            alert("Import cancelled. No new notebooks to import.");
            importButton.textContent = "Import Data";
            importButton.disabled = false;
            return;
          }
        }

        // Perform import
        const result = importMonthlyNotebooks(importData, overwriteExisting);

        if (result.success || result.importedCount > 0) {
          const message = `Import complete!\n\nImported: ${result.importedCount}\nSkipped: ${result.skippedCount}`;
          alert(message);

          importButton.textContent = "Imported ✓";

          // Reload current view
          setTimeout(() => {
            importButton.textContent = "Import Data";
            importButton.disabled = false;

            // Refresh the notebook view
            const now = new Date();
            initializeMonthlyNotebook(now.getFullYear(), now.getMonth() + 1);
          }, 2000);
        } else {
          alert(
            "Import failed:\n\n" +
              (result.errors?.join("\n") || result.error || "Unknown error")
          );
          importButton.textContent = "Import Failed";
          setTimeout(() => {
            importButton.textContent = "Import Data";
            importButton.disabled = false;
          }, 2000);
        }
      } catch (error) {
        console.error("Import error:", error);
        alert(
          "Failed to parse import file. Please ensure it's a valid JSON file."
        );
        importButton.textContent = "Import Failed";
        setTimeout(() => {
          importButton.textContent = "Import Data";
          importButton.disabled = false;
        }, 2000);
      }
    });

    // Trigger file selection
    fileInput.click();
  });
}

/**
 * Attach event listener for close month button
 * Closes the month and makes it read-only
 * 
 * @param {Object} notebook - Monthly notebook data
 */
function attachCloseMonthListener(notebook) {
  const closeButton = document.getElementById('close-month-button');
  if (!closeButton) return;

  closeButton.addEventListener('click', () => {
    // Check if reflection is complete
    const hasReflection = notebook.monthlyReflection && notebook.monthlyReflection.trim().length > 0;
    
    if (!hasReflection) {
      const proceed = confirm(
        'No monthly reflection found.\n\n' +
        'Reflection helps close the month intentionally.\n\n' +
        'Close anyway?'
      );
      
      if (!proceed) return;
    }
    
    // Final confirmation
    const confirmed = confirm(
      `Close ${new Date(notebook.year, notebook.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?\n\n` +
      'This will make all daily outcomes, quality, intent, and notes read-only.\n\n' +
      'This action preserves truth and cannot be undone.'
    );
    
    if (!confirmed) return;
    
    // Close the month
    const success = closeMonthlyNotebook(notebook.year, notebook.month);
    
    if (success) {
      // Refresh the view to show closed state
      initializeMonthlyNotebook(notebook.year, notebook.month);
      alert('Month closed successfully. All entries are now read-only.');
    } else {
      alert('Failed to close month. Please try again.');
    }
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
