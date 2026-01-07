/**
 * Export/Import Utilities
 * Data portability and backup functionality
 */

/**
 * Exports monthly data as JSON file
 * @param {Array} data - Array of day records
 * @param {number} year - Year
 * @param {number} month - Month
 */
export function exportToJSON(data, year, month) {
  const monthStr = String(month).padStart(2, "0");
  const filename = `lifelab-${year}-${monthStr}.json`;

  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(jsonStr, filename, "application/json");
}

/**
 * Exports data as CSV
 * @param {Array} data - Array of day records
 * @param {string} filename - Output filename
 */
export function exportToCSV(data, filename = "lifelab-export.csv") {
  // Get all unique domains
  const domains = new Set();
  data.forEach((day) => {
    if (day.domains) {
      Object.keys(day.domains).forEach((d) => domains.add(d));
    }
  });

  const domainList = Array.from(domains).sort();

  // Create CSV header
  const header = ["Date", ...domainList, "Notes"].join(",");

  // Create CSV rows
  const rows = data.map((day) => {
    const values = [
      day.date,
      ...domainList.map((d) => day.domains[d] || ""),
      `"${(day.notes || "").replace(/"/g, '""')}"`,
    ];
    return values.join(",");
  });

  const csv = [header, ...rows].join("\n");
  downloadFile(csv, filename, "text/csv");
}

/**
 * Imports data from JSON file
 * @param {File} file - File object
 * @returns {Promise<Array>} Promise resolving to array of day records
 */
export async function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!Array.isArray(data)) {
          throw new Error("Invalid format: expected array of day records");
        }

        // Basic validation
        const valid = data.every(
          (day) => day.date && day.domains && typeof day.domains === "object"
        );

        if (!valid) {
          throw new Error("Invalid day records found");
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Exports all available data as a single backup file
 * @param {Object} allData - Object mapping month keys to data arrays
 */
export function exportFullBackup(allData) {
  const backup = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    data: allData,
  };

  const filename = `lifelab-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;
  const jsonStr = JSON.stringify(backup, null, 2);
  downloadFile(jsonStr, filename, "application/json");
}

/**
 * Helper: Download a file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Renders import/export UI
 */
export function renderImportExportUI(container, currentData, onImport) {
  container.innerHTML = `
    <div class="import-export-section">
      <h3>Export Data</h3>
      <div class="export-buttons">
        <button class="btn-secondary" id="export-json">Export as JSON</button>
        <button class="btn-secondary" id="export-csv">Export as CSV</button>
      </div>
      
      <h3>Import Data</h3>
      <div class="import-area">
        <input type="file" id="import-file" accept=".json" />
        <button class="btn-primary" id="import-data">Import JSON</button>
      </div>
      
      <div class="import-hint">
        📁 Import will merge with existing data. Duplicate dates will be overwritten.
      </div>
    </div>
  `;

  // Export handlers
  container.querySelector("#export-json").addEventListener("click", () => {
    const now = new Date();
    exportToJSON(currentData, now.getFullYear(), now.getMonth() + 1);
  });

  container.querySelector("#export-csv").addEventListener("click", () => {
    exportToCSV(currentData);
  });

  // Import handler
  container
    .querySelector("#import-data")
    .addEventListener("click", async () => {
      const fileInput = container.querySelector("#import-file");
      const file = fileInput.files[0];

      if (!file) {
        alert("Please select a file to import");
        return;
      }

      try {
        const importedData = await importFromJSON(file);
        if (onImport) onImport(importedData);
        alert(`Successfully imported ${importedData.length} entries`);
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      }
    });
}
