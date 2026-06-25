/**
 * Workflows Page - All workflows list
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button, CircularProgress } from '@metabuilder/m3';
import { AddIcon } from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';
import { useWorkflowsPage } from './hooks/useWorkflowsPage';
import WorkflowFilters from './WorkflowFilters';
import WorkflowCard from './WorkflowCard';
import WorkflowEmptyState from './WorkflowEmptyState';
import WorkflowErrorBanner from './WorkflowErrorBanner';

export default function WorkflowsPage() {
  const {
    workflows,
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
  } = useWorkflowsPage();

  if (isLoading && workflows.length === 0) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
        <p>Loading workflows...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Workflows</h1>
          <p className={styles.pageSubtitle}>
            Create and manage automated workflows
          </p>
        </div>
        <Link href="/editor/new">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon size={20} />}
          >
            New Workflow
          </Button>
        </Link>
      </div>

      <WorkflowErrorBanner error={error} />

      <WorkflowFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      {workflows.length === 0 ? (
        <WorkflowEmptyState hasFilters={hasFilters} />
      ) : (
        <div className={styles.grid}>
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
