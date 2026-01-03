/**
 * Monthly Notebook Data Structure
 *
 * DESIGN DECISIONS:
 *
 * 1. Monthly notebooks are self-contained units representing one calendar month.
 *    Each notebook can be exported/imported independently.
 *
 * 2. Days array is always full-length (28-31 entries) to match the actual calendar.
 *    This preserves temporal context even if some days have no data.
 *
 * 3. domainSignals uses boolean presence only (not counts, not scores).
 *    This keeps the data structure stable regardless of how many entries
 *    a domain had on that day. Presence = true means "something happened in this domain."
 *
 * 4. manualOutcome is ALWAYS optional and user-controlled.
 *    The system NEVER auto-fills this field. It represents human judgment only.
 *    Values: "win" | "neutral" | "loss" | null
 *
 * 5. reflectionNote is free-form text, also optional.
 *    This is for human sense-making, not machine analysis.
 *
 * 6. NO COMPUTED FIELDS are stored in the structure.
 *    Analytics are derived on-demand, never persisted.
 *
 * 7. ISO date strings ensure timezone-independent storage.
 *    Format: "YYYY-MM-DD"
 *
 * 8. Structure is flat and JSON-serializable for GitHub backup.
 */

/**
 * Create a new monthly notebook for a given year and month
 *
 * @param {number} year - Four-digit year (e.g., 2026)
 * @param {number} month - Month number 1-12 (1 = January)
 * @returns {Object} Monthly notebook structure
 */
function createMonthlyNotebook(year, month) {
  // Validate inputs
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("Invalid year. Must be between 1900 and 2100.");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid month. Must be between 1 and 12.");
  }

  // Calculate number of days in this month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Create array of day entries
  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(createDayEntry(year, month, day));
  }

  return {
    year,
    month,
    days,
    // Metadata for future-proofing
    _created: new Date().toISOString(),
    _version: "1.0",
  };
}

/**
 * Create a day entry structure
 *
 * @param {number} year - Four-digit year
 * @param {number} month - Month number 1-12
 * @param {number} day - Day of month
 * @returns {Object} Day entry structure
 */
function createDayEntry(year, month, day) {
  // Create ISO date string (YYYY-MM-DD)
  const date = new Date(year, month - 1, day);
  const isoDate = date.toISOString().split("T")[0];

  return {
    date: isoDate,

    // Domain presence tracking
    // Example: { "habits": true, "learning": true, "career": false, "health": true }
    // Boolean only - presence, not quantity
    domainSignals: {},

    // Manual human judgment (NEVER auto-filled)
    // Allowed values: "win" | "neutral" | "loss" | null
    manualOutcome: null,

    // Free-form reflection text
    reflectionNote: "",
  };
}

/**
 * Validate a monthly notebook structure
 *
 * @param {Object} notebook - Notebook to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
function validateMonthlyNotebook(notebook) {
  if (!notebook || typeof notebook !== "object") {
    throw new Error("Notebook must be an object");
  }

  if (
    !Number.isInteger(notebook.year) ||
    notebook.year < 1900 ||
    notebook.year > 2100
  ) {
    throw new Error("Invalid year in notebook");
  }

  if (
    !Number.isInteger(notebook.month) ||
    notebook.month < 1 ||
    notebook.month > 12
  ) {
    throw new Error("Invalid month in notebook");
  }

  if (!Array.isArray(notebook.days)) {
    throw new Error("Days must be an array");
  }

  const expectedDays = new Date(notebook.year, notebook.month, 0).getDate();
  if (notebook.days.length !== expectedDays) {
    throw new Error(
      `Expected ${expectedDays} days for ${notebook.year}-${notebook.month}`
    );
  }

  // Validate each day
  notebook.days.forEach((day, index) => {
    validateDayEntry(day, index + 1);
  });

  return true;
}

/**
 * Validate a day entry structure
 *
 * @param {Object} day - Day entry to validate
 * @param {number} dayNum - Day number for error messages
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
function validateDayEntry(day, dayNum) {
  if (!day || typeof day !== "object") {
    throw new Error(`Day ${dayNum} must be an object`);
  }

  if (typeof day.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
    throw new Error(`Day ${dayNum} has invalid ISO date format`);
  }

  if (
    typeof day.domainSignals !== "object" ||
    Array.isArray(day.domainSignals)
  ) {
    throw new Error(`Day ${dayNum} domainSignals must be an object`);
  }

  // Validate domainSignals contains only booleans
  for (const [domainId, value] of Object.entries(day.domainSignals)) {
    if (typeof value !== "boolean") {
      throw new Error(
        `Day ${dayNum} domainSignals['${domainId}'] must be boolean`
      );
    }
  }

  // Validate manualOutcome if present
  if (
    day.manualOutcome !== null &&
    !["win", "neutral", "loss"].includes(day.manualOutcome)
  ) {
    throw new Error(
      `Day ${dayNum} manualOutcome must be "win", "neutral", "loss", or null`
    );
  }

  if (
    day.reflectionNote !== undefined &&
    typeof day.reflectionNote !== "string"
  ) {
    throw new Error(`Day ${dayNum} reflectionNote must be a string`);
  }

  return true;
}

/**
 * Get a specific day from a monthly notebook
 *
 * @param {Object} notebook - Monthly notebook
 * @param {number} dayNum - Day number (1-31)
 * @returns {Object|null} Day entry or null if not found
 */
function getDay(notebook, dayNum) {
  if (dayNum < 1 || dayNum > notebook.days.length) {
    return null;
  }
  return notebook.days[dayNum - 1];
}

/**
 * Update a day's domain signals
 *
 * @param {Object} notebook - Monthly notebook
 * @param {number} dayNum - Day number (1-31)
 * @param {string} domainId - Domain identifier
 * @param {boolean} isPresent - Whether domain had activity
 * @returns {Object} Updated notebook
 */
function updateDomainSignal(notebook, dayNum, domainId, isPresent) {
  const day = getDay(notebook, dayNum);
  if (!day) {
    throw new Error(`Day ${dayNum} not found in notebook`);
  }

  day.domainSignals[domainId] = isPresent;
  return notebook;
}

/**
 * Update a day's manual outcome (user judgment)
 *
 * @param {Object} notebook - Monthly notebook
 * @param {number} dayNum - Day number (1-31)
 * @param {string|null} outcome - "win", "neutral", "loss", or null
 * @returns {Object} Updated notebook
 */
function updateManualOutcome(notebook, dayNum, outcome) {
  if (outcome !== null && !["win", "neutral", "loss"].includes(outcome)) {
    throw new Error('Outcome must be "win", "neutral", "loss", or null');
  }

  const day = getDay(notebook, dayNum);
  if (!day) {
    throw new Error(`Day ${dayNum} not found in notebook`);
  }

  day.manualOutcome = outcome;
  return notebook;
}

/**
 * Update a day's reflection note
 *
 * @param {Object} notebook - Monthly notebook
 * @param {number} dayNum - Day number (1-31)
 * @param {string} note - Reflection text
 * @returns {Object} Updated notebook
 */
function updateReflectionNote(notebook, dayNum, note) {
  const day = getDay(notebook, dayNum);
  if (!day) {
    throw new Error(`Day ${dayNum} not found in notebook`);
  }

  day.reflectionNote = note || "";
  return notebook;
}
