/**
 * Workspace Page
 * Displays projects within a workspace with grid layout
 */

'use client';

import React from 'react';
import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Add,
} from '@metabuilder/m3';
import styles from '@/../../../scss/atoms/workspace.module.scss';
import { useWorkspacePage } from './hooks/useWorkspacePage';
import WorkspaceProjectsBody from './WorkspaceProjectsBody';

export default function WorkspacePage() {
  const {
    workspaceId,
    currentWorkspace,
    isLoading,
    showCreateForm,
    setShowCreateForm,
    newProjectName,
    setNewProjectName,
    handleCreateProject,
    starredProjects,
    regularProjects,
  } = useWorkspacePage();

  const workspaceName =
    currentWorkspace?.name || 'Workspace';

  return (
    <div className={styles.workspace}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          {
            label: workspaceName,
            href: `/workspace/${workspaceId}`,
          },
        ]}
      />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>
            {workspaceName}
          </h1>
          <p className={styles.pageSubtitle}>
            {currentWorkspace?.description ||
              'Organize your projects'}
          </p>
        </div>
        <Button
          variant="filled"
          startIcon={<Add size={20} />}
          onClick={() => setShowCreateForm(true)}
        >
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <CircularProgress />
          <p>Loading projects...</p>
        </div>
      ) : (
        <WorkspaceProjectsBody
          starredProjects={starredProjects}
          regularProjects={regularProjects}
          showCreateForm={showCreateForm}
          newProjectName={newProjectName}
          setNewProjectName={setNewProjectName}
          onSubmitCreate={handleCreateProject}
          onCancelCreate={() => {
            setShowCreateForm(false);
            setNewProjectName('');
          }}
        />
      )}
    </div>
  );
}
