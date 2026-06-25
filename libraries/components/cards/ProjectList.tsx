/**
 * ProjectList Component
 * Grid layout for project cards
 */

import React from 'react'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@metabuilder/interfaces/workspace'

interface ProjectListProps {
  projects: Project[]
  className?: string
  [key: string]: any
}

/**
 * ProjectList - Grid container for projects
 */
export const ProjectList = ({ projects, className, ...rest }: ProjectListProps) => {
  const gridClass = className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'

  return (
    <div className={gridClass} {...rest}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
