'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Key, Cloud, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    aiApiKey: '',
    cloudSyncEnabled: false,
    supabaseUrl: '',
    supabaseAnonKey: '',
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('taskmate-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('taskmate-settings', JSON.stringify(settings));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="sync">Cloud Sync</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            <div>
              <Label htmlFor="aiApiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                AI API Key (Optional)
              </Label>
              <Input
                id="aiApiKey"
                type="password"
                value={settings.aiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, aiApiKey: e.target.value }))}
                placeholder="Enter your Hugging Face API key..."
                className="mt-2"
              />
              <p className="text-sm text-slate-500 mt-2">
                Provide your own AI API key for unlimited usage. If not provided, the app will use the built-in key with rate limits.
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>How to get a free AI API key:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Visit <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Hugging Face</a></li>
                  <li>Create a free account</li>
                  <li>Go to Settings → Access Tokens</li>
                  <li>Create a new token with 'Read' permissions</li>
                  <li>Copy and paste the token above</li>
                </ol>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Enable Cloud Sync
                </Label>
                <p className="text-sm text-slate-500">Sync your tasks across devices using Supabase</p>
              </div>
              <Switch
                checked={settings.cloudSyncEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, cloudSyncEnabled: checked }))}
              />
            </div>

            {settings.cloudSyncEnabled && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supabaseUrl">Supabase URL</Label>
                  <Input
                    id="supabaseUrl"
                    value={settings.supabaseUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                    placeholder="https://your-project.supabase.co"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                  <Input
                    id="supabaseAnonKey"
                    type="password"
                    value={settings.supabaseAnonKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
                    placeholder="Your Supabase anonymous key..."
                    className="mt-2"
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Setting up Supabase (Free):</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase.com</a></li>
                      <li>Create a free account and new project</li>
                      <li>Go to Settings → API</li>
                      <li>Copy your Project URL and anon public key</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI TaskMate</h3>
                <p className="text-slate-500">Production-ready task management with AI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Features</h4>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li>• AI-powered task suggestions</li>
                  <li>• Smart text summarization</li>
                  <li>• Offline-first with cloud sync</li>
                  <li>• PWA support for mobile</li>
                  <li>• Rate-limited API protection</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Technology Stack</h4>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li>• Next.js with TypeScript</li>
                  <li>• Tailwind CSS & shadcn/ui</li>
                  <li>• IndexedDB for offline storage</li>
                  <li>• Supabase for cloud sync</li>
                  <li>• Hugging Face AI integration</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}