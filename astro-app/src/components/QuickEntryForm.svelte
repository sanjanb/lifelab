<script lang="ts">
  /**
   * Quick Entry Form Island
   * Form for logging new domain entries
   * 
   * MIGRATION NOTE: Converted from modules/habits/habits.js renderQuickEntryForm
   * Preserves exact behavior - no changes
   */

  import { onMount } from 'svelte';
  import { saveEntry, getEntries } from '../lib/storage';
  import { createEntry } from '../lib/utils';
  import type { Domain } from '../lib/config';
  import type { Entry } from '../lib/storage';

  export let domainId: string;
  export let domainConfig: Domain;

  let formData = {
    value: '',
    notes: ''
  };

  let errors: Record<string, string> = {};
  let isSubmitting = false;

  function validateForm(): boolean {
    errors = {};

    if (!formData.value.trim()) {
      errors.value = 'This field is required';
      return false;
    }

    return true;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      // Create entry using utility function
      const entry = createEntry(formData.value, formData.notes);
      
      // Save to storage
      const success = saveEntry(domainId, entry);

      if (success) {
        // Clear form
        formData = { value: '', notes: '' };
        
        // Dispatch event to notify parent/other components
        window.dispatchEvent(new CustomEvent('entryAdded', { 
          detail: { domainId, entry } 
        }));
      } else {
        errors.general = 'Failed to save entry';
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      errors.general = 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }

  function handleClear() {
    formData = { value: '', notes: '' };
    errors = {};
  }
</script>

<div class="quick-entry-form-container">
  <form class="habit-entry-form" on:submit={handleSubmit}>
    <!-- Value Input -->
    <div class="form-group">
      <label for="entry-value" class="form-label">
        {domainConfig.displayName} Entry
      </label>
      <input
        type="text"
        id="entry-value"
        name="value"
        class="form-input"
        class:error={errors.value}
        bind:value={formData.value}
        placeholder={`e.g., ${getPlaceholder(domainId)}`}
        required
        disabled={isSubmitting}
      />
      {#if errors.value}
        <span class="error-message">{errors.value}</span>
      {/if}
    </div>

    <!-- Notes Input -->
    <div class="form-group">
      <label for="entry-notes" class="form-label">
        Notes (optional)
      </label>
      <textarea
        id="entry-notes"
        name="notes"
        class="form-textarea"
        bind:value={formData.notes}
        placeholder="Add any additional details..."
        rows="3"
        disabled={isSubmitting}
      />
    </div>

    <!-- Submit Button -->
    <div class="form-actions">
      <button 
        type="submit" 
        class="btn btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : `Log ${domainConfig.displayName}`}
      </button>
      
      <button 
        type="button" 
        class="btn btn-secondary"
        on:click={handleClear}
        disabled={isSubmitting}
      >
        Clear
      </button>
    </div>

    {#if errors.general}
      <div class="error-message general-error">{errors.general}</div>
    {/if}
  </form>
</div>

<script context="module" lang="ts">
  function getPlaceholder(domainId: string): string {
    const placeholders: Record<string, string> = {
      habits: 'Morning meditation, Exercise, Read for 30 minutes',
      learning: 'Completed React course module 3, Read 2 chapters of Clean Code',
      career: 'Completed project proposal, Team meeting, Code review',
      health: 'Ran 5km, Ate healthy breakfast, 8 hours sleep'
    };
    
    return placeholders[domainId] || 'Enter your activity...';
  }
</script>

<style>
  .quick-entry-form-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  .habit-entry-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #0066cc;
  }

  .form-input.error {
    border-color: #dc3545;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: #0066cc;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #0052a3;
  }

  .btn-secondary {
    background-color: #f0f0f0;
    color: #333;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #e0e0e0;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .general-error {
    background-color: #fff5f5;
    padding: 0.75rem;
    border-radius: 4px;
    border-left: 3px solid #dc3545;
    margin-top: 0.5rem;
  }
</style>
