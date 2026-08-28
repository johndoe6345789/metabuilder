'use client'

/** Retry and reload, the two things a reader can actually do. */

import type { CategoryColors } from './error-boundary-presentation'

export function ErrorActions({
  colors,
  onRetry,
  onReload,
}: {
  colors: CategoryColors
  onRetry: () => void
  onReload: () => void
}) {
  return (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '16px',
            }}
          >
            <button
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.border,
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                ;(e.target as HTMLButtonElement).style.opacity = '0.9'
              }}
              onMouseLeave={e => {
                ;(e.target as HTMLButtonElement).style.opacity = '1'
              }}
            >
              Try Again
            </button>
            <button
              onClick={onReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f3f5',
                color: '#495057',
                border: '1px solid #dee2e6',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                ;(e.target as HTMLButtonElement).style.backgroundColor =
                  '#e9ecef'
              }}
              onMouseLeave={e => {
                ;(e.target as HTMLButtonElement).style.backgroundColor =
                  '#f1f3f5'
              }}
            >
              Reload Page
            </button>
          </div>
  )
}
