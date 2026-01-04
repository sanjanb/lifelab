<script lang="ts">
  /**
   * Trend Observations Component
   * 
   * DESIGN PRINCIPLES:
   * - Textual observations (auto-generated)
   * - Observational language only
   * - No advice, no judgment
   * - Examples: "Health activity dipped after mid-month."
   */

  import { onMount } from 'svelte';
  import { getMonthlyNotebook } from '../lib/storage';
  import { calculateDomainParticipation, generateTrendObservations, type TrendObservation } from '../lib/analytics';
  import { getAllDomains } from '../lib/config';

  export let year: number;
  export let month: number;

  let observations: TrendObservation[] = [];

  onMount(() => {
    const notebook = getMonthlyNotebook(year, month);
    const domains = getAllDomains();

    if (notebook && notebook.dailyRows) {
      const participations = domains.map((domain) =>
        calculateDomainParticipation(notebook.dailyRows, domain.id, domain.displayName)
      );

      observations = generateTrendObservations(notebook.dailyRows, participations);
    }
  });

  function getIconForType(type: string): string {
    switch (type) {
      case 'pattern': return '📊';
      case 'gap': return '⏸️';
      case 'cluster': return '🔄';
      case 'shift': return '📈';
      default: return '•';
    }
  }
</script>

{#if observations.length > 0}
  <div class="trend-observations">
    <h3 class="summary-title">Trend Observations</h3>
    <div class="observations-list">
      {#each observations as obs}
        <div class="observation-item">
          <span class="observation-icon">{getIconForType(obs.type)}</span>
          <span class="observation-text">{obs.text}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .trend-observations {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .summary-title {
    font-size: 1rem;
    font-weight: 600;
    color: #222;
    margin: 0 0 1.25rem 0;
  }

  .observations-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .observation-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 6px;
    border-left: 3px solid #222;
  }

  .observation-icon {
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .observation-text {
    font-size: 0.9375rem;
    color: #333;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .trend-observations {
      padding: 1.25rem;
    }

    .observation-item {
      padding: 0.875rem;
      gap: 0.625rem;
    }

    .observation-icon {
      font-size: 1.125rem;
    }

    .observation-text {
      font-size: 0.875rem;
    }
  }
</style>
