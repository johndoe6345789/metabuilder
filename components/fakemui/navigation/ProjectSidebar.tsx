/**
 * ProjectSidebar Component
 * Left sidebar showing project list and workspace info
 *
 * This is a generic, reusable sidebar component for displaying
 * hierarchical project lists with workspace context.
 */

import React, { useCallback, useState } from 'react'

/**
 * Project item structure
 */
export interface ProjectSidebarItem {
  id: string
  name: string
  description?: string
  color?: string
  starred?: boolean
}

/**
 * Workspace information
 */
export interface ProjectSidebarWorkspace {
  id: string
  name: string
}

export interface ProjectSidebarProps {
  /** List of projects to display */
  projects: ProjectSidebarItem[]
  /** Current workspace information */
  workspace?: ProjectSidebarWorkspace
  /** Currently selected project ID */
  currentProjectId?: string
  /** Callback when a project is selected */
  onSelectProject: (projectId: string) => void
  /** Callback when creating a new project */
  onCreateProject?: (name: string) => Promise<void>
  /** Whether the sidebar starts collapsed */
  defaultCollapsed?: boolean
  /** Custom class name */
  className?: string
  /** Test ID for accessibility testing */
  'data-testid'?: string
}

/**
 * ProjectSidebar Component
 * A collapsible sidebar for displaying and managing projects within a workspace.
 *
 * Features:
 * - Collapsible panel
 * - Starred projects section
 * - New project creation form
 * - Project selection with visual feedback
 */
export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  workspace,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  defaultCollapsed = false,
  className = '',
  'data-testid': testId = 'project-sidebar',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Separate starred and regular projects
  const starredProjects = projects.filter((p) => p.starred)
  const regularProjects = projects.filter((p) => !p.starred)

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const handleCreateProject = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newProjectName.trim() || !onCreateProject || isCreating) return

      try {
        setIsCreating(true)
        await onCreateProject(newProjectName.trim())
        setNewProjectName('')
        setShowNewProjectForm(false)
      } catch (error) {
        console.error('Failed to create project:', error)
      } finally {
        setIsCreating(false)
      }
    },
    [newProjectName, onCreateProject, isCreating]
  )

  const resetProjectForm = useCallback(() => {
    setNewProjectName('')
    setShowNewProjectForm(false)
  }, [])

  return (
    <aside
      className={`project-sidebar ${isCollapsed ? 'project-sidebar--collapsed' : ''} ${className}`}
      data-testid={testId}
      role="complementary"
      aria-label="Projects sidebar"
    >
      {/* Header */}
      <div className="project-sidebar__header">
        <div className="project-sidebar__header-info">
          <h2 className="project-sidebar__title" id="sidebar-workspace-title">
            {workspace?.name || 'Workspace'}
          </h2>
          <p
            className="project-sidebar__count"
            aria-label={`${projects.length} project${projects.length !== 1 ? 's' : ''} available`}
          >
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          className="project-sidebar__toggle"
          onClick={toggleCollapsed}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand projects sidebar' : 'Collapse projects sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="projects-sidebar-content"
          data-testid={`${testId}-toggle`}
        >
          {isCollapsed ? '\u276F' : '\u276E'}
        </button>
      </div>

      {/* Content - only show if not collapsed */}
      <div id="projects-sidebar-content" className="project-sidebar__content">
        {!isCollapsed && (
          <>
            {/* Starred Projects */}
            {starredProjects.length > 0 && (
              <section
                className="project-sidebar__section project-sidebar__section--starred"
                role="region"
                aria-label="Starred projects"
              >
                <h3 className="project-sidebar__section-title" id="starred-projects-title">
                  Starred
                </h3>
                <div
                  className="project-sidebar__list"
                  role="list"
                  aria-labelledby="starred-projects-title"
                >
                  {starredProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isSelected={project.id === currentProjectId}
                      onClick={onSelectProject}
                      testIdPrefix={testId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Projects */}
            <section
              className="project-sidebar__section"
              role="region"
              aria-label="All projects"
            >
              <div className="project-sidebar__section-header">
                <h3 className="project-sidebar__section-title" id="all-projects-title">
                  Projects
                </h3>
                {onCreateProject && (
                  <button
                    className="project-sidebar__add-button"
                    onClick={() => setShowNewProjectForm(true)}
                    title="Create new project"
                    aria-label="Create new project"
                    data-testid={`${testId}-new-project`}
                  >
                    +
                  </button>
                )}
              </div>

              {showNewProjectForm && (
                <form
                  className="project-sidebar__form"
                  onSubmit={handleCreateProject}
                  role="region"
                  aria-label="Create new project form"
                >
                  <label htmlFor="new-project-name-input" className="sr-only">
                    Project name
                  </label>
                  <input
                    id="new-project-name-input"
                    type="text"
                    className="project-sidebar__input"
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    aria-required="true"
                    disabled={isCreating}
                    data-testid={`${testId}-new-project-input`}
                  />
                  <div className="project-sidebar__form-actions">
                    <button
                      type="submit"
                      className="project-sidebar__button project-sidebar__button--primary"
                      disabled={isCreating || !newProjectName.trim()}
                      data-testid={`${testId}-create-project`}
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="project-sidebar__button project-sidebar__button--secondary"
                      onClick={resetProjectForm}
                      disabled={isCreating}
                      data-testid={`${testId}-cancel-new-project`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div
                className="project-sidebar__list"
                role="list"
                aria-labelledby="all-projects-title"
              >
                {regularProjects.length > 0 ? (
                  regularProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isSelected={project.id === currentProjectId}
                      onClick={onSelectProject}
                      testIdPrefix={testId}
                    />
                  ))
                ) : (
                  <p className="project-sidebar__empty" role="status">
                    No projects. Create one to get started!
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </aside>
  )
}

// ProjectItem subcomponent
interface ProjectItemProps {
  project: ProjectSidebarItem
  isSelected: boolean
  onClick: (projectId: string) => void
  testIdPrefix: string
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  isSelected,
  onClick,
  testIdPrefix,
}) => {
  return (
    <div role="listitem" className="project-sidebar__item">
      <button
        className={`project-sidebar__item-button ${isSelected ? 'project-sidebar__item-button--selected' : ''}`}
        style={{ borderLeftColor: project.color }}
        onClick={() => onClick(project.id)}
        aria-selected={isSelected}
        aria-current={isSelected ? 'page' : undefined}
        data-testid={`${testIdPrefix}-item-${project.id}`}
      >
        <div className="project-sidebar__item-content">
          <h4 className="project-sidebar__item-name">{project.name}</h4>
          {project.description && (
            <p className="project-sidebar__item-description">{project.description}</p>
          )}
        </div>
        {project.starred && (
          <span className="project-sidebar__item-star" aria-hidden="true">
            &#9733;
          </span>
        )}
      </button>
    </div>
  )
}

export default ProjectSidebar
