<script lang="ts">
  /**
   * Monthly Outcome Summary Component
   * 
   * DESIGN PRINCIPLES:
   * - Count only, no percentages
   * - No labels like "good" or "bad"
   * - Neutral visual tone
   * - Observational, not evaluative
   */

  import { onMount } from 'svelte';
  import { getMonthlyNotebook } from '../lib/storage';
  import { calculateMonthlyOutcome, type MonthlyOutcome } from '../lib/analytics';

  export let year: number;
  export let month: number;

  let outcome: MonthlyOutcome = {
    winDays: 0,
    neutralDays: 0,
    lossDays: 0,
    unsetDays: 0,
  };

  onMount(() => {
    const notebook = getMonthlyNotebook(year, month);
    if (notebook && notebook.dailyRows) {
      outcome = calculateMonthlyOutcome(notebook.dailyRows);
    }
  });
</script>

<div class="outcome-summary">
  <h3 class="summary-title">Monthly Outcomes</h3>
  <div class="outcome-grid">
    <div class="outcome-item">
      <div class="outcome-count">{outcome.winDays}</div>
      <div class="outcome-label">Win days</div>
    </div>
    <div class="outcome-item">
      <div class="outcome-count">{outcome.neutralDays}</div>
      <div class="outcome-label">Neutral days</div>
    </div>
    <div class="outcome-item">
      <div class="outcome-count">{outcome.lossDays}</div>
      <div class="outcome-label">Loss days</div>
    </div>
    <div class="outcome-item outcome-item-subtle">
      <div class="outcome-count">{outcome.unsetDays}</div>
      <div class="outcome-label">Unset</div>
    </div>
  </div>
</div>

<style>
  .outcome-summary {
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

  .outcome-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .outcome-item {
    text-align: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .outcome-item-subtle {
    opacity: 0.7;
  }

  .outcome-count {
    font-size: 2rem;
    font-weight: 700;
    color: #222;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .outcome-label {
    font-size: 0.875rem;
    color: #666;
    text-transform: capitalize;
  }

  @media (max-width: 768px) {
    .outcome-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .outcome-count {
      font-size: 1.75rem;
    }

    .outcome-label {
      font-size: 0.8125rem;
    }
  }

  @media (max-width: 480px) {
    .outcome-summary {
      padding: 1.25rem;
    }

    .outcome-grid {
      gap: 0.75rem;
    }

    .outcome-item {
      padding: 0.75rem;
    }

    .outcome-count {
      font-size: 1.5rem;
    }
  }
</style>
