<script lang="ts">
/**
 * Export/Import Component
 * 
 * Handles data backup and restoration with user-friendly interface.
 * Provides both export (download) and import (upload) functionality.
 */

import { onMount } from 'svelte';
import { downloadExportData, importFromFile, getStorageStats } from '../lib/storage';

let stats = { totalEntries: 0, totalNotebooks: 0, domains: {}, estimatedSize: 0 };
let isExporting = false;
let isImporting = false;
let importMode: 'merge' | 'replace' = 'merge';
let importResult: { success: boolean; imported: number; errors: number } | null = null;
let errorMessage = '';

onMount(() => {
  loadStats();
});

function loadStats() {
  stats = getStorageStats();
}

async function handleExport() {
  try {
    isExporting = true;
    errorMessage = '';
    downloadExportData();
    isExporting = false;
  } catch (error) {
    errorMessage = `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    isExporting = false;
  }
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  try {
    isImporting = true;
    errorMessage = '';
    importResult = null;

    const result = await importFromFile(file, importMode);
    importResult = result;
    
    if (result.success) {
      loadStats();
      // Reload page to reflect imported data
      setTimeout(() => window.location.reload(), 2000);
    }
  } catch (error) {
    errorMessage = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  } finally {
    isImporting = false;
    input.value = ''; // Reset input
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
</script>

<div class="export-import">
  <h3 class="section-title">Data Backup & Restore</h3>

  <!-- Storage Statistics -->
  <div class="stats-card">
    <h4>Current Data</h4>
    <div class="stat-grid">
      <div class="stat-item">
        <span class="stat-label">Entries</span>
        <span class="stat-value">{stats.totalEntries}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Notebooks</span>
        <span class="stat-value">{stats.totalNotebooks}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Storage</span>
        <span class="stat-value">{formatBytes(stats.estimatedSize * 2)}</span>
      </div>
    </div>
  </div>

  <!-- Export Section -->
  <div class="action-card">
    <div class="card-header">
      <h4>📥 Export Data</h4>
      <p class="card-description">Download all your data as a JSON backup file</p>
    </div>
    <button 
      class="btn btn-primary" 
      on:click={handleExport}
      disabled={isExporting}
    >
      {isExporting ? 'Exporting...' : 'Download Backup'}
    </button>
  </div>

  <!-- Import Section -->
  <div class="action-card">
    <div class="card-header">
      <h4>📤 Import Data</h4>
      <p class="card-description">Restore from a previous backup file</p>
    </div>

    <div class="import-options">
      <label class="radio-label">
        <input type="radio" bind:group={importMode} value="merge" />
        <span>Merge - Keep existing data and add imported items</span>
      </label>
      <label class="radio-label">
        <input type="radio" bind:group={importMode} value="replace" />
        <span>Replace - Delete all data and import (⚠️ irreversible)</span>
      </label>
    </div>

    <label class="file-input-label">
      <input 
        type="file" 
        accept=".json"
        on:change={handleImport}
        disabled={isImporting}
        class="file-input"
      />
      <span class="btn btn-secondary">
        {isImporting ? 'Importing...' : 'Choose Backup File'}
      </span>
    </label>
  </div>

  <!-- Result Messages -->
  {#if importResult}
    <div class="result-message success">
      ✓ Import successful! Imported {importResult.imported} items.
      {#if importResult.errors > 0}
        <br/>{importResult.errors} errors occurred.
      {/if}
      <br/>Page will reload in 2 seconds...
    </div>
  {/if}

  {#if errorMessage}
    <div class="result-message error">
      ✗ {errorMessage}
    </div>
  {/if}

  <!-- Warning Note -->
  <div class="warning-note">
    <strong>💡 Backup Recommendations:</strong>
    <ul>
      <li>Export your data monthly to prevent loss</li>
      <li>Store backups in cloud storage (Google Drive, Dropbox)</li>
      <li>Before importing, export current data first</li>
    </ul>
  </div>
</div>

<style>
  .export-import {
    padding: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  .stats-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .stats-card h4 {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .action-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card-header {
    margin-bottom: 1rem;
  }

  .card-header h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .card-description {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .import-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
  }

  .radio-label input[type="radio"] {
    cursor: pointer;
  }

  .btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .file-input-label {
    display: block;
  }

  .file-input {
    display: none;
  }

  .result-message {
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .result-message.success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #10b981;
  }

  .result-message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #ef4444;
  }

  .warning-note {
    background: #fffbeb;
    border: 1px solid #fbbf24;
    border-radius: 6px;
    padding: 1rem;
    font-size: 0.875rem;
    color: #92400e;
  }

  .warning-note strong {
    display: block;
    margin-bottom: 0.5rem;
  }

  .warning-note ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .warning-note li {
    margin: 0.25rem 0;
  }

  @media (max-width: 640px) {
    .export-import {
      padding: 1rem;
    }

    .stat-grid {
      grid-template-columns: 1fr;
    }

    .action-card {
      padding: 1rem;
    }
  }
</style>
