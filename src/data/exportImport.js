/**
 * Data Export & Restore Utilities
 *
 * Provides UI for exporting and restoring data.
 * This is the exit strategy - never be locked into Firebase.
 */

import { persistence } from "../data/persistence/manager.js";

/**
 * Export all data to JSON file
 */
export async function exportToFile() {
  try {
    const exportData = await persistence.export();

    if (!exportData) {
      throw new Error("Failed to export data");
    }

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifelab-export-${
      new Date().toISOString().split("T")[0]
    }.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Data exported successfully",
    };
  } catch (error) {
    console.error("[Export] Failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 */
export async function importFromFile(file) {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Restore to localStorage
    const result = await persistence.restore(importData);

    if (result.success) {
      return {
        success: true,
        message: `Restored ${result.itemsRestored} data collections`,
        itemsRestored: result.itemsRestored,
      };
    } else {
      throw new Error(result.error || "Restore failed");
    }
  } catch (error) {
    console.error("[Import] Failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Render export/import UI in settings
 * @param {HTMLElement} container - Container element
 */
export function renderExportImportUI(container) {
  container.innerHTML = `
    <div class="export-import-section">
      <h3>Data Backup & Restore</h3>
      <p>Export your data for backup or transfer. Import to restore from a previous export.</p>
      
      <div class="export-import-actions">
        <button id="export-data-btn" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Data
        </button>
        
        <button id="import-data-btn" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Data
        </button>
      </div>
      
      <input type="file" id="import-file-input" accept=".json" style="display: none;" />
      
      <div id="export-import-status" class="status-message"></div>
    </div>
  `;

  // Export button
  const exportBtn = container.querySelector("#export-data-btn");
  exportBtn.addEventListener("click", async () => {
    const statusEl = container.querySelector("#export-import-status");
    statusEl.textContent = "Exporting...";
    statusEl.className = "status-message status-info";

    const result = await exportToFile();

    if (result.success) {
      statusEl.textContent = result.message;
      statusEl.className = "status-message status-success";
    } else {
      statusEl.textContent = `Export failed: ${result.error}`;
      statusEl.className = "status-message status-error";
    }

    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "status-message";
    }, 5000);
  });

  // Import button
  const importBtn = container.querySelector("#import-data-btn");
  const fileInput = container.querySelector("#import-file-input");

  importBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const statusEl = container.querySelector("#export-import-status");
    statusEl.textContent = "Importing...";
    statusEl.className = "status-message status-info";

    const result = await importFromFile(file);

    if (result.success) {
      statusEl.textContent = result.message;
      statusEl.className = "status-message status-success";

      // Reload page after successful import
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      statusEl.textContent = `Import failed: ${result.error}`;
      statusEl.className = "status-message status-error";
    }

    // Reset file input
    fileInput.value = "";
  });
}
