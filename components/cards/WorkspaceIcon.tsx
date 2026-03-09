/**
 * WorkspaceIcon Component
 * Displays workspace initials/icon
 */

import React from 'react'
import styles from '../../scss/components/cards/workspace-card.module.scss'

interface WorkspaceIconProps {
  name: string
  color?: string
  [key: string]: any
}

/**
 * WorkspaceIcon - Workspace initials in colored media area
 */
export const WorkspaceIcon = ({ name, color, ...rest }: WorkspaceIconProps) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={styles.media}
      style={{ backgroundColor: color || 'var(--mat-sys-primary)' }}
      {...rest}
    >
      <span className={styles.initials}>{initials}</span>
    </div>
  )
}
