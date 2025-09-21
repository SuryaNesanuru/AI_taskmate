'use client';

import { Task } from '@/lib/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { useTaskStore } from '@/lib/store/taskStore';
import { formatDistanceToNow, isToday, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleTaskStatus, deleteTask } = useTaskStore();

  const handleToggleStatus = () => {
    toggleTaskStatus(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const isOverdue = task.dueDate && isPast(task.dueDate) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(task.dueDate);

  return (
    <div className={cn(
      "bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md",
      task.status === 'completed' && "opacity-60",
      isOverdue && "border-red-200 bg-red-50"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={handleToggleStatus}
            className="mt-1"
          />
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-slate-900 mb-2",
              task.status === 'completed' && "line-through text-slate-500"
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-slate-600 mb-3 text-sm leading-relaxed">
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-3 mb-3">
              <Badge className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              
              {task.dueDate && (
                <div className={cn(
                  "flex items-center space-x-1 text-sm",
                  isOverdue ? "text-red-600" : isDueToday ? "text-orange-600" : "text-slate-500"
                )}>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isOverdue ? "Overdue" : isDueToday ? "Due today" : 
                     `Due ${formatDistanceToNow(task.dueDate, { addSuffix: true })}`}
                  </span>
                </div>
              )}
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>
                Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-slate-400 hover:text-slate-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-slate-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}