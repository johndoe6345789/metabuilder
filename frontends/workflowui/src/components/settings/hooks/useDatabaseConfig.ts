/**
 * useDatabaseConfig - Fetches current DB config and adapter list
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BASE_PATH } from '@/lib/app-config';

interface AdapterInfo {
  name: string;
  description: string;
  supported: boolean;
  active: boolean;
}

interface CurrentConfig {
  adapter: string;
  database_url: string;
  status: string;
}

export function useDatabaseConfig() {
  const [config, setConfig] = useState<CurrentConfig | null>(
    null
  );
  const [adapters, setAdapters] = useState<AdapterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(
        `${BASE_PATH}/api/dbal/admin/config`
      );
      const data = await res.json();
      if (data.success) setConfig(data.data);
    } catch {
      // DBAL might not be running
    }
  }, []);

  const fetchAdapters = useCallback(async () => {
    try {
      const res = await fetch(
        `${BASE_PATH}/api/dbal/admin/adapters`
      );
      const data = await res.json();
      if (data.success) setAdapters(data.data);
    } catch {
      // DBAL might not be running
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchConfig(), fetchAdapters()]).finally(
      () => setLoading(false)
    );
  }, [fetchConfig, fetchAdapters]);

  return {
    config,
    adapters,
    loading,
    fetchConfig,
    fetchAdapters,
  };
}
