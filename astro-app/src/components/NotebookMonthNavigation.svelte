<script lang="ts">
  /**
   * Notebook Month Navigation Island
   * Previous/Next month controls
   * 
   * MIGRATION NOTE: Phase M4.3
   * Handles month switching and triggers notebook reload
   */

  import { formatMonthYear } from '../lib/utils';

  export let currentYear: number;
  export let currentMonth: number;

  $: monthTitle = formatMonthYear(currentYear, currentMonth);

  function previousMonth() {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    navigateToMonth(newYear, newMonth);
  }

  function nextMonth() {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    navigateToMonth(newYear, newMonth);
  }

  function navigateToMonth(year: number, month: number) {
    // Navigate to notebook page with query params
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    window.location.href = `/lifelab/notebook?${params}`;
  }

  function goToCurrentMonth() {
    const now = new Date();
    navigateToMonth(now.getFullYear(), now.getMonth() + 1);
  }

  // Check if we're viewing current month
  $: isCurrentMonth = (() => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === (now.getMonth() + 1);
  })();
</script>

<div class="month-navigation">
  <button class="nav-btn prev" on:click={previousMonth} title="Previous Month">
    <span class="arrow">←</span>
    <span class="label">Previous</span>
  </button>

  <div class="current-month">
    <h2 class="month-title">{monthTitle}</h2>
    {#if !isCurrentMonth}
      <button class="today-btn" on:click={goToCurrentMonth}>
        Go to Current Month
      </button>
    {/if}
  </div>

  <button class="nav-btn next" on:click={nextMonth} title="Next Month">
    <span class="label">Next</span>
    <span class="arrow">→</span>
  </button>
</div>

<style>
  .month-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    color: #555;
    transition: all 0.2s;
  }

  .nav-btn:hover {
    background: #f5f5f5;
    border-color: #0066cc;
    color: #0066cc;
  }

  .nav-btn:active {
    transform: scale(0.98);
  }

  .arrow {
    font-size: 1.2rem;
    line-height: 1;
  }

  .current-month {
    flex: 1;
    text-align: center;
  }

  .month-title {
    margin: 0;
    font-size: 1.5rem;
    color: #222;
    font-weight: 600;
  }

  .today-btn {
    margin-top: 0.5rem;
    padding: 0.4rem 0.8rem;
    background: #e3f2fd;
    border: none;
    border-radius: 4px;
    color: #1976d2;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .today-btn:hover {
    background: #bbdefb;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .month-navigation {
      flex-direction: column;
      gap: 0.75rem;
    }

    .nav-btn .label {
      display: none;
    }

    .nav-btn {
      width: 48px;
      height: 48px;
      padding: 0;
      justify-content: center;
    }

    .current-month {
      order: -1;
      width: 100%;
    }

    .month-title {
      font-size: 1.25rem;
    }
  }
</style>
