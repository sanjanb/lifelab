/**
 * Keyboard Shortcuts Manager
 * 
 * Global keyboard shortcut handler for LifeLab.
 * Provides power-user features and accessibility improvements.
 * 
 * SHORTCUTS:
 * - Ctrl+N: New entry (domain pages)
 * - Ctrl+K: Search
 * - Ctrl+E: Export data
 * - Ctrl+S: Save/Sync
 * - Arrow Keys: Navigate days in notebook
 * - Esc: Close modals/dialogs
 * - ?: Show help
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  handler: () => void;
  contexts?: string[]; // Which pages this shortcut is active on
}

class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[] = [];
  private isListening = false;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string, ctrl = false, shift = false, alt = false): void {
    this.shortcuts = this.shortcuts.filter(
      (s) =>
        !(
          s.key === key &&
          s.ctrl === ctrl &&
          s.shift === shift &&
          s.alt === alt
        )
    );
  }

  /**
   * Start listening for keyboard events
   */
  start(): void {
    if (this.isListening) return;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyPress);
      this.isListening = true;
    }
  }

  /**
   * Stop listening for keyboard events
   */
  stop(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyPress);
      this.isListening = false;
    }
  }

  /**
   * Handle keyboard event
   */
  private handleKeyPress = (event: KeyboardEvent): void => {
    // Don't intercept if user is typing in input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Ctrl+shortcuts even in inputs
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
    }

    const currentPath = window.location.pathname;

    for (const shortcut of this.shortcuts) {
      // Check if shortcut matches key combination
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = (shortcut.ctrl || false) === (event.ctrlKey || event.metaKey);
      const shiftMatches = (shortcut.shift || false) === event.shiftKey;
      const altMatches = (shortcut.alt || false) === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        // Check if shortcut is active in current context
        if (shortcut.contexts && shortcut.contexts.length > 0) {
          const isActiveContext = shortcut.contexts.some((ctx) =>
            currentPath.includes(ctx)
          );
          if (!isActiveContext) continue;
        }

        event.preventDefault();
        shortcut.handler();
        break;
      }
    }
  };

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  /**
   * Clear all shortcuts
   */
  clearAll(): void {
    this.shortcuts = [];
  }
}

// Singleton instance
export const keyboardManager = new KeyboardShortcutManager();

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Common shortcuts setup
 * Call this in your app to register global shortcuts
 */
export function setupGlobalShortcuts(): void {
  // Export data (Ctrl+E)
  keyboardManager.register({
    key: 'e',
    ctrl: true,
    description: 'Export all data',
    handler: () => {
      window.location.href = '/lifelab/settings';
    },
  });

  // Search (Ctrl+K)
  keyboardManager.register({
    key: 'k',
    ctrl: true,
    description: 'Open search',
    handler: () => {
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
      if (searchInput) {
        searchInput.focus();
      } else {
        alert('Search coming soon!');
      }
    },
  });

  // Help (?)
  keyboardManager.register({
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    handler: () => {
      showShortcutsHelp();
    },
  });

  // Escape - close modals
  keyboardManager.register({
    key: 'Escape',
    description: 'Close dialogs',
    handler: () => {
      const closeButtons = document.querySelectorAll<HTMLButtonElement>('[data-close-modal]');
      if (closeButtons.length > 0) {
        closeButtons[0].click();
      }
    },
  });

  keyboardManager.start();
}

/**
 * Show shortcuts help dialog
 */
function showShortcutsHelp(): void {
  const shortcuts = keyboardManager.getShortcuts();
  const shortcutList = shortcuts
    .map((s) => `${formatShortcut(s)}: ${s.description}`)
    .join('\n');

  alert(`Keyboard Shortcuts:\n\n${shortcutList}`);
}

/**
 * Cleanup shortcuts on unmount
 */
export function cleanupShortcuts(): void {
  keyboardManager.stop();
}
