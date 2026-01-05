<script lang="ts">
  /**
   * Day Detail Panel Component
   * Expanded view showing full controls for a selected day
   * 
   * Displays:
   * - Day name and date
   * - Intent/Quality/Outcome dropdowns (via DailyRowControls)
   * - Domain presence badges
   * - Collapse button
   */

  import DailyRowControls from './DailyRowControls.svelte';
  import DomainPresenceBadges from './DomainPresenceBadges.svelte';

  export let year: number;
  export let month: number;
  export let dayNumber: number;
  export let isToday: boolean = false;
  export let onClose: () => void = () => {};

  $: dayDate = new Date(year, month - 1, dayNumber);
  $: dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
  $: fullDate = dayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
</script>

<div class="day-detail-panel" class:today={isToday}>
  <div class="panel-header">
    <div class="day-info">
      <h3>
        Day {dayNumber} - {dayName}
        {#if isToday}
          <span class="today-badge">Today</span>
        {/if}
      </h3>
      <p class="full-date">{fullDate}</p>
    </div>
    <button class="close-btn" on:click={onClose} title="Collapse">
      ✕
    </button>
  </div>

  <div class="panel-content">
    <div class="controls-section">
      <label class="section-label">Day Settings</label>
      <DailyRowControls 
        {year}
        {month}
        {dayNumber}
        initialData={{}}
      />
    </div>

    <div class="domains-section">
      <label class="section-label">Active Domains</label>
      <DomainPresenceBadges 
        {year}
        {month}
        {dayNumber}
      />
    </div>
  </div>
</div>

<style>
  .day-detail-panel {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .day-detail-panel.today {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .day-info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .today-badge {
    font-size: 0.75rem;
    font-weight: 600;
    background: #3b82f6;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .full-date {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .panel-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .section-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .controls-section {
    padding-right: 2rem;
    border-right: 1px solid #e5e7eb;
  }

  .domains-section {
    display: flex;
    flex-direction: column;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .day-detail-panel {
      padding: 1rem;
    }

    .panel-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .controls-section {
      padding-right: 0;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1.5rem;
    }

    .day-info h3 {
      font-size: 1.125rem;
    }

    .full-date {
      font-size: 0.8rem;
    }
  }
</style>
