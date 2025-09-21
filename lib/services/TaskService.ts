import { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types/task';
import { OfflineDB } from '@/lib/offline/database';
import { SyncQueue } from '@/lib/offline/syncQueue';
import { SupabaseService } from '@/lib/supabase/SupabaseService';

export class TaskService {
  private static db = OfflineDB;
  private static syncQueue = SyncQueue;
  private static supabase = SupabaseService;

  static async getAllTasks(): Promise<Task[]> {
    try {
      // Try to get from Supabase first if online
      if (navigator.onLine && await this.supabase.isConfigured()) {
        const remoteTasks = await this.supabase.getTasks();
        // Sync with local storage
        await this.db.syncTasks(remoteTasks);
        return remoteTasks;
      }
    } catch (error) {
      console.warn('Failed to fetch from remote, falling back to local');
    }

    // Fallback to local storage
    return this.db.getTasks();
  }

  static async createTask(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      ...input,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save locally first
    await this.db.createTask(task);

    // Queue for sync if online sync is enabled
    if (await this.supabase.isConfigured()) {
      await this.syncQueue.add('create', task);
    }

    return task;
  }

  static async updateTask(input: UpdateTaskInput): Promise<Task> {
    const existingTask = await this.db.getTask(input.id);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...existingTask,
      ...input,
      updatedAt: new Date(),
    };

    // Save locally first
    await this.db.updateTask(updatedTask);

    // Queue for sync if online sync is enabled
    if (await this.supabase.isConfigured()) {
      await this.syncQueue.add('update', updatedTask);
    }

    return updatedTask;
  }

  static async deleteTask(id: string): Promise<void> {
    // Delete locally first
    await this.db.deleteTask(id);

    // Queue for sync if online sync is enabled
    if (await this.supabase.isConfigured()) {
      await this.syncQueue.add('delete', { id });
    }
  }
}