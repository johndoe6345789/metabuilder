/**
 * useRecentWorkflows - Loads and sorts recently updated workflows
 */

'use client';

import { useEffect } from 'react';
import { useWorkflows } from '@metabuilder/hooks';

export function useRecentWorkflows() {
  const { workflows: raw, isLoading, listWorkflows } =
    useWorkflows();

  useEffect(() => {
    listWorkflows({ limit: 20 });
  }, []);

  const workflows = [...(raw || [])].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const formatTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(
      diffMs / (1000 * 60 * 60 * 24)
    );
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${
        diffHours > 1 ? 's' : ''
      } ago`;
    if (diffDays < 7)
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return { workflows, isLoading, formatTimeAgo };
}
