<script lang="ts">
  /**
   * Domain Participation Summary Component
   * 
   * DESIGN PRINCIPLES:
   * - Show active day counts per domain
   * - Visualize gaps and clusters
   * - No ranking, no comparisons to other months
   * - Neutral presentation
   */

  import { onMount } from 'svelte';
  import { getMonthlyNotebook } from '../lib/storage';
  import { calculateDomainParticipation, type DomainParticipation } from '../lib/analytics';
  import { getAllDomains } from '../lib/config';

  export let year: number;
  export let month: number;
  export let daysInMonth: number;

  let participations: DomainParticipation[] = [];

  onMount(() => {
    const notebook = getMonthlyNotebook(year, month);
    const domains = getAllDomains();

    if (notebook && notebook.dailyRows) {
      participations = domains.map((domain) =>
        calculateDomainParticipation(notebook.dailyRows, domain.id, domain.displayName)
      );
    }
  });

  function getActivityWidth(activeDays: number, totalDays: number): string {
    return `${(activeDays / totalDays) * 100}%`;
  }
</script>

<div class="participation-summary">
  <h3 class="summary-title">Domain Participation</h3>
  <div class="participation-list">
    {#each participations as p}
      <div class="participation-item">
        <div class="participation-header">
          <div class="domain-name">{p.domainName}</div>
          <div class="active-count">{p.activeDays} days</div>
        </div>

        <div class="activity-bar-container">
          <div 
            class="activity-bar" 
            style="width: {getActivityWidth(p.activeDays, p.totalDays)}"
          ></div>
        </div>

        <div class="participation-notes">
          {#if p.hasGaps}
            <span class="note note-gap">gaps present</span>
          {/if}
          {#if p.hasClusters}
            <span class="note note-cluster">clustered activity</span>
          {/if}
          {#if p.activeDays === 0}
            <span class="note note-inactive">no activity</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .participation-summary {
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

  .participation-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .participation-item {
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .participation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .domain-name {
    font-weight: 600;
    color: #222;
    font-size: 0.9375rem;
  }

  .active-count {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }

  .activity-bar-container {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .activity-bar {
    height: 100%;
    background: #222;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .participation-notes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .note {
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    text-transform: lowercase;
  }

  .note-gap {
    background: #fff3cd;
    color: #856404;
  }

  .note-cluster {
    background: #d1ecf1;
    color: #0c5460;
  }

  .note-inactive {
    background: #f8d7da;
    color: #721c24;
  }

  @media (max-width: 640px) {
    .participation-summary {
      padding: 1.25rem;
    }

    .participation-item {
      padding: 0.875rem;
    }

    .domain-name {
      font-size: 0.875rem;
    }

    .active-count {
      font-size: 0.8125rem;
    }

    .note {
      font-size: 0.6875rem;
      padding: 0.1875rem 0.5rem;
    }
  }
</style>
