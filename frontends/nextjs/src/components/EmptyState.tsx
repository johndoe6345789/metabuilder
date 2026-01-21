'use client'

import React, { Suspense } from 'react'
import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'

/**
 * Empty State Component - Phase 5.3 Implementation
 *
 * Displayed when lists, tables, or other collections are empty.
 * Provides helpful context and suggests actionable next steps.
 *
 * Features:
 * - FakeMUI component integration for consistency
 * - Smooth fade-in animations
 * - Material Design patterns
 * - Accessibility support (prefers-reduced-motion)
 * - Multiple icon display methods (emoji, FakeMUI icons, custom)
 */

export interface EmptyStateProps {
  /**
   * Icon to display (emoji, component, or string)
   * Can be: '📭', <Icon />, or 'icon-name' (looks up in registry)
   */
  icon?: React.ReactNode | string

  /**
   * Title text
   */
  title: string

  /**
   * Description/message text
   */
  description: string

  /**
   * Optional helpful hint or suggestion text
   */
  hint?: string

  /**
   * Optional primary action button
   */
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
    loading?: boolean
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

  /**
   * Size variant: 'compact', 'normal', 'large'
   */
  size?: 'compact' | 'normal' | 'large'

  /**
   * Whether to animate on mount (fade-in)
   */
  animated?: boolean
}

/**
 * Main EmptyState component with full Material Design styling
 */
export function EmptyState({
  icon = '📭',
  title,
  description,
  hint,
  action,
  secondaryAction,
  className,
  style,
  size = 'normal',
  animated = true,
}: EmptyStateProps) {
  const sizeMap = {
    compact: { padding: '20px 16px', iconSize: '32px', titleSize: '16px', descSize: '12px' },
    normal: { padding: '40px 20px', iconSize: '48px', titleSize: '20px', descSize: '14px' },
    large: { padding: '60px 20px', iconSize: '64px', titleSize: '24px', descSize: '16px' },
  }

  const current = sizeMap[size]
  const animationClass = animated ? 'empty-state-animated' : ''

  // Render icon
  const renderIcon = () => {
    if (!icon) return null

    // If it's a string that looks like an emoji
    if (typeof icon === 'string' && /^[\p{Emoji}]+$/u.test(icon)) {
      return (
        <div
          className="empty-state-icon"
          style={{ fontSize: current.iconSize, marginBottom: size === 'compact' ? '8px' : '16px' }}
          role="img"
          aria-hidden="true"
        >
          {icon}
        </div>
      )
    }

    // If it's a react node
    if (React.isValidElement(icon)) {
      return <div className="empty-state-icon" style={{ marginBottom: size === 'compact' ? '8px' : '16px' }}>{icon}</div>
    }

    // If it's a string icon name from registry
    if (typeof icon === 'string' && FAKEMUI_REGISTRY[icon]) {
      const IconComponent = FAKEMUI_REGISTRY[icon]
      return (
        <Suspense fallback={<div className="empty-state-icon" style={{ fontSize: current.iconSize }}>○</div>}>
          <div className="empty-state-icon" style={{ marginBottom: size === 'compact' ? '8px' : '16px' }}>
            <IconComponent style={{ fontSize: current.iconSize }} />
          </div>
        </Suspense>
      )
    }

    return null
  }

  return (
    <div
      className={`empty-state ${animationClass} ${className ?? ''}`}
      style={{
        textAlign: 'center',
        padding: current.padding,
        color: '#868e96',
        ...style,
      }}
    >
      {renderIcon()}

      <h2
        className="empty-state-title"
        style={{
          fontSize: current.titleSize,
          fontWeight: 600,
          marginBottom: '8px',
          color: '#495057',
        }}
      >
        {title}
      </h2>

      <p
        className="empty-state-message"
        style={{
          fontSize: current.descSize,
          marginBottom: hint ? '12px' : '24px',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {hint && (
        <p
          className="empty-state-hint"
          style={{
            fontSize: current.descSize,
            marginBottom: '24px',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
            color: '#868e96',
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}
        >
          {hint}
        </p>
      )}

      {(action || secondaryAction) && (
        <div
          className="empty-state-actions"
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '16px',
          }}
        >
          {action && (
            <button
              onClick={action.onClick}
              disabled={action.loading}
              style={{
                padding: size === 'compact' ? '6px 12px' : '8px 16px',
                backgroundColor: action.variant === 'secondary' ? '#f1f3f5' : '#228be6',
                color: action.variant === 'secondary' ? '#495057' : 'white',
                border: action.variant === 'secondary' ? '1px solid #dee2e6' : 'none',
                borderRadius: '4px',
                cursor: action.loading ? 'not-allowed' : 'pointer',
                fontSize: current.descSize,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                opacity: action.loading ? 0.7 : 1,
              }}
              className="empty-state-action-btn"
            >
              {action.loading ? '⏳ Loading...' : action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              style={{
                padding: size === 'compact' ? '6px 12px' : '8px 16px',
                backgroundColor: '#f1f3f5',
                color: '#495057',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: current.descSize,
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              className="empty-state-secondary-btn"
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
 * Specialized empty state variants for common use cases
 */

export function NoDataFound({
  title = 'No data found',
  description = 'There is no data to display.',
  hint = 'Try adjusting your filters or search criteria.',
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return <EmptyState icon="🔍" title={title} description={description} hint={hint} className={className} size={size} />
}

export function NoResultsFound({
  title = 'No results found',
  description = 'Your search did not return any results.',
  hint = 'Try using different keywords or check your spelling.',
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return (
    <EmptyState icon="❌" title={title} description={description} hint={hint} className={className} size={size} />
  )
}

export function NoItemsYet({
  title = 'No items yet',
  description = 'Get started by creating your first item.',
  hint = 'Click the button below to create one.',
  action,
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return (
    <EmptyState
      icon="✨"
      title={title}
      description={description}
      hint={hint}
      action={action}
      className={className}
      size={size}
    />
  )
}

export function AccessDeniedState({
  title = 'Access denied',
  description = 'You do not have permission to view this content.',
  hint = 'Contact your administrator for access.',
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return (
    <EmptyState icon="🔒" title={title} description={description} hint={hint} className={className} size={size} />
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  hint = 'Please try again later or contact support.',
  action,
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      hint={hint}
      action={action}
      className={className}
      size={size}
    />
  )
}

export function NoConnectionState({
  title = 'Connection failed',
  description = 'Unable to connect to the server.',
  hint = 'Check your internet connection and try again.',
  action,
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return (
    <EmptyState
      icon="📡"
      title={title}
      description={description}
      hint={hint}
      action={action}
      className={className}
      size={size}
    />
  )
}

export function LoadingCompleteState({
  title = 'All done!',
  description = 'Your request has been processed successfully.',
  hint = 'You can now close this dialog or perform another action.',
  action,
  className,
  size,
}: Omit<EmptyStateProps, 'title' | 'description' | 'icon'> & {
  title?: string
  description?: string
  hint?: string
}) {
  return (
    <EmptyState
      icon="✅"
      title={title}
      description={description}
      hint={hint}
      action={action}
      className={className}
      size={size}
    />
  )
}
