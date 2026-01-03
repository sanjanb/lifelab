/**
 * Year View Module
 * 
 * Purpose: Derived view composed from monthly notebooks
 * Philosophy: Observe patterns, don't judge performance
 * 
 * Key principles:
 * - Year data is NEVER stored separately
 * - All data derived from monthly notebooks
 * - Show patterns without scorekeeping mentality
 * - Seasonal observations, not productivity metrics
 */

// Current year being viewed
let currentYear = new Date().getFullYear();

/**
 * Initialize year view
 * Entry point for the year module
 */
function initializeYearView() {
  renderYearView(currentYear);
}

// Make function globally accessible
window.initializeYearView = initializeYearView;

/**
 * Aggregate all monthly notebooks for a given year
 * @param {number} year - The year to aggregate
 * @returns {Object} Aggregated year data
 */
function aggregateYearData(year) {
  const allNotebooks = getAllMonthlyNotebooks();
  
  // Filter notebooks for the specified year
  const yearNotebooks = allNotebooks.filter(nb => nb.year === year);
  
  if (yearNotebooks.length === 0) {
    return null;
  }
  
  // Sort by month
  yearNotebooks.sort((a, b) => a.month - b.month);
  
  return {
    year,
    notebooks: yearNotebooks,
    monthlyOutcomes: calculateMonthlyOutcomes(yearNotebooks),
    quarterlyDomains: calculateQuarterlyDomains(yearNotebooks),
    seasonalPatterns: detectSeasonalPatterns(yearNotebooks)
  };
}

/**
 * Calculate outcome distribution for each month
 * @param {Array} notebooks - Monthly notebooks for the year
 * @returns {Array} Array of {month, wins, neutrals, losses, total}
 */
function calculateMonthlyOutcomes(notebooks) {
  return notebooks.map(notebook => {
    const outcomes = { wins: 0, neutrals: 0, losses: 0 };
    
    notebook.days.forEach(day => {
      if (day.manualOutcome === 'win') outcomes.wins++;
      else if (day.manualOutcome === 'neutral') outcomes.neutrals++;
      else if (day.manualOutcome === 'loss') outcomes.losses++;
    });
    
    return {
      month: notebook.month,
      monthName: getMonthName(notebook.month),
      wins: outcomes.wins,
      neutrals: outcomes.neutrals,
      losses: outcomes.losses,
      total: notebook.days.length
    };
  });
}

/**
 * Calculate dominant domains for each quarter
 * @param {Array} notebooks - Monthly notebooks for the year
 * @returns {Array} Array of {quarter, domains: [{name, count}]}
 */
function calculateQuarterlyDomains(notebooks) {
  const quarters = [
    { quarter: 1, months: [1, 2, 3], domains: {} },
    { quarter: 2, months: [4, 5, 6], domains: {} },
    { quarter: 3, months: [7, 8, 9], domains: {} },
    { quarter: 4, months: [10, 11, 12], domains: {} }
  ];
  
  const allDomains = getAllDomains();
  
  // Count domain participation for each quarter
  notebooks.forEach(notebook => {
    const quarter = quarters.find(q => q.months.includes(notebook.month));
    if (!quarter) return;
    
    notebook.days.forEach(day => {
      Object.keys(day.domainSignals || {}).forEach(domainId => {
        if (day.domainSignals[domainId]) {
          quarter.domains[domainId] = (quarter.domains[domainId] || 0) + 1;
        }
      });
    });
  });
  
  // Convert to sorted arrays
  return quarters.map(q => {
    const domainArray = Object.entries(q.domains)
      .map(([domainId, count]) => {
        const domain = allDomains.find(d => d.id === domainId);
        return {
          id: domainId,
          name: domain ? domain.name : domainId,
          count: count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 domains per quarter
    
    return {
      quarter: q.quarter,
      quarterName: `Q${q.quarter}`,
      domains: domainArray
    };
  });
}

/**
 * Detect seasonal patterns across the year
 * @param {Array} notebooks - Monthly notebooks for the year
 * @returns {Array} Array of pattern observations
 */
function detectSeasonalPatterns(notebooks) {
  const patterns = [];
  const allDomains = getAllDomains();
  
  // Analyze domain participation across seasons
  const seasons = [
    { name: 'Winter', months: [12, 1, 2], domainCounts: {} },
    { name: 'Spring', months: [3, 4, 5], domainCounts: {} },
    { name: 'Summer', months: [6, 7, 8], domainCounts: {} },
    { name: 'Fall', months: [9, 10, 11], domainCounts: {} }
  ];
  
  notebooks.forEach(notebook => {
    const season = seasons.find(s => s.months.includes(notebook.month));
    if (!season) return;
    
    notebook.days.forEach(day => {
      Object.keys(day.domainSignals || {}).forEach(domainId => {
        if (day.domainSignals[domainId]) {
          season.domainCounts[domainId] = (season.domainCounts[domainId] || 0) + 1;
        }
      });
    });
  });
  
  // Identify dominant domains per season
  seasons.forEach(season => {
    const sortedDomains = Object.entries(season.domainCounts)
      .map(([domainId, count]) => {
        const domain = allDomains.find(d => d.id === domainId);
        return { id: domainId, name: domain ? domain.name : domainId, count };
      })
      .sort((a, b) => b.count - a.count);
    
    if (sortedDomains.length > 0) {
      const dominant = sortedDomains[0];
      patterns.push({
        type: 'seasonal_domain',
        text: `${season.name}: "${dominant.name}" most active`,
        detail: `${dominant.count} active days in ${season.name.toLowerCase()}`
      });
    }
  });
  
  // Analyze outcome trends across year
  const monthlyOutcomes = calculateMonthlyOutcomes(notebooks);
  const firstHalf = monthlyOutcomes.slice(0, 6);
  const secondHalf = monthlyOutcomes.slice(6);
  
  const firstHalfWins = firstHalf.reduce((sum, m) => sum + m.wins, 0);
  const secondHalfWins = secondHalf.reduce((sum, m) => sum + m.wins, 0);
  
  if (firstHalfWins > 0 || secondHalfWins > 0) {
    if (secondHalfWins > firstHalfWins * 1.3) {
      patterns.push({
        type: 'outcome_trend',
        text: 'Year gained momentum: More wins in second half',
        detail: `${firstHalfWins} wins H1 → ${secondHalfWins} wins H2`
      });
    } else if (firstHalfWins > secondHalfWins * 1.3) {
      patterns.push({
        type: 'outcome_trend',
        text: 'Year started strong: More wins in first half',
        detail: `${firstHalfWins} wins H1 → ${secondHalfWins} wins H2`
      });
    }
  }
  
  return patterns;
}

/**
 * Render the complete year view
 * @param {number} year - Year to display
 */
function renderYearView(year) {
  const container = document.getElementById('year-view');
  if (!container) return;
  
  const yearData = aggregateYearData(year);
  
  if (!yearData) {
    renderEmptyState(container, year);
    return;
  }
  
  container.innerHTML = `
    <div class="year-view">
      ${renderYearHeader(year)}
      ${renderMonthlyOutcomes(yearData.monthlyOutcomes)}
      ${renderQuarterlyDomains(yearData.quarterlyDomains)}
      ${renderSeasonalPatterns(yearData.seasonalPatterns)}
    </div>
  `;
  
  attachYearNavListeners();
}

/**
 * Render year header with navigation
 * @param {number} year - Current year
 * @returns {string} HTML for year header
 */
function renderYearHeader(year) {
  return `
    <div class="year-header">
      <h1 class="year-title">Year Overview</h1>
      <p class="year-subtitle">Patterns observed across ${year}</p>
      <div class="year-selector">
        <button class="year-nav-button" data-action="prev">← Previous Year</button>
        <span class="year-display">${year}</span>
        <button class="year-nav-button" data-action="next">Next Year →</button>
      </div>
    </div>
  `;
}

/**
 * Render monthly outcomes section
 * @param {Array} monthlyOutcomes - Outcomes data for each month
 * @returns {string} HTML for monthly outcomes
 */
function renderMonthlyOutcomes(monthlyOutcomes) {
  const monthCards = monthlyOutcomes.map(month => {
    const maxCount = Math.max(month.wins, month.neutrals, month.losses, 1);
    const winWidth = (month.wins / maxCount) * 100;
    const neutralWidth = (month.neutrals / maxCount) * 100;
    const lossWidth = (month.losses / maxCount) * 100;
    
    return `
      <div class="month-card">
        <div class="month-card-header">${month.monthName}</div>
        <div class="month-outcome-bars">
          <div class="month-outcome-row">
            <div class="month-outcome-icon win">W</div>
            <div class="month-outcome-bar">
              <div class="month-outcome-fill win" style="width: ${winWidth}%"></div>
            </div>
            <span class="month-outcome-count">${month.wins}</span>
          </div>
          <div class="month-outcome-row">
            <div class="month-outcome-icon neutral">N</div>
            <div class="month-outcome-bar">
              <div class="month-outcome-fill neutral" style="width: ${neutralWidth}%"></div>
            </div>
            <span class="month-outcome-count">${month.neutrals}</span>
          </div>
          <div class="month-outcome-row">
            <div class="month-outcome-icon loss">L</div>
            <div class="month-outcome-bar">
              <div class="month-outcome-fill loss" style="width: ${lossWidth}%"></div>
            </div>
            <span class="month-outcome-count">${month.losses}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <section class="monthly-outcomes-section">
      <h2 class="section-title">Monthly Outcomes</h2>
      <div class="months-grid">
        ${monthCards}
      </div>
    </section>
  `;
}

/**
 * Render quarterly domains section
 * @param {Array} quarterlyDomains - Domain participation per quarter
 * @returns {string} HTML for quarterly domains
 */
function renderQuarterlyDomains(quarterlyDomains) {
  const quarterCards = quarterlyDomains.map(quarter => {
    const domainItems = quarter.domains.length > 0
      ? quarter.domains.map(domain => `
          <div class="quarter-domain-item">
            <span class="quarter-domain-name">${domain.name}</span>
            <span class="quarter-domain-count">${domain.count} days</span>
          </div>
        `).join('')
      : '<div class="quarter-domain-item"><span class="quarter-domain-name">No activity recorded</span></div>';
    
    return `
      <div class="quarter-card">
        <div class="quarter-card-header">${quarter.quarterName}</div>
        <div class="quarter-domains">
          ${domainItems}
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <section class="quarterly-domains-section">
      <h2 class="section-title">Dominant Domains by Quarter</h2>
      <div class="quarters-grid">
        ${quarterCards}
      </div>
    </section>
  `;
}

/**
 * Render seasonal patterns section
 * @param {Array} seasonalPatterns - Detected patterns
 * @returns {string} HTML for seasonal patterns
 */
function renderSeasonalPatterns(seasonalPatterns) {
  const observations = seasonalPatterns.length > 0
    ? seasonalPatterns.map(pattern => `
        <div class="seasonal-observation">
          <div class="seasonal-pattern-text">${pattern.text}</div>
          <div class="seasonal-detail">${pattern.detail}</div>
        </div>
      `).join('')
    : '<div class="seasonal-observation"><div class="seasonal-pattern-text">Not enough data to detect seasonal patterns</div></div>';
  
  return `
    <section class="seasonal-patterns-section">
      <h2 class="section-title">Seasonal Patterns</h2>
      ${observations}
    </section>
  `;
}

/**
 * Render empty state when no data exists
 * @param {HTMLElement} container - Container element
 * @param {number} year - Year with no data
 */
function renderEmptyState(container, year) {
  container.innerHTML = `
    <div class="year-view">
      ${renderYearHeader(year)}
      <div class="year-empty-state">
        <div class="year-empty-state-title">No data for ${year}</div>
        <div class="year-empty-state-message">Create some monthly notebooks to see your year overview</div>
      </div>
    </div>
  `;
  
  attachYearNavListeners();
}

/**
 * Attach event listeners for year navigation
 */
function attachYearNavListeners() {
  const prevButton = document.querySelector('[data-action="prev"]');
  const nextButton = document.querySelector('[data-action="next"]');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      currentYear--;
      renderYearView(currentYear);
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      currentYear++;
      renderYearView(currentYear);
    });
  }
}

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
function getMonthName(month) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month - 1] || 'Unknown';
}
