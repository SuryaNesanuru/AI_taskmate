import { Task } from '@/lib/types/task';

export class SupabaseService {
  private static supabaseUrl: string | null = null;
  private static supabaseKey: string | null = null;

  static async isConfigured(): Promise<boolean> {
    const settings = localStorage.getItem('taskmate-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.supabaseUrl = parsed.supabaseUrl;
      this.supabaseKey = parsed.supabaseAnonKey;
      return !!(this.supabaseUrl && this.supabaseKey);
    }
    return false;
  }

  static async getTasks(): Promise<Task[]> {
    if (!await this.isConfigured()) {
      throw new Error('Supabase not configured');
    }

    const response = await fetch(`${this.supabaseUrl}/rest/v1/tasks?select=*`, {
      headers: {
        'apikey': this.supabaseKey!,
        'Authorization': `Bearer ${this.supabaseKey!}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks from Supabase');
    }

    const data = await response.json();
    
    return data.map((task: any) => ({
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
    }));
  }

  static async createTask(task: Task): Promise<Task> {
    if (!await this.isConfigured()) {
      throw new Error('Supabase not configured');
    }

    const response = await fetch(`${this.supabaseUrl}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        'apikey': this.supabaseKey!,
        'Authorization': `Bearer ${this.supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.dueDate?.toISOString(),
        priority: task.priority,
        tags: task.tags,
        status: task.status,
        created_at: task.createdAt.toISOString(),
        updated_at: task.updatedAt.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task in Supabase');
    }

    return task;
  }

  static async updateTask(task: Task): Promise<Task> {
    if (!await this.isConfigured()) {
      throw new Error('Supabase not configured');
    }

    const response = await fetch(`${this.supabaseUrl}/rest/v1/tasks?id=eq.${task.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': this.supabaseKey!,
        'Authorization': `Bearer ${this.supabaseKey!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        due_date: task.dueDate?.toISOString(),
        priority: task.priority,
        tags: task.tags,
        status: task.status,
        updated_at: task.updatedAt.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task in Supabase');
    }

    return task;
  }

  static async deleteTask(id: string): Promise<void> {
    if (!await this.isConfigured()) {
      throw new Error('Supabase not configured');
    }

    const response = await fetch(`${this.supabaseUrl}/rest/v1/tasks?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': this.supabaseKey!,
        'Authorization': `Bearer ${this.supabaseKey!}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete task from Supabase');
    }
  }
}