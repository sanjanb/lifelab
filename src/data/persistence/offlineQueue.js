/**
 * Offline Queue Manager
 * 
 * PHILOSOPHY:
 * ===========
 * Never punish users for network issues.
 * Queue operations silently, retry automatically, never block.
 * 
 * RULES:
 * ======
 * - Silent retries (no error modals)
 * - Operations queue when offline
 * - Auto-retry on reconnect
 * - Clear but non-blocking offline indicator
 * 
 * @see docs/AUTHENTICATION.md - Phase 9
 */

/**
 * Queued operation
 * @typedef {Object} QueuedOperation
 * @property {string} id - Unique operation ID
 * @property {string} type - Operation type (save, delete, etc.)
 * @property {string} collection - Collection name
 * @property {Object} data - Operation data
 * @property {number} timestamp - When operation was queued
 * @property {number} retryCount - Number of retry attempts
 * @property {Function} resolve - Promise resolve function
 * @property {Function} reject - Promise reject function
 */

class OfflineQueueManager {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
    this.subscribers = [];
    
    // Set up online/offline listeners
    this.setupNetworkListeners();
  }

  /**
   * Set up network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[Offline Queue] Network connection restored');
      this.isOnline = true;
      this.notifySubscribers({ isOnline: true, queueSize: this.queue.length });
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[Offline Queue] Network connection lost');
      this.isOnline = false;
      this.notifySubscribers({ isOnline: false, queueSize: this.queue.length });
    });
  }

  /**
   * Subscribe to queue state changes
   * @param {Function} callback - Called when queue state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Immediately call with current state
    callback({
      isOnline: this.isOnline,
      queueSize: this.queue.length,
      isProcessing: this.isProcessing
    });
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of state change
   * @param {Object} state - Current queue state
   */
  notifySubscribers(state) {
    const fullState = {
      isOnline: this.isOnline,
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      ...state
    };
    
    this.subscribers.forEach(callback => {
      try {
        callback(fullState);
      } catch (error) {
        console.error('[Offline Queue] Subscriber error:', error);
      }
    });
  }

  /**
   * Add operation to queue
   * @param {string} type - Operation type
   * @param {string} collection - Collection name
   * @param {Object} data - Operation data
   * @param {Function} executor - Function to execute (returns Promise)
   * @returns {Promise} Promise that resolves when operation completes
   */
  enqueue(type, collection, data, executor) {
    return new Promise((resolve, reject) => {
      const operation = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        collection,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        executor,
        resolve,
        reject
      };

      this.queue.push(operation);
      console.log(`[Offline Queue] Queued ${type} operation for ${collection} (queue size: ${this.queue.length})`);
      
      this.notifySubscribers({ queueSize: this.queue.length });

      // Try to process immediately if online
      if (this.isOnline && !this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queued operations
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !this.isOnline) {
      return;
    }

    this.isProcessing = true;
    this.notifySubscribers({ isProcessing: true });

    console.log(`[Offline Queue] Processing ${this.queue.length} queued operations...`);

    while (this.queue.length > 0 && this.isOnline) {
      const operation = this.queue[0];

      try {
        // Execute the operation
        const result = await operation.executor();
        
        // Success - remove from queue and resolve
        this.queue.shift();
        operation.resolve(result);
        
        console.log(`[Offline Queue] ✓ Completed ${operation.type} for ${operation.collection}`);
        this.notifySubscribers({ queueSize: this.queue.length });
        
      } catch (error) {
        console.error(`[Offline Queue] ✗ Failed ${operation.type} for ${operation.collection}:`, error);
        
        operation.retryCount++;
        
        // Check if we should retry
        if (operation.retryCount >= this.maxRetries) {
          // Max retries reached - remove and reject
          console.warn(`[Offline Queue] Max retries reached for ${operation.type}, giving up`);
          this.queue.shift();
          operation.reject(new Error(`Operation failed after ${this.maxRetries} retries: ${error.message}`));
          this.notifySubscribers({ queueSize: this.queue.length });
        } else {
          // Retry with exponential backoff
          const delay = this.retryDelay * Math.pow(2, operation.retryCount - 1);
          console.log(`[Offline Queue] Retrying in ${delay}ms (attempt ${operation.retryCount}/${this.maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.isProcessing = false;
    this.notifySubscribers({ isProcessing: false });

    if (this.queue.length === 0) {
      console.log('[Offline Queue] All operations processed successfully');
    }
  }

  /**
   * Get current queue state
   * @returns {Object} Queue state
   */
  getState() {
    return {
      isOnline: this.isOnline,
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      operations: this.queue.map(op => ({
        id: op.id,
        type: op.type,
        collection: op.collection,
        timestamp: op.timestamp,
        retryCount: op.retryCount
      }))
    };
  }

  /**
   * Clear the queue (for testing/debugging)
   */
  clear() {
    const count = this.queue.length;
    this.queue.forEach(op => op.reject(new Error('Queue cleared')));
    this.queue = [];
    console.log(`[Offline Queue] Cleared ${count} operations`);
    this.notifySubscribers({ queueSize: 0 });
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueueManager();
