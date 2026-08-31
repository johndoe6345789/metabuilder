'use client'

import type { ReactNode } from 'react'
import type { ErrorCategory } from '@/lib/error-reporting'
import type { CategoryColors } from './error-boundary-presentation'

export interface ErrorHeaderProps {
  icon: string
  category: ErrorCategory
  colors: CategoryColors
  userMessage: string
  children: ReactNode
}

/** The icon + heading + message row, wrapping whatever comes after
 *  (details/status/actions/support) in the same flex column so the
 *  fallback's whole body still reads as one layout. */
export function ErrorHeader({
  icon,
  category,
  colors,
  userMessage,
  children,
}: ErrorHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{ fontSize: '28px', flexShrink: 0, marginTop: '4px' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h2
          style={{
            color: colors.text,
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          {category === 'not-found' ? 'Not Found' : 'Something went wrong'}
        </h2>
        <p
          style={{
            color: '#495057',
            margin: '0 0 12px 0',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          {userMessage}
        </p>
        {children}
      </div>
    </div>
  )
}
