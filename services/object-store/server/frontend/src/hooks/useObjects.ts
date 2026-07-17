'use client';

import {
  useObjectList,
} from './useObjectList';
import type {
  UseObjectListReturn,
} from './useObjectList';
import {
  useObjectActions,
} from './useObjectActions';
import type {
  UseObjectActionsReturn,
} from './useObjectActions';

/** @brief Combined hook return for objects. */
export type UseObjectsReturn =
  UseObjectListReturn & UseObjectActionsReturn;

/**
 * @brief Manage objects in an S3 bucket.
 * @param bucket - Bucket name.
 * @param prefix - Optional key prefix filter.
 */
export function useObjects(
  bucket: string,
  prefix = '',
): UseObjectsReturn {
  const list = useObjectList(bucket, prefix);
  const actions = useObjectActions(
    bucket,
    list.refresh,
  );

  return { ...list, ...actions };
}
