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
