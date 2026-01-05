/*
 * Health Module - Main Logic
 * Manages health metrics, fitness tracking, nutrition, and wellness
 * Handles workout logs, meal tracking, and health goal monitoring
 */

/**
 * Initialize the Health module
 * Sets up the quick entry form and loads existing entries
 *
 * @param {string} containerId - The ID of the container element for quick entry
 */
function initializeHealthModule(containerId) {
  renderHealthEntryForm(containerId);
  refreshHealthHistory();
  refreshHealthTrends();
}

/**
 * Render the quick entry form for health
 *
 * @param {string} containerId - The ID of the container element
 */
function renderHealthEntryForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const form = document.createElement("form");
  form.className = "habit-entry-form";
  form.id = "health-entry-form";

  // Value input (health activity)
  const valueGroup = document.createElement("div");
  valueGroup.className = "form-group";

  const valueLabel = document.createElement("label");
  valueLabel.textContent = "Health Activity";
  valueLabel.htmlFor = "health-value";
  valueLabel.className = "form-label";

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.id = "health-value";
  valueInput.name = "value";
  valueInput.className = "form-input";
  valueInput.placeholder =
    "e.g., 30-minute run, Yoga session, Healthy meal prep";
  valueInput.required = true;

  valueGroup.appendChild(valueLabel);
  valueGroup.appendChild(valueInput);

  // Notes input
  const notesGroup = document.createElement("div");
  notesGroup.className = "form-group";

  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Notes (optional)";
  notesLabel.htmlFor = "health-notes";
  notesLabel.className = "form-label";

  const notesInput = document.createElement("textarea");
  notesInput.id = "health-notes";
  notesInput.name = "notes";
  notesInput.className = "form-textarea";
  notesInput.placeholder = "Add details like duration, intensity, metrics...";
  notesInput.rows = 3;

  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesInput);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn btn-primary";
  submitButton.textContent = "Log Activity";

  form.appendChild(valueGroup);
  form.appendChild(notesGroup);
  form.appendChild(submitButton);

  form.addEventListener("submit", handleHealthSubmit);

  container.appendChild(form);
}

/**
 * Handle health entry form submission
 *
 * @param {Event} event - Form submit event
 */
function handleHealthSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const value = form.value.value.trim();
  const notes = form.notes.value.trim();

  if (!value) {
    alert("Please enter a health activity");
    return;
  }

  const entry = createEntry(value, notes);
  const success = saveEntry("health", entry);

  if (success) {
    form.reset();
    showHealthSuccessMessage("Health activity logged successfully!");
    refreshHealthHistory();
    refreshHealthTrends();
  } else {
    alert("Failed to save entry. Please try again.");
  }
}

/**
 * Show temporary success message
 *
 * @param {string} message - Message to display
 */
function showHealthSuccessMessage(message) {
  const form = document.getElementById("health-entry-form");
  if (!form) return;

  const existingMsg = form.querySelector(".success-message");
  if (existingMsg) existingMsg.remove();

  const msgElement = document.createElement("div");
  msgElement.className = "success-message";
  msgElement.textContent = message;

  form.parentNode.insertBefore(msgElement, form.nextSibling);

  setTimeout(() => msgElement.remove(), 3000);
}

/**
 * Refresh and render health history
 */
function refreshHealthHistory() {
  const container = document.getElementById("history-health");
  if (!container) return;

  const allEntries = getEntries("health");

  if (!allEntries || allEntries.length === 0) {
    container.innerHTML = '<p class="text-muted text-small">No entries yet</p>';
    return;
  }

  const recentEntries = allEntries
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 14);

  container.innerHTML = "";

  const entryList = document.createElement("div");
  entryList.className = "entry-list";

  recentEntries.forEach((entry) => {
    const entryItem = createHealthEntryItem(entry);
    entryList.appendChild(entryItem);
  });

  container.appendChild(entryList);
}

/**
 * Create a single entry item element
 *
 * @param {Object} entry - The entry object
 * @returns {HTMLElement} Entry item element
 */
function createHealthEntryItem(entry) {
  const item = document.createElement("div");
  item.className = "entry-item";
  item.dataset.entryId = entry.id;

  const content = document.createElement("div");
  content.className = "entry-content";

  const valueElement = document.createElement("div");
  valueElement.className = "entry-value";
  valueElement.textContent = entry.value;

  const metaElement = document.createElement("div");
  metaElement.className = "entry-meta text-muted text-small";
  metaElement.textContent = formatDateTime(entry.timestamp);

  content.appendChild(valueElement);
  content.appendChild(metaElement);

  if (entry.notes) {
    const notesElement = document.createElement("div");
    notesElement.className = "entry-notes text-small";
    notesElement.textContent = entry.notes;
    content.appendChild(notesElement);
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn-delete";
  deleteButton.textContent = "Delete";
  deleteButton.title = "Delete this entry";
  deleteButton.addEventListener("click", () =>
    handleDeleteHealthEntry(entry.id)
  );

  item.appendChild(content);
  item.appendChild(deleteButton);

  return item;
}

/**
 * Handle deletion of a health entry
 *
 * @param {string} entryId - The ID of the entry to delete
 */
function handleDeleteHealthEntry(entryId) {
  if (!confirm("Are you sure you want to delete this entry?")) {
    return;
  }

  const success = deleteEntry("health", entryId);

  if (success) {
    refreshHealthHistory();
    refreshHealthTrends();
  } else {
    alert("Failed to delete entry. Please try again.");
  }
}

/**
 * Refresh and render health trends
 */
function refreshHealthTrends() {
  const container = document.getElementById("trend-health");
  if (!container) return;

  const allEntries = getEntries("health");
  container.innerHTML = "";

  const totalEntries = allEntries ? allEntries.length : 0;

  // Calculate active days (unique dates)
  const activeDays = new Set();
  if (allEntries) {
    allEntries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateString = date.toISOString().split("T")[0];
      activeDays.add(dateString);
    });
  }

  // Calculate this week's activity
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = allEntries
    ? allEntries.filter((e) => e.timestamp >= weekStart.getTime()).length
    : 0;

  const statsGrid = document.createElement("div");
  statsGrid.className = "stats-grid";

  const totalStat = createHealthStatCard(
    "Total Activities",
    totalEntries,
    totalEntries === 1 ? "activity" : "activities"
  );
  const daysStat = createHealthStatCard(
    "Active Days",
    activeDays.size,
    activeDays.size === 1 ? "day" : "days"
  );
  const weekStat = createHealthStatCard(
    "This Week",
    weekEntries,
    weekEntries === 1 ? "activity" : "activities"
  );

  statsGrid.appendChild(totalStat);
  statsGrid.appendChild(daysStat);
  statsGrid.appendChild(weekStat);

  container.appendChild(statsGrid);
}

/**
 * Create a stat card element
 *
 * @param {string} label - The stat label
 * @param {number} value - The stat value
 * @param {string} unit - The unit of measurement
 * @returns {HTMLElement} Stat card element
 */
function createHealthStatCard(label, value, unit) {
  const card = document.createElement("div");
  card.className = "stat-card";

  const valueElement = document.createElement("div");
  valueElement.className = "stat-value";
  valueElement.textContent = value;

  const unitElement = document.createElement("div");
  unitElement.className = "stat-unit text-muted text-small";
  unitElement.textContent = unit;

  const labelElement = document.createElement("div");
  labelElement.className = "stat-label text-muted text-small";
  labelElement.textContent = label;

  card.appendChild(valueElement);
  card.appendChild(unitElement);
  card.appendChild(labelElement);

  return card;
}
