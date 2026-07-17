'use client';

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { Bucket } from '@/types';
import {
  s3FetchXml,
  s3Fetch,
  parseBucketList,
} from '@/utils';
import api from '@/constants/api-routes.json';
import seed from '@/constants/seed-data.json';

/** @brief Hook return type for bucket ops. */
export interface UseBucketsReturn {
  buckets: Bucket[];
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
  createBucket: (n: string) => Promise<boolean>;
  deleteBucket: (n: string) => Promise<boolean>;
}

/**
 * @brief Manage S3 buckets.
 * Falls back to seed data when backend is down.
 * @returns Bucket list and CRUD operations.
 */
export function useBuckets(): UseBucketsReturn {
  const [buckets, setBuckets] = useState<
    Bucket[]
  >([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const xml = await s3FetchXml(api.buckets);
      setBuckets(parseBucketList(xml));
    } catch {
      setBuckets(seed.buckets as Bucket[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBucket = useCallback(
    async (name: string): Promise<boolean> => {
      const url = api.bucket.replace(
        '{bucket}',
        name,
      );
      const res = await s3Fetch(url, {
        method: 'PUT',
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh],
  );

  const deleteBucket = useCallback(
    async (name: string): Promise<boolean> => {
      const url = api.bucket.replace(
        '{bucket}',
        name,
      );
      const res = await s3Fetch(url, {
        method: 'DELETE',
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh],
  );

  return {
    buckets,
    isLoading,
    error,
    refresh,
    createBucket,
    deleteBucket,
  };
}
