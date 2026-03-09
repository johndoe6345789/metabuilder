/**
 * ProjectCard Component
 * Displays project with metadata
 */

import React from 'react'
import Link from 'next/link'
import type { Project } from '@metabuilder/interfaces/workspace'
import styles from '../../scss/components/cards/project-card.module.scss'

interface ProjectCardProps {
  project: Project
  [key: string]: any
}

/**
 * ProjectCard - Clickable project card with link
 */
export const ProjectCard = ({ project, ...rest }: ProjectCardProps) => {
  return (
    <Link href={`/project/${project.id}`} className={styles.projectCard} {...rest}>
      <div className={styles.cardInner}>
        <div
          className={styles.media}
          style={{ backgroundColor: project.color || 'var(--mat-sys-primary)' }}
        />
        <div className={styles.content}>
          <h3 className={styles.title}>{project.name}</h3>
          <p className={styles.description}>{project.description || 'No description'}</p>
          <div className={styles.meta}>
            <span>{project.workflowCount || 0} workflows</span>
            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
