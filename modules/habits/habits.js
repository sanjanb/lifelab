/*
 * Habits Module - Main Logic
 * Manages habit tracking functionality
 * Handles habit creation, completion tracking, streaks, and statistics
 */

/**
 * Initialize the Habits module
 * Sets up the quick entry form and loads existing entries
 *
 * @param {string} containerId - The ID of the container element for quick entry
 */
function initializeHabitsModule(containerId) {
  renderQuickEntryForm(containerId);
  refreshHabitHistory();
  refreshHabitTrends();
}

/**
 * Render the quick entry form for habits
 * Creates form elements for adding new habit entries
 *
 * @param {string} containerId - The ID of the container element
 */
function renderQuickEntryForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing content
  container.innerHTML = "";

  // Create form
  const form = document.createElement("form");
  form.className = "habit-entry-form";
  form.id = "habit-entry-form";

  // Value input (habit name/description)
  const valueGroup = document.createElement("div");
  valueGroup.className = "form-group";

  const valueLabel = document.createElement("label");
  valueLabel.textContent = "Habit";
  valueLabel.htmlFor = "habit-value";
  valueLabel.className = "form-label";

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.id = "habit-value";
  valueInput.name = "value";
  valueInput.className = "form-input";
  valueInput.placeholder =
    "e.g., Morning meditation, Exercise, Read for 30 minutes";
  valueInput.required = true;

  valueGroup.appendChild(valueLabel);
  valueGroup.appendChild(valueInput);

  // Notes input (optional)
  const notesGroup = document.createElement("div");
  notesGroup.className = "form-group";

  const notesLabel = document.createElement("label");
  notesLabel.textContent = "Notes (optional)";
  notesLabel.htmlFor = "habit-notes";
  notesLabel.className = "form-label";

  const notesInput = document.createElement("textarea");
  notesInput.id = "habit-notes";
  notesInput.name = "notes";
  notesInput.className = "form-textarea";
  notesInput.placeholder = "Add any additional details...";
  notesInput.rows = 3;

  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesInput);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn btn-primary";
  submitButton.textContent = "Log Habit";

  // Assemble form
  form.appendChild(valueGroup);
  form.appendChild(notesGroup);
  form.appendChild(submitButton);

  // Add submit handler
  form.addEventListener("submit", handleHabitSubmit);

  container.appendChild(form);
}

/**
 * Handle habit entry form submission
 * Creates and saves a new habit entry using shared utilities
 *
 * @param {Event} event - Form submit event
 */
function handleHabitSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const value = form.value.value.trim();
  const notes = form.notes.value.trim();

  if (!value) {
    alert("Please enter a habit name");
    return;
  }

  // Create entry using shared utility
  const entry = createEntry(value, notes);

  // Save to store
  const success = saveEntry("habits", entry);

  if (success) {
    // Clear form
    form.reset();

    // Show success feedback
    showSuccessMessage("Habit logged successfully!");

    // Trigger history refresh (will be implemented in TODO 4.2)
    if (typeof refreshHabitHistory === "function") {
      refreshHabitHistory();
    }
    
    // Update trends display
    if (typeof refreshHabitTrends === "function") {
      refreshHabitTrends();
    }
  } else {
    alert("Failed to save habit. Please try again.");
  }
}

/**
 * Show temporary success message
 *
 * @param {string} message - Message to display
 */
function showSuccessMessage(message) {
  const form = document.getElementById("habit-entry-form");
  if (!form) return;

  // Remove existing message
  const existingMsg = form.querySelector(".success-message");
  if (existingMsg) {
    existingMsg.remove();
  }

  // Create message element
  const msgElement = document.createElement("div");
  msgElement.className = "success-message";
  msgElement.textContent = message;

  // Insert after form
  form.parentNode.insertBefore(msgElement, form.nextSibling);

  // Remove after 3 seconds
  setTimeout(() => {
    msgElement.remove();
  }, 3000);
}

/**
 * Refresh and render habit history
 * Displays the most recent habit entries (up to 14)
 */
function refreshHabitHistory() {
  const container = document.getElementById("history-habits");
  if (!container) return;

  // Get all entries from storage
  const allEntries = getEntries("habits");

  if (!allEntries || allEntries.length === 0) {
    container.innerHTML = '<p class="text-muted text-small">No entries yet</p>';
    return;
  }

  // Sort by timestamp (newest first) and take last 14
  const recentEntries = allEntries
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 14);

  // Clear container
  container.innerHTML = "";

  // Create entry list
  const entryList = document.createElement("div");
  entryList.className = "entry-list";

  recentEntries.forEach((entry) => {
    const entryItem = createEntryItem(entry);
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
function createEntryItem(entry) {
  const item = document.createElement("div");
  item.className = "entry-item";
  item.dataset.entryId = entry.id;

  // Entry content section
  const content = document.createElement("div");
  content.className = "entry-content";

  // Entry value (habit name)
  const valueElement = document.createElement("div");
  valueElement.className = "entry-value";
  valueElement.textContent = entry.value;

  // Entry metadata (timestamp)
  const metaElement = document.createElement("div");
  metaElement.className = "entry-meta text-muted text-small";
  metaElement.textContent = formatDateTime(entry.timestamp);

  content.appendChild(valueElement);
  content.appendChild(metaElement);

  // Entry notes (if present)
  if (entry.notes) {
    const notesElement = document.createElement("div");
    notesElement.className = "entry-notes text-small";
    notesElement.textContent = entry.notes;
    content.appendChild(notesElement);
  }

  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "btn-delete";
  deleteButton.textContent = "Delete";
  deleteButton.title = "Delete this entry";
  deleteButton.addEventListener("click", () => handleDeleteEntry(entry.id));

  // Assemble item
  item.appendChild(content);
  item.appendChild(deleteButton);

  return item;
}

/**
 * Handle deletion of a habit entry
 *
 * @param {string} entryId - The ID of the entry to delete
 */
function handleDeleteEntry(entryId) {
  if (!confirm("Are you sure you want to delete this entry?")) {
    return;
  }

  const success = deleteEntry("habits", entryId);

  if (success) {
    // Refresh history to update UI
    refreshHabitHistory();
    refreshHabitTrends();
  } else {
    alert("Failed to delete entry. Please try again.");
  }
}

/**
 * Calculate current streak
 * Counts consecutive calendar days with at least one entry, working backwards from today
 * Generic implementation - does not assume specific frequency
 *
 * @param {Array} entries - Array of entry objects
 * @returns {number} Current streak count (in days)
 */
function calculateCurrentStreak(entries) {
  if (!entries || entries.length === 0) {
    return 0;
  }

  // Get unique dates with entries (YYYY-MM-DD format)
  const entryDates = new Set();
  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dateString = date.toISOString().split("T")[0];
    entryDates.add(dateString);
  });

  // Start from today and count backwards
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dateString = currentDate.toISOString().split("T")[0];

    if (entryDates.has(dateString)) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      // Allow grace period: if no entry today, check yesterday
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterdayString = currentDate.toISOString().split("T")[0];
      if (entryDates.has(yesterdayString)) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      // Streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak ever
 * Finds the longest consecutive sequence of calendar days with entries
 *
 * @param {Array} entries - Array of entry objects
 * @returns {number} Longest streak count (in days)
 */
function calculateLongestStreak(entries) {
  if (!entries || entries.length === 0) {
    return 0;
  }

  // Get unique dates with entries (YYYY-MM-DD format) and sort them
  const entryDates = new Set();
  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dateString = date.toISOString().split("T")[0];
    entryDates.add(dateString);
  });

  const sortedDates = Array.from(entryDates).sort();

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);

    // Calculate difference in days
    const diffTime = currDate - prevDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
    } else {
      // Streak broken, check if it was the longest
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  // Check final streak
  longestStreak = Math.max(longestStreak, currentStreak);

  return longestStreak;
}

/**
 * Calculate total number of entries
 *
 * @param {Array} entries - Array of entry objects
 * @returns {number} Total entry count
 */
function calculateTotalEntries(entries) {
  return entries ? entries.length : 0;
}
