<script lang="ts">
  /**
   * Month Action Buttons Island
   * Export, Import, and Close Month functionality
   * 
   * MIGRATION NOTE: Phase M4.3
   * Handles JSON export/import and month closure
   */

  import { getMonthlyNotebook, saveMonthlyNotebook } from '../lib/storage';
  import type { MonthlyNotebook } from '../lib/storage';
  import Icon from './Icon.svelte';

  export let year: number;
  export let month: number;
  export let isClosed: boolean = false;

  let showCloseConfirm = false;
  let isClosing = false;
  let fileInput: HTMLInputElement;

  function exportMonth() {
    const notebook = getMonthlyNotebook(year, month);
    if (!notebook) {
      alert('No data found for this month');
      return;
    }

    const json = JSON.stringify(notebook, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifelab_${year}_${String(month).padStart(2, '0')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    fileInput.click();
  }

  function handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content) as MonthlyNotebook;

        // Validate structure
        if (!imported.year || !imported.month || !imported.days) {
          alert('Invalid notebook file format');
          return;
        }

        // Confirm before overwriting
        const shouldImport = confirm(
          `Import data for ${imported.year}-${String(imported.month).padStart(2, '0')}?\n\nThis will REPLACE the current notebook data.`
        );

        if (shouldImport) {
          const success = saveMonthlyNotebook(imported);
          if (success) {
            alert('Import successful! Refreshing page...');
            window.location.reload();
          } else {
            alert('Import failed');
          }
        }
      } catch (error) {
        alert('Error reading file: Invalid JSON format');
        console.error(error);
      }
    };

    reader.readAsText(file);
  }

  function showCloseDialog() {
    showCloseConfirm = true;
  }

  function cancelClose() {
    showCloseConfirm = false;
  }

  async function confirmClose() {
    isClosing = true;

    try {
      const notebook = getMonthlyNotebook(year, month);
      if (!notebook) {
        alert('Notebook not found');
        return;
      }

      // Mark as closed
      notebook._closed = true;
      const success = saveMonthlyNotebook(notebook);

      if (success) {
        alert('Month closed successfully! The notebook is now read-only.');
        window.location.reload();
      } else {
        alert('Failed to close month');
      }
    } catch (error) {
      console.error('Error closing month:', error);
      alert('An error occurred while closing the month');
    } finally {
      isClosing = false;
      showCloseConfirm = false;
    }
  }
</script>

<div class="month-actions">
  <button class="action-btn export-btn" on:click={exportMonth}>
    <Icon name="download" size={18} />
    Export Month
  </button>

  <button class="action-btn import-btn" on:click={triggerImport}>
    <Icon name="upload" size={18} />
    Import Month
  </button>

  {#if !isClosed}
    <button class="action-btn close-btn" on:click={showCloseDialog}>
      <Icon name="lock" size={18} />
      Close Month
    </button>
  {:else}
    <div class="closed-badge">
      <Icon name="lock" size={18} />
      Month Closed (Read-Only)
    </div>
  {/if}

  <input
    type="file"
    accept=".json"
    bind:this={fileInput}
    on:change={handleImport}
    style="display: none;"
  />
</div>

{#if showCloseConfirm}
  <div class="modal-overlay" on:click={cancelClose}>
    <div class="modal-dialog" on:click|stopPropagation>
      <div class="modal-header">
        <h3>Close This Month?</h3>
      </div>

      <div class="modal-body">
        <p>
          <strong>Warning:</strong> Closing this month will make it read-only.
        </p>
        <p>You will no longer be able to:</p>
        <ul>
          <li>Edit daily controls (intent, quality, outcome)</li>
          <li>Modify the monthly reflection</li>
          <li>Add new entries (though domain pages remain editable)</li>
        </ul>
        <p>
          This action is useful for archiving completed months and preventing accidental changes.
        </p>
        <p>
          <strong>Note:</strong> You can still export/import the month data if needed.
        </p>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" on:click={cancelClose} disabled={isClosing}>
          Cancel
        </button>
        <button class="confirm-btn" on:click={confirmClose} disabled={isClosing}>
          {isClosing ? 'Closing...' : 'Yes, Close Month'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .month-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #333;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: #f5f5f5;
    border-color: #0066cc;
    color: #0066cc;
  }

  .action-btn:active {
    transform: translateY(1px);
  }

  .action-btn .icon {
    font-size: 1.2rem;
  }

  .export-btn:hover {
    border-color: #4CAF50;
    color: #4CAF50;
  }

  .import-btn:hover {
    border-color: #FF9800;
    color: #FF9800;
  }

  .close-btn {
    background: #fff3f3;
    border-color: #ffcdd2;
    color: #d32f2f;
  }

  .close-btn:hover {
    background: #ffebee;
    border-color: #d32f2f;
  }

  .closed-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: #f5f5f5;
    border: 1px solid #999;
    border-radius: 6px;
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .closed-badge .icon {
    font-size: 1.2rem;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-dialog {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #d32f2f;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-body p {
    margin: 0 0 1rem 0;
    line-height: 1.6;
  }

  .modal-body ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .modal-body li {
    margin: 0.25rem 0;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: white;
    border: 1px solid #ddd;
    color: #666;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #f5f5f5;
  }

  .confirm-btn {
    background: #d32f2f;
    border: 1px solid #d32f2f;
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: #b71c1c;
  }

  .cancel-btn:disabled,
  .confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .month-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .action-btn,
    .closed-badge {
      width: 100%;
      justify-content: center;
    }

    .modal-dialog {
      margin: 1rem;
    }

    .modal-footer {
      flex-direction: column-reverse;
    }

    .cancel-btn,
    .confirm-btn {
      width: 100%;
    }
  }
</style>
