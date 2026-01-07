/**
 * Heatmap Visualization - Monthly domain overview
 * Shows domains as rows, days as columns
 */

/**
 * Renders a monthly heatmap visualization
 * @param {Array} data - Array of day records for the month
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options - Configuration options
 */
export function renderHeatmap(data, container, options = {}) {
  const {
    cellSize = 16,
    cellGap = 3,
    labelWidth = 80,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
  } = options;

  // Clear container
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="empty-state">No data for this month</p>';
    return;
  }

  // Get all unique domains from the data
  const domainsSet = new Set();
  data.forEach(day => {
    if (day.domains) {
      Object.keys(day.domains).forEach(domain => domainsSet.add(domain));
    }
  });
  const domains = Array.from(domainsSet).sort();

  // Get number of days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Create a map of data by date
  const dataByDate = new Map();
  data.forEach(day => {
    const date = new Date(day.date + "T00:00:00");
    const dayNum = date.getDate();
    dataByDate.set(dayNum, day);
  });

  const width = labelWidth + (cellSize + cellGap) * daysInMonth + 20;
  const height = 40 + (cellSize + cellGap) * domains.length + 10;

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = "100%";
  svg.style.height = "auto";

  // Add border rectangle
  const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  border.setAttribute("x", labelWidth - 5);
  border.setAttribute("y", 35);
  border.setAttribute("width", (cellSize + cellGap) * daysInMonth + 5);
  border.setAttribute("height", (cellSize + cellGap) * domains.length + 5);
  border.setAttribute("fill", "none");
  border.setAttribute("stroke", "#edf2f7");
  border.setAttribute("stroke-width", "2");
  border.setAttribute("rx", "6");
  svg.appendChild(border);

  // Add day numbers at top
  for (let day = 1; day <= daysInMonth; day++) {
    const dayLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    dayLabel.setAttribute("x", labelWidth + (day - 1) * (cellSize + cellGap) + cellSize / 2);
    dayLabel.setAttribute("y", 30);
    dayLabel.setAttribute("text-anchor", "middle");
    dayLabel.setAttribute("font-size", "10px");
    dayLabel.setAttribute("font-weight", "500");
    dayLabel.setAttribute("fill", "#718096");
    dayLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
    dayLabel.textContent = day;
    svg.appendChild(dayLabel);
  }

  // Add domain labels on left and render cells
  domains.forEach((domain, domainIdx) => {
    // Domain label
    const domainLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    domainLabel.setAttribute("x", labelWidth - 10);
    domainLabel.setAttribute("y", 40 + domainIdx * (cellSize + cellGap) + cellSize / 2 + 5);
    domainLabel.setAttribute("text-anchor", "end");
    domainLabel.setAttribute("font-size", "11px");
    domainLabel.setAttribute("font-weight", "600");
    domainLabel.setAttribute("fill", "#4a5568");
    domainLabel.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
    domainLabel.textContent = capitalizeFirst(domain);
    svg.appendChild(domainLabel);

    // Render cells for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const x = labelWidth + (day - 1) * (cellSize + cellGap);
      const y = 40 + domainIdx * (cellSize + cellGap);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", cellSize);
      rect.setAttribute("height", cellSize);
      rect.setAttribute("rx", 3);
      rect.classList.add("heatmap-cell");

      // Get score for this domain on this day
      const dayData = dataByDate.get(day);
      const score = (dayData && dayData.domains && dayData.domains[domain]) || 0;
      
      const color = getHeatmapColor(score);
      rect.setAttribute("fill", color);

      // Add subtle animation delay
      rect.style.animationDelay = `${(domainIdx * daysInMonth + day) * 2}ms`;

      // Tooltip
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      title.textContent = `${capitalizeFirst(domain)} on ${dateStr}: ${score.toFixed(2)}`;
      rect.appendChild(title);

      svg.appendChild(rect);
    }
  });

  container.appendChild(svg);
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.setAttribute("x", 0);
    label.setAttribute(
      "y",
      20 + dayIdx * (cellSize + cellGap) + cellSize / 2 + 4
    );
    label.setAttribute("text-anchor", "start");
    label.setAttribute("font-size", "11px");
    label.setAttribute("font-weight", "500");
    label.setAttribute("fill", "#718096");
    label.setAttribute(
      "font-family",
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    );
    label.textContent = dayLabels[i];
    svg.appendChild(label);
  });

  // Render weeks
  weeks.forEach((week, weekIdx) => {
    week.forEach((day, dayIdx) => {
      if (!day) return;

      const x = 40 + weekIdx * (cellSize + cellGap);
      const y = 20 + dayIdx * (cellSize + cellGap);

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", cellSize);
      rect.setAttribute("height", cellSize);
      rect.setAttribute("rx", 3);
      rect.classList.add("heatmap-cell");

      // Add subtle animation delay based on position
      rect.style.animationDelay = `${(weekIdx * 7 + dayIdx) * 5}ms`;

      // Calculate color based on score
      const score = calculateScore(day);
      const color = getHeatmapColor(score);
      rect.setAttribute("fill", color);

      // Tooltip
      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = `${day.date}: ${score.toFixed(2)}`;
      rect.appendChild(title);

      svg.appendChild(rect);
    });
  });

  container.appendChild(svg);
}

/**
 * Groups day records by week
 * @param {Array} data - Array of day records
 * @param {number} year - Year to organize
 * @returns {Array} Array of weeks, each week is array of 7 days
 */
function groupByWeek(data, year) {
  const weeks = [];
  const dataMap = new Map(data.map((d) => [d.date, d]));

  // Start from first day of year
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  let currentWeek = [];
  let currentDate = new Date(firstDay);

  // Adjust to start on Monday
  const dayOfWeek = currentDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToMonday);

  while (currentDate <= lastDay) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayData = dataMap.get(dateStr);

    currentWeek.push(dayData || null);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Calculate average score for a day
 * @param {Object} day - Day record
 * @returns {number} Average score (0-1)
 */
function calculateScore(day) {
  if (!day || !day.domains) return 0;
  const scores = Object.values(day.domains);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Gets refined heatmap color based on score
 * @param {number} score - Score value (0-1)
 * @returns {string} Hex color
 */
function getHeatmapColor(score) {
  if (score === 0) return "#edf2f7";

  // Sophisticated blue-gray gradient - calm, focused, minimal
  const colors = [
    "#edf2f7", // 0-0.2 - very light
    "#cbd5e0", // 0.2-0.4 - light
    "#a0aec0", // 0.4-0.6 - medium
    "#718096", // 0.6-0.8 - darker
    "#4a5568", // 0.8-1.0 - darkest
  ];

  const index = Math.min(Math.floor(score * 5), 4);
  return colors[index];
}
