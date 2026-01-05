<script lang="ts">
  /**
   * Month Closure Button Component
   * 
   * DESIGN PRINCIPLES:
   * - Explicit closure action
   * - After closure: notebook becomes read-only
   * - Analytics remain visible
   * - Feels like archiving, not submitting
   */

  import { onMount } from 'svelte';

  export let year: number;
  export let month: number;
  export let isClosed: boolean = false;

  let showConfirmation = false;
  let closedMonths: Set<string> = new Set();

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  onMount(() => {
    // Load closed months from localStorage
    const closedData = localStorage.getItem('lifelab_closedMonths');
    if (closedData) {
      try {
        closedMonths = new Set(JSON.parse(closedData));
        isClosed = closedMonths.has(monthKey);
      } catch (e) {
        console.error('Error loading closed months:', e);
      }
    }
  });

  function handleCloseRequest() {
    showConfirmation = true;
  }

  function confirmClose() {
    // Add to closed months
    closedMonths.add(monthKey);
    
    // Save to localStorage
    localStorage.setItem('lifelab_closedMonths', JSON.stringify([...closedMonths]));
    
    isClosed = true;
    showConfirmation = false;

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('monthClosed', { 
      detail: { year, month } 
    }));

    // Auto-advance to next month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    
    // Navigate to next month after a brief delay (allows user to see confirmation)
    setTimeout(() => {
      window.location.href = `/lifelab/notebook?month=${nextMonthKey}`;
    }, 1500);
  }

  function cancelClose() {
    showConfirmation = false;
  }

  function handleReopenMonth() {
    if (confirm('Reopen this month for editing?')) {
      closedMonths.delete(monthKey);
      localStorage.setItem('lifelab_closedMonths', JSON.stringify([...closedMonths]));
      isClosed = false;

      window.dispatchEvent(new CustomEvent('monthReopened', { 
        detail: { year, month } 
      }));
    }
  }
</script>

<div class="month-closure-container">
  {#if isClosed}
    <div class="closed-notice">
      <div class="closed-icon">🔒</div>
      <div class="closed-content">
        <div class="closed-title">Month Closed</div>
        <div class="closed-description">
          This month has been archived. All entries are read-only.
        </div>
      </div>
      <button class="reopen-button" on:click={handleReopenMonth}>
        Reopen Month
      </button>
    </div>
  {:else if !showConfirmation}
    <div class="closure-prompt">
      <div class="prompt-content">
        <div class="prompt-title">Ready to close this month?</div>
        <div class="prompt-description">
          Closing the month will mark it as complete and make it read-only. You can reopen it later if needed.
        </div>
      </div>
      <button class="close-button" on:click={handleCloseRequest}>
        Close Month
      </button>
    </div>
  {:else}
    <div class="confirmation-dialog">
      <div class="dialog-content">
        <div class="dialog-title">Close this month?</div>
        <div class="dialog-message">
          This will archive the month and make all entries read-only. Analytics will remain visible.
        </div>
      </div>
      <div class="dialog-actions">
        <button class="confirm-button" on:click={confirmClose}>
          Yes, Close Month
        </button>
        <button class="cancel-button" on:click={cancelClose}>
          Cancel
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .month-closure-container {
    margin: 2rem 0;
  }

  .closed-notice {
    background: #f0f0f0;
    border: 2px solid #ccc;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .closed-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .closed-content {
    flex: 1;
  }

  .closed-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 0.25rem;
  }

  .closed-description {
    font-size: 0.875rem;
    color: #666;
  }

  .reopen-button {
    background: white;
    border: 1px solid #999;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #222;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reopen-button:hover {
    background: #f5f5f5;
    border-color: #666;
  }

  .closure-prompt {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .prompt-content {
    flex: 1;
  }

  .prompt-title {
    font-size: 1.0625rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 0.375rem;
  }

  .prompt-description {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
  }

  .close-button {
    background: #222;
    border: none;
    border-radius: 6px;
    padding: 0.875rem 1.75rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .close-button:hover {
    background: #444;
  }

  .confirmation-dialog {
    background: #fffbf0;
    border: 2px solid #ffd700;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .dialog-content {
    margin-bottom: 1.5rem;
  }

  .dialog-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 0.5rem;
  }

  .dialog-message {
    font-size: 0.9375rem;
    color: #666;
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .confirm-button {
    background: #222;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .confirm-button:hover {
    background: #444;
  }

  .cancel-button {
    background: white;
    border: 1px solid #999;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #222;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-button:hover {
    background: #f5f5f5;
    border-color: #666;
  }

  @media (max-width: 768px) {
    .closed-notice,
    .closure-prompt {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .reopen-button,
    .close-button {
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .dialog-actions {
      flex-direction: column-reverse;
    }

    .confirm-button,
    .cancel-button {
      width: 100%;
    }
  }
</style>
