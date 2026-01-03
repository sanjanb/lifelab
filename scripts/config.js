/*
 * Application Configuration
 * Contains global settings, API endpoints, feature flags
 * Environment-specific configurations
 * Module registration and initialization settings
 */

/**
 * LifeLab Domain Configuration
 * 
 * This is the central registry for all life domains in the application.
 * To add a new domain:
 * 1. Add a new object to the DOMAINS array below
 * 2. Create the corresponding module folder in /modules/
 * 3. The domain will automatically appear in navigation and storage
 * 
 * Each domain must have:
 * - id: unique identifier (lowercase, no spaces)
 * - displayName: user-facing name
 * - description: brief explanation of the domain
 * - storageKey: localStorage key for this domain's data
 */

const DOMAINS = [
    {
        id: 'habits',
        displayName: 'Habits',
        description: 'Track daily habits and build streaks',
        storageKey: 'lifelab_habits'
    },
    {
        id: 'learning',
        displayName: 'Learning',
        description: 'Manage learning goals, courses, and skill development',
        storageKey: 'lifelab_learning'
    },
    {
        id: 'career',
        displayName: 'Career',
        description: 'Track career goals, projects, and professional growth',
        storageKey: 'lifelab_career'
    },
    {
        id: 'health',
        displayName: 'Health',
        description: 'Monitor fitness, nutrition, and wellness metrics',
        storageKey: 'lifelab_health'
    }
];

/**
 * Get domain configuration by ID
 * @param {string} domainId - The domain identifier
 * @returns {Object|null} Domain configuration or null if not found
 */
function getDomainById(domainId) {
    return DOMAINS.find(domain => domain.id === domainId) || null;
}

/**
 * Get all configured domains
 * @returns {Array} Array of all domain configurations
 */
function getAllDomains() {
    return DOMAINS;
}

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOMAINS, getDomainById, getAllDomains };
}
