/**
 * WorkspaceEmptyState - Empty state for the workspaces grid
 */

'use client';

import React from 'react';
import { Button } from '@metabuilder/m3';
import { FolderIcon, AddIcon } from '@/../../../icons/react';
import styles from '/atoms/dashboard.module.scss';

interface WorkspaceEmptyStateProps {
  onCreateWorkspace: () => void;
}

export default function WorkspaceEmptyState({
  onCreateWorkspace,
}: WorkspaceEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <FolderIcon size={64} />
      </div>
      <h2 className={styles.emptyTitle}>No workspaces yet</h2>
      <p className={styles.emptyText}>
        Create your first workspace to organize your projects
      </p>
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon size={22} />}
        onClick={onCreateWorkspace}
      >
        Create Your First Workspace
      </Button>
    </div>
  );
}
