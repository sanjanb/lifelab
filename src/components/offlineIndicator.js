/**
 * Offline Indicator Component
 * 
 * PHILOSOPHY:
 * ===========
 * Subtle, non-blocking notification of offline state.
 * Never punish the user with modal dialogs or blocked UI.
 * 
 * DESIGN:
 * =======
 * - Small toast at bottom of screen
 * - Appears when offline
 * - Shows queue status when operations are pending
 * - Disappears automatically when online
 * - No user interaction required
 * 
 * @see docs/AUTHENTICATION.md - Phase 9
 */

import { offlineQueue } from '../data/persistence/offlineQueue.js';

/**
 * Initialize offline indicator
 */
export function initOfflineIndicator() {
  // Create indicator element
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'offline-indicator';
  indicator.style.display = 'none';
  
  document.body.appendChild(indicator);
  
  // Subscribe to queue state changes
  offlineQueue.subscribe((state) => {
    updateIndicator(indicator, state);
  });
}

/**
 * Update indicator based on queue state
 * @param {HTMLElement} indicator - Indicator element
 * @param {Object} state - Queue state
 */
function updateIndicator(indicator, state) {
  const { isOnline, queueSize, isProcessing } = state;
  
  if (!isOnline) {
    // Offline - show indicator
    indicator.style.display = 'flex';
    
    if (queueSize > 0) {
      indicator.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Offline – ${queueSize} ${queueSize === 1 ? 'change' : 'changes'} will sync when online</span>
      `;
    } else {
      indicator.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Offline – changes will sync when online</span>
      `;
    }
  } else if (isProcessing && queueSize > 0) {
    // Online but processing queue
    indicator.style.display = 'flex';
    indicator.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="syncing-icon">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      <span>Syncing ${queueSize} ${queueSize === 1 ? 'change' : 'changes'}...</span>
    `;
  } else if (!isProcessing && queueSize === 0 && indicator.style.display === 'flex') {
    // Just finished syncing - show success briefly then hide
    indicator.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
      <span>All changes synced</span>
    `;
    
    // Hide after 2 seconds
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 2000);
  } else {
    // Online and nothing to do - hide
    indicator.style.display = 'none';
  }
}
