/**
 * Authentication Philosophy
 *
 * WHY AUTHENTICATION EXISTS IN LIFELAB
 * =====================================
 *
 * Authentication serves ONE purpose: identity continuity.
 * It exists to preserve your private data across devices and time.
 *
 * WHAT AUTH IS FOR:
 * -----------------
 * • Preserve data across devices
 * • Keep data private and personal
 * • Maintain continuity over time
 * • Enable safe data ownership
 *
 * WHAT AUTH IS NOT FOR:
 * ---------------------
 * ✗ No social features
 * ✗ No follower concepts
 * ✗ No gamification
 * ✗ No public profiles
 * ✗ No cross-user visibility
 * ✗ No analytics tied to identity
 * ✗ No account-as-product thinking
 *
 * CORE PRINCIPLES:
 * ----------------
 * 1. One user = one private data space
 * 2. No cross-user visibility ever
 * 3. No analytics tied to identity
 * 4. Auth should feel like opening a notebook, not joining a platform
 * 5. Identity exists to protect thought — nothing more
 *
 * IMPLEMENTATION RULES:
 * --------------------
 * • All user data is nested under their UID
 * • Users can only read/write their own data
 * • No shared collections for user-generated content
 * • Features degrade gracefully without auth (local storage fallback)
 * • No marketing copy, no upsells, no "benefits" language in UI
 * • Account management is invisible unless needed
 *
 * @see docs/AUTHENTICATION.md for full implementation phases
 */

export const AUTH_PHILOSOPHY = {
  PURPOSE: "Identity continuity for data preservation and privacy",

  GOALS: [
    "Preserve data across devices",
    "Keep data private",
    "Maintain continuity over time",
  ],

  NON_GOALS: [
    "Social features",
    "Follower concepts",
    "Gamification",
    "Public profiles",
    "Cross-user visibility",
    "Analytics tied to identity",
  ],

  PRINCIPLES: {
    ONE_USER_ONE_SPACE: "One user = one private data space",
    NO_CROSS_USER_ACCESS: "No cross-user visibility",
    NO_IDENTITY_ANALYTICS: "No analytics tied to identity",
    CALM_UX: "Auth feels like opening a notebook, not joining a platform",
    THOUGHT_PROTECTION: "Identity exists to protect thought — nothing more",
  },
};

/**
 * Validate that a feature respects auth philosophy
 * @param {Object} feature - Feature description
 * @returns {boolean} Whether feature aligns with philosophy
 */
export function validateAuthFeature(feature) {
  const violations = [];

  // Check for social features
  if (feature.isSocial || feature.hasFollowers || feature.isPublic) {
    violations.push("Social features are not allowed");
  }

  // Check for gamification
  if (
    feature.hasLeaderboard ||
    feature.hasCompetition ||
    feature.hasAchievements
  ) {
    violations.push("Gamification is not allowed");
  }

  // Check for cross-user access
  if (feature.allowsCrossUserRead || feature.allowsCrossUserWrite) {
    violations.push("Cross-user data access is not allowed");
  }

  // Check for identity analytics
  if (feature.tracksIdentity || feature.profilesUsers) {
    violations.push("Identity-based analytics are not allowed");
  }

  if (violations.length > 0) {
    console.error("Auth Philosophy Violations:", violations);
    return false;
  }

  return true;
}
