'use client'

import React from 'react'

export class PageErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    pageId: string
  },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(
    error: Error
  ) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '32px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '24px',
              background: '#fef2f2',
            }}
          >
            <h2
              style={{
                color: '#dc2626',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              Page Error: {this.props.pageId}
            </h2>
            <p
              style={{
                color: '#991b1b',
                fontSize: '14px',
                marginBottom: '12px',
              }}
            >
              {this.state.error.message}
            </p>
            <pre
              style={{
                background: '#1f2937',
                color: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '300px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
