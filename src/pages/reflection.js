/**
 * Reflection Journal Page
 * Long-form thinking without performance metrics
 * 
 * Philosophy:
 * - Thinking space, not emotional discharge
 * - No scores, streaks, sentiment, or insights
 * - Writing is the end, not a means
 * - Silence is allowed. Empty weeks are allowed.
 */

import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/reflection.css";

import { 
  listReflections, 
  saveReflection, 
  getReflection,
  deleteReflection 
} from "../data/reflectionStore.js";
import { getPrompts } from "../data/reflectionPrompts.js";

let currentView = "list"; // "list" | "write" | "read"
let currentReflectionId = null;
let selectedPrompt = null;

/**
 * Initialize reflection page
 */
async function init() {
  renderListView();
}

/**
 * Render list of reflections
 */
async function renderListView() {
  currentView = "list";
  const main = document.getElementById("reflection-main");
  
  const reflections = await listReflections();
  
  main.innerHTML = `
    <div class="reflection-list-view">
      <div class="reflection-list-header">
        <button id="new-reflection-btn" class="reflection-new-btn">New Reflection</button>
      </div>
      
      <div class="reflection-list">
        ${reflections.length === 0 
          ? `<p class="reflection-empty-state">No reflections yet. Your first thought awaits.</p>`
          : reflections.map(r => `
            <article class="reflection-item" data-id="${r.id}">
              <time class="reflection-date">${formatDate(r.createdAt)}</time>
              ${r.title ? `<h3 class="reflection-title">${escapeHtml(r.title)}</h3>` : ''}
              <p class="reflection-preview">${getPreview(r.content)}</p>
            </article>
          `).join('')}
      </div>
    </div>
  `;
  
  // Event listeners
  document.getElementById("new-reflection-btn").addEventListener("click", () => {
    renderWriteView();
  });
  
  document.querySelectorAll(".reflection-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      renderReadView(id);
    });
  });
}

/**
 * Render write/edit view
 */
function renderWriteView(reflectionId = null) {
  currentView = "write";
  currentReflectionId = reflectionId;
  const main = document.getElementById("reflection-main");
  
  // Load existing reflection if editing
  let existingData = { title: "", content: "", promptId: null };
  if (reflectionId) {
    existingData = getReflection(reflectionId) || existingData;
  }
  
  main.innerHTML = `
    <div class="reflection-write-view">
      <div class="reflection-write-header">
        <button id="back-to-list" class="reflection-back-btn">← Back</button>
        <button id="save-reflection-btn" class="reflection-save-btn">Save</button>
      </div>
      
      <div class="reflection-prompt-container" id="prompt-container" style="display: none;">
        <p class="reflection-prompt-text" id="prompt-text"></p>
        <button id="dismiss-prompt" class="reflection-dismiss-prompt">Dismiss prompt</button>
      </div>
      
      <div class="reflection-editor-container">
        <input 
          type="text" 
          id="reflection-title" 
          class="reflection-title-input" 
          placeholder="Title (optional)"
          value="${escapeHtml(existingData.title || '')}"
        />
        
        <textarea 
          id="reflection-content" 
          class="reflection-editor"
          placeholder="Begin writing..."
        >${escapeHtml(existingData.content || '')}</textarea>
        
        <div class="reflection-prompt-selector">
          <button id="choose-prompt-btn" class="reflection-choose-prompt-btn">Choose a prompt</button>
        </div>
      </div>
    </div>
  `;
  
  // Event listeners
  document.getElementById("back-to-list").addEventListener("click", renderListView);
  document.getElementById("save-reflection-btn").addEventListener("click", handleSave);
  document.getElementById("choose-prompt-btn").addEventListener("click", showPromptSelector);
  
  const dismissBtn = document.getElementById("dismiss-prompt");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      document.getElementById("prompt-container").style.display = "none";
      selectedPrompt = null;
    });
  }
  
  // Focus editor
  document.getElementById("reflection-content").focus();
}

/**
 * Render read view
 */
async function renderReadView(reflectionId) {
  currentView = "read";
  currentReflectionId = reflectionId;
  const main = document.getElementById("reflection-main");
  
  const reflection = await getReflection(reflectionId);
  
  if (!reflection) {
    renderListView();
    return;
  }
  
  main.innerHTML = `
    <div class="reflection-read-view">
      <div class="reflection-read-header">
        <button id="back-to-list" class="reflection-back-btn">← Back</button>
        <div class="reflection-read-actions">
          <button id="edit-reflection-btn" class="reflection-edit-btn">Edit</button>
          <button id="delete-reflection-btn" class="reflection-delete-btn">Delete</button>
        </div>
      </div>
      
      <article class="reflection-read-content">
        <time class="reflection-date">${formatDate(reflection.createdAt)}</time>
        ${reflection.title ? `<h2 class="reflection-title">${escapeHtml(reflection.title)}</h2>` : ''}
        <div class="reflection-body">
          ${escapeHtml(reflection.content).replace(/\n/g, '<br>')}
        </div>
      </article>
    </div>
  `;
  
  // Event listeners
  document.getElementById("back-to-list").addEventListener("click", renderListView);
  document.getElementById("edit-reflection-btn").addEventListener("click", () => {
    renderWriteView(reflectionId);
  });
  document.getElementById("delete-reflection-btn").addEventListener("click", () => {
    handleDelete(reflectionId);
  });
}

/**
 * Show prompt selector
 */
function showPromptSelector() {
  const prompts = getPrompts();
  
  const overlay = document.createElement("div");
  overlay.className = "reflection-modal-overlay";
  overlay.innerHTML = `
    <div class="reflection-modal">
      <h3>Choose a prompt</h3>
      <div class="reflection-prompt-list">
        ${prompts.map(p => `
          <button class="reflection-prompt-option" data-id="${p.promptId}">
            ${escapeHtml(p.text)}
          </button>
        `).join('')}
      </div>
      <button class="reflection-modal-close">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Event listeners
  overlay.querySelector(".reflection-modal-close").addEventListener("click", () => {
    overlay.remove();
  });
  
  overlay.querySelectorAll(".reflection-prompt-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const promptId = btn.dataset.id;
      const prompt = prompts.find(p => p.promptId === promptId);
      if (prompt) {
        selectedPrompt = prompt;
        document.getElementById("prompt-text").textContent = prompt.text;
        document.getElementById("prompt-container").style.display = "block";
        document.getElementById("choose-prompt-btn").style.display = "none";
      }
      overlay.remove();
    });
  });
  
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

/**
 * Handle save
 */
async function handleSave() {
  const title = document.getElementById("reflection-title").value.trim();
  const content = document.getElementById("reflection-content").value.trim();
  
  if (!content) {
    alert("Reflection content cannot be empty");
    return;
  }
  
  const reflection = {
    id: currentReflectionId || generateId(),
    title: title || null,
    content,
    promptId: selectedPrompt ? selectedPrompt.promptId : null,
    createdAt: currentReflectionId 
      ? (await getReflection(currentReflectionId))?.createdAt || new Date().toISOString()
      : new Date().toISOString()
  };
  
  await saveReflection(reflection);
  
  // Show subtle confirmation
  const saveBtn = document.getElementById("save-reflection-btn");
  const originalText = saveBtn.textContent;
  saveBtn.textContent = "Saved";
  saveBtn.disabled = true;
  
  setTimeout(() => {
    renderListView();
  }, 800);
}

/**
 * Handle delete
 */
async function handleDelete(reflectionId) {
  if (!confirm("Delete this reflection? This cannot be undone.")) {
    return;
  }
  
  await deleteReflection(reflectionId);
  renderListView();
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Get preview text (first ~2 lines)
 */
function getPreview(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const preview = lines.slice(0, 2).join(' ');
  return preview.length > 150 ? preview.slice(0, 150) + '...' : preview;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate unique ID
 */
function generateId() {
  return `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize
init();
