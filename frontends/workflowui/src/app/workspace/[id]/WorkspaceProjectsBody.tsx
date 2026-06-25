/**
 * WorkspaceProjectsBody - Main content area (starred/all projects)
 */

'use client';

import React from 'react';
import styles from '/atoms/workspace.module.scss';
import WorkspaceCreateProjectForm from './WorkspaceCreateProjectForm';
import WorkspaceProjectsGrid from './WorkspaceProjectsGrid';

interface Project {
  id: string;
  [key: string]: unknown;
}

interface WorkspaceProjectsBodyProps {
  starredProjects: Project[];
  regularProjects: Project[];
  showCreateForm: boolean;
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  onSubmitCreate: () => void;
  onCancelCreate: () => void;
}

export default function WorkspaceProjectsBody({
  starredProjects,
  regularProjects,
  showCreateForm,
  newProjectName,
  setNewProjectName,
  onSubmitCreate,
  onCancelCreate,
}: WorkspaceProjectsBodyProps) {
  return (
    <>
      {starredProjects.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>
            ⭐ Starred Projects
          </h2>
          <WorkspaceProjectsGrid projects={starredProjects} />
        </div>
      )}

      {showCreateForm && (
        <WorkspaceCreateProjectForm
          newProjectName={newProjectName}
          setNewProjectName={setNewProjectName}
          onSubmit={onSubmitCreate}
          onCancel={onCancelCreate}
        />
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>
          {starredProjects.length > 0
            ? 'All Projects'
            : 'Projects'}
        </h2>
        {regularProjects.length === 0 && !showCreateForm ? (
          <div className={styles.emptyState}>
            <p>No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <WorkspaceProjectsGrid projects={regularProjects} />
        )}
      </div>
    </>
  );
}
