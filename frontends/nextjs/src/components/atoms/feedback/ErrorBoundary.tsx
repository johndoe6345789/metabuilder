'use client'

import React, { Component, ReactNode } from 'react'

import { Alert, Button, Typography } from '@/fakemui'
import { logError, LogLevel } from '@/lib/errors/log-error'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component to catch React rendering errors
 * Logs errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error with component stack
    logError(
      error,
      {
        component: 'ErrorBoundary',
        componentStack: errorInfo.componentStack,
      },
      LogLevel.ERROR
    )

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div style={{ padding: '1.5rem' }}>
          <Alert severity="error" style={{ marginBottom: '1rem' }}>
            <Typography variant="h6">
              Something went wrong
            </Typography>
            <Typography variant="body2" style={{ marginBottom: '1rem' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button variant="primary" onClick={this.handleReset} size="sm">
              Try Again
            </Button>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
