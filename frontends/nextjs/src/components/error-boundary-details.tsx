'use client'

/** The stack trace panel, shown only in development. */

import type { ErrorCategory } from '@/lib/error-reporting'

export function ErrorDetails({
  error,
  category,
}: {
  error: Error | null
  category: ErrorCategory
}) {
  return (
    <>
          {process.env.NODE_ENV === 'development' &&
            error !== null && (
              <details style={{ marginTop: '12px', marginBottom: '12px' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    color: '#868e96',
                    fontSize: '12px',
                    fontWeight: 500,
                    userSelect: 'none',
                    padding: '4px 0',
                  }}
                >
                  Error details ({category})
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '1rem',
                    overflow: 'auto',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    maxHeight: '200px',
                    color: '#666',
                  }}
                >
                  {error.message}
                  {error.stack !== undefined &&
                    error.stack !== '' &&
                    `\n\n${error.stack}`}
                </pre>
              </details>
            )}
    </>
  )
}
