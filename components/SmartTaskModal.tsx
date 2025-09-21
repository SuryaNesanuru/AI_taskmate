'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Clock } from 'lucide-react';
import { useTaskStore } from '@/lib/store/taskStore';
import { AITaskSuggestion } from '@/lib/types/task';

interface SmartTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartTaskModal({ isOpen, onClose }: SmartTaskModalProps) {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const { createTask } = useTaskStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setSuggestions([]);
    
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, taskCount: 5 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error('Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Show fallback suggestions
      setSuggestions([
        {
          title: `Plan: ${prompt}`,
          description: 'Break down the request into actionable steps',
          priority: 'medium',
          tags: ['planning'],
          estimatedDuration: '30 minutes'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleCreateSelected = async () => {
    const tasksToCreate = suggestions.filter((_, index) => selectedSuggestions.has(index));
    
    for (const suggestion of tasksToCreate) {
      await createTask({
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        tags: suggestion.tags,
      });
    }
    
    setPrompt('');
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    onClose();
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Task Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="prompt">Describe what you want to accomplish</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., I need to prepare for my job interview next week, organize my home office, or plan a team meeting..."
              rows={3}
              className="mt-2"
            />
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="mt-3 bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate AI Suggestions'}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedSuggestions.has(index)
                        ? 'border-purple-300 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSuggestion(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {suggestion.title}
                        </h4>
                        <p className="text-slate-600 text-sm mb-3">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center space-x-3">
                          <Badge className={priorityColors[suggestion.priority]}>
                            {suggestion.priority}
                          </Badge>
                          {suggestion.estimatedDuration && (
                            <div className="flex items-center space-x-1 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              <span>{suggestion.estimatedDuration}</span>
                            </div>
                          )}
                        </div>
                        {suggestion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {suggestion.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {selectedSuggestions.has(index) ? (
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Plus className="h-3 w-3 text-white rotate-45" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedSuggestions.size > 0 && (
            <Button onClick={handleCreateSelected} className="bg-purple-600 hover:bg-purple-700">
              Create {selectedSuggestions.size} Task{selectedSuggestions.size > 1 ? 's' : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}