/**
 * Error Handling & User Feedback System
 * 
 * Provides user-friendly error messages and recovery options.
 * Replaces console.error with helpful UI feedback.
 */

export interface AppError {
  type: 'storage' | 'network' | 'validation' | 'auth' | 'unknown';
  message: string;
  userMessage: string;
  recoveryActions?: RecoveryAction[];
  details?: unknown;
}

export interface RecoveryAction {
  label: string;
  handler: () => void | Promise<void>;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private listeners: ((error: AppError) => void)[] = [];

  /**
   * Report an error
   */
  report(error: AppError): void {
    this.errors.push(error);
    this.notifyListeners(error);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[LifeLab Error]', error);
    }
  }

  /**
   * Subscribe to errors
   */
  subscribe(callback: (error: AppError) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(error: AppError): void {
    this.listeners.forEach((cb) => cb(error));
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10): AppError[] {
    return this.errors.slice(-limit);
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Create storage error
 */
export function createStorageError(
  operation: string,
  details?: unknown
): AppError {
  return {
    type: 'storage',
    message: `Storage operation failed: ${operation}`,
    userMessage: 'Unable to save your data. Please try again or export your data as backup.',
    recoveryActions: [
      {
        label: 'Retry',
        handler: () => window.location.reload(),
      },
      {
        label: 'Export Data',
        handler: () => {
          window.location.href = '/lifelab/settings';
        },
      },
    ],
    details,
  };
}

/**
 * Create network error
 */
export function createNetworkError(details?: unknown): AppError {
  return {
    type: 'network',
    message: 'Network connection failed',
    userMessage: 'No internet connection. Your changes are saved locally and will sync when online.',
    recoveryActions: [
      {
        label: 'Retry',
        handler: () => window.location.reload(),
      },
    ],
    details,
  };
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  reason: string
): AppError {
  return {
    type: 'validation',
    message: `Validation failed: ${field} - ${reason}`,
    userMessage: `Please check your ${field}. ${reason}`,
    details: { field, reason },
  };
}

/**
 * Create auth error
 */
export function createAuthError(details?: unknown): AppError {
  return {
    type: 'auth',
    message: 'Authentication failed',
    userMessage: 'Unable to sign in. Please check your credentials and try again.',
    recoveryActions: [
      {
        label: 'Try Again',
        handler: () => {},
      },
    ],
    details,
  };
}

/**
 * Detect if user is offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Listen for online/offline status
 */
export function watchOnlineStatus(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Validate entry data before save
 */
export function validateEntryData(data: {
  date?: string;
  value?: unknown;
  notes?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.date) {
    errors.push('Date is required');
  } else if (isNaN(Date.parse(data.date))) {
    errors.push('Invalid date format');
  }

  if (data.notes && data.notes.length > 5000) {
    errors.push('Notes too long (max 5000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    errorHandler.report({
      type: 'validation',
      message: 'JSON parse failed',
      userMessage: 'Unable to read saved data. Using defaults.',
      details: error,
    });
    return fallback;
  }
}

/**
 * Safe localStorage access
 */
export function safeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Test if localStorage is available
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch (error) {
    errorHandler.report({
      type: 'storage',
      message: 'localStorage not available',
      userMessage: 'Browser storage is disabled. Data will not persist.',
      details: error,
    });
    return null;
  }
}
