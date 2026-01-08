/**
 * Line Graph Renderer - Pure SVG, no libraries
 * Shows monthly trends with clean, readable output
 * Handles both percentage (0-1) and checkbox (boolean) domains
 */

import {
  getEnabledDomainNames,
  getAllDomainConfigs,
} from "../data/storage.js";
import { normalizeValue, DomainType } from "../data/domainTypes.js";

/**
 * Creates an SVG line graph from daily data
 * @param {Array} data - Array of day records with scores
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options - Configuration options
 */
export function renderLineGraph(data, container, options = {}) {
  const {
    width = 800,
    height = 300,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 40,
    marginLeft = 50,
  } = options;

  // Clear container
  container.innerHTML = "";

  // Calculate dimensions
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.classList.add("svg-graph");

  // Create chart group
  const chartGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  chartGroup.setAttribute(
    "transform",
    `translate(${marginLeft}, ${marginTop})`
  );

  // Get max day number for X axis
  const maxDay = Math.max(...data.map((d) => new Date(d.date).getDate()));

  // Draw X axis
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 0);
  xAxis.setAttribute("y1", chartHeight);
  xAxis.setAttribute("x2", chartWidth);
  xAxis.setAttribute("y2", chartHeight);
  xAxis.classList.add("axis-line");
  chartGroup.appendChild(xAxis);

  // Draw Y axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", 0);
  yAxis.setAttribute("y1", 0);
  yAxis.setAttribute("x2", 0);
  yAxis.setAttribute("y2", chartHeight);
  yAxis.classList.add("axis-line");
  chartGroup.appendChild(yAxis);

  // Add Y axis labels (0 to 1.0)
  for (let i = 0; i <= 4; i++) {
    const value = i * 0.25;
    const y = chartHeight - value * chartHeight;

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.setAttribute("x", -10);
    label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    label.textContent = value.toFixed(2);
    chartGroup.appendChild(label);

    // Grid line
    const gridLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    gridLine.setAttribute("x1", 0);
    gridLine.setAttribute("y1", y);
    gridLine.setAttribute("x2", chartWidth);
    gridLine.setAttribute("y2", y);
    gridLine.setAttribute("stroke", "#e0e0e0");
    gridLine.setAttribute("stroke-dasharray", "2,2");
    chartGroup.appendChild(gridLine);
  }

  // Calculate points for line
  const points = data.map((d) => {
    const day = new Date(d.date).getDate();
    const score = calculateScore(d);

    const x = (day / maxDay) * chartWidth;
    const y = chartHeight - score * chartHeight;

    return { x, y, day, score };
  });

  // Sort by day
  points.sort((a, b) => a.day - b.day);

  // Create line path
  if (points.length > 0) {
    const pathData = points
      .map((p, i) => {
        return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
      })
      .join(" ");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.classList.add("data-line");
    chartGroup.appendChild(path);

    // Add data points
    points.forEach((p) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 3);
      circle.classList.add("data-point");

      // Tooltip
      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = `Day ${p.day}: ${p.score.toFixed(2)}`;
      circle.appendChild(title);

      chartGroup.appendChild(circle);
    });
  }

  // Add X axis label
  const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xLabel.setAttribute("x", chartWidth / 2);
  xLabel.setAttribute("y", chartHeight + 30);
  xLabel.setAttribute("text-anchor", "middle");
  xLabel.textContent = "Day of Month";
  chartGroup.appendChild(xLabel);

  // Add Y axis label
  const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yLabel.setAttribute("x", -chartHeight / 2);
  yLabel.setAttribute("y", -35);
  yLabel.setAttribute("text-anchor", "middle");
  yLabel.setAttribute("transform", `rotate(-90, -${chartHeight / 2}, -35)`);
  yLabel.textContent = "Daily Score";
  chartGroup.appendChild(yLabel);

  svg.appendChild(chartGroup);
  container.appendChild(svg);
}

/**
 * Calculate average score for a day (only enabled domains)
 * Normalizes checkbox values (true=1, false=0) for averaging
 * @param {Object} day - Day record
 * @returns {number} Average score (0-1)
 */
function calculateScore(day) {
  if (!day.domains) return 0;

  const enabledDomains = getEnabledDomainNames();
  const domainConfigs = getAllDomainConfigs();

  const scores = [];

  enabledDomains.forEach((domain) => {
    const rawValue = day.domains[domain];
    if (rawValue !== undefined && rawValue !== null) {
      const config = domainConfigs[domain] || { type: DomainType.PERCENTAGE };
      // Normalize to 0-1 range (handles both percentage and checkbox)
      scores.push(normalizeValue(rawValue, config.type));
    }
  });

  if (scores.length === 0) return 0;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}
