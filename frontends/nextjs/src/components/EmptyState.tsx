'use client'

import React from 'react'

/**
 * Empty State Component
 *
 * Displayed when lists, tables, or other collections are empty.
 * Provides helpful context and suggests actionable next steps.
 */

export interface EmptyStateProps {
  /**
   * Icon to display (emoji or SVG)
   */
  icon?: React.ReactNode

  /**
   * Title text
   */
  title: string

  /**
   * Description/message text
   */
  description: string

  /**
   * Optional action button
   */
  action?: {
    label: string
    onClick: () => void
  }

  /**
   * Optional secondary action
   */
  secondaryAction?: {
    label: string
    onClick: () => void
  }

  /**
   * CSS class name for custom styling
   */
  className?: string

  /**
   * Custom style overrides
   */
  style?: React.CSSProperties
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  secondaryAction,
  className,
  style,
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className ?? ''}`} style={style}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{description}</p>
      {(action || secondaryAction) && (
        <div className="empty-state-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {action && (
            <button
              onClick={action.onClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#228be6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f3f5',
                color: '#495057',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Common empty states
 */

export function NoDataFound({
  title = 'No data found',
  description = 'There is no data to display.',
  className,
}: Pick<EmptyStateProps, 'className'> & { title?: string; description?: string }) {
  return <EmptyState icon="🔍" title={title} description={description} className={className} />
}

export function NoResultsFound({
  title = 'No results found',
  description = 'Your search did not return any results.',
  className,
}: Pick<EmptyStateProps, 'className'> & { title?: string; description?: string }) {
  return <EmptyState icon="❌" title={title} description={description} className={className} />
}

export function NoItemsYet({
  title = 'No items yet',
  description = 'Get started by creating your first item.',
  action,
  className,
}: Pick<EmptyStateProps, 'className' | 'action'> & { title?: string; description?: string }) {
  return <EmptyState icon="✨" title={title} description={description} action={action} className={className} />
}

export function AccessDeniedState({
  title = 'Access denied',
  description = 'You do not have permission to view this content.',
  className,
}: Pick<EmptyStateProps, 'className'> & { title?: string; description?: string }) {
  return <EmptyState icon="🔒" title={title} description={description} className={className} />
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  action,
  className,
}: Pick<EmptyStateProps, 'className' | 'action'> & { title?: string; description?: string }) {
  return <EmptyState icon="⚠️" title={title} description={description} action={action} className={className} />
}
