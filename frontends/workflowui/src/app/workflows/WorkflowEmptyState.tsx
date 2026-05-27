/**
 * WorkflowEmptyState - Empty state for workflows list
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@metabuilder/fakemui';
import {
  AddIcon,
  SearchIcon,
  FolderIcon,
} from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';

interface WorkflowEmptyStateProps {
  hasFilters: boolean;
}

export default function WorkflowEmptyState({
  hasFilters,
}: WorkflowEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <SearchIcon size={64} />
        </div>
        <h2 className={styles.emptyTitle}>
          No workflows found
        </h2>
        <p className={styles.emptyText}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <FolderIcon size={64} />
      </div>
      <h2 className={styles.emptyTitle}>No workflows yet</h2>
      <p className={styles.emptyText}>
        Create your first workflow to automate your processes
      </p>
      <Link href="/editor/new">
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon size={22} />}
        >
          Create Your First Workflow
        </Button>
      </Link>
    </div>
  );
}
