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
    label.setAttribute("font-size", "10px");
    label.setAttribute("fill", "#666");
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
      rect.setAttribute("rx", 2);
      rect.classList.add("heatmap-cell");

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
 * Gets neutral heatmap color based on score
 * @param {number} score - Score value (0-1)
 * @returns {string} Hex color
 */
function getHeatmapColor(score) {
  if (score === 0) return "#f0f0f0";

  // Neutral gray scale - no guilt, no judgment
  const intensity = Math.floor(score * 4);

  const colors = [
    "#f0f0f0", // 0-0.25
    "#d0d0d0", // 0.25-0.5
    "#a0a0a0", // 0.5-0.75
    "#707070", // 0.75-1.0
    "#4a5568", // 1.0
  ];

  return colors[Math.min(intensity, 4)];
}
