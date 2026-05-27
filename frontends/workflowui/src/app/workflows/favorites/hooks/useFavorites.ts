/**
 * useFavorites - Favorites page state and handlers
 */

'use client';

import { useState, useEffect } from 'react';
import { useWorkflows } from '@metabuilder/hooks';

export function useFavorites() {
  const { workflows, isLoading, listWorkflows, deleteWorkflow } =
    useWorkflows();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt'>(
    'updatedAt'
  );

  useEffect(() => {
    listWorkflows();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      const success = await deleteWorkflow(id);
      if (success) listWorkflows();
    }
  };

  const filteredWorkflows = (workflows || [])
    .filter(
      (w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description &&
          w.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.updatedAt - a.updatedAt;
    });

  const formatLastUpdated = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return {
    workflows: filteredWorkflows,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    handleDelete,
    formatLastUpdated,
  };
}
