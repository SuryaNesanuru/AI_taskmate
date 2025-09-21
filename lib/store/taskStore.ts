'use client';

import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/lib/types/task';
import { TaskService } from '@/lib/services/TaskService';
import { isToday, isFuture, parseISO } from 'date-fns';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  
  // Computed
  filteredTasks: (query: string, filter: string) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  initializeTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await TaskService.getAllTasks();
      set({ tasks, isLoading: false, error: null });
    } catch (error) {
      set({ error: 'Failed to load tasks', isLoading: false });
    }
  },

  createTask: async (input: CreateTaskInput) => {
    try {
      const task = await TaskService.createTask(input);
      set(state => ({ tasks: [...state.tasks, task] }));
    } catch (error) {
      set({ error: 'Failed to create task' });
    }
  },

  updateTask: async (input: UpdateTaskInput) => {
    try {
      const updatedTask = await TaskService.updateTask(input);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === input.id ? updatedTask : task
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update task' });
    }
  },

  deleteTask: async (id: string) => {
    try {
      await TaskService.deleteTask(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete task' });
    }
  },

  toggleTaskStatus: async (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    await get().updateTask({ id, status: newStatus });
  },

  filteredTasks: (query: string, filter: string) => {
    let filtered = get().tasks;

    // Apply search filter
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description?.toLowerCase().includes(lowercaseQuery) ||
        task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Apply status/date filters
    switch (filter) {
      case 'today':
        filtered = filtered.filter(task => 
          task.dueDate && isToday(task.dueDate) && task.status !== 'completed'
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(task => 
          task.dueDate && isFuture(task.dueDate) && task.status !== 'completed'
        );
        break;
      case 'high-priority':
        filtered = filtered.filter(task => 
          task.priority === 'high' && task.status !== 'completed'
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
    }

    return filtered.sort((a, b) => {
      // Sort by priority, then by due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
}));