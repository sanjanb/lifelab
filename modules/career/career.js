/*
 * Career Module - Main Logic
 * Manages career goals, job applications, projects, and professional development
 * Tracks achievements, networking, and career milestones
 */

/**
 * Initialize the Career module
 * Sets up the quick entry form and loads existing entries
 *
 * @param {string} containerId - The ID of the container element for quick entry
 */
function initializeCareerModule(containerId) {
  renderCareerEntryForm(containerId);
  refreshCareerHistory();
  refreshCareerTrends();
}

/**
 * Render the quick entry form for career
 *
 * @param {string} containerId - The ID of the container element
 */
function renderCareerEntryForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const form = document.createElement("form");
  form.className = "habit-entry-form";
  form.id = "career-entry-form";

  // Value input (career activity)
  const valueGroup = document.createElement("div");
  valueGroup.className = "form-group";

  const valueLabel = document.createElement("label");
  valueLabel.textContent = "Career Activity";
  valueLabel.htmlFor = "career-value";
  valueLabel.className = "form-label";

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.id = "career-value";
  valueInput.name = "value";
  valueInput.className = "form-input";
  valueInput.placeholder = "e.g., Sent job application, Networking coffee, Completed project milestone";
  valueInput.required = true;

  valueGroup.appendChild(valueLabel);
  valueGroup.appendChild(valueInput);

  // Notes input
  const notesGroup = document.createElement("div");
  notesGroup.className = "form-group";

  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Notes (optional)";
  notesLabel.htmlFor = "career-notes";
  notesLabel.className = "form-label";

  const notesInput = document.createElement("textarea");
  notesInput.id = "career-notes";
  notesInput.name = "notes";
  notesInput.className = "form-textarea";
  notesInput.placeholder = "Add details, outcomes, or follow-up actions...";
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

  form.addEventListener("submit", handleCareerSubmit);

  container.appendChild(form);
}

/**
 * Handle career entry form submission
 *
 * @param {Event} event - Form submit event
 */
function handleCareerSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const value = form.value.value.trim();
  const notes = form.notes.value.trim();

  if (!value) {
    alert("Please enter a career activity");
    return;
  }

  const entry = createEntry(value, notes);
  const success = saveEntry("career", entry);

  if (success) {
    form.reset();
    showCareerSuccessMessage("Career activity logged successfully!");
    refreshCareerHistory();
    refreshCareerTrends();
  } else {
    alert("Failed to save entry. Please try again.");
  }
}

/**
 * Show temporary success message
 *
 * @param {string} message - Message to display
 */
function showCareerSuccessMessage(message) {
  const form = document.getElementById("career-entry-form");
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
 * Refresh and render career history
 */
function refreshCareerHistory() {
  const container = document.getElementById("history-career");
  if (!container) return;

  const allEntries = getEntries("career");

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
    const entryItem = createCareerEntryItem(entry);
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
function createCareerEntryItem(entry) {
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
  deleteButton.addEventListener("click", () => handleDeleteCareerEntry(entry.id));

  item.appendChild(content);
  item.appendChild(deleteButton);

  return item;
}

/**
 * Handle deletion of a career entry
 *
 * @param {string} entryId - The ID of the entry to delete
 */
function handleDeleteCareerEntry(entryId) {
  if (!confirm("Are you sure you want to delete this entry?")) {
    return;
  }

  const success = deleteEntry("career", entryId);

  if (success) {
    refreshCareerHistory();
    refreshCareerTrends();
  } else {
    alert("Failed to delete entry. Please try again.");
  }
}

/**
 * Refresh and render career trends
 */
function refreshCareerTrends() {
  const container = document.getElementById("trend-career");
  if (!container) return;

  const allEntries = getEntries("career");
  container.innerHTML = "";

  const totalEntries = allEntries ? allEntries.length : 0;

  // Calculate this month's activity
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEntries = allEntries
    ? allEntries.filter((e) => e.timestamp >= monthStart.getTime()).length
    : 0;

  // Calculate this week's activity
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = allEntries
    ? allEntries.filter((e) => e.timestamp >= weekStart.getTime()).length
    : 0;

  const statsGrid = document.createElement("div");
  statsGrid.className = "stats-grid";

  const totalStat = createCareerStatCard("Total Activities", totalEntries, totalEntries === 1 ? "activity" : "activities");
  const monthStat = createCareerStatCard("This Month", monthEntries, monthEntries === 1 ? "activity" : "activities");
  const weekStat = createCareerStatCard("This Week", weekEntries, weekEntries === 1 ? "activity" : "activities");

  statsGrid.appendChild(totalStat);
  statsGrid.appendChild(monthStat);
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
function createCareerStatCard(label, value, unit) {
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
