<script lang="ts">
  /**
   * Entry History List Island
   * Displays and manages entry history for a domain
   * 
   * MIGRATION NOTE: Converted from domain-specific history rendering
   * Preserves exact behavior
   */

  import { onMount } from 'svelte';
  import { getEntries, deleteEntry } from '../lib/storage';
  import { formatDate, formatDateTime } from '../lib/utils';
  import type { Entry } from '../lib/storage';

  export let domainId: string;
  export let initialEntries: Entry[] = [];

  let entries: Entry[] = initialEntries;
  let editingId: string | null = null;
  let deleteConfirmId: string | null = null;

  onMount(() => {
    // Load from localStorage on client
    refreshEntries();

    // Listen for new entries
    const handleEntryAdded = (event: CustomEvent) => {
      if (event.detail.domainId === domainId) {
        refreshEntries();
      }
    };

    window.addEventListener('entryAdded', handleEntryAdded as EventListener);

    return () => {
      window.removeEventListener('entryAdded', handleEntryAdded as EventListener);
    };
  });

  function refreshEntries() {
    entries = getEntries(domainId);
    // Sort by timestamp descending (newest first)
    entries.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  function handleDelete(entryId: string) {
    deleteConfirmId = entryId;
  }

  function confirmDelete() {
    if (deleteConfirmId) {
      const success = deleteEntry(domainId, deleteConfirmId);
      if (success) {
        refreshEntries();
      }
      deleteConfirmId = null;
    }
  }

  function cancelDelete() {
    deleteConfirmId = null;
  }

  function startEdit(entryId: string) {
    editingId = entryId;
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<div class="history-container">
  <div class="history-header">
    <h3>Recent Entries</h3>
    <span class="entry-count">{entries.length} total</span>
  </div>

  {#if entries.length === 0}
    <div class="empty-state">
      <p>No entries yet. Log your first entry above!</p>
    </div>
  {:else}
    <div class="entry-list">
      {#each entries as entry (entry.id)}
        <div class="entry-card">
          <div class="entry-header">
            <span class="entry-date">{formatDateTime(entry.timestamp)}</span>
            <div class="entry-actions">
              <!-- Edit button - Phase M4.1 simplified: no inline editing yet -->
              <!-- <button class="action-btn" on:click={() => startEdit(entry.id)}>
                Edit
              </button> -->
              <button class="action-btn delete" on:click={() => handleDelete(entry.id)}>
                Delete
              </button>
            </div>
          </div>

          <div class="entry-content">
            <div class="entry-value">{entry.value}</div>
            {#if entry.notes}
              <div class="entry-notes">{entry.notes}</div>
            {/if}
          </div>

          <!-- Delete Confirmation -->
          {#if deleteConfirmId === entry.id}
            <div class="delete-confirm">
              <p>Are you sure you want to delete this entry?</p>
              <div class="confirm-actions">
                <button class="btn btn-danger" on:click={confirmDelete}>
                  Yes, Delete
                </button>
                <button class="btn btn-secondary" on:click={cancelDelete}>
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .history-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #eee;
  }

  .history-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #222;
  }

  .entry-count {
    background: #f0f0f0;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    color: #666;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #999;
  }

  .empty-state p {
    margin: 0;
  }

  .entry-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .entry-card {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 1rem;
    background: #fafafa;
    transition: box-shadow 0.2s;
  }

  .entry-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .entry-date {
    font-size: 0.85rem;
    color: #666;
  }

  .entry-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.25rem 0.75rem;
    border: none;
    background: transparent;
    color: #0066cc;
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .action-btn:hover {
    background-color: #f0f0f0;
  }

  .action-btn.delete {
    color: #dc3545;
  }

  .action-btn.delete:hover {
    background-color: #fff5f5;
  }

  .entry-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .entry-value {
    font-size: 1rem;
    color: #222;
    font-weight: 500;
  }

  .entry-notes {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
    padding-left: 1rem;
    border-left: 3px solid #ddd;
  }

  .delete-confirm {
    margin-top: 1rem;
    padding: 1rem;
    background: #fff5f5;
    border-radius: 4px;
    border: 1px solid #ffdddd;
  }

  .delete-confirm p {
    margin: 0 0 0.75rem;
    color: #dc3545;
    font-weight: 500;
  }

  .confirm-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #c82333;
  }

  .btn-secondary {
    background-color: #f0f0f0;
    color: #333;
  }

  .btn-secondary:hover {
    background-color: #e0e0e0;
  }
</style>
