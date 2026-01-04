<script lang="ts">
  /**
   * Monthly Reflection Editor Island
   * Textarea with auto-save for monthly reflection
   * 
   * MIGRATION NOTE: Phase M4.3
   * Debounced auto-save to prevent excessive writes
   */

  import { onMount } from 'svelte';
  import { getMonthlyNotebook, saveMonthlyNotebook } from '../lib/storage';

  export let year: number;
  export let month: number;
  export let initialReflection: string = '';

  let reflection = initialReflection;
  let isSaving = false;
  let lastSaved: Date | null = null;
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    // Load current reflection
    const notebook = getMonthlyNotebook(year, month);
    if (notebook && notebook.reflection) {
      reflection = notebook.reflection;
    }
  });

  async function saveReflection() {
    if (isSaving) return;

    isSaving = true;

    try {
      const notebook = getMonthlyNotebook(year, month);
      if (!notebook) {
        console.error('Notebook not found');
        return;
      }

      notebook.reflection = reflection;
      const success = saveMonthlyNotebook(notebook);

      if (success) {
        lastSaved = new Date();
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      isSaving = false;
    }
  }

  // Debounced auto-save (1 second after typing stops)
  $: {
    if (reflection !== initialReflection) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      saveTimeout = setTimeout(() => {
        saveReflection();
      }, 1000);
    }
  }

  $: saveStatusText = (() => {
    if (isSaving) return 'Saving...';
    if (lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 5) return 'Saved just now';
      if (seconds < 60) return `Saved ${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      return `Saved ${minutes}m ago`;
    }
    return '';
  })();
</script>

<div class="reflection-editor">
  <div class="editor-header">
    <h3>Monthly Reflection</h3>
    {#if saveStatusText}
      <span class="save-status" class:saving={isSaving}>
        {saveStatusText}
      </span>
    {/if}
  </div>

  <textarea
    class="reflection-textarea"
    bind:value={reflection}
    placeholder="How was this month? What did you learn? What would you do differently?

Write your thoughts, insights, and observations here. This space is for looking back and learning from the month's experiences."
    rows="8"
  ></textarea>

  <div class="editor-footer">
    <span class="char-count">{reflection.length} characters</span>
  </div>
</div>

<style>
  .reflection-editor {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .editor-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #222;
  }

  .save-status {
    font-size: 0.85rem;
    color: #4CAF50;
    font-weight: 500;
  }

  .save-status.saving {
    color: #FF9800;
  }

  .reflection-textarea {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    transition: border-color 0.2s;
  }

  .reflection-textarea:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  .reflection-textarea::placeholder {
    color: #aaa;
  }

  .editor-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .char-count {
    font-size: 0.85rem;
    color: #999;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .reflection-editor {
      padding: 1rem;
    }

    .editor-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .reflection-textarea {
      min-height: 150px;
      font-size: 0.95rem;
    }
  }
</style>
