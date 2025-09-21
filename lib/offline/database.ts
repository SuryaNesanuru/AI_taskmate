import { openDB, IDBPDatabase } from 'idb';
import { Task, SyncQueueItem } from '@/lib/types/task';

class OfflineDatabase {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB('taskmate-db', 1, {
      upgrade(db) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-status', 'status');
          taskStore.createIndex('by-priority', 'priority');
          taskStore.createIndex('by-dueDate', 'dueDate');
          taskStore.createIndex('by-createdAt', 'createdAt');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async getTasks(): Promise<Task[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tasks = await this.db.getAll('tasks');
    
    // Convert date strings back to Date objects
    return tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  }

  async getTask(id: string): Promise<Task | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const task = await this.db.get('tasks', id);
    if (!task) return undefined;

    return {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  async createTask(task: Task): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('tasks', task);
  }

  async updateTask(task: Task): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('tasks', task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('tasks', id);
  }

  async syncTasks(remoteTasks: Task[]): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['tasks'], 'readwrite');
    
    // Clear existing tasks
    await tx.objectStore('tasks').clear();
    
    // Add all remote tasks
    for (const task of remoteTasks) {
      await tx.objectStore('tasks').put(task);
    }
    
    await tx.done;
  }

  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('syncQueue', item);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAll('syncQueue');
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('syncQueue', id);
  }

  async clearSyncQueue(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('syncQueue');
  }
}

export const OfflineDB = new OfflineDatabase();