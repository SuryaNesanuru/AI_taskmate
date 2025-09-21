'use client';

import { useEffect, useState } from 'react';
import { SyncQueue } from '@/lib/offline/syncQueue';

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      
      // Process sync queue when coming back online
      SyncQueue.processQueue()
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('offline'));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic sync check
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        SyncQueue.processQueue().catch(console.error);
      }
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  return { syncStatus, isOnline };
}