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
  container.innerHTML = '';

  // Create form
  const form = document.createElement('form');
  form.className = 'habit-entry-form';
  form.id = 'habit-entry-form';

  // Value input (habit name/description)
  const valueGroup = document.createElement('div');
  valueGroup.className = 'form-group';

  const valueLabel = document.createElement('label');
  valueLabel.textContent = 'Habit';
  valueLabel.htmlFor = 'habit-value';
  valueLabel.className = 'form-label';

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.id = 'habit-value';
  valueInput.name = 'value';
  valueInput.className = 'form-input';
  valueInput.placeholder = 'e.g., Morning meditation, Exercise, Read for 30 minutes';
  valueInput.required = true;

  valueGroup.appendChild(valueLabel);
  valueGroup.appendChild(valueInput);

  // Notes input (optional)
  const notesGroup = document.createElement('div');
  notesGroup.className = 'form-group';

  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'Notes (optional)';
  notesLabel.htmlFor = 'habit-notes';
  notesLabel.className = 'form-label';

  const notesInput = document.createElement('textarea');
  notesInput.id = 'habit-notes';
  notesInput.name = 'notes';
  notesInput.className = 'form-textarea';
  notesInput.placeholder = 'Add any additional details...';
  notesInput.rows = 3;

  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesInput);

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'btn btn-primary';
  submitButton.textContent = 'Log Habit';

  // Assemble form
  form.appendChild(valueGroup);
  form.appendChild(notesGroup);
  form.appendChild(submitButton);

  // Add submit handler
  form.addEventListener('submit', handleHabitSubmit);

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
    alert('Please enter a habit name');
    return;
  }

  // Create entry using shared utility
  const entry = createEntry(value, notes);

  // Save to store
  const success = saveEntry('habits', entry);

  if (success) {
    // Clear form
    form.reset();
    
    // Show success feedback
    showSuccessMessage('Habit logged successfully!');
    
    // Trigger history refresh (will be implemented in TODO 4.2)
    if (typeof refreshHabitHistory === 'function') {
      refreshHabitHistory();
    }
  } else {
    alert('Failed to save habit. Please try again.');
  }
}

/**
 * Show temporary success message
 * 
 * @param {string} message - Message to display
 */
function showSuccessMessage(message) {
  const form = document.getElementById('habit-entry-form');
  if (!form) return;

  // Remove existing message
  const existingMsg = form.querySelector('.success-message');
  if (existingMsg) {
    existingMsg.remove();
  }

  // Create message element
  const msgElement = document.createElement('div');
  msgElement.className = 'success-message';
  msgElement.textContent = message;

  // Insert after form
  form.parentNode.insertBefore(msgElement, form.nextSibling);

  // Remove after 3 seconds
  setTimeout(() => {
    msgElement.remove();
  }, 3000);
}
