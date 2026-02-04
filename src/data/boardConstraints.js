/**
 * Visualization Board Constraints
 * 
 * These constants define the philosophical boundaries of the Visualization Board.
 * They exist to prevent feature drift toward productivity/performance tools.
 * 
 * @see docs/VISUALIZATION_BOARD_PHILOSOPHY.md
 */

/**
 * Core philosophical constraints for the Visualization Board
 * These should NEVER be violated in any implementation
 */
export const BOARD_CONSTRAINTS = Object.freeze({
  //禁止的功能 (Forbidden Features)
  NO_GOALS: true,
  NO_METRICS: true,
  NO_PROGRESS_TRACKING: true,
  NO_STREAKS: true,
  NO_AUTO_GENERATED_CONTENT: true,
  NO_PERFORMANCE_LANGUAGE: true,
  NO_NOTIFICATIONS: true,
  NO_GAMIFICATION: true,
  
  // 要求的行为 (Required Behaviors)
  MANUAL_EDITS_ONLY: true,
  EXPLICIT_USER_ACTION_REQUIRED: true,
  CALM_INTERACTIONS: true,
  RESPECT_USER_PACE: true,
});

/**
 * Allowed card types for the Visualization Board
 * Limited set to maintain simplicity
 */
export const CARD_TYPES = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  COLOR: 'color',
});

/**
 * Visual design constraints
 */
export const VISUAL_CONSTRAINTS = Object.freeze({
  // No bright, attention-grabbing colors
  NEUTRAL_PALETTE: true,
  
  // No urgency cues
  NO_ALERT_COLORS: true,
  
  // No animation that creates pressure
  CALM_ANIMATIONS: true,
  
  // Generous whitespace
  SPACIOUS_LAYOUT: true,
});

/**
 * Interaction constraints
 */
export const INTERACTION_CONSTRAINTS = Object.freeze({
  // No quick-add shortcuts
  DELIBERATE_ACTIONS_ONLY: true,
  
  // Confirm before permanent changes
  CONFIRM_DELETIONS: true,
  
  // No forced alignment
  FREE_FORM_POSITIONING: true,
  
  // No auto-save loops
  EXPLICIT_SAVE: false, // Save on action, not continuously
});

/**
 * Data constraints
 */
export const DATA_CONSTRAINTS = Object.freeze({
  // No analytics on user behavior
  NO_TIMESTAMP_ANALYSIS: true,
  NO_EDIT_HISTORY_ANALYTICS: true,
  NO_USAGE_PATTERNS: true,
  
  // No comparison features
  NO_COMPARISON: true,
  
  // No smart suggestions
  NO_AI_SUGGESTIONS: true,
});

/**
 * Forbidden UI elements
 * Reject these patterns in code reviews
 */
export const FORBIDDEN_UI_PATTERNS = Object.freeze([
  'progress-bar',
  'completion-percentage',
  'streak-counter',
  'achievement-badge',
  'suggested-action',
  'smart-template',
  'usage-stats',
  'card-count',
  'activity-graph',
  'reminder-notification',
  'urgency-indicator',
  'comparison-chart',
]);

/**
 * Forbidden language patterns
 * Avoid these in UI text and documentation
 */
export const FORBIDDEN_LANGUAGE = Object.freeze([
  'achieve',
  'goal',
  'target',
  'improve',
  'optimize',
  'progress',
  'grow',
  'complete',
  'finish',
  'win',
  'success',
  'performance',
  'productivity',
  'streak',
  'consistency',
]);

/**
 * Allowed language patterns
 * Use these instead
 */
export const ALLOWED_LANGUAGE = Object.freeze([
  'notice',
  'reflect',
  'arrange',
  'consider',
  'explore',
  'observe',
  'acknowledge',
  'place',
  'compose',
  'think',
]);

/**
 * Validation helper: Check if a feature violates constraints
 * @param {Object} feature - Feature description
 * @returns {Object} Validation result with violations
 */
export function validateFeature(feature) {
  const violations = [];
  
  if (feature.hasMetrics) {
    violations.push('Violates NO_METRICS constraint');
  }
  
  if (feature.hasGoals) {
    violations.push('Violates NO_GOALS constraint');
  }
  
  if (feature.tracksProgress) {
    violations.push('Violates NO_PROGRESS_TRACKING constraint');
  }
  
  if (feature.hasStreaks) {
    violations.push('Violates NO_STREAKS constraint');
  }
  
  if (feature.autoGeneratesContent) {
    violations.push('Violates NO_AUTO_GENERATED_CONTENT constraint');
  }
  
  if (feature.hasNotifications) {
    violations.push('Violates NO_NOTIFICATIONS constraint');
  }
  
  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Validation helper: Check if UI text violates language constraints
 * @param {string} text - UI text to validate
 * @returns {Object} Validation result
 */
export function validateUIText(text) {
  const lowerText = text.toLowerCase();
  const foundForbidden = FORBIDDEN_LANGUAGE.filter(word => 
    lowerText.includes(word)
  );
  
  return {
    isValid: foundForbidden.length === 0,
    violations: foundForbidden.map(word => 
      `Contains forbidden word: "${word}"`
    ),
  };
}

/**
 * Export all constraints as a single object for reference
 */
export const ALL_CONSTRAINTS = Object.freeze({
  board: BOARD_CONSTRAINTS,
  visual: VISUAL_CONSTRAINTS,
  interaction: INTERACTION_CONSTRAINTS,
  data: DATA_CONSTRAINTS,
  forbiddenUI: FORBIDDEN_UI_PATTERNS,
  forbiddenLanguage: FORBIDDEN_LANGUAGE,
  allowedLanguage: ALLOWED_LANGUAGE,
});
