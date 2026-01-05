<script lang="ts">
/**
 * Insight Container - Client-side data loader
 * 
 * Loads monthly notebook data from localStorage and builds insight structure.
 * This component handles all data loading client-side to avoid SSR issues.
 */

import { onMount } from 'svelte';
import InsightLineGraph from './InsightLineGraph.svelte';
import InsightHeatmap from './InsightHeatmap.svelte';
import InsightObservations from './InsightObservations.svelte';
import { getMonthlyNotebook } from '../lib/storage';
import { buildMonthlyInsight, getSignalArray, getHeatmapMatrix } from '../lib/monthlyInsight';
import { generateInsightObservations, getMonthSummary } from '../lib/insightText';
import { aggregateAllDomainsToNotebook } from '../lib/notebookSync';

export let year: number;
export let month: number;
export let currentDay: number;

let days: number[] = [];
let domains: string[] = [];
let signalArray: number[] = [];
let heatmapMatrix: number[][] = [];
let observations: any[] = [];
let monthSummary = '';
let isLoading = true;

onMount(() => {
  loadData();
});

function loadData() {
  // Ensure notebook is synced with all domain entries
  aggregateAllDomainsToNotebook(year, month);
  
  // Get monthly notebook from storage
  const notebook = getMonthlyNotebook(year, month);
  
  if (!notebook) {
    // No data yet - create empty structure
    const daysInMonth = new Date(year, month, 0).getDate();
    days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    domains = [];
    signalArray = Array(daysInMonth).fill(0);
    heatmapMatrix = Array(daysInMonth).fill([]);
    observations = [];
    monthSummary = 'No activity recorded this month.';
    isLoading = false;
    return;
  }
  
  // Transform notebook data to daily rows
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyRows = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const dayKey = String(dayNumber);
    const date = new Date(year, month - 1, dayNumber).toISOString().split('T')[0];
    const dayData = notebook.days[dayKey] || {};
    
    return {
      date,
      domains: dayData.domains || [],
      intent: dayData.intent,
      quality: dayData.quality,
      outcome: dayData.outcome
    };
  });
  
  // Build insight structure
  const insight = buildMonthlyInsight(year, month, dailyRows);
  
  // Extract data for components
  days = insight.days;
  domains = insight.domains;
  signalArray = getSignalArray(insight);
  heatmapMatrix = getHeatmapMatrix(insight);
  observations = generateInsightObservations(insight);
  monthSummary = getMonthSummary(insight);
  
  isLoading = false;
}
</script>

{#if isLoading}
  <div class="loading">
    <p>Loading insights...</p>
  </div>
{:else}
  <!-- Section 1: Temporal Flow (Line Graph) -->
  <section class="insight-section">
    <h2 class="insight-title">Monthly Activity Flow</h2>
    <InsightLineGraph 
      {days}
      dailySignals={signalArray}
      {currentDay}
    />
  </section>

  <!-- Section 2: Distribution View (Heatmap Matrix) -->
  <section class="insight-section">
    <h2 class="insight-title">Domain Distribution</h2>
    <InsightHeatmap 
      {days}
      {domains}
      {heatmapMatrix}
      {currentDay}
    />
  </section>

  <!-- Section 3: Pattern Observations (Text Analytics) -->
  <section class="insight-section">
    <InsightObservations 
      {observations}
      {monthSummary}
    />
  </section>
{/if}

<style>
  .loading {
    padding: 3rem;
    text-align: center;
    color: #6b7280;
  }

  .insight-section {
    margin: 3rem 0;
    padding: 2rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .insight-title {
    font-size: 1.375rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1.5rem 0;
  }

  @media (max-width: 768px) {
    .insight-title {
      font-size: 1.125rem;
    }
  }

  @media (max-width: 480px) {
    .insight-section {
      padding: 1.5rem 1rem;
      margin: 2rem 0;
    }
  }

  @media (max-width: 360px) {
    .insight-section {
      padding: 1rem 0.75rem;
    }
  }
</style>
