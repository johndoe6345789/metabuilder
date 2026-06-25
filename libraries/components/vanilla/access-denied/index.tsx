'use client'

import React, { createElement } from 'react'

/**
 * Access Denied Component
 *
 * Displays when a user attempts to access a resource they don't have permission for.
 * Shows the user's current permission level vs required level.
 */

export interface AccessDeniedProps {
  /**
   * Required permission level for the resource
   */
  requiredLevel: number
  /**
   * User's current permission level
   */
  userLevel: number
  /**
   * Custom title text
   * @default 'Access Denied'
   */
  title?: string
  /**
   * Custom message text
   * @default 'Your permission level is insufficient to access this page.'
   */
  message?: string
  /**
   * URL to navigate when clicking "Return Home"
   * @default '/'
   */
  homeUrl?: string
  /**
   * Custom level names map
   */
  levelNames?: Record<number, string>
  /**
   * CSS class name for custom styling
   */
  className?: string
  /**
   * Custom style overrides
   */
  style?: React.CSSProperties
}

const DEFAULT_LEVEL_NAMES: Record<number, string> = {
  0: 'Public',
  1: 'User',
  2: 'Moderator',
  3: 'Admin',
  4: 'God',
  5: 'Supergod',
}

export function AccessDenied({
  requiredLevel,
  userLevel,
  title = 'Access Denied',
  message = 'Your permission level is insufficient to access this page.',
  homeUrl = '/',
  levelNames = DEFAULT_LEVEL_NAMES,
  className,
  style,
}: AccessDeniedProps) {
  const requiredLevelName = levelNames[requiredLevel] ?? `Level ${requiredLevel}`
  const userLevelName = levelNames[userLevel] ?? `Level ${userLevel}`

  return createElement('div', {
    className: `access-denied ${className ?? ''}`,
    style: {
      padding: '2rem',
      maxWidth: '600px',
      margin: '4rem auto',
      textAlign: 'center',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      ...style,
    }
  },
    createElement('h1', {
      style: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#d32f2f',
      }
    }, title),

    createElement('p', {
      style: {
        fontSize: '1.125rem',
        marginBottom: '0.5rem',
        color: '#424242',
      }
    }, message),

    createElement('div', {
      style: {
        margin: '1.5rem 0',
        padding: '1rem',
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }
    },
      createElement('p', { style: { marginBottom: '0.5rem', color: '#616161' } },
        createElement('strong', null, 'Your Level:'),
        ` ${userLevelName} (${userLevel})`
      ),
      createElement('p', { style: { color: '#616161' } },
        createElement('strong', null, 'Required Level:'),
        ` ${requiredLevelName} (${requiredLevel})`
      )
    ),

    createElement('a', {
      href: homeUrl,
      style: {
        display: 'inline-block',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1976d2',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
      }
    }, 'Return Home')
  )
}

/**
 * CSS styles for AccessDenied - inject in your app
 *
 * @example
 * // Add to your global CSS for hover effects:
 * .access-denied a:hover {
 *   background-color: #1565c0;
 * }
 */
export const accessDeniedStyles = `
.access-denied a:hover {
  background-color: #1565c0 !important;
}
`
