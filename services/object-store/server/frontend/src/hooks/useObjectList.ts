'use client';

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { S3Object } from '@/types';
import {
  s3FetchXml,
  parseObjectList,
} from '@/utils';
import api from '@/constants/api-routes.json';
import seed from '@/constants/seed-data.json';

/** @brief Hook return type for object listing. */
export interface UseObjectListReturn {
  objects: S3Object[];
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

type SeedMap = Record<string, S3Object[]>;

/**
 * @brief List and refresh S3 objects in a bucket.
 * Falls back to seed data when backend is down.
 * @param bucket - Bucket name.
 * @param prefix - Optional key prefix filter.
 */
export function useObjectList(
  bucket: string,
  prefix = '',
): UseObjectListReturn {
  const [objects, setObjects] = useState<
    S3Object[]
  >([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      let url = api.listObjects.replace(
        '{bucket}',
        bucket,
      );
      if (prefix) url += `?prefix=${prefix}`;
      const xml = await s3FetchXml(url);
      const result = parseObjectList(xml);
      setObjects(result.contents);
    } catch {
      const fallback =
        (seed.objects as SeedMap)[bucket] ?? [];
      setObjects(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [bucket, prefix]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { objects, isLoading, error, refresh };
}
