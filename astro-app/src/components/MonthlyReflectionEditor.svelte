<script lang="ts">
  /**
   * Monthly Reflection Editor Island
   * Single sentence reflection with auto-save
   * 
   * PHASE H5 PRINCIPLE:
   * - Single sentence only
   * - Starter prompt provided
   * - Anchors memory, not documentation
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

  const MAX_LENGTH = 200; // Single sentence constraint
  const starterPrompts = [
    'This month felt like...',
    'The most meaningful part was...',
    'I learned that...',
    'What stood out was...',
    'This month reminded me that...',
  ];

  let currentPrompt = starterPrompts[0];

  onMount(() => {
    // Load current reflection
    const notebook = getMonthlyNotebook(year, month);
    if (notebook && notebook.reflection) {
      reflection = notebook.reflection;
    }

    // Random starter prompt
    currentPrompt = starterPrompts[Math.floor(Math.random() * starterPrompts.length)];
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

  $: charactersRemaining = MAX_LENGTH - reflection.length;
  $: isOverLimit = reflection.length > MAX_LENGTH;

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

  <div class="starter-prompt">
    <span class="prompt-label">Starter:</span>
    <span class="prompt-text">{currentPrompt}</span>
  </div>

  <textarea
    class="reflection-textarea"
    class:over-limit={isOverLimit}
    bind:value={reflection}
    placeholder="Complete the thought above, or write your own single sentence reflection."
    rows="3"
    maxlength={MAX_LENGTH}
  ></textarea>

  <div class="editor-footer">
    <span class="hint-text">One sentence to anchor the month</span>
    <span 
      class="char-count" 
      class:warning={charactersRemaining < 20}
      class:error={isOverLimit}
    >
      {charactersRemaining} characters remaining
    </span>
  </div>
  </div>
</div>

<style>
  .reflection-editor {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .editor-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #222;
    margin: 0;
  }

  .save-status {
    font-size: 0.8125rem;
    color: #4CAF50;
    font-weight: 500;
  }

  .save-status.saving {
    color: #FF9800;
  }

  .starter-prompt {
    background: #f9f9f9;
    border-left: 3px solid #222;
    padding: 0.875rem 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }

  .prompt-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 0.5rem;
  }

  .prompt-text {
    font-size: 0.9375rem;
    color: #222;
    font-style: italic;
  }

  .reflection-textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9375rem;
    line-height: 1.6;
    resize: vertical;
    transition: border-color 0.2s;
  }

  .reflection-textarea:focus {
    outline: none;
    border-color: #222;
  }

  .reflection-textarea.over-limit {
    border-color: #dc3545;
  }

  .reflection-textarea::placeholder {
    color: #aaa;
  }

  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    color: #999;
  }

  .hint-text {
    color: #666;
    font-style: italic;
  }

  .char-count {
    font-family: monospace;
    color: #999;
  }

  .char-count.warning {
    color: #f0ad4e;
    font-weight: 600;
  }

  .char-count.error {
    color: #dc3545;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    .reflection-editor {
      padding: 1.25rem;
    }

    .reflection-textarea {
      font-size: 0.875rem;
    }
  }
</style>
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
