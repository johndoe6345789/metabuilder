/**
 * Dashboard / Home Page
 * Workspace selector, stats, and achievements
 */

'use client';

import React from 'react';
import { Button, CircularProgress } from '@metabuilder/fakemui';
import { useDashboardLogic } from '../hooks';
import { AddIcon } from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';
import DashboardStatsBanner from './DashboardStatsBanner';
import WorkspaceCard from './WorkspaceCard';
import WorkspaceEmptyState from './WorkspaceEmptyState';
import CreateWorkspaceForm from './CreateWorkspaceForm';

export default function Dashboard() {
  const {
    isLoading,
    showCreateForm,
    newWorkspaceName,
    workspaces,
    setShowCreateForm,
    setNewWorkspaceName,
    handleCreateWorkspace,
    handleWorkspaceClick,
    resetWorkspaceForm,
  } = useDashboardLogic();

  return (
    <div className={styles.dashboard}>
      <DashboardStatsBanner />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Workspaces</h1>
          <p className={styles.pageSubtitle}>
            Organize your projects and workflows
          </p>
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon size={20} />}
          onClick={() => setShowCreateForm(true)}
        >
          New Workspace
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <CircularProgress />
          <p>Loading workspaces...</p>
        </div>
      ) : (
        <>
          {showCreateForm && (
            <CreateWorkspaceForm
              name={newWorkspaceName}
              onNameChange={setNewWorkspaceName}
              onSubmit={handleCreateWorkspace}
              onCancel={resetWorkspaceForm}
            />
          )}

          {workspaces.length === 0 && !showCreateForm ? (
            <WorkspaceEmptyState
              onCreateWorkspace={() => setShowCreateForm(true)}
            />
          ) : (
            <div className={styles.grid}>
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={() =>
                    handleWorkspaceClick(workspace.id)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
