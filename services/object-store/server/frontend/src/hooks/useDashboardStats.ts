'use client';

import { useState, useEffect } from 'react';
import {
  s3FetchXml,
  parseBucketList,
  parseObjectList,
} from '@/utils';
import api from '@/constants/api-routes.json';
import seed from '@/constants/seed-data.json';
import type { S3Object, Bucket } from '@/types';

/** @brief Dashboard statistics. */
export interface DashboardStats {
  bucketCount: number;
  objectCount: number;
  totalSize: number;
  isLoading: boolean;
}

type SeedMap = Record<string, S3Object[]>;

/** @brief Compute stats from seed data. */
function seedStats(): DashboardStats {
  const objs = seed.objects as SeedMap;
  let objectCount = 0;
  let totalSize = 0;
  for (const items of Object.values(objs)) {
    objectCount += items.length;
    for (const o of items) totalSize += o.size;
  }
  return {
    bucketCount: seed.buckets.length,
    objectCount, totalSize, isLoading: false,
  };
}

/** @brief Count objects in one bucket safely. */
async function countBucket(b: Bucket) {
  try {
    const url = api.listObjects.replace(
      '{bucket}', b.name,
    );
    const xml = await s3FetchXml(url);
    const result = parseObjectList(xml);
    let size = 0;
    for (const o of result.contents) size += o.size;
    return { count: result.contents.length, size };
  } catch {
    return { count: 0, size: 0 };
  }
}

/**
 * @brief Aggregate S3 storage statistics.
 * Falls back to seed data when backend is down.
 */
export function useDashboardStats():
  DashboardStats {
  const [stats, setStats] =
    useState<DashboardStats>({
      bucketCount: 0, objectCount: 0,
      totalSize: 0, isLoading: true,
    });

  useEffect(() => {
    const load = async () => {
      try {
        const xml = await s3FetchXml(api.buckets);
        const buckets = parseBucketList(xml);
        const results = await Promise.all(
          buckets.map(countBucket),
        );
        let objectCount = 0;
        let totalSize = 0;
        for (const r of results) {
          objectCount += r.count;
          totalSize += r.size;
        }
        setStats({
          bucketCount: buckets.length,
          objectCount, totalSize, isLoading: false,
        });
      } catch {
        setStats(seedStats());
      }
    };
    load();
  }, []);

  return stats;
}
