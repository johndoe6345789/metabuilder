import { useEffect } from 'react';
import { loadStorageConfig } from '@/lib/storage';

export function useStorageInit() {
  useEffect(() => {
    loadStorageConfig();
  }, []);
}
