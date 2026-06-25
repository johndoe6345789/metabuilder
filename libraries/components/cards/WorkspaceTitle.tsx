/**
 * WorkspaceTitle Component
 * Displays workspace name, description, and metadata
 */

import React from 'react'
import styles from '../../scss/components/cards/workspace-card.module.scss'

interface WorkspaceTitleProps {
  name: string
  description?: string
  createdAt?: string
  [key: string]: any
}

/**
 * WorkspaceTitle - Workspace text content
 */
export const WorkspaceTitle = ({ name, description, createdAt, ...rest }: WorkspaceTitleProps) => {
  return (
    <div className={styles.content} {...rest}>
      <h3 className={styles.title}>{name}</h3>
      <p className={styles.description}>{description || 'No description'}</p>
      {createdAt && (
        <span className={styles.meta}>
          Created {new Date(createdAt).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}
