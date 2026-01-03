/*
 * Application Entry Point
 * Initializes the LifeLab dashboard and orchestrates module loading
 * Handles routing, navigation, and overall application lifecycle
 */

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  initializeNavigation();
  initializeDashboard();
});

/**
 * Initialize navigation menu dynamically from config
 * Renders navigation items based on DOMAINS configuration
 */
function initializeNavigation() {
  const navElement = document.getElementById("nav");
  if (!navElement) return;

  const domains = getAllDomains();

  // Create navigation items
  domains.forEach((domain) => {
    const navItem = document.createElement("a");
    navItem.href = "#";
    navItem.className = "nav-item";
    navItem.textContent = domain.displayName;
    navItem.dataset.domainId = domain.id;

    // Add click handler for navigation
    navItem.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToDomain(domain.id);
    });

    navElement.appendChild(navItem);
  });
}

/**
 * Initialize dashboard with domain overview cards
 * Creates placeholder cards for each domain
 */
function initializeDashboard() {
  const dashboardGrid = document.getElementById("dashboard-grid");
  if (!dashboardGrid) return;

  const domains = getAllDomains();

  // Create dashboard cards for each domain
  domains.forEach((domain) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = domain.displayName;

    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent = domain.description;

    const placeholder = document.createElement("div");
    placeholder.className = "card-placeholder";
    placeholder.textContent = "No data yet";

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(placeholder);

    dashboardGrid.appendChild(card);
  });
}

/**
 * Navigate to a specific domain view
 * This is a placeholder for future domain-specific view rendering
 *
 * @param {string} domainId - The domain to navigate to
 */
function navigateToDomain(domainId) {
  console.log(`Navigation to ${domainId} - view rendering to be implemented`);

  // Update active nav state
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    if (item.dataset.domainId === domainId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Domain-specific view rendering will be implemented in Phase 3
}

/**
 * Create reusable domain view template
 * Returns a DOM element with the standard domain view structure
 * 
 * Template structure:
 * - Quick entry section (for adding new entries)
 * - Recent history section (displaying recent entries)
 * - Trend placeholder section (for future analytics/charts)
 * 
 * @param {Object} domain - Domain configuration object
 * @returns {HTMLElement} Domain view container element
 */
function createDomainViewTemplate(domain) {
  // Main container
  const container = document.createElement("div");
  container.className = "domain-view";
  container.id = `domain-${domain.id}`;

  // Domain header
  const header = document.createElement("div");
  header.className = "domain-header";

  const title = document.createElement("h2");
  title.className = "domain-title";
  title.textContent = domain.displayName;

  const description = document.createElement("p");
  description.className = "domain-description text-muted";
  description.textContent = domain.description;

  header.appendChild(title);
  header.appendChild(description);

  // Quick entry section
  const entrySection = document.createElement("section");
  entrySection.className = "domain-section";

  const entryTitle = document.createElement("h3");
  entryTitle.className = "section-title";
  entryTitle.textContent = "Quick Entry";

  const entryContent = document.createElement("div");
  entryContent.className = "quick-entry-container";
  entryContent.id = `quick-entry-${domain.id}`;
  // Placeholder - domain-specific form will go here
  entryContent.innerHTML = '<p class="text-muted text-small">Entry form will appear here</p>';

  entrySection.appendChild(entryTitle);
  entrySection.appendChild(entryContent);

  // Recent history section
  const historySection = document.createElement("section");
  historySection.className = "domain-section";

  const historyTitle = document.createElement("h3");
  historyTitle.className = "section-title";
  historyTitle.textContent = "Recent History";

  const historyContent = document.createElement("div");
  historyContent.className = "history-container";
  historyContent.id = `history-${domain.id}`;
  // Placeholder - recent entries will be rendered here
  historyContent.innerHTML = '<p class="text-muted text-small">No entries yet</p>';

  historySection.appendChild(historyTitle);
  historySection.appendChild(historyContent);

  // Trend placeholder section
  const trendSection = document.createElement("section");
  trendSection.className = "domain-section";

  const trendTitle = document.createElement("h3");
  trendTitle.className = "section-title";
  trendTitle.textContent = "Trends & Insights";

  const trendContent = document.createElement("div");
  trendContent.className = "trend-container";
  trendContent.id = `trend-${domain.id}`;
  // Placeholder - charts and analytics will go here
  const trendPlaceholder = document.createElement("div");
  trendPlaceholder.className = "card-placeholder";
  trendPlaceholder.style.height = "200px";
  trendPlaceholder.textContent = "Trends visualization coming soon";
  trendContent.appendChild(trendPlaceholder);

  trendSection.appendChild(trendTitle);
  trendSection.appendChild(trendContent);

  // Assemble the template
  container.appendChild(header);
  container.appendChild(entrySection);
  container.appendChild(historySection);
  container.appendChild(trendSection);

  return container;
}
