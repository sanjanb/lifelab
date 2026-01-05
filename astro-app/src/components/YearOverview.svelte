<script lang="ts">
/**
 * Year Overview Component
 * 
 * Phase 6 Implementation: 12-month visual comparison
 * Shows patterns WITHOUT ranking or scoring
 */

import { onMount } from 'svelte';
import { getMonthlyNotebook } from '../lib/storage';
import { buildMonthlyInsight, getSignalArray } from '../lib/monthlyInsight';
import { generateMonthlySilhouette, type MonthlySilhouette } from '../lib/yearlyRollup';
import type { DailyRowData } from '../lib/monthlyInsight';

export let year: number;

let silhouettes: MonthlySilhouette[] = [];
let isLoading = true;

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

onMount(() => {
  loadYearData();
});

function loadYearData() {
  silhouettes = [];

  for (let month = 1; month <= 12; month++) {
    const notebook = getMonthlyNotebook(year, month);
    
    if (notebook) {
      // Convert notebook to daily rows
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyRows: DailyRowData[] = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNumber = i + 1;
        const date = new Date(year, month - 1, dayNumber).toISOString().split('T')[0];
        const dayData = notebook.days[dayNumber] || {};
        
        return {
          date,
          domains: dayData.domains || []
        };
      });

      // Build insight and generate silhouette
      const insight = buildMonthlyInsight(year, month, dailyRows);
      const silhouette = generateMonthlySilhouette(insight);
      silhouettes.push(silhouette);
    } else {
      // Empty month
      silhouettes.push({
        monthId: `${year}-${String(month).padStart(2, '0')}`,
        year,
        month,
        totalDays: new Date(year, month, 0).getDate(),
        activeDays: 0,
        activeDomains: [],
        dailySignalShape: [],
        domainDistribution: {},
        densityPattern: {
          longestActiveStreak: 0,
          longestQuietPeriod: 0,
          clusterCount: 0
        }
      });
    }
  }

  isLoading = false;
}

function getSparklinePoints(signals: number[], width: number, height: number): string {
  if (signals.length === 0) return '';
  
  const max = Math.max(...signals, 1);
  const step = width / (signals.length - 1 || 1);
  
  return signals
    .map((value, i) => {
      const x = i * step;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

function getTotalActiveDays(): number {
  return silhouettes.reduce((sum, s) => sum + s.activeDays, 0);
}

function getAllDomains(): string[] {
  const domainSet = new Set<string>();
  silhouettes.forEach(s => s.activeDomains.forEach(d => domainSet.add(d)));
  return Array.from(domainSet).sort();
}
</script>

<div class="year-overview">
  {#if isLoading}
    <div class="loading">Loading year data...</div>
  {:else}
    <!-- Year Summary -->
    <section class="year-summary">
      <h2>Annual Summary</h2>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-value">{getTotalActiveDays()}</span>
          <span class="stat-label">Active Days</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{getAllDomains().length}</span>
          <span class="stat-label">Domains Engaged</span>
        </div>
      </div>
    </section>

    <!-- Monthly Sparklines Grid -->
    <section class="monthly-grid">
      <h2>Monthly Rhythms</h2>
      <p class="section-description">Each graph shows daily activity flow for one month</p>
      
      <div class="months-grid">
        {#each silhouettes as silhouette, i}
          <div class="month-card" class:empty={silhouette.activeDays === 0}>
            <div class="month-header">
              <strong>{monthNames[i]}</strong>
              <span class="month-stats">{silhouette.activeDays} days</span>
            </div>
            
            {#if silhouette.activeDays > 0}
              <svg class="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline
                  points={getSparklinePoints(silhouette.dailySignalShape, 100, 40)}
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                />
              </svg>
              
              <div class="month-domains">
                {#each silhouette.activeDomains as domain}
                  <span class="domain-tag">{domain}</span>
                {/each}
              </div>
            {:else}
              <div class="empty-state">No activity</div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Domain Participation Heatmap -->
    <section class="domain-participation">
      <h2>Domain Distribution</h2>
      <p class="section-description">Shows which domains were active each month</p>
      
      <div class="participation-grid">
        <div class="grid-header">
          <div class="corner-cell"></div>
          {#each monthNames as monthName}
            <div class="month-label">{monthName}</div>
          {/each}
        </div>
        
        {#each getAllDomains() as domain}
          <div class="domain-row">
            <div class="domain-label">{domain}</div>
            {#each silhouettes as silhouette}
              {@const days = silhouette.domainDistribution[domain] || 0}
              <div 
                class="participation-cell"
                class:active={days > 0}
                title="{domain} in {monthNames[silhouette.month - 1]}: {days} days"
                style="opacity: {days > 0 ? Math.min(days / 20, 1) : 0.1}"
              >
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </section>

    <!-- Pattern Observations -->
    <section class="year-patterns">
      <h2>Notable Patterns</h2>
      <ul class="pattern-list">
        {#each silhouettes.filter(s => s.densityPattern.longestActiveStreak >= 7) as silhouette}
          <li>
            {monthNames[silhouette.month - 1]} had {silhouette.densityPattern.longestActiveStreak} consecutive active days
          </li>
        {/each}
        
        {#if getAllDomains().length > 0}
          <li>
            Engaged with {getAllDomains().length} different {getAllDomains().length === 1 ? 'domain' : 'domains'} throughout the year
          </li>
        {/if}
      </ul>
    </section>
  {/if}
</div>

<style>
  .year-overview {
    padding: 1rem 0;
  }

  .loading {
    padding: 3rem;
    text-align: center;
    color: #6b7280;
  }

  section {
    margin: 3rem 0;
    padding: 2rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  section h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .section-description {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* Year Summary */
  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-value {
    font-size: 3rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Monthly Grid */
  .months-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .month-card {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    background: #fafafa;
    transition: transform 0.15s ease;
  }

  .month-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .month-card.empty {
    opacity: 0.4;
  }

  .month-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .month-header strong {
    color: #111827;
  }

  .month-stats {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .sparkline {
    width: 100%;
    height: 40px;
    margin-bottom: 0.75rem;
  }

  .empty-state {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    padding: 1.5rem 0;
  }

  .month-domains {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .domain-tag {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 3px;
  }

  /* Domain Participation Grid */
  .participation-grid {
    overflow-x: auto;
  }

  .grid-header,
  .domain-row {
    display: grid;
    grid-template-columns: 100px repeat(12, 1fr);
    gap: 4px;
    margin-bottom: 4px;
  }

  .corner-cell {
    background: transparent;
  }

  .month-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
    padding: 0.25rem;
  }

  .domain-label {
    font-size: 0.875rem;
    color: #374151;
    padding: 0.5rem;
    font-weight: 500;
    text-align: right;
  }

  .participation-cell {
    background: #3b82f6;
    border-radius: 3px;
    min-height: 32px;
    cursor: default;
    transition: transform 0.15s ease;
  }

  .participation-cell:hover {
    transform: scale(1.1);
  }

  /* Pattern List */
  .pattern-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .pattern-list li {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border-left: 3px solid #3b82f6;
    margin: 0.5rem 0;
    border-radius: 4px;
    color: #4b5563;
  }

  @media (max-width: 768px) {
    section {
      padding: 1.5rem 1rem;
    }

    .months-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .grid-header,
    .domain-row {
      grid-template-columns: 80px repeat(12, 30px);
    }

    .month-label,
    .domain-label {
      font-size: 0.625rem;
    }

    .participation-cell {
      min-height: 24px;
    }
  }
</style>
