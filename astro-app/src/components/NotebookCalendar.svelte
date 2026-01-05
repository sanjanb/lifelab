<script lang="ts">
  /**
   * Notebook Calendar Container
   * Manages state between CalendarGrid and DayDetailPanel
   * 
   * Handles:
   * - Day selection from calendar
   * - Showing/hiding detail panel
   * - Passing data between components
   */

  import CalendarGrid from './CalendarGrid.svelte';
  import DayDetailPanel from './DayDetailPanel.svelte';

  export let year: number;
  export let month: number;
  export let currentDay: number | null = null;

  let selectedDay: number | null = null;
  let showDetailPanel = false;

  function handleDaySelected(event: CustomEvent) {
    selectedDay = event.detail.dayNumber;
    showDetailPanel = true;
    
    // Scroll to detail panel smoothly
    setTimeout(() => {
      const panel = document.querySelector('.day-detail-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  function handleCloseDetail() {
    showDetailPanel = false;
    selectedDay = null;
  }

  $: isSelectedDayToday = selectedDay === currentDay;
</script>

<div class="notebook-calendar-container">
  <!-- Calendar Grid -->
  <CalendarGrid 
    {year}
    {month}
    {currentDay}
    {selectedDay}
    on:daySelected={handleDaySelected}
  />

  <!-- Day Detail Panel (shown when day is selected) -->
  {#if showDetailPanel && selectedDay !== null}
    <DayDetailPanel 
      {year}
      {month}
      dayNumber={selectedDay}
      isToday={isSelectedDayToday}
      onClose={handleCloseDetail}
    />
  {/if}
</div>

<style>
  .notebook-calendar-container {
    width: 100%;
  }
</style>
