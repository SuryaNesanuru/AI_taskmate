'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskList } from '@/components/TaskList';
import { TaskModal } from '@/components/TaskModal';
import { SettingsModal } from '@/components/SettingsModal';
import { FilterTabs } from '@/components/FilterTabs';
import { SmartTaskModal } from '@/components/SmartTaskModal';
import { useTaskStore } from '@/lib/store/taskStore';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';
import { Task, TaskStatus } from '@/lib/types/task';
import { cn } from '@/lib/utils';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'upcoming' | 'high-priority' | 'completed'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSmartTaskModalOpen, setIsSmartTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { tasks, isLoading, initializeTasks, filteredTasks } = useTaskStore();
  const { syncStatus } = useOfflineSync();

  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleSmartTaskClose = () => {
    setIsSmartTaskModalOpen(false);
  };

  const displayTasks = filteredTasks(searchQuery, selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">AI TaskMate</h1>
              <p className="text-slate-600">Intelligent task management with AI-powered insights</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                syncStatus === 'synced' ? 'bg-green-500' : 
                syncStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
              )} title={`Sync status: ${syncStatus}`} />
              <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsTaskModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Button variant="outline" onClick={() => setIsSmartTaskModalOpen(true)} className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <Plus className="h-4 w-4 mr-2" />
                AI Suggest
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <FilterTabs 
            selectedFilter={selectedFilter} 
            onFilterChange={(filter) => setSelectedFilter(filter as typeof selectedFilter)} 
          />
        </div>

        {/* Task List */}
        <TaskList
          tasks={displayTasks}
          onEditTask={handleEditTask}
          isLoading={isLoading}
        />

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
        />

        <SmartTaskModal
          isOpen={isSmartTaskModalOpen}
          onClose={handleSmartTaskClose}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
}