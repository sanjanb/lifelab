<script lang="ts">
/**
 * Insight Observations Component
 * 
 * PHASE 5: Descriptive Analytics Text
 * 
 * Displays auto-generated textual observations about monthly patterns.
 * 
 * DESIGN PRINCIPLES:
 * - Subdued styling (never dominates the page)
 * - Optional visibility toggle
 * - Descriptive language only
 * - Maximum visual quietness
 */

import type { InsightObservation } from '../lib/insightText';

export let observations: InsightObservation[] = [];
export let monthSummary: string = '';

let isExpanded = true;

function toggleExpanded() {
  isExpanded = !isExpanded;
}

// Icon for observation type
function getTypeIcon(type: string): string {
  switch (type) {
    case 'cluster': return '▪';
    case 'gap': return '○';
    case 'consistency': return '~';
    case 'participation': return '●';
    default: return '•';
  }
}
</script>

<div class="insight-observations">
  <button class="section-toggle" on:click={toggleExpanded}>
    <span class="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
    <h3 class="section-title">Pattern Observations</h3>
  </button>

  {#if isExpanded}
    <div class="observations-content">
      {#if monthSummary}
        <p class="month-summary">{monthSummary}</p>
      {/if}

      {#if observations.length > 0}
        <ul class="observation-list">
          {#each observations as obs}
            <li class="observation-item">
              <span class="obs-icon">{getTypeIcon(obs.type)}</span>
              <span class="obs-text">{obs.text}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="no-observations">No notable patterns detected this month.</p>
      {/if}

      <p class="disclaimer">
        These observations are descriptive only—they describe what happened,
        not whether it was good or bad.
      </p>
    </div>
  {/if}
</div>

<style>
  .insight-observations {
    margin: 2rem 0;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fafafa;
  }

  .section-toggle {
    width: 100%;
    padding: 1rem 1.25rem;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .section-toggle:hover {
    background-color: #f3f4f6;
  }

  .toggle-icon {
    font-size: 0.75rem;
    color: #6b7280;
    transition: transform 0.2s ease;
  }

  .section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .observations-content {
    padding: 0 1.25rem 1.25rem 1.25rem;
  }

  .month-summary {
    margin: 0 0 1rem 0;
    padding: 0.75rem 1rem;
    background: white;
    border-left: 3px solid #6b7280;
    font-size: 0.9375rem;
    color: #1f2937;
    line-height: 1.6;
  }

  .observation-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }

  .observation-item {
    padding: 0.625rem 0;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .observation-item:last-child {
    border-bottom: none;
  }

  .obs-icon {
    font-size: 0.875rem;
    color: #9ca3af;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .obs-text {
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.6;
  }

  .no-observations {
    margin: 0;
    padding: 1rem;
    text-align: center;
    font-size: 0.875rem;
    color: #9ca3af;
    font-style: italic;
  }

  .disclaimer {
    margin: 1rem 0 0 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    color: #6b7280;
    background: #f9fafb;
    border-radius: 4px;
    line-height: 1.5;
    font-style: italic;
  }

  @media (max-width: 640px) {
    .section-toggle {
      padding: 0.875rem 1rem;
    }

    .observations-content {
      padding: 0 1rem 1rem 1rem;
    }

    .month-summary,
    .obs-text {
      font-size: 0.8125rem;
    }
  }
</style>
