export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  status?: TaskStatus;
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  estimatedDuration?: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}