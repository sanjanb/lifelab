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
  initializeHeaderNavigation();
});

/**
 * Initialize header navigation
 * Clicking the header title returns to dashboard
 */
function initializeHeaderNavigation() {
  const headerTitle = document.getElementById("header-title");
  if (headerTitle) {
    headerTitle.addEventListener("click", () => {
      navigateToDashboard();
    });
  }
}

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

  // Add Timeline navigation item
  const timelineItem = document.createElement("a");
  timelineItem.href = "#";
  timelineItem.className = "nav-item nav-item-special";
  timelineItem.textContent = "Timeline";
  timelineItem.dataset.view = "timeline";

  timelineItem.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToTimeline();
  });

  navElement.appendChild(timelineItem);

  // Add Monthly Notebook navigation item
  const notebookItem = document.createElement("a");
  notebookItem.href = "#";
  notebookItem.className = "nav-item nav-item-special";
  notebookItem.textContent = "Notebook";
  notebookItem.dataset.view = "notebook";

  notebookItem.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToNotebook();
  });

  navElement.appendChild(notebookItem);
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
    card.style.cursor = "pointer";

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

    // Get monthly summary for this domain
    const summary = generateMonthlySummary(domain.id);
    const summaryElement = createDashboardSummaryElement(summary);
    card.appendChild(summaryElement);

    // Add click handler to navigate to domain
    card.addEventListener("click", () => {
      navigateToDomain(domain.id);
    });

    dashboardGrid.appendChild(card);
  });
}

/**
 * Generate monthly summary for a domain
 * Calculates statistics for the current month
 *
 * @param {string} domainId - The domain identifier
 * @returns {Object} Summary statistics
 */
function generateMonthlySummary(domainId) {
  const entries = getEntries(domainId);

  if (!entries || entries.length === 0) {
    return {
      hasData: false,
      totalEntries: 0,
      currentMonth: 0,
      uniqueDays: 0,
    };
  }

  // Get current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  // Filter entries for current month
  const monthEntries = entries.filter(
    (e) =>
      e.timestamp >= monthStart.getTime() && e.timestamp <= monthEnd.getTime()
  );

  // Calculate unique days in current month
  const uniqueDays = new Set();
  monthEntries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dateString = date.toISOString().split("T")[0];
    uniqueDays.add(dateString);
  });

  return {
    hasData: true,
    totalEntries: entries.length,
    currentMonth: monthEntries.length,
    uniqueDays: uniqueDays.size,
    monthName: monthStart.toLocaleDateString("en-US", { month: "long" }),
  };
}

/**
 * Create dashboard summary element
 *
 * @param {Object} summary - Summary statistics
 * @returns {HTMLElement} Summary element
 */
function createDashboardSummaryElement(summary) {
  const container = document.createElement("div");
  container.className = "dashboard-summary";

  if (!summary.hasData) {
    container.innerHTML = '<p class="text-muted text-small">No data yet</p>';
    return container;
  }

  const monthStat = document.createElement("div");
  monthStat.className = "summary-stat";

  const monthValue = document.createElement("span");
  monthValue.className = "summary-value";
  monthValue.textContent = summary.currentMonth;

  const monthLabel = document.createElement("span");
  monthLabel.className = "summary-label text-muted";
  monthLabel.textContent = ` ${
    summary.currentMonth === 1 ? "entry" : "entries"
  } this month`;

  monthStat.appendChild(monthValue);
  monthStat.appendChild(monthLabel);

  const dayStat = document.createElement("div");
  dayStat.className = "summary-stat text-small text-muted";
  dayStat.textContent = `${summary.uniqueDays} ${
    summary.uniqueDays === 1 ? "day" : "days"
  } active`;

  container.appendChild(monthStat);
  container.appendChild(dayStat);

  return container;
}

/**
 * Navigate to a specific domain view
 * Renders domain view dynamically without page reload
 *
 * @param {string} domainId - The domain to navigate to
 */
function navigateToDomain(domainId) {
  const domain = getDomainById(domainId);
  if (!domain) {
    console.error(`Domain not found: ${domainId}`);
    return;
  }

  // Update active nav state
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    if (item.dataset.domainId === domainId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Get main content area
  const mainElement = document.getElementById("main");
  if (!mainElement) return;

  // Hide dashboard, show domain view
  const dashboard = mainElement.querySelector(".dashboard");
  if (dashboard) {
    dashboard.style.display = "none";
  }

  // Check if domain view already exists
  let domainView = document.getElementById(`domain-${domainId}`);

  if (!domainView) {
    // Create new domain view using template
    domainView = createDomainViewTemplate(domain);
    mainElement.appendChild(domainView);

    // Initialize domain-specific module
    initializeDomainModule(domainId);
  }

  // Hide all domain views
  const allDomainViews = document.querySelectorAll(".domain-view");
  allDomainViews.forEach((view) => {
    view.style.display = "none";
  });

  // Show current domain view
  domainView.style.display = "block";
}

/**
 * Navigate back to dashboard
 * Shows dashboard and hides all domain views
 */
function navigateToDashboard() {
  // Clear active nav state
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Get main content area
  const mainElement = document.getElementById("main");
  if (!mainElement) return;

  // Show dashboard
  const dashboard = mainElement.querySelector(".dashboard");
  if (dashboard) {
    dashboard.style.display = "block";
  }

  // Hide all domain views
  const allDomainViews = document.querySelectorAll(".domain-view");
  allDomainViews.forEach((view) => {
    view.style.display = "none";
  });

  // Hide timeline view
  const timelineView = document.getElementById("timeline-view");
  if (timelineView) {
    timelineView.style.display = "none";
  }

  // Hide notebook view
  const notebookView = document.getElementById("notebook-view");
  if (notebookView) {
    notebookView.style.display = "none";
  }
}

/**
 * Navigate to monthly notebook view
 * Shows current month's notebook
 */
function navigateToNotebook() {
  // Update active nav state
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    if (item.dataset.view === "notebook") {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Get main content area
  const mainElement = document.getElementById("main");
  if (!mainElement) return;

  // Hide dashboard
  const dashboard = mainElement.querySelector(".dashboard");
  if (dashboard) {
    dashboard.style.display = "none";
  }

  // Hide all domain views
  const allDomainViews = document.querySelectorAll(".domain-view");
  allDomainViews.forEach((view) => {
    view.style.display = "none";
  });

  // Hide timeline view
  const timelineView = document.getElementById("timeline-view");
  if (timelineView) {
    timelineView.style.display = "none";
  }

  // Check if notebook view already exists
  let notebookView = document.getElementById("notebook-view");

  if (!notebookView) {
    // Create notebook view container
    notebookView = document.createElement("div");
    notebookView.id = "notebook-view";
    mainElement.appendChild(notebookView);
  }

  // Show notebook view
  notebookView.style.display = "block";

  // Initialize notebook for current month
  initializeMonthlyNotebook();
}

/**
 * Navigate to timeline view
 * Shows timeline with entries from all domains
 */
function navigateToTimeline() {
  // Update active nav state
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    if (item.dataset.view === "timeline") {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Get main content area
  const mainElement = document.getElementById("main");
  if (!mainElement) return;

  // Hide dashboard
  const dashboard = mainElement.querySelector(".dashboard");
  if (dashboard) {
    dashboard.style.display = "none";
  }

  // Hide all domain views
  const allDomainViews = document.querySelectorAll(".domain-view");
  allDomainViews.forEach((view) => {
    view.style.display = "none";
  });

  // Hide notebook view
  const notebookView = document.getElementById("notebook-view");
  if (notebookView) {
    notebookView.style.display = "none";
  }

  // Check if timeline view already exists
  let timelineView = document.getElementById("timeline-view");

  if (!timelineView) {
    // Create timeline view
    timelineView = createTimelineView();
    mainElement.appendChild(timelineView);
  }

  // Refresh timeline content
  refreshTimelineView();

  // Show timeline view
  timelineView.style.display = "block";
}

/**
 * Create timeline view container
 * @returns {HTMLElement} Timeline view element
 */
function createTimelineView() {
  const container = document.createElement("div");
  container.className = "timeline-view";
  container.id = "timeline-view";

  const header = document.createElement("div");
  header.className = "domain-header";

  const title = document.createElement("h2");
  title.className = "domain-title";
  title.textContent = "Timeline";

  const description = document.createElement("p");
  description.className = "domain-description text-muted";
  description.textContent = "All activities across all domains";

  header.appendChild(title);
  header.appendChild(description);

  const content = document.createElement("div");
  content.className = "timeline-container";
  content.id = "timeline-container";

  container.appendChild(header);
  container.appendChild(content);

  return container;
}

/**
 * Refresh timeline view with all entries from all domains
 */
function refreshTimelineView() {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const domains = getAllDomains();
  const allEntries = [];

  // Collect entries from all domains
  domains.forEach((domain) => {
    const entries = getEntries(domain.id);
    if (entries && entries.length > 0) {
      entries.forEach((entry) => {
        allEntries.push({
          ...entry,
          domainId: domain.id,
          domainName: domain.displayName,
        });
      });
    }
  });

  if (allEntries.length === 0) {
    container.innerHTML =
      '<p class="text-muted text-small">No entries yet. Start logging activities in any domain!</p>';
    return;
  }

  // Sort by timestamp (newest first)
  allEntries.sort((a, b) => b.timestamp - a.timestamp);

  // Clear container
  container.innerHTML = "";

  // Create timeline list
  const timelineList = document.createElement("div");
  timelineList.className = "timeline-list";

  allEntries.forEach((entry) => {
    const timelineItem = createTimelineItem(entry);
    timelineList.appendChild(timelineItem);
  });

  container.appendChild(timelineList);
}

/**
 * Create a timeline item element
 * @param {Object} entry - Entry object with domainId and domainName
 * @returns {HTMLElement} Timeline item element
 */
function createTimelineItem(entry) {
  const item = document.createElement("div");
  item.className = "timeline-item";

  const content = document.createElement("div");
  content.className = "timeline-content";

  // Domain tag
  const domainTag = document.createElement("span");
  domainTag.className = "timeline-domain-tag";
  domainTag.textContent = entry.domainName;

  // Entry value
  const valueElement = document.createElement("div");
  valueElement.className = "timeline-value";
  valueElement.textContent = entry.value;

  // Entry metadata (timestamp)
  const metaElement = document.createElement("div");
  metaElement.className = "timeline-meta text-muted text-small";
  metaElement.textContent = formatDateTime(entry.timestamp);

  content.appendChild(domainTag);
  content.appendChild(valueElement);
  content.appendChild(metaElement);

  // Entry notes (if present)
  if (entry.notes) {
    const notesElement = document.createElement("div");
    notesElement.className = "timeline-notes text-small";
    notesElement.textContent = entry.notes;
    content.appendChild(notesElement);
  }

  item.appendChild(content);

  return item;
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
  entryContent.innerHTML =
    '<p class="text-muted text-small">Entry form will appear here</p>';

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
  historyContent.innerHTML =
    '<p class="text-muted text-small">No entries yet</p>';

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

/**
 * Initialize domain-specific modules after view is created
 * Calls domain-specific initialization functions
 *
 * @param {string} domainId - The domain identifier
 */
function initializeDomainModule(domainId) {
  // Initialize domain-specific functionality based on domain ID
  switch (domainId) {
    case "habits":
      if (typeof initializeHabitsModule === "function") {
        initializeHabitsModule(`quick-entry-${domainId}`);
      }
      break;
    case "learning":
      if (typeof initializeLearningModule === "function") {
        initializeLearningModule(`quick-entry-${domainId}`);
      }
      break;
    case "career":
      if (typeof initializeCareerModule === "function") {
        initializeCareerModule(`quick-entry-${domainId}`);
      }
      break;
    case "health":
      if (typeof initializeHealthModule === "function") {
        initializeHealthModule(`quick-entry-${domainId}`);
      }
      break;
    default:
      console.warn(`No module initializer found for domain: ${domainId}`);
  }
}
