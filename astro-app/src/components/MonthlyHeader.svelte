<script lang="ts">
  /**
   * Monthly Header Component
   * Temporal navigation for month-based home page
   * 
   * DESIGN PRINCIPLES:
   * - Temporal navigation, not feature navigation
   * - Subtle UI, not dashboard-like buttons
   * - Clear orientation in time
   */

  import { getPreviousMonth, getNextMonth, getMonthKey, type MonthIdentifier } from '../lib/monthResolution';

  export let currentMonth: MonthIdentifier;
  export let displayName: string;
  export let isCurrentMonth: boolean;
  export let isFutureMonth: boolean;

  function navigateToPrevious() {
    const prev = getPreviousMonth(currentMonth);
    const monthKey = getMonthKey(prev);
    // Update URL with month parameter
    window.location.href = `/lifelab/?month=${monthKey}`;
  }

  function navigateToNext() {
    const next = getNextMonth(currentMonth);
    const monthKey = getMonthKey(next);
    window.location.href = `/lifelab/?month=${monthKey}`;
  }

  function navigateToCurrent() {
    window.location.href = '/lifelab/';
  }
</script>

<div class="monthly-header">
  <div class="month-nav">
    <button 
      class="nav-button nav-button-prev" 
      on:click={navigateToPrevious}
      aria-label="Previous month"
    >
      ←
    </button>

    <div class="month-display">
      <h1 class="month-name">{displayName}</h1>
      {#if !isCurrentMonth}
        <button class="current-month-link" on:click={navigateToCurrent}>
          Return to current month →
        </button>
      {/if}
    </div>

    <button 
      class="nav-button nav-button-next" 
      on:click={navigateToNext}
      aria-label="Next month"
    >
      →
    </button>
  </div>

  {#if isFutureMonth}
    <div class="future-notice">
      This month hasn't arrived yet. View only.
    </div>
  {/if}
</div>

<style>
  .monthly-header {
    margin-bottom: 2rem;
  }

  .month-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1rem 0;
  }

  .nav-button {
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
  }

  .nav-button:hover {
    background: #f5f5f5;
    border-color: #999;
    color: #222;
  }

  .nav-button:active {
    transform: scale(0.95);
  }

  .month-display {
    flex: 1;
    text-align: center;
  }

  .month-name {
    font-size: 1.75rem;
    font-weight: 600;
    color: #222;
    margin: 0;
  }

  .current-month-link {
    background: none;
    border: none;
    color: #666;
    font-size: 0.875rem;
    cursor: pointer;
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    text-decoration: underline;
  }

  .current-month-link:hover {
    color: #222;
  }

  .future-notice {
    background: #fff9e6;
    border: 1px solid #ffd700;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    text-align: center;
    color: #996600;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  @media (max-width: 640px) {
    .month-nav {
      gap: 1rem;
    }

    .month-name {
      font-size: 1.375rem;
    }

    .nav-button {
      padding: 0.375rem 0.75rem;
      font-size: 1.125rem;
    }

    .current-month-link {
      font-size: 0.8125rem;
    }
  }

  @media (max-width: 480px) {
    .month-name {
      font-size: 1.25rem;
    }

    .nav-button {
      padding: 0.25rem 0.5rem;
      font-size: 1rem;
    }
  }
</style>
