<script lang="ts">
/**
 * Monthly Domain Heatmap Matrix
 * 
 * PHASE 3: Distribution View
 * 
 * Shows WHERE attention went across the month.
 * Not success. Not failure. Just presence.
 * 
 * DESIGN PRINCIPLES:
 * - Rows = domains (Y-axis)
 * - Columns = days (X-axis)
 * - Cell shading = presence/intensity (subtle visual encoding)
 * - No checkboxes, no clicks, no tooltips
 * - For reading, not interaction
 * - Scrollable horizontally if many days
 * 
 * VALUE INTERPRETATION:
 * - 0 = no activity (empty/light background)
 * - 1 = present (medium opacity)
 * - 2 = strong presence (full opacity) [future use]
 * 
 * These values represent presence only, not success or quality.
 */

export let days: number[] = []; // Day numbers (1-31)
export let domains: string[] = []; // Domain IDs
export let heatmapMatrix: number[][] = []; // [dayIndex][domainIndex] = intensity (0-2)
export let currentDay: number | null = null; // Today's day number

// Domain display names (convert ID to readable name)
function getDomainName(domainId: string): string {
  // Capitalize first letter
  return domainId.charAt(0).toUpperCase() + domainId.slice(1);
}

// Get cell color based on intensity
function getCellColor(intensity: number): string {
  if (intensity === 0) return '#ffffff';
  if (intensity === 1) return '#bfdbfe'; // Blue-200
  if (intensity === 2) return '#3b82f6'; // Blue-500
  return '#ffffff';
}

// Check if day is today
function isToday(day: number): boolean {
  return day === currentDay;
}

// Get intensity for specific domain and day
function getIntensity(domainIndex: number, dayIndex: number): number {
  return heatmapMatrix[dayIndex]?.[domainIndex] || 0;
}
</script>

<div class="heatmap-container">
  <div class="heatmap-scroll">
    <table class="heatmap">
      <thead>
        <tr>
          <th class="domain-header-label">Domain</th>
          {#each days as day}
            <th class="day-header" class:today={isToday(day)}>
              <div class="day-label">{day}</div>
              {#if isToday(day)}
                <div class="today-marker">•</div>
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each domains as domain, domainIndex}
          <tr>
            <td class="domain-cell">
              <div class="domain-name">{getDomainName(domain)}</div>
            </td>
            {#each days as day, dayIndex}
              <td
                class="heat-cell"
                class:today-col={isToday(day)}
                style="background-color: {getCellColor(getIntensity(domainIndex, dayIndex))}"
                title="{getDomainName(domain)} on day {day}: {getIntensity(domainIndex, dayIndex) > 0 ? 'active' : 'inactive'}"
              >
                <!-- Empty cell, color represents presence -->
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="heatmap-legend">
    <div class="legend-title">Reading the heatmap:</div>
    <div class="legend-items">
      <div class="legend-item">
        <div class="legend-color" style="background-color: #ffffff; border: 1px solid #e5e7eb;"></div>
        <span>No activity</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #bfdbfe;"></div>
        <span>Active</span>
      </div>
    </div>
    <p class="legend-note">
      Each cell shows whether a domain had activity on that day.
      This is not a measure of success—only presence.
    </p>
  </div>
</div>

<style>
  .heatmap-container {
    margin: 1.5rem 0;
  }

  .heatmap-scroll {
    overflow-x: auto;
    overflow-y: visible;
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }

  .heatmap {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    background: white;
    table-layout: auto;
    min-width: 100%;
  }

  /* Headers */
  thead {
    position: sticky;
    top: 0;
    background: #f9fafb;
    z-index: 10;
  }

  th {
    padding: 0.75rem 0.5rem;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  .domain-header-label {
    min-width: 120px;
    text-align: left;
    padding-left: 1rem;
    position: sticky;
    left: 0;
    background: #f9fafb;
    z-index: 11;
  }

  .day-header {
    min-width: 40px;
    max-width: 40px;
    width: 40px;
    text-align: center;
    padding: 0.5rem 0.25rem;
    font-size: 0.875rem;
    vertical-align: top;
  }

  .day-header.today {
    background-color: #fef2f2;
    font-weight: 700;
  }

  .day-label {
    writing-mode: horizontal-tb;
    display: block;
  }

  .today-marker {
    color: #ef4444;
    font-size: 1.25rem;
    line-height: 0.5;
    margin-top: 2px;
  }

  /* Body cells */
  tbody tr {
    border-bottom: 1px solid #f3f4f6;
  }

  tbody tr:hover {
    background-color: #fafafa;
  }

  tbody td {
    padding: 0;
    margin: 0;
  }

  .domain-cell {
    padding: 0.75rem 1rem;
    font-weight: 500;
    color: #1f2937;
    position: sticky;
    left: 0;
    background: white;
    border-right: 1px solid #e5e7eb;
    z-index: 5;
    min-width: 120px;
    white-space: nowrap;
  }

  tbody tr:hover .domain-cell {
    background-color: #fafafa;
  }

  .domain-name {
    font-size: 0.9375rem;
  }

  .heat-cell {
    width: 40px;
    height: 40px;
    text-align: center;
    border-right: 1px solid #f3f4f6;
    transition: opacity 0.15s ease;
  }

  .heat-cell:hover {
    opacity: 0.8;
  }

  .heat-cell.today-col {
    border-left: 2px solid #ef4444;
    border-right: 2px solid #ef4444;
  }

  /* Legend */
  .heatmap-legend {
    padding: 1rem;
    background: #f9fafb;
    border-left: 3px solid #6b7280;
    border-radius: 4px;
  }

  .legend-title {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .legend-items {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-color {
    width: 24px;
    height: 24px;
    border-radius: 3px;
  }

  .legend-item span {
    font-size: 0.8125rem;
    color: #4b5563;
  }

  .legend-note {
    margin: 0.75rem 0 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: #6b7280;
    font-style: italic;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .heatmap {
      font-size: 0.8125rem;
    }

    .day-header {
      min-width: 32px;
      max-width: 32px;
      font-size: 0.75rem;
      padding: 0.375rem 0.125rem;
    }

    .heat-cell {
      width: 32px;
      height: 32px;
    }

    .domain-cell {
      padding: 0.5rem 0.75rem;
      min-width: 100px;
    }

    .domain-name {
      font-size: 0.8125rem;
    }

    .legend-items {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
