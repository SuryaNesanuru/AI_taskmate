'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/lib/store/taskStore';
import { isToday, isFuture } from 'date-fns';

interface FilterTabsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const { tasks } = useTaskStore();

  const getCounts = () => {
    const today = tasks.filter(task => 
      task.dueDate && isToday(task.dueDate) && task.status !== 'completed'
    ).length;

    const upcoming = tasks.filter(task => 
      task.dueDate && isFuture(task.dueDate) && task.status !== 'completed'
    ).length;

    const highPriority = tasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).length;

    const completed = tasks.filter(task => task.status === 'completed').length;

    return { today, upcoming, highPriority, completed };
  };

  const counts = getCounts();

  return (
    <Tabs value={selectedFilter} onValueChange={onFilterChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all" className="text-sm">
          All Tasks
        </TabsTrigger>
        <TabsTrigger value="today" className="text-sm">
          Today
          {counts.today > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {counts.today}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="text-sm">
          Upcoming
          {counts.upcoming > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {counts.upcoming}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="high-priority" className="text-sm">
          High Priority
          {counts.highPriority > 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {counts.highPriority}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-sm">
          Completed
          {counts.completed > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {counts.completed}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}