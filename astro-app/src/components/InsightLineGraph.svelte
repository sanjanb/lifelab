<script lang="ts">
/**
 * Monthly Activity Line Graph
 * 
 * PHASE 2: Temporal Flow Visualization
 * 
 * Shows how the month moves over time through a simple line graph.
 * This provides the emotional and rhythmic overview of monthly activity.
 * 
 * DESIGN PRINCIPLES:
 * - Shows temporal flow (how activity changes day-to-day)
 * - No smoothing (preserves authentic rhythm)
 * - No goal lines or targets (observational not evaluative)
 * - Highlights "today" for temporal context
 * - Fast rendering (SVG-based)
 * - Read-only (no interactions)
 * 
 * SIGNAL INTERPRETATION:
 * The Y-axis represents daily aggregate signal:
 * - Higher values = more domains engaged that day
 * - Lower values = fewer domains engaged
 * - Zero = no recorded activity
 * 
 * This is NOT a quality measure. It shows breadth of engagement.
 */

export let days: number[] = []; // Day numbers (1-31)
export let dailySignals: number[] = []; // Signal value for each day
export let currentDay: number | null = null; // Today's day number (for highlighting)

// Reactive dimensions
let width = 800;
let height = 200;
const padding = { top: 20, right: 20, bottom: 30, left: 40 };

// Calculate chart area
$: chartWidth = width - padding.left - padding.right;
$: chartHeight = height - padding.top - padding.bottom;

// Calculate scales
$: maxSignal = Math.max(...dailySignals, 1); // Avoid division by zero
$: xScale = (day: number) => ((day - 1) / Math.max(days.length - 1, 1)) * chartWidth;
$: yScale = (signal: number) => chartHeight - (signal / maxSignal) * chartHeight;

// Generate line path
$: linePath = dailySignals.length > 0
  ? dailySignals.map((signal, i) => {
      const x = xScale(days[i]);
      const y = yScale(signal);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ')
  : '';

// Generate points for highlighting
$: points = days.map((day, i) => ({
  day,
  x: xScale(day),
  y: yScale(dailySignals[i]),
  signal: dailySignals[i],
  isToday: day === currentDay
}));

// Y-axis ticks
$: yTicks = Array.from({ length: 5 }, (_, i) => {
  const value = Math.round((maxSignal / 4) * i);
  return { value, y: yScale(value) };
}).reverse();
</script>

<div class="line-graph" bind:clientWidth={width}>
  <svg {width} {height}>
    <!-- Chart area background -->
    <rect
      x={padding.left}
      y={padding.top}
      width={chartWidth}
      height={chartHeight}
      fill="#fafafa"
      stroke="#e0e0e0"
    />

    <!-- Y-axis grid lines -->
    {#each yTicks as tick}
      <line
        x1={padding.left}
        y1={padding.top + tick.y}
        x2={padding.left + chartWidth}
        y2={padding.top + tick.y}
        stroke="#f0f0f0"
        stroke-width="1"
      />
    {/each}

    <!-- Y-axis labels -->
    {#each yTicks as tick}
      <text
        x={padding.left - 8}
        y={padding.top + tick.y + 4}
        text-anchor="end"
        font-size="11"
        fill="#666"
      >
        {tick.value}
      </text>
    {/each}

    <!-- Y-axis title -->
    <text
      x={12}
      y={padding.top + chartHeight / 2}
      text-anchor="middle"
      font-size="11"
      fill="#666"
      transform="rotate(-90, 12, {padding.top + chartHeight / 2})"
    >
      domains active
    </text>

    <!-- Line graph -->
    {#if linePath}
      <path
        d={linePath}
        fill="none"
        stroke="#3b82f6"
        stroke-width="2"
        transform="translate({padding.left}, {padding.top})"
      />
    {/if}

    <!-- Data points -->
    {#each points as point}
      <circle
        cx={padding.left + point.x}
        cy={padding.top + point.y}
        r={point.isToday ? 5 : 3}
        fill={point.isToday ? '#ef4444' : point.signal > 0 ? '#3b82f6' : '#d1d5db'}
        stroke={point.isToday ? '#991b1b' : 'none'}
        stroke-width={point.isToday ? 2 : 0}
      />
    {/each}

    <!-- X-axis labels (show every 5th day) -->
    {#each days.filter((_, i) => i % 5 === 0 || i === days.length - 1) as day}
      <text
        x={padding.left + xScale(day)}
        y={height - padding.bottom + 20}
        text-anchor="middle"
        font-size="11"
        fill="#666"
      >
        {day}
      </text>
    {/each}

    <!-- X-axis title -->
    <text
      x={padding.left + chartWidth / 2}
      y={height - 5}
      text-anchor="middle"
      font-size="11"
      fill="#666"
    >
      day of month
    </text>
  </svg>

  <div class="graph-caption">
    <p>
      This graph shows daily domain engagement across the month.
      Higher points indicate more domains were active on that day.
      {#if currentDay}
        <span class="today-marker">Red dot marks today (day {currentDay}).</span>
      {/if}
    </p>
  </div>
</div>

<style>
  .line-graph {
    width: 100%;
    margin: 1.5rem 0;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .graph-caption {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-left: 3px solid #3b82f6;
  }

  .graph-caption p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #4b5563;
  }

  .today-marker {
    color: #ef4444;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .graph-caption p {
      font-size: 0.8125rem;
    }
  }
</style>
