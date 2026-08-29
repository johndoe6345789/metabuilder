'use client'

/** Where to turn when retrying has not helped. */

import type { ErrorCategory } from '@/lib/error-reporting'
import type { CategoryColors } from './error-boundary-presentation'

export function ErrorSupport({
  category,
  colors,
  showSupportInfo,
  supportEmail,
}: {
  category: ErrorCategory
  colors: CategoryColors
  showSupportInfo: boolean
  supportEmail: string
}) {
  return (
    <>
          {showSupportInfo && category !== 'not-found' && (
            <p
              style={{
                marginTop: '16px',
                fontSize: '12px',
                color: '#666',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                paddingTop: '12px',
              }}
            >
              If the problem persists, please{' '}
              <a
                href={`mailto:${supportEmail}`}
                style={{
                  color: colors.text,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                contact support
              </a>
              .
            </p>
          )}
    </>
  )
}
