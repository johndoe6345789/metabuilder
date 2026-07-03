'use client';

import { useCallback } from 'react';
import { s3Fetch } from '@/utils';
import api from '@/constants/api-routes.json';

/** @brief Build object URL for a bucket+key. */
function objectUrl(
  bucket: string,
  key: string,
): string {
  return api.object
    .replace('{bucket}', bucket)
    .replace('{key}', key);
}

/** @brief Hook return for object mutations. */
export interface UseObjectActionsReturn {
  uploadObject: (
    k: string,
    f: File,
  ) => Promise<boolean>;
  downloadObject: (k: string) => Promise<void>;
  deleteObject: (k: string) => Promise<boolean>;
}

/**
 * @brief Upload, download, and delete S3 objects.
 * @param bucket - Bucket name.
 * @param onMutate - Called after a mutation.
 */
export function useObjectActions(
  bucket: string,
  onMutate: () => Promise<void>,
): UseObjectActionsReturn {
  const uploadObject = useCallback(
    async (
      key: string,
      file: File,
    ): Promise<boolean> => {
      const url = objectUrl(bucket, key);
      const res = await s3Fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type':
            file.type
            || 'application/octet-stream',
        },
      });
      if (res.ok) await onMutate();
      return res.ok;
    },
    [bucket, onMutate],
  );

  const downloadObject = useCallback(
    async (key: string) => {
      const url = objectUrl(bucket, key);
      const res = await s3Fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = key.split('/').pop() ?? key;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    [bucket],
  );

  const deleteObject = useCallback(
    async (key: string): Promise<boolean> => {
      const url = objectUrl(bucket, key);
      const res = await s3Fetch(url, {
        method: 'DELETE',
      });
      if (res.ok) await onMutate();
      return res.ok;
    },
    [bucket, onMutate],
  );

  return {
    uploadObject,
    downloadObject,
    deleteObject,
  };
}
