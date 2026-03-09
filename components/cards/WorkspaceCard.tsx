/**
 * WorkspaceCard Component
 * Complete workspace card with icon and content
 */

import React from 'react'
import { WorkspaceIcon } from './WorkspaceIcon'
import { WorkspaceTitle } from './WorkspaceTitle'
import type { Workspace } from '@metabuilder/interfaces/dashboard'
import styles from '../../scss/components/cards/workspace-card.module.scss'

interface WorkspaceCardProps {
  workspace: Workspace
  onClick?: () => void
  [key: string]: any
}

/**
 * WorkspaceCard - Interactive workspace card
 */
export const WorkspaceCard = ({ workspace, onClick, ...rest }: WorkspaceCardProps) => {
  return (
    <article
      className={styles.workspaceCard}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      tabIndex={0}
      role="button"
      aria-label={`Open ${workspace.name} workspace`}
      data-testid="workspace-card"
      {...rest}
    >
      <WorkspaceIcon name={workspace.name} color={workspace.color} />
      <WorkspaceTitle
        name={workspace.name}
        description={workspace.description}
        createdAt={workspace.createdAt}
      />
    </article>
  )
}
