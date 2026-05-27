/**
 * useWorkflowsPage - Workflows page state and handlers
 */

'use client';

import { useState, useEffect } from 'react';
import { useWorkflows } from '@metabuilder/hooks';

export function useWorkflowsPage() {
  const {
    workflows,
    isLoading,
    error,
    listWorkflows,
    deleteWorkflow,
  } = useWorkflows();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] =
    useState<string>('all');

  useEffect(() => {
    loadWorkflows();
  }, [statusFilter, categoryFilter]);

  const loadWorkflows = async () => {
    const options: any = {};
    if (statusFilter !== 'all') options.status = statusFilter;
    if (categoryFilter !== 'all') options.category = categoryFilter;
    await listWorkflows(options);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      const success = await deleteWorkflow(id);
      if (success) {
        loadWorkflows();
      }
    }
  };

  const filteredWorkflows = (workflows || []).filter(
    (workflow) =>
      workflow.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (workflow.description &&
        workflow.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const hasFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all';

  return {
    workflows: filteredWorkflows,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    handleDelete,
    hasFilters,
  };
}
