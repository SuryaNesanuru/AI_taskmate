import { SyncQueueItem } from '@/lib/types/task';
import { OfflineDB } from './database';

class SyncQueueManager {
  async add(action: 'create' | 'update' | 'delete', data: any): Promise<void> {
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await OfflineDB.addToSyncQueue(item);
  }

  async processQueue(): Promise<void> {
    const queue = await OfflineDB.getSyncQueue();
    
    if (queue.length === 0) return;

    // Sort by timestamp
    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const item of queue) {
      try {
        await this.processItem(item);
        await OfflineDB.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error('Failed to process sync item:', error);
        
        // Increment retry count
        item.retryCount++;
        
        // Remove item if it has failed too many times
        if (item.retryCount >= 3) {
          console.error('Sync item failed too many times, removing:', item);
          await OfflineDB.removeFromSyncQueue(item.id);
        } else {
          // Update retry count in queue
          await OfflineDB.addToSyncQueue(item);
        }
      }
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    // This would implement the actual sync with Supabase
    // For now, we'll just log the action
    console.log('Processing sync item:', item);
    
    // In a real implementation, you would:
    // 1. Check if Supabase is configured
    // 2. Make the appropriate API call based on item.action
    // 3. Handle conflicts and errors
  }

  async getQueueStatus(): Promise<{ pending: number; failed: number }> {
    const queue = await OfflineDB.getSyncQueue();
    
    return {
      pending: queue.filter(item => item.retryCount === 0).length,
      failed: queue.filter(item => item.retryCount > 0).length,
    };
  }
}

export const SyncQueue = new SyncQueueManager();