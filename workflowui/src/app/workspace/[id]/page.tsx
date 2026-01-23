/**
 * Workspace Page
 * Displays projects within a workspace with grid layout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProject, useWorkspace } from '../../../hooks';
import { Breadcrumbs } from '../../../components/Navigation/Breadcrumbs';
import styles from './page.module.scss';

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
    <div className={styles.workspacePage}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: currentWorkspace?.name || 'Workspace', href: `/workspace/${workspaceId}` }
        ]}
      />

      <div className={styles.header}>
        <div>
          <h1>{currentWorkspace?.name || 'Workspace'}</h1>
          <p>{currentWorkspace?.description || 'Organize your projects'}</p>
        </div>
        <button
          className={`${styles.createButton} btn btn-primary`}
          onClick={() => setShowCreateForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
          </svg>
          New Project
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading projects...</p>
          </div>
        ) : (
          <>
            {/* Starred Projects Section */}
            {starredProjects.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>⭐ Starred Projects</h2>
                <div className={styles.projectsGrid}>
                  {starredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* Create Project Form */}
            {showCreateForm && (
              <div className={styles.createFormContainer}>
                <form onSubmit={handleCreateProject} className={styles.createForm}>
                  <h3>Create New Project</h3>
                  <input
                    type="text"
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    className={styles.formInput}
                  />
                  <div className={styles.formActions}>
                    <button type="submit" className="btn btn-primary" disabled={!newProjectName.trim()}>
                      Create
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewProjectName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Regular Projects Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {starredProjects.length > 0 ? 'All Projects' : 'Projects'}
              </h2>
              {regularProjects.length === 0 && !showCreateForm ? (
                <div className={styles.emptyState}>
                  <p>No projects yet. Create one to get started!</p>
                </div>
              ) : (
                <div className={styles.projectsGrid}>
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

interface ProjectCardProps {
  project: any;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.id}`} className={styles.projectCard}>
      <div className={styles.projectColor} style={{ backgroundColor: project.color || '#1976d2' }} />
      <div className={styles.projectContent}>
        <h3>{project.name}</h3>
        <p>{project.description || 'No description'}</p>
        <div className={styles.projectMeta}>
          <span className={styles.workflowCount}>0 workflows</span>
          <span className={styles.updated}>Updated today</span>
        </div>
      </div>
    </Link>
  );
}
