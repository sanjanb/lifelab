<script lang="ts">
  /**
   * Daily Row Controls Island
   * Dropdowns for intent, quality, and outcome per day
   * 
   * MIGRATION NOTE: Converted from notebook.js daily row rendering
   * Each day is a separate island instance - no shared state
   */

  import { onMount } from 'svelte';
  import { getMonthlyNotebook, saveMonthlyNotebook, type DayEntry } from '../lib/storage';
  import { aggregateAllDomainsToNotebook } from '../lib/notebookSync';

  export let year: number;
  export let month: number;
  export let dayNumber: number;
  export let initialData: {
    intent?: string;
    quality?: string;
    outcome?: string;
  } = {};

  let intent = initialData.intent || '';
  let quality = initialData.quality || '';
  let outcome = initialData.outcome || '';
  let isSaving = false;

  const dayKey = String(dayNumber);

  // Intent options
  const intentOptions = [
    { value: '', label: 'None' },
    { value: 'flow', label: 'Flow' },
    { value: 'focus', label: 'Focus' },
    { value: 'ease', label: 'Ease' }
  ];

  // Quality options
  const qualityOptions = [
    { value: '', label: 'None' },
    { value: '3', label: '3 - Excellent' },
    { value: '2', label: '2 - Good' },
    { value: '1', label: '1 - Fair' }
  ];

  // Outcome options
  const outcomeOptions = [
    { value: '', label: 'None' },
    { value: 'win', label: 'Win' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'loss', label: 'Loss' }
  ];

  onMount(() => {
    // Ensure notebook exists and is synced with domain entries
    aggregateAllDomainsToNotebook(year, month);
    
    // Load current values from storage
    const notebook = getMonthlyNotebook(year, month);
    if (notebook && notebook.days[dayKey]) {
      const day = notebook.days[dayKey];
      intent = day.intent || '';
      quality = day.quality || '';
      outcome = day.outcome || '';
    }
  });

  async function saveChanges() {
    if (isSaving) return;
    
    isSaving = true;

    try {
      const notebook = getMonthlyNotebook(year, month);
      if (!notebook) {
        console.error('Notebook not found');
        return;
      }

      if (!notebook.days[dayKey]) {
        console.error(`Day ${dayKey} not found in notebook`);
        return;
      }

      // Update only the changed fields
      notebook.days[dayKey] = {
        ...notebook.days[dayKey],
        intent: intent || undefined,
        quality: quality || undefined,
        outcome: outcome || undefined
      };

      saveMonthlyNotebook(notebook);
    } catch (error) {
      console.error('Error saving daily controls:', error);
    } finally {
      isSaving = false;
    }
  }

  // Auto-save on change (only in browser)
  $: if (typeof window !== 'undefined' && 
         (intent !== initialData.intent || 
          quality !== initialData.quality || 
          outcome !== initialData.outcome)) {
    saveChanges();
  }
</script>

<div class="daily-controls">
  <select 
    class="control-select intent-select"
    bind:value={intent}
    disabled={isSaving}
    title="Daily Intent"
  >
    {#each intentOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <select 
    class="control-select quality-select"
    bind:value={quality}
    disabled={isSaving}
    title="Day Quality"
  >
    {#each qualityOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <select 
    class="control-select outcome-select"
    bind:value={outcome}
    disabled={isSaving}
    title="Day Outcome"
  >
    {#each outcomeOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>

<style>
  .daily-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .control-select {
    padding: 0.4rem 0.6rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 80px;
  }

  .control-select:hover:not(:disabled) {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }

  .control-select:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  .control-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f5f5f5;
  }

  .intent-select {
    flex: 1;
  }

  .quality-select {
    flex: 1;
  }

  .outcome-select {
    flex: 1;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .daily-controls {
      flex-wrap: wrap;
    }
    
    .control-select {
      min-width: 60px;
      font-size: 0.85rem;
      padding: 0.3rem 0.5rem;
    }
  }
</style>
