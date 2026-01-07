/**
 * Heatmap Visualization - Yearly overview with neutral colors
 * Emphasizes consistency over perfection
 */

/**
 * Renders a yearly heatmap visualization
 * @param {Array} data - Array of all day records for the year
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options - Configuration options
 */
export function renderHeatmap(data, container, options = {}) {
  const {
    cellSize = 12,
    cellGap = 2,
    year = new Date().getFullYear(),
  } = options;

  // Clear container
  container.innerHTML = "";

  // Group data by week
  const weeks = groupByWeek(data, year);

  const width = (cellSize + cellGap) * 53; // ~52 weeks
  const height = (cellSize + cellGap) * 7 + 40; // 7 days + labels

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = "100%";
  svg.style.height = "auto";

  // Add border rectangle
  const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  border.setAttribute("x", 38);
  border.setAttribute("y", 18);
  border.setAttribute("width", (cellSize + cellGap) * 53 + 2);
  border.setAttribute("height", (cellSize + cellGap) * 7 + 4);
  border.setAttribute("fill", "none");
  border.setAttribute("stroke", "#edf2f7");
  border.setAttribute("stroke-width", "2");
  border.setAttribute("rx", "6");
  svg.appendChild(border);

  // Add month labels at top
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthsShown = new Set();

  weeks.forEach((week, weekIdx) => {
    if (week.some((day) => day)) {
      const firstDay = week.find((day) => day);
      if (firstDay) {
        const date = new Date(firstDay.date + "T00:00:00");
        const month = date.getMonth();
        const weekOfMonth = Math.floor(date.getDate() / 7);

        // Show month label at first week of each month
        if (!monthsShown.has(month) || weekOfMonth === 0) {
          monthsShown.add(month);
          const monthLabel = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          monthLabel.setAttribute("x", 40 + weekIdx * (cellSize + cellGap));
          monthLabel.setAttribute("y", 12);
          monthLabel.setAttribute("text-anchor", "start");
          monthLabel.setAttribute("font-size", "10px");
          monthLabel.setAttribute("font-weight", "600");
          monthLabel.setAttribute("fill", "#4a5568");
          monthLabel.setAttribute(
            "font-family",
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          );
          monthLabel.textContent = monthLabels[month].toUpperCase();
          svg.appendChild(monthLabel);
        }
      }
    }
  });

  // Add day labels (Mon, Wed, Fri)
  const dayLabels = ["Mon", "Wed", "Fri"];
  const dayIndices = [0, 2, 4];

  dayIndices.forEach((dayIdx, i) => {
    const label = document.createElementNS(
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
