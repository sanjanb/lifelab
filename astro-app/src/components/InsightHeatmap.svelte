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
 * - Rows = days (Y-axis)
 * - Columns = domains (X-axis)
 * - Cell shading = presence/intensity (subtle visual encoding)
 * - No checkboxes, no clicks, no tooltips
 * - For reading, not interaction
 * - Scrollable horizontally if many domains
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

// Get day name for a given day number
function getDayName(dayNumber: number): string {
  // This is a simplified version - actual implementation would need year/month context
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // For display purposes, just show day number
  return '';
}
</script>

<div class="heatmap-container">
  <div class="heatmap-scroll">
    <table class="heatmap">
      <thead>
        <tr>
          <th class="day-header">Day</th>
          {#each domains as domain}
            <th class="domain-header">
              <div class="domain-label">{getDomainName(domain)}</div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each days as day, dayIndex}
          <tr class:today={isToday(day)}>
            <td class="day-cell">
              <div class="day-number">{day}</div>
              {#if isToday(day)}
                <div class="today-badge">today</div>
              {/if}
            </td>
            {#each domains as domain, domainIndex}
              <td
                class="heat-cell"
                style="background-color: {getCellColor(heatmapMatrix[dayIndex]?.[domainIndex] || 0)}"
                title="{getDomainName(domain)} on day {day}: {heatmapMatrix[dayIndex]?.[domainIndex] > 0 ? 'active' : 'inactive'}"
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
  }

  .day-header {
    min-width: 60px;
    text-align: left;
    padding-left: 1rem;
    position: sticky;
    left: 0;
    background: #f9fafb;
    z-index: 11;
  }

  .domain-header {
    min-width: 80px;
    text-align: center;
  }

  .domain-label {
    writing-mode: horizontal-tb;
    white-space: nowrap;
  }

  /* Body cells */
  tbody tr {
    border-bottom: 1px solid #f3f4f6;
  }

  tbody tr:hover {
    background-color: #fafafa;
  }

  tbody tr.today {
    background-color: #fef2f2;
  }

  tbody tr.today:hover {
    background-color: #fee2e2;
  }

  .day-cell {
    padding: 0.5rem 1rem;
    font-weight: 500;
    color: #1f2937;
    position: sticky;
    left: 0;
    background: white;
    border-right: 1px solid #e5e7eb;
    z-index: 5;
  }

  tbody tr:hover .day-cell {
    background-color: #fafafa;
  }

  tbody tr.today .day-cell {
    background-color: #fef2f2;
  }

  tbody tr.today:hover .day-cell {
    background-color: #fee2e2;
  }

  .day-number {
    font-size: 1rem;
  }

  .today-badge {
    font-size: 0.6875rem;
    color: #ef4444;
    font-weight: 600;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .heat-cell {
    width: 80px;
    height: 32px;
    text-align: center;
    border-right: 1px solid #f3f4f6;
    transition: opacity 0.15s ease;
  }

  .heat-cell:hover {
    opacity: 0.8;
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

    .domain-header {
      min-width: 60px;
    }

    .heat-cell {
      width: 60px;
      height: 28px;
    }

    .day-cell {
      padding: 0.375rem 0.75rem;
    }

    .legend-items {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
