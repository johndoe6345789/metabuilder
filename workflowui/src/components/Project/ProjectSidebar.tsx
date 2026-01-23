/**
 * ProjectSidebar Component
 * Left sidebar showing project list and workspace info
 */

import React, { useCallback } from 'react';
import { useProject } from '../../hooks/useProject';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useProjectSidebarLogic } from '../../hooks';
import { testId } from '../../utils/accessibility';
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
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      data-testid={testId.projectSidebar()}
      role="complementary"
      aria-label="Projects sidebar"
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.workspaceName} id="sidebar-workspace-title">
            {currentWorkspace?.name || 'Workspace'}
          </h2>
          <p className={styles.projectCount} aria-label={`${projects.length} project${projects.length !== 1 ? 's' : ''} available`}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          className={styles.toggleButton}
          onClick={toggleCollapsed}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand projects sidebar' : 'Collapse projects sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="projects-sidebar-content"
          data-testid={testId.button('toggle-projects-sidebar')}
        >
          {isCollapsed ? '❱' : '❰'}
        </button>
      </div>

      {/* Content - only show if not collapsed */}
      <div id="projects-sidebar-content">
        {!isCollapsed && (
          <>
            {/* Starred Projects */}
            {starredProjects.length > 0 && (
              <section
                className={styles.section}
                role="region"
                aria-label="Starred projects"
              >
                <h3 className={styles.sectionTitle} id="starred-projects-title">
                  Starred
                </h3>
                <div
                  className={styles.projectList}
                  role="list"
                  aria-labelledby="starred-projects-title"
                >
                  {starredProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isSelected={project.id === currentProjectId}
                      onClick={onProjectClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Projects */}
            <section
              className={styles.section}
              role="region"
              aria-label="All projects"
            >
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle} id="all-projects-title">
                  Projects
                </h3>
                <button
                  className={styles.addButton}
                  onClick={() => setShowNewProjectForm(true)}
                  title="Create new project"
                  aria-label="Create new project"
                  data-testid={testId.button('new-project')}
                >
                  +
                </button>
              </div>

              {showNewProjectForm && (
                <form
                  className={styles.newProjectForm}
                  onSubmit={onCreateProject}
                  role="region"
                  aria-label="Create new project form"
                >
                  <label htmlFor="new-project-name-input" className="srOnly">
                    Project name
                  </label>
                  <input
                    id="new-project-name-input"
                    type="text"
                    className={styles.input}
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    aria-required="true"
                    data-testid={testId.input('new-project-name')}
                  />
                  <div className={styles.formButtons}>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      data-testid={testId.button('create-project')}
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={resetProjectForm}
                      data-testid={testId.button('cancel-new-project')}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div
                className={styles.projectList}
                role="list"
                aria-labelledby="all-projects-title"
              >
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
                  <p className={styles.emptyState} role="status">
                    No projects. Create one to get started!
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
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
      role="listitem"
      className={styles.projectListItem}
    >
      <button
        className={`${styles.projectItem} ${isSelected ? styles.selected : ''}`}
        style={{ borderLeftColor: project.color }}
        onClick={() => onClick(project.id)}
        aria-selected={isSelected}
        aria-current={isSelected ? 'page' : undefined}
        data-testid={testId.projectItem(project.id)}
      >
        <div className={styles.projectInfo}>
          <h4 className={styles.projectName}>{project.name}</h4>
          {project.description && (
            <p className={styles.projectDescription}>{project.description}</p>
          )}
        </div>
        {project.starred && (
          <span className={styles.star} aria-hidden="true">
            ★
          </span>
        )}
      </button>
    </div>
  );
};

export default ProjectSidebar;
