/**
 * Firebase Migration UI Component
 * 
 * One-time migration from localStorage to Firebase.
 * 
 * RULES:
 * - Plain language explanation
 * - Show item counts
 * - Require explicit confirmation
 * - No pressure, no countdowns
 * - Allow cancel anytime
 */

import { persistence } from "../data/persistence/manager.js";

/**
 * Render migration prompt
 * @param {HTMLElement} container - Container element
 * @param {Function} onComplete - Callback when migration completes
 */
export async function renderMigrationPrompt(container, onComplete = null) {
  // Check if migration is needed
  const needsMigration = await persistence.needsMigration();

  if (!needsMigration) {
    container.innerHTML = "";
    return;
  }

  // Get local data summary
  const localExport = await persistence.export();
  const counts = getMigrationCounts(localExport);

  container.innerHTML = `
    <div class="migration-prompt">
      <div class="migration-header">
        <h3>Sync Your Data</h3>
        <p>Your data is currently stored in your browser. You can optionally sync it to the cloud.</p>
      </div>
      
      <div class="migration-explanation">
        <h4>What will happen:</h4>
        <ul>
          <li>Your data will be copied to secure cloud storage</li>
          <li>You'll be able to access it from any device</li>
          <li>Your browser data will remain as a backup</li>
          <li>This is completely optional</li>
        </ul>
      </div>
      
      <div class="migration-summary">
        <h4>Data to sync:</h4>
        <div class="migration-counts">
          ${counts.wins > 0 ? `<div class="count-item"><span>${counts.wins}</span> acknowledgements</div>` : ""}
          ${counts.entries > 0 ? `<div class="count-item"><span>${counts.entries}</span> journal entries</div>` : ""}
          ${counts.settings ? `<div class="count-item"><span>1</span> settings profile</div>` : ""}
        </div>
      </div>
      
      <div class="migration-actions">
        <button id="start-migration-btn" class="btn-primary">
          Sync to Cloud
        </button>
        <button id="skip-migration-btn" class="btn-secondary">
          Keep Local Only
        </button>
      </div>
      
      <div id="migration-status" class="migration-status" style="display: none;"></div>
    </div>
  `;

  // Attach event listeners
  attachMigrationListeners(container, onComplete);
}

/**
 * Get counts from export data
 */
function getMigrationCounts(exportData) {
  const counts = {
    wins: 0,
    entries: 0,
    settings: false,
  };

  if (!exportData || !exportData.data) {
    return counts;
  }

  if (exportData.data.wins) {
    counts.wins = Object.keys(exportData.data.wins).length;
  }

  if (exportData.data.entries) {
    counts.entries = Object.keys(exportData.data.entries).length;
  }

  if (exportData.data.settings) {
    counts.settings = true;
  }

  return counts;
}

/**
 * Attach event listeners for migration
 */
function attachMigrationListeners(container, onComplete) {
  const startBtn = container.querySelector("#start-migration-btn");
  const skipBtn = container.querySelector("#skip-migration-btn");
  const statusDiv = container.querySelector("#migration-status");

  startBtn.addEventListener("click", async () => {
    // Disable buttons
    startBtn.disabled = true;
    skipBtn.disabled = true;

    // Show status
    statusDiv.style.display = "block";
    statusDiv.innerHTML = `
      <div class="migration-progress">
        <p>Syncing your data...</p>
      </div>
    `;

    // Execute migration
    const result = await persistence.migrateToFirebase();

    if (result.success) {
      statusDiv.innerHTML = `
        <div class="migration-success">
          <p>✓ Synced ${result.itemsMigrated} items successfully</p>
          <p>You can now access your data from any device.</p>
        </div>
      `;

      // Mark migration as complete
      localStorage.setItem("lifelab_migration_complete", "true");

      setTimeout(() => {
        container.innerHTML = "";
        if (onComplete) onComplete(result);
      }, 2000);
    } else {
      statusDiv.innerHTML = `
        <div class="migration-error">
          <p>Sync incomplete: ${result.error}</p>
          <p>Your local data is safe. You can try again later.</p>
        </div>
      `;

      // Re-enable buttons
      startBtn.disabled = false;
      skipBtn.disabled = false;
    }
  });

  skipBtn.addEventListener("click", () => {
    // Mark as skipped (don't show again this session)
    localStorage.setItem("lifelab_migration_skipped", "true");
    container.innerHTML = "";
  });
}

/**
 * Check if migration prompt should be shown
 * @returns {boolean} True if should show prompt
 */
export function shouldShowMigrationPrompt() {
  // Don't show if already migrated or explicitly skipped
  if (localStorage.getItem("lifelab_migration_complete")) {
    return false;
  }

  if (sessionStorage.getItem("lifelab_migration_skipped_session")) {
    return false;
  }

  return true;
}
