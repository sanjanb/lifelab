/**
 * LifeLab Domain Configuration
 * Framework-agnostic configuration for all life domains
 * 
 * MIGRATION NOTE: This is a direct port from the original config.js
 * No changes to structure or behavior - conversion only
 */

export interface AnalysisTraits {
  expectsContinuity: boolean;
  naturallyCyclical: boolean;
  isEnergySensitive: boolean;
}

export interface Domain {
  id: string;
  displayName: string;
  description: string;
  storageKey: string;
  analysistraits: AnalysisTraits;
}

export const DOMAINS: Domain[] = [
  {
    id: "habits",
    displayName: "Habits",
    description: "Track daily habits and build streaks",
    storageKey: "lifelab_habits",
    analysistraits: {
      expectsContinuity: true,
      naturallyCyclical: false,
      isEnergySensitive: false,
    },
  },
  {
    id: "learning",
    displayName: "Learning",
    description: "Manage learning goals, courses, and skill development",
    storageKey: "lifelab_learning",
    analysistraits: {
      expectsContinuity: false,
      naturallyCyclical: false,
      isEnergySensitive: true,
    },
  },
  {
    id: "career",
    displayName: "Career",
    description: "Track career goals, projects, and professional growth",
    storageKey: "lifelab_career",
    analysistraits: {
      expectsContinuity: false,
      naturallyCyclical: true,
      isEnergySensitive: true,
    },
  },
  {
    id: "health",
    displayName: "Health",
    description: "Monitor fitness, nutrition, and wellness metrics",
    storageKey: "lifelab_health",
    analysistraits: {
      expectsContinuity: true,
      naturallyCyclical: false,
      isEnergySensitive: false,
    },
  },
];

/**
 * Get domain configuration by ID
 */
export function getDomainById(domainId: string): Domain | null {
  return DOMAINS.find((domain) => domain.id === domainId) || null;
}

/**
 * Get all configured domains
 */
export function getAllDomains(): Domain[] {
  return DOMAINS;
}

/**
 * Get storage key for a domain
 */
export function getStorageKey(domainId: string): string | null {
  const domain = getDomainById(domainId);
  return domain ? domain.storageKey : null;
}
