/**
 * Workspace Page
 * Displays projects within a workspace with grid layout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProject, useWorkspace } from '../../../hooks';
import { Breadcrumbs, Button, TextField, CircularProgress, Add } from '@metabuilder/fakemui';
import { ProjectCard } from '@/../../../components/cards/ProjectCard';
import styles from '@/../../../scss/atoms/workspace.module.scss';

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.id as string;

  const { workspaces, currentWorkspace, switchWorkspace } = useWorkspace();
  const { projects, loadProjects, createProject } = useProject();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (workspaceId) {
      switchWorkspace(workspaceId);
      loadProjects(workspaceId);
      setIsLoading(false);
    }
  }, [workspaceId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !workspaceId) return;

    try {
      await createProject({
        name: newProjectName,
        workspaceId,
        description: ''
      });
      setNewProjectName('');
      setShowCreateForm(false);
      loadProjects(workspaceId);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const starredProjects = projects.filter(p => p.starred);
  const regularProjects = projects.filter(p => !p.starred);

  return (
    <div className={styles.workspace}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: currentWorkspace?.name || 'Workspace', href: `/workspace/${workspaceId}` }
        ]}
      />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>{currentWorkspace?.name || 'Workspace'}</h1>
          <p className={styles.pageSubtitle}>{currentWorkspace?.description || 'Organize your projects'}</p>
        </div>
        <Button variant="filled" startIcon={<Add size={20} />} onClick={() => setShowCreateForm(true)}>
          New Project
        </Button>
      </div>

      <div>
        {isLoading ? (
          <div className={styles.loading}>
            <CircularProgress />
            <p>Loading projects...</p>
          </div>
        ) : (
          <>
            {/* Starred Projects Section */}
            {starredProjects.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionHeader}>⭐ Starred Projects</h2>
                <div className={styles.grid}>
                  {starredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Create Project Form */}
            {showCreateForm && (
              <div className={styles.createForm}>
                <form onSubmit={handleCreateProject}>
                  <h3 className={styles.formTitle}>Create New Project</h3>
                  <TextField
                    label="Project Name"
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                  />
                  <div className={styles.formActions}>
                    <Button variant="filled" type="submit" disabled={!newProjectName.trim()}>
                      Create
                    </Button>
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewProjectName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Regular Projects Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>
                {starredProjects.length > 0 ? 'All Projects' : 'Projects'}
              </h2>
              {regularProjects.length === 0 && !showCreateForm ? (
                <div className={styles.emptyState}>
                  <p>No projects yet. Create one to get started!</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {regularProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ProjectCard is now imported from @/../../../components/cards/ProjectCard
