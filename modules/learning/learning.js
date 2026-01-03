/*
 * Learning Module - Main Logic
 * Manages learning goals, courses, resources, and progress tracking
 * Handles skill development tracking and learning analytics
 */

/**
 * Initialize the Learning module
 * Sets up the quick entry form and loads existing entries
 *
 * @param {string} containerId - The ID of the container element for quick entry
 */
function initializeLearningModule(containerId) {
  renderLearningEntryForm(containerId);
  refreshLearningHistory();
  refreshLearningTrends();
}

/**
 * Render the quick entry form for learning
 *
 * @param {string} containerId - The ID of the container element
 */
function renderLearningEntryForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const form = document.createElement("form");
  form.className = "habit-entry-form";
  form.id = "learning-entry-form";

  // Value input (learning activity)
  const valueGroup = document.createElement("div");
  valueGroup.className = "form-group";

  const valueLabel = document.createElement("label");
  valueLabel.textContent = "Learning Activity";
  valueLabel.htmlFor = "learning-value";
  valueLabel.className = "form-label";

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.id = "learning-value";
  valueInput.name = "value";
  valueInput.className = "form-input";
  valueInput.placeholder = "e.g., Completed Python course module, Read 2 chapters, Practiced guitar";
  valueInput.required = true;

  valueGroup.appendChild(valueLabel);
  valueGroup.appendChild(valueInput);

  // Notes input
  const notesGroup = document.createElement("div");
  notesGroup.className = "form-group";

  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Notes (optional)";
  notesLabel.htmlFor = "learning-notes";
  notesLabel.className = "form-label";

  const notesInput = document.createElement("textarea");
  notesInput.id = "learning-notes";
  notesInput.name = "notes";
  notesInput.className = "form-textarea";
  notesInput.placeholder = "Add progress notes, key takeaways, or resources...";
  notesInput.rows = 3;

  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesInput);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn btn-primary";
  submitButton.textContent = "Log Learning";

  form.appendChild(valueGroup);
  form.appendChild(notesGroup);
  form.appendChild(submitButton);

  form.addEventListener("submit", handleLearningSubmit);

  container.appendChild(form);
}

/**
 * Handle learning entry form submission
 *
 * @param {Event} event - Form submit event
 */
function handleLearningSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const value = form.value.value.trim();
  const notes = form.notes.value.trim();

  if (!value) {
    alert("Please enter a learning activity");
    return;
  }

  const entry = createEntry(value, notes);
  const success = saveEntry("learning", entry);

  if (success) {
    form.reset();
    showLearningSuccessMessage("Learning activity logged successfully!");
    refreshLearningHistory();
    refreshLearningTrends();
  } else {
    alert("Failed to save entry. Please try again.");
  }
}

/**
 * Show temporary success message
 *
 * @param {string} message - Message to display
 */
function showLearningSuccessMessage(message) {
  const form = document.getElementById("learning-entry-form");
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
 * Refresh and render learning history
 */
function refreshLearningHistory() {
  const container = document.getElementById("history-learning");
  if (!container) return;

  const allEntries = getEntries("learning");

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
    const entryItem = createLearningEntryItem(entry);
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
function createLearningEntryItem(entry) {
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
  deleteButton.addEventListener("click", () => handleDeleteLearningEntry(entry.id));

  item.appendChild(content);
  item.appendChild(deleteButton);

  return item;
}

/**
 * Handle deletion of a learning entry
 *
 * @param {string} entryId - The ID of the entry to delete
 */
function handleDeleteLearningEntry(entryId) {
  if (!confirm("Are you sure you want to delete this entry?")) {
    return;
  }

  const success = deleteEntry("learning", entryId);

  if (success) {
    refreshLearningHistory();
    refreshLearningTrends();
  } else {
    alert("Failed to delete entry. Please try again.");
  }
}

/**
 * Refresh and render learning trends
 */
function refreshLearningTrends() {
  const container = document.getElementById("trend-learning");
  if (!container) return;

  const allEntries = getEntries("learning");
  container.innerHTML = "";

  const totalEntries = allEntries ? allEntries.length : 0;

  // Calculate days with learning activity (unique dates)
  const learningDays = new Set();
  if (allEntries) {
    allEntries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateString = date.toISOString().split("T")[0];
      learningDays.add(dateString);
    });
  }

  // Calculate last 30 days activity
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentEntries = allEntries
    ? allEntries.filter((e) => e.timestamp >= thirtyDaysAgo).length
    : 0;

  const statsGrid = document.createElement("div");
  statsGrid.className = "stats-grid";

  const totalStat = createLearningStatCard("Total Sessions", totalEntries, totalEntries === 1 ? "session" : "sessions");
  const daysStat = createLearningStatCard("Days Active", learningDays.size, learningDays.size === 1 ? "day" : "days");
  const recentStat = createLearningStatCard("Last 30 Days", recentEntries, recentEntries === 1 ? "session" : "sessions");

  statsGrid.appendChild(totalStat);
  statsGrid.appendChild(daysStat);
  statsGrid.appendChild(recentStat);

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
function createLearningStatCard(label, value, unit) {
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
