/**
 * ProjectSidebar Component
 * Left sidebar showing project list and workspace info
 */

import React, { useCallback } from 'react';
import { useProject } from '../../hooks/useProject';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useProjectSidebarLogic } from '../../hooks';
import { Project } from '../../types/project';
import styles from './ProjectSidebar.module.scss';

interface ProjectSidebarProps {
  onSelectProject: (projectId: string) => void;
  currentProjectId?: string;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  onSelectProject,
  currentProjectId
}) => {
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const {
    isCollapsed,
    showNewProjectForm,
    newProjectName,
    starredProjects,
    regularProjects,
    setIsCollapsed,
    toggleCollapsed,
    setShowNewProjectForm,
    setNewProjectName,
    handleCreateProject,
    handleProjectClick,
    resetProjectForm
  } = useProjectSidebarLogic(projects);

  const onCreateProject = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProjectName.trim() || !currentWorkspace) return;

      try {
        await handleCreateProject(e, () => {
          // Success callback
          return Promise.resolve();
        });
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    },
    [newProjectName, currentWorkspace, handleCreateProject]
  );

  const onProjectClick = useCallback(
    (projectId: string) => {
      handleProjectClick(projectId, onSelectProject);
    },
    [handleProjectClick, onSelectProject]
  );

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.workspaceName}>
            {currentWorkspace?.name || 'Workspace'}
          </h2>
          <p className={styles.projectCount}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          className={styles.toggleButton}
          onClick={toggleCollapsed}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '❱' : '❰'}
        </button>
      </div>

      {/* Content - only show if not collapsed */}
      {!isCollapsed && (
        <>
          {/* Starred Projects */}
          {starredProjects.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Starred</h3>
              <div className={styles.projectList}>
                {starredProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isSelected={project.id === currentProjectId}
                    onClick={onProjectClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Projects */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Projects</h3>
              <button
                className={styles.addButton}
                onClick={() => setShowNewProjectForm(true)}
                title="Create new project"
                aria-label="Create new project"
              >
                +
              </button>
            </div>

            {showNewProjectForm && (
              <form className={styles.newProjectForm} onSubmit={onCreateProject}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                />
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.submitButton}>
                    Create
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={resetProjectForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.projectList}>
              {regularProjects.length > 0 ? (
                regularProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isSelected={project.id === currentProjectId}
                    onClick={onProjectClick}
                  />
                ))
              ) : (
                <p className={styles.emptyState}>
                  No projects. Create one to get started!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

// ProjectItem subcomponent
interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onClick: (projectId: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, isSelected, onClick }) => {
  return (
    <div
      className={`${styles.projectItem} ${isSelected ? styles.selected : ''}`}
      style={{ borderLeftColor: project.color }}
      onClick={() => onClick(project.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(project.id);
        }
      }}
    >
      <div className={styles.projectInfo}>
        <h4 className={styles.projectName}>{project.name}</h4>
        {project.description && (
          <p className={styles.projectDescription}>{project.description}</p>
        )}
      </div>
      {project.starred && <span className={styles.star}>★</span>}
    </div>
  );
};

export default ProjectSidebar;
